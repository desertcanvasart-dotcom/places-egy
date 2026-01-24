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
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2">
            <img src="/src/assets/places-logo.png" alt="PLACES" className="h-10 w-auto" />
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/listings">
                  <a className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base hover:text-accent transition-colors", isActive("/listings") && "text-accent font-medium")}>
                    Listings
                  </a>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-base hover:text-accent">Admin Offices</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 w-[400px]">
                    <li className="row-span-3">
                      <div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Workspace Hubs
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Explore our curated collection of administrative spaces.
                        </p>
                      </div>
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
                <NavigationMenuTrigger className="bg-transparent text-base hover:text-accent">Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
                <Link href="/locations">
                  <a className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base hover:text-accent transition-colors", isActive("/locations") && "text-accent font-medium")}>
                    Locations
                  </a>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/contact">
            <Button className="rounded-full px-6 font-medium bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              Contact Us
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b shadow-xl py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
           <Link href="/listings"><a className="text-lg font-medium py-2 border-b">Listings</a></Link>
           <Link href="/admin-offices"><a className="text-lg font-medium py-2 border-b">Admin Offices</a></Link>
           <Link href="/services"><a className="text-lg font-medium py-2 border-b">Services</a></Link>
           <Link href="/locations"><a className="text-lg font-medium py-2 border-b">Locations</a></Link>
           <Link href="/contact">
             <Button className="w-full mt-2">Contact Us</Button>
           </Link>
        </div>
      )}
    </header>
  );
}
