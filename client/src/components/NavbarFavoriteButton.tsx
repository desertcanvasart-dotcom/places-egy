import { Link } from "wouter";
import { Heart } from "lucide-react";
import { useFavoriteCount } from "@/lib/favorites";

// Heart icon in the Navbar with a small red count badge. Clicking navigates
// to /my-favorites. In Phase 2 we'll add a signup prompt if the user has
// favorites but isn't signed in — for Phase 1 it's a straight link.

export function NavbarFavoriteButton() {
  const count = useFavoriteCount();

  return (
    <Link
      href="/my-favorites"
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
