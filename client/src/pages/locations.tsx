import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, locationsCollectionSchema } from "@/lib/schema";

const LOCATIONS = [
  {
    name: "New Cairo",
    desc: "Cairo's fastest-growing business district — premium office parks, retail destinations, and Egypt's most active commercial developments.",
    image: "/images/new-cairo.jpg",
    slug: "new-cairo",
  },
  {
    name: "Sheikh Zayed",
    desc: "A premium west Cairo corridor with luxury-leaning commercial developments and strong consumer spending.",
    image: "/images/Sheikh-zayed.jpg",
    slug: "sheikh-zayed",
  },
  {
    name: "6th October",
    desc: "One of Cairo's largest demographic catchments — large-scale malls, business parks, and high-volume retail.",
    image: "/images/6thoctober .jpg",
    slug: "6th-october",
  },
  {
    name: "Downtown Cairo",
    desc: "Cairo's historic commercial core — established businesses, heritage retail, and high daily footfall.",
    image: "/images/downtown-cairo.jpg",
    slug: "downtown-cairo",
  },
  {
    name: "Sheraton",
    desc: "A strategic commercial corridor connecting Cairo's airport district to the city center — service-oriented retail and offices.",
    image: "/images/sheraton.jpg",
    slug: "sheraton",
  },
  {
    name: "Maadi",
    desc: "An established residential district with growing demand for neighborhood retail, F&B, and professional office space.",
    image: "/images/Maadi.jpg",
    slug: "maadi",
  },
];

export default function Locations() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Locations", url: "/locations" },
        ])}
      />
      <SchemaMarkup
        schema={locationsCollectionSchema(
          LOCATIONS.map((l) => ({ name: l.name, description: l.desc })),
        )}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-6">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-4 leading-tight flex items-center gap-3">
            <span>Locations we cover</span>
            <MapPin className="w-7 h-7 md:w-9 md:h-9 text-accent shrink-0" />
          </h1>
          <p className="text-lg text-muted-foreground">
            PLACES operates across Cairo's most active commercial and administrative districts — each with its own demand profile, tenant mix, and investment dynamics.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-secondary/60 rounded-2xl border border-border/40 p-7 md:p-10">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl md:text-5xl font-serif font-bold text-accent mb-1">6</p>
                <p className="text-xs text-primary/60 uppercase tracking-widest">Districts</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-serif font-bold text-accent mb-1">150+</p>
                <p className="text-xs text-primary/60 uppercase tracking-widest">Projects</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-serif font-bold text-accent mb-1">1000+</p>
                <p className="text-xs text-primary/60 uppercase tracking-widest">Listings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All locations — 2 per row */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-6">
            {LOCATIONS.map((loc) => (
              <a
                key={loc.name}
                href={`/locations/${loc.slug}`}
                className="group relative h-72 rounded-2xl overflow-hidden block hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <h2 className="text-2xl font-serif font-bold text-white">{loc.name}</h2>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{loc.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-10 border-t border-border/40">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-2">
                Not sure which location fits?
              </h2>
              <p className="text-muted-foreground">
                Tell us your requirements and we'll recommend the right district.
              </p>
            </div>
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 shrink-0">
                Talk to an advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
