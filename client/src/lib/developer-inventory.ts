// Live inventory summary + data-based FAQs for /developers/{slug} pages.
// Shared by the server render (server/seo/render.ts) and the React section
// (components/developers/DeveloperInventory.tsx). Keep free of "@/" imports.
import { DEVELOPER_DISPLAY_NAMES, getProjectsByDeveloper } from "./projects";
import { DEALS, eligibleLandingPages, type LandingListing } from "./landing-pages";

/** Developers with a page at /developers/{slug} (one file each in pages/developers). */
export const DEVELOPER_PAGE_SLUGS = new Set([
  "afaaq", "akoya", "al-futtaim", "al-jazi", "al-rabat-properties", "amer-group", "arabella", "catalyst", "el-hazek", "el-sewedy", "emaar", "horizon-egypt", "imkan-misr", "inma-developments", "kvrd", "larz", "lmd", "madinet-masr", "majid-al-futtaim", "marakez", "misr-italia", "modad", "morshedy", "ora", "palm-hills", "pre-developments", "raslan-group", "sky", "sodic", "the-ark-developments", "the-waterway", "town-writers", "upwyde", "wealth",
]);

/** Developers whose page already has its own hand-written FAQ section. */
export const DEVELOPERS_WITH_OWN_FAQ = new Set(["amer-group"]);

export type DeveloperListing = LandingListing & { developer?: string | null };

export const developerName = (slug: string) => DEVELOPER_DISPLAY_NAMES[slug] ?? slug;

export function developerRows<T extends DeveloperListing>(all: T[], slug: string): T[] {
  return all.filter((l) => l.developer === slug && l.rental_status !== "rented");
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : 0;
};
const round = (n: number) => (n >= 100_000 ? Math.round(n / 10_000) * 10_000 : n >= 1_000 ? Math.round(n / 50) * 50 : Math.round(n / 10) * 10);

interface DealSummary {
  count: number;
  locations: string[];
  areaMin: number;
  areaMax: number;
  /** Median EGP price per m² (monthly for rent); null with fewer than 2 EGP-priced units. */
  medianPerSqm: number | null;
}

function summarise(rows: DeveloperListing[]): DealSummary {
  const areas = rows.map((r) => Number(r.area_sqm) || 0).filter((a) => a > 0);
  const perSqm = rows
    .filter((r) => (r.currency ?? "EGP") !== "USD" && Number(r.price) > 0 && Number(r.area_sqm) > 0)
    .map((r) => Number(r.price) / Number(r.area_sqm));
  const locCounts = new Map<string, number>();
  for (const r of rows) if (r.location) locCounts.set(r.location, (locCounts.get(r.location) ?? 0) + 1);
  return {
    count: rows.length,
    locations: Array.from(locCounts).sort((a, b) => b[1] - a[1]).map(([l]) => l),
    areaMin: areas.length ? Math.min(...areas) : 0,
    areaMax: areas.length ? Math.max(...areas) : 0,
    medianPerSqm: perSqm.length >= 2 ? median(perSqm) : null,
  };
}

export interface DeveloperInventory {
  name: string;
  count: number;
  rent: DealSummary;
  sale: DealSummary;
  income: DealSummary;
  /** One-paragraph summary of what's available now. */
  summary: string;
  /** Live landing pages this developer has units on, e.g. "Offices for Rent in New Cairo". */
  landingLinks: Array<{ path: string; heading: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export function developerInventory(slug: string, all: DeveloperListing[]): DeveloperInventory {
  const name = developerName(slug);
  const rows = developerRows(all, slug);
  const by = (tx: string) => summarise(rows.filter((r) => r.transaction_type === tx));
  const rent = by("rent");
  const sale = by("sale");
  const income = by("income-property");
  const sizes = (s: DealSummary) => (s.areaMin ? ` from ${fmt(s.areaMin)} to ${fmt(s.areaMax)} m²` : "");

  const parts: string[] = [];
  if (rent.count) parts.push(`${rent.count} office${rent.count === 1 ? "" : "s"} for rent`);
  if (sale.count) parts.push(`${sale.count} for sale`);
  if (income.count) parts.push(`${income.count} income propert${income.count === 1 ? "y" : "ies"}`);
  const allLocations = summarise(rows).locations;
  const summary = rows.length
    ? `PLACES currently lists ${list(parts)} in ${name} projects${allLocations.length ? `, in ${list(allLocations)}` : ""}. Every unit below is available now; book a viewing on any listing or ask us for a shortlist.`
    : `There are no ${name} units listed on PLACES right now. We work with ${name} projects regularly, so tell us your size and budget and we'll check current availability for you.`;

  // Landing pages that include this developer's units.
  const landingLinks = eligibleLandingPages(all)
    .filter((p) => rows.some((r) => r.location === p.loc.name && r.transaction_type === DEALS[p.deal].tx))
    .map((p) => ({ path: p.path, heading: DEALS[p.deal].heading(p.loc.name) }));

  const faqs: DeveloperInventory["faqs"] = [];
  const projects = getProjectsByDeveloper(slug);
  if (projects.length) {
    faqs.push({
      question: `Where are ${name}'s commercial and office projects?`,
      answer: `${name}'s projects tracked by PLACES are ${list(projects.map((p) => `${p.name} (${p.location})`))}.`,
    });
  }
  if (rent.count) {
    faqs.push({
      question: `Are there ${name} offices for rent?`,
      answer:
        `Yes. PLACES currently lists ${rent.count} ${name} office${rent.count === 1 ? "" : "s"} for rent${rent.locations.length ? ` in ${list(rent.locations)}` : ""},${sizes(rent)}.` +
        (rent.medianPerSqm ? ` The median asking rent is about EGP ${fmt(round(rent.medianPerSqm))} per m² per month.` : ""),
    });
  }
  if (sale.count || income.count) {
    const n = sale.count + income.count;
    const s = summarise(rows.filter((r) => r.transaction_type === "sale" || r.transaction_type === "income-property"));
    faqs.push({
      question: `Can I buy an office in a ${name} project?`,
      answer:
        `Yes. PLACES currently lists ${n} ${name} unit${n === 1 ? "" : "s"} for sale${income.count ? ` (${income.count} already leased, as income properties)` : ""}${s.locations.length ? ` in ${list(s.locations)}` : ""},${sizes(s)}.` +
        (s.medianPerSqm ? ` The median asking price is about EGP ${fmt(round(s.medianPerSqm))} per m².` : ""),
    });
  }
  faqs.push({
    question: `How do I rent or buy an office in a ${name} project?`,
    answer: rows.length
      ? `Open any ${name} listing on PLACES and choose "Book a viewing", or contact PLACES with your size, budget and timing and we'll send a shortlist of matching ${name} units.`
      : `Contact PLACES with your size, budget and timing. We'll check what's currently available in ${name} projects and send you a shortlist.`,
  });

  return { name, count: rows.length, rent, sale, income, summary, landingLinks, faqs };
}

/** Developers that have pages and units now, biggest first (for the "no units" fallback). */
export function developersWithStock(all: DeveloperListing[], exclude: string, n = 4) {
  const counts = new Map<string, number>();
  for (const r of all) {
    if (r.rental_status === "rented" || !r.developer || r.developer === exclude || !DEVELOPER_PAGE_SLUGS.has(r.developer)) continue;
    counts.set(r.developer, (counts.get(r.developer) ?? 0) + 1);
  }
  return Array.from(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([slug, count]) => ({ slug, name: developerName(slug), count }));
}
