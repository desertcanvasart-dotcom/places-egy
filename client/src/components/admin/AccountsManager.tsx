import { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Mail, Phone, MessageCircle, Loader2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import type { Listing } from "@/lib/supabase";
import { listingUrl } from "@/lib/listings";

// Admin dashboard "Accounts" tab. Shows every signed-up user in a table
// (newest first). Click a row to expand and see every listing they've
// favorited plus a one-click WhatsApp button that pre-fills a message with
// their favorites list.

const PLACES_WHATSAPP = "201063618217";

type AccountRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  last_active_at: string | null;
  favorite_count: number;
};

type AccountDetail = {
  account: AccountRow;
  favorites: Listing[];
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

function formatPrice(l: Pick<Listing, "price" | "currency">): string {
  if (!l.price) return "Price on request";
  const currency = l.currency === "USD" ? "USD" : "EGP";
  const formatted = new Intl.NumberFormat("en-US").format(l.price);
  return `${formatted} ${currency}`;
}

// Build a wa.me URL pre-filled with a summary of this user's favorites.
// This is the WhatsApp Business channel PLACES will use to nurture leads:
// click, opens WhatsApp, sends them a personalized list with links they can
// tap to see each listing.
function buildWhatsAppUrl(account: AccountRow, favorites: Listing[]): string {
  // Strip any leading +/0 and non-digits from the account's phone so it's
  // wa.me-safe. If the number has no country code we assume Egypt (+20).
  const digits = account.phone.replace(/\D/g, "");
  const phone = digits.startsWith("20")
    ? digits
    : digits.startsWith("0")
      ? "20" + digits.slice(1)
      : "20" + digits;

  const firstName = account.name.trim().split(/\s+/)[0] ?? "there";
  const lines = [
    `Hi ${firstName}, thanks for using PLACES!`,
    "",
    `Here's a quick recap of the ${favorites.length} listing${favorites.length === 1 ? "" : "s"} you saved:`,
    "",
    ...favorites.map((l, i) => {
      return `${i + 1}. ${l.title}\n   ${formatPrice(l)}\n   https://places-egy.com${listingUrl(l)}`;
    }),
    "",
    "Any questions or want to book a viewing? Just reply here.",
  ];
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function AccountsManager() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: accounts = [], isLoading } = useQuery<AccountRow[]>({
    queryKey: ["admin-accounts"],
    queryFn: () => adminFetch("/api/admin/accounts"),
  });

  const { data: detail } = useQuery<AccountDetail>({
    queryKey: ["admin-accounts", expandedId],
    queryFn: () => adminFetch(`/api/admin/accounts/${expandedId}`),
    enabled: expandedId != null,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/api/admin/accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      setExpandedId(null);
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `Delete account for "${name}" (and all their favorites)? This can't be undone.`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">
          Every user who signed up through the site's favorites gate. Click a
          row to see their saved listings + send them a WhatsApp message with
          the list pre-filled.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8 md:py-12">
          Loading accounts…
        </p>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-border/40">
          <p className="text-muted-foreground mb-1">No accounts yet.</p>
          <p className="text-xs text-muted-foreground">
            Users will appear here after they hit the favorites cap and sign up
            to save more listings.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-primary/5">
                  <th className="text-left px-4 py-3 font-medium text-primary">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Contact</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">Favorites</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Last active</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <Fragment key={account.id}>
                    <tr
                      className="border-b border-border/20 hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() =>
                        setExpandedId(expandedId === account.id ? null : account.id)
                      }
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(account.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-primary">
                        {account.name}
                      </td>
                      <td className="px-4 py-3 text-primary/80">
                        <div className="flex items-center gap-3 text-xs">
                          <a
                            href={`mailto:${account.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 hover:text-accent"
                          >
                            <Mail className="w-3 h-3" /> {account.email}
                          </a>
                          <a
                            href={`tel:${account.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 hover:text-accent"
                          >
                            <Phone className="w-3 h-3" /> {account.phone}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-accent">
                          {account.favorite_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(account.last_active_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(account.id, account.name);
                          }}
                          className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors ml-auto"
                          aria-label="Delete account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                    {expandedId === account.id && (
                      <tr className="border-b border-border/20 bg-primary/[0.02]">
                        <td colSpan={6} className="px-6 py-4">
                          {!detail || detail.account.id !== account.id ? (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Loading favorites…
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* WhatsApp button */}
                              {detail.favorites.length > 0 && (
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 bg-white rounded-lg border border-border/40">
                                  <div>
                                    <p className="text-sm font-semibold text-primary mb-0.5">
                                      Send them their list on WhatsApp
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Opens WhatsApp with a personalized
                                      message including all {detail.favorites.length}{" "}
                                      of their saved listings.
                                    </p>
                                  </div>
                                  <a
                                    href={buildWhatsAppUrl(
                                      detail.account,
                                      detail.favorites,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-medium px-4 py-2 rounded-full text-xs shrink-0"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    Send on WhatsApp
                                  </a>
                                </div>
                              )}

                              {/* Favorites list */}
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                  Saved listings ({detail.favorites.length})
                                </p>
                                {detail.favorites.length === 0 ? (
                                  <p className="text-xs text-muted-foreground italic">
                                    No favorites yet.
                                  </p>
                                ) : (
                                  <ul className="space-y-1.5">
                                    {detail.favorites.map((l) => (
                                      <li
                                        key={l.id}
                                        className="text-xs bg-white p-3 rounded-md border border-border/40 flex items-start justify-between gap-3"
                                      >
                                        <div className="min-w-0">
                                          <a
                                            href={listingUrl(l)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-primary hover:text-accent transition-colors truncate block"
                                          >
                                            {l.title}
                                          </a>
                                          <p className="text-muted-foreground mt-0.5">
                                            {formatPrice(l)}
                                          </p>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          )}
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
