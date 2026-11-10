import { Component, Suspense, lazy, useState, type ReactNode } from "react";
import type { Listing } from "@/lib/supabase";

// The map must never take a page down. Three ways it can fail, all handled
// by collapsing to `fallback` (nothing by default) so the listings simply
// move up:
//   1. The device/browser can't draw WebGL maps → never attempted.
//   2. MapLibre (or its lazy-loaded chunk) throws → caught by the boundary.
//      Without this, a throw inside the map unmounts the whole app (blank page).
//   3. The tile provider is down/slow → ListingsMap reports via onFail after a
//      timeout instead of sitting there grey.
// The map code is lazy-loaded, so pages don't download it until it's shown.

const ListingsMap = lazy(() =>
  import("@/components/listings/ListingsMap").then((m) => ({ default: m.ListingsMap })),
);

let webglSupport: boolean | null = null;
function canDrawMaps(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

class MapErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[map] hidden after error:", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type Props = {
  listings: Listing[];
  embedded?: boolean;
  /** Collapse instead of showing the "no mapped projects" box. */
  hideWhenEmpty?: boolean;
  className?: string;
  heightClassName?: string;
  /** Shown while the map code downloads. */
  placeholder?: ReactNode;
  /** Called once if the map is hidden for any reason (so the page can drop its frame). */
  onUnavailable?: () => void;
};

export function SafeListingsMap({ listings, embedded, hideWhenEmpty, className, heightClassName, placeholder = null, onUnavailable }: Props) {
  const [failed, setFailed] = useState(() => typeof window !== "undefined" && !canDrawMaps());
  const fail = () => {
    setFailed(true);
    onUnavailable?.();
  };
  if (failed) return null;
  return (
    <MapErrorBoundary onError={fail}>
      <Suspense fallback={placeholder}>
        <div className={className}>
          <ListingsMap listings={listings} embedded={embedded} hideWhenEmpty={hideWhenEmpty} heightClassName={heightClassName} onFail={fail} />
        </div>
      </Suspense>
    </MapErrorBoundary>
  );
}

export { canDrawMaps };
