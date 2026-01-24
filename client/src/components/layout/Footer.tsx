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
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-accent">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/"><a className="hover:text-white transition-colors">Home</a></Link></li>
              <li><Link href="/listings"><a className="hover:text-white transition-colors">Search Listings</a></Link></li>
              <li><Link href="/admin-offices"><a className="hover:text-white transition-colors">Admin Offices</a></Link></li>
              <li><Link href="/developers"><a className="hover:text-white transition-colors">Developers</a></Link></li>
              <li><Link href="/about"><a className="hover:text-white transition-colors">About Us</a></Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-accent">Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/services/corporate-leasing"><a className="hover:text-white transition-colors">Corporate Leasing</a></Link></li>
              <li><Link href="/services/investment-consultation"><a className="hover:text-white transition-colors">Investment Consultation</a></Link></li>
              <li><Link href="/services/unit-resale"><a className="hover:text-white transition-colors">Unit Resale</a></Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-accent">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0" />
                <span>Business District, Building 45<br/>New Cairo, Egypt</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span>contact@places.com.eg</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} PLACES. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
