"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateProgress } from "@/lib/store";

// Settings: ask which bar park you're at before a session, to log it there.
export default function AskParkToggle() {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const [busy, setBusy] = useState(false);
  if (!userDoc) return null;
  const on = userDoc.askPark !== false;
  const toggle = async () => {
    setBusy(true);
    await updateProgress(userDoc.uid, { askPark: !on }).catch(() => {});
    await refreshUserDoc();
    setBusy(false);
  };
  return (
    <section className="panel p-4">
      <button role="switch" aria-checked={on} disabled={busy} onClick={toggle} className="w-full flex items-center gap-3 text-left">
        <MapPin size={20} className="text-orange-400 shrink-0" />
        <span className="flex-1">
          <span className="block heading text-base text-zinc-100">{tx("Ask which park I'm at")}</span>
          <span className="block text-sm text-zinc-400">{tx("Before a session, pick the bar park you're training at to log it there.")}</span>
        </span>
        <span className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${on ? "bg-orange-500" : "bg-zinc-600"}`} aria-hidden="true">
          <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
        </span>
      </button>
    </section>
  );
}
