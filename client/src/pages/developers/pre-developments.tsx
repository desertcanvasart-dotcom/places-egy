import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("pre-developments");

const FACT_BULLETS = [
  "Real estate arm of Pioneers Holding Group, founded in 2017 under Chairperson and CEO Waleed Zaki",
  "12 million sqm land bank across Cairo, North Coast, Ain Sokhna, Alexandria, and Marsa Alam — over 8,500 units delivered to date",
  "Three flagship New Cairo commercial projects: Point 90 (AUC corridor), ZAG (South 90 Street), and The Big Business District (Ring Road)",
  "ZAG features 1 km of frontage on South 90 Street with 15 G+5 buildings and EGP 9 billion in investment",
  "The Big Business District is designed by Zaha Hadid Architects with international consultants Savills, Coldwell Banker, and ACE Moharram-Bakhoum",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
  { name: "The Waterway", logo: "/images/waterway.png", slug: "the-waterway" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
];

const preDevelopmentsOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PRE Developments",
  alternateName: "Pioneers Real Estate",
  url: "https://places-egy.com/developers/pre-developments",
  logo: "https://places-egy.com/images/Pre-developments-logo.png",
  parentOrganization: {
    "@type": "Organization",
    name: "Pioneers Holding Group",
    address: {
      "@type": "PostalAddress",
      addressCountry: "EG",
      addressLocality: "Cairo",
    },
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "PRE Developments (Pioneers Real Estate) is the real estate arm of Pioneers Holding Group — one of Egypt's most active mixed-use developers, with a 12 million sqm land bank and three flagship New Cairo commercial destinations: Point 90, ZAG, and The Big Business District.",
};

export default function PreDevelopmentsPage() {
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
          { name: "PRE Developments", url: "/developers/pre-developments" },
        ])}
      />
      <SchemaMarkup schema={preDevelopmentsOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/pre-developments-project.jpeg"
            alt="PRE Developments — New Cairo commercial portfolio"
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
            <span className="text-white">PRE Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            PRE Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            PRE Developments — Pioneers Real Estate — is one of Egypt's most active mixed-use developers, with a 12 million sqm land bank and three flagship commercial destinations across New Cairo: Point 90, ZAG, and The Big Business District.
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
              A Pioneers Holding-backed developer building New Cairo's largest mixed-use commercial portfolio
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
              <span className="text-accent font-medium">PRE Developments</span>
              {" "}— short for Pioneers Real Estate — is the real estate development arm of{" "}
              <strong className="text-primary font-semibold">Pioneers Holding Group</strong>
              , an Egyptian financial investment group with diversified interests across real estate, contracting, and capital markets. Established in 2017 under the leadership of Chairperson and CEO{" "}
              <strong className="text-primary font-semibold">Waleed Zaki</strong>
              , PRE Group manages a land bank exceeding{" "}
              <strong className="text-primary font-semibold">12 million sqm</strong>
              {" "}across Cairo, the North Coast, Ain Sokhna, Alexandria, and Marsa Alam — with more than{" "}
              <strong className="text-primary font-semibold">8,500 residential units delivered</strong>
              {" "}across 16+ developments to date.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              PRE's commercial footprint in New Cairo spans three of the city's most strategic corridors.{" "}
              <span className="text-accent font-medium">Point 90 Mall</span>
              {" "}sits directly opposite the American University in Cairo (AUC) — a high-footfall mixed-use destination with retail, F&B, offices, clinics, and a cinema.{" "}
              <span className="text-accent font-medium">ZAG New Cairo</span>
              {" "}occupies a 1-kilometer frontage on South 90th Street with 15 G+5 buildings on{" "}
              <strong className="text-primary font-semibold">108,000 sqm</strong>
              {" "}and EGP 9 billion in investment.{" "}
              <span className="text-accent font-medium">The Big Business District</span>
              {" "}on the Ring Road is PRE's largest play — a 43-acre business park designed by{" "}
              <strong className="text-primary font-semibold">Zaha Hadid Architects</strong>
              , positioned as a smart business city at the gateway between East and West Cairo.
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
              PRE Developments Projects
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
              Looking for office or retail space in a PRE Developments project?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which PRE project fits your business needs.
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
