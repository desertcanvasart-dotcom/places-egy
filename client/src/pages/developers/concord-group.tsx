import { DeveloperPage } from "@/components/developers/DeveloperPage";

export default function ConcordGroupPage() {
  return (
    <DeveloperPage
      config={{
        slug: "concord-group",
        name: "Concord Group",
        tagline:
          "New Cairo developer with the Concord El Abd administrative building on South 90 Street — Fifth Settlement's densest office corridor.",
        aboutHeadline:
          "The Concord El Abd building on New Cairo's South 90 corridor",
        factBullets: [
          "Focused on business-building administrative office space in New Cairo",
          "Flagship project: Concord El Abd on South 90 Street",
          "South 90 Street: one of Fifth Settlement's most active commercial spines",
        ],
        bodyParagraphs: [
          `<span class="text-accent font-medium">Concord Group</span> is a New Cairo real-estate developer whose portfolio centers on <strong class="text-primary font-semibold">Concord El Abd</strong> — an administrative office building on <strong class="text-primary font-semibold">South 90 Street</strong>, one of Fifth Settlement's densest office corridors. The South 90 spine runs through the heart of the Fifth Settlement business district, anchored by developments like Cairo Festival City, Waterway, and CBD-adjacent business parks.`,
          `Concord El Abd delivers a business-building format — full-floor and split-floor admin space, dedicated parking, and building services calibrated to corporate tenants rather than a retail-heavy mixed-use ground floor. For tenants looking to plant a flag on South 90 without the price ceiling of the prime CBD towers, Concord El Abd fits the mid-market tier of the corridor's admin office stock.`,
        ],
        related: [
          { name: "Makateb Offices", slug: "makateb-offices" },
          { name: "Living In", slug: "living-in" },
          { name: "Regents", slug: "regents" },
          { name: "Eloia", slug: "eloia" },
          { name: "Milcon", slug: "milcon" },
        ],
      }}
    />
  );
}
