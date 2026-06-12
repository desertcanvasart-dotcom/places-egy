import type { EnumOption } from "@/lib/enums";

// Shape of a row in the Supabase `deals` table. Mirrors server/deal-schema.ts.
export interface Deal {
  id: number;
  client_name: string;
  client_logo: string | null;
  sqm: number | null;
  location: string | null;
  space_type: string | null;
  lease_format: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
}

// Dropdown options for the admin deal form. Editable single source of truth —
// add an option here and it appears in the dashboard dropdown automatically.
export const SPACE_TYPE_OPTIONS: EnumOption[] = [
  { value: "Administrative HQ", label: "Administrative HQ" },
  { value: "Regional Office", label: "Regional Office" },
  { value: "Serviced Office", label: "Serviced Office" },
  { value: "Branch Office", label: "Branch Office" },
  { value: "Flagship Office", label: "Flagship Office" },
  { value: "Coworking Space", label: "Coworking Space" },
];

export const LEASE_FORMAT_OPTIONS: EnumOption[] = [
  { value: "Long-term lease", label: "Long-term lease" },
  { value: "Lease", label: "Lease" },
  { value: "Sale", label: "Sale" },
];
