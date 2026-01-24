import { Link, useLocation } from "wouter";
import { Search, Menu, X, Phone } from "lucide-react";
import { useState } from "react";
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
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/95 text-white">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2">
            <img src="/src/assets/places-logo.png" alt="PLACES" className="h-10 w-auto brightness-0 invert" />
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/listings">
                  <a className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base text-white hover:text-accent hover:bg-white/10 transition-colors", isActive("/listings") && "text-accent font-medium")}>
                    Listings
                  </a>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10">Admin Offices</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 w-[400px]">
                    <li>
                      <Link href="/admin-offices/business-building">
                        <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Business Building</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Standalone corporate towers
                          </p>
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin-offices/business-park">
                        <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Business Parks</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Integrated corporate communities
                          </p>
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin-offices/mixed-use">
                        <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Mixed Use</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Retail and office combinations
                          </p>
                        </a>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10">Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-3 p-4">
                    {[
                      { title: "Corporate Leasing", href: "/services/corporate-leasing" },
                      { title: "Investment Consultation", href: "/services/investment-consultation" },
                      { title: "Income Property", href: "/services/income-property" },
                      { title: "Unit Resale", href: "/services/unit-resale" },
                    ].map((item) => (
                      <li key={item.title}>
                        <Link href={item.href}>
                           <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                           </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10">Developers</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-3 p-4">
                    {[
                      { title: "SODIC", href: "/developers/sodic" },
                      { title: "Emaar", href: "/developers/emaar" },
                      { title: "Al Futtaim", href: "/developers/al-futtaim" },
                      { title: "The Waterway", href: "/developers/waterway" },
                    ].map((item) => (
                      <li key={item.title}>
                        <Link href={item.href}>
                           <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                           </a>
                        </Link>
                      </li>
                    ))}
                    <li className="col-span-2 mt-2 border-t pt-2">
                       <Link href="/developers">
                        <a className="flex items-center justify-center text-sm font-medium text-accent hover:text-primary transition-colors">
                           View All Developers &rarr;
                        </a>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base text-white hover:text-accent hover:bg-white/10">Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-3 p-4">
                    {[
                      { title: "Blog", href: "/resources/blog" },
                      { title: "FAQs", href: "/resources/faqs" },
                      { title: "Glossary", href: "/resources/glossary" },
                    ].map((item) => (
                      <li key={item.title}>
                        <Link href={item.href}>
                           <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                           </a>
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
           <Link href="/listings"><a className="text-lg font-medium py-2 border-b border-white/10 hover:text-accent">Listings</a></Link>
           
           <div className="py-2 border-b border-white/10">
             <div className="text-lg font-medium mb-2 text-white/80">Admin Offices</div>
             <div className="pl-4 flex flex-col gap-2">
               <Link href="/admin-offices/business-building"><a className="text-sm hover:text-accent">Business Building</a></Link>
               <Link href="/admin-offices/business-park"><a className="text-sm hover:text-accent">Business Parks</a></Link>
               <Link href="/admin-offices/mixed-use"><a className="text-sm hover:text-accent">Mixed Use</a></Link>
               <Link href="/admin-offices"><a className="text-sm font-medium text-accent mt-1">View All &rarr;</a></Link>
             </div>
           </div>

           <div className="py-2 border-b border-white/10">
             <div className="text-lg font-medium mb-2 text-white/80">Services</div>
             <div className="pl-4 flex flex-col gap-2">
               <Link href="/services/corporate-leasing"><a className="text-sm hover:text-accent">Corporate Leasing</a></Link>
               <Link href="/services/investment-consultation"><a className="text-sm hover:text-accent">Investment Consultation</a></Link>
               <Link href="/services/income-property"><a className="text-sm hover:text-accent">Income Property</a></Link>
               <Link href="/services/unit-resale"><a className="text-sm hover:text-accent">Unit Resale</a></Link>
             </div>
           </div>

           <div className="py-2 border-b border-white/10">
             <div className="text-lg font-medium mb-2 text-white/80">Developers</div>
             <div className="pl-4 flex flex-col gap-2">
               <Link href="/developers/sodic"><a className="text-sm hover:text-accent">SODIC</a></Link>
               <Link href="/developers/emaar"><a className="text-sm hover:text-accent">Emaar</a></Link>
               <Link href="/developers/al-futtaim"><a className="text-sm hover:text-accent">Al Futtaim</a></Link>
               <Link href="/developers/waterway"><a className="text-sm hover:text-accent">The Waterway</a></Link>
               <Link href="/developers"><a className="text-sm font-medium text-accent mt-1">View All &rarr;</a></Link>
             </div>
           </div>

           <div className="py-2 border-b border-white/10">
             <div className="text-lg font-medium mb-2 text-white/80">Resources</div>
             <div className="pl-4 flex flex-col gap-2">
               <Link href="/resources/blog"><a className="text-sm hover:text-accent">Blog</a></Link>
               <Link href="/resources/faqs"><a className="text-sm hover:text-accent">FAQs</a></Link>
               <Link href="/resources/glossary"><a className="text-sm hover:text-accent">Glossary</a></Link>
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
