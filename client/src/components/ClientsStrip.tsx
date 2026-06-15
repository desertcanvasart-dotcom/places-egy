// "Companies We've Placed" — a static grid of client logos (companies PLACES
// has closed office deals for). Unlike DeveloperStrip (an animated marquee of
// partner developers), this is a calm, evenly-sized grid: one title + rows of
// clear, uniformly-scaled logos, grayscale by default and full-color on hover.
//
// To add logos: drop the PNG/SVG files into client/public/images/clients/ and
// add an entry below. Keep `name` accurate for alt text / accessibility.
// Logos render at a fixed cell size so a tall or wide logo never dominates the
// grid — object-contain scales each one to fit consistently.

const CLIENTS: { name: string; logo: string }[] = [
  { name: "Abdo Elamer", logo: "/images/clients/abdo-elamer.png" },
  { name: "Access", logo: "/images/clients/access.png" },
  { name: "ACWA Power", logo: "/images/clients/acwa-power.png" },
  { name: "ADI", logo: "/images/clients/adi.png" },
  { name: "Al Mirage Developments", logo: "/images/clients/al-mirage-developments.png" },
  { name: "Aligore Myth", logo: "/images/clients/aligore-myth.png" },
  { name: "Almansoori", logo: "/images/clients/almansoori.png" },
  { name: "Alpha Premium", logo: "/images/clients/alpha-premium.png" },
  { name: "Alpha", logo: "/images/clients/alpha.png" },
  { name: "Arabtech", logo: "/images/clients/arabtech.png" },
  { name: "Astellas", logo: "/images/clients/astellas.png" },
  { name: "Astra", logo: "/images/clients/astra.png" },
  { name: "AXA", logo: "/images/clients/axa.png" },
  { name: "Azentio", logo: "/images/clients/azentio.png" },
  { name: "Beltone", logo: "/images/clients/beltone.png" },
  { name: "Benya", logo: "/images/clients/benya.png" },
  { name: "BNG", logo: "/images/clients/bng.png" },
  { name: "Bold Routes", logo: "/images/clients/bold-routes.png" },
  { name: "Bosch", logo: "/images/clients/bosch.png" },
  { name: "BTC", logo: "/images/clients/btc.png" },
  { name: "Bupa", logo: "/images/clients/bupa.png" },
  { name: "Business Square", logo: "/images/clients/business-square.png" },
  { name: "Cairo Heights 2", logo: "/images/clients/cairo-heights-2.png" },
  { name: "Cairo Heights", logo: "/images/clients/cairo-heights.png" },
  { name: "Chain Reaction 2", logo: "/images/clients/chain-reaction-2.png" },
  { name: "Chain Reaction", logo: "/images/clients/chain-reaction.png" },
  { name: "China State Construction", logo: "/images/clients/china-state-construction.png" },
  { name: "CO55", logo: "/images/clients/co55.png" },
  { name: "Coldwell Banker", logo: "/images/clients/coldwell-banker.png" },
  { name: "Crédit Agricole", logo: "/images/clients/credit-agricole.png" },
  { name: "Digi Vision", logo: "/images/clients/digi-vision.png" },
  { name: "E Spaces", logo: "/images/clients/e-spaces.png" },
  { name: "Ebdaa Goldmines", logo: "/images/clients/ebdaa-goldmines.png" },
  { name: "ECC", logo: "/images/clients/ecc.png" },
  { name: "Ecvalla", logo: "/images/clients/ecvalla.png" },
  { name: "Eg Bro Real Estate", logo: "/images/clients/eg-bro-real-estate.png" },
  { name: "EGE", logo: "/images/clients/ege.png" },
  { name: "El Ahly Sabbour", logo: "/images/clients/el-ahly-sabbour.png" },
  { name: "El Majd Contracting", logo: "/images/clients/el-majd-contracting.png" },
  { name: "Five Palm Development", logo: "/images/clients/five-palm-development.png" },
  { name: "Four Season Group", logo: "/images/clients/four-season-group.png" },
  { name: "Hbcs Health", logo: "/images/clients/hbcs-health.png" },
  { name: "Hegaz Development", logo: "/images/clients/hegaz-development.png" },
  { name: "Henkel", logo: "/images/clients/henkel.png" },
  { name: "Hermann", logo: "/images/clients/hermann.png" },
  { name: "Hfc Real Estates", logo: "/images/clients/hfc-real-estates.png" },
  { name: "HRE", logo: "/images/clients/hre.png" },
  { name: "Imperium", logo: "/images/clients/imperium.png" },
  { name: "Informa", logo: "/images/clients/informa.png" },
  { name: "Intelcia", logo: "/images/clients/intelcia.png" },
  { name: "IWG", logo: "/images/clients/iwg.png" },
  { name: "JT+P", logo: "/images/clients/jtp.png" },
  { name: "K Developments", logo: "/images/clients/k-developments.png" },
  { name: "Ke Architects", logo: "/images/clients/ke-architects.png" },
  { name: "Knauf", logo: "/images/clients/knauf.png" },
  { name: "Konecta", logo: "/images/clients/konecta.png" },
  { name: "Landers", logo: "/images/clients/landers.webp" },
  { name: "Limbic", logo: "/images/clients/limbic.svg" },
  { name: "Lynker Analytics", logo: "/images/clients/lynker-analytics.png" },
  { name: "Ma Alam", logo: "/images/clients/ma-alam.png" },
  { name: "Mac Construction", logo: "/images/clients/mac-construction.png" },
  { name: "Majid El Futtaim", logo: "/images/clients/majid-el-futtaim.png" },
  { name: "Marasina", logo: "/images/clients/marasina.png" },
  { name: "Modad", logo: "/images/clients/modad.png" },
  { name: "Moorgen", logo: "/images/clients/moorgen.png" },
  { name: "Naia Developments", logo: "/images/clients/naia-developments.png" },
  { name: "Network", logo: "/images/clients/network.png" },
  { name: "NextCare", logo: "/images/clients/nextcare.png" },
  { name: "OPPO", logo: "/images/clients/oppo.png" },
  { name: "Oro", logo: "/images/clients/oro.png" },
  { name: "OUD", logo: "/images/clients/oud.png" },
  { name: "Oxygen", logo: "/images/clients/oxygen.png" },
  { name: "Pharmaaccess", logo: "/images/clients/pharmaaccess.png" },
  { name: "PowerChina", logo: "/images/clients/powerchina.png" },
  { name: "Procore", logo: "/images/clients/procore.png" },
  { name: "Qawafel", logo: "/images/clients/qawafel.png" },
  { name: "Red Facility Solutions", logo: "/images/clients/red-facility-solutions.png" },
  { name: "Red Sea", logo: "/images/clients/red-sea.png" },
  { name: "Royal", logo: "/images/clients/royal.png" },
  { name: "RSA", logo: "/images/clients/rsa-2.png" },
  { name: "RSA", logo: "/images/clients/rsa.png" },
  { name: "Saya", logo: "/images/clients/saya.png" },
  { name: "SCAD", logo: "/images/clients/scad.png" },
  { name: "Somewhere Real Estate", logo: "/images/clients/somewhere-real-estate.png" },
  { name: "Starlink", logo: "/images/clients/starlink.png" },
  { name: "Strategic Gears", logo: "/images/clients/strategic-gears.png" },
  { name: "Summit", logo: "/images/clients/summit.png" },
  { name: "talabat", logo: "/images/clients/talabat.png" },
  { name: "Talento", logo: "/images/clients/talento.png" },
  { name: "Tcc Engineering", logo: "/images/clients/tcc-engineering.png" },
  { name: "The Nest", logo: "/images/clients/the-nest.png" },
  { name: "Titan", logo: "/images/clients/titan.png" },
  { name: "TMF Group", logo: "/images/clients/tmf-group.png" },
  { name: "Ufar", logo: "/images/clients/ufar.png" },
  { name: "Unimar", logo: "/images/clients/unimar.png" },
  { name: "Voltalia", logo: "/images/clients/voltalia.png" },
  { name: "Wealth Dev", logo: "/images/clients/wealth-dev.png" },
  { name: "Worood", logo: "/images/clients/worood.png" },
];

export function ClientsStrip() {
  if (CLIENTS.length === 0) return null;

  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-4 md:px-10 max-w-7xl">
        <div className="text-center mb-10 md:mb-12">
          <span className="text-sm font-bold uppercase tracking-widest text-accent">
            Our Customers
          </span>
        </div>

        {/* Every logo file is pre-normalized to a uniform 5:2 transparent canvas
            with centered padding, so a square logo and a wide wordmark share the
            same footprint and render at balanced optical sizes. The cell just
            needs to size them consistently — no per-logo overrides. */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-4 items-center">
          {CLIENTS.map((client) => (
            <div
              key={client.name}
              className="group flex items-center justify-center"
            >
              <img
                src={client.logo}
                alt={`${client.name} logo`}
                loading="eager"
                decoding="async"
                className="w-full h-auto object-contain grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
