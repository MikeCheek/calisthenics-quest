"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { HabitualLength } from "@/lib/sessionLength";

// "Planned for ~40 min": today's session follows how much of your sessions
// you usually get through (sessionLength.ts) — one tap for the full length.
export default function UsualLengthNote({ usual, onFull, className = "" }: { usual: HabitualLength | null; onFull: () => void; className?: string }) {
  const { tx } = useLanguage();
  if (!usual?.shorter) return null;
  return (
    <p className={`text-xs text-sky-400/90 ${className}`} data-testid="usual-length">
      {tx("Planned for ~{n} min — about how much of your {m} min sessions you usually get through, key work first.", { n: usual.minutes, m: usual.chosen })}{" "}
      <button type="button" onClick={onFull} className="text-orange-400 underline underline-offset-2">
        {tx("Use the full {m} min", { m: usual.chosen })}
      </button>
    </p>
  );
}
