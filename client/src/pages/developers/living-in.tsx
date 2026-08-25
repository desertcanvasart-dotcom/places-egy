import { DeveloperPage } from "@/components/developers/DeveloperPage";

export default function LivingInPage() {
  return (
    <DeveloperPage
      config={{
        slug: "living-in",
        name: "Living In",
        tagline:
          "Multi-project New Cairo developer with three administrative buildings across North 90 Street and 70 Street — one of Fifth Settlement's most active mid-market office portfolios.",
        aboutHeadline:
          "Three admin buildings across North 90 Street and 70 Street",
        factBullets: [
          "Portfolio of three business-building projects: ARC, Living in 237, and Living in",
          "North 90 Street and 70 Street corridors — Fifth Settlement's mid-market office spines",
          "Business-building format across all three: administrative floors with dedicated parking and standard MEP services",
        ],
        bodyParagraphs: [
          `<span class="text-accent font-medium">Living In</span> is a New Cairo developer with one of the most active mid-market office portfolios in Fifth Settlement — three administrative buildings spanning <strong class="text-primary font-semibold">North 90 Street</strong> and <strong class="text-primary font-semibold">70 Street</strong>. All three projects — <span class="text-accent font-medium">ARC</span>, <span class="text-accent font-medium">Living in 237</span>, and <span class="text-accent font-medium">Living in</span> — deliver the same business-building format: administrative floor plates, dedicated parking, and MEP services calibrated for office tenants.`,
          `The North 90 and 70 Street corridors serve Fifth Settlement's residential-adjacent office demand — tenants who want to be close to where their staff lives rather than on the corporate spine of South 90. Living In's three-building portfolio gives PLACES clients real optionality within a single developer — different unit sizes, different micro-locations along the two corridors, and consistent building quality across the portfolio.`,
        ],
        related: [
          { name: "Makateb Offices", slug: "makateb-offices" },
          { name: "Concord Group", slug: "concord-group" },
          { name: "Regents", slug: "regents" },
          { name: "Eloia", slug: "eloia" },
          { name: "Mercon", slug: "mercon" },
        ],
      }}
    />
  );
}
