import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead, readUtmFromLocation, type LeadSubmitInput } from "@/lib/leads";
import { trackEvent } from "@/lib/analytics";

// Reusable lead form. Placed anywhere on the site — contact page, lead-magnet
// landing pages, blog post CTAs, listing detail inquiry boxes, footer, exit
// popup. Every capture point is a thin wrapper that renders this with the
// right lead_source (and optionally a magnet or listing_id).
//
// Behavior:
//  - name + email required; phone + message optional
//  - honeypot field ("website") hidden with CSS; bots that fill it get silently
//    accepted without hitting the DB (server-side)
//  - UTM params are pulled from the current URL and attached automatically
//  - On success, fires GA4 event `contact_form_submit` with the source label
//    so we can slice conversion by capture point in analytics
//  - Success state stays visible until the wrapper unmounts the form; no
//    auto-reset that would confuse users about whether they actually submitted

type Props = {
  leadSource: string;
  magnet?: string;
  listingId?: number;
  showMessage?: boolean;
  showPhone?: boolean;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  className?: string;
};

export function LeadForm({
  leadSource,
  magnet,
  listingId,
  showMessage = true,
  showPhone = true,
  submitLabel = "Send message",
  successTitle = "Thanks — we'll be in touch.",
  successBody = "A PLACES advisor will reply within a few hours.",
  className,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: LeadSubmitInput = {
        name: name.trim(),
        email: email.trim(),
        lead_source: leadSource,
        page_url:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
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
      <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
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
            Name <span className="text-accent">*</span>
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

      {showPhone && (
        <div className="space-y-1.5">
          <Label htmlFor="lf-phone" className="text-sm text-primary">
            Phone <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="lf-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-white"
            autoComplete="tel"
            placeholder="+20 100 000 0000"
          />
        </div>
      )}

      {showMessage && (
        <div className="space-y-1.5">
          <Label htmlFor="lf-message" className="text-sm text-primary">
            Message <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="lf-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={2000}
            className="bg-white resize-none"
            placeholder="What are you looking for?"
          />
        </div>
      )}

      {error && <p className="text-sm text-accent">{error}</p>}

      <Button
        type="submit"
        disabled={submitting || !name.trim() || !email.trim()}
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
