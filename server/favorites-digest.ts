import { supabaseAdmin } from "./supabase";
import {
  sendFavoritesDigest,
  type FavoritedListing,
  type Lang,
} from "./mailer";

// Server-side mirror of the client listingUrl() helper so we can build
// canonical /listings/[id]-[slug] paths without importing client code.
// Kept in sync with client/src/lib/listings.ts by convention — if the URL
// scheme ever changes, update both.
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
function serverListingUrl(l: { id: number; title: string }): string {
  const slug = slugify(l.title);
  return `/listings/${l.id}${slug ? "-" + slug : ""}`;
}

// Favorites digest orchestrator — one file that knows how to build the
// digest payload for an account (their favorites + 3 similar recent
// listings) and how to invoke sendFavoritesDigest() with the right variant.
//
// Called from:
//   1. POST /api/accounts/favorites — checks for the 10-favorite milestone
//   2. POST /api/admin/send-favorites-digests — 30-min cron sweep for 2h
//      debounced digests + Monday weekly recap
//   3. POST /api/accounts/favorites/email-me-now — manual "email me my list"

type AccountRow = {
  id: number;
  name: string;
  email: string;
  preferred_language: Lang | null;
};

// Load all data we need to compose the email for one account.
async function loadPayload(accountId: number): Promise<{
  account: AccountRow;
  favorites: FavoritedListing[];
  similar: FavoritedListing[];
} | null> {
  if (!supabaseAdmin) return null;

  const { data: account } = await supabaseAdmin
    .from("accounts")
    .select("id,name,email,preferred_language")
    .eq("id", accountId)
    .maybeSingle();
  if (!account) return null;

  const { data: favRows } = await supabaseAdmin
    .from("account_favorites")
    .select("listing_id,added_at")
    .eq("account_id", accountId)
    .order("added_at", { ascending: false });
  const listingIds = (favRows ?? []).map((r) => r.listing_id);
  if (listingIds.length === 0) return null;

  const { data: rawFavorites } = await supabaseAdmin
    .from("listings")
    .select("*")
    .in("id", listingIds)
    .eq("is_test", false);
  const favMap = new Map(
    (rawFavorites ?? []).map((l: { id: number }) => [l.id, l]),
  );
  const favorites = listingIds
    .map((id) => favMap.get(id))
    .filter((l): l is Record<string, unknown> & { id: number } => l != null)
    .map(toFavoritedListing);

  // Similar = 3 newest recently-added listings that aren't already favorited.
  const { data: recent } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("is_test", false)
    .order("created_at", { ascending: false })
    .limit(20);
  const similar = ((recent ?? []) as Array<Record<string, unknown> & { id: number }>)
    .filter((l) => !listingIds.includes(l.id))
    .slice(0, 3)
    .map(toFavoritedListing);

  return {
    account: account as AccountRow,
    favorites,
    similar,
  };
}

// Convert a listings row to the shape the mailer expects. Guards against
// missing image arrays / null fields.
function toFavoritedListing(l: Record<string, unknown> & { id: number }): FavoritedListing {
  const images = Array.isArray(l.images) ? (l.images as string[]) : [];
  return {
    id: l.id,
    title: (l.title as string) ?? "",
    price: (l.price as number | null) ?? null,
    currency: (l.currency as string | null) ?? null,
    area_sqm: (l.area_sqm as number | null) ?? null,
    developer: (l.developer as string | null) ?? null,
    location: (l.location as string | null) ?? null,
    transaction_type: (l.transaction_type as string | null) ?? null,
    first_image_url: images[0] ?? null,
    url_path: serverListingUrl({ id: l.id, title: (l.title as string) ?? "" }),
  };
}

// Fire one digest for one account. Marks last_digest_sent_at afterwards so
// the 24h cadence cap + cron eligibility checks work correctly.
async function fireDigest(
  accountId: number,
  variant: "digest2h" | "weekly" | "milestone",
): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const payload = await loadPayload(accountId);
  if (!payload) return false;
  const { account, favorites, similar } = payload;

  await sendFavoritesDigest({
    toEmail: account.email,
    toName: account.name,
    lang: account.preferred_language ?? "en",
    variant,
    favorites,
    similar,
  });

  // Update the digest sent marker + record the milestone we just fired for.
  await supabaseAdmin
    .from("accounts")
    .update({
      last_digest_sent_at: new Date().toISOString(),
      last_digest_variant: variant,
    })
    .eq("id", accountId);

  return true;
}

// Called from POST /api/accounts/favorites after a successful add. Only
// triggers the milestone email — the 2h and weekly digests are driven by
// the cron sweep so they can debounce properly.
export async function handleMilestoneOnFavorite(accountId: number): Promise<void> {
  if (!supabaseAdmin) return;

  // Count favorites for this account.
  const { count } = await supabaseAdmin
    .from("account_favorites")
    .select("*", { count: "exact", head: true })
    .eq("account_id", accountId);
  if (count == null) return;

  // Fire the 10-milestone email exactly once. Look at last_digest_variant
  // to see if we've already sent it.
  if (count === 10) {
    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("last_digest_variant")
      .eq("id", accountId)
      .maybeSingle();
    if (account && account.last_digest_variant === "milestone") return;
    await fireDigest(accountId, "milestone");
  }
}

// Called from the manual "Email me my list" button on /saved. Ignores
// debounce + 24h cap — user asked for it explicitly.
export async function handleManualEmailRequest(accountId: number): Promise<boolean> {
  return fireDigest(accountId, "digest2h");
}

// Called by the 30-min cron sweep. Finds accounts eligible for either the
// 2h debounced digest or the weekly recap, and fires the appropriate email
// for each. Returns counts for observability.
export async function runDigestSweep(): Promise<{
  digest2h: number;
  weekly: number;
  errors: number;
}> {
  if (!supabaseAdmin) {
    return { digest2h: 0, weekly: 0, errors: 1 };
  }

  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(
    now.getTime() - 24 * 60 * 60 * 1000,
  ).toISOString();
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  let digest2hCount = 0;
  let weeklyCount = 0;
  let errorCount = 0;

  // ─ 2h digest eligibility ────────────────────────────────────────────────
  // Account must:
  //   • be older than 4h (signup cooldown)
  //   • have last_favorite_at at least 2h old (they've stopped for a moment)
  //     OR have last_favorite_at older than 4h (hard cap — send even if they
  //     keep favoriting)
  //   • have at least 3 total favorites
  //   • have no digest sent in the last 24h
  //   • have favorited AFTER their last digest (new content since last email)
  const { data: candidates2h } = await supabaseAdmin
    .from("accounts")
    .select(
      "id,name,email,preferred_language,created_at,last_favorite_at,last_digest_sent_at",
    )
    .not("last_favorite_at", "is", null)
    .lte("created_at", fourHoursAgo)
    .lte("last_favorite_at", twoHoursAgo)
    .or(`last_digest_sent_at.is.null,last_digest_sent_at.lte.${twentyFourHoursAgo}`);

  for (const acc of candidates2h ?? []) {
    // Confirm favorites count ≥ 3 (Supabase query above can't easily join count)
    const { count } = await supabaseAdmin
      .from("account_favorites")
      .select("*", { count: "exact", head: true })
      .eq("account_id", acc.id);
    if ((count ?? 0) < 3) continue;

    // Skip if they haven't favorited anything since their last digest.
    if (
      acc.last_digest_sent_at &&
      new Date(acc.last_favorite_at) <= new Date(acc.last_digest_sent_at)
    ) {
      continue;
    }

    const ok = await fireDigest(acc.id, "digest2h").catch(() => false);
    if (ok) digest2hCount += 1;
    else errorCount += 1;
  }

  // ─ Weekly recap eligibility ─────────────────────────────────────────────
  // Only fires on the actual cron run that happens Monday morning (see
  // cron-job.org schedule). Whichever cron ping catches us on Monday will
  // process it — this function is safe to call any day, but only sends
  // weekly emails when isMonday.
  const isMonday = now.getUTCDay() === 1;
  if (isMonday) {
    const { data: candidatesWeekly } = await supabaseAdmin
      .from("accounts")
      .select(
        "id,name,email,preferred_language,last_favorite_at,last_digest_sent_at",
      )
      .not("last_favorite_at", "is", null)
      .gte("last_favorite_at", sevenDaysAgo);

    for (const acc of candidatesWeekly ?? []) {
      // Skip if we already sent them any digest in the last 24h (avoids
      // stacking a Monday weekly right on top of a Sunday-night 2h digest).
      if (
        acc.last_digest_sent_at &&
        new Date(acc.last_digest_sent_at) >= new Date(twentyFourHoursAgo)
      ) {
        continue;
      }
      const ok = await fireDigest(acc.id, "weekly").catch(() => false);
      if (ok) weeklyCount += 1;
      else errorCount += 1;
    }
  }

  return { digest2h: digest2hCount, weekly: weeklyCount, errors: errorCount };
}
