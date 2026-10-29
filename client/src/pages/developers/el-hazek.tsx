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

const PROJECTS = getProjectsByDeveloper("el-hazek");

const FACT_BULLETS = [
  "Founded 1979 — over 46 years of real estate, construction, hotel, tourism, and industrial development across Egypt",
  "Three commercial developments in New Cairo: Lake Town (Bin Zayed Axis), Lakeview Boutique (El Nasr Street), Downtown (South 90 Street)",
  "Lake Town on Bin Zayed Axis — strategically located 15 minutes from Cairo International Airport — spanning ground plus two floors with commercial units, administrative offices, medical clinics, hypermarket, and 1,064-car garage",
  "Recipient of \"Best Sustainable Real Estate Developer\" award — Egyptian Real Estate Awards — and member of the Egyptian Green Building Council",
  "Portfolio includes Baron Tower, Al Jowhara Tower, New Giza Buildings, Maadi Sporting and Yacht Club, Sheraton Sharm Hotel, and Downtown Katameya Mall",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "Akoya Developments", logo: "/images/Akoya-developments-logo.png", slug: "akoya" },
  { name: "Catalyst Developments", logo: "/images/catalyst-logo.png", slug: "catalyst" },
  { name: "Inma Developments", logo: "/images/inma-developments.png", slug: "inma-developments" },
  { name: "Al Rabat Properties", logo: "/images/alrabat-properties.png", slug: "al-rabat-properties" },
  { name: "Morshedy Group", logo: "/images/morshedy-group.png", slug: "morshedy" },
];

const elHazekOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "El Hazek Group",
  url: "https://places-egy.com/developers/el-hazek",
  logo: "https://places-egy.com/images/El-Hazek-Group.png",
  foundingDate: "1979",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "El Hazek Group is one of Egypt's most established real estate and construction groups — founded in 1979 and operating across residential, commercial, tourism, and industrial real estate for over 46 years — with three commercial developments in New Cairo.",
};

export default function ElHazekPage() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");

  const projectTypes = useMemo<("All" | ProjectType)[]>(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.type)))],
    [],
  );

  const filteredProjects =
    filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  useDocumentMeta({
    title: "El Hazek Group Projects & Offices in Egypt | PLACES",
    description: elHazekOrganizationSchema.description,
    url: elHazekOrganizationSchema.url,
    image: elHazekOrganizationSchema.logo,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Developers", url: "/developers" },
          { name: "El Hazek Group", url: "/developers/el-hazek" },
        ])}
      />
      <SchemaMarkup schema={elHazekOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Downtown-Mall.jpeg"
            alt="El Hazek Group — Downtown commercial building on South 90 Street, New Cairo"
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
            <span className="text-white">El Hazek Group</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-4xl">
            El Hazek Group
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            One of Egypt's most established real estate and construction groups — founded in 1979 and operating across residential, commercial, tourism, and industrial real estate for over 46 years — with three commercial developments in New Cairo: Lake Town on Bin Zayed Axis, Lakeview Boutique on El Nasr Street, and Downtown on South 90 Street.
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
              46 years of Egyptian real estate — three commercial addresses across New Cairo's key business corridors
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
              <span className="text-accent font-medium">El Hazek Group</span>
              {" "}was established in{" "}
              <strong className="text-primary font-semibold">1979</strong>
              {" "}and has built one of Egypt's most diversified real estate portfolios — spanning residential compounds, commercial centers, hotels, tourism projects, and industrial developments. The group is known for its commitment to{" "}
              <strong className="text-primary font-semibold">on-time delivery</strong>,{" "}
              <strong className="text-primary font-semibold">sustainable development</strong>, and{" "}
              <strong className="text-primary font-semibold">quality construction</strong>
              {" "}— receiving the{" "}
              <span className="text-accent font-medium">"Best Sustainable Real Estate Developer"</span>
              {" "}award from the Egypt Real Estate Awards and membership in the{" "}
              <span className="text-accent font-medium">Egyptian Green Building Council</span>.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Within commercial real estate, El Hazek's New Cairo portfolio covers three distinct developments across{" "}
              <strong className="text-primary font-semibold">Bin Zayed Axis</strong>,{" "}
              <strong className="text-primary font-semibold">El Nasr Street</strong>, and{" "}
              <strong className="text-primary font-semibold">South 90 Street</strong>
              {" "}— serving businesses and investors evaluating mixed-use mall and business park opportunities across the district's most active corridors.{" "}
              <span className="text-accent font-medium">Lake Town</span>
              {" "}sits on the Bin Zayed Axis 15 minutes from Cairo International Airport — featuring commercial units, administrative offices, medical clinics, a hypermarket, and a{" "}
              <strong className="text-primary font-semibold">1,064-car garage</strong>.{" "}
              <span className="text-accent font-medium">Lakeview Boutique</span>
              {" "}on El Nasr Street and{" "}
              <span className="text-accent font-medium">Downtown</span>
              {" "}on South 90 Street complete the portfolio. El Hazek's broader track record includes Baron Tower, Al Jowhara Tower, New Giza Buildings, Maadi Sporting and Yacht Club, Sheraton Sharm Hotel, and Downtown Katameya Mall.
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
              El Hazek Projects
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
      <DeveloperInventory slug="el-hazek" />

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
              Looking for commercial or office space in an El Hazek development in New Cairo?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about current availability across Lake Town, Lakeview Boutique, and Downtown — and which El Hazek development fits your business or investment requirements.
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
