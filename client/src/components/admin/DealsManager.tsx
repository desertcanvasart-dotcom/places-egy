import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, Loader2, Check, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { type Deal, SPACE_TYPE_OPTIONS, LEASE_FORMAT_OPTIONS } from "@/lib/deals";
import type { EnumOption } from "@/lib/enums";

type DealForm = Omit<Deal, "id" | "created_at"> & { id?: number };

const EMPTY_DEAL: DealForm = {
  client_name: "",
  client_logo: "",
  sqm: null,
  location: "",
  space_type: "",
  lease_format: "",
  is_active: true,
  sort_order: 0,
};

function DealField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-primary">{label}</Label>
      {children}
    </div>
  );
}

function DealSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: EnumOption[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DealDialog({
  open,
  onClose,
  deal,
}: {
  open: boolean;
  onClose: () => void;
  deal: DealForm | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DealForm>(EMPTY_DEAL);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(deal ?? EMPTY_DEAL);
  }, [deal, open]);

  const set = (field: keyof DealForm, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: async (data: DealForm) => {
      // Send ONLY the columns the server's strict schema accepts — never the
      // id/created_at (or any other stray key), which a .strict() schema rejects
      // with a 400. The edit path loads the full DB row (incl. created_at), so
      // explicit whitelisting here is what keeps saves working.
      const payload = {
        client_name: data.client_name,
        client_logo: data.client_logo || null,
        sqm: data.sqm,
        location: data.location || null,
        space_type: data.space_type || null,
        lease_format: data.lease_format || null,
        is_active: data.is_active,
        sort_order: data.sort_order ?? 0,
      };
      if (data.id) {
        await adminFetch(`/api/admin/deals/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch(`/api/admin/deals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      onClose();
    },
    onError: (e: Error) => {
      console.error("Save deal failed:", e);
      window.alert(`Could not save the deal: ${e.message}`);
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
      if (publicUrl) set("client_logo", publicUrl);
    } catch (e) {
      console.error("Logo upload failed:", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-background p-0">
        <div className="p-6 space-y-5">
          <h2 className="text-xl font-serif font-bold text-primary">
            {form.id ? "Edit Deal" : "Add Deal"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <DealField label="Client name *">
                <Input value={form.client_name} onChange={(e) => set("client_name", e.target.value)} className="bg-white" />
              </DealField>
            </div>

            <div className="col-span-2">
              <DealField label="Client logo (white/light, for dark banner)">
                <label className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-border/60 rounded-xl py-5 hover:border-accent/50 transition-colors cursor-pointer">
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 text-accent animate-spin" /><span className="text-sm text-muted-foreground">Uploading…</span></>
                  ) : (
                    <><Upload className="w-5 h-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">{form.client_logo ? "Replace logo" : "Upload logo"}</span></>
                  )}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
                </label>
                {form.client_logo && (
                  <div className="mt-2 rounded-lg bg-primary p-3 flex items-center justify-center">
                    <img src={form.client_logo} alt="logo preview" className="h-8 w-auto object-contain brightness-0 invert" />
                  </div>
                )}
              </DealField>
            </div>

            <DealField label="Leased area (SQM)">
              <Input type="number" value={form.sqm ?? ""} onChange={(e) => set("sqm", e.target.value.trim() === "" ? null : Number(e.target.value))} className="bg-white" />
            </DealField>

            <DealField label="Sort order (lower = first)">
              <Input type="number" value={form.sort_order ?? ""} onChange={(e) => set("sort_order", e.target.value.trim() === "" ? 0 : Number(e.target.value))} className="bg-white" />
            </DealField>

            <div className="col-span-2">
              <DealField label="Location (district / business park)">
                <Input value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} className="bg-white" />
              </DealField>
            </div>

            <DealField label="Space type">
              <DealSelect value={form.space_type ?? ""} options={SPACE_TYPE_OPTIONS} placeholder="Select type" onChange={(v) => set("space_type", v)} />
            </DealField>

            <DealField label="Lease format">
              <DealSelect value={form.lease_format ?? ""} options={LEASE_FORMAT_OPTIONS} placeholder="Select term" onChange={(v) => set("lease_format", v)} />
            </DealField>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 accent-accent" />
                <span className="text-sm font-medium text-primary">Active (show on homepage)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.client_name.trim()}
              className="flex-1 bg-primary text-white"
            >
              {saveMutation.isPending ? "Saving…" : "Save Deal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DealsManager() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<DealForm | null>(null);

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["admin-deals"],
    queryFn: () => adminFetch("/api/admin/deals"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminFetch(`/api/admin/deals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Delete the deal for "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          Up to the top 3 active deals (by sort order) appear in the homepage carousel.
        </p>
        <Button onClick={() => { setEditDeal(null); setFormOpen(true); }} className="bg-accent hover:bg-accent/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Deal
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-12">Loading deals…</p>
      ) : deals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No deals yet.</p>
          <Button onClick={() => { setEditDeal(null); setFormOpen(true); }} className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Deal
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-primary/5">
                  <th className="text-left px-4 py-3 font-medium text-primary">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">SQM</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Space</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Active</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-border/20 hover:bg-primary/[0.02] transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{deal.sort_order ?? 0}</td>
                    <td className="px-4 py-3 font-medium text-primary">{deal.client_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{deal.sqm?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{deal.location ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{deal.space_type ?? "—"}</td>
                    <td className="px-4 py-3">
                      {deal.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><Check className="w-3.5 h-3.5" /> Live</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><X className="w-3.5 h-3.5" /> Hidden</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditDeal(deal); setFormOpen(true); }} className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(deal.id, deal.client_name)} className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors">
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

      <DealDialog open={formOpen} onClose={() => setFormOpen(false)} deal={editDeal} />
    </div>
  );
}
