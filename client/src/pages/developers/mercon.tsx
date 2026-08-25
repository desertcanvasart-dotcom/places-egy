import { DeveloperPage } from "@/components/developers/DeveloperPage";

export default function MerconPage() {
  return (
    <DeveloperPage
      config={{
        slug: "mercon",
        name: "Mercon",
        tagline:
          "New Cairo strip-mall developer with the G7 project on North 90 Street — a retail-anchored commercial development in Fifth Settlement's residential-adjacent corridor.",
        aboutHeadline: "G7 — strip-mall commercial on New Cairo's North 90",
        factBullets: [
          "Strip-mall format on North 90 Street",
          "Flagship project: G7 — ground-floor retail with above-street admin units",
          "Serves Fifth Settlement's residential-adjacent retail and F&B tenant demand",
        ],
        bodyParagraphs: [
          `<span class="text-accent font-medium">Mercon</span> is a New Cairo developer focused on <strong class="text-primary font-semibold">strip-mall commercial space</strong> along <strong class="text-primary font-semibold">North 90 Street</strong> — Fifth Settlement's residential-adjacent retail corridor. The North 90 axis has evolved into a mix of F&B, retail, and boutique service tenants serving the surrounding residential neighborhoods, distinct from the corporate office spine of South 90.`,
          `The developer's flagship project, <span class="text-accent font-medium">G7</span>, delivers strip-mall retail on the ground floor with light admin space above — the typical North 90 mid-block format. Unit sizes are calibrated for boutique operators, F&B tenants, and small professional-service offices that want frontage on a well-trafficked residential-adjacent axis without the size or price commitment of a full business building.`,
        ],
        related: [
          { name: "Makateb Offices", slug: "makateb-offices" },
          { name: "Concord Group", slug: "concord-group" },
          { name: "Living In", slug: "living-in" },
          { name: "Regents", slug: "regents" },
          { name: "Eloia", slug: "eloia" },
        ],
      }}
    />
  );
}
