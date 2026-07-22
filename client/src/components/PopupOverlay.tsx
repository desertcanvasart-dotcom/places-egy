import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  type Popup,
  getDismissedHashes,
  markPopupDismissed,
} from "@/lib/popups";
import { trackEvent } from "@/lib/analytics";

// Announcement popup that appears on the homepage 3 seconds after the visitor
// lands. Announcement-only (no CTA) — visitor closes via the X button. Content
// comes from Supabase via /api/popup, edited from the admin dashboard.
//
// Frequency: content-hashed. Each popup row has a content_hash computed by the
// server over its editable fields (see server/popup-schema.ts). When the user
// closes the popup we push that hash into localStorage. On subsequent visits
// we skip rendering if the current popup's hash is in the dismissed list.
// Editing any field on the admin side changes the hash → devices that
// dismissed the old version see the new one once. Toggling is_active off/on
// does NOT change the hash so scheduling doesn't re-annoy dismissed users.
//
// Background image is fixed (baked into the template). Contact strip (site /
// phone / email) is fixed and pulled from the organization constants below —
// keep those synced with the values in lib/schema.ts organizationSchema.

const SITE = "www.places-egy.com";
const PHONE_DISPLAY = "+20 106 361 8217";
const EMAIL_DISPLAY = "Info@places-egy.com";

// Fallback background image if we ever want to keep it fully generic. Using
// the existing hero photo means no new asset needed. Swap this to a dedicated
// "generic done deal background" if PLACES prefers.
const BACKGROUND_IMAGE = "/images/hero-section.jpg";

const TRIGGER_DELAY_MS = 3000;

export function PopupOverlay() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const { data: popup } = useQuery<Popup | null>({
    queryKey: ["popup"],
    queryFn: async () => {
      const res = await fetch("/api/popup");
      if (!res.ok) return null;
      const raw = await res.text();
      if (!raw) return null;
      try {
        return JSON.parse(raw) as Popup | null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fire the trigger only after we know there IS an active popup, it hasn't
  // been dismissed for this content hash, and the 3-second delay has elapsed.
  useEffect(() => {
    if (!popup) return;
    const dismissed = getDismissedHashes();
    if (dismissed.includes(popup.content_hash)) return;
    setReady(true);
    const t = setTimeout(() => {
      setOpen(true);
      trackEvent("popup_view", {
        popup_id: popup.id,
        content_hash: popup.content_hash,
      });
    }, TRIGGER_DELAY_MS);
    return () => clearTimeout(t);
  }, [popup]);

  if (!popup || !ready || !open) return null;

  const close = () => {
    setOpen(false);
    markPopupDismissed(popup.content_hash);
    trackEvent("popup_dismiss", {
      popup_id: popup.id,
      content_hash: popup.content_hash,
    });
  };

  return (
    <div
      // dvh (dynamic viewport height) instead of vh handles Safari's collapsing
      // address bar correctly — vh alone can push content offscreen on iOS. p-3
      // on mobile leaves a 6px inner gutter after the card's own padding so
      // even iPhone SE (320px) gets a usable card. Overflow-y-auto on the
      // OUTER container so if the card ever exceeds viewport height the whole
      // thing scrolls together (not just the inner content) — safer on very
      // short screens like landscape phones.
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-4 md:p-8 bg-black/70 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div
        // Width scales up on wider viewports (max-w-2xl at ≥768px, max-w-3xl
        // at ≥1024px) so the card doesn't look lost on a 1920px monitor.
        // max-h uses dvh so it respects the actual visible viewport on iOS.
        className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl my-auto overflow-hidden rounded-xl md:rounded-2xl shadow-2xl bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background photo layer — sits behind all content. opacity bumped
            from 30% to 40% so the building is clearly visible per Canva design
            while text stays legible on the dark card. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
          aria-hidden="true"
        />
        {/* Extra dark overlay ensures body/caption text stays legible even
            with the bumped-up background opacity. */}
        <div className="absolute inset-0 bg-neutral-900/50" aria-hidden="true" />

        {/* Content — padding scales with breakpoint (24 → 32 → 40 px). */}
        <div className="relative flex flex-col p-6 sm:p-8 md:p-10 text-white">
          {/* Close button — 44×44 tap target on mobile (Apple/Google guideline
              minimum). Slightly larger and pulled in from corners so it's easy
              to hit without hitting the card edge. */}
          <button
            type="button"
            onClick={close}
            aria-label="Close announcement"
            className="absolute right-3 top-3 md:right-4 md:top-4 z-10 flex h-11 w-11 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5 md:h-4 md:w-4" />
          </button>

          {/* Headlines — sizes step up across breakpoints, tight leading to
              match Canva. break-words prevents overflow on narrow viewports
              if headline_top/bottom are ever set to long strings. */}
          <h2
            id="popup-title"
            className="mb-4 mt-1 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] break-words pr-12 md:pr-16"
          >
            <span className="block text-accent">{popup.headline_top}</span>
            <span className="block">{popup.headline_bottom}</span>
          </h2>

          {/* Body — sizes step up gently; max-w keeps line length readable on
              wide screens (~65ch is the sweet spot for prose). */}
          <p className="mb-6 md:mb-8 max-w-xl text-sm sm:text-base leading-relaxed text-white/90">
            {popup.body_paragraph}
          </p>

          {/* Project logo — heights scale up. max-w cap prevents very wide
              logos from stretching across the whole card. */}
          {popup.project_logo_url && (
            <div className="mb-5 md:mb-6 flex items-center justify-center">
              <img
                src={popup.project_logo_url}
                alt=""
                className="max-h-14 sm:max-h-16 md:max-h-20 max-w-[80%] md:max-w-[260px] object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          )}

          {/* Stat block — big number is the visual anchor. Sizes step up
              aggressively because this is the single hero element. */}
          {(popup.stat_label || popup.stat_value) && (
            <div className="mb-6 md:mb-8 text-center">
              {popup.stat_label && (
                <p className="mb-1 text-base sm:text-lg md:text-xl font-medium text-white/90">
                  {popup.stat_label}
                </p>
              )}
              {popup.stat_value && (
                <p className="font-serif font-bold leading-none text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                  <span className="text-accent">{popup.stat_value}</span>
                  {popup.stat_unit && (
                    <span className="ml-1 text-base sm:text-lg md:text-xl lg:text-2xl align-baseline">
                      {popup.stat_unit}
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Footer caption — small, centered, tighter leading. */}
          {popup.footer_caption && (
            <p className="mb-5 md:mb-6 text-center text-xs md:text-sm leading-relaxed text-white/80">
              {popup.footer_caption}
            </p>
          )}

          {/* Contact strip — stacks vertically on very narrow screens (justify-
              center + wrap), sits in a single row from sm: up. Uniform gap
              instead of justify-between so wrapping doesn't create ugly gaps. */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs md:text-sm text-white/85">
            <span className="whitespace-nowrap">🌐 {SITE}</span>
            <span className="whitespace-nowrap">📞 {PHONE_DISPLAY}</span>
            <span className="whitespace-nowrap">✉ {EMAIL_DISPLAY}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
