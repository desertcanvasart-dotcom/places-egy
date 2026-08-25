import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import {
  getProjectsByDeveloper,
  PROJECT_TYPE_LABELS,
  type ProjectType,
} from "@/lib/projects";

// Shared template for /developers/[slug] pages. All existing developer
// pages (akoya, emaar, sodic, etc.) are hand-authored ~300-line files
// because each has bespoke marketing copy. This template covers the
// STANDARD case — new developers that don't yet have long-form copy
// authored — so a page still ships with the same visual/structural
// pattern (hero, at-a-glance facts, projects grid, related devs,
// enquire CTA) without duplicating 300 lines per file.
//
// A new developer needs:
//   1. Entry in DEVELOPER_OPTIONS (client/src/lib/enums.ts)
//   2. Entry in DEVELOPER_DISPLAY_NAMES + PROJECTS array (client/src/lib/projects.ts)
//   3. Route registration in client/src/App.tsx
//   4. New page file that renders <DeveloperPage {...config} />
//   5. Optional logo file in client/public/images/

export type RelatedDeveloper = {
  name: string;
  slug: string;
  logo?: string;
};

export type DeveloperPageConfig = {
  /** URL slug — must match the developer field on projects + the route path. */
  slug: string;
  /** Full display name shown in H1 and breadcrumbs. */
  name: string;
  /** Hero image URL from client/public/images/. Fallback used if missing. */
  heroImage?: string;
  /** Optional square/wordmark logo URL for schema.org Organization JSON-LD. */
  logo?: string;
  /** Foundation year for Organization schema (optional). */
  foundingDate?: string;
  /** One-paragraph elevator pitch — shown under H1 and as meta description. */
  tagline: string;
  /** Section 2 headline — the ONE thing this developer is known for. */
  aboutHeadline: string;
  /** Short bullet list rendered in the "At a glance" box. */
  factBullets: string[];
  /** Two paragraphs of long-form body copy, side-by-side on desktop. */
  bodyParagraphs: [string, string];
  /** 3–6 related developer suggestions shown at the bottom. */
  related: RelatedDeveloper[];
  /** Custom copy for the bottom enquire CTA. Optional — sensible default. */
  enquireCopy?: {
    headline?: string;
    body?: string;
  };
};

const DEFAULT_HERO = "/images/offices-hero.jpg";

export function DeveloperPage({ config }: { config: DeveloperPageConfig }) {
  const PROJECTS = useMemo(
    () => getProjectsByDeveloper(config.slug),
    [config.slug],
  );

  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [PROJECTS],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.name,
    url: `https://places-egy.com/developers/${config.slug}`,
    ...(config.logo && { logo: `https://places-egy.com${config.logo}` }),
    ...(config.foundingDate && { foundingDate: config.foundingDate }),
    address: {
      "@type": "PostalAddress",
      addressCountry: "EG",
      addressLocality: "Cairo",
    },
    description: config.tagline,
  };

  useDocumentMeta({
    title: `${config.name} Projects & Offices in Egypt | PLACES`,
    description: config.tagline,
    url: orgSchema.url,
    image: config.logo,
  });

  const hero = config.heroImage ?? DEFAULT_HERO;
  const enquireHeadline =
    config.enquireCopy?.headline ??
    `Looking for office space in a ${config.name} project?`;
  const enquireBody =
    config.enquireCopy?.body ??
    `Talk to a PLACES advisor about current availability across ${config.name}'s portfolio — and which project fits your business or investment requirements.`;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: config.name, url: `/developers/${config.slug}` },
        ])}
      />
      <SchemaMarkup schema={orgSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-24 md:pt-32 pb-10 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src={hero}
            alt={`${config.name} — projects across Egypt`}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </div>

        <div className="relative z-10 container mx-auto px-5 md:px-10">
          <nav className="flex items-center gap-1.5 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/developers" className="hover:text-white transition-colors">Developers</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white line-clamp-1">{config.name}</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-5 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3 md:mb-4 leading-tight max-w-4xl">
            {config.name}
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-6 md:mb-8 max-w-4xl leading-relaxed">
            {config.tagline}
          </p>
          <a href="#projects">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white font-bold px-6 md:px-8 h-12 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105"
            >
              Browse Projects <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* About */}
      <section className="py-8">
        <div className="container mx-auto px-5 md:px-10">
          <div className="mb-8 md:mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              About the Developer
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-2 leading-snug max-w-4xl">
              {config.aboutHeadline}
            </h2>
          </div>

          {config.factBullets.length > 0 && (
            <div className="bg-secondary/50 rounded-2xl border-l-4 border-accent p-5 md:p-8 mb-8 md:mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                At a glance
              </span>
              <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
                {config.factBullets.map((fact, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-primary/90">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            {config.bodyParagraphs.map((p, i) => (
              <p
                key={i}
                className="text-base md:text-lg text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: p }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-8 scroll-mt-24 bg-secondary/40">
        <div className="container mx-auto px-5 md:px-10">
          <div className="mb-6 md:mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Portfolio
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-2">
              {config.name} Projects
            </h2>
          </div>

          {projectTypes.length > 2 && (
            <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
              {projectTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                    filter === type
                      ? "bg-primary text-white"
                      : "bg-white text-primary border border-border/60 hover:border-primary"
                  }`}
                >
                  {type === "All" ? "All" : PROJECT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}

          {filteredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project, i) => (
                <Link
                  key={i}
                  href={`/listings?developer=${project.developer}`}
                  className="group relative h-72 md:h-80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 block"
                >
                  <img
                    src={project.image}
                    alt={project.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/10" />
                  <div className="relative z-10 h-full flex flex-col justify-between p-5 md:p-6">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white bg-accent px-2.5 py-1 rounded-full shadow-sm">
                        {PROJECT_TYPE_LABELS[project.type]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-white mb-1.5">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-white/80">
                        <MapPin className="w-3.5 h-3.5 text-accent" />
                        {project.location}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Projects coming soon. Talk to PLACES for details.
            </p>
          )}
        </div>
      </section>

      {/* Related Developers */}
      {config.related.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-5 md:px-10">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-6 md:mb-8 text-center md:text-left">
              Explore Other Developers
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 md:gap-x-10 gap-y-5 md:gap-y-6">
              {config.related.map((dev) => (
                <a
                  key={dev.slug}
                  href={`/developers/${dev.slug}`}
                  aria-label={`View ${dev.name}`}
                  className="group flex items-center justify-center h-12 md:h-16 transition-transform hover:scale-105"
                >
                  {dev.logo ? (
                    <img
                      src={dev.logo}
                      alt={`${dev.name} logo`}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-40 object-contain"
                    />
                  ) : (
                    <span className="font-serif text-base md:text-lg font-bold text-primary/70 group-hover:text-accent transition-colors px-3">
                      {dev.name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enquire CTA */}
      <section className="py-8">
        <div className="container mx-auto px-5 md:px-10">
          <div className="bg-primary rounded-3xl p-8 md:p-20 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Find Your Space
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mt-3 mb-4 leading-tight">
              {enquireHeadline}
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              {enquireBody}
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-6 md:px-10 h-12 md:h-14 text-base md:text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105"
              >
                Enquire Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
