// ---------------------------------------------------------------------------
// Keeping a training session present while you're not looking at the app.
//
// - Screen wake lock: the screen stays on while guided mode is open, so the
//   phone doesn't lock (and pause the page) mid-set. Browsers release it
//   when you leave the app; it's taken again when you come back.
// - A "training in progress" notification while the app is in the
//   background: the current exercise, the set, and when the rest ends. It
//   shows an end time rather than a ticking countdown — a web page can't
//   run in the background reliably, so a live countdown would freeze.
//   Needs notification permission; on iPhone only for the installed app
//   (iOS 16.4+).
// ---------------------------------------------------------------------------

const TAG = "barquests-training";

type WakeLockSentinelLike = { release: () => Promise<void>; released?: boolean };
let wakeLock: WakeLockSentinelLike | null = null;

export function wakeLockSupported(): boolean {
  return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

export async function keepScreenOn(): Promise<void> {
  if (!wakeLockSupported() || document.visibilityState !== "visible") return;
  if (wakeLock && !wakeLock.released) return;
  try {
    wakeLock = await (navigator as unknown as { wakeLock: { request: (t: "screen") => Promise<WakeLockSentinelLike> } }).wakeLock.request("screen");
  } catch {
    // denied (battery saver, unsupported) — training works, the screen may dim
  }
}

export async function letScreenSleep(): Promise<void> {
  try {
    await wakeLock?.release();
  } catch {
    // already released
  }
  wakeLock = null;
}

export interface TrainingNotice {
  title: string; // e.g. "Pull-ups · set 2 of 4"
  body: string; // e.g. "Rest until 18:42 · Up next: Dips"
}

function canNotify(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted" &&
    "serviceWorker" in navigator
  );
}

// Shows (or quietly replaces) the in-progress notification.
export async function showTrainingNotice(n: TrainingNotice): Promise<void> {
  if (!canNotify()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(n.title, {
      body: n.body,
      tag: TAG, // one notification, replaced as the session moves on
      silent: true,
      requireInteraction: true, // stays until you're back (where supported)
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: "/dashboard?resume=1" },
    } as NotificationOptions);
  } catch {
    // no notification this time; the session itself is unaffected
  }
}

export async function closeTrainingNotice(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const open = (await reg?.getNotifications({ tag: TAG })) ?? [];
    open.forEach((n) => n.close());
  } catch {
    // nothing to close
  }
}

// "18:42" in the athlete's locale
export function clockTime(at: number, locale: string): string {
  return new Date(at).toLocaleTimeString(locale === "it" ? "it-IT" : "en-GB", { hour: "2-digit", minute: "2-digit" });
}
