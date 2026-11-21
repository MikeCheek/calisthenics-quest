"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CoolDownFlow, useCoolDown } from "./CoolDown";
import type { DoneExercise } from "@/lib/stretching";

// The cool-down button on guided mode's "Session complete!" screen. Loaded
// only when that screen shows, so the stretching code isn't part of every
// page's first load.
export default function SessionCoolDown({ exercises }: { exercises: DoneExercise[] }) {
  const { tx } = useLanguage();
  const plan = useCoolDown(exercises);
  const [open, setOpen] = useState(false);
  if (!plan) return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full max-w-xs mt-2 py-3 rounded-lg border border-sky-500/60 text-sky-200 hover:bg-sky-500/10 text-sm"
      >
        {tx("Cool-down stretches · ~{n} min", { n: plan.minutes })}
      </button>
      <CoolDownFlow plan={plan} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
