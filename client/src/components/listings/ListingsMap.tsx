import { useMemo, useState, useEffect, useRef } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { fetchAllProjectCoords, type ProjectCoord } from "@/lib/project-coords";
import { listingCurrency } from "@/lib/currency";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight, Building2 } from "lucide-react";
import type { Listing } from "@/lib/supabase";

const CAIRO_CENTER: [number, number] = [31.2357, 30.0444];
const DEFAULT_ZOOM = 10;

type Props = {
  listings: Listing[];
};

type GroupedProject = {
  projectName: string;
  latitude: number;
  longitude: number;
  addressLine: string | null;
  units: Listing[];
};

function fromPrice(units: Listing[]): string {
  const priced = units.filter((u) => u.price != null && u.price > 0);
  if (priced.length === 0) return "Price on request";
  const min = Math.min(...priced.map((u) => u.price!));
  const currency = listingCurrency(priced[0]);
  return `From ${new Intl.NumberFormat("en-US").format(min)} ${currency}`;
}

// Public map. Groups listings by their `project` field, joins each project
// to its saved coordinates in the `project_coordinates` table, and renders
// ONE pin per project (not per listing). Projects without saved coordinates
// silently drop off the map — admin sees which are unmapped via the count
// chip in the legend.
export function ListingsMap({ listings }: Props) {
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const didFitRef = useRef(false);

  // Fetch all saved project coords once (cheap, small table). Cached across
  // views so the homepage + listings map share the request.
  const { data: coords = [] } = useQuery<ProjectCoord[]>({
    queryKey: ["project-coordinates"],
    queryFn: fetchAllProjectCoords,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const coordsMap = useMemo(() => {
    // NOTE: name is `map` (lowercase); using globalThis.Map because our
    // imported <Map> component shadows the built-in.
    const map = new globalThis.Map<string, ProjectCoord>();
    for (const c of coords) map.set(c.project_name.trim().toLowerCase(), c);
    return map;
  }, [coords]);

  // Group listings by project name, then attach the coords lookup. Any
  // project without saved coords is dropped from the map (still appears in
  // the list-cards column beside the map — this is a display concern only).
  const grouped = useMemo<GroupedProject[]>(() => {
    const buckets = new globalThis.Map<string, Listing[]>();
    for (const l of listings) {
      const name = (l.project ?? "").trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const arr = buckets.get(key) ?? [];
      arr.push(l);
      buckets.set(key, arr);
    }
    const out: GroupedProject[] = [];
    buckets.forEach((units, key) => {
      const coord = coordsMap.get(key);
      if (!coord) return;
      out.push({
        projectName: units[0].project ?? coord.project_name,
        latitude: coord.latitude,
        longitude: coord.longitude,
        addressLine: coord.address_line ?? null,
        units,
      });
    });
    return out;
  }, [listings, coordsMap]);

  const totalListings = listings.filter((l) => (l.project ?? "").trim()).length;
  const mappedUnitCount = grouped.reduce((n, g) => n + g.units.length, 0);
  const unmappedCount = Math.max(0, totalListings - mappedUnitCount);

  const selected = useMemo(
    () =>
      grouped.find(
        (g) => g.projectName.trim().toLowerCase() === selectedProject,
      ) ?? null,
    [grouped, selectedProject],
  );

  // Fit bounds to all pins on first load.
  useEffect(() => {
    if (!mapInstance || grouped.length === 0 || didFitRef.current) return;
    if (grouped.length === 1) {
      mapInstance.jumpTo({
        center: [grouped[0].longitude, grouped[0].latitude],
        zoom: 14,
      });
      didFitRef.current = true;
      return;
    }
    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    for (const g of grouped) {
      if (g.longitude < west) west = g.longitude;
      if (g.longitude > east) east = g.longitude;
      if (g.latitude < south) south = g.latitude;
      if (g.latitude > north) north = g.latitude;
    }
    mapInstance.fitBounds(
      [[west, south], [east, north]],
      { padding: 60, maxZoom: 14, duration: 0 },
    );
    didFitRef.current = true;
  }, [mapInstance, grouped]);

  // Reset auto-fit when filters change the list of listings.
  useEffect(() => {
    didFitRef.current = false;
  }, [listings]);

  const handlePinClick = (project: GroupedProject) => {
    setSelectedProject(project.projectName.trim().toLowerCase());
    trackEvent("listings_map_pin_click", {
      project_name: project.projectName,
      unit_count: project.units.length,
    });
  };

  if (grouped.length === 0) {
    return (
      <div className="h-[70vh] rounded-2xl border border-border/40 bg-white flex items-center justify-center text-center px-8">
        <div>
          <p className="text-sm font-medium text-primary mb-1">
            No mapped projects
          </p>
          <p className="text-xs text-muted-foreground">
            None of the current listings belong to a project with saved
            coordinates. Set project locations in the dashboard listing form.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] rounded-2xl overflow-hidden border border-border/40 shadow-sm">
      <Map
        ref={(m) => {
          if (m && m !== mapInstance) setMapInstance(m);
        }}
        viewport={{ center: CAIRO_CENTER, zoom: DEFAULT_ZOOM }}
        className="h-full w-full"
      >
        {grouped.map((g) => {
          const key = g.projectName.trim().toLowerCase();
          const isSelected = key === selectedProject;
          return (
            <MapMarker
              key={key}
              longitude={g.longitude}
              latitude={g.latitude}
              onClick={() => handlePinClick(g)}
            >
              <MarkerContent>
                {/* Count-badge marker — Airbnb pattern, but shows unit
                    count so multi-unit projects read differently from
                    single-unit ones. */}
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md border-2 transition-all ${
                    isSelected
                      ? "bg-accent text-white border-white scale-110 z-10"
                      : "bg-white text-primary border-accent/40 hover:bg-accent hover:text-white hover:border-white"
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  {g.units.length}
                </div>
              </MarkerContent>
            </MapMarker>
          );
        })}
      </Map>

      {selected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/40 relative">
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Close preview"
              className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors text-lg leading-none"
            >
              ×
            </button>
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1">
                Project
              </p>
              <p className="font-serif font-bold text-primary text-lg leading-tight mb-1">
                {selected.projectName}
              </p>
              {selected.addressLine && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                  {selected.addressLine}
                </p>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-primary">
                  {selected.units.length}{" "}
                  {selected.units.length === 1 ? "unit" : "units"} available
                </span>
                <span className="text-xs text-muted-foreground">
                  {fromPrice(selected.units)}
                </span>
              </div>
              <Link
                href={`/listings?q=${encodeURIComponent(selected.projectName)}`}
                onClick={() =>
                  trackEvent("listings_map_popup_click", {
                    project_name: selected.projectName,
                    unit_count: selected.units.length,
                  })
                }
                className="inline-flex items-center justify-center gap-1 w-full bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2.5 rounded-full transition-colors"
              >
                View all units
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-primary shadow-md border border-border/40">
        <span className="w-2 h-2 rounded-full bg-accent" />
        {grouped.length} {grouped.length === 1 ? "project" : "projects"}
        {unmappedCount > 0 && (
          <span className="text-muted-foreground">
            {" "}· {unmappedCount} unit{unmappedCount === 1 ? "" : "s"} unmapped
          </span>
        )}
      </div>
    </div>
  );
}
