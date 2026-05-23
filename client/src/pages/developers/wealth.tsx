import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("wealth");

const FACT_BULLETS = [
  "Founded 2002 by Engineer Ahmed Shaker — founder of Arkan Engineering Consulting — with over 22 years of commercial real estate experience in Egypt and the Middle East",
  "Three mixed-use commercial developments in New Cairo available through PLACES: Elev 8 (South 90), At 9 (North 90), South Gate (South 90)",
  "Elev 8 on South 90 Street — opposite Concord Plaza, adjacent to AUC — commercial units from 36 sqm, office units from 51 sqm, prices from 8,300,000 EGP",
  "At 9 on North 90 Street — smart building with fiber internet, coworking spaces, conference rooms, and AI-powered security surveillance",
  "South Gate on South 90 Street — 4,700 sqm next to Future University — large-scale investment project with diverse commercial and administrative units",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Upwyde", logo: "/images/upwyde-logo.png", slug: "upwyde" },
  { name: "Inma Developments", logo: "/images/inma-developments.png", slug: "inma-developments" },
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "Afaaq Developments", logo: "/images/Afaaq-developments-logo.png", slug: "afaaq" },
  { name: "Town Writers", logo: "/images/town-writers-logo.png", slug: "town-writers" },
];

const wealthOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Wealth Developments",
  url: "https://places-egy.com/developers/wealth",
  logo: "https://places-egy.com/images/wealth-developments-logo.png",
  founder: {
    "@type": "Person",
    name: "Ahmed Shaker",
  },
  foundingDate: "2002",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Wealth Developments is a highly reputable Egyptian real estate developer established in 2002 by Engineer Ahmed Shaker — founder of Arkan Engineering Consulting — with over 22 years of experience delivering mixed-use commercial developments across New Cairo.",
};

export default function WealthPage() {
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
          { name: "Wealth Developments", url: "/developers/wealth" },
        ])}
      />
      <SchemaMarkup schema={wealthOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/wealth-development-projects.webp"
            alt="Wealth Developments — mixed-use commercial projects in New Cairo"
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
            <span className="text-white">Wealth Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-4xl">
            Wealth Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            A highly reputable Egyptian real estate developer established in 2002 by Engineer Ahmed Shaker — founder of Arkan Engineering Consulting — with over 22 years of experience delivering mixed-use commercial developments across New Cairo — and three projects on South 90 Street and North 90 Street available through PLACES: Elev 8, At 9, and South Gate.
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
              Three commercial addresses on New Cairo's most active business corridors — South 90 and North 90
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
              <span className="text-accent font-medium">Wealth Developments</span>
              {" "}was established in{" "}
              <strong className="text-primary font-semibold">2002</strong>
              {" "}by{" "}
              <span className="text-accent font-medium">Engineer Ahmed Shaker</span>, who is also the founder of{" "}
              <span className="text-accent font-medium">Arkan Engineering Consulting</span>
              {" "}and several other construction companies across Egypt and the Middle East. The company has built its reputation on{" "}
              <strong className="text-primary font-semibold">prime location selection</strong>,{" "}
              <strong className="text-primary font-semibold">international construction standards</strong>,{" "}
              <strong className="text-primary font-semibold">flexible payment plans</strong>, and{" "}
              <strong className="text-primary font-semibold">on-time delivery</strong>
              {" "}— partnering with Arkan Consulting across all its major projects.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Within New Cairo's commercial real estate market, Wealth has delivered three mixed-use developments on the district's most competitive streets.{" "}
              <span className="text-accent font-medium">Elev 8</span>
              {" "}is located on{" "}
              <strong className="text-primary font-semibold">South 90 Street</strong>
              {" "}directly opposite Concord Plaza Mall and adjacent to the American University in Cairo — spanning{" "}
              <strong className="text-primary font-semibold">4,350 sqm</strong>
              {" "}with commercial shops from 36 sqm and offices from 51 sqm, with dual frontage on South 90th and South 70th Streets.{" "}
              <span className="text-accent font-medium">At 9</span>
              {" "}on{" "}
              <strong className="text-primary font-semibold">North 90 Street</strong>
              {" "}is a smart mixed-use hub with European-style architecture, fiber internet, smart building management, coworking spaces, and conference rooms.{" "}
              <span className="text-accent font-medium">South Gate</span>
              {" "}on South 90 Street next to Future University is a{" "}
              <strong className="text-primary font-semibold">4,700 sqm</strong>
              {" "}investment project with diverse commercial and administrative units.
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
              Wealth Projects
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
              Looking for commercial or office space in a Wealth development in New Cairo?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about current availability across Elev 8, At 9, and South Gate — and which Wealth development fits your business model or investment requirements on South 90 or North 90 Street.
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
