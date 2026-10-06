import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ArrowRight, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { supabase, type Listing } from "@/lib/supabase";
import { ListingCard } from "@/components/listings/ListingCard";
import { useFavoriteIds, clearAllFavorites } from "@/lib/favorites";
import { useAccount } from "@/lib/account";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { listingCurrency } from "@/lib/currency";
import { listingUrl } from "@/lib/listings";
import { trackEvent } from "@/lib/analytics";

function formatPrice(l: Pick<Listing, "price" | "currency">): string {
  if (!l.price) return "Price on request";
  const currency = listingCurrency(l);
  const formatted = new Intl.NumberFormat("en-US").format(l.price);
  return `${formatted} ${currency}`;
}

// PLACES's public WhatsApp number (same one used in the header + contact page).
// Egyptian numbers start with +20 for international dialing; wa.me needs the
// digits with no plus, no leading zero.
const PLACES_WHATSAPP = "201063618217";

// Anonymous /saved view. Phase 2 will layer signed-in state on top
// (merged Supabase favorites, cross-device sync). Phase 1 reads localStorage.

export default function SavedListingsPage() {
  useDocumentMeta({
    title: "Your saved offices | PLACES",
    description:
      "Your favorited administrative office listings from PLACES — review them, share with an advisor, or browse for more.",
    url: "https://places-egy.com/saved",
  });

  // Noindex the page — the content is per-user (localStorage-bound), so
  // there's nothing meaningful for Google to index, and the crawler would
  // just see an empty state. Matches Airbnb/Zillow's per-user page policy.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const favoriteIds = useFavoriteIds();

  // Fetch all listings once, then filter client-side to favorited IDs.
  // pgrest doesn't support .in(), and the listings table is small enough
  // (dozens, not thousands) that filtering client-side is cheaper than
  // multiple single-id fetches.
  const { data: allListings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["listings-all"],
    enabled: favoriteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Listing>("listings")
        .select("*")
        .eq('is_test', false);
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  const listings = useMemo(() => {
    const map = new Map(allListings.map((l) => [l.id, l]));
    return favoriteIds
      .map((id) => map.get(id))
      .filter((l): l is Listing => l != null);
  }, [allListings, favoriteIds]);

  // WhatsApp share text. Formatted so a PLACES advisor scanning the message
  // instantly sees title, price, and direct link for each favorite.
  const whatsappUrl = useMemo(() => {
    if (listings.length === 0) return null;
    const lines = [
      `Hi PLACES — I saved ${listings.length} listing${listings.length === 1 ? "" : "s"} I'd like to discuss:`,
      "",
      ...listings.map((l, i) => {
        return `${i + 1}. ${l.title}\n   ${formatPrice(l)}\n   https://places-egy.com${listingUrl(l)}`;
      }),
      "",
      "Can you help me with these?",
    ];
    return `https://wa.me/${PLACES_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [listings]);

  const handleWhatsappClick = () => {
    trackEvent("favorites_whatsapp_share", {
      count: listings.length,
    });
  };

  // Manual "Email me my list" flow — only available when signed in (we need
  // an email address on file to send to). Fires POST /api/accounts/favorites/
  // email-me-now which bypasses the 2h debounce for user-initiated sends.
  const { account } = useAccount();
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const handleEmailMeClick = async () => {
    if (!account) return;
    setEmailState("sending");
    try {
      const res = await fetch("/api/accounts/favorites/email-me-now", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(String(res.status));
      trackEvent("favorites_email_me_now", { count: listings.length });
      setEmailState("sent");
      setTimeout(() => setEmailState("idle"), 4000);
    } catch {
      setEmailState("error");
      setTimeout(() => setEmailState("idle"), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-32 pb-8 md:pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-6 h-6 text-accent fill-accent" />
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">
                Your saved offices
              </h1>
            </div>
            {favoriteIds.length > 0 ? (
              <p className="text-muted-foreground">
                {favoriteIds.length} listing{favoriteIds.length === 1 ? "" : "s"}{" "}
                saved to this device. Share them with an advisor on WhatsApp, or
                keep browsing for more.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Nothing saved yet. Browse listings and tap the ♥ to save units
                you like — they'll all show up here.
              </p>
            )}
          </div>

          {favoriteIds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border/40 p-12 text-center">
              <Heart className="w-12 h-12 text-primary/20 mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                Your saved list is empty.
              </p>
              <Link href="/listings">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Browse listings <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Sticky CTA — share the saved list via WhatsApp or email.
                  The email option only appears for signed-in users because we
                  need their email on file to send to; anonymous users can
                  still share to WhatsApp without signing up. */}
              {whatsappUrl && (
                <div className="mb-8 bg-primary text-white rounded-2xl p-5 md:p-6">
                  <div className="mb-4 md:mb-5">
                    <p className="text-sm font-semibold mb-1">
                      Share your list — get advice back
                    </p>
                    <p className="text-xs text-white/70">
                      Send your saved offices to PLACES and we'll reply with
                      details, availability, and next steps.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleWhatsappClick}
                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-medium px-5 py-3 rounded-full text-sm sm:shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send on WhatsApp
                    </a>
                    {account && (
                      <button
                        type="button"
                        onClick={handleEmailMeClick}
                        disabled={emailState === "sending"}
                        className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium px-5 py-3 rounded-full text-sm sm:shrink-0 disabled:opacity-60"
                      >
                        {emailState === "sending" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending…
                          </>
                        ) : emailState === "sent" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Sent to your inbox
                          </>
                        ) : emailState === "error" ? (
                          <>
                            <Mail className="w-4 h-4" />
                            Try again
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            Email me my list
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isLoading ? (
                <p className="text-muted-foreground text-center py-12">
                  Loading your saved listings…
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}

              {/* Clear button (small, at the bottom) */}
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Clear all saved listings? This can't be undone.",
                      )
                    ) {
                      clearAllFavorites();
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-accent transition-colors"
                >
                  Clear all saved
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
