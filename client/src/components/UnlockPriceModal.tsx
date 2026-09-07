import { useEffect, useRef, useState } from "react";
import { X, Loader2, Check, Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead, readUtmFromLocation } from "@/lib/leads";
import { trackEvent } from "@/lib/analytics";
import { usePriceUnlock } from "@/lib/price-unlock";
import type { Listing } from "@/lib/supabase";

// Modal that gates the exact price on listing detail + cards. Captures a
// lead (name/email/phone) into the standard leads table via POST /api/leads —
// same rate limit + honeypot + zod validation as every other lead form on the
// site. On success, sets the localStorage unlock flag so this device sees
// real prices on every listing forever.
//
// Deliberately does NOT create an account or set a session cookie. That path
// carries account-takeover risk (fixed 2026-08-30 in POST /api/accounts) and
// isn't needed for a device-local unlock. Pricing is public info once we
// choose to reveal it — no need to attach it to a persistent identity.

interface Props {
  listing: Listing | null; // The listing they clicked from — for context in the lead
  open: boolean;
  onClose: () => void;
}

export function UnlockPriceModal({ listing, open, onClose }: Props) {
  const { markUnlocked } = usePriceUnlock();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot — invisible to real users
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the first field when the modal opens.
  useEffect(() => {
    if (!open) return;
    trackEvent("price_unlock_open", {
      listing_id: listing?.id ?? null,
    });
    const t = setTimeout(() => nameInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorText(null);
    try {
      await submitLead({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        locations: [],
        lead_source: "price_unlock",
        magnet: "price_unlock",
        listing_id: listing?.id,
        page_url: typeof window !== "undefined" ? window.location.href : undefined,
        website, // honeypot
        ...readUtmFromLocation(),
      });
      trackEvent("price_unlock_submit", {
        listing_id: listing?.id ?? null,
      });
      setStatus("sent");
      // Flip the unlock flag globally — every <PriceGate> on the page rerenders.
      markUnlocked();
      // Auto-close after a beat so the visitor sees the confirmation.
      setTimeout(() => {
        onClose();
        // Reset for next open (if any). markUnlocked already persists.
        setName("");
        setEmail("");
        setPhone("");
        setStatus("idle");
      }, 1600);
    } catch (err) {
      setErrorText((err as Error).message ?? "Something went wrong");
      setStatus("error");
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-unlock-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {status === "sent" ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
              <Check className="h-6 w-6 text-white" strokeWidth={3} />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary mb-2">
              Pricing unlocked
            </h3>
            <p className="text-sm text-muted-foreground">
              Every listing on the site now shows exact pricing on this device.
              A PLACES advisor will follow up shortly.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                  <Lock className="h-4 w-4 text-accent" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                  Unlock exact pricing
                </p>
              </div>
              <h3
                id="price-unlock-title"
                className="font-serif text-xl md:text-2xl font-bold text-primary leading-tight"
              >
                See the full price and payment terms.
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Instant access to exact pricing on this and every listing.
                A PLACES advisor will follow up with the payment plan.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-3">
              {/* Honeypot — hidden from users, catches bots that auto-fill everything */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                }}
              />

              <div>
                <label
                  htmlFor="unlock-name"
                  className="block text-xs font-medium text-primary mb-1"
                >
                  Name
                </label>
                <Input
                  ref={nameInputRef}
                  id="unlock-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === "sending"}
                  className="bg-white"
                />
              </div>
              <div>
                <label
                  htmlFor="unlock-email"
                  className="block text-xs font-medium text-primary mb-1"
                >
                  Email
                </label>
                <Input
                  id="unlock-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "sending"}
                  className="bg-white"
                />
              </div>
              <div>
                <label
                  htmlFor="unlock-phone"
                  className="block text-xs font-medium text-primary mb-1"
                >
                  Phone (WhatsApp works best)
                </label>
                <Input
                  id="unlock-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={status === "sending"}
                  className="bg-white"
                />
              </div>

              <Button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-accent hover:bg-accent/90 text-white h-11 mt-2"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Unlocking…
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Unlock pricing
                  </>
                )}
              </Button>

              {status === "error" && errorText && (
                <p className="text-xs text-accent text-center">{errorText}</p>
              )}

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed pt-1">
                By submitting, you agree PLACES may contact you about this and
                similar office listings.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
