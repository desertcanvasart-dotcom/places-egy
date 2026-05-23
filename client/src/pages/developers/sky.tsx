import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("sky");

const FACT_BULLETS = [
  "Sky Investments founded in 1977 — one of Egypt's most established family-owned investment conglomerates, operating across 17 companies with over 14,000 employees",
  "Three Park St. developments across New Cairo and Sheikh Zayed — Edition (Shofiat · Ring Road), East (New Cairo · Ring Road), West (Sheikh Zayed · Ring Road)",
  "Park St. Edition spans 140,000 sqm land area with 560,000 sqm built-up area — featuring a 1.2 km primary facade on the Ring Road in New Cairo",
  "Total investment exceeding EGP 100 billion across the Citystars Park St. project — targeting LEED sustainability certification",
  "Park St. West combines fine dining, medical services, and retail in Sheikh Zayed. Park St. East offers high-end offices and commercial spaces in New Cairo on the Ring Road",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "Palm Hills", logo: "/images/PalmHills_logo.png", slug: "palm-hills" },
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
];

const skyOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SKY — Park St.",
  alternateName: "Sky Investments",
  url: "https://places-egy.com/developers/sky",
  logo: "https://places-egy.com/images/SKY-Park-st-logo.png",
  foundingDate: "1977",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Sky Investments is a leading family-owned Egyptian conglomerate with over 40 years of local expertise — operating across 17 companies and 14,000+ employees — and the developer behind Park St., one of Egypt's most recognized boutique mixed-use brands.",
};

export default function SkyPage() {
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
          { name: "SKY — Park St.", url: "/developers/sky" },
        ])}
      />
      <SchemaMarkup schema={skyOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/SKY-Park-St-edition.webp"
            alt="SKY — Park St. Edition flagship development on the Ring Road, New Cairo"
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
            <span className="text-white">SKY</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-4xl">
            SKY — Park St.
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Founded in 1977, Sky Investments is a leading family-owned Egyptian conglomerate with over 40 years of local expertise — operating across 17 companies and employing over 14,000 employees — and the developer behind Park St., one of Egypt's most recognized boutique mixed-use brands with three developments across New Cairo and Sheikh Zayed.
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
              Four decades of Egyptian investment — three Park St. addresses redefining commercial real estate in Cairo
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
              <span className="text-accent font-medium">Sky Investments</span>
              {" "}was founded in{" "}
              <strong className="text-primary font-semibold">1977</strong>
              {" "}as an Egypt-centric private investment company and has grown into a leading family-owned conglomerate with capital at work across{" "}
              <strong className="text-primary font-semibold">17 companies</strong>
              {" "}in a spectrum of industries. Its real estate arm,{" "}
              <span className="text-accent font-medium">Sky Real Estate</span>, focuses on commercial and mixed-use developments under the{" "}
              <span className="text-accent font-medium">Park St.</span>
              {" "}brand: a curated series of business-centric destinations that combine offices, retail, F&B, and medical facilities within a single integrated environment. Park St. is an exclusive boutique developer in Egypt — offering exclusive, niche, and luxurious developments for families, businesses, and urban professionals.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              The brand operates across three distinct Cairo addresses:{" "}
              <span className="text-accent font-medium">Park St. Edition</span>
              {" "}in New Cairo,{" "}
              <span className="text-accent font-medium">Park St. West</span>
              {" "}in Sheikh Zayed, and{" "}
              <span className="text-accent font-medium">Park St. East</span>
              {" "}in New Cairo — each positioned on major ring road and highway frontage. Park St. Edition — the flagship — spans{" "}
              <strong className="text-primary font-semibold">140,000 sqm</strong>
              {" "}of land and approximately{" "}
              <strong className="text-primary font-semibold">560,000 sqm</strong>
              {" "}of built-up area, featuring a primary facade stretching{" "}
              <strong className="text-primary font-semibold">1.2 kilometers</strong>, located approximately 20 minutes from Cairo International Airport. It will introduce branded offices in collaboration with the Park St. brand alongside luxury hospitality services managed by{" "}
              <span className="text-accent font-medium">Fairmont</span>. For businesses and investors evaluating mixed-use commercial real estate, Park St. represents one of Egypt's most design-forward and strategically connected commercial brands — with ring road frontage across both East and West Cairo.
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
              SKY — Park St. Projects
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
              Looking for office or commercial space in a Park St. development?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about current availability across Park St. Edition, Park St. East, and Park St. West — and which development fits your business model or investment requirements.
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
