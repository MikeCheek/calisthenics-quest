import { appCheck, auth } from "./firebase";
import { getToken as getAppCheckToken } from "firebase/app-check";
import { DEMO_MODE } from "./demoMode/flag";

// fetch() for the app's own server routes (AI, push): attaches the signed-in user's
// Firebase ID token so the server can check who's asking (see
// lib/server/aiGuard.ts). getIdToken() refreshes an expired token itself.
export async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  // demo mode answers locally; the inline NODE_ENV check drops this from production builds
  if (process.env.NODE_ENV === "development" && DEMO_MODE) {
    const { demoAiResponse } = await import("./demoMode/ai");
    await new Promise((r) => setTimeout(r, 600)); // feel like a request
    return demoAiResponse(url, typeof init.body === "string" ? JSON.parse(init.body) : {});
  }
  const headers = new Headers(init.headers);
  const token = await auth.currentUser?.getIdToken().catch(() => undefined);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // proves the request comes from the real app (server: lib/server/appCheck.ts)
  if (appCheck) {
    const ac = await getAppCheckToken(appCheck, false).catch(() => null);
    if (ac?.token) headers.set("X-Firebase-AppCheck", ac.token);
  }
  return fetch(url, { ...init, headers });
}
