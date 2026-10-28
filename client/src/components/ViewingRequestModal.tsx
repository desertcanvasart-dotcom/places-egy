import { useEffect, useRef, useState } from "react";
import { X, Loader2, Check, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead, readUtmFromLocation } from "@/lib/leads";
import { trackEvent } from "@/lib/analytics";
import type { Listing } from "@/lib/supabase";

// "Book a viewing / Get a shortlist" request for one listing. Same fields and
// POST /api/leads path (rate limit, honeypot, zod) as every other lead form.

interface Props {
  listing: Listing | null; // The listing they clicked from — for context in the lead
  open: boolean;
  onClose: () => void;
}

export function ViewingRequestModal({ listing, open, onClose }: Props) {
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
    trackEvent("viewing_request_open", {
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
        lead_source: "viewing_request",
        listing_id: listing?.id,
        page_url: typeof window !== "undefined" ? window.location.href : undefined,
        website, // honeypot
        ...readUtmFromLocation(),
      });
      trackEvent("viewing_request_submit", {
        listing_id: listing?.id ?? null,
      });
      setStatus("sent");
      // Auto-close after a beat so the visitor sees the confirmation.
      setTimeout(() => {
        onClose();
        // Reset for next open (if any).
        setName("");
        setEmail("");
        setPhone("");
        setStatus("idle");
      }, 2200);
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
      aria-labelledby="viewing-request-title"
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
              Request received
            </h3>
            <p className="text-sm text-muted-foreground">
              A PLACES advisor will contact you shortly to arrange the viewing
              and send similar options.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                  <CalendarCheck className="h-4 w-4 text-accent" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                  Book a viewing
                </p>
              </div>
              <h3
                id="viewing-request-title"
                className="font-serif text-xl md:text-2xl font-bold text-primary leading-tight"
              >
                Book a viewing or get a shortlist.
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Tell us how to reach you. An advisor will arrange a viewing of
                this office and send similar options that fit your needs.
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
                  htmlFor="viewing-name"
                  className="block text-xs font-medium text-primary mb-1"
                >
                  Name
                </label>
                <Input
                  ref={nameInputRef}
                  id="viewing-name"
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
                  htmlFor="viewing-email"
                  className="block text-xs font-medium text-primary mb-1"
                >
                  Email
                </label>
                <Input
                  id="viewing-email"
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
                  htmlFor="viewing-phone"
                  className="block text-xs font-medium text-primary mb-1"
                >
                  Phone (WhatsApp works best)
                </label>
                <Input
                  id="viewing-phone"
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
                    Sending…
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Request a viewing
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
