import { useState } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { MapPin, X } from "lucide-react";

// Cairo center + a comfortable overview zoom. Both stay constant — the map is
// only for pin-dropping inside Greater Cairo, so we never need to fly to
// arbitrary parts of the world.
const CAIRO_CENTER: [number, number] = [31.2357, 30.0444];
const DEFAULT_ZOOM = 10;

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { latitude: number; longitude: number } | null) => void;
};

// Admin pin-drop input for a listing's location. Click anywhere on the Cairo
// map to drop a pin (or move the existing one). The pin can also be dragged
// for fine-tuning after the initial click. Clearing the pin blanks the lat+lng
// fields — that listing then simply won't appear on the public map.
export function ListingPinInput({ latitude, longitude, onChange }: Props) {
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const hasPin = latitude != null && longitude != null;

  // Wire click-to-drop as soon as the map is available.
  const setMap = (m: MapLibreGL.Map | null) => {
    if (!m || m === mapInstance) return;
    setMapInstance(m);
    m.on("click", (e: MapLibreGL.MapMouseEvent) => {
      onChange({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
    });
    m.getCanvas().style.cursor = "crosshair";
  };

  const startCenter: [number, number] = hasPin
    ? [longitude, latitude]
    : CAIRO_CENTER;
  const startZoom = hasPin ? 15 : DEFAULT_ZOOM;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {hasPin
            ? "Click a new spot to move, or drag the pin to fine-tune."
            : "Click anywhere on the map to drop a pin at the office location."}
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
                <div className="relative">
                  <MapPin className="w-8 h-8 fill-accent text-accent drop-shadow-md -translate-y-1/2" />
                </div>
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
