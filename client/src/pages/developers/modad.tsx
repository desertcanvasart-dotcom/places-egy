import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("modad");

const FACT_BULLETS = [
  "Egyptian developer founded 2011 — 490+ completed projects nationwide",
  "Built 80% of National Bank of Egypt branch portfolio",
  "Clients include Bank Misr, Egyptian Ministry of Housing, healthcare sector",
  "Integrated services: construction, MEP, smart solutions, fine finishing",
  "New Cairo presence: Brackets Mall (mixed-use, North 90 Street)",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
  { name: "Misr Italia", logo: "/images/Misritalia_logoo.png", slug: "misr-italia" },
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "The Waterway", logo: "/images/waterway.png", slug: "the-waterway" },
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
];

const modadOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Modad Developments",
  url: "https://places-egy.com/developers/modad",
  logo: "https://places-egy.com/images/modad-developments-logo.png",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  foundingDate: "2011",
  description:
    "Modad Developments is an Egyptian construction and real estate group with 490+ completed projects across 27 governorates, expanding into large-scale commercial development in New Cairo and the New Administrative Capital.",
};

export default function ModadPage() {
  const [filter, setFilter] = useState<"All" | (typeof PROJECTS)[number]["type"]>("All");

  const projectTypes = useMemo(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))] as ("All" | (typeof PROJECTS)[number]["type"])[],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "Modad Developments Projects & Offices in Egypt | PLACES",
    description: modadOrganizationSchema.description,
    url: modadOrganizationSchema.url,
    image: modadOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Modad Developments", url: "/developers/modad" },
        ])}
      />
      <SchemaMarkup schema={modadOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Brackets-mall-new-cairo.webp"
            alt="Modad Developments — Brackets Mall in New Cairo"
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
            <span className="text-white">Modad Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Modad Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Modad Developments — building Egypt's most trusted infrastructure across 27 governorates for over a decade.
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
              A decade of precision-built infrastructure — now moving into commercial real estate
            </h2>
          </div>

          <div className="mb-10">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
              Egyptian construction and real estate group with{" "}
              <strong className="text-primary font-semibold">490+ completed projects</strong>{" "}
              spanning commercial, residential, and infrastructure across{" "}
              <strong className="text-primary font-semibold">27 governorates</strong>. Built{" "}
              <strong className="text-primary font-semibold">80% of National Bank of Egypt's branch network</strong>
              {" "}— a credential that defines their precision in commercial execution. Expanded into large-scale commercial development with flagship projects in the New Administrative Capital and New Cairo. Modad's integrated services (construction, MEP, smart solutions, finishing) ensure end-to-end project delivery.
            </p>
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
              Modad Developments operates across{" "}
              <span className="text-accent font-medium">construction</span>,{" "}
              <span className="text-accent font-medium">real estate development</span>, and{" "}
              <span className="text-accent font-medium">smart building solutions</span>
              {" "}— serving both public and private sector clients. The company's track record in precision-built commercial spaces (notably NBE branches) translates directly to managing large mixed-use environments.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              <strong className="text-primary font-semibold">Brackets</strong>{" "}
              represents Modad's entry into Cairo's premium commercial mixed-use market — a New Cairo development on{" "}
              <strong className="text-primary font-semibold">North 90 Street</strong>{" "}
              that combines the precision of Modad's construction heritage with the ambition of large-scale mixed-use design.
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
              Modad Projects
            </h2>
          </div>

          {/* Filter — hidden when only one project type is available */}
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

          {/* Project Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project, i) => (
              <Link
                key={i}
                href="/listings?developer=modad"
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
              Looking for space in a Modad project?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Modad project fits your needs.
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
