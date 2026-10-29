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

// Emaar-only: Eterna is a "Medical Hub" — display-only, not in the centralized
// project taxonomy (no commercial/admin sub-page filters it). Kept local to this
// page only.
type EmaarProjectType = ProjectType | "medical-hub";
type EmaarProject = { name: string; type: EmaarProjectType; location: string; image: string };

const EMAAR_LABELS: Record<EmaarProjectType, string> = {
  ...PROJECT_TYPE_LABELS,
  "medical-hub": "Medical Hub",
};

const CENTRAL_PROJECTS = getProjectsByDeveloper("emaar");
const ETERNA: EmaarProject = {
  name: "Eterna",
  type: "medical-hub",
  location: "New Cairo · South 90 Street",
  image: "/images/Eterna-Medical-hub.jpg",
};

// Inject Eterna after the first project (Mivida Business Park) to preserve the
// original display order.
const PROJECTS: EmaarProject[] = [
  ...CENTRAL_PROJECTS.slice(0, 1),
  ETERNA,
  ...CENTRAL_PROJECTS.slice(1),
];

const FACT_BULLETS = [
  "Subsidiary of Emaar Properties PJSC, UAE",
  "Commercial projects concentrated in Mivida, New Cairo — South 90 Street",
  "Gold Nugget Award winner — Best International Site Plan",
  "Eco-conscious design standards across all developments",
  "Administrative and commercial units ranging from 44 sqm to 390 sqm",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "LMD", logo: "/images/LMD-developments.png" },
  { name: "The Waterway", logo: "/images/waterway.png" },
  { name: "Marakez", logo: "/images/Marakez _logo.png" },
  { name: "SODIC", logo: "/images/SODIC_Logo.png" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png" },
];

const emaarOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Emaar Misr",
  url: "https://places-egy.com/developers/emaar",
  logo: "https://places-egy.com/images/Emaar_logo.png",
  parentOrganization: {
    "@type": "Organization",
    name: "Emaar Properties PJSC",
    address: {
      "@type": "PostalAddress",
      addressCountry: "AE",
      addressLocality: "Dubai",
    },
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  foundingDate: "1997",
  description:
    "Emaar Misr is the Egyptian subsidiary of Emaar Properties PJSC, delivering large-scale commercial and administrative spaces in New Cairo since 1997.",
};

export default function EmaarPage() {
  const [filter, setFilter] = useState<"All" | EmaarProjectType>("All");

  const projectTypes = useMemo<("All" | EmaarProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "Emaar Misr Projects & Offices in Egypt | PLACES",
    description: emaarOrganizationSchema.description,
    url: emaarOrganizationSchema.url,
    image: emaarOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Emaar Misr", url: "/developers/emaar" },
        ])}
      />
      <SchemaMarkup schema={emaarOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Emaar-Misr.jpg"
            alt="Emaar Misr developments in New Cairo"
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
            <span className="text-white">Emaar Misr</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Emaar Misr
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Emaar Misr is one of Egypt's most established real estate developers, delivering large-scale commercial and administrative spaces in New Cairo since 1997.
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
              A UAE-backed developer with a proven commercial track record in Egypt
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
              Emaar Misr is the Egyptian subsidiary of{" "}
              <span className="text-accent font-medium">Emaar Properties PJSC</span>
              {" "}— the Dubai-based group behind some of the world's most recognized mixed-use developments, including{" "}
              <span className="text-accent font-medium">Burj Khalifa</span>. Operating in Egypt since{" "}
              <strong className="text-primary font-semibold">1997</strong>, Emaar Misr has built a reputation for master-planned communities that integrate commercial, medical, and administrative spaces within a single ecosystem.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Their commercial footprint in Egypt is concentrated within{" "}
              <strong className="text-primary font-semibold">Mivida New Cairo</strong>
              {" "}— an 890-acre development in the Golden Square district on{" "}
              <strong className="text-primary font-semibold">South 90 Street</strong>. Within Mivida, Emaar has built a range of business parks, administrative buildings, and a dedicated medical complex, making it one of the most complete commercial destinations in New Cairo.
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
              Emaar Misr Projects
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
                  {type === "All" ? "All" : EMAAR_LABELS[type]}
                </button>
              ))}
            </div>
          )}

          {/* Project Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project, i) => (
              <Link
                key={i}
                href="/listings?developer=emaar"
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
                      {EMAAR_LABELS[project.type]}
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
      <DeveloperInventory slug="emaar" />

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
              Looking for space in an Emaar Misr project?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Emaar project fits your needs.
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
