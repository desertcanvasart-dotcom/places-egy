import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

// Fires a `scroll_depth` GA4 event once per session per milestone (25/50/75/100%)
// on the current page. Uses a ref instead of state so re-renders don't reset
// the "already-fired" tracker. The percentage is relative to full page scroll
// height, not viewport-triggered content.
//
// Use on content pages (blog posts, developer pages, service pages) to see
// how far readers actually get before bouncing. If most people bounce at 25%
// on a blog post, the intro is losing them.
export function useScrollDepth(pagePath: string) {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    fired.current = new Set();
    const milestones = [25, 50, 75, 100];

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const m of milestones) {
        if (pct >= m && !fired.current.has(m)) {
          fired.current.add(m);
          trackEvent("scroll_depth", { percent: m, page_path: pagePath });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Fire once on mount in case the page loads scrolled (e.g. anchor link).
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pagePath]);
}
