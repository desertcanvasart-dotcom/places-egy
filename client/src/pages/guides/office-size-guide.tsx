import { GuideLayout } from "@/components/guides/GuideLayout";
import { findGuide } from "@/lib/guides";

const guide = findGuide("office-size-guide")!;

export default function OfficeSizeGuidePage() {
  return (
    <GuideLayout guide={guide} wordCount={0}>
      <p>
        This guide is coming soon. Meanwhile, <a href="/listings">browse live
        office listings</a> or <a href="/contact">talk to a PLACES advisor</a>.
      </p>
    </GuideLayout>
  );
}
