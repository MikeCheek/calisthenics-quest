"use client";

import Link from "next/link";
import { TrainingSession } from "@/lib/types";
import { estimateSessionMinutes } from "@/lib/exerciseTiming";
import { useLanguage } from "@/context/LanguageContext";
import { Play, Clock, Sparkles, ChevronRight, BadgeCheck, CheckCircle2, Dices, RotateCcw } from "lucide-react";
import { localizeDetail } from "@/lib/i18n/detail";

const PREVIEW = 5;

// The hero of the Today screen: the session itself, startable in one tap.
export default function TodaySessionCard({
  session,
  focusLabel,
  inProgress,
  doneToday,
  lighterBy = 0,
  onStart,
  onResume,
}: {
  session: TrainingSession;
  focusLabel: string;
  inProgress: boolean;
  doneToday: boolean;
  lighterBy?: number; // % trimmed to fit recent energy (effort.ts)
  onStart: () => void;
  onResume: () => void;
}) {
  const { tx, locale } = useLanguage();
  // warm-up and finisher are always there; the preview shows what's specific to today
  const main = session.sets.filter((s) => s.track !== "warmup" && s.track !== "finisher");
  const exercises = main.flatMap((s) => s.exercises.map((e) => ({ name: e.name, detail: e.detail, check: s.track === "skillCheck" })));
  const shown = exercises.slice(0, PREVIEW);
  const total = session.sets.reduce((n, s) => n + s.exercises.length, 0);
  const minutes = estimateSessionMinutes(session);

  if (doneToday && !inProgress) {
    return (
      <section className="panel p-5 border-emerald-700/60 bg-gradient-to-br from-emerald-600/10 to-transparent">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={26} className="text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="heading text-xl text-zinc-100">{tx("Done for today")}</div>
            <p className="text-sm text-zinc-400 mt-0.5">{tx("Rest is part of the plan — your next session adapts to what you just did.")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Link
            href="/wheel"
            className="py-2.5 rounded-xl text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 font-medium flex items-center justify-center gap-1.5"
          >
            <Dices size={15} /> {tx("Bonus wheel")}
          </Link>
          <button
            onClick={onStart}
            className="py-2.5 rounded-xl text-sm border border-zinc-700 text-zinc-300 hover:border-zinc-500 flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={14} /> {tx("Train again")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel p-5 border-orange-500/40 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
      <div className="flex items-center justify-between gap-2 text-xs text-muted uppercase tracking-wide">
        <span>{tx("Today's session")}</span>
        <Link href="/training" className="normal-case tracking-normal text-zinc-400 hover:text-orange-400">
          {tx("Change focus")}
        </Link>
      </div>
      <h2 className="heading text-3xl text-zinc-100 mt-1">{tx(focusLabel)}</h2>
      <div className="flex items-center gap-3 mt-1 text-sm">
        <span className="text-zinc-400 flex items-center gap-1">
          <Clock size={13} /> {tx("~{n} min", { n: minutes })}
        </span>
        <span className="stat-mono text-orange-400 flex items-center gap-1">
          <Sparkles size={13} /> +{session.estXp} XP
        </span>
      </div>

      {lighterBy > 0 && (
        <p className="text-xs text-sky-400/90 mt-2">
          {tx("About {n}% lighter today — matched to the effort you've had energy for in recent sessions.", { n: lighterBy })}
        </p>
      )}

      <ol className="mt-4 space-y-2">
        {shown.map((e, i) => (
          <li key={i} className="flex items-baseline gap-2.5">
            <span className="stat-mono text-xs text-muted w-4 shrink-0 text-right">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="text-sm text-zinc-100 flex items-center gap-1.5">
                {e.check && <BadgeCheck size={14} className="text-sky-400 shrink-0" aria-label={tx("Skill Check")} />}
                <span className="truncate">{e.name}</span>
              </span>
              <span className="block text-xs text-muted">{localizeDetail(e.detail, locale)}</span>
            </span>
          </li>
        ))}
      </ol>
      <Link href="/training" className="mt-3 text-xs text-zinc-400 hover:text-orange-400 flex items-center gap-0.5">
        {total > shown.length
          ? tx("All {n} exercises, with warm-up and finisher", { n: total })
          : tx("See the full session")}
        <ChevronRight size={13} />
      </Link>

      <button
        onClick={inProgress ? onResume : onStart}
        className="w-full mt-4 py-3.5 rounded-xl heading text-base tracking-wide bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
      >
        <Play size={17} /> {inProgress ? tx("Resume session") : tx("Start session")}
      </button>
    </section>
  );
}
