import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  FileCheck,
  Briefcase,
  KeyRound,
  Building2,
  Repeat,
} from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

export default function IncomeGeneratingProperty() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Income Generating Property", url: "/services/income-generating-property" },
        ])}
      />
      <SchemaMarkup
        schema={serviceSchema({
          name: "Income Generating Property in Egypt",
          description:
            "Identify and acquire units that generate consistent rental income across Egypt's most active business districts — yield-first thinking, tenant demand data, and lease structuring.",
          url: "/services/income-generating-property",
          serviceType: "Income Generating Real Estate Advisory",
        })}
      />
      <Navbar />

      {/* Section 1 — Hero (centered, faded image, contained so it doesn't bleed into next section) */}
      <section className="relative pt-24 md:pt-32 pb-8 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/Allegria-Business-Park.jpg"
            alt="Income generating property in Egypt"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover opacity-65"
          />
          {/* Brand-tinted darken layer for added depth and contrast */}
          <div className="absolute inset-0 bg-primary/25" />
          {/* Slightly darker top so the centered text reads cleanly; fades to page bg at the bottom */}
          <div className="absolute inset-0 bg-linear-to-b from-background/15 via-background/55 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-10 text-center">
          <nav className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary">Income Generating Property</span>
          </nav>
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-5 leading-tight max-w-4xl mx-auto">
            Income Generating Property in Egypt
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-10 max-w-2xl mx-auto">
            Identify and acquire units that generate consistent rental income across Egypt's most active business districts.
          </p>
          <Link href="/contact" className="inline-flex">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-14 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105">
              Talk to an Advisor <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 2 — Why choose PLACES (sits directly under hero, covers the image fade) */}
      <section className="relative py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-primary/95 rounded-3xl p-10 md:p-14">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-10">
              Why choose PLACES for income generating property
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Coins, title: "Yield-first thinking", desc: "We evaluate every asset on its income potential — not just its location or price." },
                { icon: TrendingUp, title: "Tenant demand data", desc: "We assess real rental demand in your target area before you commit capital." },
                { icon: ShieldCheck, title: "Asset quality focus", desc: "A well-located unit in a poorly managed building is a liability. We evaluate both." },
                { icon: FileCheck, title: "Lease term expertise", desc: "We structure leases that protect your income — break clauses, escalations, service charges, all reviewed." },
              ].map((item, i) => (
                <div key={i}>
                  <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center mb-4 text-accent">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Our approach */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-4">
              Our approach
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Not all investment properties generate income consistently — tenant demand, lease terms, and asset quality all determine whether a unit performs or sits vacant.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, title: "Tenant demand analysis", desc: "We assess rental demand for your target asset class and location — before you buy." },
              { icon: Coins, title: "Yield assessment", desc: "We calculate realistic net yield based on current rental rates, service charges, and vacancy assumptions." },
              { icon: ShieldCheck, title: "Asset quality", desc: "We evaluate the unit's condition, developer track record, and building management standards." },
              { icon: FileCheck, title: "Lease structuring", desc: "We advise on lease terms, tenant selection, and contract conditions that protect your income long term." },
            ].map((item, i) => (
              <div key={i}>
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-4 text-accent">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Who this service is for */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
              Who this service is for
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Coins,
                title: "Yield-focused investors",
                desc: "You want consistent rental income from a well-located, well-managed asset. We find and evaluate the right units.",
              },
              {
                icon: Briefcase,
                title: "Portfolio builders",
                desc: "You're building a portfolio of income-generating assets. We help you identify, evaluate, and acquire them systematically.",
              },
              {
                icon: KeyRound,
                title: "Passive investors",
                desc: "You want an asset that generates income without requiring active management. We advise on asset quality and lease terms.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-secondary/50 rounded-2xl border-l-4 border-accent p-6 md:p-7">
                <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center text-accent mb-4">
                  <item.icon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-serif font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Explore other services */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
              Explore other services
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: TrendingUp,
                title: "Investment Consultation",
                desc: "Need a broader view? Data-driven advisory for investors evaluating commercial and administrative assets.",
                link: "/services/investment-consultation",
              },
              {
                icon: Building2,
                title: "Primary Property",
                desc: "Acquiring an income asset off-plan? Buy directly from the developer at the best available price and terms.",
                link: "/services/primary-property",
              },
              {
                icon: Repeat,
                title: "Property Resale",
                desc: "Looking at the secondary market? Buy or sell a previously transacted unit with full market context.",
                link: "/services/property-resale",
              },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className="group relative p-8 rounded-2xl bg-primary/[0.03] border border-border/30 hover:bg-primary hover:border-primary transition-all duration-300 overflow-hidden"
              >
                <div className="w-11 h-11 bg-accent/10 rounded-full flex items-center justify-center mb-5 text-accent group-hover:bg-accent/20 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-primary group-hover:text-white mb-2 transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground group-hover:text-white/70 leading-relaxed mb-6 transition-colors">{item.desc}</p>
                <span className="inline-flex items-center text-accent text-sm font-medium group-hover:text-accent transition-colors">
                  Learn more <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Read more — Related FAQs */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
              Common FAQs on Income Generating Property
            </h2>
            <a href="/faqs" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group mt-4 md:mt-0">
              Browse all FAQs <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { title: "Investment & income-generating properties", link: "/faqs/investment-income" },
              { title: "Pricing, value & unit evaluation", link: "/faqs/pricing-value" },
              { title: "Contracts, legal & due diligence", link: "/faqs/contracts-legal" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className="group flex items-center justify-between gap-4 p-5 rounded-xl bg-white border border-border/40 hover:border-accent hover:shadow-md transition-all"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent block mb-1">
                    FAQ Section
                  </span>
                  <h3 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-accent shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — Final CTA */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8 md:py-12 border-t border-border/40">
            <div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-2">
                Looking for consistent rental income?
              </h2>
              <p className="text-muted-foreground text-lg">
                We'll identify the right assets and evaluate them before you commit.
              </p>
            </div>
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-6 md:px-10 h-12 md:h-14 text-base md:text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 shrink-0">
                Book a free consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
