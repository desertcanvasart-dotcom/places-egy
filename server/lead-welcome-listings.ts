import { supabaseAdmin } from "./supabase";
import type { FavoritedListing } from "./mailer";

// Fetches the 3 recent admin listings to embed in a lead's welcome email.
// Optional filters let per-source callers tighten the selection so the
// email feels relevant, not generic:
//
//   - price_unlock leads pass { subtype, location } from the listing they
//     unlocked, so the email shows similar units in the same district +
//     space type. Falls back to newest overall if not enough matches.
//
//   - concierge leads pass { transactionType } from their intent field
//     (buy → sale, rent → rent) so buyers don't get rent listings and
//     vice versa.
//
//   - contact_form + account_signup pass no filters — always shows the
//     3 newest admin listings so every visitor sees fresh inventory.
//
// Always returns 3 listings or fewer. The mailer gracefully falls back to
// a listing-less email if the DB is unreachable or has zero rows — the
// email still lands with the hook + CTA, better than dropping the send.

export interface FetchOpts {
  subtype?: string | null;
  location?: string | null;
  transactionType?: "sale" | "rent" | null;
  excludeIds?: number[]; // e.g. don't recommend the listing they just unlocked
}

// Slug the title the same way client + favorites-digest do. Kept inline so
// this file has no cross-server-file dependencies beyond the mailer type.
function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function toFavoritedListing(
  l: Record<string, unknown> & { id: number },
): FavoritedListing {
  const images = Array.isArray(l.images) ? (l.images as string[]) : [];
  const title = (l.title as string) ?? "";
  const slug = slugify(title);
  return {
    id: l.id,
    title,
    price: (l.price as number | null) ?? null,
    currency: (l.currency as string | null) ?? null,
    area_sqm: (l.area_sqm as number | null) ?? null,
    developer: (l.developer as string | null) ?? null,
    location: (l.location as string | null) ?? null,
    transaction_type: (l.transaction_type as string | null) ?? null,
    first_image_url: images[0] ?? null,
    url_path: `/listings/${l.id}${slug ? "-" + slug : ""}`,
  };
}

export async function fetchRecentListingsForWelcome(
  opts: FetchOpts = {},
): Promise<FavoritedListing[]> {
  if (!supabaseAdmin) return [];

  // First-pass query: try to satisfy all filters (tightest match). If it
  // returns < 3 rows, we broaden to just property_type=admin.
  const runQuery = async (tight: boolean) => {
    let q = supabaseAdmin
      .from("listings")
      .select("*")
      .eq("property_type", "admin");
    if (tight && opts.subtype) q = q.eq("subtype", opts.subtype);
    if (tight && opts.location) q = q.eq("location", opts.location);
    if (opts.transactionType) q = q.eq("transaction_type", opts.transactionType);
    if (opts.excludeIds?.length) {
      // .not("id", "in", "(1,2,3)") — Supabase's PostgREST syntax
      const idList = opts.excludeIds.filter((n) => Number.isFinite(n)).join(",");
      if (idList) q = q.not("id", "in", `(${idList})`);
    }
    const { data, error } = await q
      .order("id", { ascending: false })
      .limit(3);
    if (error) {
      console.warn(
        "[lead-welcome] listings fetch failed:",
        error.message,
      );
      return [];
    }
    return (data ?? []).map(toFavoritedListing);
  };

  // Try tight filters first. If we got 3 rows back, ship it.
  let rows = await runQuery(true);
  if (rows.length >= 3) return rows.slice(0, 3);

  // If tight filtering returned less than 3 AND the caller used filters,
  // try a broader query. Otherwise just return whatever we got.
  const usedFilters = Boolean(opts.subtype || opts.location);
  if (!usedFilters) return rows.slice(0, 3);

  const broad = await runQuery(false);
  // Merge unique by id, tight-matched first, then broad fill-ins.
  const seen = new Set(rows.map((r) => r.id));
  for (const r of broad) {
    if (!seen.has(r.id)) {
      rows.push(r);
      seen.add(r.id);
    }
    if (rows.length >= 3) break;
  }
  return rows.slice(0, 3);
}

// Fetch a single listing for the price_unlock context — the listing the
// visitor was actually looking at when they submitted. Used to personalize
// the hook copy ('Since you looked at Cairo Business Park…'). Returns null
// on any error so the email still ships with generic copy.
export async function fetchListingForContext(
  listingId: number,
): Promise<FavoritedListing | null> {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .maybeSingle();
    if (error || !data) return null;
    return toFavoritedListing(data as Record<string, unknown> & { id: number });
  } catch {
    return null;
  }
}
