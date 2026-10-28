// On-request HTML for pages whose content comes from the live inventory, so
// crawlers get real links and copy without waiting for a rebuild.
import { readFileSync, existsSync } from "fs";
import path from "path";
import { FURNISHING_OPTIONS, getEnumLabel } from "../../client/src/lib/enums";
import { cleanListingTitle } from "../../client/src/lib/listing-text";
import { LOCATION_CONTENT } from "../../client/src/lib/location-content";

const LOCATIONS = Object.values(LOCATION_CONTENT);
import { esc, injectBody, injectMeta, prerenderInner, type PageMeta } from "./html";
import { getInventory, type SeoListing } from "./data";

export const SITE = "https://places-egy.com";
export const PAGE_SIZE = 48;

let distPath = "";
const fileCache = new Map<string, string>();

export function setDistPath(p: string): void {
  distPath = p;
}

/** A built HTML file from dist/public (cached for the life of the process). */
export function builtFile(rel: string): string | null {
  if (fileCache.has(rel)) return fileCache.get(rel)!;
  const full = path.join(distPath, rel);
  if (!full.startsWith(distPath) || !existsSync(full)) return null;
  const html = readFileSync(full, "utf8");
  fileCache.set(rel, html);
  return html;
}

export function shell(): string {
  return builtFile("index.html") ?? "";
}

export function locationSlugFor(displayName: string | null): string | null {
  return LOCATIONS.find((l) => l.displayName === displayName)?.slug ?? null;
}

export function formatPrice(l: Pick<SeoListing, "price" | "currency" | "transaction_type">): string {
  if (!l.price) return "Price on request";
  const amount = `${Number(l.price).toLocaleString("en-US")} ${l.currency || "EGP"}`;
  return l.transaction_type === "rent" ? `${amount} / month` : amount;
}

export function listingTitle(l: Pick<SeoListing, "title">): string {
  return cleanListingTitle(l.title ?? "") || "Office listing";
}

function facts(l: SeoListing): string {
  return [
    l.location,
    l.area_sqm ? `${Number(l.area_sqm).toLocaleString("en-US")} m²` : null,
    l.furnishing ? getEnumLabel(FURNISHING_OPTIONS, l.furnishing) || l.furnishing : null,
    formatPrice(l),
    l.rental_status === "rented" ? "Rented" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function listingLinks(rows: SeoListing[]): string {
  if (rows.length === 0) return "<p>No listings available right now.</p>";
  return (
    "<ul>" +
    rows.map((l) => `<li><a href="${esc(l.path)}">${esc(listingTitle(l))}</a> <span>${esc(facts(l))}</span></li>`).join("") +
    "</ul>"
  );
}

function pagination(page: number, pages: number): string {
  if (pages <= 1) return "";
  const href = (n: number) => (n === 1 ? "/listings" : `/listings/page/${n}`);
  const items: string[] = [];
  if (page > 1) items.push(`<li><a href="${href(page - 1)}" rel="prev">Previous</a></li>`);
  for (let n = 1; n <= pages; n++) {
    items.push(n === page ? `<li><span aria-current="page">${n}</span></li>` : `<li><a href="${href(n)}">${n}</a></li>`);
  }
  if (page < pages) items.push(`<li><a href="${href(page + 1)}" rel="next">Next</a></li>`);
  return `<nav aria-label="Listings pages"><ul>${items.join("")}</ul></nav>`;
}

const locationNav = () =>
  "<h2>Offices by location</h2><ul>" +
  LOCATIONS.map((l) => `<li><a href="/locations/${l.slug}">Offices in ${esc(l.displayName)}</a></li>`).join("") +
  "</ul>";

export async function renderHome(): Promise<string> {
  const inventory = await getInventory();
  const html = shell();
  const latest = inventory.filter((l) => l.rental_status !== "rented").slice(0, 12);
  return injectBody(
    html,
    `<h1>Find Your Office in Egypt</h1>` +
      `<p>Buy, lease, or resell administrative offices across Cairo's top districts: New Cairo, Sheikh Zayed, 6th October, Downtown, Sheraton and Maadi.</p>` +
      `<h2>Latest offices</h2>${listingLinks(latest)}` +
      `<p><a href="/listings">Browse all ${inventory.length} listings</a></p>` +
      locationNav(),
  );
}

export async function renderListingsIndex(page: number): Promise<string | null> {
  const inventory = await getInventory();
  const pages = Math.max(1, Math.ceil(inventory.length / PAGE_SIZE));
  if (page < 1 || page > pages) return null;
  const base = builtFile("listings.html") ?? shell();
  const rows = inventory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const meta: PageMeta =
    page === 1
      ? {
          title: "Office Listings in Egypt — Rent & Buy Admin Offices | PLACES",
          description: `Browse ${inventory.length} administrative offices for rent and sale across New Cairo, Sheikh Zayed, 6th October, Maadi, Downtown and Sheraton.`,
          url: `${SITE}/listings`,
        }
      : {
          title: `Office Listings in Egypt — Page ${page} of ${pages} | PLACES`,
          description: `Office listings ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + rows.length} of ${inventory.length}: administrative offices for rent and sale in Egypt.`,
          url: `${SITE}/listings/page/${page}`,
        };
  return injectBody(
    injectMeta(base, meta),
    `<h1>Office Listings in Egypt${page > 1 ? ` — Page ${page}` : ""}</h1>` +
      `<p>${esc(meta.description)}</p>` +
      listingLinks(rows) +
      pagination(page, pages) +
      locationNav(),
  );
}

export async function renderLocation(slug: string): Promise<string | null> {
  const loc = LOCATIONS.find((l) => l.slug === slug);
  const base = builtFile(`locations/${slug}.html`);
  if (!loc || !base) return null;
  const rows = (await getInventory()).filter((l) => l.location === loc.displayName);
  const intro = prerenderInner(base) ?? `<h1>${esc(loc.h1)}</h1>`;
  return injectBody(
    base,
    intro + `<h2>Available offices in ${esc(loc.displayName)} (${rows.length})</h2>` + listingLinks(rows) + locationNav(),
  );
}

export async function renderDeveloper(slug: string): Promise<string | null> {
  const base = builtFile(`developers/${slug}.html`);
  if (!base) return null;
  const rows = (await getInventory()).filter((l) => l.developer === slug);
  const intro = prerenderInner(base) ?? "";
  return injectBody(base, intro + `<h2>Available offices (${rows.length})</h2>` + listingLinks(rows) + locationNav());
}
