import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  submitLead,
  readUtmFromLocation,
  LOCATION_CHOICES,
  type LeadSubmitInput,
  type LocationSlug,
} from "@/lib/leads";
import { trackEvent } from "@/lib/analytics";

// Reusable lead form. Used across every capture point — market-report page,
// blog slide-up popup, homepage CTA, etc. Wrapper components pass the right
// `leadSource` (and optionally `magnet`/`listingId`).
//
// Required fields (per PLACES real-estate lead qualification):
//   - Full name
//   - Email
//   - Phone (with +20 country-code hint)
//   - Locations interested in (at least one of the 6 canonical districts)
// Optional:
//   - Free-text "anything specific" (e.g. specific project the visitor's
//     eyeing, size, budget)
//
// Behavior:
//   - Honeypot field ("website") is hidden with CSS; bots that fill it are
//     silently accepted by the server without persisting (bot doesn't retry)
//   - UTM params auto-pulled from the current URL
//   - On success, fires GA4 event `contact_form_submit` with source + magnet

type Props = {
  leadSource: string;
  magnet?: string;
  listingId?: number;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  className?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
};

export function LeadForm({
  leadSource,
  magnet,
  listingId,
  submitLabel = "Send me the report",
  successTitle = "You're on the list.",
  successBody = "The report will land in your inbox within a few minutes. Check spam if you don't see it.",
  className,
  messageLabel = "Anything specific you're looking for?",
  messagePlaceholder = "e.g. a project you're eyeing, size, budget, timing…",
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [locations, setLocations] = useState<Set<LocationSlug>>(new Set());
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleLocation = (slug: LocationSlug) => {
    setLocations((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length >= 4 &&
    locations.size > 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (phone.trim().length < 4) {
      setError("Phone number is required.");
      return;
    }
    if (locations.size === 0) {
      setError("Pick at least one location you're interested in.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: LeadSubmitInput = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        locations: Array.from(locations),
        lead_source: leadSource,
        page_url:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        ...(message.trim() ? { message: message.trim() } : {}),
        ...(magnet ? { magnet } : {}),
        ...(listingId ? { listing_id: listingId } : {}),
        ...(honeypot ? { website: honeypot } : {}),
        ...readUtmFromLocation(),
      };
      await submitLead(payload);
      trackEvent("contact_form_submit", {
        source: leadSource,
        magnet: magnet ?? null,
        listing_id: listingId ?? null,
        locations: Array.from(locations).join(","),
      });
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className={`flex flex-col items-center text-center gap-3 py-8 ${className ?? ""}`}
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        <h3 className="text-lg font-serif font-bold text-primary">{successTitle}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className ?? ""}`}>
      {/* Honeypot — hidden from real users, catches bots that fill every field. */}
      <div
        className="absolute -left-[9999px] w-px h-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="lf-website">Website</label>
        <input
          id="lf-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="lf-name" className="text-sm text-primary">
            Full name <span className="text-accent">*</span>
          </Label>
          <Input
            id="lf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white"
            autoComplete="name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lf-email" className="text-sm text-primary">
            Email <span className="text-accent">*</span>
          </Label>
          <Input
            id="lf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lf-phone" className="text-sm text-primary">
          Phone <span className="text-accent">*</span>
        </Label>
        <Input
          id="lf-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-white"
          autoComplete="tel"
          placeholder="+20 100 000 0000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-primary">
          Locations you're interested in <span className="text-accent">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {LOCATION_CHOICES.map(({ slug, label }) => {
            const active = locations.has(slug);
            return (
              <button
                key={slug}
                type="button"
                onClick={() => toggleLocation(slug)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-primary/70 border-border/60 hover:border-primary hover:text-primary"
                }`}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lf-message" className="text-sm text-primary">
          {messageLabel}{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="lf-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={2000}
          className="bg-white resize-none"
          placeholder={messagePlaceholder}
        />
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <Button
        type="submit"
        disabled={submitting || !canSubmit}
        className="w-full h-11 bg-primary hover:bg-primary/90 text-white"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
