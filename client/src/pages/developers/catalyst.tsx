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
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type Project } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("catalyst");

// `tag` overrides the displayed badge label when present (e.g. "Medical Hub"
// for clinic-format buildings whose underlying type is business-building).
const displayLabel = (p: Project) => p.tag ?? PROJECT_TYPE_LABELS[p.type];

const FACT_BULLETS = [
  "Founded in 2016 by a team with 20+ years of combined experience in the Egyptian real estate market",
  "Egypt's first developer specialized exclusively in non-residential real estate — retail, administrative, healthcare, and clinics",
  "Active commercial presence on both North 90 Street and South 90 Street, the Fifth Settlement's most strategic corridors",
  "Specialized medical hubs — O Zone in El Narges and Elegantry Mall near El Mahkama — purpose-built for clinics, diagnostics, and healthcare operators",
  "Portfolio extends beyond the Fifth Settlement to New Heliopolis, with projects including Cairo Capital Center, Midway, and Tivoli Towers",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Al Rabat Properties", logo: "/images/alrabat-properties.png", slug: "al-rabat-properties" },
  { name: "KVRD", logo: "/images/kvrd-logo.png", slug: "kvrd" },
  { name: "PRE Developments", logo: "/images/Pre-developments-logo.png", slug: "pre-developments" },
  { name: "The Ark Developments", logo: "/images/the-ark-developments-logo.png", slug: "the-ark-developments" },
  { name: "The Waterway", logo: "/images/waterway.png", slug: "the-waterway" },
];

const catalystOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Catalyst Developments",
  url: "https://places-egy.com/developers/catalyst",
  logo: "https://places-egy.com/images/catalyst-logo.png",
  foundingDate: "2016",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Catalyst Developments is Egypt's first specialized commercial real estate developer — focused exclusively on retail, administrative, and healthcare projects across New Cairo, with a portfolio of business hubs and medical destinations on every major Fifth Settlement corridor.",
};

export default function CatalystPage() {
  // Filter values are display labels (so "Medical Hub" tags get their own
  // bucket alongside underlying types).
  const [filter, setFilter] = useState<string>("All");

  const filterOptions = useMemo<string[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map(displayLabel)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => displayLabel(p) === filter);

  useDocumentMeta({
    title: "Catalyst Developments Projects & Offices in Egypt | PLACES",
    description: catalystOrganizationSchema.description,
    url: catalystOrganizationSchema.url,
    image: catalystOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Catalyst Developments", url: "/developers/catalyst" },
        ])}
      />
      <SchemaMarkup schema={catalystOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/catalyst-community-development.jpeg"
            alt="Catalyst Developments business and medical hubs in New Cairo"
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
            <span className="text-white">Catalyst Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Catalyst Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Catalyst Developments is Egypt's first specialized commercial real estate developer — focused exclusively on retail, administrative, and healthcare projects across New Cairo, with a portfolio of business hubs and medical destinations on every major Fifth Settlement corridor.
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
              Egypt's first developer specialized exclusively in non-residential real estate
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
              Catalyst Developments is an Egyptian real estate company founded in{" "}
              <strong className="text-primary font-semibold">2016</strong>
              {" "}by a team of professionals with more than{" "}
              <strong className="text-primary font-semibold">20 years</strong>
              {" "}of combined experience in the Egyptian real estate market. The company positions itself as Egypt's first specialized real estate developer focused exclusively on{" "}
              <span className="text-accent font-medium">retail</span>,{" "}
              <span className="text-accent font-medium">administrative buildings</span>,{" "}
              <span className="text-accent font-medium">healthcare districts</span>, and{" "}
              <span className="text-accent font-medium">clinics</span>
              {" "}— explicitly avoiding the residential market that dominates most Egyptian developers' portfolios. This specialization is the company's core differentiator: by concentrating its expertise on non-residential real estate, Catalyst delivers commercial and medical projects designed specifically for the operational, regulatory, and tenant-mix requirements of business and healthcare clients, rather than commercial components added as afterthoughts to residential master plans.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Catalyst's portfolio in New Cairo spans the Fifth Settlement's most active commercial corridors with a clear segmentation strategy. The company's business hubs —{" "}
              <span className="text-accent font-medium">Business Plus</span>
              {" "}on North 90 Street directly facing the road to Al Rehab,{" "}
              <span className="text-accent font-medium">North Plus</span>
              {" "}on North 90 Street directly opposite The Waterway, and{" "}
              <span className="text-accent font-medium">Treble C</span>
              {" "}on South 90 Street — give Catalyst simultaneous presence on both sides of the{" "}
              <strong className="text-primary font-semibold">90th Street axis</strong>, the most strategic commercial corridor in New Cairo. The company's specialized medical hubs —{" "}
              <span className="text-accent font-medium">O Zone</span>
              {" "}in El Narges and{" "}
              <span className="text-accent font-medium">Elegantry Mall</span>
              {" "}near El Mahkama — position Catalyst as one of the few developers in Egypt building dedicated medical districts rather than mixed clinic-retail floors, with custom infrastructure designed for clinics, diagnostics, and healthcare operators. Beyond the projects on this page, Catalyst has additionally delivered{" "}
              <span className="text-accent font-medium">Cairo Capital Center</span>
              {" "}on 90th Street,{" "}
              <span className="text-accent font-medium">Midway</span>
              {" "}in New Heliopolis,{" "}
              <span className="text-accent font-medium">Tivoli Towers</span>, and the{" "}
              <span className="text-accent font-medium">New Korba</span>
              {" "}and{" "}
              <span className="text-accent font-medium">Korba Heights</span>
              {" "}compounds — making them one of the most prolific specialists in commercial and medical real estate across East Cairo.
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
              Catalyst Developments Projects
            </h2>
          </div>

          {/* Filter — hidden when only one project type is available */}
          {filterOptions.length > 2 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                    filter === opt
                      ? "bg-primary text-white"
                      : "bg-white text-primary border border-border/60 hover:border-primary"
                  }`}
                >
                  {opt}
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
                      {displayLabel(project)}
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
      <DeveloperInventory slug="catalyst" />

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
              Looking for office, retail, or clinic space in a Catalyst Developments project?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Catalyst project fits your business needs.
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
