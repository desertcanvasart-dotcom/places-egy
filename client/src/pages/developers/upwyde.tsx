import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("upwyde");

const FACT_BULLETS = [
  "Founded by six real estate professionals with a combined half-century of experience in Egypt's real estate market",
  "Over 100,000 sqm of land developed across Egypt — more than 2,000 property units delivered",
  "Four mixed-use commercial developments in New Cairo: IT (South 90), Cinco (North 90), Park Vie (El Nasr Street), Granoy (North 90)",
  "Cinco Mall spans 21,000 sqm on North 90 Street — offering commercial, administrative, and medical units from 60 sqm, with unit prices starting from 25,500,000 EGP",
  "IT Business Hub and Granoy delivered with units starting from 39 sqm and 31 sqm respectively — targeting small and mid-size businesses and investors",
  "Portfolio extends beyond New Cairo into Sheikh Zayed, 6th October, and the New Administrative Capital",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "Inma Developments", logo: "/images/inma-developments.png", slug: "inma-developments" },
  { name: "Afaaq Developments", logo: "/images/Afaaq-developments-logo.png", slug: "afaaq" },
  { name: "Al Rabat Properties", logo: "/images/alrabat-properties.png", slug: "al-rabat-properties" },
  { name: "Larz Developments", logo: "/images/larz-developments-logo.png", slug: "larz" },
];

const upwydeOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Upwyde",
  url: "https://places-egy.com/developers/upwyde",
  logo: "https://places-egy.com/images/upwyde-logo.png",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Upwyde is one of Egypt's most active commercial real estate developers — founded by six industry veterans with a combined half-century of experience — delivering four mixed-use commercial developments across New Cairo's most active business corridors: IT, Cinco, Park Vie, and Granoy.",
};

export default function UpwydePage() {
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
          { name: "Upwyde", url: "/developers/upwyde" },
        ])}
      />
      <SchemaMarkup schema={upwydeOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/It-Business-Hub-New-Cairo.webp"
            alt="Upwyde — IT Business Hub on South 90 Street, New Cairo"
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
            <span className="text-white">Upwyde</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-4xl">
            Upwyde
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            One of Egypt's most active commercial real estate developers — founded by six industry veterans with a combined half-century of experience — delivering four mixed-use commercial developments across New Cairo's most active business corridors: IT, Cinco, Park Vie, and Granoy.
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
              Six founders. Fifty years of experience. Four commercial addresses in New Cairo.
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
              <span className="text-accent font-medium">Upwyde</span>
              {" "}was established when{" "}
              <strong className="text-primary font-semibold">six prominent real estate businessmen</strong>
              {" "}banded together and pooled their knowledge to offer investors and businesses a different kind of commercial experience in Egypt. The company brings to the market more than{" "}
              <strong className="text-primary font-semibold">25 years</strong>
              {" "}of regional real estate experience, covering over{" "}
              <strong className="text-primary font-semibold">100,000 sqm</strong>
              {" "}of land across Egypt, and has delivered more than{" "}
              <strong className="text-primary font-semibold">2,000 property units</strong>
              {" "}across residential and commercial projects. Upwyde's approach starts with the selection of prime locations — each project positioned near major axes and roads for maximum accessibility — then divides each development to balance commercial units with generous service and amenity space, ensuring owners and tenants find what they need within the project itself.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Within New Cairo's commercial real estate market, Upwyde has built one of the most concentrated portfolios of mixed-use mall developments along the district's key business corridors.{" "}
              <span className="text-accent font-medium">IT Business Hub</span>
              {" "}is located on{" "}
              <strong className="text-primary font-semibold">South 90 Street</strong>
              {" "}near the Ring Road and Suez Road — a commercial, administrative, and medical mall with units from 39 sqm.{" "}
              <span className="text-accent font-medium">Cinco Mall</span>
              {" "}is on{" "}
              <strong className="text-primary font-semibold">North 90 Street</strong>
              {" "}directly facing Maxim Mall and Emerald Park, spanning{" "}
              <strong className="text-primary font-semibold">21,000 sqm</strong>
              {" "}in one of New Cairo's most visible business addresses.{" "}
              <span className="text-accent font-medium">Granoy Mall</span>
              {" "}is also on North 90 Street, minutes from the Ring Road and Suez Road — a ground-plus-four-floor mixed-use development from 31 sqm. And{" "}
              <span className="text-accent font-medium">Park Vie</span>
              {" "}is on{" "}
              <strong className="text-primary font-semibold">El Nasr Street</strong>
              {" "}in New Cairo's Golden Square — serving the First Settlement's commercial and medical investment market. Together, the four developments cover South 90, North 90, and El Nasr — offering multiple entry points into New Cairo's growing business ecosystem at a range of unit sizes and price points.
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
              Upwyde Projects
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
              Looking for office, retail, or clinic space in an Upwyde development in New Cairo?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about current availability across IT, Cinco, Park Vie, and Granoy — and which Upwyde project fits your business model or investment requirements.
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
