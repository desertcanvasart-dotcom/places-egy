// Listings filter state <-> query string, so filtered views can be shared,
// bookmarked and restored with Back. Existing inbound params (developer,
// transaction, type, q, project, location, subtype) keep their meaning.
//
//   /listings?transaction=rent&location=New+Cairo&min_area=100&max_area=300&sort=price-low
import { DEFAULT_FILTERS, PRICE_MAX, PRICE_MIN, type Filters } from "@/components/listings/FilterSidebar";

export type SortOption = "newest" | "price-low" | "price-high" | "area-large" | "area-small";
export type ViewMode = "grid" | "list" | "map";

export interface ListingsUrlState {
  filters: Filters;
  q: string;
  sort: SortOption;
  view: ViewMode;
}

const SORTS: SortOption[] = ["newest", "price-low", "price-high", "area-large", "area-small"];
const VIEWS: ViewMode[] = ["grid", "list", "map"];
const TRANSACTION_TO_PARAM = { Sale: "sale", Rent: "rent", "Income Property": "income-property" } as const;

const num = (v: string | null): number | null => {
  if (v == null || v.trim() === "") return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

export function parseListingsSearch(search: string): ListingsUrlState {
  const p = new URLSearchParams(search);
  const filters: Filters = { ...DEFAULT_FILTERS, subtype: [], furnishing: [] };

  // Legacy ?type=commercial is ignored (the site is admin-only).
  if (p.get("type") === "admin") filters.propertyType = "Admin";
  const t = p.get("transaction");
  if (t === "sale") filters.transactionType = "Sale";
  else if (t === "rent") filters.transactionType = "Rent";
  else if (t === "income-property") filters.transactionType = "Income Property";
  filters.subtype = list(p.get("subtype"));
  filters.location = p.get("location") || null;
  filters.developer = p.get("developer") || null;
  filters.furnishing = list(p.get("condition"));
  filters.areaMin = num(p.get("min_area"));
  filters.areaMax = num(p.get("max_area"));
  const minPrice = num(p.get("min_price"));
  const maxPrice = num(p.get("max_price"));
  filters.priceRange = [minPrice ?? PRICE_MIN, maxPrice ?? PRICE_MAX];

  const sort = p.get("sort") as SortOption | null;
  const view = p.get("view") as ViewMode | null;
  return {
    filters,
    q: p.get("q") || p.get("project") || "",
    sort: sort && SORTS.includes(sort) ? sort : "newest",
    view: view && VIEWS.includes(view) ? view : "grid",
  };
}

/** Query string (with leading "?", or "" when nothing is set). Unrelated params such as utm_* are kept. */
export function buildListingsSearch(state: ListingsUrlState, current = ""): string {
  const p = new URLSearchParams(current);
  for (const k of ["type", "transaction", "subtype", "location", "developer", "condition", "min_area", "max_area", "min_price", "max_price", "q", "project", "sort", "view"]) p.delete(k);
  const { filters: f } = state;
  if (f.propertyType === "Admin") p.set("type", "admin");
  if (f.transactionType) p.set("transaction", TRANSACTION_TO_PARAM[f.transactionType]);
  if (f.subtype.length) p.set("subtype", f.subtype.join(","));
  if (f.location) p.set("location", f.location);
  if (f.developer) p.set("developer", f.developer);
  if (f.furnishing.length) p.set("condition", f.furnishing.join(","));
  if (f.areaMin != null) p.set("min_area", String(f.areaMin));
  if (f.areaMax != null) p.set("max_area", String(f.areaMax));
  if (f.priceRange[0] > PRICE_MIN) p.set("min_price", String(f.priceRange[0]));
  if (f.priceRange[1] < PRICE_MAX) p.set("max_price", String(f.priceRange[1]));
  if (state.q.trim()) p.set("q", state.q.trim());
  if (state.sort !== "newest") p.set("sort", state.sort);
  if (state.view !== "grid") p.set("view", state.view);
  const s = p.toString();
  return s ? `?${s}` : "";
}
