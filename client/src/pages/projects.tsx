import { Link, useLocation } from "wouter";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Building2, MapPin, Search, X } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { useDocumentMeta } from "@/lib/use-document-meta";
import {
  PROJECTS,
  PROJECT_TYPE_LABELS,
  DEVELOPER_DISPLAY_NAMES,
  type Project,
  type ProjectType,
} from "@/lib/projects";
import { LOCATION_OPTIONS } from "@/lib/enums";

// Read filter state from URL params on mount so deep-links and back-button
// work. Filter state is mirrored back to the URL on every change.
function getInitialState() {
  if (typeof window === "undefined") {
    return { q: "", subtype: null as ProjectType | null, developer: null as string | null, location: null as string | null };
  }
  const params = new URLSearchParams(window.location.search);
  const subtypeParam = params.get("subtype");
  const validSubtype = (Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).find(
    (k) => k === subtypeParam,
  );
  return {
    q: params.get("q") ?? "",
    subtype: validSubtype ?? null,
    developer: params.get("developer"),
    location: params.get("location"),
  };
}

export default function ProjectsPage() {
  useDocumentMeta({
    title: "Office Projects in Cairo — Business Parks, Buildings & Mixed-Use | PLACES",
    description:
      "Explore administrative office projects across Cairo — business parks, standalone buildings, and mixed-use developments. Curated by PLACES, updated as new projects break ground.",
    url: "https://places-egy.com/projects",
  });

  const [, setLocation] = useLocation();
  const initial = getInitialState();
  const [q, setQ] = useState(initial.q);
  const [subtype, setSubtype] = useState<ProjectType | null>(initial.subtype);
  const [developer, setDeveloper] = useState<string | null>(initial.developer);
  const [locationFilter, setLocationFilter] = useState<string | null>(initial.location);

  // Mirror current filter state to URL params (replace, not push, so back
  // button doesn't accumulate filter steps).
  const syncUrl = (next: { q?: string; subtype?: ProjectType | null; developer?: string | null; location?: string | null }) => {
    const params = new URLSearchParams();
    const finalQ = next.q !== undefined ? next.q : q;
    const finalSubtype = next.subtype !== undefined ? next.subtype : subtype;
    const finalDev = next.developer !== undefined ? next.developer : developer;
    const finalLoc = next.location !== undefined ? next.location : locationFilter;
    if (finalQ) params.set("q", finalQ);
    if (finalSubtype) params.set("subtype", finalSubtype);
    if (finalDev) params.set("developer", finalDev);
    if (finalLoc) params.set("location", finalLoc);
    const qs = params.toString();
    setLocation(qs ? `/projects?${qs}` : "/projects", { replace: true });
  };

  // Unique developer slugs across all projects, sorted by display name.
  const developerOptions = useMemo(() => {
    const slugs = new Set<string>();
    for (const p of PROJECTS) slugs.add(p.developer);
    return Array.from(slugs).sort((a, b) => {
      const aLabel = DEVELOPER_DISPLAY_NAMES[a] ?? a;
      const bLabel = DEVELOPER_DISPLAY_NAMES[b] ?? b;
      return aLabel.localeCompare(bLabel);
    });
  }, []);

  // All 6 subtypes — listed in display order (admin first, then commercial).
  const subtypeOptions: ProjectType[] = [
    "business-park",
    "business-building",
    "mixed-use",
    "mega-mall",
    "strip-mall",
    "drive-through",
  ];

  const filteredProjects = useMemo<Project[]>(() => {
    return PROJECTS.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (subtype && p.type !== subtype) return false;
      if (developer && p.developer !== developer) return false;
      // Location matching against the canonical prefix — projects' location
      // strings often include sub-area (e.g. "New Cairo · 70 Street"), so we
      // match the start.
      if (locationFilter && !p.location.toLowerCase().startsWith(locationFilter.toLowerCase())) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [q, subtype, developer, locationFilter]);

  const hasActiveFilter = !!(q || subtype || developer || locationFilter);

  const clearAll = () => {
    setQ("");
    setSubtype(null);
    setDeveloper(null);
    setLocationFilter(null);
    setLocation("/projects", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Projects", url: "/projects" },
        ])}
      />
      <SchemaMarkup
        schema={itemListSchema({
          name: "All Projects",
          url: "/projects",
          items: PROJECTS.slice(0, 100).map((p) => ({
            name: p.name,
            url: `/projects?q=${encodeURIComponent(p.name)}`,
          })),
        })}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4 leading-tight">
            All Projects
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse {PROJECTS.length}+ projects across Egypt's leading developers — from business parks and standalone office buildings to strip malls, mega malls, and mixed-use destinations.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="pb-8 border-b border-border/40 bg-secondary/30">
        <div className="container mx-auto px-6 md:px-10 space-y-4">
          {/* Search + clear */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search projects by name..."
                className="pl-11 h-11 bg-white border-border/40"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  syncUrl({ q: e.target.value });
                }}
              />
            </div>
            <div className="grid grid-cols-2 md:flex md:flex-row gap-3">
              <Select
                value={developer ?? "all"}
                onValueChange={(v) => {
                  const next = v === "all" ? null : v;
                  setDeveloper(next);
                  syncUrl({ developer: next });
                }}
              >
                <SelectTrigger className="bg-white h-11 border-border/40 md:w-52">
                  <SelectValue placeholder="All developers" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  <SelectItem value="all">All developers</SelectItem>
                  {developerOptions.map((slug) => (
                    <SelectItem key={slug} value={slug}>
                      {DEVELOPER_DISPLAY_NAMES[slug] ?? slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={locationFilter ?? "all"}
                onValueChange={(v) => {
                  const next = v === "all" ? null : v;
                  setLocationFilter(next);
                  syncUrl({ location: next });
                }}
              >
                <SelectTrigger className="bg-white h-11 border-border/40 md:w-44">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {LOCATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subtype pills */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSubtype(null);
                syncUrl({ subtype: null });
              }}
              className={`text-xs font-medium px-3.5 py-2 rounded-full border transition-colors ${
                subtype === null
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground/70 border-border/60 hover:border-accent hover:text-accent"
              }`}
            >
              All types
            </button>
            {subtypeOptions.map((s) => {
              const active = subtype === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    const next = active ? null : s;
                    setSubtype(next);
                    syncUrl({ subtype: next });
                  }}
                  className={`text-xs font-medium px-3.5 py-2 rounded-full border transition-colors ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-foreground/70 border-border/60 hover:border-accent hover:text-accent"
                  }`}
                >
                  {PROJECT_TYPE_LABELS[s]}
                </button>
              );
            })}
            {hasActiveFilter && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium px-3 py-2 inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10 flex-1">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredProjects.length}</span>{" "}
              {filteredProjects.length === 1 ? "project" : "projects"}
            </p>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary mb-2">No projects match your filters</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Try removing some filters or browse all projects.
              </p>
              <Button onClick={clearAll} variant="outline">Clear all filters</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project, i) => (
                <div
                  key={`${project.name}-${i}`}
                  className="group relative h-72 rounded-2xl overflow-hidden"
                >
                  <img
                    src={project.image}
                    alt={project.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/10" />
                  <div className="relative z-10 h-full flex flex-col justify-between p-5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white bg-accent px-2.5 py-1 rounded-full shadow-sm">
                        {project.tag ?? PROJECT_TYPE_LABELS[project.type]}
                      </span>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                        <Building2 className="w-3 h-3" />
                        {(DEVELOPER_DISPLAY_NAMES[project.developer] ?? project.developer).replace(/\s+Developments?$/i, "")}
                      </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 border-t border-border/40">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-1">
                Looking for something specific?
              </h2>
              <p className="text-muted-foreground">
                Talk to a PLACES advisor about availability, pricing, and project fit.
              </p>
            </div>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 shrink-0"
              >
                Talk to an advisor <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
