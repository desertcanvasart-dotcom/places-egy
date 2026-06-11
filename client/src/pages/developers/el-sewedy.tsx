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

const PROJECTS = getProjectsByDeveloper("el-sewedy");

const FACT_BULLETS = [
  "Real estate arm of El Sewedy Industries Group — established 1938, sister company of Elsewedy Electric, with 80+ years of operating history",
  "Led by Chairman Sadek El Sewedy and operating under the leadership of Ahmed El Sewedy (Group COO, CEO Elsewedy Electric)",
  "Real estate operations executed through Abraj for Urban Development, the group's dedicated real estate subsidiary",
  "Flagship U-Venues spans 20,000 sqm retail GLA and 15,000 sqm office GLA at the gateway to New Cairo",
  "Tenant mix includes %Arabica, La Serre, Be-Indie, Gourmet, Brass Monkey, Zia Amelia, and Pandora — one of New Cairo's most curated commercial destinations",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
  { name: "Larz Developments", logo: "/images/larz-developments-logo.png", slug: "larz" },
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "Al Jazi Developments", logo: "/images/aljazi-logo.png", slug: "al-jazi" },
];

const elSewedyOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "El Sewedy Developments",
  url: "https://places-egy.com/developers/el-sewedy",
  logo: "https://places-egy.com/images/elsewedy-developments-logo.png",
  parentOrganization: {
    "@type": "Organization",
    name: "El Sewedy Industries Group",
  },
  foundingDate: "1938",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "El Sewedy Developments is the real estate arm of El Sewedy Industries — a sister company of Elsewedy Electric operating since 1938 — entering the commercial real estate market with U-Venues, a 35,000 sqm mixed-use destination at the gateway to New Cairo.",
};

export default function ElSewedyPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "El Sewedy Developments Projects & Offices in Egypt | PLACES",
    description: elSewedyOrganizationSchema.description,
    url: elSewedyOrganizationSchema.url,
    image: elSewedyOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "El Sewedy Developments", url: "/developers/el-sewedy" },
        ])}
      />
      <SchemaMarkup schema={elSewedyOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/el-sewedy-projects.jpeg"
            alt="El Sewedy Developments U-Venues mixed-use development at the gateway to New Cairo"
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
            <span className="text-white">El Sewedy Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            El Sewedy Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            El Sewedy Developments is the real estate arm of El Sewedy Industries — a sister company of Elsewedy Electric operating since 1938 — entering the commercial real estate market with U-Venues, a 35,000 sqm mixed-use destination at the gateway to New Cairo.
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
              The real estate arm of one of Egypt's oldest industrial groups, established in 1938
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
              El Sewedy Developments is the real estate development arm of{" "}
              <span className="text-accent font-medium">El Sewedy Industries Group</span>, a sister company of the publicly traded{" "}
              <span className="text-accent font-medium">Elsewedy Electric</span>
              {" "}and one of Egypt's oldest industrial groups, established in{" "}
              <strong className="text-primary font-semibold">1938</strong>
              {" "}with operations spanning the Middle East across multiple competitive industries. The group is led by Chairman{" "}
              <span className="text-accent font-medium">Sadek El Sewedy</span>
              {" "}and operates under the broader leadership of{" "}
              <span className="text-accent font-medium">Ahmed El Sewedy</span>
              {" "}— Group COO and CEO of Elsewedy Electric — bringing decades of corporate scale, manufacturing expertise, and industrial supply-chain integration to its real estate projects through its development subsidiary{" "}
              <span className="text-accent font-medium">Abraj for Urban Development</span>. With more than{" "}
              <strong className="text-primary font-semibold">80 years</strong>
              {" "}of operating history, El Sewedy Industries' entry into commercial real estate is positioned as a strategic diversification move backed by one of Egypt's most established industrial conglomerates — giving El Sewedy Developments unusual financial depth and brand recognition for a developer with a single delivered project to date.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              El Sewedy Developments' debut project — and current flagship — is{" "}
              <span className="text-accent font-medium">U-Venues New Cairo</span>, a fully integrated mixed-use development at the gateway to New Cairo, in the District 5 area accessible directly from the{" "}
              <strong className="text-primary font-semibold">Cairo-Sokhna Highway</strong>. Designed as the company's first commercial real estate venture with explicit plans for further expansion ("the first of many to come"), U-Venues spans{" "}
              <strong className="text-primary font-semibold">20,000 sqm</strong>
              {" "}of retail GLA and{" "}
              <strong className="text-primary font-semibold">15,000 sqm</strong>
              {" "}of office GLA, combining curated retail, F&B, and Grade A office space in a single destination. The project's strategic position places it within a{" "}
              <strong className="text-primary font-semibold">20-minute drive</strong>
              {" "}from any point in Cairo, and its tenant mix already includes a roster of high-profile international and lifestyle brands —{" "}
              <span className="text-accent font-medium">%Arabica</span>,{" "}
              <span className="text-accent font-medium">La Serre</span>,{" "}
              <span className="text-accent font-medium">Be-Indie</span>,{" "}
              <span className="text-accent font-medium">Gourmet</span>,{" "}
              <span className="text-accent font-medium">Brass Monkey</span>,{" "}
              <span className="text-accent font-medium">Zia Amelia</span>, and{" "}
              <span className="text-accent font-medium">Pandora</span>
              {" "}— establishing U-Venues as one of New Cairo's more curated commercial destinations and a credibility-building platform for El Sewedy Developments' future real estate roadmap.
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
              El Sewedy Developments Projects
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
              Looking for retail, F&B, or office space at U-Venues?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which El Sewedy Developments project fits your business needs.
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
