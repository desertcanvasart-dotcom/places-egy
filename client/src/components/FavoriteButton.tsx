import { Heart } from "lucide-react";
import { useFavorite } from "@/lib/favorites";

// Heart button — click to add/remove a listing from favorites. Phase 1 uses
// localStorage; Phase 2 will layer Supabase sync on top for signed-in users
// without changing this component's API.
//
// Two visual sizes:
//   size="sm" — for listing card corners (compact, 32×32)
//   size="lg" — for the listing detail page hero (larger, more prominent)

type Props = {
  listingId: number;
  size?: "sm" | "lg";
  /** When true, positions itself absolutely in the top-right of its parent
   *  (parent must be relative). Useful for overlaying on listing card images. */
  overlay?: boolean;
  className?: string;
};

export function FavoriteButton({
  listingId,
  size = "sm",
  overlay = false,
  className,
}: Props) {
  const { isFavorited, toggle } = useFavorite(listingId);

  const dimensions =
    size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const iconSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";

  const positioning = overlay
    ? "absolute top-3 right-3 z-10"
    : "";

  return (
    <button
      type="button"
      onClick={(e) => {
        // Stop propagation so a heart click on a listing card doesn't also
        // navigate to the detail page.
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={isFavorited}
      className={`${positioning} ${dimensions} flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 ${className ?? ""}`}
    >
      <Heart
        className={`${iconSize} transition-colors ${
          isFavorited ? "text-accent fill-accent" : "text-primary/60"
        }`}
      />
    </button>
  );
}
