import { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Mail, Phone, CalendarDays, MapPin, Loader2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

// Calendly bookings synced via webhook. Read-only mostly — team can delete
// spam / test entries. Bookings themselves are managed on Calendly (reschedule,
// cancel); this table is for attribution + reporting.

type Booking = {
  id: number;
  created_at: string;
  calendly_uri: string;
  event_type: string | null;
  invitee_name: string | null;
  invitee_email: string | null;
  invitee_phone: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string;
  cancellation_reason: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusStyle(status: string): string {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "canceled":
      return "bg-neutral-200 text-neutral-600";
    default:
      return "bg-primary/10 text-primary";
  }
}

export function BookingsManager() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["admin-bookings"],
    queryFn: () => adminFetch("/api/admin/bookings"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/api/admin/bookings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setExpandedId(null);
    },
  });

  const handleDelete = (id: number, name: string | null) => {
    if (
      window.confirm(
        `Delete booking record for "${name ?? "(no name)"}"? This won't cancel the meeting in Calendly — you'd need to do that in Calendly itself.`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">
          Every meeting booked through the website via Calendly. UTM columns
          show which page/CTA drove each booking so the team can attribute
          revenue to specific placements.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8 md:py-12">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
          Loading bookings…
        </p>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-border/40">
          <CalendarDays className="w-8 h-8 text-primary/20 mx-auto mb-2" />
          <p className="text-muted-foreground mb-1">No bookings yet.</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            When someone books a meeting on the site via Calendly, it appears
            here automatically with the exact page + CTA that drove the booking.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-primary/5">
                  <th className="text-left px-4 py-3 font-medium text-primary">When</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Attendee</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Event</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <Fragment key={booking.id}>
                    <tr
                      className="border-b border-border/20 hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() =>
                        setExpandedId(expandedId === booking.id ? null : booking.id)
                      }
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(booking.start_time)}
                      </td>
                      <td className="px-4 py-3 font-medium text-primary">
                        <div>{booking.invitee_name ?? "—"}</div>
                        <div className="text-xs font-normal text-muted-foreground mt-0.5 flex items-center gap-3">
                          {booking.invitee_email && (
                            <a
                              href={`mailto:${booking.invitee_email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 hover:text-accent"
                            >
                              <Mail className="w-3 h-3" /> {booking.invitee_email}
                            </a>
                          )}
                          {booking.invitee_phone && (
                            <a
                              href={`tel:${booking.invitee_phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 hover:text-accent"
                            >
                              <Phone className="w-3 h-3" /> {booking.invitee_phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-primary/80 text-xs">
                        {booking.event_type ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {booking.utm_campaign ? (
                          <>
                            <div className="text-primary/80">{booking.utm_campaign}</div>
                            {booking.utm_content && (
                              <div className="text-muted-foreground">
                                {booking.utm_content}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground italic">direct</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(booking.id, booking.invitee_name);
                          }}
                          className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors ml-auto"
                          aria-label="Delete booking record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                    {expandedId === booking.id && (
                      <tr className="border-b border-border/20 bg-primary/[0.02]">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            {booking.start_time && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  Start
                                </p>
                                <p className="text-primary">{formatDate(booking.start_time)}</p>
                              </div>
                            )}
                            {booking.end_time && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  End
                                </p>
                                <p className="text-primary">{formatDate(booking.end_time)}</p>
                              </div>
                            )}
                            {booking.location && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  Location
                                </p>
                                <p className="text-primary inline-flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {booking.location}
                                </p>
                              </div>
                            )}
                            {booking.utm_source && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  UTM Source
                                </p>
                                <p className="text-primary">{booking.utm_source}</p>
                              </div>
                            )}
                            {booking.utm_medium && (
                              <div>
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  UTM Medium
                                </p>
                                <p className="text-primary">{booking.utm_medium}</p>
                              </div>
                            )}
                            {booking.cancellation_reason && (
                              <div className="col-span-2">
                                <p className="font-bold uppercase text-muted-foreground mb-0.5">
                                  Cancel reason
                                </p>
                                <p className="text-primary">{booking.cancellation_reason}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
