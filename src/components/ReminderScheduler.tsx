"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { scheduleDailyReminder } from "@/lib/notifications";

export default function ReminderScheduler() {
  const { userDoc } = useAuth();
  const enabled = userDoc?.notifications?.enabled;
  const time = userDoc?.notifications?.time;

  useEffect(() => {
    if (!enabled || !time) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const cancel = scheduleDailyReminder(time);
    return cancel;
  }, [enabled, time]);

  return null;
}
