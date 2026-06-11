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

const PROJECTS = getProjectsByDeveloper("akoya");

const FACT_BULLETS = [
  "Established in 2008 as a merger between Green Valley and Elghad — one of Egypt's active commercial real estate developers in New Cairo",
  "Two strip mall developments in New Cairo: The Ledge (AUC Axis) and Leven Square (Mohamed Naguib Axis)",
  "The Ledge spans 6,900 sqm — commercial and retail on ground floor, medical clinics on first floor, administrative offices on second floor",
  "The Ledge located 3 minutes from AUC campus — surrounded by Katameya Gardens and Katameya Dunes",
  "Units starting from 2,500,000 EGP with flexible payment plans",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Al Rabat Properties", logo: "/images/alrabat-properties.png", slug: "al-rabat-properties" },
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "Inma Developments", logo: "/images/inma-developments.png", slug: "inma-developments" },
  { name: "KVRD", logo: "/images/kvrd-logo.png", slug: "kvrd" },
  { name: "Raslan Group", logo: "/images/raslan-group-logo.png", slug: "raslan-group" },
];

const akoyaOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Akoya Developments",
  url: "https://places-egy.com/developers/akoya",
  logo: "https://places-egy.com/images/Akoya-developments-logo.png",
  foundingDate: "2008",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Akoya Developments is a prominent Egyptian real estate developer established in 2008 as a merger between Green Valley and Elghad — with two strip mall developments in New Cairo's most active commercial corridors: The Ledge on the AUC Axis and Leven Square on Mohamed Naguib Axis.",
};

export default function AkoyaPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "Akoya Developments Projects & Offices in Egypt | PLACES",
    description: akoyaOrganizationSchema.description,
    url: akoyaOrganizationSchema.url,
    image: akoyaOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "Akoya Developments", url: "/developers/akoya" },
        ])}
      />
      <SchemaMarkup schema={akoyaOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Akoya-hero-image.jpeg"
            alt="Akoya Developments — strip mall projects in New Cairo"
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
            <span className="text-white">Akoya Developments</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-4xl">
            Akoya Developments
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            A prominent Egyptian real estate developer established in 2008 as a merger between Green Valley and Elghad — with two strip mall developments in New Cairo's most active commercial corridors: The Ledge on the AUC Axis and Leven Square on Mohamed Naguib Axis.
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
              Two strategic strip mall addresses in New Cairo — near AUC and Mohamed Naguib Axis
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
              <span className="text-accent font-medium">Akoya Developments</span>
              {" "}entered the Egyptian market in{" "}
              <strong className="text-primary font-semibold">2006</strong>
              {" "}and built a reputation for delivering units{" "}
              <strong className="text-primary font-semibold">during construction</strong>
              {" "}— not before — giving buyers and investors the opportunity to purchase on the ground rather than off-plan. The company was officially established in{" "}
              <strong className="text-primary font-semibold">2008</strong>
              {" "}as a merger between{" "}
              <span className="text-accent font-medium">Green Valley</span>
              {" "}and{" "}
              <span className="text-accent font-medium">Elghad</span>. Its commercial portfolio in New Cairo is built around two strip mall developments serving the Fifth Settlement and its surrounding corridors.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              <span className="text-accent font-medium">The Ledge Mall</span>
              {" "}is located in the heart of New Cairo —{" "}
              <strong className="text-primary font-semibold">3 minutes from the American University in Cairo (AUC)</strong>
              {" "}— spanning{" "}
              <strong className="text-primary font-semibold">6,900 sqm</strong>
              {" "}across three floors: ground floor retail and commercial, first floor medical clinics, and second floor administrative offices. The project sits at the entrance of Akoya Compound in the Andalus neighborhood, surrounded by{" "}
              <strong className="text-primary font-semibold">Katameya Gardens</strong>
              {" "}and{" "}
              <strong className="text-primary font-semibold">Katameya Dunes</strong>
              {" "}— one of New Cairo's highest-income residential catchments.{" "}
              <span className="text-accent font-medium">Leven Square</span>
              {" "}is located on{" "}
              <strong className="text-primary font-semibold">Mohamed Naguib Axis</strong>
              {" "}in New Cairo — a second strip mall development serving the growing commercial demand along one of the district's most active secondary corridors.
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
              Akoya Projects
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
              Looking for commercial, medical, or office space in an Akoya development?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about current availability at The Ledge near AUC or Leven Square on Mohamed Naguib Axis — and which development fits your business or investment requirements.
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
