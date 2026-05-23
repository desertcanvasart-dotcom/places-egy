import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("larz");

const FACT_BULLETS = [
  "Real estate arm of Al-Gawish Group, an Egyptian conglomerate operating in real estate and energy since 1982",
  "Led by Chairman Abdelrahman Al-Gawish and CEO Eng. Tarek Gawish, with cumulative Larz investments of EGP 57 billion",
  "Sister company GMC Contracting — a 43-year-old construction firm — executes all Larz projects, providing end-to-end delivery control",
  "KOV strip mall is anchored by F&B and lifestyle tenants including Ayadina, Blaze, Raf, Myst, Gourmet, Kriss, and edge innovation co-working",
  "Active portfolio across both New Cairo's Golden Square (KOV, Cove Mall) and the New Administrative Capital (Larz Business Hub, Madai, R8 Compound)",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Al Rabat Properties", logo: "/images/alrabat-properties.png", slug: "al-rabat-properties" },
  { name: "KVRD", logo: "/images/kvrd-logo.png", slug: "kvrd" },
  { name: "PRE Developments", logo: "/images/Pre-developments-logo.png", slug: "pre-developments" },
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "Town Writers", logo: "/images/town-writers-logo.png", slug: "town-writers" },
];

const larzOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Larz Developments",
  url: "https://places-egy.com/developers/larz",
  logo: "https://places-egy.com/images/larz-developments-logo.png",
  parentOrganization: {
    "@type": "Organization",
    name: "Al-Gawish Group",
  },
  foundingDate: "1982",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Larz Developments is the real estate arm of Al-Gawish Group — a 40-year-old Egyptian conglomerate — with a portfolio spanning KOV strip mall in New Cairo's Golden Square, Cove Mall, and Larz Business Hub in the New Administrative Capital.",
};

export default function LarzPage() {
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
          { name: "Larz Developments", url: "/developers/larz" },
        ])}
      />
      <SchemaMarkup schema={larzOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/KOV (1).jpeg"
            alt="Larz Developments KOV strip mall in New Cairo's Golden Square"
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
            <span className="text-white">Larz Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Larz Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Larz Developments is the real estate arm of Al-Gawish Group — a 40-year-old Egyptian conglomerate — with a portfolio spanning KOV strip mall in New Cairo's Golden Square, Cove Mall, and Larz Business Hub in the New Administrative Capital.
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
              The real estate arm of Al-Gawish Group — backed by 40+ years of Egyptian construction and energy experience
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
              Larz Developments is the real estate development arm of{" "}
              <span className="text-accent font-medium">Al-Gawish Group</span>, a long-established Egyptian conglomerate operating in real estate and energy since{" "}
              <strong className="text-primary font-semibold">1982</strong>. The company is led by Chairman{" "}
              <span className="text-accent font-medium">Abdelrahman Al-Gawish</span>
              {" "}and CEO{" "}
              <span className="text-accent font-medium">Eng. Tarek Gawish</span>, with cumulative Larz investments of{" "}
              <strong className="text-primary font-semibold">EGP 57 billion</strong>
              {" "}and total Gawish Group investments reaching{" "}
              <strong className="text-primary font-semibold">USD 2 billion</strong>. Larz benefits from a fully integrated business model — its sister company{" "}
              <span className="text-accent font-medium">GMC Contracting</span>, a 43-year-old construction firm operating across Egypt and several Arab countries, executes the construction of all Larz projects, giving the developer end-to-end control over delivery quality and timelines. The company's positioning is deliberate: rather than chasing the loudest brand presence in the market, Larz focuses on well-designed projects, realistic pricing, and reliable delivery — making it a developer particularly trusted by GCC investors from the UAE, Saudi Arabia, Qatar, and Kuwait looking for stable Egyptian real estate assets.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Larz's commercial portfolio in New Cairo is anchored by{" "}
              <span className="text-accent font-medium">KOV</span>
              {" "}— a{" "}
              <strong className="text-primary font-semibold">4,500 sqm</strong>
              {" "}strip mall in the prestigious{" "}
              <strong className="text-primary font-semibold">Golden Square</strong>
              {" "}of the Fifth Settlement, near some of Cairo's largest residential compounds. Designed by acclaimed Egyptian architect{" "}
              <span className="text-accent font-medium">Hany Saad Innovation</span>
              {" "}and constructed by GMC, KOV comprises three buildings — a primary tenant building, an extension building, and Larz's own state-of-the-art head office — and houses an established roster of F&B and lifestyle tenants including{" "}
              <span className="text-accent font-medium">Ayadina, Blaze, Raf, Myst, Gourmet, Kriss</span>, and{" "}
              <span className="text-accent font-medium">edge innovation co-working spaces</span>. Beyond KOV, Larz's broader portfolio includes{" "}
              <span className="text-accent font-medium">Cove Mall</span>
              {" "}— a{" "}
              <strong className="text-primary font-semibold">13,200 sqm</strong>
              {" "}mall in the Golden Square that opened at the end of 2024 — alongside{" "}
              <span className="text-accent font-medium">Larz Business Hub</span>
              {" "}(a 19,500 sqm commercial and administrative tower in the New Administrative Capital's financial district), the{" "}
              <span className="text-accent font-medium">Cloves Compound</span>
              {" "}(a 24-acre residential project in the Al Qarnafil area opposite Al Rehab),{" "}
              <span className="text-accent font-medium">Larz New Capital Compound</span>
              {" "}in R8, and{" "}
              <span className="text-accent font-medium">Madai</span>
              {" "}— a recently launched{" "}
              <strong className="text-primary font-semibold">EGP 17 billion</strong>
              {" "}residential project in the New Administrative Capital. Together, these projects make Larz one of the more diversified mid-tier developers operating simultaneously across New Cairo's Golden Square commercial corridor and the New Administrative Capital's residential and business districts.
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
              Larz Developments Projects
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
              Looking for retail or F&B space at KOV Mall?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Larz Developments project fits your business needs.
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
