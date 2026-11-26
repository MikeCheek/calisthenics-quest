"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { scheduleDailyReminder } from "@/lib/notifications";
import { enablePush } from "@/lib/pushClient";
import { useLanguage } from "@/context/LanguageContext";

// Daily reminders. With push set up (pushClient.ts), the server sends them,
// even with the app closed — this just keeps the device's token fresh (FCM
// rotates them) and its time zone current. Without push, a local timer
// reminds you while the app has been open recently.
export default function ReminderScheduler() {
  const { userDoc } = useAuth();
  const uid = userDoc?.uid;
  const enabled = userDoc?.notifications?.enabled;
  const time = userDoc?.notifications?.time;
  const [push, setPush] = useState<boolean | null>(null);
  const { tx } = useLanguage();
  // the latest profile, read when the reminder fires (for a line about your sport)
  const latest = useRef(userDoc);
  latest.current = userDoc;

  useEffect(() => {
    if (!uid || !enabled) return;
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;
    let cancelled = false;
    enablePush(uid).then((on) => !cancelled && setPush(on));
    return () => {
      cancelled = true;
    };
  }, [uid, enabled]);

  useEffect(() => {
    if (!enabled || !time || push !== false) return; // undecided yet, or push handles it
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    return scheduleDailyReminder(time, (s, vars) => tx(s, vars), () => latest.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, time, push]);

  return null;
}
