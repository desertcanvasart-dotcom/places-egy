import { trackEvent } from "@/lib/analytics";

// Toggle-style FAQ list in the same style as the /faqs/{topic} pages (native
// details/summary, +/− marker). Renders no JSON-LD: pages that use it get their
// FAQPage block from the server (server/seo/render.ts), once.
export function FaqAccordionList({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  return (
    <div className="divide-y divide-border/40 border-y border-border/40">
      {faqs.map((f) => (
        <details
          key={f.question}
          className="group"
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open) {
              trackEvent("select_content", { content_type: "faq", item_name: f.question });
            }
          }}
        >
          <summary className="flex items-start justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <h3 className="text-base md:text-lg font-medium text-primary leading-snug flex-1 group-hover:text-accent transition-colors">
              {f.question}
            </h3>
            <span className="inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary/60 group-open:bg-accent group-open:text-white transition-colors text-sm font-medium">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <div className="pb-6 pr-12 max-w-3xl">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{f.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
