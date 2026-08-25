import { DeveloperPage } from "@/components/developers/DeveloperPage";

// PLACEHOLDER copy — replace with real Makateb Offices background info
// once available. Structure follows the same 4-part shape as every other
// dev page: tagline, aboutHeadline, factBullets, bodyParagraphs.

export default function MakatebOfficesPage() {
  return (
    <DeveloperPage
      config={{
        slug: "makateb-offices",
        name: "Makateb Offices",
        tagline:
          "A New Cairo developer focused on administrative office buildings along the South 90 Street commercial corridor — one of Fifth Settlement's highest-traffic office spines.",
        aboutHeadline:
          "Purpose-built administrative offices on New Cairo's South 90 Street",
        factBullets: [
          "Focused portfolio: administrative office buildings in New Cairo",
          "Positioned along South 90 Street — one of Fifth Settlement's main commercial corridors",
          "Flagship project 'Makateb' — a dedicated admin building serving Fifth Settlement's SME + corporate demand",
        ],
        bodyParagraphs: [
          `<span class="text-accent font-medium">Makateb Offices</span> is a New Cairo–focused developer specializing in <strong class="text-primary font-semibold">administrative office buildings</strong> along the South 90 Street commercial spine. Fifth Settlement's South 90 corridor has evolved into one of Cairo's most active office markets — anchored by Cairo Festival City, Waterway, and a mix of mid-rise business buildings serving SMEs, professional services, and corporate satellite offices.`,
          `The developer's flagship project — <span class="text-accent font-medium">Makateb</span> — brings dedicated administrative office space to this axis. Business-building format means standard admin floor plates, dedicated parking, and building services tailored to office tenants rather than a mixed-use retail + office split. For tenants who want a New Cairo address without paying prime tower rates in Cairo Festival City or Waterway, Makateb sits in the value tier of the South 90 stock.`,
        ],
        related: [
          { name: "Concord Group", slug: "concord-group" },
          { name: "Living In", slug: "living-in" },
          { name: "Regents", slug: "regents" },
          { name: "Eloia", slug: "eloia" },
          { name: "Milcon", slug: "milcon" },
        ],
      }}
    />
  );
}
