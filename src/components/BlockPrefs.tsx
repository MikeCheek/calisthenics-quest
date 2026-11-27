"use client";

import { useState } from "react";
import { Scissors } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateProgress } from "@/lib/store";
import { blockToAsk, type Block, type BlockPrefs } from "@/lib/trainingHabits";

async function save(uid: string, prefs: BlockPrefs | undefined, block: Block, value: "short" | "keep") {
  const next: BlockPrefs = { ...(prefs ?? {}), [block]: value, at: { ...(prefs?.at ?? {}), [block]: new Date().toISOString() } };
  await updateProgress(uid, { blockPrefs: next }).catch(() => {});
}

// Today: asked once when you keep leaving a block out (trainingHabits.ts)
export function BlockQuestion() {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const [busy, setBusy] = useState(false);
  if (!userDoc) return null;
  const block = blockToAsk(userDoc.blockLog, userDoc.blockPrefs);
  if (!block) return null;
  const answer = async (v: "short" | "keep") => {
    setBusy(true);
    await save(userDoc.uid, userDoc.blockPrefs, block, v);
    await refreshUserDoc();
    setBusy(false);
  };
  return (
    <section className="panel p-3 text-sm" data-testid="block-question">
      <p className="text-zinc-200 flex items-start gap-2">
        <Scissors size={15} className="text-orange-400 shrink-0 mt-0.5" aria-hidden />
        {tx(block === "finisher" ? "You've skipped the finisher in most recent sessions. Leave it out from now on?" : "You've cut the warm-up short in most recent sessions. Keep it to two exercises?")}
      </p>
      <div className="flex gap-2 mt-2">
        <button disabled={busy} onClick={() => answer("short")} className="flex-1 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm">
          {tx(block === "finisher" ? "Leave it out" : "Shorten it")}
        </button>
        <button disabled={busy} onClick={() => answer("keep")} className="flex-1 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 text-sm">
          {tx("Keep it")}
        </button>
      </div>
    </section>
  );
}

// Settings: the same choices, any time
export function BlockSettings() {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const [busy, setBusy] = useState(false);
  if (!userDoc) return null;
  const prefs = userDoc.blockPrefs;
  const row = (block: Block, label: string, hint: string) => {
    const on = prefs?.[block] === "short";
    const toggle = async () => {
      setBusy(true);
      await save(userDoc.uid, prefs, block, on ? "keep" : "short");
      await refreshUserDoc();
      setBusy(false);
    };
    return (
      <button role="switch" aria-checked={on} disabled={busy} onClick={toggle} className="w-full flex items-center gap-3 text-left">
        <span className="flex-1">
          <span className="block text-sm text-zinc-100">{tx(label)}</span>
          <span className="block text-xs text-zinc-400">{tx(hint)}</span>
        </span>
        <span className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${on ? "bg-orange-500" : "bg-zinc-600"}`} aria-hidden="true">
          <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
        </span>
      </button>
    );
  };
  return (
    <section className="panel p-4 space-y-3">
      <h2 className="heading text-base text-zinc-100 flex items-center gap-2">
        <Scissors size={16} className="text-orange-400" aria-hidden /> {tx("Session blocks")}
      </h2>
      {row("warmup", "Short warm-up", "Two warm-up exercises instead of the full warm-up.")}
      {row("finisher", "No finisher", "Leave out the finisher (a cool-down keeps one stretch).")}
    </section>
  );
}
