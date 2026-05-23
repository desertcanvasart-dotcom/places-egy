import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("palm-hills");

const FACT_BULLETS = [
  "Founded in 1997 — listed on the Egyptian Stock Exchange and London Stock Exchange",
  "Portfolio spanning over 29 million sqm — 34+ projects across Egypt",
  "Operations in Egypt, Saudi Arabia, United Kingdom, and Singapore",
  "Three business park developments available through PLACES: Palmet (New Cairo · Middle Ring Road), Palm Hills Business Park (Sheikh Zayed), October Plaza (Sheikh Zayed)",
  "Palmet New Cairo spans 100 acres on the Middle Ring Road — featuring 9 buildings with administrative offices, medical units, and commercial ground floors",
  "One of Egypt's most recognized developer brands for commercial and administrative real estate investment",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
];

const palmHillsOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Palm Hills Developments",
  url: "https://places-egy.com/developers/palm-hills",
  logo: "https://places-egy.com/images/PalmHills_logo.png",
  founder: {
    "@type": "Person",
    name: "Yassin Mansour",
  },
  foundingDate: "1997",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Palm Hills Developments is Egypt's leading integrated real estate developer since 1997 — with one of the largest land banks in the country and a portfolio spanning over 29 million sqm across East Cairo, West Cairo, Alexandria, and the North Coast.",
};

export default function PalmHillsPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Palm Hills Developments", url: "/developers/palm-hills" },
        ])}
      />
      <SchemaMarkup schema={palmHillsOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/palm-hills-business-park.jpg"
            alt="Palm Hills Developments — Palm Hills Business Park in Sheikh Zayed"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <nav className="flex items-center gap-1.5 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/developers" className="hover:text-white transition-colors">Developers</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Palm Hills Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-4xl">
            Palm Hills Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Egypt's leading integrated real estate developer since 1997 — with one of the largest land banks in the country and a portfolio spanning over 29 million sqm across East Cairo, West Cairo, Alexandria, and the North Coast — and three business park developments across New Cairo and Sheikh Zayed available through PLACES.
          </p>
          <a href="#projects">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-12 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105"
            >
              Browse Projects <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* About */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              About the Developer
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-2 leading-snug max-w-4xl">
              Egypt's most established developer — now with business park addresses in New Cairo and Sheikh Zayed
            </h2>
          </div>

          <div className="bg-secondary/50 rounded-2xl border-l-4 border-accent p-6 md:p-8 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              At a glance
            </span>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
              {FACT_BULLETS.map((fact, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-primary/90">{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              <span className="text-accent font-medium">Palm Hills Developments</span>
              {" "}was founded in{" "}
              <strong className="text-primary font-semibold">1997</strong>
              {" "}by entrepreneur{" "}
              <span className="text-accent font-medium">Yassin Mansour</span>
              {" "}and has since become one of Egypt's most recognized real estate brands — listed on both the{" "}
              <strong className="text-primary font-semibold">Egyptian Stock Exchange</strong>
              {" "}and the{" "}
              <strong className="text-primary font-semibold">London Stock Exchange</strong>, with operations extending beyond Egypt into{" "}
              <strong className="text-primary font-semibold">Saudi Arabia</strong>,{" "}
              <strong className="text-primary font-semibold">the United Kingdom</strong>, and{" "}
              <strong className="text-primary font-semibold">Singapore</strong>. Palm Hills is primarily focused on integrated residential, commercial, and resort projects — with a diversified portfolio of{" "}
              <strong className="text-primary font-semibold">48 projects</strong>
              {" "}spanning East and West Cairo, Alexandria, the North Coast, and the Red Sea.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Within commercial and administrative real estate, Palm Hills' portfolio includes{" "}
              <span className="text-accent font-medium">Palm Hills Business Park</span>,{" "}
              <span className="text-accent font-medium">The Lane Palm Hills</span>, and{" "}
              <span className="text-accent font-medium">Palm Hub</span>
              {" "}— alongside{" "}
              <span className="text-accent font-medium">Palmet New Cairo</span>
              {" "}and{" "}
              <span className="text-accent font-medium">October Plaza</span>, their business park developments in New Cairo and Sheikh Zayed. For businesses and investors evaluating business park space in Egypt, Palm Hills represents one of the strongest developer brands in the market — combining{" "}
              <strong className="text-primary font-semibold">location credibility</strong>,{" "}
              <strong className="text-primary font-semibold">delivery track record</strong>, and{" "}
              <strong className="text-primary font-semibold">long-term asset quality</strong>
              {" "}across both East and West Cairo.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-8 scroll-mt-24 bg-secondary/40">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Portfolio
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-2">
              Palm Hills Projects
            </h2>
          </div>

          {projectTypes.length > 2 && (
            <div className="flex flex-wrap gap-2 mb-8">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project, i) => (
              <Link
                key={i}
                href={`/listings?developer=${project.developer}`}
                className="group relative h-80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 block"
              >
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/10" />
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
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

          {filteredProjects.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No projects match this filter.
            </p>
          )}
        </div>
      </section>

      {/* Related Developers */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-8 text-center md:text-left">
            Explore Other Developers
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-10 gap-y-6">
            {RELATED.map((dev) => (
              <a
                key={dev.name}
                href={dev.slug ? `/developers/${dev.slug}` : `/listings?developer=${encodeURIComponent(dev.name)}`}
                aria-label={`View ${dev.name}`}
                className="group flex items-center justify-center h-14 md:h-16 transition-transform hover:scale-105"
              >
                <img
                  src={dev.logo}
                  alt={`${dev.name} logo`}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-40 object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Enquire CTA */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Find Your Space
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mt-3 mb-4">
              Looking for a business park office in a Palm Hills development?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about current availability across Palmet in New Cairo and Palm Hills' Sheikh Zayed business park developments — and which project fits your business or investment requirements.
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
