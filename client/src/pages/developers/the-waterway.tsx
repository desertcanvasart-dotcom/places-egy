import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("the-waterway");

const FACT_BULLETS = [
  "Founded in 2010 by Ahmed El Sewedy and Hossam Hassan — two of Egypt's most recognized real estate figures",
  "Commercial projects spanning Ring Road, Mohamed Naguib Axis, South 90 Street, North 90 Street, and Golden Square in New Cairo",
  "Portfolio covers the full commercial spectrum — business parks, mixed-use malls, and strip malls",
  "Operates through multiple subsidiaries covering development, facility management, retail destination management, and hospitality",
  "Expanding internationally with upcoming projects in Saudi Arabia, Libya, Slovenia, and Greece",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
  { name: "Arabella", logo: "/images/arabella-developments.png", slug: "arabella" },
];

const waterwayOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The Waterway Developments",
  url: "https://places-egy.com/developers/the-waterway",
  logo: "https://places-egy.com/images/waterway.png",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  foundingDate: "2010",
  founder: [
    { "@type": "Person", name: "Ahmed El Sewedy" },
    { "@type": "Person", name: "Hossam Hassan" },
  ],
  description:
    "The Waterway Developments is one of New Cairo's most active commercial developers, delivering business parks, strip malls, and mixed-use destinations across the district since 2010.",
};

export default function TheWaterwayPage() {
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
          { name: "The Waterway Developments", url: "/developers/the-waterway" },
        ])}
      />
      <SchemaMarkup schema={waterwayOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/waterway-2.jpg"
            alt="The Waterway Developments in New Cairo"
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
            <span className="text-white">The Waterway Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            The Waterway Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            The Waterway Developments is one of New Cairo's most active commercial developers, delivering business parks, strip malls, and mixed-use destinations across the district's most prominent axes since 2010.
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
              New Cairo's most commercially active developer — with a presence across every major axis in the district
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
              The Waterway Developments is an Egyptian real estate group founded in{" "}
              <strong className="text-primary font-semibold">2010</strong>
              {" "}by{" "}
              <span className="text-accent font-medium">Ahmed El Sewedy</span>
              {" "}and{" "}
              <span className="text-accent font-medium">Hossam Hassan</span>
              {" "}— two entrepreneurs with deep roots in Egypt's real estate and business communities. From the outset, Waterway positioned itself as a developer of boutique, high-quality destinations that blend residential, commercial, and hospitality within a single integrated vision. The group operates through multiple subsidiaries covering real estate development and sales, facility management, commercial retail destination construction and management, and hospitality through its own{" "}
              <span className="text-accent font-medium">My Ōtel</span>
              {" "}hotel brand — making it one of the few Egyptian developers with end-to-end control over the full lifecycle of its commercial assets.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              In commercial real estate, The Waterway Developments has built one of the most geographically diverse portfolios in New Cairo — with active projects on the{" "}
              <strong className="text-primary font-semibold">Ring Road</strong>,{" "}
              <strong className="text-primary font-semibold">Mohamed Naguib Axis</strong>,{" "}
              <strong className="text-primary font-semibold">South 90 Street</strong>,{" "}
              <strong className="text-primary font-semibold">North 90 Street</strong>, and the{" "}
              <strong className="text-primary font-semibold">Golden Square</strong>. This means businesses and investors looking for commercial space in virtually any New Cairo corridor will find a Waterway project within reach. Their commercial offer spans business parks like{" "}
              <strong className="text-primary font-semibold">5A</strong>
              {" "}and{" "}
              <strong className="text-primary font-semibold">The View</strong>, mixed-use destinations including{" "}
              <strong className="text-primary font-semibold">The Hub</strong>,{" "}
              <strong className="text-primary font-semibold">W Signature</strong>, and{" "}
              <strong className="text-primary font-semibold">Waterway Villas – Gentle Turquoise</strong>, and strip malls across{" "}
              <strong className="text-primary font-semibold">Waterway 1</strong>,{" "}
              <strong className="text-primary font-semibold">Waterway 2</strong>, and{" "}
              <strong className="text-primary font-semibold">Waterway Villas</strong> — giving the full range of commercial property types under one developer across New Cairo's most active addresses.
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
              The Waterway Developments Projects
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
              Looking for space in a Waterway Developments project?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Waterway project fits your business needs.
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
