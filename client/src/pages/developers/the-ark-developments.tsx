import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("the-ark-developments");

const FACT_BULLETS = [
  "Founded as a coalition of four Egyptian business groups: Al-Organi Group, Al-Safi Group, Arabella Group, and Abdel-Maksoud Group",
  "Flagship project The Ark Business District spans 92 acres with 11 buildings and 250,000 sqm BUA on South 90 Street, New Cairo",
  "830-meter direct frontage on South 90 Street at the intersection of Mohamed Naguib Axis — one of New Cairo's most active commercial corridors",
  "International project team: Savills (property management), HKS (master plan), SWA (landscape), CCC (construction), Innovation Design Studio (architecture)",
  "Diverse office formats including loft, duplex, sky, bridge, terrace, and standalone office buildings — alongside retail, F&B, clinics, and two hotels",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
  { name: "The Waterway", logo: "/images/waterway.png", slug: "the-waterway" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
];

const arkDevelopmentsOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The Ark Developments",
  alternateName: "People of Ark",
  url: "https://places-egy.com/developers/the-ark-developments",
  logo: "https://places-egy.com/images/the-ark-developments-logo.png",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "The Ark Developments is a New Cairo–based real estate developer founded as a coalition of four established Egyptian business groups. Its flagship project, The Ark Business District, is a 92-acre integrated commercial destination on South 90 Street.",
};

export default function TheArkDevelopmentsPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "The Ark Developments Projects & Offices in Egypt | PLACES",
    description: arkDevelopmentsOrganizationSchema.description,
    url: arkDevelopmentsOrganizationSchema.url,
    image: arkDevelopmentsOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "The Ark Developments", url: "/developers/the-ark-developments" },
        ])}
      />
      <SchemaMarkup schema={arkDevelopmentsOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/the-ark-developments-=projects.jpeg"
            alt="The Ark Developments — The Ark Business District"
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
            <span className="text-white">The Ark Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            The Ark Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            The Ark Developments is a New Cairo-focused real estate developer behind The Ark Business District — a 92-acre integrated commercial destination on South 90 Street, backed by a coalition of four established Egyptian business groups.
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
              A coalition-backed developer building one of New Cairo's largest mixed-use business districts on South 90 Street
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
              The Ark Developments — also known to the market as{" "}
              <span className="text-accent font-medium">"People of Ark"</span>
              {" "}— is a New Cairo–based real estate developer founded as a strategic alliance between four established Egyptian business groups:{" "}
              <strong className="text-primary font-semibold">Al-Organi Group</strong>,{" "}
              <strong className="text-primary font-semibold">Al-Safi Group</strong>,{" "}
              <strong className="text-primary font-semibold">Arabella Group</strong>, and{" "}
              <strong className="text-primary font-semibold">Abdel-Maksoud Group</strong>. The founding groups bring decades of combined experience across construction, technology, pharmaceuticals, hospitality, automotive, retail, and real estate, giving The Ark unusual depth and financial backing for a relatively recent entrant to the Egyptian commercial real estate market. The company is led by Chairman Hisham Ezz Al-Arab and CEO Osama Abu Alam.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              The Ark's flagship development is{" "}
              <span className="text-accent font-medium">The Ark Business District</span>
              {" "}— a{" "}
              <strong className="text-primary font-semibold">92-acre</strong>
              {" "}integrated commercial destination on South 90 Street at the intersection of Mohamed Naguib Axis, with an{" "}
              <strong className="text-primary font-semibold">830-meter direct frontage</strong>
              {" "}on one of New Cairo's most strategic commercial corridors. The project comprises{" "}
              <strong className="text-primary font-semibold">11 buildings</strong>
              {" "}spanning approximately{" "}
              <strong className="text-primary font-semibold">250,000 sqm</strong>
              {" "}of built-up area, with 70% of the total land dedicated to open spaces, plazas, and a 16,000 sqm central park. Designed by Innovation Design Studio with master planning by HKS, landscaping by SWA, construction by CCC, and property management by{" "}
              <span className="text-accent font-medium">Savills</span>
              .
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
              The Ark Developments Projects
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
              Looking for office space in The Ark Business District?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Ark Developments project fits your business needs.
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
