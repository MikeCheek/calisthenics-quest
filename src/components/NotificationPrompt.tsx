"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { updateProgress } from "@/lib/store";
import { notificationsSupported, requestNotificationPermission } from "@/lib/notifications";
import { Bell, X } from "lucide-react";

export default function NotificationPrompt() {
  const { userDoc, refreshUserDoc } = useAuth();
  const toast = useToast();
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userDoc) return;
    // Only prompt if the athlete has never made a choice at all — enabling
    // it later from Profile, or having explicitly turned it off, both
    // count as "already decided" and shouldn't be asked again here.
    const alreadyDecided = userDoc.notifications !== undefined;
    if (alreadyDecided || !notificationsSupported()) return;
    if (Notification.permission !== "default") return;
    setVisible(true);
  }, [userDoc]);

  if (!userDoc || !visible) return null;

  const enable = async () => {
    setSaving(true);
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      await updateProgress(userDoc.uid, { notifications: { enabled: true, time: "18:00" } });
      await refreshUserDoc();
      toast.success("Notifications are on — you'll get training reminders and friend nudges.");
    } else {
      await updateProgress(userDoc.uid, { notifications: { enabled: false, time: "18:00" } });
      await refreshUserDoc();
    }
    setSaving(false);
    setVisible(false);
  };

  const dismiss = async () => {
    // Recorded as an explicit "not now" so this prompt doesn't reappear
    // every login — Profile > reminders is always there to turn it on later.
    await updateProgress(userDoc.uid, { notifications: { enabled: false, time: "18:00" } });
    await refreshUserDoc();
    setVisible(false);
  };

  return (
    <div className="panel p-4 border-orange-500/40 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
        <Bell size={16} className="text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-zinc-100 font-medium">Turn on notifications?</div>
        <p className="text-xs text-zinc-500 mt-0.5 mb-3">
          Get a daily training reminder and know right away when a friend nudges you or invites you
          to train together.
        </p>
        <div className="flex gap-2">
          <button
            onClick={enable}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 font-medium disabled:opacity-60"
          >
            Turn on
          </button>
          <button
            onClick={dismiss}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200"
          >
            Not now
          </button>
        </div>
      </div>
      <button onClick={dismiss} className="text-zinc-600 hover:text-zinc-400 shrink-0" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
