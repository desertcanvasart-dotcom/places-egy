import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema } from "@/lib/schema";
import { getProjectsByDeveloper, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/projects";

const PROJECTS = getProjectsByDeveloper("amer-group");

const FACT_BULLETS = [
  "Founded in 1985 by Chairman and CEO Mansour Amer — one of Egypt's largest privately held real estate and hospitality groups",
  "Administrative and commercial presence in New Cairo through Top 90 — located on South 90 Street, Fifth Settlement",
  "Part of a broader group portfolio that includes Porto resort brands, shopping malls, hotel chains, and restaurant operations across Egypt",
  "Over 12,000 jobs created across the group's operations",
  "Decades of commercial property management experience drawn from operating shopping malls and mixed-use destinations",
];

const RELATED: { name: string; logo: string; slug?: string }[] = [
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "Emaar Misr", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "MARAKEZ", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
];

const amerGroupOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Amer Group",
  url: "https://places-egy.com/developers/amer-group",
  logo: "https://places-egy.com/images/amer-group-logo.png",
  founder: {
    "@type": "Person",
    name: "Mansour Amer",
  },
  foundingDate: "1985",
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressLocality: "Cairo",
  },
  description:
    "Amer Group is one of Egypt's largest privately held real estate and hospitality conglomerates, founded in 1985 with over 40 years of delivering mixed-use destinations across Egypt — and Top 90 on South 90 Street as their flagship administrative and commercial address in New Cairo.",
};

const FAQ = [
  {
    q: "What is Amer Group known for in Egypt?",
    a: "Amer Group is one of Egypt's largest privately held real estate and hospitality conglomerates, founded in 1985. The group is best known for its Porto resort brand across Egypt's North Coast, Red Sea, and Nile Delta regions — and has a commercial and administrative presence in New Cairo through Top 90 on South 90 Street.",
  },
  {
    q: "Where is Amer Group's commercial project in New Cairo?",
    a: "Amer Group's commercial and administrative building in New Cairo is Top 90, located on South 90 Street in the Fifth Settlement. South 90 Street is one of New Cairo's most active business corridors, home to major banks, corporate offices, and commercial destinations.",
  },
  {
    q: "Can I buy or lease an office in an Amer Group development in New Cairo?",
    a: "Yes. Top 90 on South 90 Street in New Cairo offers administrative office and commercial units available for both sale and lease. PLACES can provide current availability, pricing, and advisory on whether this development fits your business requirements.",
  },
  {
    q: "Is Amer Group a reliable developer in Egypt?",
    a: "Amer Group has been operating in Egypt's real estate market since 1985 — with a portfolio of delivered projects spanning residential compounds, resort destinations, shopping malls, and commercial buildings. The group's long track record and diversified operations make it one of Egypt's most established developer names.",
  },
  {
    q: "What type of units are available in Top 90 New Cairo?",
    a: "Top 90 on South 90 Street offers administrative office units and commercial spaces. The building is positioned on one of New Cairo's highest-traffic business streets, making it suited for corporate offices, professional services, and commercial operators seeking a Fifth Settlement address.",
  },
];

export default function AmerGroupPage() {
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
          { name: "Amer Group", url: "/developers/amer-group" },
        ])}
      />
      <SchemaMarkup schema={amerGroupOrganizationSchema} />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/top-90-mall.jpeg"
            alt="Amer Group Top 90 administrative and commercial building on South 90 Street, New Cairo"
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
            <span className="text-white">Amer Group</span>
          </nav>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl">
            Amer Group — Administrative & Commercial Real Estate in New Cairo
          </h1>
          <p className="text-base md:text-lg text-white/90 font-medium mb-8 max-w-4xl">
            One of Egypt's largest and most established developers — with over 40 years of delivering mixed-use destinations across Egypt, and Top 90 on South 90 Street as their flagship administrative and commercial address in New Cairo.
          </p>
          <a href="#projects">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-12 text-base shadow-xl shadow-accent/30 transition-all hover:scale-105"
            >
              Browse available units <ArrowRight className="ml-2 w-4 h-4" />
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
              Four decades of building Egypt's most iconic destinations
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
              Amer Group was founded in{" "}
              <strong className="text-primary font-semibold">1985</strong>
              {" "}by{" "}
              <span className="text-accent font-medium">Mansour Amer</span>
              {" "}— one of Egypt's largest privately held real estate and hospitality conglomerates, with a portfolio spanning residential compounds, resort destinations, shopping malls, hotel brands, and restaurant chains across the country. While Amer Group is best known for its{" "}
              <span className="text-accent font-medium">Porto</span>
              {" "}resort brand — which stretches from the North Coast to the Red Sea — the group has a significant and often overlooked footprint in Cairo's commercial and administrative real estate market. Their presence on{" "}
              <strong className="text-primary font-semibold">South 90 Street</strong>
              {" "}in New Cairo through{" "}
              <span className="text-accent font-medium">Top 90</span>
              {" "}places them at the center of one of the city's most active commercial and administrative corridors.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              South 90 Street in the{" "}
              <strong className="text-primary font-semibold">Fifth Settlement</strong>
              {" "}sits within New Cairo's primary commercial corridor — surrounded by major financial institutions, corporate headquarters, and one of the highest concentrations of administrative office supply in Greater Cairo. For businesses and investors evaluating office space in New Cairo, Amer Group's presence on this street signals both location credibility and long-term asset stability. Beyond Top 90, the broader Amer Group portfolio includes{" "}
              <strong className="text-primary font-semibold">12,000+ jobs</strong>
              {" "}created across operations spanning Porto resorts, shopping malls, hotel chains, and restaurant operations — giving the company decades of commercial property management experience that informs how it operates its administrative and commercial assets in New Cairo.
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
              Amer Group Projects
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

      {/* FAQ */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              FAQ
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-2">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/40 py-1">
                <AccordionTrigger className="text-base font-medium text-primary hover:text-accent hover:no-underline text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
              Looking for office or commercial space in an Amer Group development?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to a PLACES advisor about availability, pricing, and whether Top 90 on South 90 Street fits your business requirements.
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
