import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOCATION_CONTENT } from "@/lib/location-content";

// Shown for unknown routes. The server already answers these with HTTP 404;
// this keeps the client view noindex and canonical-free to match.
function useNoIndex() {
  useEffect(() => {
    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.getAttribute("content") ?? null;
    robots?.setAttribute("content", "noindex, follow");
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.remove();
    const previousTitle = document.title;
    document.title = "Page not found | PLACES";
    return () => {
      if (robots && previousRobots) robots.setAttribute("content", previousRobots);
      if (canonical) document.head.appendChild(canonical);
      document.title = previousTitle;
    };
  }, []);
}

export default function NotFound() {
  useNoIndex();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-5 md:px-10 max-w-3xl pt-32 pb-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent mb-3">Page not found</p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">We couldn't find that page</h1>
        <p className="text-muted-foreground mb-8">
          The page may have moved, or the link may be mistyped. Search for an office or browse by location.
        </p>

        <form
          role="search"
          className="flex gap-2 mb-10"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            navigate(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
          }}
        >
          <label htmlFor="not-found-search" className="sr-only">Search offices</label>
          <Input
            id="not-found-search"
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Area, project or developer"
            className="bg-white"
          />
          <Button type="submit" className="bg-primary text-white shrink-0">
            <Search className="w-4 h-4 mr-2" /> Search
          </Button>
        </form>

        <h2 className="text-lg font-serif font-bold text-primary mb-3">Offices by location</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-10">
          {Object.values(LOCATION_CONTENT).map((loc) => (
            <li key={loc.slug}>
              <Link href={`/locations/${loc.slug}`} className="text-primary hover:text-accent underline-offset-4 hover:underline">
                Offices in {loc.displayName}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/listings">
          <Button className="bg-accent hover:bg-accent/90 text-white">Browse all listings</Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
