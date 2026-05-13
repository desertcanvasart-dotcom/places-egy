import { Link } from "wouter";
import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { supabase, type Listing } from "@/lib/supabase";
import { ArrowRight, MapPin, Building2, ChevronRight, Building, ShoppingBag, Briefcase, Scale, Landmark, Sparkles, TrendingUp, AlertTriangle, Maximize, ClipboardCheck, FileText } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { listingUrl } from "@/lib/listings";
import { getProjectsByType } from "@/lib/projects";

// Projects grid — sourced from the centralized project list. Any project
// anywhere in the app tagged `type: "business-building"` will appear here automatically.
const businessBuildingProjects = getProjectsByType("business-building");

export default function BusinessBuilding() {
  // Individual listings from Supabase for the "Top units available now" section below —
  // stays Supabase-driven so new listings auto-appear.
  const { data: businessBuildingListings = [] } = useQuery<Listing[]>({
    queryKey: ["business-building-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("subtype", "business-building")
        .order("id", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const topBusinessBuildingListings = businessBuildingListings;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Admin", url: "/admin/business-building" },
          { name: "Business Buildings", url: "/admin/business-building" },
        ])}
      />
      {topBusinessBuildingListings.length > 0 && (
        <SchemaMarkup
          schema={itemListSchema({
            name: "Business Building Listings",
            url: "/admin/business-building",
            items: topBusinessBuildingListings.slice(0, 30).map((l) => ({ name: l.title, url: listingUrl(l) })),
          })}
        />
      )}
      <Navbar />

      {/* Section 1 — Hero */}
      <section className="relative min-h-[40vh] md:min-h-[55vh] pt-28 md:pt-32 pb-14 md:pb-20 overflow-hidden flex flex-col justify-between gap-8">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Mivida-Linea.webp"
            alt="Business Building"
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
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Business Buildings</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Office Space for Rent and Sale in Egypt's Business Buildings
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-2xl">
            Standalone administrative buildings in Cairo's main business districts. Built for HQs, regional offices, law firms, and any company where the address is part of the pitch.
          </p>
          <a href="#business-building-listings">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-12 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105">
              Browse Office Units <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Statement */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="border-l-4 border-accent pl-6 md:pl-8">
            <p className="text-2xl md:text-3xl font-serif font-bold text-primary leading-snug mb-4 max-w-4xl">
              A business building sells your address as much as your space.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
              When a client pulls up to your office, they read the building before they read your business card. The right address opens doors — for hiring, for client meetings, for being taken seriously. The wrong one quietly costs you talent and deals you'll never know you missed.
            </p>
          </div>
        </div>
      </section>

      {/* Top business buildings — dynamic from projects tagged type=business-building */}
      {businessBuildingProjects.length > 0 && (
        <section className="pt-2 pb-12">
          <div className="container mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {businessBuildingProjects.map(({ name, developer, location, image }, i) => (
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
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
              { icon: Briefcase, text: "Corporate HQs and regional offices that need a serious address for clients, partners, and staff" },
              { icon: Scale, text: "Law firms, accountants, and consultants who meet clients on-site every week" },
              { icon: Landmark, text: "Banks, financial services, and insurance where credibility is part of the product" },
              { icon: Sparkles, text: "Tech and media companies competing for talent — younger staff care where they go to work every day" },
              { icon: TrendingUp, text: "Growing SMEs ready to upgrade from a shared space or home office to a real address" },
            ];
            const beforeCommit = [
              "Rent per sqm is higher than business parks for the same space — you're paying for the location",
              "Parking is tight in most buildings. Sort out staff and visitor allocation before you sign.",
              "Service charges and maintenance fees can add 20–30% on top of rent. Read the fine print.",
              "Floor plates are usually fixed. If you grow fast, you'll outgrow your floor before your lease ends.",
            ];
            return (
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-12 items-start">
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Who business buildings work for</h3>
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Before you sign</h3>
                {worksFor.map((item, i) => (
                  <Fragment key={i}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-primary/5 rounded-full flex items-center justify-center shrink-0 text-primary">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{item.text}</p>
                    </div>
                    {beforeCommit[i] ? (
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-accent/5 rounded-full flex items-center justify-center shrink-0 text-accent">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{beforeCommit[i]}</p>
                      </div>
                    ) : (
                      <div />
                    )}
                  </Fragment>
                ))}
              </div>
            );
          })()}

          <div className="mt-10 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground mb-4">Looking at other formats? Compare:</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Link
                href="/admin/business-park"
                className="group flex items-center gap-4 bg-white rounded-xl border border-border/40 border-l-4 border-l-accent px-5 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">
                    Admin
                  </span>
                  <span className="block text-base font-serif font-bold text-primary">
                    Business Parks
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
              <Link
                href="/admin/mixed-use"
                className="group flex items-center gap-4 bg-white rounded-xl border border-border/40 border-l-4 border-l-accent px-5 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">
                    Admin
                  </span>
                  <span className="block text-base font-serif font-bold text-primary">
                    Mixed Use
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            </div>
            <Link href="/admin" className="inline-flex items-center text-sm font-medium text-accent hover:text-primary transition-colors">
              View all admin spaces <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4 — Top office units */}
      {topBusinessBuildingListings.length > 0 && (
      <section id="business-building-listings" className="py-12 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Top office units available now
            </h2>
            <Link href="/listings" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group mt-4 md:mt-0">
              Browse all <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {topBusinessBuildingListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {topBusinessBuildingListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} compact hideSubtype />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8">No office listings available yet.</p>
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

      {/* How PLACES checks every office */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="relative bg-primary rounded-3xl overflow-hidden p-8 md:p-14">
            {/* Subtle accent glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

            <div className="relative z-10 grid md:grid-cols-5 gap-10 md:gap-12 items-center">
              {/* Left: steps */}
              <div className="md:col-span-3">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8 leading-snug">
                  How we check every office before you sign
                </h2>
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  {[
                    { icon: MapPin, title: "Location Review", desc: "The street, the neighbors, who else has offices in the building, how clients arrive" },
                    { icon: Maximize, title: "Floor Assessment", desc: "Plate efficiency, layout, daylight, ceiling height, fit for your team" },
                    { icon: FileText, title: "Lease & Service Charges", desc: "What's included, what's extra, parking, fit-out rules, exit clauses" },
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
                  Found an office you're interested in? Send it over. We'll review the location, the floor, and the full lease terms before you sign.
                </p>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 w-full md:w-auto"
                  >
                    Get a Free Unit Evaluation <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where Cairo's business districts are */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
              Where Cairo's business districts are
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: "New Cairo (5th Settlement)",
                desc: "The strongest concentration of corporate offices in Egypt. The 90th Street spine — both Northern and Southern — is where most multinationals, banks, and large law firms have settled. Premium addresses, full administrative licensing, walking distance to amenities.",
                slug: "new-cairo",
                image: "/images/new-cairo.jpg",
              },
              {
                name: "Sheikh Zayed",
                desc: "A growing corporate cluster, especially along the 26th of July Corridor. Strong appeal for tech, media, and professional services teams who want a quieter base than New Cairo without giving up address quality.",
                slug: "sheikh-zayed",
                image: "/images/Sheikh-zayed.jpg",
              },
              {
                name: "Downtown Cairo",
                desc: "The heritage business core. Older buildings, central access, strong base of legal, financial, and government-adjacent tenants. Ideal if your clients are in ministries, courts, or banking.",
                slug: "downtown-cairo",
                image: "/images/downtown-cairo.jpg",
              },
              {
                name: "6th October",
                desc: "A growing business district anchored by manufacturing, logistics, and an expanding office stock. Pricing remains lower than New Cairo or Sheikh Zayed, making it an attractive base for companies prioritizing value and connectivity to the wider west-Cairo corridor.",
                slug: "6th-october",
                image: "/images/6thoctober .jpg",
              },
            ].map((loc, i) => (
              <a
                key={i}
                href={`/listings?type=admin&subtype=business-building&location=${loc.slug}`}
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
