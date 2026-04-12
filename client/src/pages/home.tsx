import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { CountUp } from "@/components/ui/count-up";
import { ServicesExplorer } from "@/components/ServicesExplorer";
import { ArrowRight, Building2, TrendingUp, Handshake, ClipboardList, BarChart3, ShieldCheck, CheckCircle2, MapPin, Maximize2, Store, Repeat, Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase, type Listing } from "@/lib/supabase";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Home() {
  const { data: listings = [] } = useQuery<Listing[]>({
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

  return (
    <div className="min-h-screen font-sans flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[92vh] min-h-[640px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/hero-section.jpg"
            alt="Modern Office Building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#111111]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#F5F0EA]/15 mix-blend-overlay" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight text-white">
              Elevate Your <span className="text-accent italic">Business</span> Space
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-normal">
              The premier marketplace for buying, renting, and reselling administrative offices in Egypt's most prestigious locations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/listings">
                <Button size="lg" className="bg-accent text-white hover:bg-accent/90 font-bold px-8 h-14 text-lg shadow-xl shadow-accent/30 transition-all hover:scale-105">
                  Find an Office
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-medium px-8 h-14 text-lg backdrop-blur-sm bg-white/10">
                  Talk to Us
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/40 z-10">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
        </div>
      </section>

      {/* Stats Trust Bar */}
      <FadeInSection>
        <section className="pt-12 pb-10 -mt-32 relative z-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 border border-border/40 p-7 md:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-7 text-center">
                <div>
                  <p className="text-4xl md:text-[2.75rem] font-serif font-bold text-primary hover:text-accent transition-colors cursor-default mb-1">
                    <CountUp end={300} duration={3500} suffix="+" />
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Developers</p>
                </div>
                <div>
                  <p className="text-4xl md:text-[2.75rem] font-serif font-bold text-primary hover:text-accent transition-colors cursor-default mb-1">
                    <CountUp end={1000} duration={3500} suffix="+" />
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Listings</p>
                </div>
                <div>
                  <p className="text-4xl md:text-[2.75rem] font-serif font-bold text-primary hover:text-accent transition-colors cursor-default mb-1">
                    <CountUp end={10} duration={3500} />
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Key Locations</p>
                </div>
                <div>
                  <p className="text-4xl md:text-[2.75rem] font-serif font-bold text-primary hover:text-accent transition-colors cursor-default mb-1">
                    <CountUp end={500} duration={3500} suffix="+" />
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Businesses</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Property Types Section */}
      <FadeInSection>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Discover Our Properties</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Specialized real estate solutions designed for your success.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/admin-offices/business-building" className="group relative h-[420px] rounded-2xl overflow-hidden cursor-pointer block shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <img src="/src/assets/images/admin 1.jpg" alt="Admin Offices" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-primary/70 transition-colors duration-500 group-hover:bg-primary/60" />

                <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                  <div className="mb-4 w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transform transition-transform duration-300 group-hover:-translate-y-2">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-white mb-3">Admin Offices</h3>
                  <p className="text-white/85 text-lg mb-6 max-w-md">
                    Premium workspaces including business parks, standalone buildings, and mixed-use developments.
                  </p>
                  <span className="inline-flex items-center text-white font-bold uppercase tracking-wider text-sm group-hover:text-accent transition-colors">
                    View Admin Properties <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>

              <Link href="/commercial" className="group relative h-[420px] rounded-2xl overflow-hidden cursor-pointer block shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <img src="/src/assets/images/commercial.jpg" alt="Commercial Properties" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-primary/70 transition-colors duration-500 group-hover:bg-primary/60" />

                <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                  <div className="mb-4 w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transform transition-transform duration-300 group-hover:-translate-y-2">
                    <Store className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-white mb-3">Commercial</h3>
                  <p className="text-white/85 text-lg mb-6 max-w-md">
                    High-potential retail spaces in mega malls, strip malls, and drive-through locations.
                  </p>
                  <span className="inline-flex items-center text-white font-bold uppercase tracking-wider text-sm group-hover:text-accent transition-colors">
                    View Commercial Properties <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Services */}
      <FadeInSection>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Comprehensive Real Estate Services</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">End-to-end solutions for all your administrative real estate needs.</p>
            </div>

            <ServicesExplorer />
          </div>
        </section>
      </FadeInSection>

      {/* Developer Logo Strip */}
      <FadeInSection>
        <section className="py-10">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-10">
              Trusted Developer Partners
            </h3>
            <div className="flex flex-nowrap justify-center items-center gap-4 md:gap-8 overflow-x-auto">
              {[
                { name: "SODIC", logo: "/src/assets/images/SODIC_Logo.png" },
                { name: "Emaar", logo: "/src/assets/images/Emaar_logo.png" },
                { name: "Marakez", logo: "/src/assets/images/Marakez _logo.png" },
                { name: "Al Futtaim", logo: "/src/assets/images/Al futtaim _ logo.png" },
                { name: "Misr Italia", logo: "/src/assets/images/Misritalia_logoo.png" },
                { name: "Palm Hills", logo: "/src/assets/images/PalmHills_logo.png" },
              ].map((dev) => (
                <Link
                  key={dev.name}
                  href={`/developers/${dev.name.toLowerCase().replace(" ", "-")}`}
                  className="group flex items-center justify-center w-32 h-20 shrink-0"
                >
                  <img
                    src={dev.logo}
                    alt={dev.name}
                    className="max-h-full max-w-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Locations Preview */}
      <FadeInSection>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">Prime Locations</h2>
                <p className="text-muted-foreground text-lg">Discover offices in Egypt's most sought-after business districts.</p>
              </div>
              <Link href="/locations">
                <Button variant="ghost" className="hidden md:flex">View All Locations <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="group relative h-[420px] rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <img src="/src/assets/images/new-cairo.webp" alt="New Cairo" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-3xl font-serif text-white font-bold mb-2">New Cairo</h3>
                  <p className="text-gray-300 mb-4">The new heart of business with premium administrative hubs.</p>
                  <span className="text-accent text-sm font-bold uppercase tracking-wider flex items-center gap-2">Explore <ArrowRight className="w-4 h-4" /></span>
                </div>
              </div>

              <div className="grid grid-rows-2 gap-6">
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                  <img src="/src/assets/images/Sheikh-zayed.jpg" alt="Sheikh Zayed" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-serif text-white font-bold">Sheikh Zayed</h3>
                  </div>
                </div>
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                  <img src="/src/assets/images/downtown-cairo.jpg" alt="Downtown Cairo" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-serif text-white font-bold">Downtown Cairo</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* How It Works */}
      <FadeInSection>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-primary text-white rounded-3xl p-12 md:p-20 shadow-xl shadow-primary/10">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-accent mb-4">Our Process</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">More Than Just Listings</h2>
                <p className="text-white/70 text-lg">
                  We go beyond the search to ensure your business finds its perfect home.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { icon: ClipboardList, title: "Understand", desc: "We start by understanding your business needs and operational requirements." },
                  { icon: BarChart3, title: "Analyze", desc: "We conduct comprehensive market surveys to identify the best opportunities." },
                  { icon: ShieldCheck, title: "Advise", desc: "Our experts provide objective, transparent recommendations." },
                  { icon: CheckCircle2, title: "Execute", desc: "We manage the entire transaction process for a seamless acquisition." }
                ].map((step, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mb-6 text-accent">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 font-serif text-white">{step.title}</h3>
                    <p className="text-white/75 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Curated Opportunities */}
      <FadeInSection>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-3">Curated Opportunities</h2>
                <p className="text-muted-foreground text-lg max-w-xl">Explore our handpicked selection of premium administrative spaces.</p>
              </div>
              <Link href="/listings" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group">
                View all listings <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {listings.slice(0, 3).map((listing) => (
                <Link key={listing.id} href={`/listings`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm shadow-primary/5 border border-border/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={listing.images?.[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {formatLabel(listing.transaction_type)}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-accent text-xs font-bold uppercase tracking-widest">{formatLabel(listing.developer)}</span>
                      <span className="text-muted-foreground text-sm">{formatLabel(listing.subtype)}</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-primary mb-3 line-clamp-1 group-hover:text-accent transition-colors">{listing.title}</h3>

                    <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {formatLabel(listing.location)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 className="w-4 h-4" />
                        {listing.area_sqm} m²
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/40 flex justify-between items-center">
                      <span className="text-primary font-bold text-lg">
                        {listing.transaction_type === 'Rent'
                          ? `${listing.price?.toLocaleString()} EGP/mo`
                          : `${listing.price?.toLocaleString()} EGP`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center md:hidden">
              <Link href="/listings">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                  View all listings
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* FAQ */}
      <FadeInSection>
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground text-lg">Find answers to common questions about buying, renting, and investing in offices across Egypt.</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-border/40">
                <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline text-left">
                  What types of administrative offices do you list?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  We specialize in three main types of administrative properties: Standalone Business Buildings for corporate headquarters, units within comprehensive Business Parks, and flexible offices in Mixed-Use developments that combine commercial and administrative spaces.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-border/40">
                <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline text-left">
                  Which locations do you cover in Egypt?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  Our primary focus is on Egypt's key business districts: New Cairo, Sheikh Zayed, 6th October, Maadi, Downtown Cairo, and Heliopolis.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-border/40">
                <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline text-left">
                  Do you offer consultation for real estate investments?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  Yes, our Investment Consultation service is designed to help you make informed decisions. We provide market analysis, ROI projections, and portfolio strategy.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b border-border/40">
                <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline text-left">
                  Can I list my property for resale on PLACES?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  Absolutely. Our Primary Resale service connects sellers with a network of serious buyers. We handle the valuation, marketing, and negotiation processes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline text-left">
                  Who are the developers you partner with?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  We partner with Egypt's top-tier developers including SODIC, Emaar Misr, Al Futtaim Group, The Waterway, and other leading names.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </FadeInSection>

      {/* Final CTA */}
      <FadeInSection>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 border border-border/40 p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">Need personalized guidance?</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Our team is ready to listen to your requirements and offer tailored advice for your business. No pressure, just expert support.
              </p>
              <Link href="/contact">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 h-14 text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105">
                  Talk to an Advisor
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

      <Footer />
    </div>
  );
}
