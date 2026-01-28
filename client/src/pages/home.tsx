import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, TrendingUp, Handshake, Search, ClipboardList, BarChart3, ShieldCheck, CheckCircle2, MapPin, Maximize2 } from "lucide-react";
import { LISTINGS } from "@/lib/mock-data";

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
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Businesses</p>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Services */}
      <section className="py-24 bg-secondary/30 pt-[50px] pb-[50px]">
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
      <section className="py-24 pt-[50px] pb-[50px]">
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
      {/* Developer Trust Section */}
      <section className="py-20 bg-white border-y border-gray-100 pt-[20px] pb-[20px]">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-10">Trusted Partners</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-80 hover:opacity-100 transition-opacity duration-500">
            {['SODIC', 'Emaar', 'Al Futtaim', 'The Waterway', 'Palm Hills'].map((dev) => (
              <Link key={dev} href={`/developers/${dev.toLowerCase().replace(' ', '-')}`}>
                <a className="group">
                  <span className="text-2xl md:text-3xl font-serif font-bold text-gray-400 group-hover:text-primary transition-colors">
                    {dev}
                  </span>
                </a>
              </Link>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/developers">
              <a className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group">
                View all developers <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Link>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-24 bg-primary text-white pt-[50px] pb-[50px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">More Than Just Listings</h2>
            <p className="text-white/70 text-lg">
              We go beyond the search to ensure your business finds its perfect home through a structured, professional process.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
             {[
               { icon: ClipboardList, title: "Understand", desc: "We start by deeply understanding your business needs, culture, and operational requirements." },
               { icon: BarChart3, title: "Analyze", desc: "We conduct comprehensive market surveys and due diligence to identify the best opportunities." },
               { icon: ShieldCheck, title: "Advise", desc: "Our experts provide objective, transparent recommendations to guide your decision-making." },
               { icon: CheckCircle2, title: "Execute", desc: "We manage the entire transaction process, ensuring a safe and seamless acquisition." }
             ].map((step, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors duration-300">
                   <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6 text-accent">
                      <step.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-bold mb-3 font-serif text-white">{step.title}</h3>
                   <p className="text-white/80 text-sm leading-relaxed">{step.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </section>
      {/* Listings Entry Point - Exploration */}
      <section className="py-24 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                 <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">Curated Opportunities</h2>
                 <p className="text-muted-foreground text-lg max-w-xl">Explore our handpicked selection of premium administrative spaces.</p>
              </div>
              <Link href="/listings">
                <a className="hidden md:inline-flex items-center text-primary font-medium hover:text-accent transition-colors group">
                  View all listings <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {LISTINGS.slice(0, 3).map((listing) => (
                <Link key={listing.id} href={`/listings`}> {/* In a real app, this would link to /listings/${listing.id} */}
                  <a className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={listing.image} 
                        alt={listing.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute top-4 left-4 bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {listing.transactionType}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6 pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <span className="text-white text-sm font-medium flex items-center gap-2">
                           View Details <ArrowRight className="w-4 h-4" />
                         </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-accent text-xs font-bold uppercase tracking-widest">{listing.developer}</span>
                        <span className="text-muted-foreground text-sm">{listing.officeType}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-primary mb-3 line-clamp-1 group-hover:text-accent transition-colors">{listing.title}</h3>
                      
                      <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {listing.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize2 className="w-4 h-4" />
                          {listing.area} m²
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                         <span className="text-primary font-bold text-lg">
                           {listing.transactionType === 'Rent' 
                             ? `${listing.price.toLocaleString()} EGP/mo` 
                             : `${listing.price.toLocaleString()} EGP`}
                         </span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
            
            <div className="mt-12 text-center md:hidden">
              <Link href="/listings">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                  View all listings
                </Button>
              </Link>
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
      {/* Final CTA Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">Need personalized guidance?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Our team is ready to listen to your requirements and offer tailored advice for your business needs. No pressure, just expert support.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary px-10 h-14 rounded-full text-lg font-medium transition-all duration-300">
              Talk to an Advisor
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
