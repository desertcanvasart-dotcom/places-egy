import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Mail, Phone, ExternalLink } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { type Lead, type LeadStatus } from "@/lib/leads";

// Leads dashboard tab. Read-mostly view of every submission from the site's
// LeadForm. Team uses this to work the queue: view details, mark contacted,
// add notes, delete spam.

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-accent/10 text-accent",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-purple-100 text-purple-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-neutral-200 text-neutral-600",
};

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadsManager() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["admin-leads"],
    queryFn: () => adminFetch("/api/admin/leads"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<Lead> }) => {
      return adminFetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/api/admin/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Delete lead from "${name}"? This can't be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">
          Every form submission from the website. Click a row to expand for the
          full message, source, and notes.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8 md:py-12">
          Loading leads…
        </p>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-border/40">
          <p className="text-muted-foreground mb-1">No leads yet.</p>
          <p className="text-xs text-muted-foreground">
            Submissions will show up here as soon as visitors fill any of the
            site's forms.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-primary/5">
                  <th className="text-left px-4 py-3 font-medium text-primary">When</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <>
                    <tr
                      key={lead.id}
                      className="border-b border-border/20 hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() =>
                        setExpanded(expanded === lead.id ? null : lead.id)
                      }
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-primary">
                        {lead.name}
                      </td>
                      <td className="px-4 py-3 text-primary/80">
                        <div className="flex items-center gap-3 text-xs">
                          <a
                            href={`mailto:${lead.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 hover:text-accent"
                          >
                            <Mail className="w-3 h-3" /> {lead.email}
                          </a>
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 hover:text-accent"
                            >
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-primary/80">{lead.lead_source}</div>
                        {lead.magnet && (
                          <div className="text-muted-foreground">
                            magnet: {lead.magnet}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateMutation.mutate({
                              id: lead.id,
                              patch: { status: e.target.value as LeadStatus },
                            })
                          }
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_STYLES[lead.status]}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(lead.id, lead.name);
                          }}
                          className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors ml-auto"
                          aria-label="Delete lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                    {expanded === lead.id && (
                      <tr className="border-b border-border/20 bg-primary/[0.02]">
                        <td colSpan={6} className="px-6 py-4 space-y-3">
                          {lead.message && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                Projects they are interested in
                              </p>
                              <p className="text-sm text-primary whitespace-pre-wrap bg-white p-3 rounded-md border border-border/40">
                                {lead.message}
                              </p>
                            </div>
                          )}
                          {lead.locations && lead.locations.length > 0 && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                Locations of interest
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {lead.locations.map((loc) => (
                                  <span
                                    key={loc}
                                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                                  >
                                    {loc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            {lead.page_url && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  Landing page
                                </p>
                                <a
                                  href={lead.page_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline inline-flex items-center gap-1"
                                >
                                  {lead.page_url} <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                            {lead.listing_id && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  Listing #
                                </p>
                                <p className="text-primary">{lead.listing_id}</p>
                              </div>
                            )}
                            {lead.utm_source && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  UTM Source
                                </p>
                                <p className="text-primary">{lead.utm_source}</p>
                              </div>
                            )}
                            {lead.utm_campaign && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  UTM Campaign
                                </p>
                                <p className="text-primary">{lead.utm_campaign}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                              Internal notes
                            </p>
                            <Textarea
                              defaultValue={lead.notes ?? ""}
                              onBlur={(e) => {
                                const next = e.target.value.trim() || null;
                                if (next !== lead.notes) {
                                  updateMutation.mutate({
                                    id: lead.id,
                                    patch: { notes: next },
                                  });
                                }
                              }}
                              placeholder="Add follow-up notes here (auto-saves when you click away)…"
                              rows={2}
                              className="bg-white text-sm resize-none"
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
