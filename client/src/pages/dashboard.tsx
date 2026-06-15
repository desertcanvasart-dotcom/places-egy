import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type Listing } from "@/lib/supabase";
import { DealsManager } from "@/components/admin/DealsManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, LogOut, X, Upload, Loader2, Home } from "lucide-react";
import { humanizeError } from "@/lib/error-messages";

import { adminFetch } from "@/lib/admin-fetch";

import {
  DEVELOPER_OPTIONS,
  FURNISHING_OPTIONS,
  LOCATION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SUBTYPE_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  MAINTENANCE_STATUS_OPTIONS,
  getEnumLabel,
  type EnumOption,
} from "@/lib/enums";
import { CURRENCY_OPTIONS, listingCurrency } from "@/lib/currency";

// Dropdown options — single source of truth lives in lib/enums.ts so the admin
// dropdowns, filter sidebars, and display labels all stay in lockstep.
const ENUM_OPTIONS = {
  property_type: PROPERTY_TYPE_OPTIONS,
  subtype: SUBTYPE_OPTIONS,
  transaction_type: TRANSACTION_TYPE_OPTIONS,
  furnishing: FURNISHING_OPTIONS,
  location: LOCATION_OPTIONS,
  developer: DEVELOPER_OPTIONS,
  currency: CURRENCY_OPTIONS,
  maintenance_status: MAINTENANCE_STATUS_OPTIONS,
};

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Listing data is queried under many keys across the app: ["listings"],
// ["admin-listings"], ["commercial-listings"], ["business-park-listings"],
// ["resale-listings"], ["location-newest-listings", ...], etc. After any
// admin mutation we want all of them to refetch — otherwise newly-created
// or edited listings stay invisible on subtype/service/location pages until
// the user does a hard reload.
function invalidateAllListingQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({
    predicate: (q) => {
      const k = q.queryKey[0];
      if (typeof k !== "string") return false;
      return k === "listings" || k.endsWith("-listings");
    },
  });
}

type ListingForm = Omit<Listing, "id"> & { id?: number };

// property_type is hardcoded to "admin" on every new listing — PLACES has
// retired its commercial offering. Keeping the field on the type for DB
// shape compatibility, but it's never user-editable.
const EMPTY_FORM: ListingForm = {
  title: "",
  property_type: "admin",
  subtype: "",
  developer: "",
  project: "",
  location: "",
  location_area: "",
  price: 0,
  currency: "EGP",
  area_sqm: 0,
  transaction_type: "",
  furnishing: "",
  description: "",
  images: [],
  delivery_date: "",
  parking: 0,
  price_per_meter: 0,
  maintenance_fees: 0,
  maintenance_status: "",
  floor: 0,
};

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        sessionStorage.setItem("admin_password", password);
        onLogin();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">PLACES Admin</h1>
          <p className="text-muted-foreground text-sm">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className="bg-white h-12"
          />
          {error && <p className="text-accent text-sm">Incorrect password</p>}
          <Button type="submit" disabled={submitting} className="w-full h-12 bg-primary text-white">
            {submitting ? "Checking..." : "Log In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: EnumOption[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-primary">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="max-h-72 overflow-y-auto">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ListingFormDialog({
  open,
  onClose,
  listing,
}: {
  open: boolean;
  onClose: () => void;
  listing: ListingForm | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ListingForm>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (listing) {
      setForm(listing);
    } else {
      setForm(EMPTY_FORM);
    }
  }, [listing, open]);

  const isEditing = !!form.id;

  const saveMutation = useMutation({
    mutationFn: async (data: ListingForm) => {
      const { id, ...rest } = data;
      if (id) {
        await adminFetch(`/api/admin/listings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rest),
        });
      } else {
        await adminFetch(`/api/admin/listings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rest),
        });
      }
    },
    onSuccess: () => {
      invalidateAllListingQueries(queryClient);
      onClose();
    },
    onError: (error: Error) => {
      console.error("Save listing failed:", error);
    },
  });

  const set = (field: keyof ListingForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Coerce a number-input's raw string to a number, or null when blank/invalid.
  // Sending null (not 0, not NaN) means an unfilled field is simply omitted —
  // the listing card/detail page guard every numeric stat with `!= null`, so a
  // blank field shows nothing instead of "0 m²", and NaN never reaches the
  // server (its Zod .finite() check would otherwise reject the whole save).
  const toNum = (raw: string): number | null => {
    if (raw.trim() === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    const failed: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const { publicUrl } = await adminFetch("/api/admin/listings-images", {
          method: "POST",
          body: fd,
        });
        if (publicUrl) newUrls.push(publicUrl);
      } catch (err) {
        console.error("Upload failed:", err);
        failed.push(file.name);
      }
    }
    set("images", [...(form.images || []), ...newUrls]);
    setUploading(false);
    // Don't let failed uploads vanish silently — tell the admin which ones and
    // why, so a rate-limit/size error is visible instead of looking like a cap.
    if (failed.length) {
      window.alert(
        `${failed.length} image(s) failed to upload: ${failed.join(", ")}. ` +
          `Please try those again.`,
      );
    }
  };

  const removeImage = (index: number) => {
    set("images", (form.images || []).filter((_: string, i: number) => i !== index));
  };

  // The first image in the array is the listing's main/cover photo (cards and
  // the carousel use images[0]). "Set as main" moves the chosen image to the
  // front, preserving the order of the rest.
  const setMainImage = (index: number) => {
    const imgs = form.images || [];
    if (index <= 0 || index >= imgs.length) return;
    const reordered = [imgs[index], ...imgs.filter((_: string, i: number) => i !== index)];
    set("images", reordered);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-0">
        <div className="p-6 space-y-5">
          <h2 className="text-xl font-serif font-bold text-primary">
            {isEditing ? "Edit Listing" : "Add New Listing"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm font-medium text-primary">Title <span className="text-accent">*</span></Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-white" />
            </div>

            <SelectField label="Subtype" value={form.subtype} options={ENUM_OPTIONS.subtype} onChange={(v) => set("subtype", v)} />
            <SelectField label="Transaction Type" value={form.transaction_type} options={ENUM_OPTIONS.transaction_type} onChange={(v) => set("transaction_type", v)} />
            <SelectField label="Developer" value={form.developer} options={ENUM_OPTIONS.developer} onChange={(v) => set("developer", v)} />
            <SelectField label="Location" value={form.location} options={ENUM_OPTIONS.location} onChange={(v) => set("location", v)} />
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Location Area</Label>
              <Input value={form.location_area} onChange={(e) => set("location_area", e.target.value)} placeholder="e.g. Fifth Settlement" className="bg-white" />
            </div>
            <SelectField label="Furnishing" value={form.furnishing} options={ENUM_OPTIONS.furnishing} onChange={(v) => set("furnishing", v)} />

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Project</Label>
              <Input value={form.project} onChange={(e) => set("project", e.target.value)} className="bg-white" />
            </div>

            <SelectField label="Currency" value={form.currency} options={ENUM_OPTIONS.currency} onChange={(v) => set("currency", v)} />

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Price ({form.currency}) <span className="text-accent">*</span></Label>
              <Input type="number" value={form.price ?? ""} onChange={(e) => set("price", toNum(e.target.value))} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Area (sqm)</Label>
              <Input type="number" value={form.area_sqm ?? ""} onChange={(e) => set("area_sqm", toNum(e.target.value))} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Price per meter ({form.currency})</Label>
              <Input type="number" value={form.price_per_meter ?? ""} onChange={(e) => set("price_per_meter", toNum(e.target.value))} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Maintenance Fees ({form.currency})</Label>
              <Input type="number" value={form.maintenance_fees ?? ""} onChange={(e) => set("maintenance_fees", toNum(e.target.value))} className="bg-white" />
            </div>

            <SelectField label="Maintenance" value={form.maintenance_status} options={ENUM_OPTIONS.maintenance_status} onChange={(v) => set("maintenance_status", v)} />

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Floor</Label>
              <Input type="number" value={form.floor ?? ""} onChange={(e) => set("floor", toNum(e.target.value))} placeholder="0" className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Delivery date</Label>
              <Input value={form.delivery_date} onChange={(e) => set("delivery_date", e.target.value)} placeholder="e.g. Q3 2026" className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Parking (spaces)</Label>
              <Input type="number" value={form.parking ?? ""} onChange={(e) => set("parking", toNum(e.target.value))} placeholder="0" className="bg-white" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm font-medium text-primary">Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="flex w-full rounded-full border border-input bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-sm font-medium text-primary">Images</Label>
              <label className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-border/60 rounded-xl py-6 hover:border-accent/50 transition-colors cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload images</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => e.target.files && uploadImages(e.target.files)}
                />
              </label>
              {(form.images || []).length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground">
                    The first image is the main photo shown on listing cards. Hover an image and click "Set main" to make it the cover.
                  </p>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {(form.images || []).map((url: string, i: number) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-border/40">
                        <img src={url} alt="" className="w-full h-20 object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Main
                          </span>
                        )}
                        {i !== 0 && (
                          <button
                            onClick={() => setMainImage(i)}
                            className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                          >
                            Set main
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {saveMutation.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive px-4 py-3 text-sm">
              <p className="font-semibold mb-1">Save failed</p>
              <p className="text-xs">{humanizeError((saveMutation.error as Error).message)}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.title.trim() || form.price == null}
              className="flex-1 bg-primary text-white"
            >
              {saveMutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editListing, setEditListing] = useState<ListingForm | null>(null);
  const [tab, setTab] = useState<"listings" | "deals">("listings");
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("id", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminFetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      invalidateAllListingQueries(queryClient);
    },
  });

  const handleEdit = (listing: Listing) => {
    setEditListing(listing);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditListing(null);
    setFormOpen(true);
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/places-logo.png"
              alt="PLACES"
              className="h-8 w-auto brightness-0 invert"
            />
            <h1 className="text-xl font-serif font-bold group-hover:opacity-80 transition-opacity">
              Admin
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" /> View site
              </Button>
            </Link>
            {tab === "listings" && (
              <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Listing
              </Button>
            )}
            <Button onClick={onLogout} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border/40">
          {(["listings", "deals"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-accent text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "deals" ? (
          <DealsManager />
        ) : isLoading ? (
          <p className="text-muted-foreground text-center py-12">Loading listings...</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No listings yet.</p>
            <Button onClick={handleAdd} className="bg-primary text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Listing
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-primary/5">
                    <th className="text-left px-4 py-3 font-medium text-primary">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Subtype</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Developer</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Transaction</th>
                    <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-border/20 hover:bg-primary/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-primary max-w-[200px] truncate">{listing.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatLabel(listing.subtype)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{listing.location}</td>
                      <td className="px-4 py-3 text-muted-foreground">{getEnumLabel(DEVELOPER_OPTIONS, listing.developer)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{listing.price?.toLocaleString()} {listingCurrency(listing)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatLabel(listing.transaction_type)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(listing)}
                            className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(listing.id, listing.title)}
                            className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
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
      </div>

      <ListingFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditListing(null); }}
        listing={editListing}
      />
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem("admin_password"));

  const handleLogout = () => {
    sessionStorage.removeItem("admin_password");
    setAuthed(false);
  };

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
