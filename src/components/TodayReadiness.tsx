"use client";

import { useId } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { Readiness } from "@/lib/readiness";

const CHOICES: { r: Readiness; emoji: string; label: string }[] = [
  { r: "tired", emoji: "😴", label: "Tired" },
  { r: "ok", emoji: "🙂", label: "OK" },
  { r: "strong", emoji: "💪", label: "Strong" },
];

// One tap before starting: how you feel today (readiness.ts) changes the
// session on the spot. A segmented control, one row, full-size targets.
export default function TodayReadiness({
  readiness,
  onReadiness,
  className = "",
}: {
  readiness: Readiness | null;
  onReadiness: (r: Readiness | null) => void;
  className?: string;
}) {
  const { tx } = useLanguage();
  const labelId = useId();
  return (
    <div className={className}>
      <p className="text-xs text-zinc-400 mb-1.5" id={labelId}>
        {tx("How do you feel today?")}
      </p>
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800" role="group" aria-labelledby={labelId}>
        {CHOICES.map((c) => (
          <button
            key={c.r}
            type="button"
            aria-pressed={readiness === c.r}
            onClick={() => onReadiness(readiness === c.r ? null : c.r)}
            className={`min-h-11 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors ${
              readiness === c.r ? "bg-orange-500/20 text-orange-200 ring-1 ring-orange-500/60" : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <span aria-hidden>{c.emoji}</span> {tx(c.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
