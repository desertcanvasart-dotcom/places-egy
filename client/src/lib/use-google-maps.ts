import { useEffect, useState } from "react";

// Loader for the Google Maps JS SDK. Loads the "places" library — used by the
// admin pin-drop's autocomplete search box. Only one <script> tag is ever
// added, even across multiple hook consumers.
//
// The API key comes from Vite build-time env (VITE_GOOGLE_MAPS_API_KEY).
// Domain restriction on the key itself (set in Google Cloud Console) is what
// makes it safe to ship in the client bundle.

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;
  if (typeof window === "undefined") return Promise.resolve();
  // Already loaded (returning-user cache).
  if ((window as unknown as { google?: { maps?: unknown } }).google?.maps) {
    return Promise.resolve();
  }
  if (!API_KEY) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not set"));
  }
  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      API_KEY,
    )}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Maps SDK"));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export function useGoogleMaps(): { loaded: boolean; error: Error | null } {
  const [loaded, setLoaded] = useState(
    typeof window !== "undefined" &&
      Boolean(
        (window as unknown as { google?: { maps?: unknown } }).google?.maps,
      ),
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (loaded) return;
    loadGoogleMaps()
      .then(() => setLoaded(true))
      .catch((e: Error) => setError(e));
  }, [loaded]);

  return { loaded, error };
}
