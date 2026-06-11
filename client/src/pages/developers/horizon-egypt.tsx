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

const PROJECTS = getProjectsByDeveloper("horizon-egypt");

const FACT_BULLETS = [
  "Egyptian arm of UAE's Adnan Saffarini Group, with 60+ years of architectural and development expertise across the UAE and the Arab world",
  "Led under the patronage of Sheikh Majid Bin Saeed Al Nuaimi, nephew and son-in-law of the Ruler of Ajman",
  "Flagship Saada community spans 370,000 sqm with a 2-kilometer frontage on the New Suez Road in New Cairo",
  "Saada integrates residential, commercial, two five-star hotels, a school, sports club, and medical facility within a single master-planned address",
  "10 minutes from Cairo International Airport, with direct access to the New Administrative Capital, Al Rehab, and Madinaty",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
  { name: "Al Jazi Developments", logo: "/images/aljazi-logo.png", slug: "al-jazi" },
];

const horizonOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Horizon Egypt Developments",
  url: "https://places-egy.com/developers/horizon-egypt",
  logo: "https://places-egy.com/images/Horizon-logo.png",
  parentOrganization: {
    "@type": "Organization",
    name: "Adnan Saffarini Group",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Horizon Egypt Developments is the Egyptian arm of UAE-based Adnan Saffarini Group — bringing 60 years of Emirati architectural and development expertise to the Egyptian market through its flagship Saada community on Suez Road, New Cairo.",
};

export default function HorizonEgyptPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "Horizon Egypt Developments Projects & Offices in Egypt | PLACES",
    description: horizonOrganizationSchema.description,
    url: horizonOrganizationSchema.url,
    image: horizonOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Horizon Egypt Developments", url: "/developers/horizon-egypt" },
        ])}
      />
      <SchemaMarkup schema={horizonOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/saada.jpg"
            alt="Horizon Egypt Saada master-planned community on Suez Road, New Cairo"
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
            <span className="text-white">Horizon Egypt Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Horizon Egypt Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Horizon Egypt Developments is the Egyptian arm of UAE-based Adnan Saffarini Group — bringing 60 years of Emirati architectural and development expertise to the Egyptian market through its flagship Saada community on Suez Road, New Cairo.
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
              UAE-backed developer bringing six decades of Adnan Saffarini Group expertise to New Cairo's Suez Road corridor
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
              Horizon Egypt Developments is the Egyptian arm of{" "}
              <span className="text-accent font-medium">Adnan Saffarini Group</span>
              {" "}— a UAE-based architectural and development conglomerate with over{" "}
              <strong className="text-primary font-semibold">60 years</strong>
              {" "}of experience designing and building landmark projects across{" "}
              <strong className="text-primary font-semibold">Dubai</strong>, the broader UAE, and the wider Arab world. The Egyptian subsidiary is led under the patronage of{" "}
              <span className="text-accent font-medium">Sheikh Majid Bin Saeed Al Nuaimi</span>, nephew and son-in-law of the{" "}
              <strong className="text-primary font-semibold">Ruler of Ajman</strong>, giving the company direct ties to one of the UAE's prominent royal families. Horizon's vision in Egypt centers on integrating Emirati architectural standards with Egyptian cultural heritage, creating mixed-use urban environments that combine residential, commercial, hospitality, and lifestyle components within a single master-planned address.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Horizon Egypt's flagship development in the Egyptian market is the{" "}
              <span className="text-accent font-medium">Saada</span>
              {" "}master-planned community — a{" "}
              <strong className="text-primary font-semibold">370,000 sqm</strong>
              {" "}mixed-use destination directly on the{" "}
              <strong className="text-primary font-semibold">New Suez Road</strong>
              {" "}in New Cairo, with a{" "}
              <strong className="text-primary font-semibold">2-kilometer frontage</strong>
              {" "}on one of the Fifth Settlement's most active commercial corridors. The Saada masterplan is structured as a fully integrated lifestyle ecosystem combining a residential compound, a 2km commercial business strip,{" "}
              <strong className="text-primary font-semibold">two five-star hotels</strong>, a school, a clubhouse, a sports club, a medical facility, and the project's commercial core —{" "}
              <span className="text-accent font-medium">Saada New Cairo Business Park</span>. With offices starting from{" "}
              <strong className="text-primary font-semibold">51 sqm</strong>, Saada is positioned as a premium business address for companies seeking proximity to{" "}
              <strong className="text-primary font-semibold">Cairo International Airport</strong>
              {" "}(10 minutes away), the New Administrative Capital, Madinaty, and Al Rehab — making it one of the most strategically located Business Parks at the intersection of New Cairo, the Capital corridor, and East Cairo's residential growth zones.
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
              Horizon Egypt Developments Projects
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
              Looking for office or retail space at Saada New Cairo?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Horizon Egypt project fits your business needs.
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
