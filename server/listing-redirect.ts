import type { Express, Request } from "express";
import { supabaseAdmin } from "./supabase";
import { renderNotFound } from "./seo/render";

// Server-side listing URL handling for /listings/{id}-{slug}:
// - live listing, wrong or missing slug -> 301 to the canonical URL
// - deleted listing -> 301 to the location named in its old slug, otherwise
//   410 Gone with a helpful page (same response for people and crawlers)
//
// Existence is checked against Supabase and cached briefly so we don't hit the
// DB on every crawl of a still-live listing. Both outcomes (exists / gone) are
// cached; the TTL keeps a freshly-deleted listing responding correctly within
// ~1 minute.




// Deleted rows are gone, so the old URL slug is the only clue to the location.
// Order matters: more specific names first ("downtown" alone is a New Cairo mall).
const SLUG_LOCATIONS: Array<[RegExp, string]> = [
  [/(^|-)(sheikh-zayed|zayed)(-|$)/, "sheikh-zayed"],
  [/(^|-)(6th-october|october|smart-village)(-|$)/, "6th-october"],
  [/(^|-)(downtown-cairo)(-|$)/, "downtown-cairo"],
  [/(^|-)maadi(-|$)/, "maadi"],
  [/(^|-)sheraton(-|$)/, "sheraton"],
  [/(^|-)(new-cairo|fifth-settlement|5th-settlement|tagamoa|katameya|rehab|mivida|north-90|south-90|90th)(-|$)/, "new-cairo"],
];

export function locationFromSlug(urlPath: string): string | null {
  const slug = urlPath.replace(/^\/listings\/\d+-?/, "").toLowerCase();
  if (!slug) return null;
  return SLUG_LOCATIONS.find(([re]) => re.test(slug))?.[1] ?? null;
}

const CACHE_TTL_MS = 60_000;

// id -> { exists, path, expires }. A tiny in-memory cache; fine for a single instance.
// path is the listing's current canonical URL (null when unknown → no slug redirect).
const existenceCache = new Map<number, { exists: boolean; path: string | null; expires: number }>();

// Called after admin saves/deletes so a title edit redirects correctly immediately.
export function forgetListing(id: number): void {
  existenceCache.delete(id);
}

// Mirror of client/src/lib/faq.ts slugify + client/src/lib/listings.ts listingUrl.
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function canonicalListingPath(l: {
  id: number;
  title: string | null;
  property_type: string | null;
  location: string | null;
  area_sqm: number | null;
}): string {
  const titleSlug = slugify(l.title || "");
  if (titleSlug) return `/listings/${l.id}-${titleSlug}`;
  const fallback = slugify(
    [l.property_type, l.location, l.area_sqm ? `${l.area_sqm}sqm` : null].filter(Boolean).join(" "),
  );
  return fallback ? `/listings/${l.id}-${fallback}` : `/listings/${l.id}`;
}

// Matches /listings/{id}-{slug} or /listings/{id}. Captures the leading numeric
// id. Does NOT match /listings itself or /listings?query (those are the index).
const LISTING_PATH = /^\/listings\/(\d+)(?:-[^/]*)?$/;

async function lookupListing(id: number, now: number): Promise<{ exists: boolean; path: string | null }> {
  const cached = existenceCache.get(id);
  if (cached && cached.expires > now) return cached;

  // If Supabase isn't configured (e.g. local without env), don't redirect —
  // fail open so we never wrongly 301 a real listing.
  if (!supabaseAdmin) return { exists: true, path: null };

  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("id,title,property_type,location,area_sqm")
    .eq("id", id)
    .eq("is_test", false)
    .maybeSingle();

  // On a query error, fail open (treat as existing) rather than risk redirecting
  // a live listing because of a transient DB hiccup.
  const result = error
    ? { exists: true, path: null }
    : { exists: data !== null, path: data ? canonicalListingPath(data) : null };
  existenceCache.set(id, { ...result, expires: now + CACHE_TTL_MS });
  return result;
}

export function registerListingRedirects(app: Express) {
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    const match = LISTING_PATH.exec(req.path);
    if (!match) return next();

    const id = Number.parseInt(match[1], 10);
    if (!Number.isInteger(id) || id <= 0) return next();

    const now = Date.now();
    lookupListing(id, now)
      .then(({ exists, path }) => {
        if (exists) {
          // Title edits change the slug; send old URLs to the current one.
          if (path && req.path !== path) {
            return res.redirect(301, path + req.url.slice(req.path.length));
          }
          return next();
        }
        // Retired listing: 301 to the location named in the old slug when
        // there is a clear match, otherwise 410 Gone with a helpful page.
        const location = locationFromSlug(req.path);
        if (location) return res.redirect(301, `/locations/${location}`);
        res.status(410).type("html").send(renderNotFound("410"));
      })
      .catch(() => next()); // fail open on unexpected errors
  });
}
