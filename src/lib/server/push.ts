import { accessToken, serviceAccount, ServiceAccount } from "./googleAuth";
import { FirestoreRest } from "./firestoreRest";

// ---------------------------------------------------------------------------
// Push messages through Firebase Cloud Messaging (HTTP v1), from the app's
// own server routes. Messages are data-only: the service worker (sw.js)
// shows them, so they look the same everywhere and aren't shown twice while
// the app is open. Tokens FCM reports as gone are removed from the user.
// ---------------------------------------------------------------------------

export interface PushData {
  title: string;
  body: string;
  url: string; // opened when the notification is tapped
  tag: string; // one notification per tag, replaced by newer ones
}

export type SendResult = "sent" | "gone" | "failed";

export async function sendToToken(sa: ServiceAccount, token: string, data: PushData, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  const res = await fetchImpl(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken(sa, fetchImpl)}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: { token, webpush: { headers: { Urgency: "high", TTL: "43200" }, data: { ...data } } },
    }),
  });
  if (res.ok) return "sent";
  const text = await res.text().catch(() => "");
  // the token was unregistered (app uninstalled, permission revoked, …)
  if (res.status === 404 || /UNREGISTERED|registration token/i.test(text)) return "gone";
  console.log("[push] send failed", res.status, text.slice(0, 300));
  return "failed";
}

export interface PushContext {
  sa: ServiceAccount;
  fs: FirestoreRest;
  fetchImpl?: typeof fetch;
}

export function pushContext(): PushContext | null {
  const sa = serviceAccount();
  if (!sa) return null;
  return { sa, fs: new FirestoreRest(sa.project_id, () => accessToken(sa)) };
}

// Sends to every device the user registered; returns how many got it.
export async function pushToUser(ctx: PushContext, uid: string, data: PushData, user?: Record<string, unknown> | null): Promise<number> {
  const doc = user ?? (await ctx.fs.get(`users/${uid}`));
  const tokens = Array.isArray(doc?.pushTokens) ? (doc!.pushTokens as unknown[]).filter((t): t is string => typeof t === "string") : [];
  if (!tokens.length) return 0;
  const results = await Promise.all(tokens.map((t) => sendToToken(ctx.sa, t, data, ctx.fetchImpl).catch(() => "failed" as const)));
  const gone = tokens.filter((_, i) => results[i] === "gone");
  if (gone.length) await ctx.fs.update(`users/${uid}`, { pushTokens: tokens.filter((t) => !gone.includes(t)) }).catch(() => {});
  return results.filter((r) => r === "sent").length;
}
