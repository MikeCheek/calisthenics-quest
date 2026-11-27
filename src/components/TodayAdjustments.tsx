"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateProgress } from "@/lib/store";
import { lighterDay, LIGHTER_DAYS, type LighterWeek } from "@/lib/readiness";
import type { HabitualLength } from "@/lib/sessionLength";

interface Reason {
  short: string; // for the one-line summary
  text: string;
  action?: { label: string; onClick: () => void };
  testId?: string;
}

// Everything that changed today's session from the plain plan, in one line
// that opens to the reasons (and what you can do about each) — instead of a
// stack of notes above the session.
export default function TodayAdjustments({
  why,
  lighterBy = 0,
  usualLength = null,
  onFullLength,
  lighterWeek = null,
  adapted = 0,
  fittedTo,
  className = "",
}: {
  why?: string; // a focus moved for recovery (muscleLoad.ts)
  lighterBy?: number; // % trimmed to recent energy (effort.ts)
  usualLength?: HabitualLength | null;
  onFullLength?: () => void;
  lighterWeek?: LighterWeek | null;
  adapted?: number; // exercises adapted from your history
  fittedTo?: { minutes: number; was: number }; // trimmed or extended to your session length
  className?: string;
}) {
  const { tx } = useLanguage();
  const { userDoc, refreshUserDoc } = useAuth();
  const [open, setOpen] = useState(false);

  const reasons: Reason[] = [];
  if (why) reasons.push({ short: tx("focus moved"), text: tx(why), testId: "session-why" });
  if (lighterWeek?.from)
    reasons.push({
      short: tx("lighter week"),
      text: `${tx("Lighter week — day {n} of {m}.", { n: lighterDay(lighterWeek as LighterWeek & { from: string }), m: LIGHTER_DAYS })} ${tx(
        lighterWeek.why === "due"
          ? "Many sessions since the last one: about 60% of the usual sets, skill checks at the end of the week."
          : "Your recent sessions say you're tired: about 60% of the usual sets, skill checks at the end of the week."
      )}`,
      action: userDoc
        ? {
            label: tx("Train full instead"),
            onClick: async () => {
              await updateProgress(userDoc.uid, { lighterWeek: { sessions: 0 } }).catch(() => {});
              await refreshUserDoc();
            },
          }
        : undefined,
      testId: "lighter-week",
    });
  if (lighterBy > 0)
    reasons.push({ short: tx("{n}% lighter", { n: lighterBy }), text: tx("About {n}% lighter today — matched to the effort you've had energy for in recent sessions.", { n: lighterBy }) });
  if (usualLength?.shorter && onFullLength)
    reasons.push({
      short: tx("~{n} min", { n: usualLength.minutes }),
      text: tx("Planned for ~{n} min — about how much of your {m} min sessions you usually get through, key work first.", { n: usualLength.minutes, m: usualLength.chosen }),
      action: { label: tx("Use the full {m} min", { m: usualLength.chosen }), onClick: onFullLength },
      testId: "usual-length",
    });
  else if (fittedTo)
    reasons.push({ short: tx("fitted to {n} min", { n: fittedTo.minutes }), text: tx("Fitted to your {n} min sessions (was ~{m} min).", { n: fittedTo.minutes, m: fittedTo.was }) });
  if (adapted > 0)
    reasons.push({ short: tx("{n} adapted", { n: adapted }), text: tx("{n} adapted from your recent sessions — based on what you completed, skipped or found too hard.", { n: adapted }) });

  if (!reasons.length) return null;
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full min-h-11 -my-1.5 flex items-center gap-1.5 text-left text-xs text-sky-300 hover:text-sky-200"
      >
        <Sparkles size={13} className="shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="font-medium">{tx("Adjusted for today")}</span>
          <span className="text-sky-300/80"> · {reasons.map((r) => r.short).join(" · ")}</span>
        </span>
        <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul className="mt-1.5 space-y-2 rounded-lg border border-sky-800/50 bg-sky-500/5 p-3">
          {reasons.map((r) => (
            <li key={r.short} className="text-xs text-zinc-300" data-testid={r.testId}>
              {r.text}
              {r.action && (
                <>
                  {" "}
                  <button type="button" onClick={r.action.onClick} className="text-orange-400 underline underline-offset-2 py-1">
                    {r.action.label}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
