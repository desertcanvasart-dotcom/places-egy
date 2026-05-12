import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, TrendingUp, Users, Award, Building2, HeartHandshake } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { aboutPageSchema, breadcrumbSchema } from "@/lib/schema";

export default function WhyPlaces() {
  const values = [
    {
      icon: ShieldCheck,
      title: "Trusted Expertise",
      desc: "Years of deep market knowledge across Egypt's most prestigious business districts.",
    },
    {
      icon: TrendingUp,
      title: "Investment Insight",
      desc: "Data-driven recommendations that help you maximize returns and minimize risk.",
    },
    {
      icon: Users,
      title: "Client-First Approach",
      desc: "We place your business needs at the core of every decision to ensure tailor-made solutions that align with your goals.",
    },
    {
      icon: Award,
      title: "Premium Network",
      desc: "Direct partnerships with top developers including SODIC, Emaar, and Al Futtaim.",
    },
    {
      icon: Building2,
      title: "Curated Portfolio",
      desc: "Hand-picked properties across the most strategic locations in Cairo and beyond.",
    },
    {
      icon: HeartHandshake,
      title: "End-to-End Support",
      desc: "From initial search to final transaction — we're with you every step of the way.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Why PLACES", url: "/why-places" },
        ])}
      />
      <SchemaMarkup schema={aboutPageSchema()} />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-secondary/30 pt-32 pb-16 overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-5">
            About PLACES
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-primary">
            Why PLACES
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Specialized real estate expertise focused entirely on Egypt's administrative office market.
          </p>
        </div>
      </section>

      {/* About paragraph */}
      <section className="bg-secondary/30 pt-6 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            At PLACES, we provide specialized real estate solutions with deep
            expertise in one focused sector: administrative office real estate,
            including sales, leasing, and consultancy services. Our team supports
            clients throughout every stage of the process — from selecting the
            ideal location, identifying the right property, and choosing the most
            suitable office space, to negotiating the best possible terms and
            reviewing contracts while providing strategic investment advisory
            services. Through our strong market knowledge and extensive industry
            relationships, we help developers, property owners, investors, and
            tenants make confident real estate decisions and secure the best
            available opportunities.
          </p>
        </div>
      </section>

      {/* Mission + Stats */}
      <section className="bg-secondary/30 pb-4">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">01 · The Mission</span>
              <span className="h-px w-8 bg-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-5">
              Making real estate effortless
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              To provide specialized real estate services focused entirely on
              administrative spaces across all sectors of the market. We offer
              full support in securing suitable office spaces through leasing or
              acquisition — whether for income-generating leased assets or
              vacant properties with investment potential. Our mission is to
              ensure efficient operations while maximizing long-term asset
              performance and value.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center pt-10 border-t border-border/40">
            <div>
              <p className="text-3xl md:text-5xl font-serif font-bold text-accent mb-1">600+</p>
              <p className="text-xs text-primary/60 uppercase tracking-widest">Happy clients</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-serif font-bold text-accent mb-1">3+</p>
              <p className="text-xs text-primary/60 uppercase tracking-widest">Years experience</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-serif font-bold text-accent mb-1">250K</p>
              <p className="text-xs text-primary/60 uppercase tracking-widest">Admin sqm leased</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-serif font-bold text-accent mb-1">100K</p>
              <p className="text-xs text-primary/60 uppercase tracking-widest">Admin sqm sold</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="pt-10 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">02 · What Sets Us Apart</span>
              <span className="h-px w-8 bg-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Six pillars, one promise
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Six pillars that shape every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="bg-background p-8 rounded-xl border border-border/60 hover:shadow-lg hover:border-accent/50 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3 text-primary">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience strip + Team */}
      <section className="bg-secondary/30 pt-4 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary/60">
              Our team brings experience from
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-y-6 mb-20">
            {[
              { src: "/images/savills logo.png", alt: "Savills" },
              { src: "/images/heroleads-logo.png", alt: "Heroleads" },
              { src: "/images/the-brokers-league.png", alt: "Brokers League" },
              { src: "/images/RocketDevs.png", alt: "RocketDevs" },
              { src: "/images/etegah-logo.png", alt: "Etegah" },
            ].map((logo) => (
              <div key={logo.alt} className="w-32 md:w-40 flex items-center justify-center">
                <img src={logo.src} alt={logo.alt} loading="lazy" decoding="async" className="h-8 md:h-10 w-auto object-contain grayscale opacity-70" />
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">03 · The Team</span>
              <span className="h-px w-8 bg-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              The people behind PLACES
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advisors and brokers with end-to-end knowledge of Egypt's
              administrative real estate market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {[
              // Founders
              { name: "Ahmed Eslam", title: "Co-Founder", image: "/images/optimized/why-places/Ahmed Eslam.JPG" },
              { name: "Mohamed Safwat", title: "Co-Founder", image: "/images/optimized/why-places/Mohamed Safwat .JPG", objectPosition: "center 25%" },
              // Senior leadership
              { name: "Omar Gamal", title: "Business Development Manager", image: "/images/optimized/why-places/Omar Gamal.JPG", objectPosition: "center 25%" },
              // Senior consultants
              { name: "Abdelrhman Younis", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Abdelrahman Younes.JPG" },
              { name: "Ahmed Ali", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Ahmed Ali.JPG" },
              { name: "Ibrahim Samir", title: "Senior Commercial Consultant", image: "/images/optimized/why-places/Ebrahim Samir .jpeg" },
              { name: "Mohamed Mohsen", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Mohamed Mohsen .JPG" },
              { name: "Mostafa Ezzat", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Mostafa Ezzat.JPG" },
              { name: "Abdallah Sleem", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Abdallah Sleem - senior corporate consultant _ 4  transactions - Celebrating exceptional performance and commitment throughout 2025..JPG" },
              { name: "Youssef Safwat", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Youssef Safwa.JPG" },
              { name: "Mohamed Eid", title: "Senior Corporate Consultant", image: "/images/optimized/why-places/Mohamed Eid.JPG" },
              // Consultants
              { name: "Ahmed Khaled", title: "Senior Sales Consultant", image: "/images/optimized/why-places/Ahmed Khaled .JPG" },
              { name: "Dalia Ramadan", title: "Real Estate & Corporate Leasing Consultant", image: "/images/optimized/why-places/Dalia Ramadan.jpeg" },
              { name: "Youssef Hosny", title: "Corporate Consultant", image: "/images/optimized/why-places/Youssef Hussni.JPG" },
              { name: "Mohamed Sami", title: "Corporate Consultant", image: "/images/optimized/why-places/Mohamed Sami.JPG" },
              { name: "Ahmed Amr", title: "Corporate Consultant", image: "/images/optimized/why-places/Ahmed Amr .JPG" },
              { name: "Anas Harirah", title: "Corporate Consultant", image: "/images/optimized/why-places/Anas Harira.JPG" },
              { name: "Abdelrhman Salah", title: "Corporate Consultant", image: "/images/optimized/why-places/Abdelrahman Salah .JPG" },
              { name: "Ahmed Medhat", title: "Corporate Consultant", image: "/images/optimized/why-places/Ahmed Medhat.JPG" },
              { name: "Zeyad Medhat", title: "Senior Sales", image: "/images/optimized/why-places/Zeyad Medhat .JPG" },
              { name: "Mohamed Khaled", title: "Real Estate Advisor", image: "/images/optimized/why-places/Mohamed Khaled.JPG" },
            ].map((member, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-primary/5 mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top"
                    style={member.objectPosition ? { objectPosition: member.objectPosition } : undefined}
                  />
                </div>
                <h3 className="text-base font-serif font-bold text-primary mb-1 leading-tight">
                  {member.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  {member.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            Want our take on your specific situation?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Book a free 15-minute consultation with a PLACES advisor and get
            clear guidance on your best options.
          </p>
          <a
            href="https://wa.me/201063618217?text=Hi%2C%20I%27d%20like%20to%20book%20a%2015-minute%20consultation%20with%20a%20PLACES%20advisor."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
          >
            Book a consultation
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
