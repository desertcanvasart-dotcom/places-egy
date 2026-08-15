import type { Express, Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "./supabase";
import { requireAdmin } from "./admin-auth";
import { strictLimiter } from "./rate-limit";

// Project coordinates — one row per named project (Solana East, Zed West,
// etc.) with the exact building location. Used by:
//   - Homepage master map (public GET, all rows)
//   - /listings map view (same public GET, joined client-side to listings)
//   - Listing edit form in /dashboard (admin GET for prefill, admin PUT to save)
//
// Data model rationale: we could store lat/lng per listing (already have the
// columns) but 12 units in Solana East would produce 12 stacked pins, and
// re-entering coords for each listing is error-prone. Per-project keeps the
// map clean AND makes admin data entry a one-time-per-building task.

const upsertSchema = z.object({
  project_name: z.string().trim().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address_line: z.string().trim().max(500).nullable().optional(),
});

export function registerProjectCoordsRoutes(app: Express) {
  // Public GET — feeds both the homepage master map and /listings map view.
  // Returns everything; there's no per-user scoping and no PII here.
  app.get("/api/project-coordinates", async (_req: Request, res: Response) => {
    if (!supabaseAdmin) return res.json([]);
    const { data, error } = await supabaseAdmin
      .from("project_coordinates")
      .select("project_name,latitude,longitude,address_line");
    if (error) return res.status(500).json({ message: error.message });
    res.json(data ?? []);
  });

  // Admin single-project lookup for form prefill. Returns null if not yet
  // set, so the form knows to show the picker instead of the "already set"
  // indicator.
  app.get(
    "/api/admin/project-coordinates/:name",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const name = decodeURIComponent(String(req.params.name)).trim();
      if (!name) return res.json(null);
      const { data, error } = await supabaseAdmin
        .from("project_coordinates")
        .select("project_name,latitude,longitude,address_line")
        .eq("project_name", name)
        .maybeSingle();
      if (error) return res.status(500).json({ message: error.message });
      res.json(data ?? null);
    },
  );

  // Admin upsert — idempotent. Runs when the admin drops a pin in the
  // listing form. project_name is the natural key.
  app.put(
    "/api/admin/project-coordinates",
    strictLimiter,
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: "Supabase not configured" });
      }
      const parsed = upsertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload" });
      }
      const { data, error } = await supabaseAdmin
        .from("project_coordinates")
        .upsert(
          {
            ...parsed.data,
            address_line: parsed.data.address_line ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "project_name" },
        )
        .select()
        .single();
      if (error) return res.status(400).json({ message: error.message });
      res.json(data);
    },
  );
}
