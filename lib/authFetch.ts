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
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const url = input.startsWith("http") ? input : `${baseUrl}${input}`;

  const res = await fetch(url, {
    ...init,
    credentials: "include", // send auth cookie if you're using cookie-based sessions
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (res.status === 401 && typeof window !== "undefined") {
    const next = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?next=${next}`;
  }

  return res;
}