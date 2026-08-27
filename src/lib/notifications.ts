import { pickReminderLine } from "./reminderMessages";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

async function showNotification(title: string, body: string, tag: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        tag,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: { url: "/training" },
      });
      return;
    } catch {
      // fall through to plain Notification
    }
  }
  // eslint-disable-next-line no-new
  new Notification(title, { body, tag, icon: "/icons/icon-192.png" });
}

export async function fireTrainingReminder() {
  await showNotification("BarQuests", pickReminderLine(), "training-reminder");
}

export async function firePing(fromName: string, message: string) {
  await showNotification(`${fromName} is nudging you`, message, "friend-ping");
}

// Schedules the next daily reminder at the given "HH:MM" local time.
// Returns a cleanup function. This only fires while some tab/instance of the
// app is open (or, on platforms that keep the service worker alive briefly
// in the background, shortly after) — there's no server component here, so
// it can't wake a fully closed app. See README for the FCM-based alternative
// if you want guaranteed delivery when the app isn't running.
export function scheduleDailyReminder(time: string): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let cancelled = false;

  const scheduleNext = () => {
    if (cancelled) return;
    const [hh, mm] = time.split(":").map(Number);
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh || 0, mm || 0, 0, 0);
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
    const delay = next.getTime() - now.getTime();

    timeoutId = setTimeout(() => {
      fireTrainingReminder();
      scheduleNext();
    }, delay);
  };

  scheduleNext();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}
