import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("morshedy");

const FACT_BULLETS = [
  "Founded in 1983 by Mohamed Morshedy as Memaar Al Morshedy, rebranded to Morshedy Group with operations spanning real estate, healthcare, education, and entertainment",
  "Fully integrated single-source model: in-house design, planning, engineering, and construction through Degla for Real Estate Developments",
  "21 mega projects, 40,000+ residential units, 4,000+ administrative units, 25 malls, and 80,000+ clients delivered across Maadi, Kattameya, 6th of October, Nasr City, New Cairo, and New Alamein",
  "Rehana Plaza designed in collaboration with Amsterdam-based Van Carter Studio — design partner of Marcel Wanders and Philippe Starck's YOO projects globally",
  "Active commercial portfolio along the Maadi Ring Road including One Kattameya, Bavaria Town, Rehana Plaza, Crystal Plaza, Gateway Business District, and Axis Admin",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
];

const morshedyOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Morshedy Group",
  alternateName: "Memaar Al Morshedy",
  url: "https://places-egy.com/developers/morshedy",
  logo: "https://places-egy.com/images/morshedy-group.png",
  founder: {
    "@type": "Person",
    name: "Mohamed Morshedy",
  },
  foundingDate: "1983",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Maadi, Cairo",
  },
  description:
    "Morshedy Group — formerly Memaar Al Morshedy — is one of Egypt's longest-running real estate developers, operating since 1983 with 21 mega projects, 40,000 residential units, and 4,000 admin units delivered across Maadi, Kattameya, and Greater Cairo.",
};

export default function MorshedyPage() {
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
          { name: "Morshedy Group", url: "/developers/morshedy" },
        ])}
      />
      <SchemaMarkup schema={morshedyOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/morshedy-group-projects.jpeg"
            alt="Morshedy Group developments along Maadi Ring Road"
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
            <span className="text-white">Morshedy Group</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Morshedy Group
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            Morshedy Group — formerly Memaar Al Morshedy — is one of Egypt's longest-running real estate developers, operating since 1983 with 21 mega projects, 40,000 residential units, and 4,000 admin units delivered across Maadi, Kattameya, and Greater Cairo.
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
              Four decades of integrated single-source development across Maadi and Greater Cairo
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
              Morshedy Group is one of Egypt's longest-running and most prolific real estate developers, established in{" "}
              <strong className="text-primary font-semibold">1983</strong>
              {" "}by{" "}
              <span className="text-accent font-medium">Mohamed Morshedy</span>
              {" "}under the original name{" "}
              <span className="text-accent font-medium">Memaar Al Morshedy</span>
              {" "}before its rebranding to Morshedy Group in recent years. The company is built on a fully integrated single-source model — it designs, plans, engineers, and constructs all of its developments in-house through{" "}
              <span className="text-accent font-medium">Degla for Real Estate Developments</span>, the founding pillar of the group — giving Morshedy Group end-to-end control over architectural quality and delivery timelines that very few Egyptian developers can match. Headquartered at{" "}
              <span className="text-accent font-medium">Tower 5, Bavaria Town</span>, on the Maadi Ring Road, the company has expanded beyond residential development into healthcare, education, and entertainment, and maintains a collaborative relationship with{" "}
              <span className="text-accent font-medium">Morshedy Group in Greece</span>
              {" "}— adding an international dimension to its long-established local presence. Across four decades of operation, Morshedy Group has delivered{" "}
              <strong className="text-primary font-semibold">21 mega projects</strong>, more than{" "}
              <strong className="text-primary font-semibold">40,000 residential units</strong>,{" "}
              <strong className="text-primary font-semibold">4,000 administrative units</strong>,{" "}
              <strong className="text-primary font-semibold">25 malls</strong>,{" "}
              <strong className="text-primary font-semibold">28 schools and nurseries</strong>, and{" "}
              <strong className="text-primary font-semibold">6 medical centers and hospitals</strong>, serving over{" "}
              <strong className="text-primary font-semibold">80,000 clients</strong>.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              In Maadi specifically, Morshedy Group's footprint along the{" "}
              <strong className="text-primary font-semibold">Ring Road</strong>
              {" "}is one of the densest of any developer in Cairo. The company's flagship Maadi destinations include{" "}
              <span className="text-accent font-medium">One Kattameya</span>
              {" "}— a fully integrated business and lifestyle community on the Ring Road that anchors Morshedy Group's presence in the Kattameya corridor;{" "}
              <span className="text-accent font-medium">Bavaria Town</span>
              {" "}— a mixed-use development that includes the company's own headquarters and combines residential, administrative, and commercial buildings under one address; and{" "}
              <span className="text-accent font-medium">Rehana Plaza</span>
              {" "}(also written as Rayhanah Plaza) — a mixed-use development between Degla and New Maadi, designed in collaboration with Amsterdam-based{" "}
              <span className="text-accent font-medium">Van Carter Studio</span>, featuring{" "}
              <strong className="text-primary font-semibold">297 residential units</strong>,{" "}
              <strong className="text-primary font-semibold">127 administrative units</strong>, a five-star hotel, and an integrated shopping mall. Beyond these three projects, Morshedy Group's broader Maadi and Greater Cairo portfolio includes{" "}
              <span className="text-accent font-medium">Skyline</span>,{" "}
              <span className="text-accent font-medium">Crystal Plaza</span>,{" "}
              <span className="text-accent font-medium">Gateway Business District</span>,{" "}
              <span className="text-accent font-medium">Axis Admin</span>,{" "}
              <span className="text-accent font-medium">The Plaza</span>,{" "}
              <span className="text-accent font-medium">Lakefront</span>,{" "}
              <span className="text-accent font-medium">West Courts</span>,{" "}
              <span className="text-accent font-medium">Zahra</span>,{" "}
              <span className="text-accent font-medium">Avenue</span>,{" "}
              <span className="text-accent font-medium">Gardens</span>,{" "}
              <span className="text-accent font-medium">Palms</span>,{" "}
              <span className="text-accent font-medium">Towers</span>,{" "}
              <span className="text-accent font-medium">Grand Gate</span>,{" "}
              <span className="text-accent font-medium">Grand City</span>,{" "}
              <span className="text-accent font-medium">D View</span>, and{" "}
              <span className="text-accent font-medium">Landmark</span>
              {" "}— making Morshedy Group one of the most prolific developers in the East and West Cairo commercial corridors.
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
              Morshedy Group Projects
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
              Looking for office, retail, or commercial space at One Kattameya, Rehana Plaza, or Bavaria Town?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Morshedy Group project fits your business needs.
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
