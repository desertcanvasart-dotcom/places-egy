import { adminFetch } from "@/lib/admin-fetch";

// Client helpers for the project_coordinates lookup table. One shape used
// both by public consumers (homepage map, /listings map) and by the admin
// listing form (to check if a project already has coords + save new ones).
// Admin endpoints go through adminFetch so the x-admin-password header is
// attached — otherwise requireAdmin returns 401 and saves silently fail.

export type ProjectCoord = {
  project_name: string;
  latitude: number;
  longitude: number;
  address_line?: string | null;
};

// Public GET — everything, unsecured, cheap. Cached at the React Query
// layer at call-sites.
export async function fetchAllProjectCoords(): Promise<ProjectCoord[]> {
  const res = await fetch("/api/project-coordinates");
  if (!res.ok) return [];
  return (await res.json()) as ProjectCoord[];
}

// Admin lookup for one project by name. Returns null if not yet set OR if
// the admin isn't logged in (adminFetch throws on 401 — swallow to keep
// the form usable even before auth completes).
export async function fetchProjectCoord(
  projectName: string,
): Promise<ProjectCoord | null> {
  if (!projectName.trim()) return null;
  try {
    return (await adminFetch(
      `/api/admin/project-coordinates/${encodeURIComponent(projectName.trim())}`,
    )) as ProjectCoord | null;
  } catch {
    return null;
  }
}

// Admin upsert — used by the pin picker inside the listing edit form.
// adminFetch handles auth header + throws with the server error message
// on any non-2xx, so the picker's saveState="error" surfaces the real cause.
export async function saveProjectCoord(
  input: ProjectCoord,
): Promise<ProjectCoord> {
  return (await adminFetch("/api/admin/project-coordinates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })) as ProjectCoord;
}
