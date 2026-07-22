import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Loader2, Check, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { type DealPoster } from "@/lib/deal-posters";

// CRUD for the "Latest Closed Deals" homepage carousel. Team designs each
// poster fully in Canva → exports PNG → uploads via this UI. No text editing
// on the site — the design lives entirely in the Canva file.

type DealPosterForm = Omit<DealPoster, "id" | "created_at"> & { id?: number };

const EMPTY_POSTER: DealPosterForm = {
  poster_url: "",
  caption: "",
  sort_order: 0,
  is_active: true,
};

function PosterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-primary">{label}</Label>
      {children}
    </div>
  );
}

function DealPosterDialog({
  open,
  onClose,
  poster,
}: {
  open: boolean;
  onClose: () => void;
  poster: DealPosterForm | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DealPosterForm>(EMPTY_POSTER);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(poster ?? EMPTY_POSTER);
  }, [poster, open]);

  const set = <K extends keyof DealPosterForm>(field: K, value: DealPosterForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: async (data: DealPosterForm) => {
      const payload = {
        poster_url: data.poster_url,
        caption: data.caption || null,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active,
      };
      if (data.id) {
        await adminFetch(`/api/admin/deal-posters/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch(`/api/admin/deal-posters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deal-posters"] });
      queryClient.invalidateQueries({ queryKey: ["deal-posters"] });
      onClose();
    },
    onError: (e: Error) => {
      console.error("Save deal poster failed:", e);
      window.alert(`Could not save the poster: ${e.message}`);
    },
  });

  const uploadPoster = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { publicUrl } = await adminFetch("/api/admin/listings-images", {
        method: "POST",
        body: fd,
      });
      if (publicUrl) set("poster_url", publicUrl);
    } catch (e) {
      console.error("Poster upload failed:", e);
      window.alert(`Upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-background p-0">
        <div className="p-6 space-y-5">
          <h2 className="text-xl font-serif font-bold text-primary">
            {form.id ? "Edit Deal Poster" : "Add Deal Poster"}
          </h2>

          <PosterField label="Poster image (PNG/JPG exported from Canva) *">
            <label className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-border/60 rounded-xl py-6 hover:border-accent/50 transition-colors cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                  <span className="text-sm text-muted-foreground">Uploading…</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {form.poster_url ? "Replace poster" : "Upload poster"}
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && uploadPoster(e.target.files[0])}
              />
            </label>
            {form.poster_url && (
              <div className="mt-2 rounded-lg bg-white border border-border/40 p-4 flex items-center justify-center">
                <img
                  src={form.poster_url}
                  alt="poster preview"
                  className="max-h-64 w-auto object-contain"
                />
              </div>
            )}
          </PosterField>

          <PosterField label="Caption (optional — used for alt text and internal reference)">
            <Input
              value={form.caption ?? ""}
              onChange={(e) => set("caption", e.target.value)}
              className="bg-white"
              placeholder="e.g. City Gate — 2,000 SQM"
            />
          </PosterField>

          <PosterField label="Sort order (lower = shown first)">
            <Input
              type="number"
              value={form.sort_order ?? ""}
              onChange={(e) =>
                set("sort_order", e.target.value.trim() === "" ? 0 : Number(e.target.value))
              }
              className="bg-white"
            />
          </PosterField>

          <label className="flex items-center gap-2 cursor-pointer">
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

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.poster_url.trim()}
              className="flex-1 bg-primary text-white"
            >
              {saveMutation.isPending ? "Saving…" : "Save Poster"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DealPostersManager() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editPoster, setEditPoster] = useState<DealPosterForm | null>(null);

  const { data: posters = [], isLoading } = useQuery<DealPoster[]>({
    queryKey: ["admin-deal-posters"],
    queryFn: () => adminFetch("/api/admin/deal-posters"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/api/admin/deal-posters/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deal-posters"] });
      queryClient.invalidateQueries({ queryKey: ["deal-posters"] });
    },
  });

  const handleDelete = (id: number, caption: string) => {
    if (
      window.confirm(
        `Delete poster${caption ? ` "${caption}"` : ""}? This cannot be undone.`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          Canva-designed deal announcement posters. Upload the exported PNG —
          they appear in the "Latest Closed Deals" carousel on the homepage.
        </p>
        <Button
          onClick={() => {
            setEditPoster(null);
            setFormOpen(true);
          }}
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Poster
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8 md:py-12">Loading posters…</p>
      ) : posters.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground mb-4">No posters yet.</p>
          <Button
            onClick={() => {
              setEditPoster(null);
              setFormOpen(true);
            }}
            className="bg-primary text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Your First Poster
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-primary/5">
                  <th className="text-left px-4 py-3 font-medium text-primary">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Poster</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Caption</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Active</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posters.map((poster) => (
                  <tr
                    key={poster.id}
                    className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">{poster.sort_order ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="h-16 w-14 bg-neutral-100 border border-border/40 rounded-md p-1 flex items-center justify-center">
                        <img
                          src={poster.poster_url}
                          alt={poster.caption ?? "poster"}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-primary/80 max-w-xs truncate">
                      {poster.caption ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {poster.is_active ? (
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
                            setEditPoster(poster);
                            setFormOpen(true);
                          }}
                          className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                          aria-label="Edit poster"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(poster.id, poster.caption ?? "")}
                          className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
                          aria-label="Delete poster"
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

      <DealPosterDialog open={formOpen} onClose={() => setFormOpen(false)} poster={editPoster} />
    </div>
  );
}
