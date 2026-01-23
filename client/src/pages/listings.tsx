import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FilterSidebar } from "@/components/listings/FilterSidebar";
import { ListingCard } from "@/components/listings/ListingCard";
import { LISTINGS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search, Map } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ListingsPage() {
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredListings = useMemo(() => {
    return LISTINGS.filter((listing) => {
      // Search Query
      if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Transaction Type
      if (filters.transactionType && listing.transactionType !== filters.transactionType) {
        return false;
      }

      // Location
      if (filters.location?.length && !filters.location.includes(listing.location)) {
        return false;
      }

      // Developer
      if (filters.developer?.length && !filters.developer.includes(listing.developer)) {
        return false;
      }

      // Office Type
      if (filters.officeType?.length && !filters.officeType.includes(listing.officeType)) {
        return false;
      }

      // Furnish Level
      if (filters.furnishLevel?.length && !filters.furnishLevel.includes(listing.furnishLevel)) {
        return false;
      }

      return true;
    });
  }, [filters, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20 font-sans">
      <Navbar />

      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Find Your Perfect Workspace</h1>
          <p className="text-lg text-gray-300 max-w-2xl">
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
              <FilterSidebar filters={filters} setFilters={setFilters} className="mt-6" />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-xs sticky top-24 border border-border/60">
              <FilterSidebar filters={filters} setFilters={setFilters} />
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredListings.length}</span> Results Found
                <div className="h-4 w-px bg-border mx-2" />
                <Button variant="ghost" size="sm" className="h-8">Sort by: Featured</Button>
              </div>
            </div>

            {/* Grid */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
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
                <Button onClick={() => setFilters({})} variant="outline">Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
