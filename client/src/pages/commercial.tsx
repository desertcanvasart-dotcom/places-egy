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
  Store,
  ShoppingBag,
  Car,
  Search,
  ClipboardCheck,
  ScanLine,
  MapPin,
  Users,
  Eye,
  Ruler,
  Wallet,
  Footprints,
  UtensilsCrossed,
  Stethoscope,
  Copy,
} from "lucide-react";

export default function Commercial() {
  const { data: commercialListings = [] } = useQuery<Listing[]>({
    queryKey: ["commercial-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("property_type", "commercial")
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
          { name: "Commercial", url: "/commercial" },
        ])}
      />
      <Navbar />

      {/* Section 1 — Hero */}
      <section className="relative h-[50vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/commercial.jpg"
            alt="Commercial real estate"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#111111]/60" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight max-w-3xl">
            Commercial Spaces in Egypt
          </h1>
          <p className="text-lg md:text-xl text-white font-medium mb-10 max-w-2xl">
            Retail and commercial units across Cairo's most active business districts for brands, operators and investors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start mb-10">
            <a href="#listings">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-14 text-lg shadow-xl shadow-accent/30 transition-all hover:scale-105">
                Explore Available Units
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
              { icon: Store, label: "Retail Brands" },
              { icon: UtensilsCrossed, label: "F&B Operators" },
              { icon: Stethoscope, label: "Service Providers" },
              { icon: Copy, label: "Franchise Operators" },
              { icon: TrendingUp, label: "Investors" },
            ].map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <tag.icon className="w-3.5 h-3.5 text-accent" />
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Choose the right format */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
              Choose the right space for your business
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              The right format depends on how your business works.
            </p>
          </div>

          {/* Three format cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: ShoppingBag, title: "Mega Malls", tagline: "Anchor-tenant scale", link: "/commercial/mega-mall", image: "/images/mega-mall.jpg" },
              { icon: Store, title: "Strip Malls", tagline: "Neighborhood-led demand", link: "/commercial/strip-mall", image: "/images/strip-mall.jpg" },
              { icon: Car, title: "Drive-Through", tagline: "Access-first convenience", link: "/commercial/drive-through", image: "/images/drive-through.jpg" },
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
              { icon: Users, label: "Your customer", desc: "Who walks in and why? Pick a space that matches how your customers actually find and reach you." },
              { icon: Footprints, label: "Footfall & demand", desc: "More traffic means more exposure — and higher rent. Make sure your margins support it." },
              { icon: Eye, label: "Visibility & access", desc: "Frontage, parking, and entry flow aren't details. They directly affect how many people walk in." },
              { icon: Ruler, label: "Operational fit", desc: "The space needs to work front and back. Layout and logistics matter as much as location." },
              { icon: Wallet, label: "Investment lens", desc: "Commercial can outperform residential — but only when you evaluate tenant terms, vacancy risk, and capital appreciation together." },
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

      {/* Explore available commercial units */}
      <section id="listings" className="py-10 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Explore available commercial units
            </h2>
            <Link href="/listings" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group mt-4 md:mt-0">
              Browse all listings <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {commercialListings.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {commercialListings.slice(0, 3).map((listing) => (
                <ListingCard key={listing.id} listing={listing} compact />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8">No commercial listings available yet.</p>
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
            {/* Horizontal connecting line — full container width, from center of 1st dot to center of 3rd dot */}
            <div
              className="hidden md:block absolute top-[26px] left-[26px] right-[26px] h-px bg-border"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
              {[
                { step: "01", icon: Search, title: "Market Survey", desc: "We map what's available and what aligns with your model." },
                { step: "02", icon: ClipboardCheck, title: "Due Diligence", desc: "We evaluate legal, transactional, and operational fit." },
                { step: "03", icon: ScanLine, title: "Unit Evaluation", desc: "We assess the specific unit against your requirements." },
              ].map((item, i) => {
                // Distribute the 3 dots across the full container width: first
                // at the left, second centered in its column, third at the right.
                const align =
                  i === 0
                    ? "md:items-start md:text-left"
                    : i === 1
                      ? "md:items-center md:text-center"
                      : "md:items-end md:text-right";
                return (
                  <div key={i} className={`flex flex-col items-start ${align}`}>
                    {/* Numbered circle (timeline marker — solid bg hides line beneath) */}
                    <div className="relative z-10 w-[52px] h-[52px] bg-primary rounded-full flex items-center justify-center mb-5 text-white font-serif font-bold text-base">
                      {item.step}
                    </div>
                    {/* Icon */}
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4 text-accent">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-primary mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 — Locations (photo cards) */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
              Commercial areas by location
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore commercial opportunities across Egypt's most strategic districts.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { name: "New Cairo", desc: "Premium retail destinations", image: "/images/new-cairo.jpg", slug: "new-cairo" },
              { name: "Sheikh Zayed", desc: "High-end strip malls", image: "/images/Sheikh-zayed.jpg", slug: "sheikh-zayed" },
              { name: "6th October", desc: "Growing commercial hub", image: "/images/6thoctober .jpg", slug: "6th-october" },
              { name: "Downtown Cairo", desc: "Heritage commercial core", image: "/images/downtown-cairo.jpg", slug: "downtown-cairo" },
              { name: "Sheraton", desc: "Strategic commercial corridor", image: "/images/sheraton.jpg", slug: "sheraton" },
              { name: "Maadi", desc: "Established neighborhood retail", image: "/images/Maadi.jpg", slug: "maadi" },
            ].map((loc) => (
              <a
                key={loc.name}
                href={
                  LOCATION_CONTENT[loc.slug]
                    ? `/locations/${loc.slug}`
                    : `/listings?type=commercial&location=${loc.slug}`
                }
                className="group relative h-48 rounded-2xl overflow-hidden block hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                    <h3 className="text-lg font-serif font-bold text-white">{loc.name}</h3>
                  </div>
                  <p className="text-xs text-white/75 group-hover:text-accent transition-colors">
                    {loc.desc}
                  </p>
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
                What's the difference between a mega mall and a strip mall in Egypt?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Mega malls are large-scale shopping destinations that rely on anchor tenants and high daily footfall. Strip malls are smaller, open-front retail centers that serve neighborhood or district-level demand. The right choice depends on your concept, your target customer, and your unit economics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                How do I choose the right commercial format for my business?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Start with how your customers behave — do they plan to visit you or discover you by passing by? Then evaluate footfall, rent levels, operational complexity, and infrastructure. PLACES can help you work through these factors before you commit to anything.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                What developers does PLACES work with for commercial properties?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                PLACES works with Egypt's most active commercial developers including MARAKEZ, AL FUTTAIM, The Waterway, and Palm Hills. We know these projects inside out — which gives you better access and fewer surprises.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                Does PLACES help with both buying and leasing commercial units?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Yes. PLACES assists with leasing, primary property purchases, resale transactions, and investment acquisitions across commercial real estate in Egypt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                How is PLACES different from a regular broker?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                A broker shows you what's available. PLACES surveys the market, evaluates your options, and advises before you commit — so your decision is informed, not just convenient.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Section 11 — Final CTA (dark block, not white card) */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-center">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Speak with PLACES
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Not ready to browse? Discuss your requirements with an advisor.
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
