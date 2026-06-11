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

const PROJECTS = getProjectsByDeveloper("raslan-group");

const FACT_BULLETS = [
  "Egyptian holding group comprising real estate development, construction, hospitality, and water treatment operations across Egypt and the Middle East",
  "Two commercial strip mall developments in New Cairo — The Corner and Square One",
  "The Corner located on Al Sadat Axis in front of El Rehab Gate 6 — First Settlement, New Cairo",
  "Square One located in the Narjis neighborhood — the only dedicated mall serving this community — near the Ring Road and Suez Road",
  "Square One offers administrative units, medical clinics, and commercial retail spaces with parking for over 224 cars",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Al Rabat Properties", logo: "/images/alrabat-properties.png", slug: "al-rabat-properties" },
  { name: "KVRD", logo: "/images/kvrd-logo.png", slug: "kvrd" },
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "Afaaq Developments", logo: "/images/Afaaq-developments-logo.png", slug: "afaaq" },
  { name: "Larz Developments", logo: "/images/larz-developments-logo.png", slug: "larz" },
];

const raslanGroupOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Raslan Group",
  url: "https://places-egy.com/developers/raslan-group",
  logo: "https://places-egy.com/images/raslan-group-logo.png",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Raslan Group is a leading real estate, construction, and investment enterprise operating across Egypt and the Middle East — with two commercial strip mall developments in New Cairo: The Corner on Al Sadat Axis and Square One on the Ring Road.",
};

export default function RaslanGroupPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "Raslan Group Projects & Offices in Egypt | PLACES",
    description: raslanGroupOrganizationSchema.description,
    url: raslanGroupOrganizationSchema.url,
    image: raslanGroupOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Raslan Group", url: "/developers/raslan-group" },
        ])}
      />
      <SchemaMarkup schema={raslanGroupOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/square-one.webp"
            alt="Raslan Group — Square One commercial development in New Cairo"
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
            <span className="text-white">Raslan Group</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-4xl">
            Raslan Group
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            A leading real estate, construction, and investment enterprise operating across Egypt and the Middle East — with two commercial strip mall developments in New Cairo: The Corner on Al Sadat Axis and Square One on the Ring Road.
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
              A diversified Egyptian holding group with a focused commercial real estate footprint in New Cairo
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
              <span className="text-accent font-medium">Raslan Group</span>
              {" "}is an Egyptian holding company with a diversified portfolio spanning real estate development, construction, hospitality, and infrastructure — including{" "}
              <span className="text-accent font-medium">Raslan Real Estate Development</span>, which owns residential properties, office buildings, and schools;{" "}
              <span className="text-accent font-medium">Santoriny for Constructions</span>, a five-star hotel in Hurghada; and{" "}
              <span className="text-accent font-medium">AQUA</span>, the Arab Company for Water Treatment. Within real estate, Raslan Group of Companies is a pioneering real estate and investment company with projects across Egypt and the Middle East, offering distinctive designs across real estate development, infrastructure and rehabilitation, as well as design and water treatment. The group's commercial real estate portfolio in New Cairo is built around two strip mall developments —{" "}
              <span className="text-accent font-medium">The Corner</span>
              {" "}and{" "}
              <span className="text-accent font-medium">Square One</span>
              {" "}— both positioned to serve the growing business and residential communities of East Cairo.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              <span className="text-accent font-medium">The Corner</span>
              {" "}is located on{" "}
              <strong className="text-primary font-semibold">Al Sadat Axis</strong>, directly in front of El Rehab Gate 6 in New Cairo — one of the most active neighborhood-level commercial corridors in the First Settlement. The project serves as a convenience-driven strip mall catering to the dense residential catchment along the Sadat Axis, offering retail, F&B, and service units in a high-visibility, high-accessibility location.{" "}
              <span className="text-accent font-medium">Square One</span>
              {" "}is a large administrative, commercial, and medical complex located in the{" "}
              <strong className="text-primary font-semibold">Narjis neighborhood</strong>
              {" "}of New Cairo — the only mall serving this specific neighborhood — combining administrative office units, medical clinics, and commercial retail spaces within a single integrated development. Square One is strategically located near the{" "}
              <strong className="text-primary font-semibold">Ring Road</strong>
              {" "}and{" "}
              <strong className="text-primary font-semibold">Suez Road</strong>, a few minutes from the New Cairo Court and surrounded by some of New Cairo's most prominent residential compounds. Together, the two projects cover two distinct catchments, offering complementary options for retail operators, service businesses, and commercial investors evaluating neighborhood-level commercial real estate in East Cairo.
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
              Raslan Group Projects
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
              Looking for commercial or administrative space in a Raslan Group development?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about current availability at The Corner on Al Sadat Axis or Square One near the Ring Road — and whether either development fits your business or investment requirements.
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
