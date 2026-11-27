"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateProgress } from "@/lib/store";
import { lighterDay, LIGHTER_DAYS, type LighterWeek, type Readiness } from "@/lib/readiness";

const CHOICES: { r: Readiness; emoji: string; label: string }[] = [
  { r: "tired", emoji: "😴", label: "Tired" },
  { r: "ok", emoji: "🙂", label: "OK" },
  { r: "strong", emoji: "💪", label: "Strong" },
];

// Before starting: a running lighter week, and one tap for how you feel
// today (readiness.ts). Both change today's session on the spot.
export default function TodayReadiness({
  readiness,
  onReadiness,
  lighterWeek,
  className = "",
}: {
  readiness: Readiness | null;
  onReadiness: (r: Readiness | null) => void;
  lighterWeek: LighterWeek | null;
  className?: string;
}) {
  const { tx } = useLanguage();
  const { userDoc, refreshUserDoc } = useAuth();
  const endLighter = async () => {
    if (!userDoc) return;
    await updateProgress(userDoc.uid, { lighterWeek: { sessions: 0 } }).catch(() => {});
    await refreshUserDoc();
  };
  return (
    <div className={`space-y-2 ${className}`}>
      {lighterWeek?.from && (
        <div className="text-xs text-sky-300 rounded-lg border border-sky-700/50 bg-sky-500/10 px-3 py-2" data-testid="lighter-week">
          <span className="font-medium">{tx("Lighter week — day {n} of {m}.", { n: lighterDay(lighterWeek as LighterWeek & { from: string }), m: LIGHTER_DAYS })}</span>{" "}
          {tx(lighterWeek.why === "due" ? "Many sessions since the last one: about 60% of the usual sets, skill checks at the end of the week." : "Your recent sessions say you're tired: about 60% of the usual sets, skill checks at the end of the week.")}{" "}
          <button type="button" onClick={endLighter} className="text-orange-400 underline underline-offset-2">
            {tx("Train full instead")}
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label={tx("How do you feel today?")}>
        <span className="text-xs text-zinc-400">{tx("How do you feel today?")}</span>
        {CHOICES.map((c) => (
          <button
            key={c.r}
            type="button"
            aria-pressed={readiness === c.r}
            onClick={() => onReadiness(readiness === c.r ? null : c.r)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              readiness === c.r ? "border-orange-500 bg-orange-500/15 text-orange-300" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            <span aria-hidden>{c.emoji}</span> {tx(c.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
