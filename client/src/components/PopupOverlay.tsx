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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background photo layer */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative flex max-h-[90vh] flex-col overflow-y-auto p-6 md:p-10 text-white">
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            aria-label="Close announcement"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Headlines */}
          <h2 id="popup-title" className="mb-5 mt-2 font-serif text-4xl leading-[0.95] md:text-6xl">
            <span className="block text-accent">{popup.headline_top}</span>
            <span className="block">{popup.headline_bottom}</span>
          </h2>

          {/* Body */}
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
            {popup.body_paragraph}
          </p>

          {/* Project logo — optional */}
          {popup.project_logo_url && (
            <div className="mb-6 flex items-center justify-center">
              <img
                src={popup.project_logo_url}
                alt=""
                className="max-h-16 max-w-[220px] object-contain md:max-h-20"
                loading="eager"
                decoding="async"
              />
            </div>
          )}

          {/* Stat block — freeform label + value + unit */}
          {(popup.stat_label || popup.stat_value) && (
            <div className="mb-8 text-center">
              {popup.stat_label && (
                <p className="mb-1 text-lg font-medium text-white/90 md:text-xl">
                  {popup.stat_label}
                </p>
              )}
              {popup.stat_value && (
                <p className="font-serif text-5xl font-bold leading-none md:text-7xl">
                  <span className="text-accent">{popup.stat_value}</span>
                  {popup.stat_unit && (
                    <span className="ml-1 text-lg align-baseline md:text-xl">
                      {popup.stat_unit}
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Footer caption */}
          {popup.footer_caption && (
            <p className="mb-6 text-center text-xs leading-relaxed text-white/80 md:text-sm">
              {popup.footer_caption}
            </p>
          )}

          {/* Contact strip */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/85 md:text-sm">
            <span>🌐 {SITE}</span>
            <span>📞 {PHONE_DISPLAY}</span>
            <span>✉ {EMAIL_DISPLAY}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
