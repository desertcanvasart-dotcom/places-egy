import { useEffect, useRef, useState } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { MapPin, Search, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from "@/lib/use-google-maps";

const CAIRO_CENTER: [number, number] = [31.2357, 30.0444];
const DEFAULT_ZOOM = 10;

// Greater Cairo bounding box for biasing Places autocomplete predictions.
const CAIRO_BOUNDS = { west: 31.0, south: 29.8, east: 31.7, north: 30.3 };

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { latitude: number; longitude: number } | null) => void;
};

// Admin pin-drop for a listing. Two ways to place the pin:
//   1) Type into the autocomplete search box — dropdown shows Google Places
//      suggestions biased to Greater Cairo. Pick one → pin drops.
//   2) Click / drag on the map — dropped pin can be fine-tuned by dragging.
//
// Google Maps JS SDK is loaded lazily via useGoogleMaps(). The map tiles
// themselves stay on the free OpenFreeMap stack — we only spend on Places.
export function ListingPinInput({ latitude, longitude, onChange }: Props) {
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { loaded: gmapsLoaded, error: gmapsError } = useGoogleMaps();
  const hasPin = latitude != null && longitude != null;

  const setMap = (m: MapLibreGL.Map | null) => {
    if (!m || m === mapInstance) return;
    setMapInstance(m);
    m.on("click", (e: MapLibreGL.MapMouseEvent) => {
      onChange({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
    });
    m.getCanvas().style.cursor = "crosshair";
  };

  // Wire up Google Places Autocomplete once the SDK is loaded + input exists.
  useEffect(() => {
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
      onChange({ latitude: lat, longitude: lng });
      mapInstance?.flyTo({ center: [lng, lat], zoom: 16, duration: 800 });
    });
    autocompleteRef.current = ac;
  }, [gmapsLoaded, mapInstance, onChange]);

  const startCenter: [number, number] = hasPin
    ? [longitude, latitude]
    : CAIRO_CENTER;
  const startZoom = hasPin ? 15 : DEFAULT_ZOOM;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={
            gmapsLoaded
              ? "Search — e.g. Waterway, Mivida, Cairo Festival City"
              : "Loading Google Maps…"
          }
          disabled={!gmapsLoaded}
          className="bg-white pl-9"
        />
      </div>

      {gmapsError && (
        <p className="text-xs text-accent flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Search unavailable ({gmapsError.message}). You can still click the
          map manually.
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {hasPin
            ? "Drag the pin on the map to fine-tune, or search again to move it."
            : "Or click anywhere on the map below to drop the pin manually."}
        </p>
        {hasPin && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <X className="w-3 h-3" /> Clear pin
          </button>
        )}
      </div>

      <div className="relative h-72 rounded-xl overflow-hidden border border-border/60">
        <Map
          ref={setMap}
          viewport={{ center: startCenter, zoom: startZoom }}
          className="h-full w-full"
        >
          {hasPin && (
            <MapMarker
              longitude={longitude}
              latitude={latitude}
              draggable
              onDragEnd={(lngLat) =>
                onChange({ latitude: lngLat.lat, longitude: lngLat.lng })
              }
            >
              <MarkerContent>
                <MapPin className="w-8 h-8 fill-accent text-accent drop-shadow-md -translate-y-1/2" />
              </MarkerContent>
            </MapMarker>
          )}
        </Map>
      </div>

      {hasPin && (
        <p className="text-[11px] text-muted-foreground font-mono">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}
