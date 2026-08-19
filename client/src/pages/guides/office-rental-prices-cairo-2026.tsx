import { GuideLayout } from "@/components/guides/GuideLayout";
import { findGuide } from "@/lib/guides";

// Placeholder — full content ships in the next commit. Route + schema
// active now so sitemap URLs don't 404 while the guide is being written.

const guide = findGuide("office-rental-prices-cairo-2026")!;

export default function OfficeRentalPricesCairo2026Guide() {
  return (
    <GuideLayout guide={guide} wordCount={0}>
      <p>
        This guide is coming soon. Meanwhile, <a href="/listings">browse live
        office listings</a> or <a href="/contact">talk to a PLACES advisor</a>{" "}
        for pricing specific to your requirements.
      </p>
    </GuideLayout>
  );
}
