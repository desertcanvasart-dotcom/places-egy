import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type DealPoster } from "@/lib/deal-posters";
import { trackEvent } from "@/lib/analytics";

// "Latest Closed Deals" homepage carousel — displays Canva-designed poster
// images uploaded via the admin dashboard. Team designs each poster fully in
// Canva, exports PNG, uploads via /dashboard "Deal Posters" tab. The site
// just renders the image; no per-poster text editing here.
//
// Behavior mirrors DealAnnouncementCarousel: 6s auto-advance (paused for
// prefers-reduced-motion), prev/next arrows, windowed dot indicator for
// large sets. Renders nothing when there are no active posters.
export function DealPostersCarousel() {
  const { data: posters = [] } = useQuery<DealPoster[]>({
    queryKey: ["deal-posters"],
    queryFn: async () => {
      const res = await fetch("/api/deal-posters");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const [index, setIndex] = useState(0);
  const count = posters.length;
  const multiple = count > 1;

  const go = useCallback(
    (next: number) => {
      const normalized = ((next % count) + count) % count;
      setIndex(normalized);
      const poster = posters[normalized];
      if (poster) {
        trackEvent("deal_poster_navigate", {
          index: normalized,
          poster_id: poster.id,
        });
      }
    },
    [count, posters],
  );

  // Auto-advance every 6s; respect prefers-reduced-motion.
  useEffect(() => {
    if (!multiple) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [multiple, count]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  if (count === 0) return null;

  const current = posters[index];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-6 md:px-10 max-w-5xl">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-accent">
            Latest Closed Deals
          </span>
        </div>

        <div className="relative">
          {/* Poster — aspect-[4/5] matches the Canva poster ratio (1080×1350).
              object-contain keeps the whole design visible even if the source
              PNG has a slightly different aspect. */}
          <div className="relative w-full max-w-2xl mx-auto aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-neutral-100">
            <img
              key={current.id}
              src={current.poster_url}
              alt={current.caption ?? "Closed deal announcement"}
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain bg-white"
            />
          </div>

          {multiple && (
            <>
              {/* Prev / next arrows */}
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous poster"
                className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next poster"
                className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Position indicator — windowed dots for large sets, simple row
                  for small sets. Same pattern as DealAnnouncementCarousel. */}
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="flex items-center gap-1.5">
                  {posters.map((poster, i) => {
                    const distance = Math.abs(i - index);
                    if (count > 5 && distance > 2) return null;
                    const size =
                      i === index
                        ? "w-5 bg-accent"
                        : distance >= 2 && count > 5
                          ? "w-1 bg-primary/25"
                          : "w-1.5 bg-primary/35 hover:bg-primary/60";
                    return (
                      <button
                        key={poster.id}
                        type="button"
                        onClick={() => go(i)}
                        aria-label={`Go to poster ${i + 1}`}
                        aria-current={i === index}
                        className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${size}`}
                      />
                    );
                  })}
                </div>
                {count > 5 && (
                  <span className="ml-2 text-xs font-medium text-primary/60 tabular-nums">
                    {index + 1} / {count}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
