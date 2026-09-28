import * as MapLibreGL from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import type { MarkerOptions, PopupOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Point MapLibre at its own worker bundle via Vite's ?url import. Vite
// emits the worker as a hashed asset like /assets/maplibre-gl-worker-<hash>.mjs.
// The worker then internally does `import "./maplibre-gl-shared.mjs"` at
// runtime — a relative path that resolves against the worker's own URL,
// so it always requests /assets/maplibre-gl-shared.mjs (NOT hashed).
// Vite has no built-in way to emit that dependency at the exact URL the
// worker asks for, so we ship the file verbatim from client/public/assets/
// (see build script for the copy step). If that file is missing, the
// worker crashes silently on load and every dynamic map subsystem
// (Google Places dropdown, marker updates, style changes) stops working.
MapLibreGL.setWorkerUrl(maplibreWorkerUrl);

// Bulletproof against the "stale bundle references a hashed worker file
// that no longer exists after a rebuild" failure mode. Symptom: MapLibre
// tries to load /assets/maplibre-gl-worker-<oldhash>.mjs, gets an HTML
// 200 from the SPA catch-all, browser rejects as MIME mismatch, map
// silently fails to initialize. Affected: anyone who visits mid-deploy
// or whose browser held an old bundle across deploys.
//
// Recovery: on any module-script-MIME error for a /assets/ URL, force
// one full reload with cache-bypass. sessionStorage guards against a
// reload loop if the error somehow persists after the reload.
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const msg = String(event.message ?? "");
    const isModuleMimeError =
      msg.includes("MIME type") ||
      msg.includes("Failed to load module script");
    if (!isModuleMimeError) return;
    const src = String((event as ErrorEvent).filename ?? "");
    if (!src.includes("/assets/")) return;
    const RELOAD_KEY = "__map_asset_reload_at";
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) return; // already tried recently
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    // Force a full-cache-bypass reload — the new bundle will re-hydrate
    // with the current asset hashes.
    window.location.reload();
  });
}

// Load the RTL text plugin so Arabic + Hebrew place-name labels on the map
// render correctly (right-to-left with proper letter joining). Without this,
// Arabic labels appear as disconnected reversed characters — every visitor
// looking at a Cairo map sees garbled text since basically every place has
// an Arabic label.
//
// The plugin is self-hosted at /assets/mapbox-gl-rtl-text.min.js (~200KB,
// lazily fetched once per session, cached by Cloudflare forever). Copied
// from the mapbox-gl-rtl-text v0.2.3 npm package so we don't depend on an
// external CDN + don't need to punch a hole in CSP for unpkg.
//
// The `true` third argument makes it a hard requirement: MapLibre won't
// render RTL text until the plugin loads. Safe to call multiple times —
// MapLibre guards internally against re-loads.
try {
  MapLibreGL.setRTLTextPlugin(
    "/assets/mapbox-gl-rtl-text.min.js",
    true,
  );
} catch {
  // Already registered from a hot-reload or prior mount — ignore.
}
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

// Generic MapLibre React wrapper. Adapted from an external snippet to fit the
// PLACES codebase (no Next.js "use client" directive; light-only theme by
// default since the rest of the site is light-only).

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

// Vector tile style via OpenFreeMap. Chosen 2026-09-07 to avoid CARTO's
// new "API KEY REQUIRED" watermark on anonymous basemap tiles + CARTO's
// paid API dashboard doesn't cover basemap access anyway.
//
// OpenFreeMap is a genuinely free forever OSM-derived tile CDN (backed by
// non-profit funding). Same underlying map data as CARTO's basemaps.
// No API key. No signup. No watermark. No rate limits at our traffic level.
//
// We point maplibre-gl at OpenFreeMap's hosted style.json — maplibre
// handles the vector tile fetching + glyph loading + sprite loading
// itself from that entrypoint. Simpler than the previous raster-tile
// approach and easier to swap styles later (positron/liberty/bright/dark
// are all one-line changes).
//
// Attribution is required by ODbL — OpenFreeMap's own hosted style
// bakes it into the map so no manual attribution string needed.
// The ?v= query string bumps whenever we swap providers, forcing MapLibre
// to refetch the style JSON instead of serving a stale cached CARTO URL
// from a returning visitor's browser. Bump when swapping providers.
const OPENFREEMAP_LIGHT_STYLE = "https://tiles.openfreemap.org/styles/positron?v=2";
const OPENFREEMAP_DARK_STYLE = "https://tiles.openfreemap.org/styles/dark-matter?v=2";

const defaultStyles = {
  dark: OPENFREEMAP_DARK_STYLE,
  light: OPENFREEMAP_LIGHT_STYLE,
};

type Theme = "light" | "dark";

type MapViewport = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

type MapStyleOption = string | MapLibreGL.StyleSpecification;
type MapRef = MapLibreGL.Map;

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a Map component");
  return context;
}

type MapProps = {
  children?: ReactNode;
  className?: string;
  theme?: Theme;
  styles?: { light?: MapStyleOption; dark?: MapStyleOption };
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
  loading?: boolean;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

function DefaultLoader() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-xs">
      <div className="flex gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

const Map = forwardRef<MapRef, MapProps>(function Map(
  { children, className, theme = "light", styles, viewport, onViewportChange, loading = false, ...props },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const internalUpdateRef = useRef(false);
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  const mapStyles = useMemo(
    () => ({ dark: styles?.dark ?? defaultStyles.dark, light: styles?.light ?? defaultStyles.light }),
    [styles],
  );

  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
      styleTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: theme === "dark" ? mapStyles.dark : mapStyles.light,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    });

    const styleDataHandler = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true);
        // Belt-and-braces resize after style load. If the container was
        // 0-height at construction time, this catches the case where the
        // ResizeObserver hasn't fired yet.
        try {
          map.resize();
        } catch {
          // Map removed — ignore.
        }
      }, 100);
    };
    const loadHandler = () => setIsLoaded(true);
    const moveHandler = () => {
      if (!internalUpdateRef.current) onViewportChangeRef.current?.(getViewport(map));
    };

    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("move", moveHandler);
    // Race guard: if the map already fired 'load' / had style data before we
    // attached listeners (fast networks or cached styles), flip the flags
    // manually so the loader doesn't stay stuck forever.
    if (map.loaded()) setIsLoaded(true);
    if (map.isStyleLoaded()) setIsStyleLoaded(true);
    setMapInstance(map);

    // ResizeObserver fix — when the map is inside a Dialog/Sheet/tab that
    // mounts hidden or animates from 0 → real size, MapLibre computes tile
    // dimensions from the 0-height container and never re-fetches on grow.
    // Observing the container and calling map.resize() covers all those
    // cases (dialog opens, sidebar collapses, tab activates, etc).
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        try {
          map.resize();
        } catch {
          // Map already removed — ignore.
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearStyleTimeout();
      resizeObserver?.disconnect();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("move", moveHandler);
      map.remove();
      setMapInstance(null);
      setIsLoaded(false);
      setIsStyleLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance) return;
    const nextStyle = theme === "dark" ? mapStyles.dark : mapStyles.light;
    setIsStyleLoaded(false);
    mapInstance.setStyle(nextStyle);
  }, [theme, mapStyles, mapInstance]);

  useEffect(() => {
    if (!mapInstance || !viewport) return;
    internalUpdateRef.current = true;
    mapInstance.jumpTo(viewport);
    requestAnimationFrame(() => {
      internalUpdateRef.current = false;
    });
  }, [mapInstance, viewport]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }),
    [mapInstance, isLoaded, isStyleLoaded],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        // touch-action: none prevents the browser from claiming trackpad
        // pinch + touch-pinch as a system-level page zoom. Without it, a
        // MacBook trackpad pinch on the map zooms the WHOLE page instead
        // of the map view. overscroll-behavior blocks two-finger scroll
        // from bubbling up and triggering back-navigation while dragging.
        style={{ touchAction: "none", overscrollBehavior: "contain" }}
        className={cn("relative h-full w-full", className)}
      >
        {loading && <DefaultLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

type MarkerContextValue = {
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) throw new Error("Marker components must be used within MapMarker");
  return context;
}

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd });
  callbacksRef.current = { onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd };

  const marker = useMemo(() => {
    const el = document.createElement("div");
    const markerInstance = new MapLibreGL.Marker({ ...markerOptions, element: el, draggable }).setLngLat([
      longitude,
      latitude,
    ]);
    el.addEventListener("click", (event) => callbacksRef.current.onClick?.(event));
    el.addEventListener("mouseenter", (event) => callbacksRef.current.onMouseEnter?.(event));
    el.addEventListener("mouseleave", (event) => callbacksRef.current.onMouseLeave?.(event));
    markerInstance.on("dragstart", () => {
      const l = markerInstance.getLngLat();
      callbacksRef.current.onDragStart?.({ lng: l.lng, lat: l.lat });
    });
    markerInstance.on("drag", () => {
      const l = markerInstance.getLngLat();
      callbacksRef.current.onDrag?.({ lng: l.lng, lat: l.lat });
    });
    markerInstance.on("dragend", () => {
      const l = markerInstance.getLngLat();
      callbacksRef.current.onDragEnd?.({ lng: l.lng, lat: l.lat });
    });
    return markerInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, marker]);

  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) {
    marker.setLngLat([longitude, latitude]);
  }
  if (marker.isDraggable() !== draggable) marker.setDraggable(draggable);

  return <MarkerContext.Provider value={{ marker, map }}>{children}</MarkerContext.Provider>;
}

type MarkerContentProps = {
  children?: ReactNode;
  className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
  const { marker } = useMarkerContext();
  return createPortal(
    <div className={cn("relative cursor-pointer", className)}>{children || <DefaultMarkerIcon />}</div>,
    marker.getElement(),
  );
}

function DefaultMarkerIcon() {
  return <div className="relative h-4 w-4 rounded-full border-2 border-white bg-accent shadow-lg" />;
}

type MarkerTooltipProps = {
  children: ReactNode;
  className?: string;
} & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">;

function MarkerTooltip({ children, className, ...popupOptions }: MarkerTooltipProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const tooltip = useMemo(
    () =>
      new MapLibreGL.Popup({ offset: 16, ...popupOptions, closeOnClick: true, closeButton: false }).setMaxWidth(
        "none",
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!map) return;
    tooltip.setDOMContent(container);
    const el = marker.getElement();
    const handleMouseEnter = () => tooltip.setLngLat(marker.getLngLat()).addTo(map);
    const handleMouseLeave = () => tooltip.remove();
    el?.addEventListener("mouseenter", handleMouseEnter);
    el?.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el?.removeEventListener("mouseenter", handleMouseEnter);
      el?.removeEventListener("mouseleave", handleMouseLeave);
      tooltip.remove();
    };
  }, [container, map, marker, tooltip]);

  return createPortal(
    <div
      className={cn(
        "pointer-events-none rounded-md bg-foreground px-2 py-1 text-xs text-balance text-background shadow-md",
        className,
      )}
    >
      {children}
    </div>,
    container,
  );
}

export { Map, useMap, MapMarker, MarkerContent, MarkerTooltip };
