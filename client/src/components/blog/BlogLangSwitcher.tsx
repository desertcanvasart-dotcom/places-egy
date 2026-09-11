import { Link, useLocation } from "wouter";
import { Globe } from "lucide-react";
import type { BlogLang } from "@/lib/blog";

// EN <-> AR toggle shown only inside blog pages. When the caller can pass in
// the post's translationSlug (resolved by fetchPost via Polylang's
// translations pointer), the switcher jumps directly to the counterpart
// post's URL. When it can't (blog hub, or post has no paired translation),
// it falls back to the other language's blog hub — never leaves the visitor
// on a 404 caused by slug mismatch.
//
// Only the blog itself is translated right now — the rest of the site stays
// English — so this switcher is deliberately NOT in the global Navbar.
export function BlogLangSwitcher({
  lang,
  translationSlug,
}: {
  lang: BlogLang;
  // Optional: the slug of this post's counterpart in the other language.
  // Passed on the detail page from BlogPost.translationSlug. When null the
  // switcher falls back to the hub (safer than sending them to a 404).
  translationSlug?: string | null;
}) {
  const [location] = useLocation();

  const target = (() => {
    // On a detail page, prefer the resolved translation slug so the visitor
    // lands on the exact translated post instead of an assumed-same-slug URL.
    if (translationSlug) {
      return lang === "en"
        ? `/ar/blog/${translationSlug}`
        : `/blog/${translationSlug}`;
    }
    // Detail page with NO translation pointer — send to the other-language
    // hub. Better than a 404 from a mismatched slug.
    if (lang === "en") {
      if (location === "/blog") return "/ar/blog";
      if (location.startsWith("/blog/")) return "/ar/blog";
      return "/ar/blog";
    }
    if (location === "/ar/blog") return "/blog";
    if (location.startsWith("/ar/blog/")) return "/blog";
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
