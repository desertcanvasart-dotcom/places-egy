import { Link, useLocation } from "wouter";
import { Search, Menu, X, Phone, Building2, TrendingUp, Handshake, Repeat, Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  // Only the home page has a dark hero — every other page uses a light background,
  // so the navbar should always show its solid state for legibility.
  const isHomePage = location === "/";
  const useSolid = !isHomePage || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500 text-white",
      useSolid
        ? "bg-primary/95 backdrop-blur-lg border-b border-white/5 shadow-sm shadow-primary/5"
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="container mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/src/assets/places-logo.png" alt="PLACES" className="h-10 w-auto brightness-0 invert" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <NavigationMenu delayDuration={0} skipDelayDuration={0}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/listings" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base text-white hover:text-accent hover:bg-white/10 transition-colors", isActive("/listings") && "text-accent font-medium")}>
                  Listings
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10">Properties</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-2 gap-5 p-5 w-[520px]">
                    {/* Admin Offices Column */}
                    <div>
                      <h4 className="mb-3 px-3 text-xs font-semibold leading-none text-accent uppercase tracking-wider">Admin Offices</h4>
                      <ul className="grid gap-1">
                        <li>
                          <Link href="/admin-offices/business-park" className="block select-none rounded-md px-3 py-2.5 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Business Parks</div>
                            <p className="line-clamp-1 text-xs leading-snug text-muted-foreground mt-1">
                              Integrated corporate communities
                            </p>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin-offices/business-building" className="block select-none rounded-md px-3 py-2.5 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Business Building</div>
                            <p className="line-clamp-1 text-xs leading-snug text-muted-foreground mt-1">
                              Standalone corporate towers
                            </p>
                          </Link>
                        </li>
                        <li>
                          <Link href="/admin-offices/mixed-use" className="block select-none rounded-md px-3 py-2.5 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Mixed Use</div>
                            <p className="line-clamp-1 text-xs leading-snug text-muted-foreground mt-1">
                              Retail and office combinations
                            </p>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Commercial Column */}
                    <div>
                      <h4 className="mb-3 px-3 text-xs font-semibold leading-none text-accent uppercase tracking-wider">Commercial</h4>
                      <ul className="grid gap-1">
                        <li>
                          <Link href="/commercial/mega-malls" className="block select-none rounded-md px-3 py-2.5 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Mega Malls</div>
                            <p className="line-clamp-1 text-xs leading-snug text-muted-foreground mt-1">
                              Large-scale retail destinations
                            </p>
                          </Link>
                        </li>
                        <li>
                          <Link href="/commercial/strip-malls" className="block select-none rounded-md px-3 py-2.5 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Strip Malls</div>
                            <p className="line-clamp-1 text-xs leading-snug text-muted-foreground mt-1">
                              Convenient open-air shopping centers
                            </p>
                          </Link>
                        </li>
                        <li>
                          <Link href="/commercial/drive-through" className="block select-none rounded-md px-3 py-2.5 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Drive Through</div>
                            <p className="line-clamp-1 text-xs leading-snug text-muted-foreground mt-1">
                              Quick-service commercial units
                            </p>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10">Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[280px] gap-1.5 p-3">
                    {[
                      { title: "Leasing", href: "/services/leasing", icon: Handshake },
                      { title: "Primary Property", href: "/services/primary-property", icon: Building2 },
                      { title: "Primary Resale", href: "/services/primary-resale", icon: Repeat },
                      { title: "Investment Consultation", href: "/services/investment-consultation", icon: TrendingUp },
                      { title: "Income Generating Property", href: "/services/income-generating-property", icon: Coins },
                    ].map((item) => (
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

              <NavigationMenuItem>
                <Link href="/why-places" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base text-white hover:text-accent hover:bg-white/10 transition-colors", isActive("/why-places") && "text-accent font-medium")}>
                  Why PLACES
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10">Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-1.5 p-3">
                    {[
                      { title: "Blog", href: "/resources/blog" },
                      { title: "FAQs", href: "/resources/faqs" },
                      { title: "Glossary", href: "/resources/glossary" },
                    ].map((item) => (
                      <li key={item.title}>
                        <Link href={item.href} className="block select-none rounded-md px-3 py-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/contact">
            <Button className="rounded-full px-6 font-medium bg-accent hover:bg-accent/90 text-primary hover:text-primary shadow-lg shadow-accent/20">
              Contact Us
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-primary border-b border-white/10 shadow-xl py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-5 text-white h-[calc(100vh-5rem)] overflow-y-auto pb-20">
           <Link href="/listings" className="text-lg font-medium py-2 border-b border-white/10 hover:text-accent">Listings</Link>

           <div className="py-2 border-b border-white/10">
             <div className="text-lg font-medium mb-2 text-white/80">Commercial & Admin</div>
             <div className="pl-4 flex flex-col gap-4">
               <div>
                 <div className="text-sm font-bold text-accent mb-2 uppercase tracking-wide">Commercial</div>
                 <div className="pl-2 flex flex-col gap-2 border-l border-white/10">
                    <Link href="/commercial/mega-malls" className="text-sm hover:text-accent pl-2">Mega Malls</Link>
                    <Link href="/commercial/strip-malls" className="text-sm hover:text-accent pl-2">Strip Malls</Link>
                    <Link href="/commercial/drive-through" className="text-sm hover:text-accent pl-2">Drive Through</Link>
                 </div>
               </div>
               <div>
                 <div className="text-sm font-bold text-accent mb-2 uppercase tracking-wide">Admin Offices</div>
                 <div className="pl-2 flex flex-col gap-2 border-l border-white/10">
                    <Link href="/admin-offices/business-park" className="text-sm hover:text-accent pl-2">Business Parks</Link>
                    <Link href="/admin-offices/business-building" className="text-sm hover:text-accent pl-2">Business Building</Link>
                    <Link href="/admin-offices/mixed-use" className="text-sm hover:text-accent pl-2">Mixed Use</Link>
                 </div>
               </div>
             </div>
           </div>

           <div className="py-2 border-b border-white/10">
             <div className="text-lg font-medium mb-2 text-white/80">Services</div>
             <div className="pl-4 flex flex-col gap-2">
               <Link href="/services/corporate-leasing" className="text-sm hover:text-accent">Corporate Leasing</Link>
               <Link href="/services/investment-consultation" className="text-sm hover:text-accent">Investment Consultation</Link>
               <Link href="/services/income-property" className="text-sm hover:text-accent">Income Property</Link>
               <Link href="/services/unit-resale" className="text-sm hover:text-accent">Unit Resale</Link>
             </div>
           </div>

           <Link href="/why-places" className="text-lg font-medium py-2 border-b border-white/10 hover:text-accent">Why PLACES</Link>

           <div className="py-2 border-b border-white/10">
             <div className="text-lg font-medium mb-2 text-white/80">Resources</div>
             <div className="pl-4 flex flex-col gap-2">
               <Link href="/resources/blog" className="text-sm hover:text-accent">Blog</Link>
               <Link href="/resources/faqs" className="text-sm hover:text-accent">FAQs</Link>
               <Link href="/resources/glossary" className="text-sm hover:text-accent">Glossary</Link>
             </div>
           </div>

           <Link href="/contact">
             <Button className="w-full mt-4 bg-accent text-primary hover:bg-accent/90">Contact Us</Button>
           </Link>
        </div>
      )}
    </header>
  );
}
