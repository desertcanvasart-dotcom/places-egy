import { Link } from "wouter";

// Add `slug` for a developer once its detail page is created.
// Logos with a slug become clickable links; logos without stay static.
const DEVELOPERS: { name: string; logo: string; slug?: string }[] = [
  { name: "SODIC", logo: "/images/SODIC_Logo.png", slug: "sodic" },
  { name: "Emaar", logo: "/images/Emaar_logo.png", slug: "emaar" },
  { name: "Marakez", logo: "/images/Marakez _logo.png", slug: "marakez" },
  { name: "Al Futtaim", logo: "/images/Al futtaim _ logo.png", slug: "al-futtaim" },
  { name: "Majid Al Futtaim", logo: "/images/majid-al-futtaim.png", slug: "majid-al-futtaim" },
  { name: "Palm Hills", logo: "/images/PalmHills_logo.png", slug: "palm-hills" },
  { name: "LMD", logo: "/images/LMD-developments.png", slug: "lmd" },
  { name: "The Waterway", logo: "/images/waterway.png", slug: "the-waterway" },
  { name: "Morshedy Group", logo: "/images/morshedy-group.png", slug: "morshedy" },
  { name: "Town Writers", logo: "/images/town-writers-logo.png", slug: "town-writers" },
  { name: "Arabella", logo: "/images/arabella-developments.png", slug: "arabella" },
];

export function DeveloperStrip() {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-4">
          Trusted developer partners
        </h3>
      </div>
      <div className="overflow-hidden">
        <div
          className="flex items-center gap-0 w-max"
          style={{ animation: "marquee 30s linear infinite" }}
        >
          {[...DEVELOPERS, ...DEVELOPERS].map((dev, i) => {
            const logo = (
              <img
                src={dev.logo}
                alt={`${dev.name} logo`}
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              />
            );
            const baseClass = "group flex items-center justify-center w-36 h-14 shrink-0 px-4";

            return dev.slug ? (
              <Link
                key={i}
                href={`/developers/${dev.slug}`}
                className={`${baseClass} cursor-pointer`}
                aria-label={`View ${dev.name} developer page`}
              >
                {logo}
              </Link>
            ) : (
              <div key={i} className={baseClass}>
                {logo}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
