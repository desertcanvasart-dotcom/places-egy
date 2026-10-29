import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, HelpCircle } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import { FaqAccordionList } from "@/components/FaqAccordionList";
import { supabase, type Listing } from "@/lib/supabase";
import {
  DEVELOPERS_WITH_OWN_FAQ,
  developerInventory,
  developerRows,
  developersWithStock,
} from "@/lib/developer-inventory";

const CARD_FIELDS =
  "id,title,transaction_type,property_type,subtype,developer,project,location,location_area,price,currency,area_sqm,furnishing,images,rental_status,rental_end,updated_at,price_per_meter,maintenance_fees,maintenance_status,floor,parking,delivery_date";

// "Available now" + FAQs for a developer page, from live listings. The server
// renders the same content (and the FAQPage JSON-LD) for crawlers, so this
// renders nothing until the data is in and adds no schema of its own.
export function DeveloperInventory({ slug }: { slug: string }) {
  const { data: all, isLoading } = useQuery<Listing[]>({
    queryKey: ["developer-inventory-all"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select(CARD_FIELDS)
        .eq("is_test", false)
        .eq("property_type", "admin")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const inv = useMemo(() => (all ? developerInventory(slug, all) : null), [all, slug]);
  const newest = useMemo(() => (all ? developerRows(all, slug).slice(0, 4) : []), [all, slug]);
  const others = useMemo(() => (all && inv && inv.count === 0 ? developersWithStock(all, slug) : []), [all, inv, slug]);

  if (isLoading || !inv) return null;
  const showFaqs = !DEVELOPERS_WITH_OWN_FAQ.has(slug);

  return (
    <>
      <section id="available-units" className="py-8 bg-secondary/40 scroll-mt-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Available now</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-2">
                {inv.count > 0 ? `${inv.name} offices available (${inv.count})` : `${inv.name} offices`}
              </h2>
            </div>
            {inv.count > 4 && (
              <Link
                href={`/listings?developer=${slug}`}
                className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors"
              >
                See all {inv.count} {inv.name} units <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            )}
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-6">{inv.summary}</p>

          {inv.count > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {newest.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} compact hideSubtype />
                ))}
              </div>
              {inv.count > 4 && (
                <Link
                  href={`/listings?developer=${slug}`}
                  className="md:hidden mt-6 flex w-full items-center justify-center rounded-full bg-primary text-white font-medium px-5 py-3 text-sm"
                >
                  See all {inv.count} {inv.name} units <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              )}
              {inv.landingLinks.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-3">
                  {inv.landingLinks.map((l) => (
                    <li key={l.path}>
                      <Link
                        href={l.path}
                        className="inline-flex items-center min-h-11 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
                      >
                        {l.heading}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 max-w-3xl">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full bg-accent hover:bg-accent/90 text-white font-bold px-6 h-11 text-sm transition-colors"
              >
                Ask about {inv.name} availability <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              {others.length > 0 && (
                <>
                  <p className="mt-6 mb-3 text-sm font-medium text-primary flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-accent" /> Developers with offices available now
                  </p>
                  <ul className="flex flex-wrap gap-3">
                    {others.map((d) => (
                      <li key={d.slug}>
                        <Link
                          href={`/developers/${d.slug}`}
                          className="inline-flex items-center min-h-11 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
                        >
                          {d.name} ({d.count})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {showFaqs && (
        <section className="py-10">
          <div className="container mx-auto px-6 md:px-10 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 md:w-7 md:h-7 text-accent shrink-0" />
              <span>{inv.name}: FAQs</span>
            </h2>
            <FaqAccordionList faqs={inv.faqs} />
          </div>
        </section>
      )}
    </>
  );
}
