import { CalendarDays } from "lucide-react";
import { openCalendly } from "@/lib/calendly";

// Desktop-only floating "Book a meeting" widget, anchored bottom-LEFT to avoid
// the cookie banner (bottom-right) and the mobile bottom bar. Hidden below lg
// where the MobileBottomBar already carries a "Book" action.
export function BookMeetingFloat() {
  return (
    <button
      onClick={() => openCalendly("desktop_float", "talk_to_us")}
      aria-label="Book a meeting"
      className="hidden lg:inline-flex fixed bottom-6 left-6 z-40 items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <CalendarDays className="h-4 w-4" />
      Book a meeting
    </button>
  );
}
