import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, TrendingUp, Handshake, Search } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/hero-main.jpg" 
            alt="Modern Office Building" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-linear-to-t from-primary via-transparent to-transparent opacity-90" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight text-[#dddee2]">
              Elevate Your <span className="text-accent italic">Business</span> Space
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
              The premier marketplace for buying, renting, and reselling administrative offices in Egypt's most prestigious locations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/listings">
                <Button size="lg" className="bg-accent text-primary hover:bg-white hover:text-primary font-bold px-8 h-14 rounded-full text-lg shadow-lg shadow-accent/20 transition-all hover:scale-105">
                  Find an Office
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-medium px-8 h-14 rounded-full text-lg backdrop-blur-sm">Explore Services</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
        </div>
      </section>
      {/* Stats / Trust Bar */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div>
              <p className="text-3xl font-serif font-bold text-primary mb-1">300+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Developers</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-primary mb-1">1000+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Listings</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-primary mb-1">10</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Key Locations</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-primary mb-1">500+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Support</p>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Services */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Comprehensive Real Estate Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We provide end-to-end solutions for all your administrative real estate needs.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                icon: Building2, 
                title: "Corporate Leasing", 
                desc: "Strategic leasing solutions tailored for multinational corporations and growing startups." 
              },
              { 
                icon: TrendingUp, 
                title: "Investment Consultation", 
                desc: "Data-driven insights to maximize returns on your commercial real estate portfolio." 
              },
              { 
                icon: Building2, 
                title: "Income Property", 
                desc: "Identify and acquire high-yield properties that generate consistent revenue streams." 
              },
              { 
                icon: Handshake, 
                title: "Unit Resale", 
                desc: "Seamless resale process connecting sellers with serious buyers in the market." 
              }
            ].map((service, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-xs border hover:shadow-lg hover:border-accent/50 transition-all duration-300 group">
                <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.desc}
                </p>
                <Link href="/services">
                  <a className="inline-flex items-center text-accent font-medium hover:text-primary transition-colors">
                    Learn more <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Locations Preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">Prime Locations</h2>
               <p className="text-muted-foreground">Discover offices in Egypt's most sought-after business districts.</p>
            </div>
            <Link href="/locations">
              <Button variant="ghost" className="hidden md:flex">View All Locations <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer">
              <img src="/src/assets/office-interior.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="East Cairo" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-3xl font-serif text-white font-bold mb-2">East Cairo</h3>
                <p className="text-gray-300 mb-4">The new heart of business with premium administrative hubs.</p>
                <span className="text-accent text-sm font-bold uppercase tracking-wider flex items-center gap-2">Explore <ArrowRight className="w-4 h-4" /></span>
              </div>
            </div>
            
             <div className="grid grid-rows-2 gap-6">
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-slate-800" /> {/* Placeholder for Sheikh Zayed */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-serif text-white font-bold">Sheikh Zayed</h3>
                  </div>
                </div>
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-slate-700" /> {/* Placeholder for New Capital */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-serif text-white font-bold">New Capital</h3>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Find answers to common questions about buying, renting, and investing in administrative offices.</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-gray-200">
              <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline">
                What types of administrative offices do you list?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                We specialize in three main types of administrative properties: Standalone Business Buildings for corporate headquarters, units within comprehensive Business Parks, and flexible offices in Mixed-Use developments that combine commercial and administrative spaces.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b border-gray-200">
              <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline">
                Which locations do you cover in Egypt?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                Our primary focus is on Egypt's key business districts, including East Cairo (New Cairo), Sheikh Zayed & West Cairo, the New Administrative Capital, and prime locations in Central Cairo. We select locations based on their infrastructure, accessibility, and investment potential.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b border-gray-200">
              <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline">
                Do you offer consultation for real estate investments?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                Yes, our Investment Consultation service is designed to help you make informed decisions. We provide market analysis, ROI projections, and portfolio strategy to ensure your real estate investments align with your financial goals.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-b border-gray-200">
              <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline">
                Can I list my property for resale on PLACES?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                Absolutely. Our Unit Resale service connects sellers with a network of serious buyers. We handle the valuation, marketing, and negotiation processes to ensure a seamless transaction for your premium office space.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-b border-gray-200">
              <AccordionTrigger className="text-lg font-medium text-primary hover:text-accent hover:no-underline">
                Who are the developers you partner with?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                We partner with Egypt's top-tier developers known for their quality and reliability, including SODIC, Emaar Misr, Al Futtaim Group, The Waterway, and other leading names in the real estate industry.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      <Footer />
    </div>
  );
}
