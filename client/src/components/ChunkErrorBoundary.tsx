import { Component, useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

// Catches lazy-import chunk failures (React.lazy() promise rejections) AND
// global unhandled promise rejections + resource load errors that stem from
// the same root cause — post-deploy stale cache pointing at chunk hashes
// that no longer exist.
//
// Root cause: every deploy Vite regenerates hashed chunk filenames. If a
// user has an open tab from before the deploy, the tab's HTML still refers
// to /assets/*-<oldhash>.js which now 404s. Clicking a lazy-loaded route
// fires the error.
//
// Fix: catch the error, mark a short-TTL flag in sessionStorage, hard-
// reload the page. Fresh HTML → fresh chunks → everything works.

type Props = { children: ReactNode };
type State = { hasError: boolean; isChunk: boolean };

const RELOAD_KEY = "chunk_error_reload_attempted";
// 90s TTL — long enough to prevent a genuine crash-loop from spinning
// forever, short enough that a legit stale-chunk error two minutes later
// still auto-heals.
const RELOAD_FLAG_TTL_MS = 90 * 1000;

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg = String((err as Error).message ?? err);
  const name = String((err as Error).name ?? "");
  return (
    name === "ChunkLoadError" ||
    /loading chunk \d+ failed/i.test(msg) ||
    /failed to fetch dynamically imported module/i.test(msg) ||
    /importing a module script failed/i.test(msg) ||
    /dynamically imported module.*(?:failed|not found)/i.test(msg) ||
    /Unable to preload css/i.test(msg) ||
    /Loading CSS chunk/i.test(msg) ||
    /error loading module/i.test(msg) ||
    /NetworkError when attempting to fetch resource/i.test(msg) ||
    /Failed to fetch/i.test(msg)
  );
}

function reloadFlagIsFresh(): boolean {
  try {
    const raw = sessionStorage.getItem(RELOAD_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < RELOAD_FLAG_TTL_MS;
  } catch {
    return false;
  }
}

function attemptSelfHeal(reason: string): void {
  if (reloadFlagIsFresh()) return;
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Ignore — still attempt reload below.
  }
  console.warn(`[ChunkErrorBoundary] self-heal reload (${reason})`);
  // Add a nonce so cache layers can't return the same stale HTML.
  const url = new URL(window.location.href);
  url.searchParams.set("_r", String(Date.now()));
  window.location.replace(url.toString());
}

// Installs global window-level listeners so we catch chunk failures that
// DIDN'T come from a render (dynamic imports fired from event handlers,
// prefetches, etc). Installed once from the boundary's wrapper.
function useGlobalChunkErrorHandlers(): void {
  useEffect(() => {
    const onErr = (evt: ErrorEvent) => {
      if (isChunkLoadError(evt.error ?? evt.message)) {
        evt.preventDefault();
        attemptSelfHeal("window.error");
      }
    };
    const onRejection = (evt: PromiseRejectionEvent) => {
      if (isChunkLoadError(evt.reason)) {
        evt.preventDefault();
        attemptSelfHeal("unhandledrejection");
      }
    };
    // Resource load failures (missing script/css) bubble as a plain
    // Event with the failing element as target. capture=true because
    // these don't bubble normally.
    const onCaptureError = (evt: Event) => {
      const target = evt.target as (HTMLElement & { src?: string; href?: string }) | null;
      if (!target) return;
      const url = target.src || target.href || "";
      if (
        typeof url === "string" &&
        /\/assets\/.*\.(m?js|css)/.test(url) &&
        target.tagName !== "IMG"
      ) {
        attemptSelfHeal(`resource:${target.tagName}`);
      }
    };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onCaptureError, true);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onCaptureError, true);
    };
  }, []);
}

// Small functional wrapper so we can use hooks alongside the class-based
// error boundary (which can't use hooks itself).
function ChunkErrorBoundaryHooksBridge({ children }: { children: ReactNode }) {
  useGlobalChunkErrorHandlers();
  return <>{children}</>;
}

class ChunkErrorBoundaryInner extends Component<Props, State> {
  state: State = { hasError: false, isChunk: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, isChunk: isChunkLoadError(error) };
  }

  componentDidCatch(error: Error): void {
    if (!isChunkLoadError(error)) {
      console.error("[ChunkErrorBoundary] non-chunk error:", error);
      return;
    }
    attemptSelfHeal("render");
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Chunk errors self-heal via window.location.replace in componentDidCatch.
      // Show a neutral spinner for the ~hundreds of ms until the reload fires,
      // instead of flashing a scary "something went wrong" message.
      if (this.state.isChunk) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
          </div>
        );
      }
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-background">
          <div className="max-w-md text-center">
            <h2 className="text-lg font-serif font-bold text-primary mb-2">
              Something went wrong loading this page
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Refresh the page to try again.
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem(RELOAD_KEY);
                } catch {
                  // ignore
                }
                const url = new URL(window.location.href);
                url.searchParams.set("_r", String(Date.now()));
                window.location.replace(url.toString());
              }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ChunkErrorBoundary({ children }: Props) {
  return (
    <ChunkErrorBoundaryInner>
      <ChunkErrorBoundaryHooksBridge>{children}</ChunkErrorBoundaryHooksBridge>
    </ChunkErrorBoundaryInner>
  );
}
