import { useMemo, type ReactNode } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { formatEgpShort, USD_EGP_RATE } from "@/lib/currency";
import type { Listing } from "@/lib/supabase";
import {
  BUDGET_HINTS,
  FilterSidebar,
  LOCATIONS,
  locationLabel,
  sameLocation,
  formatAmount,
  parseAmount,
  type Filters,
} from "@/components/listings/FilterSidebar";

// Top filter bar for /listings: search + the four most-used filters as
// dropdown buttons, everything else behind "More filters" (the full
// FilterSidebar in a sheet). Writes to the same Filters state as before, so
// URL params, landing-page links and tracking are unchanged.

type SetFilters = (f: Filters | ((prev: Filters) => Filters)) => void;

const DEALS = [
  { value: "Rent", label: "For rent" },
  { value: "Sale", label: "For sale" },
  { value: "Income Property", label: "Income property" },
] as const;

function Pill({ label, value, active, children, wide }: { label: string; value: string; active: boolean; children: ReactNode; wide?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`shrink-0 inline-flex items-center gap-1.5 h-11 px-4 rounded-full border text-sm transition-colors whitespace-nowrap ${
            active ? "bg-primary text-white border-primary" : "bg-white text-primary border-border/60 hover:border-primary/40"
          }`}
        >
          <span className="font-semibold">{label}:</span>
          <span className={active ? "text-white/90" : "text-muted-foreground"}>{value}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={`${wide ? "w-80" : "w-60"} p-3 bg-white`}>
        {children}
      </PopoverContent>
    </Popover>
  );
}

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
        selected ? "bg-primary/10 text-primary font-semibold" : "text-foreground/80 hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function rangeLabel(min: number | null, max: number | null, fmt: (n: number) => string, any: string) {
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `${fmt(min)}+`;
  if (max != null) return `Up to ${fmt(max)}`;
  return any;
}

export function ListingsFilterBar({
  filters,
  setFilters,
  listings,
  searchQuery,
  setSearchQuery,
}: {
  filters: Filters;
  setFilters: SetFilters;
  listings: Listing[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const locations = useMemo(
    () => Array.from(new Set([...LOCATIONS, ...listings.map((l) => l.location).filter((l): l is string => !!l).map(locationLabel)])).sort(),
    [listings],
  );

  // Same rule as the sidebar: a budget never carries over between deal types.
  const setDeal = (type: Filters["transactionType"]) =>
    setFilters((p) => ({ ...p, transactionType: type, priceMin: null, priceMax: null }));
  const setArea = (key: "areaMin" | "areaMax", raw: string) => {
    const n = Number(raw.replace(/[^\d.]/g, ""));
    setFilters((p) => ({ ...p, [key]: raw.trim() === "" || !Number.isFinite(n) ? null : n }));
  };
  const setPrice = (key: "priceMin" | "priceMax", raw: string) =>
    setFilters((p) => ({ ...p, [key]: parseAmount(raw) }));

  const budget = filters.transactionType === null ? null : filters.transactionType === "Rent" ? BUDGET_HINTS.rent : BUDGET_HINTS.sale;
  const moreCount = filters.subtype.length + filters.furnishing.length + (filters.developer ? 1 : 0);
  const dealLabel = DEALS.find((d) => d.value === filters.transactionType)?.label ?? "Any";

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="relative lg:w-72 shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search project or area"
          aria-label="Search listings"
          className="pl-11 pr-10 h-11 rounded-full bg-white border-border/60"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Scrolls sideways on phones instead of wrapping into a tall block. */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-0 lg:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Pill label="Deal" value={dealLabel} active={!!filters.transactionType}>
          <Option selected={!filters.transactionType} onClick={() => setDeal(null)}>Any</Option>
          {DEALS.map((d) => (
            <Option key={d.value} selected={filters.transactionType === d.value} onClick={() => setDeal(d.value)}>
              {d.label}
            </Option>
          ))}
        </Pill>

        <Pill label="Location" value={filters.location ? locationLabel(filters.location) : "All"} active={!!filters.location}>
          <Option selected={!filters.location} onClick={() => setFilters((p) => ({ ...p, location: null }))}>All locations</Option>
          {locations.map((loc) => (
            <Option key={loc} selected={sameLocation(filters.location, loc)} onClick={() => setFilters((p) => ({ ...p, location: loc }))}>
              {loc}
            </Option>
          ))}
        </Pill>

        <Pill
          label="Size"
          value={rangeLabel(filters.areaMin, filters.areaMax, (n) => `${n.toLocaleString("en-US")} m²`, "Any")}
          active={filters.areaMin != null || filters.areaMax != null}
          wide
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Area (m²)</p>
          <div className="flex items-center gap-2">
            <Input type="number" inputMode="numeric" min={0} placeholder="Min" aria-label="Minimum area in square metres" value={filters.areaMin ?? ""} onChange={(e) => setArea("areaMin", e.target.value)} />
            <span className="text-muted-foreground">–</span>
            <Input type="number" inputMode="numeric" min={0} placeholder="Max" aria-label="Maximum area in square metres" value={filters.areaMax ?? ""} onChange={(e) => setArea("areaMax", e.target.value)} />
          </div>
        </Pill>

        <Pill
          label="Budget"
          value={rangeLabel(filters.priceMin, filters.priceMax, formatEgpShort, "Any")}
          active={filters.priceMin != null || filters.priceMax != null}
          wide
        >
          {budget ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{budget.label}</p>
              <div className="flex items-center gap-2">
                <Input inputMode="numeric" placeholder={budget.min} aria-label={`Minimum ${budget.label.toLowerCase()}`} value={formatAmount(filters.priceMin)} onChange={(e) => setPrice("priceMin", e.target.value)} />
                <span className="text-muted-foreground">–</span>
                <Input inputMode="numeric" placeholder={budget.max} aria-label={`Maximum ${budget.label.toLowerCase()}`} value={formatAmount(filters.priceMax)} onChange={(e) => setPrice("priceMax", e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">USD listings are included at {USD_EGP_RATE} EGP per USD.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">Choose a deal type first. Rent budgets are monthly, sale budgets are the total price.</p>
              <div className="flex flex-wrap gap-2">
                {DEALS.map((d) => (
                  <button key={d.value} type="button" onClick={() => setDeal(d.value)} className="text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary">
                    {d.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </Pill>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className={`shrink-0 inline-flex items-center gap-1.5 h-11 px-4 rounded-full border text-sm font-semibold transition-colors whitespace-nowrap ${
                moreCount > 0 ? "bg-primary text-white border-primary" : "bg-white text-primary border-border/60 hover:border-primary/40"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              More filters
              {moreCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-accent text-white text-[11px] font-bold">{moreCount}</span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto">
            <FilterSidebar filters={filters} setFilters={setFilters} listings={listings} className="mt-6" />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
