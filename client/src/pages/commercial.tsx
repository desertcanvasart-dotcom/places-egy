import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export default function Commercial() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />

      {/* Section 1 — Hero banner */}
      <section className="relative h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/hero-section.jpg"
            alt="Commercial real estate"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-background/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-3xl text-center pt-20">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            What are commercial areas?
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed">
            Commercial areas in Egypt are purpose-built retail and food &amp; beverage destinations
            — from large mega malls to neighborhood strip centers and high-traffic drive-through
            units.
          </p>
        </div>
      </section>

      {/* Section 2 — Built for (compact icon strip, no cards) */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Built for
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, title: "Investors", link: "/services/investment-consultation" },
              { icon: Briefcase, title: "Business Owners", link: "/services/leasing" },
              { icon: Building, title: "Developers", link: "/services/income-generating-property" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className="group flex flex-col items-center text-center px-3 py-5 rounded-xl hover:bg-white/60 transition-all"
              >
                <div className="w-11 h-11 bg-primary/5 rounded-full flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-sm md:text-base font-medium text-primary">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Three formats (large image-backed cards, no white bg) */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">
              The three commercial formats
            </h2>
            <p className="text-muted-foreground text-lg">
              Each format serves a different kind of business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: ShoppingBag, title: "Mega Malls", tagline: "Anchor-tenant scale", link: "/commercial/mega-malls" },
              { icon: Store, title: "Strip Malls", tagline: "Neighborhood-led demand", link: "/commercial/strip-malls" },
              { icon: Car, title: "Drive-Through", tagline: "Access-first convenience", link: "/commercial/drive-through" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className="group relative block bg-primary p-10 rounded-3xl hover:bg-primary/90 transition-all duration-300 overflow-hidden"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-8 text-accent">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.tagline}</p>
                <ArrowRight className="absolute top-10 right-10 w-5 h-5 text-white/30 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — How to choose (icon row, no card wrapper) */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-3">
              How to choose
            </h2>
            <p className="text-muted-foreground text-lg">
              Five factors that determine your best-fit format.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10">
            {[
              { icon: Users, label: "Customer type" },
              { icon: Footprints, label: "Footfall" },
              { icon: Eye, label: "Visibility" },
              { icon: Ruler, label: "Space & size" },
              { icon: Wallet, label: "Cost" },
            ].map((factor, i) => (
              <div key={i} className="group flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mb-3 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  <factor.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-primary">{factor.label}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center text-accent font-medium hover:text-primary transition-colors"
            >
              Not sure which format fits? Talk to an advisor <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5 — Business & Investment (side-by-side text blocks, no card border) */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Business &amp; investment decision
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-border/60 rounded-2xl overflow-hidden">
            <div className="bg-white p-10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-4">
                The Operator Lens
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Wrong format = wrong footfall = wrong revenue. Match your concept and customer flow
                to a format that supports how you actually trade.
              </p>
            </div>
            <div className="bg-white p-10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-4">
                The Investor Lens
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Commercial yields outperform residential — but only when tenant terms, vacancy risk,
                and capital appreciation are evaluated together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — PLACES process (numbered horizontal steps) */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Our process
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-0">
            {[
              { step: "01", icon: Search, title: "Market Survey", desc: "Map what's available and what aligns with your model." },
              { step: "02", icon: ClipboardCheck, title: "Due Diligence", desc: "Evaluate legal, transactional, and operational fit." },
              { step: "03", icon: ScanLine, title: "Unit Evaluation", desc: "Assess the specific unit against your requirements." },
            ].map((item, i) => (
              <div
                key={i}
                className="group flex-1 relative px-8 py-10 md:border-r last:border-r-0 border-border/40"
              >
                <span className="text-6xl font-serif font-bold text-accent/15 absolute top-4 right-6">
                  {item.step}
                </span>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mb-5 text-white">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — Developer logos */}
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

      {/* Section 8 — Locations (photo cards) */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Commercial areas by location
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore commercial opportunities across Egypt's most strategic districts.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { name: "New Cairo", desc: "Premium retail destinations", image: "/src/assets/images/new-cairo.webp" },
              { name: "Sheikh Zayed", desc: "High-end strip malls", image: "/src/assets/images/Sheikh-zayed.jpg" },
              { name: "6th October", desc: "Growing commercial hub", image: "/src/assets/images/6thoctober .jpg" },
              { name: "Maadi", desc: "Established neighborhood retail", image: "/src/assets/images/Maadi.jpg" },
              { name: "Downtown Cairo", desc: "Heritage commercial core", image: "/src/assets/images/downtown-cairo.jpg" },
              { name: "Heliopolis", desc: "Classic urban shopping", image: "/src/assets/images/heliopolis.jpg" },
            ].map((loc) => (
              <Link
                key={loc.name}
                href={`/locations/${loc.name.toLowerCase().replace(" ", "-")}`}
                className="group relative h-48 rounded-2xl overflow-hidden block hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9 — Browse CTA (text only, no card) */}
      <section className="py-10">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            Explore available commercial units
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Browse what's available, when you're ready.
          </p>
          <Link href="/listings">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-10 h-14 text-lg font-medium shadow-lg shadow-primary/20"
            >
              Browse Listings <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 10 — FAQ (no outer card wrapper) */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                What's the difference between a mega mall and a strip mall in Egypt?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Mega malls are large, anchor-tenant driven destinations designed for high
                footfall and brand visibility. Strip malls are smaller, neighborhood-focused
                centers serving daily community demand.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                How do I choose the right commercial format for my business?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Start with your customer behavior — is your business destination-led or
                impulse-led? From there, weigh visibility, footfall, parking access, and unit
                size against the operating costs of each format.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b border-border/40 py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                What developers does PLACES work with for commercial properties?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                We work directly with Egypt's top commercial developers including SODIC, Emaar,
                Marakez, Al Futtaim, and Misr Italia.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="py-1">
              <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                Does PLACES help with both buying and leasing commercial units?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Yes. We support investors looking to acquire income-generating commercial assets
                and operators looking to lease the right space for their concept.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Section 11 — Final CTA (dark block, not white card) */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-center max-w-4xl mx-auto">
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
