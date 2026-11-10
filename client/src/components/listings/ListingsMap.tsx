import { useMemo, useState, useEffect, useRef } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { fetchAllProjectCoords, type ProjectCoord } from "@/lib/project-coords";
import { listingCurrency, priceInEgp } from "@/lib/currency";
import { listingUrl } from "@/lib/listings";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";
import type { Listing } from "@/lib/supabase";

const CAIRO_CENTER: [number, number] = [31.2357, 30.0444];
// Every PLACES listing is in Greater Cairo/Giza. A saved pin outside this box
// is a data-entry mistake (e.g. a project geocoded to Alexandria); it's left
// off the map so it can't drag the view out to the whole country.
const inGreaterCairo = (lat: number, lng: number) => lat > 29.7 && lat < 30.4 && lng > 30.7 && lng < 31.8;
const DEFAULT_ZOOM = 10;
// Must be a constant: <Map> jumps to `viewport` whenever it changes, so a new
// object on every render would snap the map back to central Cairo each time.
const INITIAL_VIEWPORT = { center: CAIRO_CENTER, zoom: DEFAULT_ZOOM };

type Props = {
  listings: Listing[];
  // When embedded on a scrolling page (homepage, guides), disable wheel
  // zoom so users trying to scroll the page don't accidentally hijack
  // the zoom. Wheel zoom stays on for the standalone /listings map view.
  embedded?: boolean;
  /** Render nothing (instead of the "No mapped projects" box) when no pins. */
  hideWhenEmpty?: boolean;
  /** Overrides the frame height classes. */
  heightClassName?: string;
  /** Called if the map hasn't drawn within MAP_LOAD_TIMEOUT_MS (tile provider down). */
  onFail?: () => void;
  /** Merge pins that would overlap on screen into one numbered bubble. */
  cluster?: boolean;
};

// Two pins closer than this (in screen pixels) merge into one bubble.
const CLUSTER_PX = 90;

type Cluster = { key: string; latitude: number; longitude: number; members: GroupedProject[]; units: number };

// Bounds that cover the main group of pins. A pin far from all the others
// (usually a project saved in the wrong place) is left outside the view so it
// can't zoom the whole map out; it's still there if the visitor zooms out.
function pinBounds(points: GroupedProject[]): [[number, number], [number, number]] {
  const median = (xs: number[]) => {
    const v = [...xs].sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  };
  const mLat = median(points.map((p) => p.latitude));
  const mLng = median(points.map((p) => p.longitude));
  const dist = (p: GroupedProject) => Math.hypot(p.latitude - mLat, p.longitude - mLng);
  const limit = Math.max(median(points.map(dist)) * 3, 0.05);
  const kept = points.length >= 5 ? points.filter((p) => dist(p) <= limit) : points;
  const use = kept.length > 0 ? kept : points;
  const lats = use.map((p) => p.latitude);
  const lngs = use.map((p) => p.longitude);
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
}

const MAP_LOAD_TIMEOUT_MS = 10_000;

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
  // Cheapest compared in EGP, shown in that unit's own currency.
  const cheapest = priced.reduce((a, b) => ((priceInEgp(b) ?? Infinity) < (priceInEgp(a) ?? Infinity) ? b : a));
  return `From ${new Intl.NumberFormat("en-US").format(cheapest.price!)} ${listingCurrency(cheapest)}`;
}

// Public map. Groups listings by their `project` field, joins each project
// to its saved coordinates in the `project_coordinates` table, and renders
// ONE pin per project (not per listing). Projects without saved coordinates
// silently drop off the map — admin sees which are unmapped via the count
// chip in the legend.
export function ListingsMap({ listings, embedded = false, hideWhenEmpty = false, heightClassName, onFail, cluster = false }: Props) {
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  // Keys of the project(s) shown in the preview card (several when a bubble
  // holds projects saved at the same spot).
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const userMovedRef = useRef(false);

  // Fetch all saved project coords once (cheap, small table). Cached across
  // views so the homepage + listings map share the request.
  const { data: coords = [] } = useQuery<ProjectCoord[]>({
    queryKey: ["project-coordinates"],
    queryFn: fetchAllProjectCoords,
    // Short staleTime so newly-pinned projects surface quickly. React Query
    // refetches automatically when the tab regains focus — which means an
    // admin who pins a project in one tab, then switches back to the
    // homepage tab, sees the new pin without needing to hard-refresh.
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
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
      if (!coord || !inGreaterCairo(coord.latitude, coord.longitude)) return;
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

  const projKey = (g: GroupedProject) => g.projectName.trim().toLowerCase();
  const selectedGroup = useMemo(
    () => grouped.filter((g) => selectedKeys.includes(projKey(g))),
    [grouped, selectedKeys],
  );
  const selected = selectedGroup.length === 1 ? selectedGroup[0] : null;

  // Fit the view to the pins. Re-fits when the results change, and when the
  // map's box changes size (the map can be created before the page finishes
  // laying out, which left the phone map pointed at the wrong place) — but
  // never after the visitor has dragged or zoomed the map themselves.
  const pinSig = grouped.map((g) => `${projKey(g)}@${g.latitude},${g.longitude}`).join("|");
  const fitRef = useRef<() => void>(() => {});
  fitRef.current = () => {
    if (!mapInstance || grouped.length === 0) return;
    try {
      if (grouped.length === 1) {
        mapInstance.jumpTo({ center: [grouped[0].longitude, grouped[0].latitude], zoom: 14 });
        return;
      }
      const narrow = mapInstance.getContainer().clientWidth < 640;
      mapInstance.fitBounds(pinBounds(grouped), { padding: narrow ? 44 : 64, maxZoom: 14, duration: 0 });
    } catch {
      // Map removed mid-fit — ignore.
    }
  };
  useEffect(() => {
    userMovedRef.current = false;
    fitRef.current();
  }, [mapInstance, pinSig]);
  useEffect(() => {
    if (!mapInstance) return;
    const refit = () => {
      if (!userMovedRef.current) fitRef.current();
    };
    // Only real drags/zooms carry an originalEvent; our own fitBounds doesn't.
    const markMoved = (e: { originalEvent?: unknown }) => {
      if (e.originalEvent) userMovedRef.current = true;
    };
    // On phones the map credit starts expanded and covers the bottom of the
    // map; collapse it to its (i) button (tap to read it).
    const collapseCredit = () => {
      try {
        if (mapInstance.getContainer().clientWidth < 640)
          mapInstance.getContainer().querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
      } catch {
        // ignore
      }
    };
    collapseCredit();
    mapInstance.on("resize", refit);
    mapInstance.on("load", refit);
    mapInstance.on("load", collapseCredit);
    mapInstance.on("movestart", markMoved);
    return () => {
      mapInstance.off("resize", refit);
      mapInstance.off("load", refit);
      mapInstance.off("load", collapseCredit);
      mapInstance.off("movestart", markMoved);
    };
  }, [mapInstance]);

  // Bubbles: recomputed whenever the view settles, so they split apart as
  // the visitor zooms in. Plain pins when clustering is off.
  const [clusters, setClusters] = useState<Cluster[] | null>(null);
  useEffect(() => {
    if (!cluster || !mapInstance) {
      setClusters(null);
      return;
    }
    const compute = () => {
      try {
        const pts = grouped
          .map((g) => ({ g, p: mapInstance.project([g.longitude, g.latitude]) }))
          .sort((a, b) => b.g.units.length - a.g.units.length);
        const out: { x: number; y: number; members: GroupedProject[] }[] = [];
        for (const { g, p } of pts) {
          const hit = out.find((c) => Math.abs(c.x - p.x) < CLUSTER_PX && Math.abs(c.y - p.y) < CLUSTER_PX);
          if (hit) hit.members.push(g);
          else out.push({ x: p.x, y: p.y, members: [g] });
        }
        setClusters(
          out.map((c) => ({
            key: c.members.map(projKey).sort().join("|"),
            latitude: c.members.reduce((n, m) => n + m.latitude, 0) / c.members.length,
            longitude: c.members.reduce((n, m) => n + m.longitude, 0) / c.members.length,
            members: c.members,
            units: c.members.reduce((n, m) => n + m.units.length, 0),
          })),
        );
      } catch {
        setClusters(null);
      }
    };
    compute();
    mapInstance.on("moveend", compute);
    mapInstance.on("resize", compute);
    return () => {
      mapInstance.off("moveend", compute);
      mapInstance.off("resize", compute);
    };
  }, [cluster, mapInstance, grouped]);

  const openCluster = (c: Cluster) => {
    if (!mapInstance) return;
    const w = Math.min(...c.members.map((m) => m.longitude));
    const e = Math.max(...c.members.map((m) => m.longitude));
    const s = Math.min(...c.members.map((m) => m.latitude));
    const n = Math.max(...c.members.map((m) => m.latitude));
    trackEvent("listings_map_cluster_click", { projects: c.members.length, unit_count: c.units });
    // Projects saved at (almost) the same spot can't be split by zooming —
    // list them in the preview card instead.
    if ((e - w < 0.002 && n - s < 0.002) || mapInstance.getZoom() >= 15) {
      setSelectedKeys(c.members.map(projKey));
      return;
    }
    setSelectedKeys([]);
    mapInstance.fitBounds([[w, s], [e, n]], { padding: 80, maxZoom: 15, duration: 500 });
  };

  // Tile provider down or very slow: give up and let the page collapse the map.
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;
  useEffect(() => {
    if (!mapInstance || !onFailRef.current) return;
    if (mapInstance.loaded()) return;
    let done = false;
    const onLoad = () => { done = true; };
    mapInstance.once("load", onLoad);
    const t = setTimeout(() => {
      if (!done && !mapInstance.loaded()) onFailRef.current?.();
    }, MAP_LOAD_TIMEOUT_MS);
    return () => {
      clearTimeout(t);
      mapInstance.off("load", onLoad);
    };
  }, [mapInstance]);

  const handlePinClick = (project: GroupedProject) => {
    setSelectedKeys([projKey(project)]);
    trackEvent("listings_map_pin_click", {
      project_name: project.projectName,
      unit_count: project.units.length,
    });
  };

  if (grouped.length === 0) {
    if (hideWhenEmpty) return null;
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
    <div
      className={`relative rounded-2xl overflow-hidden border border-border/40 shadow-sm ${
        // Embedded on scrolling pages gets a shorter, mobile-friendly
        // height so it doesn't dominate the viewport. Full standalone
        // /listings map gets the taller 70vh treatment.
        heightClassName ??
        (embedded
          ? "h-[380px] sm:h-[440px] md:h-[520px] lg:h-[560px]"
          : "h-[60vh] min-h-[420px] md:h-[70vh]")
      }`}
    >
      <Map
        ref={(m) => {
          if (m && m !== mapInstance) setMapInstance(m);
        }}
        viewport={INITIAL_VIEWPORT}
        className="h-full w-full"
        // When embedded, disable wheel + double-click zoom so users
        // scrolling past the map on homepage / guides can't hijack
        // their scroll into a rapid zoom. Standalone /listings map
        // (embedded=false) keeps all interactions enabled.
        scrollZoom={!embedded}
        doubleClickZoom={!embedded}
      >
        {(clusters ?? grouped.map((g) => ({ key: projKey(g), latitude: g.latitude, longitude: g.longitude, members: [g], units: g.units.length })))
          .map((c) => {
            // One marker style for single projects and groups alike: a white
            // pill with the number of offices. Red when hovered or open.
            const single = c.members.length === 1;
            const isSelected = c.members.every((m) => selectedKeys.includes(projKey(m)));
            const size = c.units >= 100 ? "h-9 min-w-[3.25rem] px-3 text-sm" : c.units >= 10 ? "h-8 min-w-[2.75rem] px-2.5 text-[13px]" : "h-7 min-w-[2rem] px-2 text-xs";
            return (
              <MapMarker
                key={single ? projKey(c.members[0]) : `c:${c.key}`}
                longitude={c.longitude}
                latitude={c.latitude}
                onClick={() => (single ? handlePinClick(c.members[0]) : openCluster(c))}
              >
                <MarkerContent>
                  <div
                    aria-label={single ? `${c.units} ${c.units === 1 ? "office" : "offices"} in ${c.members[0].projectName}` : `${c.units} offices in ${c.members.length} projects`}
                    className={`${size} inline-flex items-center justify-center rounded-full font-semibold tabular-nums shadow-[0_2px_8px_rgba(0,0,0,0.18)] border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-accent text-white border-accent"
                        : "bg-white text-primary border-black/5 hover:bg-accent hover:text-white hover:border-accent"
                    }`}
                  >
                    {c.units}
                  </div>
                </MarkerContent>
              </MapMarker>
            );
          })}
      </Map>

      {selectedGroup.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/40 relative p-5">
            <button
              type="button"
              onClick={() => setSelectedKeys([])}
              aria-label="Close preview"
              className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors text-lg leading-none"
            >
              ×
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">
              {selectedGroup.length} projects here
            </p>
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {selectedGroup.map((g) => (
                <li key={projKey(g)}>
                  <Link
                    href={g.units.length === 1 ? listingUrl(g.units[0]) : `/listings?q=${encodeURIComponent(g.projectName)}`}
                    onClick={() => trackEvent("listings_map_popup_click", { project_name: g.projectName, unit_count: g.units.length })}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 -mx-2 hover:bg-muted"
                  >
                    <span className="font-medium text-primary text-sm truncate">{g.projectName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {g.units.length} {g.units.length === 1 ? "unit" : "units"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {selected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/40 relative">
            <button
              type="button"
              onClick={() => setSelectedKeys([])}
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
              {/* Single-unit projects deep-link straight to the listing
                  detail; multi-unit projects go to a filtered /listings
                  page keyed on the project name so the user can compare. */}
              {selected.units.length === 1 ? (
                <Link
                  href={listingUrl(selected.units[0])}
                  onClick={() =>
                    trackEvent("listings_map_popup_click", {
                      project_name: selected.projectName,
                      listing_id: selected.units[0].id,
                      unit_count: 1,
                    })
                  }
                  className="inline-flex items-center justify-center gap-1 w-full bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2.5 rounded-full transition-colors"
                >
                  See this unit
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
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
                  See {selected.units.length} units in {selected.projectName}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-primary shadow-md border border-border/40">
        <span className="w-2 h-2 rounded-full bg-accent" />
        {grouped.length} {grouped.length === 1 ? "project" : "projects"}
        {/* Unmapped-count intentionally omitted from the public UI —
            admin can see it via /dashboard rather than surfacing it as
            marketing UI. Kept unmappedCount computed above so future
            admin-only chip is a one-line change. */}
      </div>
    </div>
  );
}
