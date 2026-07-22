import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Loader2, Check, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { type Popup } from "@/lib/popups";

// CRUD for the "Done Deal" homepage popup. Mirrors DealsManager /
// ClientLogosManager exactly. Only one popup is active at a time; the public
// GET /api/popup returns whichever active row sorts first (sort_order asc then
// created_at desc).
//
// content_hash is server-computed on save (see server/popup-schema.ts) — the
// admin form doesn't send it. Editing any content field on the admin side
// changes the hash so previously-dismissed devices see the new popup once.

type PopupForm = Omit<Popup, "id" | "created_at" | "content_hash"> & {
  id?: number;
};

const EMPTY_POPUP: PopupForm = {
  headline_top: "DONE",
  headline_bottom: "DEAL",
  body_paragraph: "",
  project_logo_url: "",
  stat_label: "Successfully Sold",
  stat_value: "",
  stat_unit: "SQM",
  footer_caption: "",
  is_active: true,
  sort_order: 0,
};

function PopupField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-primary">{label}</Label>
      {children}
    </div>
  );
}

function PopupDialog({
  open,
  onClose,
  popup,
}: {
  open: boolean;
  onClose: () => void;
  popup: PopupForm | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PopupForm>(EMPTY_POPUP);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(popup ?? EMPTY_POPUP);
  }, [popup, open]);

  const set = <K extends keyof PopupForm>(field: K, value: PopupForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: async (data: PopupForm) => {
      // Whitelist columns — server .strict() zod schema rejects unknown keys.
      const payload = {
        headline_top: data.headline_top,
        headline_bottom: data.headline_bottom,
        body_paragraph: data.body_paragraph,
        project_logo_url: data.project_logo_url || null,
        stat_label: data.stat_label || null,
        stat_value: data.stat_value || null,
        stat_unit: data.stat_unit || null,
        footer_caption: data.footer_caption || null,
        is_active: data.is_active,
        sort_order: data.sort_order ?? 0,
      };
      if (data.id) {
        await adminFetch(`/api/admin/popups/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch(`/api/admin/popups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-popups"] });
      queryClient.invalidateQueries({ queryKey: ["popup"] });
      onClose();
    },
    onError: (e: Error) => {
      console.error("Save popup failed:", e);
      window.alert(`Could not save the popup: ${e.message}`);
    },
  });

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { publicUrl } = await adminFetch("/api/admin/listings-images", {
        method: "POST",
        body: fd,
      });
      if (publicUrl) set("project_logo_url", publicUrl);
    } catch (e) {
      console.error("Logo upload failed:", e);
      window.alert(`Upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-0">
        <div className="p-6 space-y-5">
          <h2 className="text-xl font-serif font-bold text-primary">
            {form.id ? "Edit Popup" : "Add Popup"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <PopupField label="Headline top (red text) *">
              <Input
                value={form.headline_top}
                onChange={(e) => set("headline_top", e.target.value)}
                className="bg-white"
                placeholder="DONE"
              />
            </PopupField>

            <PopupField label="Headline bottom (white text) *">
              <Input
                value={form.headline_bottom}
                onChange={(e) => set("headline_bottom", e.target.value)}
                className="bg-white"
                placeholder="DEAL"
              />
            </PopupField>

            <div className="col-span-2">
              <PopupField label="Body paragraph *">
                <textarea
                  value={form.body_paragraph}
                  onChange={(e) => set("body_paragraph", e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Another milestone achieved. We are proud to have completed the sale of a 2,000 SQM building at City Gate…"
                />
              </PopupField>
            </div>

            <div className="col-span-2">
              <PopupField label="Project logo (upload — optional)">
                <label className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-border/60 rounded-xl py-5 hover:border-accent/50 transition-colors cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                      <span className="text-sm text-muted-foreground">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {form.project_logo_url ? "Replace logo" : "Upload project logo"}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                  />
                </label>
                {form.project_logo_url && (
                  <div className="mt-2 rounded-lg bg-neutral-900 p-4 flex items-center justify-center">
                    <img
                      src={form.project_logo_url}
                      alt="logo preview"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                )}
              </PopupField>
            </div>

            <PopupField label="Stat label (e.g. Successfully Sold)">
              <Input
                value={form.stat_label ?? ""}
                onChange={(e) => set("stat_label", e.target.value)}
                className="bg-white"
                placeholder="Successfully Sold"
              />
            </PopupField>

            <PopupField label="Stat unit (e.g. SQM)">
              <Input
                value={form.stat_unit ?? ""}
                onChange={(e) => set("stat_unit", e.target.value)}
                className="bg-white"
                placeholder="SQM"
              />
            </PopupField>

            <div className="col-span-2">
              <PopupField label="Stat value (freeform — e.g. 2,000 or $2M or 3 units)">
                <Input
                  value={form.stat_value ?? ""}
                  onChange={(e) => set("stat_value", e.target.value)}
                  className="bg-white"
                  placeholder="2,000"
                />
              </PopupField>
            </div>

            <div className="col-span-2">
              <PopupField label="Footer caption">
                <textarea
                  value={form.footer_caption ?? ""}
                  onChange={(e) => set("footer_caption", e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Places successfully assisted one of our VIP clients in acquiring a 2,000 SQM building at City Gate"
                />
              </PopupField>
            </div>

            <PopupField label="Sort order (lower = shown first)">
              <Input
                type="number"
                value={form.sort_order ?? ""}
                onChange={(e) =>
                  set("sort_order", e.target.value.trim() === "" ? 0 : Number(e.target.value))
                }
                className="bg-white"
              />
            </PopupField>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set("is_active", e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                <span className="text-sm font-medium text-primary">
                  Active (show on homepage)
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={
                saveMutation.isPending ||
                !form.headline_top.trim() ||
                !form.headline_bottom.trim() ||
                !form.body_paragraph.trim()
              }
              className="flex-1 bg-primary text-white"
            >
              {saveMutation.isPending ? "Saving…" : "Save Popup"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PopupsManager() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editPopup, setEditPopup] = useState<PopupForm | null>(null);

  const { data: popups = [], isLoading } = useQuery<Popup[]>({
    queryKey: ["admin-popups"],
    queryFn: () => adminFetch("/api/admin/popups"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/api/admin/popups/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-popups"] });
      queryClient.invalidateQueries({ queryKey: ["popup"] });
    },
  });

  const handleDelete = (id: number, headline: string) => {
    if (window.confirm(`Delete popup "${headline}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          One active popup appears on the homepage 3 seconds after visitors land.
          Editing any content field resurfaces it to previously-dismissed devices once.
        </p>
        <Button
          onClick={() => {
            setEditPopup(null);
            setFormOpen(true);
          }}
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Popup
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8 md:py-12">Loading popups…</p>
      ) : popups.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground mb-4">No popups yet.</p>
          <Button
            onClick={() => {
              setEditPopup(null);
              setFormOpen(true);
            }}
            className="bg-primary text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Your First Popup
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-primary/5">
                  <th className="text-left px-4 py-3 font-medium text-primary">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Headline</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Stat</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Active</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {popups.map((popup) => (
                  <tr
                    key={popup.id}
                    className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">{popup.sort_order ?? 0}</td>
                    <td className="px-4 py-3 font-medium text-primary max-w-xs truncate">
                      <span className="text-accent">{popup.headline_top}</span>{" "}
                      {popup.headline_bottom}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {popup.stat_value ? `${popup.stat_value} ${popup.stat_unit ?? ""}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {popup.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <Check className="w-3.5 h-3.5" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <X className="w-3.5 h-3.5" /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditPopup(popup);
                            setFormOpen(true);
                          }}
                          className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                          aria-label="Edit popup"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(popup.id, popup.headline_bottom)}
                          className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
                          aria-label="Delete popup"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PopupDialog open={formOpen} onClose={() => setFormOpen(false)} popup={editPopup} />
    </div>
  );
}
