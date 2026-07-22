import { useQuery } from "@tanstack/react-query";
import { type DealPoster } from "@/lib/deal-posters";

// "Latest Closed Deals" homepage strip — Canva-designed poster images shown
// in a static row. Each poster does a subtle scale in/out pulse to draw the
// eye without shifting layout. Team designs each poster fully in Canva,
// exports PNG, uploads via /dashboard "Deal Posters" tab.
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

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-6 md:px-10 max-w-7xl">
        <div className="flex flex-wrap gap-4 md:gap-6 justify-start">
          {posters.map((poster, i) => (
            <div
              key={poster.id}
              className="w-40 md:w-60 aspect-4/5 rounded-xl overflow-hidden shadow-lg bg-white animate-[posterPulse_4s_ease-in-out_infinite] motion-reduce:animate-none"
              style={{ animationDelay: `${(i % 5) * 0.4}s` }}
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
        @keyframes posterPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
      `}</style>
    </section>
  );
}
