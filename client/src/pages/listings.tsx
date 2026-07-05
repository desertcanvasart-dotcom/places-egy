import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FilterSidebar, DEFAULT_FILTERS, PRICE_MIN, PRICE_MAX, type Filters } from "@/components/listings/FilterSidebar";
import { ListingCard } from "@/components/listings/ListingCard";
import { supabase, type Listing } from "@/lib/supabase";
import { FURNISHING_OPTIONS, getEnumLabel } from "@/lib/enums";
import { DEVELOPER_DISPLAY_NAMES } from "@/lib/projects";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { listingUrl } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search, Loader2, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "newest" | "price-low" | "price-high" | "area-large" | "area-small";

const SORT_LABELS: Record<SortOption, string> = {
  "newest": "Newest First",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  "area-large": "Area: Large to Small",
  "area-small": "Area: Small to Large",
};

function getInitialFilters(): Filters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  const params = new URLSearchParams(window.location.search);
  const filters = { ...DEFAULT_FILTERS };
  const type = params.get("type");
  const subtype = params.get("subtype");
  const location = params.get("location");
  const transaction = params.get("transaction");
  const developer = params.get("developer");
  // Note: legacy ?type=commercial URLs are silently ignored after the
  // positioning shift to admin-only. The query below also enforces admin.
  if (type === "admin") {
    filters.propertyType = "Admin";
  }
  if (subtype) {
    filters.subtype = [subtype];
  }
  if (location) {
    filters.location = location;
  }
  if (transaction === "sale" || transaction === "rent") {
    filters.transactionType = transaction === "sale" ? "Sale" : "Rent";
  }
  if (developer) {
    filters.developer = developer;
  }
  return filters;
}

function getInitialQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("q") ?? "";
}

const LISTINGS_CANONICAL = "https://places-egy.com/listings";

// Faceted-navigation SEO: filtered/search views of /listings (any ?query) are
// near-infinite low-value URL variations and render an empty "no matches" state
// when a filter has no results — which Google reports as soft 404s. We mark any
// filtered view noindex,follow and canonicalize it to the clean /listings page,
// so only /listings itself is indexed. The clean page gets a self-canonical.
function useListingsIndexability() {
  useEffect(() => {
    const hasParams = typeof window !== "undefined" && window.location.search.length > 1;

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", hasParams ? "noindex,follow" : "index,follow");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", LISTINGS_CANONICAL);

    return () => {
      // Restore indexability when leaving so the next page isn't left noindexed.
      robots?.setAttribute("content", "index,follow");
    };
  }, []);
}

export default function ListingsPage() {
  const [filters, setFilters] = useState<Filters>(getInitialFilters);
  const [searchQuery, setSearchQuery] = useState(getInitialQuery);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useListingsIndexability();

  const { data: listings = [], isLoading, error } = useQuery<Listing[]>({
    queryKey: ["listings"],
    // Serve cached data instantly on revisit; refetch in the background after
    // 60s. gcTime keeps the cache alive for 5 minutes after the page unmounts
    // so navigating away and back is instant.
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select("*")
        .eq("property_type", "admin")
        .order("id", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Free-text search — matches across title, project, location,
      // developer slug, and description. Empty query passes everything.
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          listing.title,
          listing.project,
          listing.location,
          listing.location_area,
          listing.developer,
          listing.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Transaction type (null = show all)
      if (filters.transactionType && listing.transaction_type?.toLowerCase() !== filters.transactionType.toLowerCase()) {
        return false;
      }
      // Property type (null = show all)
      if (filters.propertyType && listing.property_type?.toLowerCase() !== filters.propertyType.toLowerCase()) {
        return false;
      }
      // Subtype (multi, no selection = no filter) — normalize slugs
      if (filters.subtype.length > 0) {
        const normalize = (s: string) => s.toLowerCase().replace(/[\s-]/g, "");
        if (!filters.subtype.some(s => normalize(s) === normalize(listing.subtype ?? ""))) {
          return false;
        }
      }
      // Location (single, null = no filter) — normalize slugs (e.g. "new-cairo" matches "New Cairo")
      if (filters.location) {
        const normalize = (s: string) => s.toLowerCase().replace(/[\s-]/g, "");
        if (normalize(listing.location ?? "") !== normalize(filters.location)) {
          return false;
        }
      }
      // Price range. Only apply the filter when the user has actually moved
      // the slider away from defaults; otherwise a listing with a missing or
      // very-high price would be silently hidden on the default view.
      const [minPrice, maxPrice] = filters.priceRange;
      const priceFilterActive = minPrice > PRICE_MIN || maxPrice < PRICE_MAX;
      if (priceFilterActive) {
        const p = listing.price ?? 0;
        if (p < minPrice || p > maxPrice) {
          return false;
        }
      }
      // Furnishing (multi, no selection = no filter)
      if (filters.furnishing.length > 0 && !filters.furnishing.some(f => f.toLowerCase() === listing.furnishing?.toLowerCase())) {
        return false;
      }
      // Developer (single, null = no filter)
      if (filters.developer && listing.developer?.toLowerCase() !== filters.developer.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [listings, filters, searchQuery]);

  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "price-high":
        return sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "area-large":
        return sorted.sort((a, b) => (b.area_sqm ?? 0) - (a.area_sqm ?? 0));
      case "area-small":
        return sorted.sort((a, b) => (a.area_sqm ?? 0) - (b.area_sqm ?? 0));
      case "newest":
      default:
        return sorted.sort((a, b) => b.id - a.id);
    }
  }, [filteredListings, sortBy]);

  const activeFilterChips = (() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (filters.transactionType) chips.push({ label: filters.transactionType, clear: () => setFilters((p) => ({ ...p, transactionType: null })) });
    // propertyType chip removed — site is admin-only, so the chip would
    // always appear and have nothing meaningful to clear to.
    filters.subtype.forEach((s) => chips.push({ label: s, clear: () => setFilters((p) => ({ ...p, subtype: p.subtype.filter((x) => x !== s) })) }));
    if (filters.location) chips.push({ label: filters.location, clear: () => setFilters((p) => ({ ...p, location: null })) });
    if (filters.developer) chips.push({ label: DEVELOPER_DISPLAY_NAMES[filters.developer] ?? filters.developer, clear: () => setFilters((p) => ({ ...p, developer: null })) });
    filters.furnishing.forEach((f) => chips.push({ label: getEnumLabel(FURNISHING_OPTIONS, f), clear: () => setFilters((p) => ({ ...p, furnishing: p.furnishing.filter((x) => x !== f) })) }));
    if (filters.priceRange[0] > PRICE_MIN || filters.priceRange[1] < PRICE_MAX) chips.push({ label: `${(filters.priceRange[0] / 1000000).toFixed(1)}M – ${(filters.priceRange[1] / 1000000).toFixed(1)}M EGP`, clear: () => setFilters((p) => ({ ...p, priceRange: [PRICE_MIN, PRICE_MAX] })) });
    return chips;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-muted font-sans">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Listings", url: "/listings" },
        ])}
      />
      {sortedListings.length > 0 && (
        <SchemaMarkup
          schema={itemListSchema({
            name: "PLACES Listings",
            url: "/listings",
            items: sortedListings.slice(0, 30).map((l) => ({ name: l.title, url: listingUrl(l) })),
          })}
        />
      )}
      <Navbar />

      {/* Hero — taller image-forward header with a soft fade into the
          results section. Lighter overlay so the photo reads clearly,
          gradient that begins in the lower third for a smooth handoff. */}
      <div className="relative text-white pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/offices-hero.jpg" alt="Office" fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
          {/* Light uniform tint for text contrast, plus a single bottom-half
              gradient that fades smoothly into the page background. */}
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-50% to-muted" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <div className="inline-flex flex-col w-fit max-w-full">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white drop-shadow-md">Find your perfect workspace</h1>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by project, location, or developer..."
                className="pl-11 h-12 bg-white border-border/40 shadow-lg text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 md:px-10 -mt-12 pb-24 lg:pb-8 flex-1 relative z-10">

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground mr-1">Filters:</span>
            {activeFilterChips.map((chip, i) => (
              <button
                key={i}
                onClick={chip.clear}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/5 text-primary px-3 py-1.5 rounded-full hover:bg-accent/10 hover:text-accent transition-colors"
              >
                {chip.label}
                <span className="text-primary/40 hover:text-accent">×</span>
              </button>
            ))}
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-xs text-muted-foreground hover:text-accent transition-colors ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results count + sort + view toggle */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{sortedListings.length}</span> results
          </p>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition-all hover:bg-primary/10 hover:text-primary active:scale-95 ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-1.5 rounded-md transition-all hover:bg-primary/10 hover:text-primary active:scale-95 ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-auto h-8 px-2 gap-1 bg-transparent border-none shadow-none text-xs text-muted-foreground hover:text-primary focus:ring-0 focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filter */}
        <div className="lg:hidden mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full bg-white"><SlidersHorizontal className="h-4 w-4 mr-2" /> Filters</Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <FilterSidebar filters={filters} setFilters={setFilters} listings={listings} className="mt-6" />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-[#FDFBF8] p-6 rounded-2xl shadow-[0_4px_24px_-12px_rgba(232,64,74,0.12)] sticky top-20 border border-border/40 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <FilterSidebar filters={filters} setFilters={setFilters} listings={listings} />
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1">
            {isLoading ? (
              // Skeleton grid — matches the real grid's layout so the page
              // doesn't shift when data lands. Six placeholders fill the
              // viewport on most screens.
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border/40 bg-white overflow-hidden animate-pulse">
                    <div className="aspect-4/3 bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 w-2/3 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-3 w-16 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                      <div className="h-5 w-1/3 bg-muted rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-destructive mb-2">Failed to load listings</p>
                <p className="text-muted-foreground text-sm">Please try again later.</p>
              </div>
            ) : sortedListings.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} listView />
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-serif font-bold text-primary mb-2">No listings match your filters</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Try removing some filters to see more results, or browse all available units.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setFilters(DEFAULT_FILTERS)} variant="outline">Clear all filters</Button>
                  <a href="/listings">
                    <Button className="bg-primary text-white">Browse all units</Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
