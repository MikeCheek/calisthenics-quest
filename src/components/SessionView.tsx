"use client";

import { useState } from "react";
import { TrainingSession, TrainingEquipment, Exercise } from "@/lib/types";
import { adjustDetail } from "@/lib/exerciseTiming";
import { findEasierExercise } from "@/lib/exerciseLookup";
import ExerciseRow from "@/components/ExerciseRow";
import { Play } from "lucide-react";

const SESSION_DELTA_OPTIONS: { value: -1 | 0 | 1; label: string }[] = [
  { value: -1, label: "Too advanced" },
  { value: 0, label: "Feels right" },
  { value: 1, label: "Too easy" },
];

export default function SessionView({
  session,
  equipment,
  onComplete,
  completed,
  onStartFocusMode,
}: {
  session: TrainingSession;
  equipment?: TrainingEquipment;
  onComplete?: () => void;
  completed?: boolean;
  onStartFocusMode?: () => void;
}) {
  const totalExercises = session.sets.reduce((n, s) => n + s.exercises.length, 0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [openTimers, setOpenTimers] = useState<Set<string>>(new Set());
  const [individualDelta, setIndividualDelta] = useState<Record<string, number>>({});
  const [sessionDelta, setSessionDelta] = useState<-1 | 0 | 1>(0);
  const [overrides, setOverrides] = useState<Record<string, Exercise>>({});
  const [swapNotice, setSwapNotice] = useState<string | null>(null);

  const toggleDone = (key: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleTimer = (key: string) => {
    setOpenTimers((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const bump = (key: string, delta: number) => {
    setIndividualDelta((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + delta }));
  };

  const resetAdjust = (key: string) => {
    setIndividualDelta((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const swapForEasier = (key: string, currentExercise: Exercise) => {
    const easier = findEasierExercise(currentExercise.name, equipment ?? DEFAULT_LOOKUP_EQUIPMENT);
    if (!easier) {
      setSwapNotice(`No easier variation found for ${currentExercise.name} — try adjusting reps instead.`);
      setTimeout(() => setSwapNotice(null), 3500);
      return;
    }
    setOverrides((prev) => ({ ...prev, [key]: easier }));
    // the old exercise's per-row adjustment doesn't carry over to a
    // different exercise's own baseline
    resetAdjust(key);
  };

  const allDone = done.size >= totalExercises;

  return (
    <div className="panel rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          {session.partnerLabel && (
            <div className="text-xs text-orange-400 stat-mono mb-0.5">{session.partnerLabel}</div>
          )}
          <div className="heading text-2xl text-zinc-100">{session.focusLabel}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-400">Est. reward</div>
          <div className="stat-mono text-orange-400">+{session.estXp} XP</div>
        </div>
      </div>

      {onStartFocusMode && (
        <button
          onClick={onStartFocusMode}
          className="w-full mt-3 py-2.5 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center gap-2"
        >
          <Play size={15} /> Start Training
        </button>
      )}

      <div className="mt-3">
        <div className="text-xs text-zinc-500 mb-1.5">How does today&apos;s session feel overall?</div>
        <div className="flex gap-1.5">
          {SESSION_DELTA_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSessionDelta(opt.value)}
              className={`flex-1 py-1.5 rounded-lg text-xs border ${
                sessionDelta === opt.value
                  ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {sessionDelta !== 0 && (
          <p className="text-xs text-zinc-500 mt-1.5">
            Every exercise below is adjusted {sessionDelta > 0 ? "up" : "down"} a set — nudge any
            single one further with its own +/- or a swipe.
          </p>
        )}
      </div>

      <p className="text-xs text-zinc-500 mt-2">
        Drag an exercise left or right for a quick easier/harder adjustment, or use the buttons.
      </p>
      {swapNotice && <div className="text-xs text-orange-400 mt-2 panel px-3 py-2">{swapNotice}</div>}

      <div className="space-y-5 mt-4">
        {session.sets.map((set) => (
          <div key={set.title}>
            <div className="text-sm uppercase tracking-wide text-emerald-400 mb-2">{set.title}</div>
            <ul className="space-y-2">
              {set.exercises.map((originalEx, i) => {
                const key = `${set.title}-${i}`;
                const effectiveExercise = overrides[key] ?? originalEx;
                const totalDelta = sessionDelta + (individualDelta[key] ?? 0);
                const displayedDetail = adjustDetail(effectiveExercise.detail, totalDelta);
                return (
                  <ExerciseRow
                    key={key}
                    exercise={effectiveExercise}
                    displayedDetail={displayedDetail}
                    isAdjusted={totalDelta !== 0}
                    isSwapped={key in overrides}
                    isDone={done.has(key)}
                    timerOpen={openTimers.has(key)}
                    trackLabel={session.focusLabel}
                    onToggleDone={() => toggleDone(key)}
                    onToggleTimer={() => toggleTimer(key)}
                    onBump={(delta) => bump(key, delta)}
                    onResetAdjust={() => resetAdjust(key)}
                    onCantDo={() => swapForEasier(key, effectiveExercise)}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {onComplete && (
        <button
          disabled={completed}
          onClick={onComplete}
          className={`mt-5 w-full py-2.5 rounded-lg heading tracking-wide text-sm ${
            completed
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : allDone
              ? "bg-orange-500 hover:bg-orange-400 text-zinc-950"
              : "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          }`}
        >
          {completed ? "Session Logged" : allDone ? "Complete Session — Claim XP" : "Mark Complete Anyway"}
        </button>
      )}
    </div>
  );
}

const DEFAULT_LOOKUP_EQUIPMENT: TrainingEquipment = {
  pullUpBar: true, parallelBars: true, rings: true, wallSpace: true,
  verticalPole: true, monkeyBars: true, weights: true, resistanceBands: true,
};
