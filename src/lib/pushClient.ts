// firebase/messaging is loaded only when push is switched on or off, so it
// isn't part of every page
const messaging = () => import("firebase/messaging");
import { firebaseApp } from "./firebase";
import { addPushToken, removePushToken } from "./store";
import { authedFetch } from "./apiClient";
import { DEMO_MODE } from "./demoMode/flag";

// ---------------------------------------------------------------------------
// Push notifications on this device (Firebase Cloud Messaging): the device's
// token is saved to the athlete's account so the server can reach it with
// reminders, nudges and invites even when the app is closed. Our own
// service worker (public/sw.js) shows them. Needs the Web Push key
// (NEXT_PUBLIC_FIREBASE_VAPID_KEY) and notification permission; on iPhone,
// the app installed to the home screen (iOS 16.4+).
// ---------------------------------------------------------------------------

const VAPID = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const LOCAL_KEY = "barquests:pushToken";

export function pushConfigured(): boolean {
  return !!VAPID && !DEMO_MODE;
}

const timeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

// Registers this device. Safe to call again: the token is refreshed and the
// time zone kept current. Returns whether push is now on for this device.
export async function enablePush(uid: string): Promise<boolean> {
  if (!pushConfigured() || typeof window === "undefined" || Notification.permission !== "granted") return false;
  try {
    const { getMessaging, getToken, isSupported } = await messaging();
    if (!(await isSupported())) return false;
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(getMessaging(firebaseApp), { vapidKey: VAPID, serviceWorkerRegistration: registration });
    if (!token) return false;
    const previous = localStorage.getItem(LOCAL_KEY);
    await addPushToken(uid, token, timeZone());
    if (previous && previous !== token) await removePushToken(uid, previous).catch(() => {});
    localStorage.setItem(LOCAL_KEY, token);
    return true;
  } catch {
    return false; // blocked, unsupported, offline — local reminders still work
  }
}

// Stops pushes to this device (reminders off, or signing out).
export async function disablePush(uid: string): Promise<void> {
  try {
    const token = localStorage.getItem(LOCAL_KEY);
    if (!token) return;
    localStorage.removeItem(LOCAL_KEY);
    await removePushToken(uid, token).catch(() => {});
    if (pushConfigured()) {
      const { getMessaging, deleteToken, isSupported } = await messaging();
      if (await isSupported()) await deleteToken(getMessaging(firebaseApp)).catch(() => {});
    }
  } catch {
    // nothing registered
  }
}

export function pushActiveOnThisDevice(): boolean {
  try {
    return pushConfigured() && !!localStorage.getItem(LOCAL_KEY);
  } catch {
    return false;
  }
}

// Best-effort: the in-app ping is already written; this also reaches the
// friend's phone when their app is closed.
export function pushToFriend(
  toUid: string,
  kind: "nudge" | "pairing_invite" | "nudge_reply" | "kudos",
  extra: { pairingCode?: string; nudge?: { id: string; vars: Record<string, string | number> }; custom?: string; reply?: string } = {}
): void {
  if (!pushConfigured()) return;
  authedFetch("/api/push/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toUid, kind, ...extra }),
  }).catch(() => {});
}
