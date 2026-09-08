import { buildApiUrl, getAuthToken } from "./authSession";

/**
 * Thin wrapper around fetch for calls to your .NET Web API.
 * On a 401 (session expired / invalid token), it redirects to /login
 * instead of letting every caller handle that case separately.
 *
 * Usage:
 *   const res = await authFetch("/api/sales/invoices");
 *   const data = await res.json();
 *
 * Swap NEXT_PUBLIC_API_BASE_URL for wherever your Web API is hosted,
 * and adjust the auth header below to match how you're storing the
 * token (cookie-based auth won't need the Authorization header at all).
 */
export async function authFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = buildApiUrl(input);
  const token = getAuthToken();

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    credentials: "include", // send auth cookie if you're using cookie-based sessions
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    const next = encodeURIComponent(window.location.pathname);
    window.location.href = new URL(`/login?next=${next}`, window.location.origin).toString();
  }

  return res;
}
