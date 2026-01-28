import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  ClipboardList, 
  BarChart3, 
  ShieldCheck, 
  Building2, 
  Store,
  HelpCircle,
  FileSearch,
  Users,
  Target
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CorporateLeasing() {
  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Navbar />
      
      {/* 1. Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000" 
            alt="Corporate Office" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white max-w-4xl">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Leasing Admin & Commercial <br/> Spaces with <span className="text-accent italic">Confidence</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Navigating the complexities of the commercial real estate market requires more than just a search engine. We provide the data, insights, and negotiation expertise you need to make the right decision for your business.
          </p>
          
          <Link href="/contact">
            <Button size="lg" className="bg-accent text-primary hover:bg-white hover:text-primary font-bold px-8 h-14 rounded-full text-lg shadow-lg shadow-accent/20 transition-all hover:scale-105">
              Talk to a PLACES Advisor
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Who is this for */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4 leading-tight">
                Is this service right <br/>for your business?
              </h2>
              <div className="h-1 w-20 bg-accent mb-6" />
              <p className="text-muted-foreground text-lg">
                We specialize in helping organizations that value strategic alignment over quick transactions.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
              <ul className="space-y-4">
                {[
                  "Multinational corporations expanding into Egypt",
                  "Startups establishing their first headquarters",
                  "Companies relocating for better operational efficiency",
                  "Organizations restructuring their real estate portfolio"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 min-w-5 min-h-5 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-primary font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Struggles / Risks */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-primary mb-6">The Risks of Going It Alone</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The commercial leasing market can be opaque. Without the right partner, businesses often face challenges that impact their bottom line.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Unclear pricing structures and hidden fees",
              "Misalignment between space and operational needs",
              "Overlooking critical clauses in lease agreements",
              "Selecting locations with poor future infrastructure"
            ].map((risk, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <HelpCircle className="w-6 h-6 text-red-400 shrink-0" />
                <span className="text-foreground font-medium">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core Values / Solution Process */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Advisory Process</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              How PLACES thinks and works to secure your ideal space.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
              { 
                icon: Target, 
                step: "01", 
                title: "Understanding", 
                desc: "Defining business goals, timeline, and constraints." 
              },
              { 
                icon: FileSearch, 
                step: "02", 
                title: "Market Survey", 
                desc: "Analyzing supply, demand, and positioning alternatives." 
              },
              { 
                icon: ClipboardList, 
                step: "03", 
                title: "Evaluation", 
                desc: "Assessing pricing logic, suitability, and benchmarks." 
              },
              { 
                icon: ShieldCheck, 
                step: "04", 
                title: "Due Diligence", 
                desc: " conducting commercial, operational, and risk checks." 
              },
              { 
                icon: CheckCircle2, 
                step: "05", 
                title: "Execution", 
                desc: "Leasing guidance and negotiation support." 
              }
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-4xl font-serif font-bold text-white/10 mb-4 absolute top-4 right-4">{item.step}</div>
                <item.icon className="w-8 h-8 text-accent mb-4" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Evaluate Unit CTA (Mid-page) */}
      <section className="py-20 bg-accent/10 border-y border-accent/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-3">
            Unsure about the fair market value?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Get a preliminary assessment from our experts before making any commitments.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 shadow-lg">
              Evaluate Your Unit’s Worth
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. Assets & Spaces */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Spaces We Cover</h2>
            <p className="text-muted-foreground">Comprehensive leasing solutions for all business types.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/admin-offices">
              <a className="group block p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-accent hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-primary group-hover:text-accent transition-colors">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-primary mb-2 group-hover:text-accent transition-colors">Admin Offices</h3>
                <p className="text-muted-foreground mb-6">
                  Business parks, standalone corporate towers, and mixed-use office suites.
                </p>
                <span className="text-sm font-bold uppercase tracking-wider text-primary flex items-center">
                  Explore Admin Offices <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            </Link>

            <Link href="/commercial">
              <a className="group block p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-accent hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-primary group-hover:text-accent transition-colors">
                  <Store className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-primary mb-2 group-hover:text-accent transition-colors">Commercial Areas</h3>
                <p className="text-muted-foreground mb-6">
                  Retail spaces in mega malls, strip malls, and drive-through locations.
                </p>
                <span className="text-sm font-bold uppercase tracking-wider text-primary flex items-center">
                  Explore Commercial <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Related Available Spaces */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif font-bold text-primary mb-8">Ready to browse options?</h2>
          <Link href="/listings?transactionType=Rent">
            <Button variant="outline" size="lg" className="bg-white border-primary text-primary hover:bg-primary hover:text-white px-8 rounded-full h-12">
              View Available Leasing Opportunities
            </Button>
          </Link>
        </div>
      </section>

      {/* 8. Why PLACES */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">Why PLACES?</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {[
              "Advisory-first approach, not sales-driven",
              "Deep expertise in both Admin & Commercial sectors",
              "Real-time market knowledge and data",
              "Strong relationships with Egypt's top developers",
              "Risk-aware decision making framework"
            ].map((point, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                <span className="text-lg text-foreground font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Frequently Asked Questions</h2>
          </div>
          
          <Accordion type="single" collapsible className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
            <AccordionItem value="item-1" className="px-6 border-b">
              <AccordionTrigger className="text-lg font-medium py-6 hover:text-accent text-left">
                How do you charge for your leasing services?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Our fee structure is transparent and typically performance-based or a standard market commission, discussed and agreed upon upfront. We ensure there are no hidden costs.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="px-6 border-b">
              <AccordionTrigger className="text-lg font-medium py-6 hover:text-accent text-left">
                Do you represent the tenant or the landlord?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                We primarily act as tenant representatives, ensuring your interests are protected throughout the negotiation process to secure the best possible terms for your business.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="px-6 border-b">
              <AccordionTrigger className="text-lg font-medium py-6 hover:text-accent text-left">
                Can you help with lease renewals?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Yes, we assist with lease renewals by re-evaluating market rates and negotiating updated terms to ensure your continued tenancy remains competitive.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="px-6">
              <AccordionTrigger className="text-lg font-medium py-6 hover:text-accent text-left">
                What is the typical timeline for finding an office?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                The timeline varies based on requirements, but generally ranges from 2 to 6 months from initial consultation to move-in, including search, negotiation, and fit-out periods.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Ready to find your next business home?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Let's discuss your requirements and find the perfect space for your team.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-primary hover:bg-accent hover:text-primary font-bold px-10 h-16 rounded-full text-xl shadow-xl transition-all hover:scale-105">
              Talk to a PLACES Advisor
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
