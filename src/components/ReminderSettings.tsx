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

export default function ReminderSettings() {
  const { userDoc, refreshUserDoc } = useAuth();
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
        return;
      }
    }
    setPermissionDenied(false);
    setSaving(true);
    await updateProgress(userDoc.uid, { notifications: { ...prefs, enabled: !prefs.enabled } });
    await refreshUserDoc();
    setSaving(false);
  };

  const changeTime = async (time: string) => {
    setSaving(true);
    await updateProgress(userDoc.uid, { notifications: { ...prefs, time } });
    await refreshUserDoc();
    setSaving(false);
  };

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="heading text-base text-zinc-100 flex items-center gap-2">
          {prefs.enabled ? <Bell size={16} className="text-orange-400" /> : <BellOff size={16} className="text-zinc-500" />}
          Training reminders
        </div>
        <button
          onClick={toggle}
          disabled={saving || !supported}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            prefs.enabled ? "bg-orange-500" : "bg-zinc-700"
          } disabled:opacity-50`}
          aria-label="Toggle training reminders"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-zinc-950 transition-transform ${
              prefs.enabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {!supported && (
        <p className="text-xs text-zinc-500">Notifications aren&apos;t supported in this browser.</p>
      )}
      {permissionDenied && (
        <p className="text-xs text-orange-400">
          Notification permission was denied — enable it in your browser/site settings to turn this on.
        </p>
      )}

      {supported && (
        <div className="mt-2 space-y-3">
          <p className="text-xs text-zinc-500">
            A different fun nudge every time, Duolingo-style — only fires while the app has been
            opened recently (see the README for guaranteed background push via Firebase Cloud Messaging).
          </p>
          <label className="flex items-center justify-between text-sm text-zinc-300">
            Remind me at
            <input
              type="time"
              value={prefs.time}
              onChange={(e) => changeTime(e.target.value)}
              disabled={!prefs.enabled || saving}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-100 stat-mono disabled:opacity-50"
            />
          </label>
          <button
            onClick={() => fireTrainingReminder()}
            disabled={typeof window !== "undefined" && Notification.permission !== "granted"}
            className="w-full py-2 rounded-lg text-sm border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 disabled:opacity-50"
          >
            Send me a test reminder now
          </button>
        </div>
      )}
    </div>
  );
}
