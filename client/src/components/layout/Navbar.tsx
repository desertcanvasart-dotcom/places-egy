import { Link, useLocation } from "wouter";
import { Menu, X, Building2, TrendingUp, Handshake, Repeat, Coins, MessageCircle, ChevronDown, ArrowRight, Newspaper, HelpCircle, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { NavbarFavoriteButton } from "@/components/NavbarFavoriteButton";

const RESOURCES = [
  { title: "Blog", href: "/blog", icon: Newspaper },
  { title: "FAQs", href: "/faqs", icon: HelpCircle },
  { title: "Glossary", href: "/glossary", icon: BookOpen },
];

const SERVICES = [
  { title: "Leasing", href: "/services/leasing", icon: Handshake },
  { title: "Primary Property", href: "/services/primary-property", icon: Building2 },
  { title: "Property Resale", href: "/services/property-resale", icon: Repeat },
  { title: "Investment Consultation", href: "/services/investment-consultation", icon: TrendingUp },
  { title: "Income Generating Property", href: "/services/income-generating-property", icon: Coins },
];

const WHATSAPP_HREF = "https://wa.me/201063618217";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);

  const isActive = (path: string) => location === path;

  const hasHero =
    ["/", "/listings", "/admin"].includes(location) ||
    location.startsWith("/developers/") ||
    /^\/locations\/[^/]+$/.test(location) ||
    /^\/admin\/[^/]+$/.test(location);
  const useSolid = !hasHero || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobile = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileSection(null);
  };

  const toggleSection = (key: string) =>
    setOpenMobileSection((curr) => (curr === key ? null : key));

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500 text-white",
      useSolid
        ? "bg-primary/95 backdrop-blur-lg border-b border-white/5 shadow-sm shadow-primary/5"
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="w-full px-6 md:px-10 h-20 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        {/* Column 1 — logo (left-aligned) */}
        <Link href="/" className="flex items-center gap-2 shrink-0 lg:justify-self-start">
          <img src="/images/places-logo.png" alt="PLACES" className="h-10 w-auto brightness-0 invert shrink-0" />
        </Link>

        {/* Column 2 — nav (center column, auto-sized, mathematically centered) */}
        <div className="hidden lg:flex items-center gap-2 justify-self-center">
          <NavigationMenu delayDuration={0} skipDelayDuration={0}>
            <NavigationMenuList className="gap-0">
              {/* Properties */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10 px-3.5">Admin Offices</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <AdminOfficesMenuContent />
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Locations */}
              <NavigationMenuItem>
                <Link href="/locations" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base text-white hover:text-accent hover:bg-white/10 transition-colors px-3.5", isActive("/locations") && "text-accent font-medium")}>
                  Locations
                </Link>
              </NavigationMenuItem>

              {/* Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10 px-3.5">Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[280px] gap-1.5 p-3">
                    {SERVICES.map((item) => (
                      <li key={item.title}>
                        <Link href={item.href} className="flex items-center gap-2.5 select-none rounded-md px-3 py-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* About */}
              <NavigationMenuItem>
                <Link href="/why-places" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base text-white hover:text-accent hover:bg-white/10 transition-colors px-3.5", isActive("/why-places") && "text-accent font-medium")}>
                  About
                </Link>
              </NavigationMenuItem>

              {/* Resources */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10 px-3.5">Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-55 gap-1.5 p-3">
                    {RESOURCES.map((item) => (
                      <li key={item.title}>
                        <Link href={item.href} className="flex items-center gap-2.5 select-none rounded-md px-3 py-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-medium leading-none">{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Column 3 — Desktop CTAs (right-aligned) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 lg:justify-self-end">
          <Link href="/contact">
            <Button variant="outline" size="sm" className="rounded-full px-4 h-9 text-sm font-medium bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50">
              Contact
            </Button>
          </Link>
          <Link href="/listings">
            <Button size="sm" className="rounded-full px-4 h-9 text-sm font-medium bg-accent hover:bg-accent/90 text-primary shadow-lg shadow-accent/20">
              Browse Listings
            </Button>
          </Link>
          <NavbarFavoriteButton />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-primary border-b border-white/10 shadow-xl py-4 px-4 flex flex-col gap-2 animate-in slide-in-from-top-5 text-white h-[calc(100vh-5rem)] overflow-y-auto pb-20">
          {/* Browse Listings — primary CTA at top */}
          <Link href="/listings" onClick={closeMobile}>
            <Button className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold py-4 text-sm">
              Browse Listings
            </Button>
          </Link>

          {/* Properties (expandable) */}
          <div className="border-b border-white/10">
            <button
              onClick={() => toggleSection("properties")}
              className={cn(
                "w-full flex items-center justify-between text-lg font-medium py-3 px-3 -mx-3 rounded-md transition-colors hover:text-accent",
                openMobileSection === "properties" ? "text-accent bg-white/5" : "text-white",
              )}
            >
              Admin Offices
              <ChevronDown className={cn("w-4 h-4 transition-transform", openMobileSection === "properties" && "rotate-180")} />
            </button>
            {openMobileSection === "properties" && (
              <div className="pb-3 pl-4 flex flex-col gap-2 border-l border-white/10">
                <Link href="/admin/business-park" onClick={closeMobile} className="text-sm hover:text-accent pl-2">Business Park</Link>
                <Link href="/admin/business-building" onClick={closeMobile} className="text-sm hover:text-accent pl-2">Business Building</Link>
                <Link href="/admin/mixed-use" onClick={closeMobile} className="text-sm hover:text-accent pl-2">Mixed Use</Link>
                <Link href="/admin" onClick={closeMobile} className="text-xs font-semibold text-accent hover:text-accent/80 pl-2 inline-flex items-center gap-1">View all admin offices <ArrowRight className="w-3 h-3" /></Link>
              </div>
            )}
          </div>

          {/* Locations (flat) */}
          <Link href="/locations" onClick={closeMobile} className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent">Locations</Link>

          {/* Services (expandable) */}
          <div className="border-b border-white/10">
            <button
              onClick={() => toggleSection("services")}
              className={cn(
                "w-full flex items-center justify-between text-lg font-medium py-3 px-3 -mx-3 rounded-md transition-colors hover:text-accent",
                openMobileSection === "services" ? "text-accent bg-white/5" : "text-white",
              )}
            >
              Services
              <ChevronDown className={cn("w-4 h-4 transition-transform", openMobileSection === "services" && "rotate-180")} />
            </button>
            {openMobileSection === "services" && (
              <div className="pb-3 pl-4 flex flex-col gap-2">
                {SERVICES.map((item) => (
                  <Link key={item.title} href={item.href} onClick={closeMobile} className="text-sm hover:text-accent">
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* About (flat) */}
          <Link href="/why-places" onClick={closeMobile} className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent">About</Link>

          {/* Resources (expandable) */}
          <div className="border-b border-white/10">
            <button
              onClick={() => toggleSection("resources")}
              className={cn(
                "w-full flex items-center justify-between text-lg font-medium py-3 px-3 -mx-3 rounded-md transition-colors hover:text-accent",
                openMobileSection === "resources" ? "text-accent bg-white/5" : "text-white",
              )}
            >
              Resources
              <ChevronDown className={cn("w-4 h-4 transition-transform", openMobileSection === "resources" && "rotate-180")} />
            </button>
            {openMobileSection === "resources" && (
              <div className="pb-3 pl-4 flex flex-col gap-2">
                {RESOURCES.map((item) => (
                  <Link key={item.title} href={item.href} onClick={closeMobile} className="text-sm hover:text-accent inline-flex items-center gap-2">
                    <item.icon className="w-4 h-4" /> {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contact (flat) */}
          <Link href="/contact" onClick={closeMobile} className="text-lg font-medium py-3 border-b border-white/10 hover:text-accent">Contact</Link>

          {/* WhatsApp direct link — GA4 outbound_click so we can measure
              which pages drive the most WA taps from the mobile nav. */}
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent("outbound_click", {
                channel: "whatsapp",
                source: "navbar_mobile",
                page_url:
                  typeof window !== "undefined" ? window.location.pathname : null,
              });
              closeMobile();
            }}
            className="flex items-center gap-2 text-base font-medium py-3 text-accent hover:text-accent/80"
          >
            <MessageCircle className="w-5 h-5" /> WhatsApp us directly
          </a>
        </div>
      )}
    </header>
  );
}

const ADMIN_SUBTYPES = [
  {
    href: "/admin/business-park",
    title: "Business Park",
    description: "Integrated corporate communities with campus-scale plots, parking, and shared amenities.",
    image: "/images/business-park.jpg",
  },
  {
    href: "/admin/business-building",
    title: "Business Building",
    description: "Standalone corporate towers with premium addresses and turnkey office floors.",
    image: "/images/Mindset.png",
  },
  {
    href: "/admin/mixed-use",
    title: "Mixed Use",
    description: "Office floors stacked above active retail and F&B — built-in foot traffic.",
    image: "/images/mixed-use.jpg",
  },
] as const;

function AdminOfficesMenuContent() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = ADMIN_SUBTYPES[activeIndex];

  return (
    <div className="grid grid-cols-[200px_320px] gap-3 p-3">
      <div className="flex flex-col">
        <ul className="grid gap-0.5">
          {ADMIN_SUBTYPES.map((item, i) => (
            <li key={item.href} onMouseEnter={() => setActiveIndex(i)} onFocus={() => setActiveIndex(i)}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center select-none rounded-md no-underline outline-none transition-all py-3.5 px-3 border-l-2",
                  i === activeIndex
                    ? "border-accent bg-accent/5 pl-4"
                    : "border-transparent hover:border-accent hover:bg-accent/5 hover:pl-4",
                )}
              >
                <span className={cn("text-base font-semibold tracking-tight transition-colors", i === activeIndex ? "text-accent" : "text-foreground group-hover:text-accent")}>
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-2 pt-2 border-t border-border/40">
          <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-accent hover:text-accent/80 transition-colors">
            View all admin offices <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <Link href={active.href} className="relative overflow-hidden rounded-md group no-underline">
        <img
          key={active.image}
          src={active.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 animate-in fade-in"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/95 via-primary/55 to-primary/10" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <div className="text-sm font-semibold leading-tight">{active.title}</div>
          <p className="text-xs leading-snug mt-1.5 text-white/85">{active.description}</p>
        </div>
      </Link>
    </div>
  );
}
