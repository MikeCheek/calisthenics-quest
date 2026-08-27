"use client";

import { useState } from "react";
import { TrainingSession } from "@/lib/types";
import { adjustDetail } from "@/lib/exerciseTiming";
import ExerciseRow from "@/components/ExerciseRow";
import { Play } from "lucide-react";

export default function SessionView({
  session,
  onComplete,
  completed,
  onStartFocusMode,
}: {
  session: TrainingSession;
  onComplete?: () => void;
  completed?: boolean;
  onStartFocusMode?: () => void;
}) {
  const totalExercises = session.sets.reduce((n, s) => n + s.exercises.length, 0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [openTimers, setOpenTimers] = useState<Set<string>>(new Set());
  const [adjustedDetails, setAdjustedDetails] = useState<Record<string, string>>({});

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

  const bump = (key: string, originalDetail: string, delta: number) => {
    setAdjustedDetails((prev) => ({
      ...prev,
      [key]: adjustDetail(prev[key] ?? originalDetail, delta),
    }));
  };

  const resetAdjust = (key: string) => {
    setAdjustedDetails((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
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
      <p className="text-xs text-zinc-500 mt-1.5">
        Drag an exercise left or right for a quick easier/harder adjustment, or use the buttons.
      </p>

      <div className="space-y-5 mt-4">
        {session.sets.map((set) => (
          <div key={set.title}>
            <div className="text-sm uppercase tracking-wide text-emerald-400 mb-2">{set.title}</div>
            <ul className="space-y-2">
              {set.exercises.map((ex, i) => {
                const key = `${set.title}-${i}`;
                const displayedDetail = adjustedDetails[key] ?? ex.detail;
                return (
                  <ExerciseRow
                    key={key}
                    exercise={ex}
                    displayedDetail={displayedDetail}
                    isAdjusted={key in adjustedDetails}
                    isDone={done.has(key)}
                    timerOpen={openTimers.has(key)}
                    trackLabel={session.focusLabel}
                    onToggleDone={() => toggleDone(key)}
                    onToggleTimer={() => toggleTimer(key)}
                    onBump={(delta) => bump(key, ex.detail, delta)}
                    onResetAdjust={() => resetAdjust(key)}
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
