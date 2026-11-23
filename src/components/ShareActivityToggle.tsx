"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { deleteMyFeed, updateProgress } from "@/lib/store";

// Settings: whether friends see your finished sessions in their feed.
// Turning it off also removes what's already there.
export default function ShareActivityToggle() {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const [busy, setBusy] = useState(false);
  if (!userDoc || !userDoc.friendCode) return null; // guests have no friends list
  const on = userDoc.shareActivity !== false;

  const toggle = async () => {
    setBusy(true);
    try {
      await updateProgress(userDoc.uid, { shareActivity: !on });
      if (on) await deleteMyFeed(userDoc.uid).catch(() => {});
      await refreshUserDoc();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel p-4">
      <button role="switch" aria-checked={on} disabled={busy} onClick={toggle} className="w-full flex items-center gap-3 text-left">
        <Activity size={20} className="text-orange-400 shrink-0" />
        <span className="flex-1">
          <span className="block heading text-base text-zinc-100">{tx("Share sessions with friends")}</span>
          <span className="block text-sm text-zinc-400">{tx("Friends see when you finish a session (focus, time, XP and new records) and can give kudos. Turning it off removes what they can see.")}</span>
        </span>
        <span className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${on ? "bg-orange-500" : "bg-zinc-600"}`} aria-hidden="true">
          <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
        </span>
      </button>
    </section>
  );
}
