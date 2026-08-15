// Client helpers for the project_coordinates lookup table. One shape used
// both by public consumers (homepage map, /listings map) and by the admin
// listing form (to check if a project already has coords + save new ones).

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

// Admin lookup for one project by name. Returns null if not yet set.
export async function fetchProjectCoord(
  projectName: string,
): Promise<ProjectCoord | null> {
  if (!projectName.trim()) return null;
  const res = await fetch(
    `/api/admin/project-coordinates/${encodeURIComponent(projectName.trim())}`,
    { credentials: "include" },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as ProjectCoord | null;
  return data;
}

// Admin upsert — used by the pin picker inside the listing edit form.
export async function saveProjectCoord(
  input: ProjectCoord,
): Promise<ProjectCoord> {
  const res = await fetch("/api/admin/project-coordinates", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return (await res.json()) as ProjectCoord;
}
