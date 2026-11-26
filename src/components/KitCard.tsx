"use client";

import { useState } from "react";
import Link from "next/link";
import { Backpack, Pencil, Trees } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateProgress } from "@/lib/store";
import { KIT_KEYS, SPOT_KEYS, type KitKey } from "@/lib/types";
import { KIT_LABEL, SPOT_LABEL } from "@/lib/equipmentLabels";

// Settings: the add-ons you own and bring along (they follow you to any
// park or home), and — separately — what your usual spot has. On any day
// Today's "Where today?" can switch to home or a specific park.
export default function KitCard() {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const [busy, setBusy] = useState<KitKey | null>(null);
  if (!userDoc) return null;
  const eq = userDoc.equipment;

  const toggle = async (k: KitKey) => {
    setBusy(k);
    await updateProgress(userDoc.uid, { equipment: { ...eq, [k]: !eq[k] } }).catch(() => {});
    await refreshUserDoc();
    setBusy(null);
  };
  const spot = SPOT_KEYS.filter((k) => eq[k]);

  return (
    <section className="panel p-4 space-y-4">
      <div>
        <h2 className="heading text-base text-zinc-100 flex items-center gap-2">
          <Backpack size={16} className="text-orange-400" /> {tx("Your kit")}
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">{tx("What you own and bring along. It comes with you to any park — and makes home sessions better.")}</p>
        <ul className="mt-3 space-y-1.5">
          {KIT_KEYS.map((k) => {
            const on = !!eq[k];
            const [label, hint] = KIT_LABEL[k];
            return (
              <li key={k}>
                <button role="switch" aria-checked={on} disabled={busy !== null} onClick={() => toggle(k)} className="w-full flex items-center gap-3 text-left py-1.5">
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-zinc-100">{tx(label)}</span>
                    <span className="block text-xs text-zinc-400">{tx(hint)}</span>
                  </span>
                  <span className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${on ? "bg-orange-500" : "bg-zinc-600"}`} aria-hidden="true">
                    <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm text-zinc-100 flex items-center gap-2">
            <Trees size={15} className="text-sky-300" /> {tx("Your usual spot")}
          </h3>
          <Link href="/onboarding?step=1&return=/profile?tab=settings" className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1">
            <Pencil size={12} /> {tx("Edit")}
          </Link>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          {spot.length ? spot.map((k) => tx(SPOT_LABEL[k])).join(" · ") : tx("Just the floor")}
        </p>
        <p className="text-xs text-zinc-400 mt-1">{tx("Bars and poles depend on the place: pick a park or “At home” on Today and the session follows.")}</p>
      </div>
    </section>
  );
}
