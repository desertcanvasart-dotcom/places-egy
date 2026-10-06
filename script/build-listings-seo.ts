// Build-time SEO for dynamic listing pages.
//
// Listings live in Supabase and change constantly, so the static sitemap and
// the source-file prerender (script/prerender.ts, which only knows the static
// /developers/* pages) can't cover them. This step queries Supabase at build
// time and does two things for every active listing:
//   1. appends its /listings/{id}-{slug} URL to dist/public/sitemap.xml so
//      Google can DISCOVER it, and
//   2. writes a prerendered dist/public/listings/{id}-{slug}.html whose head
//      tags (title/description/canonical/og:*) are unique to that listing, so
//      first-pass crawlers get real per-listing meta instead of the generic
//      SPA shell. express.static (with extensions:['html']) serves these before
//      the SPA catch-all.
//
// Failures here NEVER fail the build — if Supabase is briefly unreachable at
// deploy time we ship without the listing entries rather than block the deploy.

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const SITE_ORIGIN = "https://places-egy.com";
const SITEMAP_PATH = path.resolve("dist/public/sitemap.xml");
const DIST = path.resolve("dist/public");
const LISTING_CHANGEFREQ = "weekly";
const LISTING_PRIORITY = "0.8";

interface ListingRow {
  id: number;
  title: string | null;
  property_type: string | null;
  location: string | null;
  area_sqm: number | null;
  subtype: string | null;
  transaction_type: string | null;
  description: string | null;
  currency: string | null;
  images: string[] | null;
  // Timestamp fields we ask Supabase for so the sitemap can emit real
  // <lastmod> values. If neither column exists in the listings table,
  // PostgREST returns them as undefined and the sitemap omits <lastmod>.
  updated_at?: string | null;
  created_at?: string | null;
}

// Mirror of client/src/lib/faq.ts slugify — keep in lockstep so the URLs we emit
// match exactly what the app generates (a mismatch = dead sitemap/canonical URLs).
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Mirror of client/src/lib/listings.ts listingUrl.
function listingPath(l: ListingRow): string {
  const titleSlug = slugify(l.title || "");
  if (titleSlug) return `/listings/${l.id}-${titleSlug}`;
  const fallback = slugify(
    [l.property_type, l.location, l.area_sqm ? `${l.area_sqm}sqm` : null].filter(Boolean).join(" "),
  );
  return fallback ? `/listings/${l.id}-${fallback}` : `/listings/${l.id}`;
}

// A human meta title/description for a listing, mirroring how the detail page
// builds them so prerendered and runtime meta agree.
function listingMeta(l: ListingRow): { title: string; description: string } {
  const title = (l.title?.trim() || `Office in ${l.location ?? "Egypt"}`) + " | PLACES";
  const description =
    l.description?.trim() ||
    [
      l.area_sqm ? `${l.area_sqm} sqm` : null,
      l.subtype ? l.subtype.replace(/[-_]/g, " ") : "office",
      l.transaction_type?.toLowerCase() === "rent" ? "for rent" : "for sale",
      l.location ? `in ${l.location}` : "in Egypt",
    ]
      .filter(Boolean)
      .join(" ") + " — administrative office space from PLACES.";
  return { title, description };
}

async function fetchListings(): Promise<ListingRow[]> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[listings-seo] Supabase env vars not set — skipping listing sitemap/prerender");
    return [];
  }
  // Use the REST endpoint directly to avoid bundling the supabase client into
  // the build script. Select only the columns we need for URLs + meta.
  // updated_at/created_at may not exist on the table — try with them first,
  // fall back to the guaranteed core fields on error so the build still ships.
  const coreFields = "id,title,property_type,location,area_sqm,subtype,transaction_type,description,currency,images";
  // is_test=eq.false — test listings must stay out of the sitemap AND the
  // prerendered meta so Google never sees them. We try with the filter first;
  // if the column doesn't exist yet (pre-migration) PostgREST 400s and we
  // retry without it so the build still ships.
  const attempts: Array<{ fields: string; filter: string }> = [
    { fields: `${coreFields},updated_at,created_at`, filter: "&is_test=eq.false" },
    { fields: coreFields, filter: "&is_test=eq.false" },
    { fields: `${coreFields},updated_at,created_at`, filter: "" },
    { fields: coreFields, filter: "" },
  ];
  for (const { fields, filter } of attempts) {
    const endpoint = `${url}/rest/v1/listings?select=${fields}&property_type=eq.admin${filter}&order=id.desc`;
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
    if (res.ok) {
      const rows = (await res.json()) as ListingRow[];
      return Array.isArray(rows) ? rows : [];
    }
    if (res.status !== 400) {
      throw new Error(`Supabase /listings returned ${res.status} ${res.statusText}`);
    }
    // 400 usually means a column we asked for doesn't exist. Try the next
    // attempt with fewer columns before giving up.
    console.warn(`[listings-seo] Supabase 400 with fields=${fields} filter=${filter}, retrying`);
  }
  throw new Error("Supabase /listings returned 400 for all column attempts");
}

function attr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function injectListingMeta(shell: string, l: ListingRow, fullUrl: string): string {
  const { title, description } = listingMeta(l);
  const t = attr(title);
  const d = attr(description);
  const u = attr(fullUrl);
  const img = l.images?.[0] ? attr(l.images[0].startsWith("http") ? l.images[0] : `${SITE_ORIGIN}${l.images[0]}`) : null;

  let html = shell;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${d}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${u}" />`);
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${t}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${d}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${u}" />`);
  if (img) html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/, `<meta property="og:image" content="${img}" />`);
  return html;
}

function buildSitemapEntries(
  listings: { path: string; row: ListingRow }[],
): string {
  return listings
    .map(({ path: p, row }) => {
      // Prefer updated_at (row edited) over created_at (row inserted). Both
      // are ISO timestamps from Supabase; strip to YYYY-MM-DD for the sitemap.
      const raw = row.updated_at ?? row.created_at ?? null;
      const lastmod = raw ? new Date(raw).toISOString().split("T")[0] : "";
      const lastmodLine = lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "";
      return (
        `  <url>\n` +
        `    <loc>${SITE_ORIGIN}${p}</loc>\n` +
        lastmodLine +
        `    <changefreq>${LISTING_CHANGEFREQ}</changefreq>\n` +
        `    <priority>${LISTING_PRIORITY}</priority>\n` +
        `  </url>`
      );
    })
    .join("\n");
}

export async function buildListingsSeo(): Promise<void> {
  console.log("[listings-seo] fetching listings from Supabase...");

  let listings: ListingRow[];
  try {
    listings = await fetchListings();
  } catch (err) {
    console.warn(
      "[listings-seo] Supabase unreachable — shipping without listing sitemap/prerender:",
      err instanceof Error ? err.message : err,
    );
    return;
  }
  if (listings.length === 0) {
    console.log("[listings-seo] no listings found, skipping");
    return;
  }

  const withPaths = listings.map((l) => ({ row: l, path: listingPath(l) }));

  // 1. Sitemap injection
  try {
    const xml = await readFile(SITEMAP_PATH, "utf-8");
    if (xml.includes("</urlset>")) {
      const insertion = "\n" + buildSitemapEntries(withPaths) + "\n";
      await writeFile(SITEMAP_PATH, xml.replace("</urlset>", insertion + "</urlset>"), "utf-8");
      console.log(`[listings-seo] injected ${withPaths.length} listing URLs into sitemap`);
    } else {
      console.warn("[listings-seo] could not find </urlset> in sitemap, skipping sitemap injection");
    }
  } catch (err) {
    console.warn("[listings-seo] sitemap injection failed:", err instanceof Error ? err.message : err);
  }

  // 2. Per-listing meta prerender
  try {
    const shell = await readFile(path.join(DIST, "index.html"), "utf-8");
    let written = 0;
    for (const { row, path: p } of withPaths) {
      const html = injectListingMeta(shell, row, `${SITE_ORIGIN}${p}`);
      const outPath = path.join(DIST, `${p}.html`);
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, html, "utf-8");
      written++;
    }
    console.log(`[listings-seo] prerendered ${written} listing pages (meta-only)`);
  } catch (err) {
    console.warn("[listings-seo] prerender failed:", err instanceof Error ? err.message : err);
  }
}
