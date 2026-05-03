import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { supabase, type Listing } from "@/lib/supabase";
import { ArrowRight, MapPin, Building2, ChevronRight, Store, UtensilsCrossed, Landmark, TrendingUp, AlertTriangle, Search, ScanLine, ClipboardCheck, Car } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { listingUrl } from "@/lib/listings";
import { LOCATION_CONTENT } from "@/lib/location-content";
import { getProjectsByType } from "@/lib/projects";

// Projects grid — sourced from the centralized project list. Any project
// anywhere in the app tagged `type: "mega-mall"` will appear here automatically.
const megaMallProjects = getProjectsByType("mega-mall");

export default function MegaMalls() {
  // Individual listings from Supabase for the "Our top office picks" section below —
  // stays Supabase-driven so new listings auto-appear.
  const { data: megaMallListings = [] } = useQuery<Listing[]>({
    queryKey: ["mega-mall-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("subtype", "mega-mall")
        .order("id", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const topMegaMallListings = megaMallListings;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Commercial", url: "/commercial" },
          { name: "Mega Malls", url: "/commercial/mega-mall" },
        ])}
      />
      {topMegaMallListings.length > 0 && (
        <SchemaMarkup
          schema={itemListSchema({
            name: "Mega Mall Listings",
            url: "/commercial/mega-malls",
            items: topMegaMallListings.slice(0, 30).map((l) => ({ name: l.title, url: listingUrl(l) })),
          })}
        />
      )}
      <Navbar />

      {/* Section 1 — Hero */}
      <section className="relative min-h-[40vh] md:min-h-[55vh] pt-28 md:pt-32 pb-14 md:pb-20 overflow-hidden flex flex-col justify-between gap-8">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/mega-mall.jpg"
            alt="Mega Mall"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#111111]/85" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <nav className="flex items-center gap-1.5 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/commercial" className="hover:text-white transition-colors">Commercial</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Mega Malls</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Mega Malls in Egypt
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-2xl">
            Large-scale shopping destinations built for anchor tenants, high daily footfall, and maximum brand visibility.
          </p>
          <a href="#mega-mall-listings">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-12 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105">
              Browse Offices in Mega Malls <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Statement */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="border-l-4 border-accent pl-6 md:pl-8">
            <p className="text-2xl md:text-3xl font-serif font-bold text-primary leading-snug mb-4 max-w-4xl">
              Mega malls are Egypt's highest-traffic commercial environments — built for brands that rely on footfall, visibility, and repeat exposure.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
              Performance comes down to two things: footfall density and tenant mix. The right unit in the right mall generates consistent revenue. The wrong one, even in a strong location, can underperform significantly.
            </p>
          </div>
        </div>
      </section>

      {/* Top mega malls — dynamic from listings tagged subtype=mega-mall */}
      {megaMallProjects.length > 0 && (
        <section className="pt-2 pb-12">
          <div className="container mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {megaMallProjects.map(({ name, developer, location, image }, i) => (
                <div
                  key={`${name}-${i}`}
                  className="relative h-64 rounded-2xl overflow-hidden group bg-primary/80"
                >
                  {image && (
                    <img
                      src={image}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10" />
                  <div className="relative z-10 h-full flex flex-col justify-between p-5">
                    {developer && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-white/80" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white/80">{developer.replace(/-/g, " ")}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-serif font-bold text-white mb-1">{name}</h3>
                      {location && (
                        <div className="flex items-center gap-1.5 text-white/70 text-sm mb-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link href="/projects">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-white px-8 h-12 text-base font-medium transition-all hover:scale-105"
                >
                  Explore all projects <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Is this right for you? */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
              Is this right for you?
            </h2>
          </div>

          {(() => {
            const worksFor = [
              { icon: Store, text: "Retail brands that need traffic concentration and strong brand adjacency" },
              { icon: UtensilsCrossed, text: "F&B operators that depend on consistent daily footfall and structured mall infrastructure" },
              { icon: Landmark, text: "Service operators — banks, telecom, medical chains — that benefit from centralized consumer movement" },
              { icon: TrendingUp, text: "Investors targeting income-generating commercial property in Egypt" },
            ];
            const beforeCommit = [
              "Higher base rents compared to strip malls",
              "Competitive adjacency — other brands in your category will be nearby",
              "Marketing and service charge obligations on top of rent",
              "Your performance is partially tied to overall mall performance",
            ];
            return (
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-12 items-start">
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Who mega malls work for</h3>
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Before you commit</h3>
                {worksFor.map((item, i) => (
                  <>
                    <div key={`w-${i}`} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-primary/5 rounded-full flex items-center justify-center shrink-0 text-primary">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{item.text}</p>
                    </div>
                    <div key={`b-${i}`} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-accent/5 rounded-full flex items-center justify-center shrink-0 text-accent">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{beforeCommit[i]}</p>
                    </div>
                  </>
                ))}
              </div>
            );
          })()}

          <div className="mt-10 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground mb-4">If a mega mall isn't the right fit, explore other commercial formats:</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Link
                href="/commercial/strip-mall"
                className="group flex items-center gap-4 bg-white rounded-xl border border-border/40 border-l-4 border-l-accent px-5 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">
                    Commercial
                  </span>
                  <span className="block text-base font-serif font-bold text-primary">
                    Strip Malls
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
              <Link
                href="/commercial/drive-through"
                className="group flex items-center gap-4 bg-white rounded-xl border border-border/40 border-l-4 border-l-accent px-5 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">
                    Commercial
                  </span>
                  <span className="block text-base font-serif font-bold text-primary">
                    Drive-Through
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            </div>
            <Link href="/commercial" className="inline-flex items-center text-sm font-medium text-accent hover:text-primary transition-colors">
              View all commercial spaces <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4 — Top units in mega malls */}
      {topMegaMallListings.length > 0 && (
      <section id="mega-mall-listings" className="py-12 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Our top office picks in mega malls
            </h2>
            <Link href="/listings" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group mt-4 md:mt-0">
              Browse all <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {topMegaMallListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {topMegaMallListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} compact hideSubtype />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8">No mega mall listings available yet.</p>
          )}

          <div className="mt-8 md:hidden">
            <Link href="/listings">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                Browse all listings
              </Button>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* How PLACES evaluates mega mall units */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="relative bg-primary rounded-3xl overflow-hidden p-8 md:p-14">
            {/* Subtle accent glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

            <div className="relative z-10 grid md:grid-cols-5 gap-10 md:gap-12 items-center">
              {/* Left: steps */}
              <div className="md:col-span-3">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8 leading-snug">
                  How we evaluate every unit
                </h2>
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  {[
                    { icon: Search, title: "Market Survey", desc: "Footfall, density, tenant mix" },
                    { icon: ScanLine, title: "Unit Evaluation", desc: "Frontage, floor, traffic flow" },
                    { icon: ClipboardCheck, title: "Due Diligence", desc: "Lease, charges, track record" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-start">
                      <div className="w-11 h-11 bg-accent/15 rounded-xl flex items-center justify-center mb-3 text-accent">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm md:text-base font-serif font-bold text-white mb-1 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-white/60 text-[11px] md:text-xs leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CTA */}
              <div className="md:col-span-2 md:border-l md:border-white/10 md:pl-12">
                <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6">
                  Found a unit you like? Send us the details and we'll run the full market, unit, and due-diligence review before you sign.
                </p>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 w-full md:w-auto"
                  >
                    Request free evaluation <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where to find mega mall units */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
              Locations with popular mega malls
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "New Cairo",
                desc: "High-end consumer clusters with strong disposable income and premium retail demand.",
                slug: "new-cairo",
                image: "/images/new-cairo.jpg",
              },
              {
                name: "Sheikh Zayed",
                desc: "Luxury-leaning malls with high spend-per-visit and a premium brand environment.",
                slug: "sheikh-zayed",
                image: "/images/Sheikh-zayed.jpg",
              },
              {
                name: "6th October",
                desc: "Large-scale regional hubs serving one of Cairo's largest demographic catchments.",
                slug: "6th-october",
                image: "/images/6thoctober .jpg",
              },
            ].map((loc, i) => (
              <a
                key={i}
                href={
                  LOCATION_CONTENT[loc.slug]
                    ? `/locations/${loc.slug}`
                    : `/listings?type=commercial&subtype=mega-mall&location=${loc.slug}`
                }
                className="group relative h-64 rounded-2xl overflow-hidden block hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <h3 className="text-lg font-serif font-bold text-white">{loc.name}</h3>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed mb-3 line-clamp-2">{loc.desc}</p>
                  <span className="inline-flex items-center text-accent text-xs font-bold uppercase tracking-wider">
                    View Units <ArrowRight className="ml-1.5 w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
