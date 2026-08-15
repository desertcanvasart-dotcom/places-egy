import { useEffect, useRef, useState } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { MapPin, Search, X, Loader2, Check, Edit2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from "@/lib/use-google-maps";
import {
  fetchProjectCoord,
  saveProjectCoord,
  type ProjectCoord,
} from "@/lib/project-coords";

const CAIRO_CENTER: [number, number] = [31.2357, 30.0444];
const DEFAULT_ZOOM = 10;

// Greater Cairo bounding box — biases Google Places predictions to
// Cairo/Giza results (strictBounds:false so nearby matches still surface).
const CAIRO_BOUNDS = { west: 31.0, south: 29.8, east: 31.7, north: 30.3 };

type Props = {
  projectName: string;
};

// Inline project-coord picker for the listing edit form. Behavior:
//   - Empty projectName → tell admin to enter one first (coord picker locked)
//   - projectName already has coords saved → show "✅ Location set" summary
//     with the current coords + an Edit button that reveals the picker
//   - projectName is new → show the picker immediately so admin can drop a
//     pin via Google Places search OR by clicking the map. Save happens
//     automatically on any pin drop.
//
// All units in this project (existing + future) share these coords on the
// public map. Editing them updates the pin globally.
export function ProjectPinInput({ projectName }: Props) {
  const trimmedName = projectName.trim();
  const [saved, setSaved] = useState<ProjectCoord | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { loaded: gmapsLoaded, error: gmapsError } = useGoogleMaps();

  // Debounced lookup — checks if the current project name already has
  // coords saved. 400ms so typing letter-by-letter fires once, not per key.
  useEffect(() => {
    if (!trimmedName) {
      setSaved(null);
      setEditing(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchProjectCoord(trimmedName).then((coord) => {
        if (cancelled) return;
        setSaved(coord);
        setEditing(!coord);
        setLoading(false);
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedName]);

  const setMap = (m: MapLibreGL.Map | null) => {
    if (!m || m === mapInstance) return;
    setMapInstance(m);
    m.on("click", (e: MapLibreGL.MapMouseEvent) => {
      commitCoords(e.lngLat.lat, e.lngLat.lng, null);
    });
    m.getCanvas().style.cursor = "crosshair";
  };

  // Wire Google Places Autocomplete once the SDK loads + the input mounts
  // (which only happens once we're in editing mode).
  useEffect(() => {
    if (!editing) return;
    if (!gmapsLoaded || !inputRef.current || autocompleteRef.current) return;
    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      bounds: CAIRO_BOUNDS,
      strictBounds: false,
      componentRestrictions: { country: "eg" },
      fields: ["geometry", "formatted_address", "name"],
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place.geometry?.location;
      if (!loc) return;
      const lat = loc.lat();
      const lng = loc.lng();
      mapInstance?.flyTo({ center: [lng, lat], zoom: 16, duration: 800 });
      commitCoords(lat, lng, place.formatted_address ?? place.name ?? null);
    });
    autocompleteRef.current = ac;
  }, [editing, gmapsLoaded, mapInstance]);

  // Prefill the search box with the saved project when re-editing, so the
  // admin has a starting point instead of empty.
  useEffect(() => {
    if (editing && saved && inputRef.current) {
      inputRef.current.value = saved.address_line ?? saved.project_name;
    }
  }, [editing, saved]);

  const commitCoords = async (
    latitude: number,
    longitude: number,
    addressLine: string | null,
  ) => {
    if (!trimmedName) return;
    setSaveState("saving");
    setSaveError(null);
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
    } catch (err) {
      setSaveError((err as Error).message || "Unknown error");
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 8000);
    }
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

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          placeholder={
            gmapsLoaded
              ? `Search Google Maps — e.g. "${trimmedName}, Cairo"`
              : "Loading Google Maps…"
          }
          disabled={!gmapsLoaded}
          className="bg-white pl-9"
        />
      </div>

      {gmapsError && (
        <p className="text-xs text-accent flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Google Maps failed to load ({gmapsError.message}). You can still
          click the map manually to place the pin.
        </p>
      )}

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
            <span
              className="text-xs text-accent max-w-[20rem] truncate"
              title={saveError ?? undefined}
            >
              Save failed: {saveError ?? "Unknown"}
            </span>
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
