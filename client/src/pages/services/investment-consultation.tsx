import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronRight,
  Target,
  BarChart3,
  ClipboardCheck,
  Headphones,
  Scale,
  Handshake,
  ShieldCheck,
  KeyRound,
  TrendingUp,
  Building2,
  Coins,
  Repeat,
} from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

export default function InvestmentConsultation() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Investment Consultation", url: "/services/investment-consultation" },
        ])}
      />
      <SchemaMarkup
        schema={serviceSchema({
          name: "Real Estate Investment Consultation in Egypt",
          description:
            "Data-driven advisory for investors evaluating commercial and administrative assets in Egypt — from portfolio assessment to ongoing post-acquisition support.",
          url: "/services/investment-consultation",
          serviceType: "Real Estate Investment Advisory",
        })}
      />
      <Navbar />

      {/* Section 1 — Hero (centered, faded image, contained so it doesn't bleed into next section) */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/investment-consultation.jpg"
            alt="Real estate investment consultation in Egypt"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover opacity-65"
          />
          {/* Brand-tinted darken layer for added depth and contrast */}
          <div className="absolute inset-0 bg-primary/25" />
          {/* Slightly darker top so the centered text reads cleanly; fades to page bg at the bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/55 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-10 text-center">
          <nav className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary">Investment Consultation</span>
          </nav>
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-5 leading-tight max-w-4xl mx-auto">
            Real Estate Investment Consultation in Egypt
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-10 max-w-2xl mx-auto">
            Data-driven advisory for investors evaluating commercial and administrative assets in Egypt.
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
              Why choose PLACES for investment consultation
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Scale, title: "Objective advisory", desc: "We don't earn commission on what we recommend. Our advice is based on data — not on closing a deal." },
                { icon: BarChart3, title: "Market depth", desc: "We track yield trends, vacancy rates, and capital appreciation across commercial and administrative assets in Egypt." },
                { icon: Handshake, title: "Long-term relationship", desc: "We stay available after your first acquisition — for portfolio reviews and future decisions." },
                { icon: ShieldCheck, title: "We say no", desc: "If a unit doesn't fit your investment thesis, we tell you. We don't push deals that don't make sense." },
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Our approach
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Buying a commercial or administrative unit is a long-term financial decision — the wrong asset in the wrong location can take years to recover from.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Portfolio assessment", desc: "We start by understanding your investment objectives, risk appetite, and target return before recommending anything." },
              { icon: BarChart3, title: "Market analysis", desc: "We analyze yield potential, vacancy rates, capital appreciation trends, and competing supply across your asset class." },
              { icon: ClipboardCheck, title: "Asset evaluation", desc: "We evaluate units against your criteria — developer track record, lease terms, tenant quality, and exit potential." },
              { icon: Headphones, title: "Ongoing advisory", desc: "We stay available after the transaction — for portfolio reviews, lease renewals, and future acquisitions." },
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Who this service is for
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: KeyRound,
                title: "First-time investors",
                desc: "You want to invest in Egyptian real estate but don't know where to start. We give you an honest, structured entry point.",
              },
              {
                icon: TrendingUp,
                title: "Experienced investors",
                desc: "You want a second opinion on a specific asset or market opportunity. We provide objective analysis.",
              },
              {
                icon: Building2,
                title: "Institutional buyers",
                desc: "You're evaluating assets at a portfolio level. We provide market data, asset evaluation, and ongoing advisory.",
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Explore other services
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Coins,
                title: "Income Generating Property",
                desc: "Looking for assets that generate consistent rental income? We identify units with strong tenant demand and sustainable yield.",
                link: "/services/income-generating-property",
              },
              {
                icon: Building2,
                title: "Primary Property",
                desc: "Buy directly from the developer — off-plan and newly launched units across Egypt's most active developments.",
                link: "/services/primary-property",
              },
              {
                icon: Repeat,
                title: "Property Resale",
                desc: "Buy or sell a unit that has already been transacted, with full market context and end-to-end transaction management.",
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Common FAQs on Investment Consultation
            </h2>
            <a href="/faqs" className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group mt-4 md:mt-0">
              Browse all FAQs <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { title: "Early thinking & understanding the decision", link: "/faqs/early-thinking" },
              { title: "Investment & income-generating properties", link: "/faqs/investment-income" },
              { title: "Risks, mistakes & best practices", link: "/faqs/risks-mistakes" },
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 border-t border-border/40">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">
                Not sure where to invest?
              </h2>
              <p className="text-muted-foreground text-lg">
                We'll give you an honest, data-driven view of your options.
              </p>
            </div>
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 h-14 text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 shrink-0">
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
