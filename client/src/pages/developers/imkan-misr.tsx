import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("imkan-misr");

const FACT_BULLETS = [
  "Egyptian arm of IMKAN Properties, part of Abu Dhabi Capital Group — backed by 26 international developments across 5 countries",
  "Flagship 1,200-feddan Alburouj integrated community in New Heliopolis, East Cairo",
  "Alburouj Business Park is operated as Smart Village East — East Cairo's first smart business village, with 12 buildings spanning 120,000 sqm",
  "Office spaces starting from 115 sqm, fully finished with central air conditioning, designed by award-winning British firm Squire and Partners",
  "Strategic location on Cairo-Ismailia Road with direct access to the New Administrative Capital, Fifth Settlement, and Regional Ring Road",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
  { name: "The Waterway", logo: "/images/waterway.png", slug: "the-waterway" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
];

const imkanMisrOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Imkan Misr",
  url: "https://places-egy.com/developers/imkan-misr",
  logo: "https://places-egy.com/images/imkan-misr-logo.png",
  parentOrganization: {
    "@type": "Organization",
    name: "IMKAN Properties",
    address: {
      "@type": "PostalAddress",
      addressCountry: "AE",
      addressLocality: "Abu Dhabi",
    },
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Imkan Misr is the Egyptian subsidiary of IMKAN Properties, an Abu Dhabi-based master developer. Its flagship project, Alburouj, is a 1,200-feddan integrated community in East Cairo home to Alburouj Business Park — operated as Smart Village East, the first smart business village outside of New Cairo's traditional corridors.",
};

export default function ImkanMisrPage() {
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
          { name: "Imkan Misr", url: "/developers/imkan-misr" },
        ])}
      />
      <SchemaMarkup schema={imkanMisrOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/imkan-misr-rpoejcts.jpeg"
            alt="Imkan Misr — Alburouj Business Park"
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
            <span className="text-white">Imkan Misr</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Imkan Misr
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Imkan Misr is the Egyptian arm of Abu Dhabi's IMKAN Properties, delivering one of East Cairo's largest integrated mixed-use communities — Alburouj — and its flagship business park in Smart Village East.
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
              Abu Dhabi-backed master developer behind East Cairo's first smart business village
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
              Imkan Misr is the Egyptian subsidiary of{" "}
              <span className="text-accent font-medium">IMKAN Properties</span>
              {" "}— a global real estate developer headquartered in{" "}
              <strong className="text-primary font-semibold">Abu Dhabi</strong>
              {" "}and part of the Abu Dhabi Capital Group. With a parent portfolio of{" "}
              <strong className="text-primary font-semibold">26 developments</strong>
              {" "}spanning five countries across two continents — including the UAE, Egypt, Morocco, Sri Lanka, and Seychelles — Imkan Misr brings international placemaking expertise to the Egyptian commercial real estate market, with a research-led approach that prioritizes integrated, community-focused environments over standalone developments.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              In Egypt, Imkan Misr's flagship development is{" "}
              <span className="text-accent font-medium">Alburouj</span>
              {" "}— a{" "}
              <strong className="text-primary font-semibold">1,200-feddan</strong>
              {" "}integrated community in New Heliopolis (El Shorouk City), East Cairo, designed as a fully serviced mixed-use destination. At its heart sits{" "}
              <strong className="text-primary font-semibold">Alburouj Business Park</strong>
              {" "}— operated as{" "}
              <span className="text-accent font-medium">Smart Village East</span>
              , the first and only smart business village in East Cairo, designed by award-winning British architectural firm Squire and Partners. The business park positions Imkan Misr as one of the few Egyptian developers delivering Grade A office space in a master-planned commercial district outside of New Cairo's traditional corridors.
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
              Imkan Misr Projects
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mt-3 mb-4">
              Looking for office space in Alburouj Business Park?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Imkan Misr project fits your business needs.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-10 h-14 text-lg font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105"
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
