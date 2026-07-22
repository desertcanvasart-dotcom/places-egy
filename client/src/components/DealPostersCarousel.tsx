import { useQuery } from "@tanstack/react-query";
import { type DealPoster } from "@/lib/deal-posters";

// "Latest Closed Deals" homepage marquee — Canva-designed poster images
// scroll continuously from right to left. Team designs each poster fully in
// Canva, exports PNG, uploads via /dashboard "Deal Posters" tab. The site
// just renders the image; no per-poster text editing here.
//
// The strip is left-aligned (edge-to-edge, no centered container) and the
// row auto-scrolls via a CSS keyframe. We duplicate the poster list once so
// the loop is seamless.
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

  if (posters.length === 0) return null;

  // Duplicate so the -50% translate loop is seamless.
  const loop = [...posters, ...posters];

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto px-6 md:px-10 mb-6 md:mb-8">
        <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-accent">
          Latest Closed Deals
        </span>
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
        }}
      >
        <div
          className="flex gap-4 md:gap-6 w-max animate-[posterMarquee_40s_linear_infinite] motion-reduce:animate-none"
        >
          {loop.map((poster, i) => (
            <div
              key={`${poster.id}-${i}`}
              className="shrink-0 w-40 md:w-60 aspect-4/5 rounded-xl overflow-hidden shadow-lg bg-white"
            >
              <img
                src={poster.poster_url}
                alt={poster.caption ?? "Closed deal announcement"}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes posterMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
