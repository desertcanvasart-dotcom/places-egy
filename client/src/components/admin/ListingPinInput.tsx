import { useEffect, useRef, useState } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const CAIRO_CENTER: [number, number] = [31.2357, 30.0444];
const DEFAULT_ZOOM = 10;

// Greater Cairo bounding box — biases the geocoder to only return results
// inside Cairo/Giza. Format for Nominatim: viewbox=left,top,right,bottom
const CAIRO_VIEWBOX = "31.0,30.3,31.7,29.8";

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { latitude: number; longitude: number } | null) => void;
};

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

// Admin pin-drop for a listing. Two ways to place the pin:
//   1) Type into the search box → Nominatim (OpenStreetMap's free geocoder)
//      returns Cairo-area matches → pick one → pin drops.
//   2) Click / drag on the map → drop pin manually, drag to fine-tune.
//
// Nominatim is free, no API key, no billing. Rate limit is 1 req/sec per IP
// which is fine here since we debounce keystrokes at 500ms.
export function ListingPinInput({ latitude, longitude, onChange }: Props) {
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasPin = latitude != null && longitude != null;

  const setMap = (m: MapLibreGL.Map | null) => {
    if (!m || m === mapInstance) return;
    setMapInstance(m);
    m.on("click", (e: MapLibreGL.MapMouseEvent) => {
      onChange({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
    });
    m.getCanvas().style.cursor = "crosshair";
  };

  // Debounced Nominatim search. Fires 500ms after the user stops typing.
  useEffect(() => {
    if (!query.trim()) {
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
        url.searchParams.set("bounded", "1");
        url.searchParams.set("countrycodes", "eg");
        const res = await fetch(url.toString(), {
          signal: controller.signal,
          headers: { "Accept-Language": "en" },
        });
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
  }, [query]);

  // Click-outside to close dropdown.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pickSuggestion = (s: Suggestion) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    onChange({ latitude: lat, longitude: lng });
    mapInstance?.flyTo({ center: [lng, lat], zoom: 16, duration: 800 });
    setShowDropdown(false);
    setQuery(s.display_name.split(",").slice(0, 2).join(", "));
  };

  const startCenter: [number, number] = hasPin
    ? [longitude, latitude]
    : CAIRO_CENTER;
  const startZoom = hasPin ? 15 : DEFAULT_ZOOM;

  return (
    <div className="space-y-3">
      <div ref={wrapperRef} className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        {searching && (
          <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin z-10" />
        )}
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Search — e.g. Waterway, Mivida, Cairo Festival City"
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
