import { useMemo, useState, useEffect, useRef } from "react";
import type * as MapLibreGL from "maplibre-gl";
import { Link } from "wouter";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { supabaseImage, supabaseImageOnError } from "@/lib/image-url";
import { listingCurrency } from "@/lib/currency";
import { listingUrl } from "@/lib/listings";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";
import type { Listing } from "@/lib/supabase";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800";
const CAIRO_CENTER: [number, number] = [31.2357, 30.0444];
const DEFAULT_ZOOM = 10;

type Props = {
  listings: Listing[];
};

function formatPrice(l: Pick<Listing, "price" | "currency" | "transaction_type">): string {
  if (!l.price) return "Price on request";
  const currency = listingCurrency(l);
  const formatted = new Intl.NumberFormat("en-US").format(l.price);
  const suffix = l.transaction_type?.toLowerCase() === "rent" ? "/mo" : "";
  return `${formatted} ${currency}${suffix}`;
}

// Public list-view map. Renders one pin per listing that has a lat/lng, plus
// a click-to-open popup card showing image + title + price + link. Listings
// without coordinates are silently skipped (admin sees them in the pin-drop
// admin tool; the map only shows what can actually be placed).
export function ListingsMap({ listings }: Props) {
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const didFitRef = useRef(false);

  // Filter to only listings that have valid coordinates. Anything missing
  // lat/lng can't be placed on the map and is hidden here.
  const withCoords = useMemo(
    () =>
      listings.filter(
        (l): l is Listing & { latitude: number; longitude: number } =>
          l.latitude != null && l.longitude != null,
      ),
    [listings],
  );

  const selected = useMemo(
    () => withCoords.find((l) => l.id === selectedId) ?? null,
    [withCoords, selectedId],
  );

  // Fit the map to include every pin the first time listings arrive. After
  // that, keep the user's viewport intact — refitting on every listings
  // change would rip the map back to overview mid-browse.
  useEffect(() => {
    if (!mapInstance || withCoords.length === 0 || didFitRef.current) return;
    if (withCoords.length === 1) {
      const only = withCoords[0];
      mapInstance.jumpTo({ center: [only.longitude, only.latitude], zoom: 14 });
      didFitRef.current = true;
      return;
    }
    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    for (const l of withCoords) {
      if (l.longitude < west) west = l.longitude;
      if (l.longitude > east) east = l.longitude;
      if (l.latitude < south) south = l.latitude;
      if (l.latitude > north) north = l.latitude;
    }
    mapInstance.fitBounds(
      [
        [west, south],
        [east, north],
      ],
      { padding: 60, maxZoom: 14, duration: 0 },
    );
    didFitRef.current = true;
  }, [mapInstance, withCoords]);

  // Reset the "did fit" guard when the user changes filters and the map
  // stays open. Debounced by the listings identity — new filtered set →
  // refit once.
  useEffect(() => {
    didFitRef.current = false;
  }, [listings]);

  const handlePinClick = (listing: Listing) => {
    setSelectedId(listing.id);
    trackEvent("listings_map_pin_click", {
      listing_id: listing.id,
      listing_title: listing.title,
    });
  };

  if (withCoords.length === 0) {
    return (
      <div className="h-[70vh] rounded-2xl border border-border/40 bg-white flex items-center justify-center text-center px-8">
        <div>
          <p className="text-sm font-medium text-primary mb-1">
            No mapped locations
          </p>
          <p className="text-xs text-muted-foreground">
            None of the current listings have coordinates set yet. Try clearing
            filters, or switch back to grid view.
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
        {withCoords.map((listing) => {
          const isSelected = listing.id === selectedId;
          return (
            <MapMarker
              key={listing.id}
              longitude={listing.longitude}
              latitude={listing.latitude}
              onClick={() => handlePinClick(listing)}
            >
              <MarkerContent>
                {/* Price-pill marker — Airbnb pattern. Highlights when the
                    pin is the currently-selected one so the popup card has
                    an obvious visual anchor. */}
                <div
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md border-2 transition-all ${
                    isSelected
                      ? "bg-accent text-white border-white scale-110 z-10"
                      : "bg-white text-primary border-accent/40 hover:bg-accent hover:text-white hover:border-white"
                  }`}
                >
                  {listing.price
                    ? `${(listing.price / 1000).toFixed(0)}k`
                    : "—"}
                </div>
              </MarkerContent>
            </MapMarker>
          );
        })}
      </Map>

      {/* Popup card — anchored bottom-center of the map. Doesn't use the
          Marker's popup because we want a bigger card with an image and
          links, plus click-outside to dismiss. */}
      {selected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/40">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close preview"
              className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors text-lg leading-none"
            >
              ×
            </button>
            <Link
              href={listingUrl(selected)}
              onClick={() =>
                trackEvent("listings_map_popup_click", {
                  listing_id: selected.id,
                  listing_title: selected.title,
                })
              }
              className="block group"
            >
              <div className="relative aspect-video bg-muted">
                <img
                  src={supabaseImage(
                    selected.images?.[0] ?? FALLBACK_IMAGE,
                    "card",
                  )}
                  onError={supabaseImageOnError(
                    selected.images?.[0] ?? FALLBACK_IMAGE,
                  )}
                  alt={selected.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1">
                  {selected.location ?? "Cairo"}
                  {selected.transaction_type ? ` · ${selected.transaction_type}` : ""}
                </p>
                <p className="font-serif font-bold text-primary text-base leading-tight mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                  {selected.title}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
                    {formatPrice(selected)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                    View details
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Legend / count chip — small acknowledgement of what's shown. */}
      <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-primary shadow-md border border-border/40">
        <span className="w-2 h-2 rounded-full bg-accent" />
        {withCoords.length} {withCoords.length === 1 ? "location" : "locations"}
        {listings.length > withCoords.length && (
          <span className="text-muted-foreground">
            {" "}· {listings.length - withCoords.length} unmapped
          </span>
        )}
      </div>
    </div>
  );
}
