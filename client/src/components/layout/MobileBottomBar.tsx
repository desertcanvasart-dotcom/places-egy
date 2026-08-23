import { Link, useLocation } from "wouter";
import { LayoutGrid, MessageCircle, CalendarDays, Phone } from "lucide-react";
import { openCalendly } from "@/lib/calendly";
import { trackEvent } from "@/lib/analytics";

const WHATSAPP_HREF = "https://wa.me/201063618217";
const PHONE_TEL = "tel:+201063618217";

// Always-visible mobile-only sticky bottom bar with the highest-intent actions
// on the site. Adapts to context:
//   - /listings (browse): hidden entirely (browse IS the current activity)
//   - /listings/[id] (detail): swap Browse for Call, since a visitor
//     already on a specific unit has highest intent to phone/WhatsApp
//   - everything else: default Browse / WhatsApp / Book
export function MobileBottomBar() {
  const [location] = useLocation();

  if (location === "/listings") return null;

  // Listing detail page: Call takes the primary slot because the visitor
  // is already on the unit they want, they don't need "Browse" — they
  // need the fastest path to a human.
  const isDetail = location.startsWith("/listings/");

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      <div className="grid grid-cols-3 gap-1.5 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {isDetail ? (
          // Detail-page variant: Call in the primary red slot for
          // instant conversion.
          <a
            href={PHONE_TEL}
            onClick={() => trackEvent("call_click", { source: "mobile_bottom_bar_detail" })}
            className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-accent text-primary font-semibold text-xs hover:bg-accent/90 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        ) : (
          <Link
            href="/listings"
            onClick={() => trackEvent("browse_listings_click", { source: "mobile_bottom_bar" })}
            className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-accent text-primary font-semibold text-xs hover:bg-accent/90 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            Browse
          </Link>
        )}
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("whatsapp_click", { source: isDetail ? "mobile_bottom_bar_detail" : "mobile_bottom_bar" })}
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-[#25D366] text-white font-semibold text-xs hover:bg-[#1fb855] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        <button
          onClick={() => openCalendly(isDetail ? "mobile_bottom_bar_detail" : "mobile_bottom_bar", "talk_to_us")}
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-white text-primary font-semibold text-xs hover:bg-white/90 transition-colors"
        >
          <CalendarDays className="w-4 h-4" />
          Book
        </button>
      </div>
    </div>
  );
}
