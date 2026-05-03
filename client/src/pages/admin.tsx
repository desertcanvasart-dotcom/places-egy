import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase, type Listing } from "@/lib/supabase";
import { ListingCard } from "@/components/listings/ListingCard";
import { DeveloperStrip } from "@/components/DeveloperStrip";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { LOCATION_CONTENT } from "@/lib/location-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  TrendingUp,
  Briefcase,
  Building,
  ShoppingBag,
  Search,
  ClipboardCheck,
  ScanLine,
  MapPin,
  Users,
  Maximize,
  Wallet,
  Car,
  Globe,
  Sparkles,
} from "lucide-react";

export default function AdminOffices() {
  const { data: adminListings = [] } = useQuery<Listing[]>({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("property_type", "admin")
        .order("id", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Admin Offices", url: "/admin" },
        ])}
      />
      <Navbar />

      {/* Section 1 — Hero */}
      <section className="relative h-[50vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/admin 1.jpg"
            alt="Administrative offices in Cairo"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#111111]/60" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight max-w-3xl">
            Office Space for Rent and Sale in Egypt
          </h1>
          <p className="text-lg md:text-xl text-white font-medium mb-10 max-w-2xl">
            Administrative offices, business parks, and mixed-use developments across Cairo's main business districts. Built for HQs, growing teams, multinationals, and investors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start mb-10">
            <a href="#listings">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-14 text-lg shadow-xl shadow-accent/30 transition-all hover:scale-105">
                Explore Available Offices
              </Button>
            </a>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-medium px-8 h-14 text-lg backdrop-blur-sm bg-white/10">
                Talk to an Advisor
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/90 text-sm font-medium">
            {[
              { icon: Briefcase, label: "Corporate HQs" },
              { icon: TrendingUp, label: "Growing Companies" },
              { icon: Globe, label: "Multinationals" },
              { icon: Sparkles, label: "Professional Services" },
              { icon: Wallet, label: "Investors" },
            ].map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <tag.icon className="w-3.5 h-3.5 text-accent" />
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Choose the right office */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
              Choose the right office for your business
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              The right format depends on how your team works, who walks in, and how fast you're growing.
            </p>
          </div>

          {/* Three format cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Briefcase, title: "Business Buildings", tagline: "Standalone offices, premium addresses", link: "/admin/business-building", image: "/images/admin 1.jpg" },
              { icon: Building, title: "Business Parks", tagline: "Campus-scale, parking, room to grow", link: "/admin/business-park", image: "/images/business-park.jpg" },
              { icon: ShoppingBag, title: "Mixed-Use Malls", tagline: "Offices above retail and F&B", link: "/admin/mixed-use", image: "/images/mixed-use.jpg" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className="group relative block p-10 rounded-3xl overflow-hidden transition-all duration-300"
              >
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-primary/75 group-hover:bg-primary/65 transition-colors duration-300" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-8 text-accent">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/70 text-sm">{item.tagline}</p>
                </div>
                <ArrowRight className="absolute top-10 right-10 z-10 w-5 h-5 text-white/30 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>

          {/* Decision factors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 border border-border/40 rounded-2xl p-4 md:p-6 shadow-[0_4px_30px_0_rgba(0,0,0,0.04)]">
            {[
              { icon: Users, label: "Your team", desc: "How many people, how they work, hybrid or in-office. The team profile drives everything else." },
              { icon: MapPin, label: "Address & access", desc: "Where clients arrive from, how staff commute. The right address opens doors and shortens commutes." },
              { icon: Maximize, label: "Floor & flexibility", desc: "Plate efficiency and the ability to expand mid-lease. Bigger plates and clean floors save money on day one." },
              { icon: Car, label: "Parking & amenities", desc: "Parking ratio per sqm, F&B and services on site. Parking-tight buildings cost you talent and time." },
              { icon: Wallet, label: "Total occupancy cost", desc: "Rent, service charges, fit-out, parking allocations. The headline rent is rarely the full picture." },
            ].map((factor, i) => (
              <div key={i} className="group flex flex-col items-center text-center px-2 py-4 rounded-xl hover:bg-white/60 transition-colors duration-200">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-3 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-200">
                  <factor.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-primary mb-1">{factor.label}</span>
                <p className="text-xs text-muted-foreground leading-relaxed md:max-h-0 md:overflow-hidden md:opacity-0 md:group-hover:max-h-24 md:group-hover:opacity-100 md:transition-all md:duration-300">
                  {factor.desc}
                </p>
              </div>
            ))}
          </div>

          <div>
            <Link
              href="/contact"
              className="inline-flex items-center text-accent font-medium hover:text-primary transition-colors"
            >
              Not sure which format fits? Talk to an advisor <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Explore available offices */}
      <section id="listings" className="py-10 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Explore available offices
            </h2>
            <Link href="/listings?type=admin" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group mt-4 md:mt-0">
              Browse all office listings <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {adminListings.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {adminListings.slice(0, 3).map((listing) => (
                <ListingCard key={listing.id} listing={listing} compact />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8">No office listings available yet.</p>
          )}
          <div className="mt-8 md:hidden">
            <Link href="/listings?type=admin">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                Browse all office listings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Developer logos */}
      <DeveloperStrip />

      {/* How PLACES helps */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              How PLACES helps
            </h2>
          </div>

          {/* Timeline: 3 numbered circles connected by a horizontal line on desktop */}
          <div className="relative">
            {/* Horizontal connecting line */}
            <div
              className="hidden md:block absolute top-[26px] left-[26px] right-[26px] h-px bg-border"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
              {[
                { step: "01", icon: Search, title: "Market Survey", desc: "We map what's available across Cairo's office districts and align it with how your business actually works." },
                { step: "02", icon: ClipboardCheck, title: "Due Diligence", desc: "We review the lease, service charges, parking allocation, and licensing — admin vs commercial — before you commit." },
                { step: "03", icon: ScanLine, title: "Unit Evaluation", desc: "We assess the unit: floor plate efficiency, daylight, ceiling height, neighboring tenants, exit clauses." },
              ].map((item, i) => {
                const align =
                  i === 0
                    ? "md:items-start md:text-left"
                    : i === 1
                      ? "md:items-center md:text-center"
                      : "md:items-end md:text-right";
                return (
                  <div key={i} className={`flex flex-col items-start ${align}`}>
                    <div className="relative z-10 w-[52px] h-[52px] bg-primary rounded-full flex items-center justify-center mb-5 text-white font-serif font-bold text-base">
                      {item.step}
                    </div>
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4 text-accent">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-primary mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px]">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Office locations across Cairo */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
              Office locations across Cairo
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Cairo's office market is concentrated in five strategic districts. Each one fits different types of businesses, budgets, and growth stages.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {
                name: "New Cairo",
                tagline: "Egypt's premier business hub — 73% of all office stock",
                image: "/images/new-cairo.jpg",
                slug: "new-cairo",
              },
              {
                name: "Sheikh Zayed",
                tagline: "West Cairo's growing corporate cluster",
                image: "/images/Sheikh-zayed.jpg",
                slug: "sheikh-zayed",
              },
              {
                name: "6th October",
                tagline: "The affordable alternative",
                image: "/images/6thoctober .jpg",
                slug: "6th-october",
              },
              {
                name: "Downtown Cairo",
                tagline: "The heritage business core",
                image: "/images/downtown-cairo.jpg",
                slug: "downtown-cairo",
              },
            ].map((loc) => (
              <a
                key={loc.name}
                href={
                  LOCATION_CONTENT[loc.slug]
                    ? `/locations/${loc.slug}`
                    : `/listings?type=admin&location=${loc.slug}`
                }
                className="group relative h-56 rounded-2xl overflow-hidden block hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                    <h3 className="text-base font-serif font-bold text-white leading-tight">{loc.name}</h3>
                  </div>
                  <p className="text-[11px] font-medium text-accent">{loc.tagline}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-8">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                What's the difference between administrative and commercial licensing in Egypt?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                An administrative license is for office-based work — services, consulting, finance, legal, tech, back-office. A commercial license covers retail, F&B, and trading. The license type is tied to the unit, not just your business — meaning if you sign an office without administrative licensing, you can't operate legally even if your business is admin-only. Always confirm the unit's licensing before you sign.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                How do I choose between a business building, a business park, and a mixed-use mall?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                It comes down to three questions. Does your address matter to clients? If yes, business building. Do you need scale and parking for a big team? Business park. Is on-site F&B and amenities part of how you hire? Mixed-use. PLACES walks you through this in the first conversation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                What developers does PLACES work with for office properties?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                We work with most major developers in Cairo — SODIC, EMAAR, Mivida, Palm Hills, Hyde Park, MARAKEZ, Misr Italia, and others. We're not tied to any single developer, which means our recommendations come from your needs, not a portfolio we have to push.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                Does PLACES help with both buying and leasing offices?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Yes — both. Most companies lease their first office and buy later as they stabilize. Investors usually buy from day one. We help with both, including installment-plan offices from developers, where payment can stretch from 4 to 8 years.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                What should I check before signing an office lease in Egypt?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Five things, in order: (1) the licensing — administrative vs commercial, (2) total cost — rent plus service charges plus parking allocation, (3) parking ratio per sqm relative to your team size, (4) fit-out rules and what the landlord covers, (5) exit clauses. PLACES handles this review for you on every unit before you sign.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                How is PLACES different from a regular broker?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Most brokers show you what they have. We start by understanding how your business works — team size, growth plan, client profile, budget — and then map the market against that. We're advisors first, listing agents second. The unit comes after the strategy.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-center">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Speak with PLACES
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Not ready to browse? Discuss your office requirements with an advisor.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-10 h-14 text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105"
              >
                Talk to an Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
