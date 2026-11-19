import { auth } from "./firebase";

// fetch() for the app's own AI routes: attaches the signed-in user's
// Firebase ID token so the server can check who's asking (see
// lib/server/aiGuard.ts). getIdToken() refreshes an expired token itself.
export async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = await auth.currentUser?.getIdToken().catch(() => undefined);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}
