import { DeveloperPage } from "@/components/developers/DeveloperPage";

export default function EloiaPage() {
  return (
    <DeveloperPage
      config={{
        slug: "eloia",
        name: "Eloia",
        tagline:
          "New Cairo strip-mall developer on North 90 Street — Fifth Settlement's F&B and retail-anchored commercial corridor.",
        aboutHeadline:
          "Strip-mall commercial space on New Cairo's North 90 Street",
        factBullets: [
          "Strip-mall format on North 90 Street — one of Fifth Settlement's residential-adjacent retail corridors",
          "Flagship project: Eloia — retail and F&B ground-floor space with above-street admin units",
          "North 90 traffic pattern: high pedestrian + car traffic between Fifth Settlement residential clusters",
        ],
        bodyParagraphs: [
          `<span class="text-accent font-medium">Eloia</span> is a New Cairo developer focused on <strong class="text-primary font-semibold">strip-mall commercial space</strong> on <strong class="text-primary font-semibold">North 90 Street</strong> — Fifth Settlement's residential-adjacent retail corridor. Where South 90 is the office / corporate spine, North 90 has evolved into a mix of F&B, retail, and boutique service tenants serving the surrounding residential neighborhoods.`,
          `The developer's flagship project, also branded <span class="text-accent font-medium">Eloia</span>, delivers strip-mall retail on the ground floor with light admin space above — typical of the North 90 mid-block format. Strip-mall stock trades at a premium per meter versus larger business parks because tenant demand is anchored by daily-use retail and F&B, and unit sizes are small enough for boutique operators to acquire without over-committing capital.`,
        ],
        related: [
          { name: "Makateb Offices", slug: "makateb-offices" },
          { name: "Concord Group", slug: "concord-group" },
          { name: "Living In", slug: "living-in" },
          { name: "Regents", slug: "regents" },
          { name: "Mercon", slug: "mercon" },
        ],
      }}
    />
  );
}
