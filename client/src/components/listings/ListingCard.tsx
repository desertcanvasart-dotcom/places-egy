import { Listing } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Building2, Maximize, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-white">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={listing.image} 
          alt={listing.title} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className={`
            ${listing.transactionType === 'Sale' ? 'bg-primary' : 
              listing.transactionType === 'Rent' ? 'bg-accent text-accent-foreground' : 
              'bg-emerald-600'} 
            uppercase tracking-wider text-[10px] font-bold shadow-sm border-0
          `}>
            {listing.transactionType}
          </Badge>
          {listing.featured && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-foreground uppercase tracking-wider text-[10px] font-bold shadow-sm">
              Featured
            </Badge>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-black/60 to-transparent opacity-60" />
      </div>

      {/* Content */}
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="text-xs font-semibold text-accent uppercase tracking-wide">
            {listing.developer}
          </div>
          <div className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {listing.officeType}
          </div>
        </div>
        <h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
          <MapPin className="w-3.5 h-3.5" />
          {listing.location}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 pb-4">
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-dashed border-border/60">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Area</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Maximize className="w-3.5 h-3.5 text-accent" />
              {listing.area} m²
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Finish</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Building2 className="w-3.5 h-3.5 text-accent" />
              <span className="truncate">{listing.furnishLevel}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-primary font-serif">
              {listing.price.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">EGP</span>
            {listing.transactionType === "Rent" && <span className="text-xs text-muted-foreground">/month</span>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button className="w-full bg-secondary hover:bg-primary hover:text-white text-secondary-foreground transition-all group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100 duration-300">
          View Details <ArrowUpRight className="ml-2 w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
