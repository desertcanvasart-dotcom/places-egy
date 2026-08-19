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
// Visually: no colored section wrapper — the map sits directly on the
// homepage's cream background so it blends with everything above/below
// instead of reading as a separate module. The heading + subtitle are
// typographically consistent with the other homepage sections.
export function HomepageMap() {
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["listings", "map-homepage"],
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

  const hasContent = useMemo(() => listings.length > 0, [listings]);

  if (isLoading && !hasContent) {
    // Loading skeleton — sits on the same transparent background so the
    // page rhythm doesn't jump when data arrives.
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-6">
            <div className="h-6 w-40 bg-primary/5 rounded-full animate-pulse mb-4" />
            <div className="h-8 w-72 bg-primary/10 rounded animate-pulse mb-3" />
            <div className="h-4 w-96 bg-primary/5 rounded animate-pulse" />
          </div>
          <div className="h-[480px] rounded-3xl bg-white/70 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!hasContent) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-6 md:px-10">
        {/* Header — same typographic system as the other homepage sections:
            small accent-red uppercase eyebrow, serif h2, muted body. No
            fenced background. */}
        <div className="mb-8 md:mb-10 flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-4 py-2 rounded-full shadow-sm shadow-accent/10 mb-4">
              <MapPin className="w-3.5 h-3.5" />
              Explore on the map
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3 leading-tight tracking-tight">
              PLACES units across Cairo
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Every project we broker, one map. Click a pin to see the units
              available in that building.
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

        {/* The map itself gets a soft shadow + rounded frame so it feels
            like a photographic hero rather than a floating utility box.
            The shadow color picks up the brand's dark-primary tone at low
            opacity — subtle grounding rather than heavy separation. */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-primary/[0.08] ring-1 ring-primary/[0.06]">
          <ListingsMap listings={listings} />
        </div>

        {/* Mobile version of the CTA below the map. */}
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
