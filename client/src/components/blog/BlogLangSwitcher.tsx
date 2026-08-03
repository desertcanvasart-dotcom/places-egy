import { Link, useLocation } from "wouter";
import { Globe } from "lucide-react";
import type { BlogLang } from "@/lib/blog";

// EN <-> AR toggle shown only inside blog pages. Clicking it flips between
// /blog and /ar/blog (or the equivalent post URL if we're on a detail page).
//
// Only the blog itself is translated right now — the rest of the site stays
// English — so this switcher is deliberately NOT in the global Navbar.
export function BlogLangSwitcher({ lang }: { lang: BlogLang }) {
  const [location] = useLocation();

  // Compute the target URL for the *other* language, preserving the slug on
  // detail pages. For the index we just jump to /blog or /ar/blog.
  const target = (() => {
    if (lang === "en") {
      // We're on /blog or /blog/:slug — mirror to /ar/blog[/slug].
      if (location === "/blog") return "/ar/blog";
      if (location.startsWith("/blog/")) return `/ar${location}`;
      return "/ar/blog";
    }
    // lang === "ar", we're on /ar/blog or /ar/blog/:slug — strip the /ar prefix.
    if (location === "/ar/blog") return "/blog";
    if (location.startsWith("/ar/blog/")) return location.slice(3);
    return "/blog";
  })();

  return (
    <Link
      href={target}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-primary/80 hover:border-primary hover:text-primary transition-colors"
      aria-label={
        lang === "en" ? "Switch to Arabic version" : "Switch to English version"
      }
    >
      <Globe className="w-3.5 h-3.5" />
      {lang === "en" ? "العربية" : "English"}
    </Link>
  );
}
