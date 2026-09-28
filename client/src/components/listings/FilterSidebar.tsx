import { useMemo } from "react";
import { type Listing } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { FURNISHING_OPTIONS } from "@/lib/enums";

export type Filters = {
  transactionType: "Sale" | "Rent" | null;
  propertyType: "Admin" | "Commercial" | null;
  subtype: string[];
  location: string | null;
  priceRange: [number, number];
  furnishing: string[];
  developer: string | null;
};

export const PRICE_MIN = 0;
export const PRICE_MAX = 100000000;
export const PRICE_STEP = 100000;

export const DEFAULT_FILTERS: Filters = {
  transactionType: null,
  propertyType: null,
  subtype: [],
  location: null,
  priceRange: [PRICE_MIN, PRICE_MAX],
  furnishing: [],
  developer: null,
};

const ADMIN_SUBTYPES = ["Business Park", "Business Building", "Mixed Use"];
const LOCATIONS = ["New Cairo", "Sheikh Zayed", "6th October", "Downtown Cairo", "Sheraton", "Maadi"];


interface FilterSidebarProps {
  filters: Filters;
  setFilters: (filters: Filters | ((prev: Filters) => Filters)) => void;
  listings: Listing[];
  className?: string;
}

function formatPrice(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return `${value}`;
}

export function FilterSidebar({ filters, setFilters, listings, className }: FilterSidebarProps) {

  const locations = useMemo(
    () => Array.from(new Set([...LOCATIONS, ...listings.map(l => l.location).filter(Boolean)])).sort(),
    [listings]
  );

  const subtypeOptions = ADMIN_SUBTYPES;

  const setTransactionType = (type: "Sale" | "Rent") => {
    setFilters((prev) => ({
      ...prev,
      transactionType: prev.transactionType === type ? null : type,
    }));
  };

  const toggleSubtype = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      subtype: prev.subtype.includes(value)
        ? prev.subtype.filter((s) => s !== value)
        : [...prev.subtype, value],
    }));
  };

  const toggleFurnishing = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      furnishing: prev.furnishing.includes(value)
        ? prev.furnishing.filter((f) => f !== value)
        : [...prev.furnishing, value],
    }));
  };

  const setLocation = (value: string) => {
    setFilters((prev) => ({ ...prev, location: value === "all" ? null : value }));
  };

  const setPriceRange = (range: number[]) => {
    setFilters((prev) => ({ ...prev, priceRange: [range[0], range[1]] as [number, number] }));
  };

  // Use slug values (matching Supabase) — labels are the user-visible text.
  const furnishingOptions = FURNISHING_OPTIONS;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-end -mb-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-accent h-auto p-0"
          onClick={() => setFilters(DEFAULT_FILTERS)}
        >
          <RotateCcw className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>

      {/* Filter 1 — Transaction Type. Three-way segmented control now
          that income-property is a real option. Compact enough to still
          fit horizontally on desktop; wraps naturally on narrow columns. */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Transaction</Label>
        <div className="flex flex-wrap gap-2 p-1 bg-secondary/50 rounded-lg">
          {(["Sale", "Rent", "Income Property"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTransactionType(type)}
              className={`flex-1 min-w-20 text-sm font-medium py-2 px-2 rounded-full transition-all whitespace-nowrap ${
                filters.transactionType === type
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Filter 2 — Subtype (multi-select pills) */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Subtype</Label>
        <div className="flex flex-wrap gap-2">
          {subtypeOptions.map((opt) => {
            const isSelected = filters.subtype.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleSubtype(opt)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-foreground/70 border-border hover:border-accent hover:text-accent"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Filter 4 — Location dropdown */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
        <Select value={filters.location ?? "all"} onValueChange={setLocation}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Price Range (EGP)</Label>
        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={[filters.priceRange[0], filters.priceRange[1]]}
          onValueChange={(vals) => setPriceRange([vals[0], vals[1]])}
          minStepsBetweenThumbs={1}
        />
        <div className="flex justify-between text-xs font-medium text-foreground">
          <span>{formatPrice(filters.priceRange[0])}</span>
          <span>{formatPrice(filters.priceRange[1])}</span>
        </div>
      </div>


      <Separator />

      {/* Filter 6 — Furnishing (compact pills) */}
      <div className="space-y-3">
        <Label className="block mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Handover condition</Label>
        <div className="flex flex-wrap gap-2">
          {furnishingOptions.map((opt) => {
            const isSelected = filters.furnishing.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleFurnishing(opt.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-foreground/70 border-border hover:border-accent hover:text-accent"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
