import { useEffect, useRef, useState } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { MapPin, Search, X, Loader2, Check, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  fetchProjectCoord,
  saveProjectCoord,
  type ProjectCoord,
} from "@/lib/project-coords";

const CAIRO_CENTER: [number, number] = [31.2357, 30.0444];
const DEFAULT_ZOOM = 10;
const CAIRO_VIEWBOX = "31.0,30.3,31.7,29.8";

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

type Props = {
  projectName: string;
};

// Inline project-coord picker for the listing edit form. Behavior:
//   - Empty projectName → tell admin to enter one first (coord picker locked)
//   - projectName already has coords saved → show "✅ Location set" with the
//     current coords + an Edit button that reveals the picker
//   - projectName is new → show the picker immediately so admin can drop a
//     pin. Save happens via PUT /api/admin/project-coordinates as soon as
//     a pin is placed (either search or click), no separate save button.
//
// All units in this project (existing + future) will use these coords on
// the master map. Editing coords updates it globally.
export function ProjectPinInput({ projectName }: Props) {
  const trimmedName = projectName.trim();
  const [saved, setSaved] = useState<ProjectCoord | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load whatever's saved for this project the first time projectName
  // changes. If nothing saved → editing mode auto-enters.
  useEffect(() => {
    if (!trimmedName) {
      setSaved(null);
      setEditing(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProjectCoord(trimmedName).then((coord) => {
      if (cancelled) return;
      setSaved(coord);
      setEditing(!coord);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [trimmedName]);

  // Nominatim search — same debounced setup as the old ListingPinInput.
  useEffect(() => {
    if (!editing || !query.trim()) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "6");
        url.searchParams.set("viewbox", CAIRO_VIEWBOX);
        url.searchParams.set("countrycodes", "eg");
        url.searchParams.set("accept-language", "en");
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Suggestion[];
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, editing]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const setMap = (m: MapLibreGL.Map | null) => {
    if (!m || m === mapInstance) return;
    setMapInstance(m);
    m.on("click", (e: MapLibreGL.MapMouseEvent) => {
      commitCoords(e.lngLat.lat, e.lngLat.lng, null);
    });
    m.getCanvas().style.cursor = "crosshair";
  };

  const commitCoords = async (
    latitude: number,
    longitude: number,
    addressLine: string | null,
  ) => {
    if (!trimmedName) return;
    setSaveState("saving");
    try {
      const next = await saveProjectCoord({
        project_name: trimmedName,
        latitude,
        longitude,
        address_line: addressLine,
      });
      setSaved(next);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 4000);
    }
  };

  const pickSuggestion = (s: Suggestion) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    mapInstance?.flyTo({ center: [lng, lat], zoom: 16, duration: 800 });
    setShowDropdown(false);
    setQuery(s.display_name.split(",").slice(0, 2).join(", "));
    commitCoords(lat, lng, s.display_name);
  };

  // ── Rendering states ────────────────────────────────────────────────────

  if (!trimmedName) {
    return (
      <div className="p-4 rounded-xl bg-muted/50 border border-dashed border-border/60 text-sm text-muted-foreground">
        Enter a project name above to set its map location. All listings in
        that project will share the same pin.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-white border border-border/40 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Checking existing coordinates for "{trimmedName}"…
      </div>
    );
  }

  // Already-saved read-only summary (with Edit button to reopen picker).
  if (saved && !editing) {
    return (
      <div className="p-4 rounded-xl bg-white border border-border/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">
                Location set for "{trimmedName}"
              </p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {saved.latitude.toFixed(6)}, {saved.longitude.toFixed(6)}
              </p>
              {saved.address_line && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {saved.address_line}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground mt-1.5">
                All units in this project use this pin on the map. Edit only
                if the whole building's coordinates are wrong.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline shrink-0"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        </div>
      </div>
    );
  }

  const startCenter: [number, number] = saved
    ? [saved.longitude, saved.latitude]
    : CAIRO_CENTER;
  const startZoom = saved ? 15 : DEFAULT_ZOOM;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Set coordinates for <strong className="text-primary">"{trimmedName}"</strong>.
        Every listing in this project will share this pin on the map.
      </p>

      <div ref={wrapperRef} className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        {searching && (
          <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin z-10" />
        )}
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={`Search Google Maps — e.g. "${trimmedName}"`}
          className="bg-white pl-9 pr-9"
        />
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-border/60 shadow-lg overflow-hidden z-20 max-h-64 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickSuggestion(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/5 border-b border-border/30 last:border-0 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                <span className="text-primary line-clamp-2">
                  {s.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {saved
            ? "Drag the pin, click a new spot, or search again to update."
            : "Search above or click on the map to drop the pin. Saves automatically."}
        </p>
        <div className="flex items-center gap-2">
          {saveState === "saving" && (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving…
            </span>
          )}
          {saveState === "saved" && (
            <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
              <Check className="w-3 h-3" />
              Saved
            </span>
          )}
          {saveState === "error" && (
            <span className="text-xs text-accent">Save failed — try again</span>
          )}
          {saved && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <X className="w-3 h-3" /> Done
            </button>
          )}
        </div>
      </div>

      <div className="relative h-72 rounded-xl overflow-hidden border border-border/60">
        <Map
          ref={setMap}
          viewport={{ center: startCenter, zoom: startZoom }}
          className="h-full w-full"
        >
          {saved && (
            <MapMarker
              longitude={saved.longitude}
              latitude={saved.latitude}
              draggable
              onDragEnd={(lngLat) =>
                commitCoords(lngLat.lat, lngLat.lng, saved.address_line ?? null)
              }
            >
              <MarkerContent>
                <MapPin className="w-8 h-8 fill-accent text-accent drop-shadow-md -translate-y-1/2" />
              </MarkerContent>
            </MapMarker>
          )}
        </Map>
      </div>
    </div>
  );
}
