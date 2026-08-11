import { Link, useLocation } from "wouter";
import { Heart } from "lucide-react";
import { useFavoriteCount, openSignupModal } from "@/lib/favorites";
import { useAccount } from "@/lib/account";

// Heart icon in the Navbar with a small red count badge.
// Behavior:
//   - Signed in: link to /saved (their server-synced favorites).
//   - Signed out with 0 favorites: link to /saved anyway (empty state
//     encourages them to start favoriting).
//   - Signed out with 1+ favorites: shows the signup gate on click so they
//     can create an account and sync their list.

export function NavbarFavoriteButton() {
  const count = useFavoriteCount();
  const { account } = useAccount();
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Anonymous + has favorites → open signup gate (Phase 4 spec).
    if (!account && count > 0) {
      e.preventDefault();
      openSignupModal({ trigger: "navbar_heart_signed_out" });
      return;
    }
    // Otherwise let the <Link> navigate to /saved normally.
    if (!account && count === 0) {
      // Also route to /saved so they see the empty state + CTA to browse.
      e.preventDefault();
      setLocation("/saved");
    }
  };

  return (
    <Link
      href="/saved"
      onClick={handleClick}
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      aria-label={
        count > 0
          ? `View your ${count} saved listing${count === 1 ? "" : "s"}`
          : "Your saved listings"
      }
    >
      <Heart
        className={`w-4 h-4 transition-colors ${count > 0 ? "text-accent fill-accent" : "text-white"}`}
      />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-primary">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
