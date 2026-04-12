import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, TrendingUp, Users, Award, Building2, HeartHandshake } from "lucide-react";

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
      desc: "Every recommendation starts with understanding your unique business needs.",
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
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-white py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white">
            Why PLACES
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            We're more than a marketplace. We're your partner in finding the perfect
            workspace for your business to thrive in Egypt's most sought-after locations.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To redefine how businesses find, lease, and invest in administrative real estate
              across Egypt — making the process transparent, professional, and effortless.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              What Sets Us Apart
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Six pillars that define how we serve our clients and shape every decision we make.
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

      {/* Stats */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-serif font-bold text-accent mb-2">300+</p>
              <p className="text-white/70 text-sm uppercase tracking-wider">Properties Listed</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-serif font-bold text-accent mb-2">1000+</p>
              <p className="text-white/70 text-sm uppercase tracking-wider">Happy Clients</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-serif font-bold text-accent mb-2">10</p>
              <p className="text-white/70 text-sm uppercase tracking-wider">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-serif font-bold text-accent mb-2">500+</p>
              <p className="text-white/70 text-sm uppercase tracking-wider">Successful Deals</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
