import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Loader2, Check, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { type ClientLogo } from "@/lib/client-logos";

// CRUD for the "Companies We've Placed" logo strip on /why-places. Mirrors
// DealsManager.tsx exactly — one shared upload endpoint (/api/admin/listings-images
// is generic, name is a legacy artifact), one Supabase table (client_logos),
// same is_active + sort_order pattern.

type ClientLogoForm = Omit<ClientLogo, "id" | "created_at"> & { id?: number };

const EMPTY_LOGO: ClientLogoForm = {
  name: "",
  logo_url: "",
  sort_order: 0,
  is_active: true,
};

function LogoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-primary">{label}</Label>
      {children}
    </div>
  );
}

function ClientLogoDialog({
  open,
  onClose,
  logo,
}: {
  open: boolean;
  onClose: () => void;
  logo: ClientLogoForm | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ClientLogoForm>(EMPTY_LOGO);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(logo ?? EMPTY_LOGO);
  }, [logo, open]);

  const set = <K extends keyof ClientLogoForm>(field: K, value: ClientLogoForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: async (data: ClientLogoForm) => {
      // Whitelist columns — server-side .strict() zod schema rejects unknown keys.
      const payload = {
        name: data.name,
        logo_url: data.logo_url,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active,
      };
      if (data.id) {
        await adminFetch(`/api/admin/client-logos/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch(`/api/admin/client-logos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-client-logos"] });
      queryClient.invalidateQueries({ queryKey: ["client-logos"] });
      onClose();
    },
    onError: (e: Error) => {
      console.error("Save logo failed:", e);
      window.alert(`Could not save the logo: ${e.message}`);
    },
  });

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Reuse the generic image upload endpoint (originally for listings but
      // it accepts any image and just returns a public Supabase Storage URL).
      const { publicUrl } = await adminFetch("/api/admin/listings-images", {
        method: "POST",
        body: fd,
      });
      if (publicUrl) set("logo_url", publicUrl);
    } catch (e) {
      console.error("Logo upload failed:", e);
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
            {form.id ? "Edit Logo" : "Add Logo"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <LogoField label="Company name *">
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="bg-white"
                  placeholder="e.g. Vodafone Egypt"
                />
              </LogoField>
            </div>

            <div className="col-span-2">
              <LogoField label="Logo (PNG/SVG/WebP) *">
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
                        {form.logo_url ? "Replace logo" : "Upload logo"}
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
                {form.logo_url && (
                  <div className="mt-2 rounded-lg bg-white border border-border/40 p-4 flex items-center justify-center">
                    <img
                      src={form.logo_url}
                      alt="logo preview"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                )}
              </LogoField>
            </div>

            <LogoField label="Sort order (lower = first)">
              <Input
                type="number"
                value={form.sort_order ?? ""}
                onChange={(e) =>
                  set("sort_order", e.target.value.trim() === "" ? 0 : Number(e.target.value))
                }
                className="bg-white"
              />
            </LogoField>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set("is_active", e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                <span className="text-sm font-medium text-primary">
                  Active (show on Why PLACES page)
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
                saveMutation.isPending || !form.name.trim() || !form.logo_url.trim()
              }
              className="flex-1 bg-primary text-white"
            >
              {saveMutation.isPending ? "Saving…" : "Save Logo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ClientLogosManager() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editLogo, setEditLogo] = useState<ClientLogoForm | null>(null);

  const { data: logos = [], isLoading } = useQuery<ClientLogo[]>({
    queryKey: ["admin-client-logos"],
    queryFn: () => adminFetch("/api/admin/client-logos"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/api/admin/client-logos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-client-logos"] });
      queryClient.invalidateQueries({ queryKey: ["client-logos"] });
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Delete the logo for "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          Companies displayed on the "Companies We've Placed" strip on /why-places.
        </p>
        <Button
          onClick={() => {
            setEditLogo(null);
            setFormOpen(true);
          }}
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Logo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8 md:py-12">Loading logos…</p>
      ) : logos.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground mb-4">No logos yet.</p>
          <Button
            onClick={() => {
              setEditLogo(null);
              setFormOpen(true);
            }}
            className="bg-primary text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Your First Logo
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-primary/5">
                  <th className="text-left px-4 py-3 font-medium text-primary">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Logo</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Company</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Active</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logos.map((logo) => (
                  <tr
                    key={logo.id}
                    className="border-b border-border/20 hover:bg-primary/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">{logo.sort_order ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="h-10 w-24 bg-white border border-border/40 rounded-md p-1 flex items-center justify-center">
                        <img
                          src={logo.logo_url}
                          alt={`${logo.name} logo`}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-primary">{logo.name}</td>
                    <td className="px-4 py-3">
                      {logo.is_active ? (
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
                            setEditLogo(logo);
                            setFormOpen(true);
                          }}
                          className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                          aria-label="Edit logo"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(logo.id, logo.name)}
                          className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
                          aria-label="Delete logo"
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

      <ClientLogoDialog open={formOpen} onClose={() => setFormOpen(false)} logo={editLogo} />
    </div>
  );
}
