import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <img src="/src/assets/places-logo.png" alt="PLACES" className="h-12 w-auto brightness-0 invert" />
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              Egypt's premier marketplace for administrative offices. Buying, renting, and resale made professional and seamless.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-accent transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-accent transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-accent transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-accent transition-colors" aria-label="TikTok">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-accent">Home</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/why-places" className="hover:text-white transition-colors">Why Places</Link></li>
              <li><Link href="/listings" className="hover:text-white transition-colors">Search Listings</Link></li>
              <li><Link href="/locations" className="hover:text-white transition-colors">Locations</Link></li>
              <li><Link href="/developers" className="hover:text-white transition-colors">Developers</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-accent">Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/services/leasing" className="hover:text-white transition-colors">Leasing</Link></li>
              <li><Link href="/services/primary-property" className="hover:text-white transition-colors">Primary Property</Link></li>
              <li><Link href="/services/primary-resale" className="hover:text-white transition-colors">Primary Resale</Link></li>
              <li><Link href="/services/investment-consultation" className="hover:text-white transition-colors">Investment Consultation</Link></li>
              <li><Link href="/services/income-generating-property" className="hover:text-white transition-colors">Income Generating Property</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-accent">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0" />
                <span>Tolip Hotel, New Cairo</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>01063618217</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span>info@places-egy.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} PLACES. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
