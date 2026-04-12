import { useState } from "react";
import { type Listing } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { MapPin, Building2, Maximize, ArrowUpRight, ChevronLeft, ChevronRight, Phone, MessageCircle, Calendar, Eye, CarFront, type LucideIcon } from "lucide-react";

const PHONE = "01063618217";

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ListingCardProps {
  listing: Listing;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000";

function DetailBlock({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="bg-primary/[0.015] rounded-xl p-3 flex flex-col items-center text-center gap-1.5">
      <Icon className="w-4 h-4 text-accent" />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <span className="text-xs font-semibold text-primary">{typeof value === "number" ? value.toLocaleString() : formatLabel(String(value))}</span>
    </div>
  );
}

export function ListingCard({ listing }: ListingCardProps) {
  const images = listing.images?.length ? listing.images : [FALLBACK_IMAGE];
  const hasMultiple = images.length > 1;
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  };

  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in the ${listing.title} listing on PLACES.`);

  return (
    <>
      <Card className="group overflow-hidden border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-white">
        {/* Image Carousel */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={images[current]}
            alt={listing.title}
            className="object-cover w-full h-full transition-all duration-500 group-hover:scale-105"
          />

          {hasMultiple && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === current ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={`
              ${listing.transaction_type === 'Sale' ? 'bg-primary' :
                listing.transaction_type === 'Rent' ? 'bg-accent text-accent-foreground' :
                'bg-emerald-600'}
              uppercase tracking-wider text-[10px] font-bold shadow-sm border-0
            `}>
              {formatLabel(listing.transaction_type)}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-black/60 to-transparent opacity-60 pointer-events-none" />
        </div>

        {/* Content */}
        <CardHeader className="p-4 pb-1.5">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="text-xs font-semibold text-accent uppercase tracking-wide">
              {formatLabel(listing.developer)}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full">
              {formatLabel(listing.subtype)}
            </span>
          </div>
          <h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {formatLabel(listing.location)}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1 pb-3">
          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Area</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Maximize className="w-3.5 h-3.5 text-accent" />
                {listing.area_sqm} m²
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Finish</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Building2 className="w-3.5 h-3.5 text-accent" />
                <span className="truncate">{formatLabel(listing.furnishing)}</span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-primary font-serif">
                {listing.price?.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">EGP</span>
              {listing.transaction_type === "Rent" && <span className="text-xs text-muted-foreground">/month</span>}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={() => setModalOpen(true)}
            className="w-full bg-secondary hover:bg-primary hover:text-white text-secondary-foreground transition-all group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100 duration-300"
          >
            View Details <ArrowUpRight className="ml-2 w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) setModalImage(0); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-background p-0">
          {/* Modal image carousel */}
          <div className="relative h-64 overflow-hidden rounded-t-lg shrink-0 group/modal">
            {images[0] === FALLBACK_IMAGE && listing.images?.length === 0 ? (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No images available</span>
              </div>
            ) : (
              <>
                <img
                  src={images[modalImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-all duration-500"
                />

                {hasMultiple && (
                  <>
                    <button
                      onClick={() => setModalImage((c) => (c === 0 ? images.length - 1 : c - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/modal:opacity-100 transition-opacity hover:bg-black/60"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setModalImage((c) => (c === images.length - 1 ? 0 : c + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/modal:opacity-100 transition-opacity hover:bg-black/60"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {hasMultiple && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setModalImage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === modalImage ? "bg-white w-5" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="absolute top-4 left-4">
              <Badge className={`
                ${listing.transaction_type === 'Sale' ? 'bg-primary' :
                  listing.transaction_type === 'Rent' ? 'bg-accent text-accent-foreground' :
                  'bg-emerald-600'}
                uppercase tracking-wider text-[10px] font-bold shadow-sm border-0
              `}>
                {formatLabel(listing.transaction_type)}
              </Badge>
            </div>
          </div>

          {/* Modal body */}
          <div className="px-6 pb-6 pt-4 space-y-4">
            {/* Title + location + price */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-primary">{listing.title}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {formatLabel(listing.location)}
                  </span>
                  {listing.developer && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                      {formatLabel(listing.developer)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-bold text-primary font-serif">
                  {listing.price?.toLocaleString()}
                </span>
                <p className="text-xs text-muted-foreground">
                  EGP{listing.transaction_type === "Rent" ? "/month" : ""}
                </p>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-3 gap-3">
              <DetailBlock icon={MapPin} label="Project" value={listing.project} />
              <DetailBlock icon={Maximize} label="Area" value={listing.area_sqm ? `${listing.area_sqm} m²` : null} />
              <DetailBlock icon={Building2} label="Type" value={listing.property_type} />
              <DetailBlock icon={Building2} label="Subtype" value={listing.subtype} />
              <DetailBlock icon={Building2} label="Furnishing" value={listing.furnishing} />
              {listing.handover_date && <DetailBlock icon={Calendar} label="Handover" value={listing.handover_date} />}
              {listing.view && <DetailBlock icon={Eye} label="View" value={listing.view} />}
              {listing.parking && <DetailBlock icon={CarFront} label="Parking" value={listing.parking} />}
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <a href={`tel:${PHONE}`}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  <Phone className="w-4 h-4 mr-2" /> Call Us
                </Button>
              </a>
              <a
                href={`https://wa.me/2${PHONE}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
