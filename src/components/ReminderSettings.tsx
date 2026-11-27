"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProgress } from "@/lib/store";
import {
  notificationsSupported,
  requestNotificationPermission,
  fireTrainingReminder,
} from "@/lib/notifications";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { disablePush, enablePush } from "@/lib/pushClient";
import { habitHour, habitReminder } from "@/lib/trainingHabits";

export default function ReminderSettings() {
  const { userDoc, refreshUserDoc } = useAuth();
  const toast = useToast();
  const { tx } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  if (!userDoc) return null;
  const prefs = userDoc.notifications ?? { enabled: false, time: "18:00" };
  const supported = notificationsSupported();

  const toggle = async () => {
    if (!prefs.enabled) {
      const perm = await requestNotificationPermission();
      if (perm !== "granted") {
        setPermissionDenied(true);
        toast.warning("Notification permission was denied — enable it in your browser/site settings to turn this on.");
        return;
      }
    }
    setPermissionDenied(false);
    setSaving(true);
    await updateProgress(userDoc.uid, { notifications: { ...prefs, enabled: !prefs.enabled } });
    // push on this device: reminders and nudges even with the app closed
    if (!prefs.enabled) await enablePush(userDoc.uid);
    else await disablePush(userDoc.uid);
    await refreshUserDoc();
    setSaving(false);
  };

  const following = !prefs.timeSet && prefs.followHabit !== false;
  const usual = habitHour(userDoc.trainTimes);
  const follow = async () => {
    setSaving(true);
    const on = !following;
    await updateProgress(userDoc.uid, {
      notifications: { ...prefs, followHabit: on, timeSet: !on, ...(on && usual !== null ? { time: habitReminder(usual) } : {}) },
    });
    await refreshUserDoc();
    setSaving(false);
  };

  const changeTime = async (time: string) => {
    setSaving(true);
    // a time you set yourself stays put
    await updateProgress(userDoc.uid, { notifications: { ...prefs, time, timeSet: true, followHabit: false } });
    await refreshUserDoc();
    setSaving(false);
  };

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="heading text-base text-zinc-100 flex items-center gap-2">
          {prefs.enabled ? <Bell size={16} className="text-orange-400" /> : <BellOff size={16} className="text-muted" />}
          {tx("Training reminders")}
        </h2>
        <button
          onClick={toggle}
          disabled={saving || !supported}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            prefs.enabled ? "bg-orange-500" : "bg-zinc-700"
          } disabled:opacity-50`}
          aria-label={tx("Toggle training reminders")}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-zinc-950 transition-transform ${
              prefs.enabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {!supported && (
        <p className="text-xs text-muted">{tx("Notifications aren't supported in this browser.")}</p>
      )}
      {permissionDenied && (
        <p className="text-xs text-orange-400">
          {tx("Notification permission was denied — enable it in your browser/site settings to turn this on.")}
        </p>
      )}

      {supported && (
        <div className="mt-2 space-y-3">
          <p className="text-xs text-muted">
            {tx("A different fun nudge every time. Reminders only arrive if you've opened the app recently.")}
          </p>
          <label className="flex items-center justify-between text-sm text-zinc-300">
            {tx("Remind me at")}
            <input
              type="time"
              value={prefs.time}
              onChange={(e) => changeTime(e.target.value)}
              disabled={!prefs.enabled || saving}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-100 stat-mono disabled:opacity-50"
            />
          </label>
          <label className="flex items-start gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={following} onChange={follow} disabled={!prefs.enabled || saving} className="mt-1 accent-orange-500" />
            <span>
              {tx("Follow my usual training time")}
              <span className="block text-xs text-zinc-400">
                {usual !== null
                  ? tx("You usually start around {t} — reminded an hour before.", { t: `${String(usual).padStart(2, "0")}:00` })
                  : tx("Once you've trained a few times, the reminder moves to an hour before your usual time.")}
              </span>
            </span>
          </label>
          <button
            onClick={() => {
              fireTrainingReminder();
              toast.info("Test reminder sent — check your notifications.");
            }}
            disabled={typeof window !== "undefined" && Notification.permission !== "granted"}
            className="w-full py-2 rounded-lg text-sm border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 disabled:opacity-50"
          >
            {tx("Send me a test reminder now")}
          </button>
        </div>
      )}
    </div>
  );
}
