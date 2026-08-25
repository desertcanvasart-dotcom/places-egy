import { DeveloperPage } from "@/components/developers/DeveloperPage";

export default function RegentsPage() {
  return (
    <DeveloperPage
      config={{
        slug: "regents",
        name: "Regents",
        tagline:
          "New Cairo developer with three projects across both office corridors and the Gamal Abdelnaser Axis — Address 1, Address 2, and Regents Park.",
        aboutHeadline:
          "Three projects across South 90, North 90, and Gamal Abdelnaser Axis",
        factBullets: [
          "Portfolio spans two office corridors (North 90 + South 90) and a strip-mall axis (Gamal Abdelnaser)",
          "Business buildings — Address 1 (South 90) and Address 2 (North 90) — serve the corporate and mid-market segments respectively",
          "Regents Park on Gamal Abdelnaser Axis — strip-mall format serving one of New Cairo's emerging residential-adjacent commercial spines",
        ],
        bodyParagraphs: [
          `<span class="text-accent font-medium">Regents</span> is a New Cairo developer with one of the more geographically-diversified portfolios inside Fifth Settlement — three projects spanning both office corridors and one strip-mall axis. <span class="text-accent font-medium">Address 1</span> sits on <strong class="text-primary font-semibold">South 90 Street</strong> — the corporate spine of New Cairo — while <span class="text-accent font-medium">Address 2</span> sits on <strong class="text-primary font-semibold">North 90 Street</strong>, serving the mid-market segment closer to residential clusters.`,
          `<span class="text-accent font-medium">Regents Park</span> is a strip-mall project on <strong class="text-primary font-semibold">Gamal Abdelnaser Axis</strong> — an emerging residential-adjacent commercial spine in Fifth Settlement. The three-project portfolio gives tenants real optionality within one developer: prime South 90 address at Address 1, mid-market North 90 at Address 2, or retail / F&B / boutique space at Regents Park depending on business type.`,
        ],
        related: [
          { name: "Makateb Offices", slug: "makateb-offices" },
          { name: "Concord Group", slug: "concord-group" },
          { name: "Living In", slug: "living-in" },
          { name: "Eloia", slug: "eloia" },
          { name: "Mercon", slug: "mercon" },
        ],
      }}
    />
  );
}
