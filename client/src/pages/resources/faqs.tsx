import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  ChevronRight,
  Search,
  Brain,
  Building2,
  Repeat,
  MapPin,
  Users,
  DollarSign,
  ScrollText,
  Coins,
  Handshake,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import {
  FAQ_SECTIONS,
  FAQ_ALL_ITEMS,
  countQuestionsInSection,
} from "@/lib/faq";

const BASE_URL = "https://places-egy.com";

const SECTION_ICONS: Record<string, LucideIcon> = {
  "early-thinking": Brain,
  "admin-vs-commercial": Building2,
  "rent-buy-resale": Repeat,
  locations: MapPin,
  developers: Users,
  "pricing-value": DollarSign,
  "contracts-legal": ScrollText,
  "investment-income": Coins,
  "advisors-brokers": Handshake,
  "risks-mistakes": ShieldAlert,
};

// CollectionPage JSON-LD — tells Google this is a hub page that contains a
// list of focused FAQ pages. Each entry's `url` deep-links to the section.
const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${BASE_URL}/faqs#collection`,
  name: "FAQs on Egypt's Real Estate Market",
  description:
    "Comprehensive answers to questions about investing in commercial and administrative real estate in Egypt — organized into ten topic areas.",
  url: `${BASE_URL}/faqs`,
  isPartOf: { "@id": `${BASE_URL}/#website` },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: FAQ_SECTIONS.length,
    itemListElement: FAQ_SECTIONS.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/faqs/${s.id}`,
      name: s.title,
    })),
  },
};

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(re);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-accent/20 text-primary rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function fireGtag(name: string, params: Record<string, unknown>) {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
}

export default function FAQIndexPage() {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.toLowerCase().trim();

  // Legacy URL handling: /faqs#question-slug used to land on the
  // single mega-page. Now we map that hash to the right section page.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const item = FAQ_ALL_ITEMS.find((i) => i.slug === hash);
    if (item) {
      window.location.replace(`/faqs/${item.sectionId}#${hash}`);
    }
  }, []);

  // Cross-section search results — every match (question or answer) becomes a
  // preview that deep-links to the right section page with the question slug
  // as the anchor.
  const searchResults = useMemo(() => {
    if (!normalizedSearch) return [];
    return FAQ_ALL_ITEMS.filter(
      (item) =>
        item.q.toLowerCase().includes(normalizedSearch) ||
        item.a.toLowerCase().includes(normalizedSearch),
    ).slice(0, 30); // cap to keep the list scannable
  }, [normalizedSearch]);

  // Debounced GA4 search event.
  useEffect(() => {
    if (!normalizedSearch) return;
    const timer = window.setTimeout(() => {
      fireGtag("search", {
        search_term: normalizedSearch,
        results_count: searchResults.length,
        faq_section: "index",
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [normalizedSearch, searchResults.length]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "FAQs", url: "/faqs" },
        ])}
      />
      <SchemaMarkup schema={collectionSchema} />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-6">
        <div className="container mx-auto px-6 md:px-10">
          <nav className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary">FAQs</span>
          </nav>
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-4 leading-tight">
            FAQs on Egypt's Real Estate Market
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about investing in commercial and administrative real estate in Egypt — organized into ten topic areas covering the full investor journey from early thinking through long-term hold strategy.
          </p>
        </div>
      </section>

      {/* Sticky global search */}
      <div className="sticky top-20 z-30 bg-background/95 backdrop-blur border-b border-border/40">
        <div className="container mx-auto px-6 md:px-10 py-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search across all FAQs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white border-border/60 focus-visible:ring-accent"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 py-10">
        {normalizedSearch ? (
          /* Search-active mode — list cross-section matches, link out to sections */
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-6">
              {searchResults.length === 0
                ? `No questions match "${search}".`
                : `${searchResults.length} question${searchResults.length === 1 ? "" : "s"} match "${search}".`}
            </p>
            <div className="space-y-3">
              {searchResults.map((item) => (
                <Link
                  key={`${item.sectionId}-${item.slug}`}
                  href={`/faqs/${item.sectionId}#${item.slug}`}
                  className="block p-5 rounded-2xl bg-white border border-border/40 hover:border-accent hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                      {item.sectionTitle}
                    </span>
                  </div>
                  <h2 className="text-base font-medium text-primary leading-snug group-hover:text-accent transition-colors">
                    {highlightMatch(item.q, normalizedSearch)}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {highlightMatch(item.a, normalizedSearch)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Default mode — section card grid */
          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-accent mb-3">
              Browse by topic
            </span>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FAQ_SECTIONS.map((section) => {
                const Icon = SECTION_ICONS[section.id] ?? Brain;
                const count = countQuestionsInSection(section);
                return (
                  <Link
                    key={section.id}
                    href={`/faqs/${section.id}`}
                    className="group relative flex flex-col h-full p-7 rounded-2xl bg-white border border-border/40 hover:border-primary hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary/40">
                        {section.number.toString().padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className="text-lg font-serif font-bold text-primary mb-2 leading-snug">
                      {section.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                      {section.intro}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <span className="text-xs text-muted-foreground">
                        {count} question{count === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center text-accent text-sm font-medium group-hover:translate-x-0.5 transition-transform">
                        Browse <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <section className="mt-16">
          <div className="bg-primary rounded-3xl p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              Can't find what you're looking for?
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Book a free 15-minute consultation with a PLACES advisor — we'll answer your specific situation directly.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105"
              >
                Talk to an advisor <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
