"use client";

import { useState } from "react";
import { TrainingSession } from "@/lib/types";
import { adjustDetail } from "@/lib/exerciseTiming";
import ExerciseTimer from "@/components/ExerciseTimer";
import { Check, Clock, Play, Minus, Plus, RotateCcw } from "lucide-react";

export default function SessionView({
  session,
  onComplete,
  completed,
}: {
  session: TrainingSession;
  onComplete?: () => void;
  completed?: boolean;
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

      <div className="space-y-5 mt-4">
        {session.sets.map((set) => (
          <div key={set.title}>
            <div className="text-sm uppercase tracking-wide text-emerald-400 mb-2">{set.title}</div>
            <ul className="space-y-2">
              {set.exercises.map((ex, i) => {
                const key = `${set.title}-${i}`;
                const isDone = done.has(key);
                const timerOpen = openTimers.has(key);
                const displayedDetail = adjustedDetails[key] ?? ex.detail;
                const isAdjusted = key in adjustedDetails;
                const displayedExercise = { ...ex, detail: displayedDetail };

                return (
                  <li
                    key={key}
                    className={`p-2.5 rounded-lg border transition-colors ${
                      isDone ? "border-emerald-600 bg-emerald-600/10" : "border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleDone(key)}
                        className={`mt-0.5 w-5 h-5 shrink-0 rounded-lg border flex items-center justify-center ${
                          isDone ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"
                        }`}
                        aria-label={isDone ? "Mark not done" : "Mark done"}
                      >
                        {isDone && <Check size={14} className="text-zinc-950" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`text-sm font-medium ${isDone ? "text-zinc-400 line-through" : "text-zinc-100"}`}>
                            {ex.name}
                          </div>
                          {ex.restSeconds > 0 && (
                            <div className="text-xs text-zinc-500 flex items-center gap-1 shrink-0">
                              <Clock size={12} /> {ex.restSeconds}s
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {displayedDetail}
                          {isAdjusted && <span className="text-orange-400"> (adjusted)</span>}
                        </div>
                        {ex.cue && <div className="text-xs text-orange-400/80 italic">{ex.cue}</div>}

                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            onClick={() => toggleTimer(key)}
                            className="text-xs px-2 py-1 rounded-lg border border-zinc-600 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center gap-1"
                          >
                            <Play size={11} /> {timerOpen ? "Hide timer" : "Start"}
                          </button>
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => bump(key, ex.detail, -1)}
                              aria-label="Make easier"
                              className="w-6 h-6 rounded-lg border border-zinc-600 text-zinc-400 hover:text-zinc-100 hover:border-zinc-400 flex items-center justify-center"
                            >
                              <Minus size={11} />
                            </button>
                            {isAdjusted && (
                              <button
                                onClick={() => resetAdjust(key)}
                                aria-label="Reset to default"
                                className="w-6 h-6 rounded-lg border border-zinc-600 text-zinc-500 hover:text-orange-400 flex items-center justify-center"
                              >
                                <RotateCcw size={10} />
                              </button>
                            )}
                            <button
                              onClick={() => bump(key, ex.detail, 1)}
                              aria-label="Make harder"
                              className="w-6 h-6 rounded-lg border border-zinc-600 text-zinc-400 hover:text-zinc-100 hover:border-zinc-400 flex items-center justify-center"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>

                        {timerOpen && <ExerciseTimer exercise={displayedExercise} />}
                      </div>
                    </div>
                  </li>
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
