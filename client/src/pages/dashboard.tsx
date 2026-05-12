import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type Listing } from "@/lib/supabase";
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

// Admin password is now validated server-side. We keep it in sessionStorage
// purely so the user doesn't have to re-enter it on every action; the server
// is the source of truth via the x-admin-password header.
function getAdminPassword(): string | null {
  return sessionStorage.getItem("admin_password");
}

async function adminFetch(path: string, init: RequestInit = {}) {
  const password = getAdminPassword();
  const headers = new Headers(init.headers);
  if (password) headers.set("x-admin-password", password);
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

import {
  DEVELOPER_OPTIONS,
  FURNISHING_OPTIONS,
  LOCATION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SUBTYPE_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  getEnumLabel,
  type EnumOption,
} from "@/lib/enums";

// Dropdown options — single source of truth lives in lib/enums.ts so the admin
// dropdowns, filter sidebars, and display labels all stay in lockstep.
const ENUM_OPTIONS = {
  property_type: PROPERTY_TYPE_OPTIONS,
  subtype: SUBTYPE_OPTIONS,
  transaction_type: TRANSACTION_TYPE_OPTIONS,
  furnishing: FURNISHING_OPTIONS,
  location: LOCATION_OPTIONS,
  developer: DEVELOPER_OPTIONS,
};

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type ListingForm = Omit<Listing, "id"> & { id?: number };

const EMPTY_FORM: ListingForm = {
  title: "",
  property_type: "",
  subtype: "",
  developer: "",
  project: "",
  location: "",
  location_area: "",
  price: 0,
  area_sqm: 0,
  transaction_type: "",
  furnishing: "",
  description: "",
  images: [],
  delivery_date: "",
  parking: 0,
  price_per_meter: 0,
  maintenance_fees: 0,
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
        <SelectContent>
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
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["commercial-listings"] });
      onClose();
    },
    onError: (error: Error) => {
      console.error("Save listing failed:", error);
    },
  });

  const set = (field: keyof ListingForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
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
      }
    }
    set("images", [...(form.images || []), ...newUrls]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    set("images", (form.images || []).filter((_: string, i: number) => i !== index));
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
              <Label className="text-sm font-medium text-primary">Title</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-white" />
            </div>

            <SelectField label="Property Type" value={form.property_type} options={ENUM_OPTIONS.property_type} onChange={(v) => set("property_type", v)} />
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

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Price (EGP)</Label>
              <Input type="number" value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Area (sqm)</Label>
              <Input type="number" value={form.area_sqm || ""} onChange={(e) => set("area_sqm", Number(e.target.value))} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Price per meter (EGP)</Label>
              <Input type="number" value={form.price_per_meter || ""} onChange={(e) => set("price_per_meter", Number(e.target.value))} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Maintenance fees (EGP)</Label>
              <Input type="number" value={form.maintenance_fees || ""} onChange={(e) => set("maintenance_fees", Number(e.target.value))} className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Floor</Label>
              <Input type="number" value={form.floor ?? ""} onChange={(e) => set("floor", Number(e.target.value))} placeholder="0" className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Delivery date</Label>
              <Input value={form.delivery_date} onChange={(e) => set("delivery_date", e.target.value)} placeholder="e.g. Q3 2026" className="bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-primary">Parking (spaces)</Label>
              <Input type="number" value={form.parking ?? ""} onChange={(e) => set("parking", Number(e.target.value))} placeholder="0" className="bg-white" />
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
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(form.images || []).map((url: string, i: number) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-border/40">
                      <img src={url} alt="" className="w-full h-20 object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {saveMutation.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive px-4 py-3 text-sm">
              <p className="font-semibold mb-1">Save failed</p>
              <p className="text-xs">{(saveMutation.error as Error).message}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.title}
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
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

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
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["commercial-listings"] });
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
            <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Listing
            </Button>
            <Button onClick={onLogout} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div
            onClick={() => setTypeFilter(null)}
            className={`rounded-xl p-5 border cursor-pointer transition-all duration-200 ${
              typeFilter === null
                ? "bg-primary border-primary ring-2 ring-primary/30"
                : "bg-primary/80 border-primary/80 hover:bg-primary"
            }`}
          >
            <p className="text-3xl font-serif font-bold text-white">{listings.length}</p>
            <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Total Listings</p>
          </div>
          <div
            onClick={() => setTypeFilter(typeFilter === "admin" ? null : "admin")}
            className={`rounded-xl p-5 border-l-4 border-l-accent border cursor-pointer transition-all duration-200 ${
              typeFilter === "admin"
                ? "bg-accent/5 border-accent/30 ring-2 ring-accent/30"
                : "bg-white border-border/40 hover:bg-accent/5"
            }`}
          >
            <p className="text-3xl font-serif font-bold text-accent">
              {listings.filter((l) => l.property_type === "admin").length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Admin</p>
          </div>
          <div
            onClick={() => setTypeFilter(typeFilter === "commercial" ? null : "commercial")}
            className={`rounded-xl p-5 border-l-4 border-l-primary border cursor-pointer transition-all duration-200 ${
              typeFilter === "commercial"
                ? "bg-primary/5 border-primary/30 ring-2 ring-primary/30"
                : "bg-white border-border/40 hover:bg-primary/5"
            }`}
          >
            <p className="text-3xl font-serif font-bold text-primary">
              {listings.filter((l) => l.property_type === "commercial").length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Commercial</p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
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
                    <th className="text-left px-4 py-3 font-medium text-primary">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Subtype</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Developer</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">Transaction</th>
                    <th className="text-right px-4 py-3 font-medium text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.filter((l) => !typeFilter || l.property_type === typeFilter).map((listing) => (
                    <tr key={listing.id} className="border-b border-border/20 hover:bg-primary/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-primary max-w-[200px] truncate">{listing.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatLabel(listing.property_type)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatLabel(listing.subtype)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{listing.location}</td>
                      <td className="px-4 py-3 text-muted-foreground">{getEnumLabel(DEVELOPER_OPTIONS, listing.developer)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{listing.price?.toLocaleString()} EGP</td>
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
