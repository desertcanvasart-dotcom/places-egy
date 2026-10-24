import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

type PreviewListing = {
  id: number;
  warnings: string[];
  payload: { title: string; places_url: string; availability: { status: string } } & Record<string, unknown>;
};

type Preview = {
  mode: "off" | "preview" | "live";
  totals: { all: number; eligible: number; rented: number; withWarnings: number };
  listings: PreviewListing[];
};

const MODE_TEXT: Record<Preview["mode"], string> = {
  off: "Not connected yet. Nothing is being sent to Hotdesk.",
  preview: "Preview mode. Changes are logged on the server but not sent to Hotdesk.",
  live: "Live. Rent listings are being sent to Hotdesk.",
};

export function HotdeskManager() {
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const { data, isLoading, error } = useQuery<Preview>({
    queryKey: ["hotdesk-preview"],
    queryFn: () => adminFetch("/api/admin/hotdesk/preview"),
  });

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading Hotdesk preview…
      </p>
    );
  }
  if (error || !data) {
    return <p className="text-accent py-8">Couldn't load the Hotdesk preview: {(error as Error)?.message}</p>;
  }

  const rows = onlyProblems ? data.listings.filter((l) => l.warnings.length > 0) : data.listings;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/40 bg-white p-4 space-y-3">
        <p className="text-sm text-primary">
          Every listing with transaction type <strong>Rent</strong> (except test listings) goes to Hotdesk automatically.
          Sale and Income Property listings never do.
        </p>
        <p className="text-xs text-muted-foreground">{MODE_TEXT[data.mode]}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Pill>{data.totals.eligible} going to Hotdesk</Pill>
          <Pill>{data.totals.rented} marked rented</Pill>
          <button
            type="button"
            onClick={() => setOnlyProblems((v) => !v)}
            aria-pressed={onlyProblems}
            className={`rounded-full border px-3 py-1 font-medium transition-colors ${
              onlyProblems ? "bg-amber-500 border-amber-500 text-white" : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
            }`}
          >
            {data.totals.withWarnings} with missing details
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-primary/5 text-left">
                <th className="px-3 py-3 font-medium text-primary w-12">ID</th>
                <th className="px-4 py-3 font-medium text-primary">Title</th>
                <th className="px-4 py-3 font-medium text-primary">Status</th>
                <th className="px-4 py-3 font-medium text-primary">Missing</th>
                <th className="px-4 py-3 font-medium text-primary text-right">Data sent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <Fragment key={l.id}>
                  <tr className="border-b border-border/20">
                    <td className="px-3 py-3 text-[11px] font-mono text-muted-foreground tabular-nums">{l.id}</td>
                    <td className="px-4 py-3 text-primary max-w-[320px] truncate">
                      <a href={l.payload.places_url} target="_blank" rel="noreferrer" className="hover:underline">
                        {l.payload.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{l.payload.availability.status}</td>
                    <td className="px-4 py-3">
                      {l.warnings.length === 0 ? (
                        <span className="text-emerald-700">Complete</span>
                      ) : (
                        <span className="text-amber-700">{l.warnings.join(", ")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setOpen(open === l.id ? null : l.id)}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        {open === l.id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                  {open === l.id && (
                    <tr className="border-b border-border/20 bg-primary/[0.02]">
                      <td colSpan={5} className="px-4 py-3">
                        <pre className="text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(l.payload, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/5 border border-border/40 px-3 py-1 font-medium text-primary">{children}</span>
  );
}
