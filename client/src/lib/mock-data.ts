import { type LucideIcon } from "lucide-react";

export type Listing = {
  id: string;
  title: string;
  location: "Cairo" | "Sheikh Zayed" | "East Cairo" | "New Capital";
  developer: "Emaar" | "Sodic" | "Marakez" | "Hyde Park" | "Misr Italia" | "Al Futtaim";
  officeType: "Business Park" | "Business Building" | "Mixed Use";
  transactionType: "Sale" | "Rent" | "Resale";
  furnishLevel: "Serviced" | "Finished" | "Furnished" | "Fully Finished" | "Core & Shell";
  price: number;
  area: number; // in sqm
  image: string;
  featured?: boolean;
};

export const LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Premium Office in Mivida Business Park",
    location: "East Cairo",
    developer: "Emaar",
    officeType: "Business Park",
    transactionType: "Sale",
    furnishLevel: "Core & Shell",
    price: 15000000,
    area: 120,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000",
    featured: true,
  },
  {
    id: "2",
    title: "Fully Furnished Executive Suite",
    location: "Sheikh Zayed",
    developer: "Sodic",
    officeType: "Business Building",
    transactionType: "Rent",
    furnishLevel: "Fully Finished",
    price: 45000,
    area: 85,
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000",
    featured: true,
  },
  {
    id: "3",
    title: "Modern Workspace at Cairo Festival City",
    location: "East Cairo",
    developer: "Al Futtaim",
    officeType: "Mixed Use",
    transactionType: "Resale",
    furnishLevel: "Finished",
    price: 8500000,
    area: 95,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "4",
    title: "Administrative Floor in Garden 8",
    location: "East Cairo",
    developer: "Misr Italia",
    officeType: "Business Park",
    transactionType: "Rent",
    furnishLevel: "Core & Shell",
    price: 120000,
    area: 250,
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "5",
    title: "Serviced Office for Startups",
    location: "Cairo",
    developer: "Marakez",
    officeType: "Business Building",
    transactionType: "Rent",
    furnishLevel: "Serviced",
    price: 25000,
    area: 40,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "6",
    title: "Prime Location Office - Hyde Park",
    location: "East Cairo",
    developer: "Hyde Park",
    officeType: "Business Park",
    transactionType: "Sale",
    furnishLevel: "Core & Shell",
    price: 18500000,
    area: 160,
    image: "https://images.unsplash.com/photo-1568992687947-86c22da06ea0?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "7",
    title: "Luxury Office Space - Polygon",
    location: "Sheikh Zayed",
    developer: "Sodic",
    officeType: "Business Park",
    transactionType: "Resale",
    furnishLevel: "Fully Finished",
    price: 12500000,
    area: 110,
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1000",
  }
];

export const DEVELOPERS = ["Emaar", "Sodic", "Marakez", "Hyde Park", "Misr Italia", "Al Futtaim"] as const;
export const LOCATIONS = ["Cairo", "Sheikh Zayed", "East Cairo", "New Capital"] as const;
export const OFFICE_TYPES = ["Business Park", "Business Building", "Mixed Use"] as const;
export const FURNISH_LEVELS = ["Serviced", "Finished", "Furnished", "Fully Finished", "Core & Shell"] as const;
export const TRANSACTION_TYPES = ["Sale", "Rent", "Resale"] as const;
