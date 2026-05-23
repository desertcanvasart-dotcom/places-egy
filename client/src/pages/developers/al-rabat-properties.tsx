import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("al-rabat-properties");

const FACT_BULLETS = [
  "Founded in 1980 by Dr. Mohamed Ghaloush — over four decades of specialized commercial and mixed-use development experience",
  "Pioneer of New Cairo's signature B Complexes Series (B255, B289, B290, B303, B424) developed in alliance with Ezz Fahmy Group",
  "Operator of the Medical Park Chain — Egypt's largest medical complex network with 500+ doctors, 250+ clinics, and 18+ medical centers",
  "Active commercial presence on every major New Cairo corridor: South 90, North 90, 70 Street, Mohamed Naguib Axis, AlSadat Axis, and Al Rehab",
  "International footprint with developments across Egypt and Dubai, UAE",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "KVRD", logo: "/images/kvrd-logo.png", slug: "kvrd" },
  { name: "PRE Developments", logo: "/images/Pre-developments-logo.png", slug: "pre-developments" },
  { name: "The Ark Developments", logo: "/images/the-ark-developments-logo.png", slug: "the-ark-developments" },
  { name: "Arabella", logo: "/images/arabella-developments.png", slug: "arabella" },
  { name: "The Waterway", logo: "/images/waterway.png", slug: "the-waterway" },
];

const alRabatOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Al Rabat Properties Development",
  url: "https://places-egy.com/developers/al-rabat-properties",
  logo: "https://places-egy.com/images/alrabat-properties.png",
  founder: {
    "@type": "Person",
    name: "Dr. Mohamed Ghaloush",
  },
  foundingDate: "1980",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Al Rabat Properties Development is one of Egypt's longest-running specialized commercial developers — operating since 1980 and behind New Cairo's signature B Complexes series, the Medical Park chain, and flagship destinations including The Yard, Sway, Sleek, and By 9.",
};

export default function AlRabatPropertiesPage() {
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
          { name: "Al Rabat Properties Development", url: "/developers/al-rabat-properties" },
        ])}
      />
      <SchemaMarkup schema={alRabatOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/AlRabat-Properties-B255.webp"
            alt="Al Rabat Properties B255 strip mall in New Cairo"
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
            <span className="text-white">Al Rabat Properties Development</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Al Rabat Properties Development
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Al Rabat Properties is one of Egypt's longest-running specialized commercial developers — operating since 1980 and behind New Cairo's signature B Complexes series, the Medical Park chain, and flagship destinations including The Yard, Sway, Sleek, and By 9.
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
              Four decades of specialized commercial development across New Cairo and Dubai
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
              Al Rabat Properties Development is one of Egypt's most established specialized real estate developers, founded in{" "}
              <strong className="text-primary font-semibold">1980</strong>
              {" "}by{" "}
              <span className="text-accent font-medium">Dr. Mohamed Ghaloush</span>
              {" "}and operating today as a fully integrated business group across Egypt and the UAE. Built on a philosophy of{" "}
              <em className="text-primary font-semibold not-italic">"Prosperity, Professionalism, and Prioritizing Communities,"</em>
              {" "}AlRabat has spent more than four decades focused exclusively on commercial, medical, and mixed-use developments — distinguishing itself from generalist residential developers through deep specialization in the niche of strip malls, medical complexes, and administrative buildings. The company's portfolio spans{" "}
              <strong className="text-primary font-semibold">New Cairo</strong>
              {" "}and{" "}
              <strong className="text-primary font-semibold">Dubai</strong>, with corporate offices at the{" "}
              <span className="text-accent font-medium">B303 Complex</span>
              {" "}on Southern 90th Street and a sales and leasing office at{" "}
              <span className="text-accent font-medium">The Yard</span>
              {" "}on AlSadat Axis.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              AlRabat's commercial portfolio is organized around two signature brand series and a roster of standalone destinations. The{" "}
              <span className="text-accent font-medium">B Complexes Series</span>
              {" "}— developed in alliance with{" "}
              <strong className="text-primary font-semibold">Ezz Fahmy Group</strong>
              {" "}— is one of New Cairo's most recognizable strip mall brands, with each project numbered after its plot location and spanning{" "}
              <strong className="text-primary font-semibold">North 90 Street</strong>,{" "}
              <strong className="text-primary font-semibold">South 90 Street</strong>, and{" "}
              <strong className="text-primary font-semibold">70 Street</strong>
              {" "}in the Fifth Settlement. The{" "}
              <span className="text-accent font-medium">Medical Park Chain</span>
              {" "}is Egypt's largest dedicated medical complex network, collectively home to more than{" "}
              <strong className="text-primary font-semibold">500 doctors</strong>,{" "}
              <strong className="text-primary font-semibold">250+ clinics</strong>, and{" "}
              <strong className="text-primary font-semibold">18+ medical centers</strong>
              {" "}across New Cairo. Alongside these series, AlRabat's standalone destinations —{" "}
              <span className="text-accent font-medium">The Yard</span>,{" "}
              <span className="text-accent font-medium">Sway</span>,{" "}
              <span className="text-accent font-medium">Sleek</span>, and{" "}
              <span className="text-accent font-medium">By 9</span>
              {" "}— extend the company's footprint across every major New Cairo commercial corridor including AlSadat Axis, Mohamed Naguib Axis, South 90 Street, and Al Rehab, giving AlRabat one of the densest specialized commercial portfolios of any developer in the Fifth Settlement.
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
              Al Rabat Properties Projects
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
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mt-3 mb-4">
              Looking for retail, office, or clinic space in an Al Rabat Properties project?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which AlRabat project fits your business needs.
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
