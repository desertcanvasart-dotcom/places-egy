// Admin password is validated server-side; we keep it in sessionStorage purely
// so the user doesn't re-enter it on every action. The server is the source of
// truth via the x-admin-password header.
export function getAdminPassword(): string | null {
  return sessionStorage.getItem("admin_password");
}

// fetch() wrapper that attaches the admin password header and throws on non-2xx
// with the server's error message. Shared by the dashboard listings manager and
// the deals manager.
export async function adminFetch(path: string, init: RequestInit = {}) {
  const password = getAdminPassword();
  const headers = new Headers(init.headers);
  if (password) headers.set("x-admin-password", password);
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}
