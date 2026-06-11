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

const PROJECTS = getProjectsByDeveloper("afaaq");

const FACT_BULLETS = [
  "One of Egypt's leading private property development companies, headquartered in Heliopolis, Cairo, led by Dr. Osama El-Etriby",
  "Flagship Amorada community brand spans three integrated projects in New Cairo: Amorada New Cairo, Amorada Park View, and Amorada Hub",
  "Amorada Hub is designed by Copenhagen-based Norm Architects — an internationally recognized Danish design studio known for minimalist Scandinavian architecture",
  "Strategic location on New Cairo's Middle Ring Road, accessible to both New Cairo residents and the New Administrative Capital catchment",
  "Reputation built on delivering luxury residential, commercial, and administrative projects ahead of schedule",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "KVRD", logo: "/images/kvrd-logo.png", slug: "kvrd" },
  { name: "Al Rabat Properties", logo: "/images/alrabat-properties.png", slug: "al-rabat-properties" },
  { name: "PRE Developments", logo: "/images/Pre-developments-logo.png", slug: "pre-developments" },
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "The Ark Developments", logo: "/images/the-ark-developments-logo.png", slug: "the-ark-developments" },
];

const afaaqOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Afaaq Developments",
  alternateName: "Afaaq for Development and Real Estate Investments",
  url: "https://places-egy.com/developers/afaaq",
  logo: "https://places-egy.com/images/Afaaq-developments-logo.png",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Heliopolis, Cairo",
  },
  description:
    "Afaaq Developments is the creator of New Cairo's Amorada community brand — a three-project ecosystem combining ultra-luxurious residences, family compounds, and the Amorada Hub strip mall on the Middle Ring Road, designed in collaboration with Copenhagen-based Norm Architects.",
};

export default function AfaaqPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "Afaaq Developments Projects & Offices in Egypt | PLACES",
    description: afaaqOrganizationSchema.description,
    url: afaaqOrganizationSchema.url,
    image: afaaqOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Afaaq Developments", url: "/developers/afaaq" },
        ])}
      />
      <SchemaMarkup schema={afaaqOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Amorada-Hub.jpg"
            alt="Afaaq Developments Amorada Hub strip mall in New Cairo"
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
            <span className="text-white">Afaaq Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Afaaq Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Afaaq Developments is the creator of New Cairo's Amorada community brand — a three-project ecosystem combining ultra-luxurious residences, family compounds, and the Amorada Hub strip mall on the Middle Ring Road, designed in collaboration with Copenhagen-based Norm Architects.
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
              The developer behind Amorada — New Cairo's curated residential and lifestyle community brand
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
              Afaaq Developments — also known as{" "}
              <span className="text-accent font-medium">Afaaq for Development and Real Estate Investments</span>
              {" "}— is one of Egypt's leading private property development companies, headquartered in{" "}
              <strong className="text-primary font-semibold">Heliopolis, Cairo</strong>, and operating across the Egyptian market with a focus on ultra-luxurious villas, apartments, commercial buildings, and administrative complexes. The company is led publicly by{" "}
              <span className="text-accent font-medium">Dr. Osama El-Etriby</span>
              {" "}and built on a foundation of integrity, on-time delivery, and adherence to international quality standards, working with a curated team of qualified engineers, design firms, and consultants. Afaaq differentiates itself through its commitment to delivering projects{" "}
              <strong className="text-primary font-semibold">ahead of schedule</strong>
              {" "}— a rare claim in the Egyptian real estate market — and through its strategic decision to concentrate its development efforts on a single, deeply-developed brand identity rather than scattering across unrelated projects.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              That single brand is{" "}
              <span className="text-accent font-medium">Amorada</span>
              {" "}— Afaaq's flagship community ecosystem in New Cairo, structured around{" "}
              <strong className="text-primary font-semibold">three integrated projects</strong>
              {" "}that together create a self-contained residential and lifestyle destination on the Middle Ring Road.{" "}
              <span className="text-accent font-medium">Amorada New Cairo</span>
              {" "}is the residential anchor compound,{" "}
              <span className="text-accent font-medium">Amorada Park View</span>
              {" "}is the second-phase residential expansion, and{" "}
              <span className="text-accent font-medium">Amorada Hub</span>
              {" "}is the community's commercial and lifestyle component — a{" "}
              <strong className="text-primary font-semibold">2,000 sqm</strong>
              {" "}strip mall designed by acclaimed Copenhagen-based{" "}
              <span className="text-accent font-medium">Norm Architects</span>, the internationally recognized Danish design studio known for its minimalist Scandinavian aesthetic. Amorada Hub is positioned as a leisure and convenience destination not only for Amorada residents but for the wider New Cairo and New Administrative Capital catchment, featuring F&B outlets, a pharmacy, a bank, retail spaces, and remote-work-friendly environments — making it one of the few strip malls in New Cairo developed under the design direction of an internationally recognized architectural firm.
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
              Afaaq Developments Projects
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
              Looking for retail, F&B, or service space at Amorada Hub?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Afaaq Developments project fits your business needs.
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
