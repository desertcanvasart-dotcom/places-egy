import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  onSignupModalRequested,
  readAnonymousFavoriteIds,
  clearAnonymousFavorites,
} from "@/lib/favorites";
import {
  signupAccount,
  bulkMergeFavorites,
  addServerFavorite,
} from "@/lib/account";
import { trackEvent } from "@/lib/analytics";

// Blocking modal that appears when an anonymous visitor hits the favorites
// cap. Sits at App root so any FavoriteButton can trigger it via the
// openSignupModal() event bus (see lib/favorites.ts).
//
// On successful signup we:
//   1. Set the session cookie (server side, in POST /api/accounts response)
//   2. Bulk-merge the anonymous localStorage favorites into the new account
//   3. Add the listing the user was TRYING to save when the gate fired
//   4. Wipe the anonymous localStorage list (server is now source of truth)
//   5. Invalidate the account-me query so all <FavoriteButton /> re-render as
//      signed-in
//   6. Show a 2-second success state, then close
//
// If the same email already had an account, the server just rotates the
// session and returns existed:true — we still merge/add the current favorites
// so the visitor doesn't lose their intent.

export function SignupGateModal() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pendingListingId, setPendingListingId] = useState<number | undefined>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return onSignupModalRequested((detail) => {
      setOpen(true);
      setPendingListingId(detail.pendingListingId);
      setError(null);
      setSuccess(false);
    });
  }, []);

  // Escape key closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while modal is open.
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length >= 4;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signupAccount({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: website || undefined,
      });
      // Merge anonymous favorites + the one they were trying to save.
      const anonIds = readAnonymousFavoriteIds();
      const merged = pendingListingId
        ? Array.from(new Set([...anonIds, pendingListingId]))
        : anonIds;
      if (merged.length > 0) {
        try {
          await bulkMergeFavorites(merged);
        } catch {
          // Fallback: if bulk fails, at least try to save the pending one.
          if (pendingListingId) {
            try {
              await addServerFavorite(pendingListingId);
            } catch {
              // Ignore — worst case the user re-hearts after signup.
            }
          }
        }
      }
      clearAnonymousFavorites();
      await qc.invalidateQueries({ queryKey: ["account-me"] });

      trackEvent("account_signup", {
        merged_favorites: merged.length,
        trigger: "favorite_cap",
      });

      setSuccess(true);
      setTimeout(() => setOpen(false), 1800);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-primary/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — dark primary with brand accent */}
        <div className="bg-primary text-white px-6 py-5 relative">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-accent fill-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
              Quick signup · 15 seconds
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold leading-tight">
            Save more listings to your account
          </h2>
          <p className="text-xs text-white/70 mt-1.5">
            Your first 2 favorites are already saved. Create a free account to
            keep saving, view them on any device, and get matched with new
            listings.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <h3 className="text-lg font-serif font-bold text-primary">
                Account created — you're in.
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your saved list is now synced to your account.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Honeypot */}
              <div
                className="absolute -left-[9999px] w-px h-px overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="sg-website">Website</label>
                <input
                  id="sg-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sg-name" className="text-sm text-primary">
                  Full name <span className="text-accent">*</span>
                </Label>
                <Input
                  id="sg-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sg-email" className="text-sm text-primary">
                  Email <span className="text-accent">*</span>
                </Label>
                <Input
                  id="sg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sg-phone" className="text-sm text-primary">
                  Phone <span className="text-accent">*</span>
                </Label>
                <Input
                  id="sg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white"
                  autoComplete="tel"
                  placeholder="+20 100 000 0000"
                  required
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
                    Creating account…
                  </>
                ) : (
                  "Create my account"
                )}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                We'll only use your info to save your list and share matching
                listings. No spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
