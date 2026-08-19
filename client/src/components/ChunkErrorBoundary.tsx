import { Component, type ReactNode } from "react";

// Catches errors thrown by React.lazy() when a code-split chunk fails to
// load — usually because the deploy shipped new hashed filenames and the
// user's cached HTML still points at the old ones. Prior symptom: user
// clicks a nav link (heart, blog, anything lazy) → blank white screen
// forever → they hard-refresh to recover.
//
// New behavior: catch the chunk-load error and reload the page ONCE. On
// reload the browser fetches fresh HTML pointing at the new chunk hashes
// and everything works. We fingerprint the reload attempt in
// sessionStorage so a real (non-chunk) crash doesn't infinite-loop.

type Props = { children: ReactNode };
type State = { hasError: boolean };

const RELOAD_KEY = "chunk_error_reload_attempted";
// If more than this much time has passed since the last reload attempt,
// treat the boundary as fresh again — a chunk error in a new browsing
// session after a deploy shouldn't be blocked by a stale one-shot flag
// from hours ago.
const RELOAD_FLAG_TTL_MS = 5 * 60 * 1000; // 5 min

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
    /Loading CSS chunk/i.test(msg)
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

export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    if (!isChunkLoadError(error)) {
      // Not a chunk-load error — let it bubble to the console for real
      // debugging. Don't reload (would mask the actual bug).
      console.error("[ChunkErrorBoundary] non-chunk error:", error);
      return;
    }
    // Reload-loop guard with TTL: only skip the auto-reload if we tried
    // in the last few minutes. Otherwise a legit chunk error hours later
    // (new deploy, stale tab) would be trapped showing the manual button.
    try {
      if (reloadFlagIsFresh()) return;
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      // If sessionStorage is blocked, still attempt one reload.
    }
    window.location.reload();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
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
                } catch {}
                window.location.reload();
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
