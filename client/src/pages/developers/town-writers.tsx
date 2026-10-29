import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DeveloperInventory } from "@/components/developers/DeveloperInventory";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("town-writers");

const FACT_BULLETS = [
  "Founded in 2017 as Eight Developments — affiliate of ARO Holding — and rebranded to Town Writers in 2023 following an alliance with LXIAS",
  "Led by Founder and Chairman Engineer Omar El Saadawy and CEO Mohamed Abdel Fattah",
  "50+ projects across New Cairo, the New Administrative Capital, El Gouna, and Sheikh Zayed",
  "Two flagship commercial projects on North 90 Street, New Cairo: Revolve Mall (strip mall) and Quadro (business building)",
  "EGP 1.8 billion in cumulative construction investment allocated for 2025–2026, with Revolve Mall reaching 88% construction completion",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Al Rabat Properties", logo: "/images/alrabat-properties.png", slug: "al-rabat-properties" },
  { name: "KVRD", logo: "/images/kvrd-logo.png", slug: "kvrd" },
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "PRE Developments", logo: "/images/Pre-developments-logo.png", slug: "pre-developments" },
  { name: "Afaaq Developments", logo: "/images/Afaaq-developments-logo.png", slug: "afaaq" },
];

const townWritersOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Town Writers Developments",
  alternateName: "Eight Developments",
  url: "https://places-egy.com/developers/town-writers",
  logo: "https://places-egy.com/images/town-writers-logo.png",
  parentOrganization: {
    "@type": "Organization",
    name: "ARO Holding",
  },
  founder: {
    "@type": "Person",
    name: "Engineer Omar El Saadawy",
  },
  foundingDate: "2017",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "New Cairo",
  },
  description:
    "Town Writers Developments — formerly Eight Developments — is the narrative-driven real estate developer behind New Cairo's Revolve Mall and Quadro on North 90 Street, with a portfolio of more than 50 commercial and residential projects across New Cairo and the New Administrative Capital.",
};

export default function TownWritersPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "Town Writers Developments Projects & Offices in Egypt | PLACES",
    description: townWritersOrganizationSchema.description,
    url: townWritersOrganizationSchema.url,
    image: townWritersOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Town Writers Developments", url: "/developers/town-writers" },
        ])}
      />
      <SchemaMarkup schema={townWritersOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Quadro  (1).jpeg"
            alt="Town Writers Developments — Quadro business building on North 90 Street, New Cairo"
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
            <span className="text-white">Town Writers Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Town Writers Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Town Writers Developments — formerly Eight Developments — is the narrative-driven real estate developer behind New Cairo's Revolve Mall and Quadro on North 90 Street, with a portfolio of more than 50 commercial and residential projects across New Cairo and the New Administrative Capital.
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
              Egypt's narrative-driven developer behind 50+ commercial and residential projects across New Cairo and the New Administrative Capital
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
              Town Writers Developments is one of Egypt's most active mid-tier real estate developers, established in{" "}
              <strong className="text-primary font-semibold">2017</strong>
              {" "}as{" "}
              <span className="text-accent font-medium">Eight Developments</span>
              {" "}under the umbrella of{" "}
              <span className="text-accent font-medium">ARO Holding</span>
              {" "}— a diversified Egyptian conglomerate — and rebranded to Town Writers in late{" "}
              <strong className="text-primary font-semibold">2023</strong>
              {" "}following a strategic alliance with{" "}
              <span className="text-accent font-medium">LXIAS</span>
              {" "}to mark a new chapter in the company's commercial trajectory. Founded and chaired by{" "}
              <span className="text-accent font-medium">Engineer Omar El Saadawy</span>
              {" "}with{" "}
              <span className="text-accent font-medium">Mohamed Abdel Fattah</span>
              {" "}as CEO, the company is headquartered at{" "}
              <span className="text-accent font-medium">Cloudnine Mall</span>
              {" "}on Mohamed Naguib Axis in New Cairo. Town Writers has positioned itself around a distinctive editorial brand identity —{" "}
              <em className="text-primary font-semibold not-italic">"we create not only spaces, but life narratives"</em>
              {" "}— built on the premise that each project tells a story for its tenants and residents. The company has earmarked over{" "}
              <strong className="text-primary font-semibold">EGP 1.8 billion</strong>
              {" "}in cumulative construction investment between 2025 and 2026, designating 2025 as its{" "}
              <strong className="text-primary font-semibold">"Year of Construction"</strong>
              {" "}to accelerate delivery across its portfolio.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Town Writers' portfolio spans more than{" "}
              <strong className="text-primary font-semibold">50 projects</strong>
              {" "}across{" "}
              <strong className="text-primary font-semibold">New Cairo</strong>, the{" "}
              <strong className="text-primary font-semibold">New Administrative Capital</strong>,{" "}
              <strong className="text-primary font-semibold">El Gouna</strong>, and{" "}
              <strong className="text-primary font-semibold">Sheikh Zayed</strong>, with a deliberate focus on commercial and mixed-use destinations alongside select residential developments. In New Cairo, the company's commercial footprint is anchored on{" "}
              <strong className="text-primary font-semibold">North 90 Street</strong>
              {" "}with two flagship projects:{" "}
              <span className="text-accent font-medium">Revolve Mall</span>, a strip mall reaching{" "}
              <strong className="text-primary font-semibold">88% construction completion</strong>
              {" "}in 2025, optimized for high-footfall retail and administrative units near the AUC corridor, and{" "}
              <span className="text-accent font-medium">Quadro</span>, the company's business building development on the same axis.
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
              Town Writers Developments Projects
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

      {/* Live units + FAQs */}
      <DeveloperInventory slug="town-writers" />

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
              Looking for office or retail space at Quadro or Revolve?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Town Writers project fits your business needs.
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
