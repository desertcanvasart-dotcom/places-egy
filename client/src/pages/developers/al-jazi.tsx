import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("al-jazi");

const FACT_BULLETS = [
  "Egyptian arm of Qatar's Al Faisal Holding — ranked #9 among Forbes Middle East's Top 10 Arab Family Businesses 2022",
  "Parent company Seldar Misr operates Four Seasons Cairo, Hilton Alexandria, Hilton Hurghada, and The First Mall",
  "Exclusive Marriott International partner in Egypt — developer of JW Marriott Residences, Marriott Residences, and Moxy Hotel",
  "Flagship 266,500 sqm master-planned community on Mohamed Naguib Axis, one minute from North 90 Street",
  "Pioneer of Egypt's first Silver LEED-certified residences and commercial buildings, with international partners including Hill International, Schneider, KONE, and YBA Architects",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
];

const alJaziOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Al Jazi Developments",
  url: "https://places-egy.com/developers/al-jazi",
  logo: "https://places-egy.com/images/aljazi-logo.png",
  parentOrganization: {
    "@type": "Organization",
    name: "Al Faisal Holding",
  },
  foundingDate: "2007",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Al Jazi Developments is the Egyptian arm of Qatar's Al Faisal Holding — operator of 38 hotels worldwide and one of the Middle East's top family business groups — delivering New Cairo's first Marriott-branded mixed-use community on the Mohamed Naguib Axis.",
};

export default function AlJaziPage() {
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
          { name: "Al Jazi Developments", url: "/developers/al-jazi" },
        ])}
      />
      <SchemaMarkup schema={alJaziOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/chess-field.jpeg"
            alt="Al Jazi Developments Chess Field business park in New Cairo"
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
            <span className="text-white">Al Jazi Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Al Jazi Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Al Jazi Developments is the Egyptian arm of Qatar's Al Faisal Holding — operator of 38 hotels worldwide and one of the Middle East's top family business groups — delivering New Cairo's first Marriott-branded mixed-use community on the Mohamed Naguib Axis.
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
              Qatari-backed luxury developer behind Egypt's exclusive Marriott-branded residences and Chess Field business community
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
              Al Jazi Developments is the Egyptian real estate arm of{" "}
              <span className="text-accent font-medium">Al Faisal Holding</span>
              {" "}— a Qatari conglomerate ranked{" "}
              <strong className="text-primary font-semibold">#9</strong>
              {" "}among the Top 10 Arab Family Businesses by Forbes Middle East in{" "}
              <strong className="text-primary font-semibold">2022</strong>
              {" "}— operating in Egypt through parent company{" "}
              <span className="text-accent font-medium">Seldar Misr</span>
              {" "}and its hospitality arm{" "}
              <span className="text-accent font-medium">Al Rayyan Tourism Investment Company (ARTIC)</span>, which manages{" "}
              <strong className="text-primary font-semibold">38 hotels worldwide</strong>. Established in{" "}
              <strong className="text-primary font-semibold">2007</strong>, Al Jazi positions itself as Egypt's pioneer in branded residential and mixed-use development, with an exclusive collaboration with{" "}
              <span className="text-accent font-medium">Marriott International</span>
              {" "}that has produced the country's first{" "}
              <span className="text-accent font-medium">JW Marriott Residences</span>,{" "}
              <span className="text-accent font-medium">Marriott Residences</span>, and{" "}
              <span className="text-accent font-medium">Moxy Hotel by Marriott</span>. The company's parent Seldar Misr also operates some of Egypt's most recognizable hospitality assets — including the{" "}
              <span className="text-accent font-medium">Four Seasons Hotel Cairo at the First Residence</span>,{" "}
              <span className="text-accent font-medium">The First Mall</span>,{" "}
              <span className="text-accent font-medium">Hilton Alexandria Corniche</span>,{" "}
              <span className="text-accent font-medium">Hilton Hurghada Plaza</span>, and{" "}
              <span className="text-accent font-medium">Hurghada City Center Mall</span>
              {" "}— giving Al Jazi unmatched depth in luxury hospitality and commercial real estate operations.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Al Jazi's flagship development in Egypt is a{" "}
              <strong className="text-primary font-semibold">266,500 sqm</strong>
              {" "}master-planned community on the{" "}
              <strong className="text-primary font-semibold">Mohamed Naguib Axis</strong>
              {" "}in New Cairo —{" "}
              <strong className="text-primary font-semibold">one minute</strong>
              {" "}from North 90 Street and less than{" "}
              <strong className="text-primary font-semibold">20 minutes</strong>
              {" "}from the New Administrative Capital. The community brings together five integrated components under a single luxury address:{" "}
              <span className="text-accent font-medium">JW Marriott Residences</span>,{" "}
              <span className="text-accent font-medium">Marriott Residences</span>,{" "}
              <span className="text-accent font-medium">Moxy Hotel by Marriott</span>,{" "}
              <span className="text-accent font-medium">Al Jazi First Mall</span>, and{" "}
              <span className="text-accent font-medium">Chess Field</span>
              {" "}— Al Jazi's commercial and business park component. Chess Field spans{" "}
              <strong className="text-primary font-semibold">45,011 sqm</strong>
              {" "}with{" "}
              <strong className="text-primary font-semibold">12 buildings</strong>
              {" "}of office space, F&B outlets, and retail along a pedestrian commercial promenade connecting the residential and hospitality components on either end. As one of Egypt's first{" "}
              <strong className="text-primary font-semibold">Silver LEED-certified</strong>
              {" "}commercial developments, designed by{" "}
              <span className="text-accent font-medium">Eng. Raef Fahmy</span>
              {" "}with construction by{" "}
              <span className="text-accent font-medium">Redcon</span>
              {" "}and consulting by{" "}
              <span className="text-accent font-medium">Al Wadi</span>
              {" "}and{" "}
              <span className="text-accent font-medium">Rewad</span>, Chess Field is positioned as a premium administrative address for businesses seeking proximity to Marriott-branded living, hotel-grade amenities, and the prestige of New Cairo's most active commercial corridor.
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
              Al Jazi Developments Projects
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
              Looking for office or retail space at Chess Field Al Jazi?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Al Jazi project fits your business needs.
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
