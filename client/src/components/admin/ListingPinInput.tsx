import { useState } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Cairo center + a comfortable overview zoom.
const CAIRO_CENTER: [number, number] = [31.2357, 30.0444];
const DEFAULT_ZOOM = 10;

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { latitude: number; longitude: number } | null) => void;
};

// Admin pin-drop input for a listing's location. Two ways to set the pin:
//   1) Type an address in the search box → hits OpenStreetMap Nominatim
//      geocoding (free, biased to Cairo), drops the pin at the top result.
//   2) Click anywhere on the map → drops the pin there (or drag it to
//      fine-tune after the initial placement).
// Clearing the pin blanks lat+lng — that listing then won't appear on the
// public map.
export function ListingPinInput({ latitude, longitude, onChange }: Props) {
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const hasPin = latitude != null && longitude != null;

  const setMap = (m: MapLibreGL.Map | null) => {
    if (!m || m === mapInstance) return;
    setMapInstance(m);
    m.on("click", (e: MapLibreGL.MapMouseEvent) => {
      onChange({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
    });
    m.getCanvas().style.cursor = "crosshair";
  };

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    try {
      // Nominatim (OpenStreetMap) — free, no API key. `viewbox` biases to
      // Greater Cairo so "Waterway" resolves to the right country.
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", `${q}, Cairo, Egypt`);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("viewbox", "31.0,30.3,31.7,29.8");
      url.searchParams.set("bounded", "1");
      const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "en" },
      });
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data.length === 0) {
        setSearchError("No matches — try adding more detail (e.g. street name).");
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      onChange({ latitude: lat, longitude: lon });
      mapInstance?.flyTo({ center: [lon, lat], zoom: 16, duration: 800 });
    } catch (err) {
      console.error("Geocoding failed:", err);
      setSearchError("Search failed — check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  const startCenter: [number, number] = hasPin
    ? [longitude, latitude]
    : CAIRO_CENTER;
  const startZoom = hasPin ? 15 : DEFAULT_ZOOM;

  return (
    <div className="space-y-3">
      {/* Search box — primary way to set the pin */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder="Search address, e.g. Waterway, New Cairo"
            className="bg-white pl-9"
          />
        </div>
        <Button
          type="button"
          onClick={search}
          disabled={searching || !query.trim()}
          className="bg-primary text-white shrink-0"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find"}
        </Button>
      </div>

      {searchError && (
        <p className="text-xs text-accent">{searchError}</p>
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
