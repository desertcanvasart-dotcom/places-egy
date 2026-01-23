import { 
  DEVELOPERS, 
  LOCATIONS, 
  OFFICE_TYPES, 
  FURNISH_LEVELS, 
  TRANSACTION_TYPES 
} from "@/lib/mock-data";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterSidebarProps {
  filters: any;
  setFilters: (filters: any) => void;
  className?: string;
}

export function FilterSidebar({ filters, setFilters, className }: FilterSidebarProps) {
  
  const handleCheckboxChange = (category: string, value: string) => {
    setFilters((prev: any) => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter((item: string) => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleTransactionChange = (type: string) => {
     setFilters((prev: any) => ({ 
       ...prev, 
       transactionType: prev.transactionType === type ? null : type 
     }));
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold text-primary">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground hover:text-accent h-auto p-0"
          onClick={() => setFilters({})}
        >
          <RotateCcw className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>

      {/* Transaction Type - Segmented Control Visual */}
      <div className="space-y-3">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Transaction</Label>
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
          {TRANSACTION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleTransactionChange(type)}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                filters.transactionType === type
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Locations */}
      <div className="space-y-3">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
        <div className="space-y-2">
          {LOCATIONS.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox 
                id={`loc-${location}`} 
                checked={filters.location?.includes(location)}
                onCheckedChange={() => handleCheckboxChange("location", location)}
                className="data-[state=checked]:bg-primary border-muted-foreground/30"
              />
              <label
                htmlFor={`loc-${location}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground/80 hover:text-foreground"
              >
                {location}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Office Type */}
      <div className="space-y-3">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Office Type</Label>
        <div className="flex flex-wrap gap-2">
          {OFFICE_TYPES.map((type) => (
            <div 
              key={type}
              onClick={() => handleCheckboxChange("officeType", type)}
              className={`
                cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-all
                ${filters.officeType?.includes(type) 
                  ? "bg-primary text-white border-primary" 
                  : "bg-white text-foreground/70 border-border hover:border-accent hover:text-accent-foreground"}
              `}
            >
              {type}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Developers */}
      <div className="space-y-3">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Developer</Label>
        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
          {DEVELOPERS.map((dev) => (
            <div key={dev} className="flex items-center space-x-2">
              <Checkbox 
                id={`dev-${dev}`} 
                checked={filters.developer?.includes(dev)}
                onCheckedChange={() => handleCheckboxChange("developer", dev)}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent border-muted-foreground/30"
              />
              <label
                htmlFor={`dev-${dev}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground/80 hover:text-foreground"
              >
                {dev}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Furnish Level */}
      <div className="space-y-3">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Furnish Level</Label>
        <div className="space-y-2">
          {FURNISH_LEVELS.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox 
                id={`fur-${level}`}
                checked={filters.furnishLevel?.includes(level)}
                onCheckedChange={() => handleCheckboxChange("furnishLevel", level)}
                className="border-muted-foreground/30"
              />
              <label
                htmlFor={`fur-${level}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground/80 hover:text-foreground"
              >
                {level}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
