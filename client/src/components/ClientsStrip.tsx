// "Companies We've Placed" — the client-logo grid on /why-places. Fetches
// logos from the Supabase-backed /api/client-logos endpoint so PLACES can
// add/remove companies via the admin dashboard (see ClientLogosManager) without
// a code deploy.
//
// The initial 98 logos were seeded into the database from the previous
// hardcoded ClientsStrip array (client/public/images/clients/*.png), so
// logo_url on those rows is a site-relative path like /images/clients/xyz.png.
// New logos added via the admin dashboard are uploaded to Supabase Storage
// and stored as full https:// URLs. Both formats render identically.

import { useQuery } from "@tanstack/react-query";
import { type ClientLogo } from "@/lib/client-logos";

async function fetchClientLogos(): Promise<ClientLogo[]> {
  const res = await fetch("/api/client-logos");
  if (!res.ok) return [];
  return res.json();
}

export function ClientsStrip() {
  const { data: clients = [] } = useQuery<ClientLogo[]>({
    queryKey: ["client-logos"],
    queryFn: fetchClientLogos,
    staleTime: 5 * 60 * 1000,
  });

  if (clients.length === 0) return null;

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
          {clients.map((client) => (
            <div
              key={client.id}
              className="group flex items-center justify-center"
            >
              <img
                src={client.logo_url}
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
