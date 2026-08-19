import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { ArrowRight, ArrowLeft, Clock, ChevronRight, MessageCircle } from "lucide-react";
import { nextGuide, type Guide } from "@/lib/guides";
import { trackEvent } from "@/lib/analytics";
import { DeveloperSurveyMagnet } from "@/components/magnets/DeveloperSurveyMagnet";

// Shared layout for every /guides/* page. Handles:
//   - <title>, meta description, canonical, og:*
//   - Article + BreadcrumbList JSON-LD schema
//   - Hero (H1 + read time + published date)
//   - Auto-generated table of contents (from H2s the page renders)
//   - "Read next" CTA at the bottom (rotates through the guides list)
//   - Concierge CTA at the bottom
//
// Per-guide files just export their content between the layout tags. See
// office-rental-prices-cairo-2026.tsx for the canonical example.

type Props = {
  guide: Guide;
  wordCount?: number;
  children: ReactNode;
};

// Auto-generate table of contents by walking the rendered content once mounted,
// finding every <h2> that has an id, and building anchor links. Runs after the
// content mounts so we don't need to hand-maintain a TOC list per guide.
type TocItem = { id: string; text: string };
function useAutoToc(contentRef: React.RefObject<HTMLDivElement | null>): TocItem[] {
  const [items, setItems] = useState<TocItem[]>([]);
  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll<HTMLHeadingElement>("h2[id]");
    const list: TocItem[] = [];
    headings.forEach((h) => {
      list.push({ id: h.id, text: h.textContent?.trim() ?? "" });
    });
    setItems(list);
  }, [contentRef]);
  return items;
}

export function GuideLayout({ guide, wordCount, children }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const toc = useAutoToc(contentRef);
  const next = nextGuide(guide.slug);
  const url = `https://places-egy.com/guides/${guide.slug}`;

  useDocumentMeta({
    title: `${guide.title} | PLACES`,
    description: guide.description,
    url,
    image: guide.imageUrl,
  });

  useEffect(() => {
    trackEvent("guide_view", {
      guide_slug: guide.slug,
      guide_title: guide.title,
      category: guide.category,
    });
  }, [guide.slug, guide.title, guide.category]);

  const published = new Date(guide.publishedAt);
  const updated = new Date(guide.updatedAt);
  const showUpdated = guide.updatedAt !== guide.publishedAt;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SchemaMarkup
        schema={articleSchema({
          headline: guide.title,
          description: guide.description,
          slug: guide.slug,
          datePublished: guide.publishedAt,
          dateModified: guide.updatedAt,
          imageUrl: guide.imageUrl,
          section: guide.category,
          readMinutes: guide.readMinutes,
          wordCount,
        })}
      />
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Guides", url: "/guides" },
          { name: guide.title, url: `/guides/${guide.slug}` },
        ])}
      />

      <Navbar />

      <main className="flex-1 pt-24 md:pt-28 pb-20">
        {/* Breadcrumb — visual + also parsable by AI crawlers as inline text */}
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5"
          >
            <Link href="/" className="hover:text-accent">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/guides" className="hover:text-accent">Guides</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary/60 line-clamp-1">{guide.title}</span>
          </nav>

          <div className="mb-3 inline-flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              {guide.category}
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {guide.readMinutes} min read
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary tracking-tight leading-[1.1] mb-3">
            {guide.title}
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-3">
            {guide.description}
          </p>

          <p className="text-xs text-muted-foreground">
            Published{" "}
            <time dateTime={guide.publishedAt}>
              {published.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </time>
            {showUpdated && (
              <>
                {" "}· Updated{" "}
                <time dateTime={guide.updatedAt}>
                  {updated.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </time>
              </>
            )}
            {" "}by PLACES
          </p>
        </div>

        <hr className="mt-6 mb-8 border-border/30 max-w-4xl mx-auto" />

        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-10">
            {/* Content */}
            <article
              ref={contentRef}
              className="guide-content prose prose-neutral max-w-none prose-headings:font-serif prose-headings:text-primary prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-base prose-p:leading-relaxed prose-p:text-primary/85 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-primary prose-li:text-primary/85 prose-table:text-sm prose-th:bg-primary/5 prose-th:text-primary prose-td:align-top"
            >
              {children}
            </article>

            {/* Sticky TOC on desktop only */}
            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    In this guide
                  </p>
                  <ul className="space-y-2 text-sm border-l border-border/40 pl-4">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="text-primary/70 hover:text-accent transition-colors line-clamp-2"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* Concierge CTA — subtle, in-flow, not a popup */}
        <div className="container mx-auto px-4 md:px-8 max-w-4xl mt-16">
          <div className="bg-primary text-white rounded-2xl p-8 md:p-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent mb-2">
              Talk to PLACES
            </p>
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3 text-white">
              Ready to find your office?
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl leading-relaxed">
              Every situation is different. Share what you're looking for and a PLACES
              advisor will send you a short-list of buildings that fit your budget,
              team size, and timeline.
            </p>
            <Link
              href="/contact"
              onClick={() => trackEvent("guide_cta_click", { guide_slug: guide.slug, cta: "contact" })}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Talk to an advisor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Next guide */}
        <div className="container mx-auto px-4 md:px-8 max-w-4xl mt-10">
          <Link
            href={`/guides/${next.slug}`}
            onClick={() =>
              trackEvent("guide_next_click", {
                from_slug: guide.slug,
                to_slug: next.slug,
              })
            }
            className="group block bg-white border border-border/40 rounded-2xl p-6 hover:border-accent/40 hover:shadow-lg transition-all"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Read next
            </p>
            <p className="font-serif text-xl md:text-2xl font-bold text-primary group-hover:text-accent transition-colors leading-tight">
              {next.title}
            </p>
            <p className="text-sm text-muted-foreground mt-2 inline-flex items-center gap-1">
              {next.readMinutes} min read
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        </div>

        {/* Back to all guides */}
        <div className="container mx-auto px-4 md:px-8 max-w-4xl mt-10">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All PLACES guides
          </Link>
        </div>
      </main>

      <Footer />

      {/* Developer survey popup — bottom-left, 15s delay, session-dismiss.
          Guide-specific magnet, appears only on /guides/* pages. */}
      <DeveloperSurveyMagnet variant="popup" guideSlug={guide.slug} />
    </div>
  );
}
