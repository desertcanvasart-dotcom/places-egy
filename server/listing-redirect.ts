import type { Express, Request } from "express";
import { supabaseAdmin } from "./supabase";

// Server-side retired-listing handling.
//
// Listing detail pages live at /listings/{id}-{slug}. When an office is sold the
// row is deleted from Supabase, but Google has the URL indexed (it's in the
// sitemap + prerendered). We handle retired listings differently for crawlers
// vs humans:
//
// - Crawlers (Googlebot, Bingbot, ClaudeBot, GPTBot, etc.) get **HTTP 410 Gone**.
//   Google Search Console previously reported blanket 301-to-/listings as
//   "Redirect error" (it reads as a soft-404 — same URL family, different
//   meaning). 410 explicitly says "this page is permanently removed" and Google
//   drops the URL from the index within days without any error being reported.
//
// - Real users (regular browsers) get a **301 to /listings** so they land on
//   something useful rather than a bare 410 page. This preserves the friendly
//   redirect for someone who clicked an old bookmark.
//
// The bot detection is a permissive substring match on the User-Agent header.
// It's fine if we mislabel some bot as a browser or vice versa — the fallback
// is either a browser sees a slightly abrupt 410 (rare) or Google follows a
// 301 (which was the old behavior anyway).
//
// Existence is checked against Supabase and cached briefly so we don't hit the
// DB on every crawl of a still-live listing. Both outcomes (exists / gone) are
// cached; the TTL keeps a freshly-deleted listing responding correctly within
// ~1 minute.

const BOT_UA_PATTERNS = [
  "googlebot",
  "bingbot",
  "slurp",             // Yahoo
  "duckduckbot",
  "baiduspider",
  "yandex",
  "sogou",
  "exabot",
  "facebot",
  "ia_archiver",
  "gptbot",            // OpenAI
  "chatgpt-user",
  "oai-searchbot",
  "claudebot",         // Anthropic
  "claude-web",
  "anthropic-ai",
  "perplexitybot",
  "perplexity-user",
  "google-extended",   // Google AI
  "applebot",
  "ccbot",             // Common Crawl
  "meta-externalagent",
  "amazonbot",
  "bytespider",
];

function isBot(req: Request): boolean {
  const ua = (req.headers["user-agent"] ?? "").toLowerCase();
  return BOT_UA_PATTERNS.some((p) => ua.includes(p));
}

const CACHE_TTL_MS = 60_000;

// id -> { exists, expires }. A tiny in-memory cache; fine for a single instance.
const existenceCache = new Map<number, { exists: boolean; expires: number }>();

// Matches /listings/{id}-{slug} or /listings/{id}. Captures the leading numeric
// id. Does NOT match /listings itself or /listings?query (those are the index).
const LISTING_PATH = /^\/listings\/(\d+)(?:-[^/]*)?$/;

async function listingExists(id: number, now: number): Promise<boolean> {
  const cached = existenceCache.get(id);
  if (cached && cached.expires > now) return cached.exists;

  // If Supabase isn't configured (e.g. local without env), don't redirect —
  // fail open so we never wrongly 301 a real listing.
  if (!supabaseAdmin) return true;

  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("id")
    .eq("id", id)
    .eq("is_test", false)
    .maybeSingle();

  // On a query error, fail open (treat as existing) rather than risk redirecting
  // a live listing because of a transient DB hiccup.
  const exists = error ? true : data !== null;
  existenceCache.set(id, { exists, expires: now + CACHE_TTL_MS });
  return exists;
}

export function registerListingRedirects(app: Express) {
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    const match = LISTING_PATH.exec(req.path);
    if (!match) return next();

    const id = Number.parseInt(match[1], 10);
    if (!Number.isInteger(id) || id <= 0) return next();

    const now = Date.now();
    listingExists(id, now)
      .then((exists) => {
        if (exists) return next();
        // Retired listing.
        // Crawlers → 410 Gone (permanent removal signal for Google/etc.).
        // Humans → 301 to /listings so they land on something useful.
        if (isBot(req)) {
          res.status(410).set("Content-Type", "text/plain").send("Gone");
        } else {
          res.redirect(301, "/listings");
        }
      })
      .catch(() => next()); // fail open on unexpected errors
  });
}
