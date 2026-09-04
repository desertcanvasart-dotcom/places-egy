import { useEffect, useRef, useState } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { MapPin, X, Loader2, Check, Edit2, AlertTriangle } from "lucide-react";
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
//   - projectName already has coords saved → show a compact "✅ Location set"
//     summary with the current coords + an Edit button that reveals the picker
//   - projectName is new (or admin clicks Edit) → show the map + a Google
//     Places search box so admin can find the location. Save happens
//     automatically on any pin drop.
//
// IMPORTANT (2026-08-31 fix): the Google Places search box is decoupled from
// the project name. Admin can type ANY project name — real, made-up, in Arabic,
// with typos — and the Google search box starts empty every time. This
// prevents the previous bug where typing a project name that didn't match
// a Google Places result poisoned the dropdown (no results shown for
// searches typed manually afterwards because the auto-fill was still stuck).
// Project name = admin's label. Google Places search = independent map lookup.
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
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteElementRef = useRef<HTMLElement | null>(null);
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

  // Wire the new google.maps.places.PlaceAutocompleteElement. This is the
  // web-component replacement for the classic Autocomplete widget which
  // Google no longer allows new customer accounts to instantiate (as of
  // March 2025). New element renders its own input + dropdown; we just
  // mount it into a container div and listen for gmp-select.
  useEffect(() => {
    if (!editing) return;
    if (!gmapsLoaded || !autocompleteContainerRef.current) return;
    if (autocompleteElementRef.current) return;

    // The importLibrary() call is idempotent — safe on re-runs.
    let cancelled = false;
    (async () => {
      const { PlaceAutocompleteElement } = (await google.maps.importLibrary(
        "places",
      )) as unknown as { PlaceAutocompleteElement: new (opts: object) => HTMLElement };

      if (cancelled || !autocompleteContainerRef.current) return;

      const el = new PlaceAutocompleteElement({
        includedRegionCodes: ["eg"],
        locationBias: {
          west: CAIRO_BOUNDS.west,
          south: CAIRO_BOUNDS.south,
          east: CAIRO_BOUNDS.east,
          north: CAIRO_BOUNDS.north,
        },
      });
      // Nudge admin: the search box is for finding the place on the map,
      // not for retyping the project name. Set once the inner <input> exists.
      queueMicrotask(() => {
        const inner = el.querySelector("input");
        if (inner) {
          inner.setAttribute(
            "placeholder",
            "Search a building, street, or landmark on Google Maps",
          );
        }
      });
      // Style the injected element so it looks like our other inputs.
      el.style.width = "100%";
      autocompleteContainerRef.current.replaceChildren(el);
      autocompleteElementRef.current = el;

      // Deliberately do NOT prefill the input with the project name or the
      // saved address. Prefilling caused a broken UX: if the prefill string
      // didn't match a real Google Places result (e.g. an admin-authored
      // project name like "MG Tower Phase 2"), the dropdown would show
      // "no results" and subsequent typing wouldn't recover. The search box
      // is now purely a fresh place-lookup input every time the picker opens.
      // The saved location is instead shown by the pinned marker on the map
      // + the coordinate readout under the Edit button in the summary state.

      el.addEventListener("gmp-select", async (event: Event) => {
        // The event's placePrediction has a toPlace() that fetches full
        // Place details. Request geometry + formatted address.
        const detail = (event as unknown as {
          placePrediction: {
            toPlace: () => {
              fetchFields: (opts: { fields: string[] }) => Promise<void>;
              location: { lat: () => number; lng: () => number } | null;
              formattedAddress: string | null;
              displayName: string | null;
            };
          };
        }).placePrediction;
        if (!detail) return;
        const place = detail.toPlace();
        await place.fetchFields({
          fields: ["location", "formattedAddress", "displayName"],
        });
        const loc = place.location;
        if (!loc) return;
        const lat = loc.lat();
        const lng = loc.lng();
        mapInstance?.flyTo({ center: [lng, lat], zoom: 16, duration: 800 });
        commitCoords(
          lat,
          lng,
          place.formattedAddress ?? place.displayName ?? null,
        );
      });
    })().catch((err) => {
      console.error("[ProjectPinInput] failed to init PlaceAutocompleteElement:", err);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, gmapsLoaded]);

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
      <div className="rounded-xl overflow-hidden border-2 border-emerald-500/40 bg-white">
        {/* Emerald status header — makes "saved" unmistakable at a glance */}
        <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shrink-0">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-900">
                Location saved
              </p>
              <p className="text-[11px] text-emerald-700/80 truncate">
                for "{trimmedName}"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white/70 hover:bg-white px-3 py-1.5 rounded-full border border-emerald-500/30 shrink-0 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> Edit pin
          </button>
        </div>

        {/* Preview map — non-interactive, just shows the pin so admin can
            visually confirm the location is correct without scrolling to
            the whole edit view. Height kept short so it doesn't dominate. */}
        <div className="relative h-40 md:h-48">
          <Map
            viewport={{
              center: [saved.longitude, saved.latitude],
              zoom: 15,
            }}
            className="h-full w-full pointer-events-none"
          >
            <MapMarker longitude={saved.longitude} latitude={saved.latitude}>
              <MarkerContent>
                <MapPin
                  className="w-8 h-8 fill-accent text-accent drop-shadow-md -translate-y-1/2"
                />
              </MarkerContent>
            </MapMarker>
          </Map>
        </div>

        {/* Address + coord readout — the truth backing up the pin above */}
        <div className="px-4 py-3 bg-white border-t border-border/40 space-y-1">
          {saved.address_line ? (
            <p className="text-xs text-primary leading-snug line-clamp-2">
              <MapPin className="w-3 h-3 inline-block text-emerald-600 -translate-y-0.5 mr-1" />
              {saved.address_line}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No address label saved — only coordinates.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground font-mono">
            {saved.latitude.toFixed(6)}, {saved.longitude.toFixed(6)}
          </p>
          <p className="text-[11px] text-muted-foreground pt-1">
            All units in this project share this pin. Click "Edit pin" only
            if the whole building's coordinates are wrong.
          </p>
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
        Set the map location for{" "}
        <strong className="text-primary">"{trimmedName}"</strong>. Search
        below for the actual place — the project name doesn't have to match.
      </p>

      <div className="relative">
        {/* Google's PlaceAutocompleteElement mounts here. It's a web
            component so it renders its own <input> + dropdown; we style
            the container so it visually matches our other form inputs. */}
        <div
          ref={autocompleteContainerRef}
          className="[&_gmp-place-autocomplete]:w-full [&_input]:w-full [&_input]:h-10 [&_input]:px-3 [&_input]:rounded-full [&_input]:border [&_input]:border-border/60 [&_input]:bg-white [&_input]:text-sm [&_input]:focus:border-accent [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-accent/20"
        >
          {!gmapsLoaded && (
            <div className="w-full h-10 px-3 rounded-full border border-border/60 bg-white flex items-center text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading Google Maps…
            </div>
          )}
        </div>
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
