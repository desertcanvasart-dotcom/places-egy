import type { Express } from "express";
import { supabaseAdmin } from "./supabase";

// Server-side 301 for retired listings.
//
// Listing detail pages live at /listings/{id}-{slug}. When an office is sold the
// row is deleted from Supabase, but Google has the URL indexed (it's in the
// sitemap + prerendered). Previously the SPA served a 200 page that JS-redirected
// to /listings — which Google reads as a SOFT 404. This middleware instead does a
// real 301 to /listings the moment the listing no longer exists, so link equity
// is preserved and crawl errors don't accumulate.
//
// Existence is checked against Supabase and cached briefly so we don't hit the DB
// on every crawl of a still-live listing. Both outcomes (exists / gone) are
// cached; the TTL keeps a freshly-deleted listing redirecting within ~1 minute.

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
        // Retired listing → permanent redirect to the listings index.
        res.redirect(301, "/listings");
      })
      .catch(() => next()); // fail open on unexpected errors
  });
}
