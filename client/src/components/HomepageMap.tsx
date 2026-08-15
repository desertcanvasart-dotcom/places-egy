import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ListingsMap } from "@/components/listings/ListingsMap";
import { supabase, type Listing } from "@/lib/supabase";
import { ArrowRight, MapPin } from "lucide-react";

// Homepage master map. Fetches all admin listings + renders them on
// ListingsMap (which internally groups by project + joins to project
// coordinates). A user can browse geographically → click any pin → land
// on the filtered /listings page for that project.
//
// Kept in its own component so the fetching + heading + CTA logic doesn't
// bloat home.tsx and so the same fetch can be reused later on /map if we
// build a full-screen version.
export function HomepageMap() {
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["listings", "map-homepage"],
    // Same 60s freshness as the /listings page — matches user expectations.
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

  // Skip the whole section on the very first render if the fetch is still
  // in flight AND we have no cached data. Prevents a big empty box in the
  // scroll flow.
  const hasContent = useMemo(() => listings.length > 0, [listings]);

  if (isLoading && !hasContent) {
    return (
      <section className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-8">
            <div className="h-8 w-72 bg-white/70 rounded animate-pulse mb-3" />
            <div className="h-4 w-96 bg-white/70 rounded animate-pulse" />
          </div>
          <div className="h-[420px] rounded-2xl bg-white/70 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!hasContent) return null;

  return (
    <section className="py-16 md:py-20 bg-muted">
      <div className="container mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              <MapPin className="w-3.5 h-3.5" />
              Explore on the map
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3 leading-tight">
              PLACES units across Cairo
            </h2>
            <p className="text-muted-foreground">
              See every project we broker on one map. Click a pin to view the
              available units in that building.
            </p>
          </div>
          <Link
            href="/listings"
            className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group whitespace-nowrap"
          >
            Browse all listings
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ListingsMap listings={listings} />

        <div className="mt-6 md:hidden">
          <Link
            href="/listings"
            className="inline-flex items-center text-primary font-medium hover:text-accent transition-colors group"
          >
            Browse all listings
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
