import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DeveloperInventory } from "@/components/developers/DeveloperInventory";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("ora");

const FACT_BULLETS = [
  "Founded as Gemini — rebranded to ORA in 2018 — operating across Egypt, Cyprus, Grenada, Pakistan, UAE, and Iraq",
  "Led by Naguib Sawiris — one of Egypt's most prominent business leaders",
  "EGP 131 billion investment plan committed across Egyptian developments over the next 3–5 years",
  "Three business park developments in Egypt available through PLACES: Solana East (New Cairo · South 90 Street), Zed West (Sheikh Zayed), Zed East (New Cairo · Ring Road)",
  "ZED East includes 126,193 sqm of administrative space and 22,288 sqm of retail — with the ZED East Sports Club spanning approximately 40 feddans",
  "International buyers represent approximately 25% of total ORA sales — reflecting the brand's global credibility and investment appeal",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "Palm Hills", logo: "/images/PalmHills_logo.png", slug: "palm-hills" },
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
];

const oraOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ORA Developers Egypt",
  alternateName: "ORA Real Estate",
  url: "https://places-egy.com/developers/ora",
  logo: "https://places-egy.com/images/ora-logo.png",
  founder: {
    "@type": "Person",
    name: "Naguib Sawiris",
  },
  foundingDate: "2018",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "ORA Developers Egypt is an international real estate group that entered the Egyptian market in 2018 with a vision centered on park-side living and fully integrated communities — led by Naguib Sawiris — with three business park developments across New Cairo and Sheikh Zayed.",
};

export default function OraPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "ORA Developers Egypt Projects & Offices in Egypt | PLACES",
    description: oraOrganizationSchema.description,
    url: oraOrganizationSchema.url,
    image: oraOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "ORA Developers Egypt", url: "/developers/ora" },
        ])}
      />
      <SchemaMarkup schema={oraOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/ORA Zed East.jpeg"
            alt="ORA Developers Egypt — Zed East business park in New Cairo"
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
            <span className="text-white">ORA Developers Egypt</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-4xl">
            ORA Developers Egypt
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            An international real estate group that entered the Egyptian market in 2018 with a vision centered on park-side living and fully integrated communities — led by renowned businessman Naguib Sawiris — with three business park developments across New Cairo and Sheikh Zayed available through PLACES.
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
              International expertise. Three business park addresses in New Cairo and Sheikh Zayed.
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
              <span className="text-accent font-medium">ORA Developers Egypt</span>
              {" "}was originally founded under the name{" "}
              <span className="text-accent font-medium">Gemini</span>
              {" "}— an international brand operating across{" "}
              <strong className="text-primary font-semibold">8 countries</strong>
              {" "}— before rebranding to ORA Real Estate in{" "}
              <strong className="text-primary font-semibold">2018</strong>. The group has a proven track record of creating environments that balance exceptional design with long-term community value across markets including{" "}
              <strong className="text-primary font-semibold">Cyprus, Grenada, Pakistan, and Egypt</strong>. In Egypt, the company operates under the leadership of{" "}
              <span className="text-accent font-medium">Naguib Sawiris</span>
              {" "}and CEO{" "}
              <span className="text-accent font-medium">Haitham Abdel Azim</span>
              {" "}— with an announced investment plan of{" "}
              <strong className="text-primary font-semibold">EGP 131 billion</strong>
              {" "}in construction and development over the next three to five years.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              ORA is currently developing residential, commercial, sports, and hospitality projects across East and West Cairo — including{" "}
              <span className="text-accent font-medium">ZED El Sheikh Zayed</span>,{" "}
              <span className="text-accent font-medium">ZED East</span>,{" "}
              <span className="text-accent font-medium">Solana East</span>, and{" "}
              <span className="text-accent font-medium">Solana West</span>
              {" "}— in addition to the{" "}
              <span className="text-accent font-medium">Silversands</span>
              {" "}project on the North Coast.{" "}
              <span className="text-accent font-medium">ZED East</span>
              {" "}in New Cairo spans{" "}
              <strong className="text-primary font-semibold">332 feddans</strong>
              {" "}and includes{" "}
              <strong className="text-primary font-semibold">126,193 sqm</strong>
              {" "}of administrative space and{" "}
              <strong className="text-primary font-semibold">22,288 sqm</strong>
              {" "}of retail — alongside a sports club, cinema complex, and over 75% of the total land area dedicated to open spaces and greenery. For businesses evaluating business park office space and investors seeking commercial assets within premium masterplanned communities, ORA's three developments represent some of the most comprehensively serviced business park addresses in Greater Cairo.
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
              ORA Projects
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

      {/* Live units + FAQs */}
      <DeveloperInventory slug="ora" />

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
              Looking for business park office space in an ORA development?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about current availability across Solana East, Zed West, and Zed East — and which ORA development fits your business requirements or investment strategy.
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
