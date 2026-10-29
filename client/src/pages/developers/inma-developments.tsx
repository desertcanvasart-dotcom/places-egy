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

const PROJECTS = getProjectsByDeveloper("inma-developments");

const FACT_BULLETS = [
  "Founded in 2015 as the real estate arm of Genena Group, the Egyptian conglomerate behind Genena Mall — one of Egypt's first organized commercial centers",
  "Headquartered at its own Trivium Business Complex on North 90 Street, New Cairo",
  "Signature Trivium brand spans three commercial complexes across both New Cairo (Trivium Business Complex, Trivium Square) and Sheikh Zayed (Trivium Zayed)",
  "Trivium Business Complex features 8,500 sqm with units from 37 sqm — designed for offices, clinics, retail, F&B, and conference facilities",
  "Backed by Genena Group's broader investment portfolio across commercial real estate and food and beverage manufacturing",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "Al Rabat Properties", logo: "/images/alrabat-properties.png", slug: "al-rabat-properties" },
  { name: "KVRD", logo: "/images/kvrd-logo.png", slug: "kvrd" },
  { name: "Town Writers", logo: "/images/town-writers-logo.png", slug: "town-writers" },
  { name: "PRE Developments", logo: "/images/Pre-developments-logo.png", slug: "pre-developments" },
];

const inmaOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Inma Developments",
  url: "https://places-egy.com/developers/inma-developments",
  logo: "https://places-egy.com/images/inma-developments.png",
  parentOrganization: {
    "@type": "Organization",
    name: "Genena Group",
  },
  foundingDate: "2015",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "New Cairo",
  },
  description:
    "Inma Developments is the real estate arm of Genena Group — the Egyptian conglomerate behind Genena Mall, one of Egypt's first commercial centers — delivering the Trivium series of business and commercial complexes across New Cairo's North 90 corridor.",
};

export default function InmaPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "Inma Developments Projects & Offices in Egypt | PLACES",
    description: inmaOrganizationSchema.description,
    url: inmaOrganizationSchema.url,
    image: inmaOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Inma Developments", url: "/developers/inma-developments" },
        ])}
      />
      <SchemaMarkup schema={inmaOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Trivium-Business-Complex.jpg"
            alt="Inma Developments Trivium Business Complex on North 90 Street, New Cairo"
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
            <span className="text-white">Inma Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Inma Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Inma Developments is the real estate arm of Genena Group — the Egyptian conglomerate behind Genena Mall, one of Egypt's first commercial centers — delivering the Trivium series of business and commercial complexes across New Cairo's North 90 corridor.
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
              The real estate arm of the conglomerate behind Genena Mall — pioneering Egypt's commercial real estate since the 1970s
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
              Inma Developments was founded in{" "}
              <strong className="text-primary font-semibold">2015</strong>
              {" "}as the real estate development arm of{" "}
              <span className="text-accent font-medium">Genena Group</span>
              {" "}(also known as Genena Investment) — the Egyptian conglomerate famous for developing{" "}
              <span className="text-accent font-medium">Genena Mall</span>
              {" "}in Nasr City, one of Egypt's first organized commercial centers and a project that fundamentally shaped the country's modern retail and commercial real estate landscape. Beyond real estate, Genena Group has diversified investments across multiple sectors including food and beverage production, giving the parent company decades of operational experience in commercial property management, tenant relations, and retail real estate. Inma Developments was created with a clear strategic mandate: to expand and enhance Genena's commercial, retail, and administrative real estate portfolio under a dedicated developer brand, applying the same principles, culture, and tenant-first approach that made Genena Mall the reference point for organized commercial real estate in Cairo for decades. The company is headquartered at its own{" "}
              <span className="text-accent font-medium">Trivium Business Complex</span>
              {" "}on North 90 Street in New Cairo's Fifth Settlement.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Inma Developments' commercial portfolio is built around the{" "}
              <span className="text-accent font-medium">Trivium</span>
              {" "}brand — a signature series of business and commercial complexes designed to combine work, retail, and lifestyle in a single integrated environment. The Trivium series spans three projects:{" "}
              <span className="text-accent font-medium">Trivium Business Complex</span>
              {" "}— Inma's flagship{" "}
              <strong className="text-primary font-semibold">8,500 sqm</strong>
              {" "}complex strategically positioned between South 90 and North 90 streets, offering administrative offices, medical clinics, retail, and meeting facilities with units starting from{" "}
              <strong className="text-primary font-semibold">37 sqm</strong>;{" "}
              <span className="text-accent font-medium">Trivium Square</span>
              {" "}— Inma's larger-scale commercial and business complex in the Fifth Settlement on North 90 Street with frontage overlooking the Mohamed Naguib Axis, designed to combine commercial strip retail with a curated administrative environment; and{" "}
              <span className="text-accent font-medium">Trivium Zayed</span>
              {" "}— the West Cairo expansion of the brand in Sheikh Zayed's 2nd District. Together, the three Trivium projects make Inma one of the few specialized commercial developers operating simultaneously across both East Cairo's North 90 corridor and West Cairo's Sheikh Zayed market.
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
              Inma Developments Projects
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
      <DeveloperInventory slug="inma-developments" />

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
              Looking for office, retail, or clinic space at Trivium Square or Trivium Complex?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Inma Developments project fits your business needs.
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
