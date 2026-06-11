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

const PROJECTS = getProjectsByDeveloper("madinet-masr");

const FACT_BULLETS = [
  "Operating since 1959 — originally founded as Madinet Nasr for Housing & Development, the company that helped develop Nasr City",
  "Rebranded to Madinet Masr in 2023, signaling a broader strategic vision built around innovation, mixed-use communities, and long-term urban development",
  "Flagship Taj City spans 3.7 million sqm on the Suez Road and Ring Road, directly across from Cairo International Airport",
  "Tajed — the company's first commercial development in New Cairo — features 30,000 sqm of GLA with direct access to the Ring Road and Cairo–Suez Road",
  "Carrefour (operated by Majid Al Futtaim) is one of Tajed's first major tenants and a key traffic driver within the project",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
];

const madinetMasrOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Madinet Masr",
  alternateName: "Madinet Nasr for Housing & Development",
  url: "https://places-egy.com/developers/madinet-masr",
  logo: "https://places-egy.com/images/Madinest-masr-logo.png",
  foundingDate: "1959",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Madinet Masr is one of Egypt's most distinguished real estate developers with over 65 years of delivering large-scale integrated communities — and the developer behind Tajed, New Cairo's first fully integrated commercial district on the Ring Road.",
};

export default function MadinetMasrPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "Madinet Masr Projects & Offices in Egypt | PLACES",
    description: madinetMasrOrganizationSchema.description,
    url: madinetMasrOrganizationSchema.url,
    image: madinetMasrOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Madinet Masr", url: "/developers/madinet-masr" },
        ])}
      />
      <SchemaMarkup schema={madinetMasrOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/tajed.jpeg"
            alt="Madinet Masr Tajed commercial district on the Ring Road, New Cairo"
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
            <span className="text-white">Madinet Masr</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Madinet Masr
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            One of Egypt's most distinguished real estate developers with over 65 years of delivering large-scale integrated communities — and the developer behind Tajed, New Cairo's first fully integrated commercial district on the Ring Road.
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
              Over 65 years of building Egypt's most ambitious communities — now expanding into integrated commercial real estate
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
              Madinet Masr has been shaping Egypt's urban landscape since{" "}
              <strong className="text-primary font-semibold">1959</strong>, originally founded under the name{" "}
              <span className="text-accent font-medium">Madinet Nasr for Housing & Development</span>
              {" "}— the company that helped develop{" "}
              <strong className="text-primary font-semibold">Nasr City</strong>, one of Cairo's most significant urban expansions. In{" "}
              <strong className="text-primary font-semibold">2023</strong>, the company rebranded to Madinet Masr, signaling a broader strategic vision built around innovation, mixed-use communities, and long-term urban development. The company's flagship project,{" "}
              <span className="text-accent font-medium">Taj City</span>, is a mixed-use development spanning{" "}
              <strong className="text-primary font-semibold">3.7 million square meters</strong>
              {" "}of land located on the Suez Road and Ring Road, directly across from Cairo International Airport — positioned in the heart of New Cairo and 10 minutes from Heliopolis and Nasr City. Taj City is not just a residential compound — it is a self-contained urban destination that integrates residential neighborhoods, retail, hospitality, healthcare, education, and commercial activity within a single master plan.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              For businesses and investors evaluating commercial real estate in New Cairo, Madinet Masr's most relevant development is{" "}
              <span className="text-accent font-medium">Tajed</span>
              {" "}— the company's first commercial development in New Cairo, strategically located with direct access to the{" "}
              <strong className="text-primary font-semibold">Ring Road</strong>
              {" "}and{" "}
              <strong className="text-primary font-semibold">Cairo–Suez Road</strong>, spanning a gross leasable area of{" "}
              <strong className="text-primary font-semibold">30,000 square meters</strong>
              {" "}and featuring a diverse mix of retail activities, brands, and services. Tajed is already attracting leading brands — with{" "}
              <span className="text-accent font-medium">Carrefour</span>, operated by Majid Al Futtaim, becoming one of its first major tenants and serving as a key traffic driver within the project. Tajed aligns with Madinet Masr's strategy to expand its mixed-use portfolio and reinforce its vision of developing fully integrated destinations that bring together retail, services, and entertainment in one location. For commercial investors and retail operators evaluating strip mall and mixed-use commercial opportunities in New Cairo, Tajed represents one of the most strategically connected new commercial addresses in the district — with Ring Road access drawing traffic from across East Cairo and beyond.
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
              Madinet Masr Projects
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
              Looking for retail, F&B, or commercial space at Tajed?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and which Madinet Masr project fits your business needs.
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
