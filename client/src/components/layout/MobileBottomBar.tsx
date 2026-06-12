import { Link, useLocation } from "wouter";
import { LayoutGrid, MessageCircle, CalendarDays } from "lucide-react";
import { openCalendly } from "@/lib/calendly";

const WHATSAPP_HREF = "https://wa.me/201063618217";

// Always-visible mobile-only sticky bottom bar with the highest-intent actions
// on the site. Hidden on /listings (the destination of the Browse CTA) and on
// every desktop breakpoint.
export function MobileBottomBar() {
  const [location] = useLocation();

  if (location === "/listings") return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      <div className="grid grid-cols-3 gap-1.5 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Link href="/listings" className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-accent text-primary font-semibold text-xs hover:bg-accent/90 transition-colors">
          <LayoutGrid className="w-4 h-4" />
          Browse
        </Link>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-[#25D366] text-white font-semibold text-xs hover:bg-[#1fb855] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        <button
          onClick={() => openCalendly("mobile_bottom_bar")}
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-white text-primary font-semibold text-xs hover:bg-white/90 transition-colors"
        >
          <CalendarDays className="w-4 h-4" />
          Book
        </button>
      </div>
    </div>
  );
}
