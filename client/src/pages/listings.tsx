import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FilterSidebar, DEFAULT_FILTERS, type Filters } from "@/components/listings/FilterSidebar";
import { ListingCard } from "@/components/listings/ListingCard";
import { supabase, type Listing } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search, Loader2 } from "lucide-react";
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

export default function ListingsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const { data: listings = [], isLoading, error } = useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("id", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Transaction type (always one selected)
      if (listing.transaction_type?.toLowerCase() !== filters.transactionType.toLowerCase()) {
        return false;
      }
      // Property type (always one selected)
      if (listing.property_type?.toLowerCase() !== filters.propertyType.toLowerCase()) {
        return false;
      }
      // Subtype (multi, no selection = no filter)
      if (filters.subtype.length > 0 && !filters.subtype.some(s => s.toLowerCase() === listing.subtype?.toLowerCase())) {
        return false;
      }
      // Location (single, null = no filter)
      if (filters.location && listing.location?.toLowerCase() !== filters.location.toLowerCase()) {
        return false;
      }
      // Price range
      if (listing.price < filters.priceRange[0] || listing.price > filters.priceRange[1]) {
        return false;
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

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20 font-sans">
      <Navbar />

      {/* Header */}
      <div className="relative text-white py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/src/assets/images/general-office.png" alt="Office" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        <div className="relative z-10 container mx-auto px-4 pt-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white">Find Your Perfect Workspace</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Browse our curated collection of premium administrative offices across Egypt's top business hubs.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-1">
        
        {/* Mobile Filter & Search Bar */}
        <div className="lg:hidden mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search properties..." 
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="bg-white"><SlidersHorizontal className="h-4 w-4 mr-2" /> Filters</Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <FilterSidebar filters={filters} setFilters={setFilters} listings={listings} className="mt-6" />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-xs sticky top-24 border border-border/60">
              <FilterSidebar filters={filters} setFilters={setFilters} listings={listings} />
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1">
            {/* Desktop Toolbar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search properties by title..." 
                  className="pl-9 bg-white border-border/60 shadow-xs focus-visible:ring-accent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{sortedListings.length}</span> Results
                <div className="h-3 w-px bg-border mx-1.5" />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-40 h-7 bg-white text-xs">
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

            {/* Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading listings...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-destructive mb-2">Failed to load listings</p>
                <p className="text-muted-foreground text-sm">Please try again later.</p>
              </div>
            ) : sortedListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No listings found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button onClick={() => setFilters(DEFAULT_FILTERS)} variant="outline">Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
