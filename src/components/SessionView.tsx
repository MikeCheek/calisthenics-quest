"use client";

import { useState } from "react";
import { TrainingSession } from "@/lib/types";
import { Check, Clock } from "lucide-react";

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

  const toggle = (key: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
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
                return (
                  <li
                    key={key}
                    onClick={() => toggle(key)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                      isDone
                        ? "border-emerald-600 bg-emerald-600/10"
                        : "border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 shrink-0 rounded-lg border flex items-center justify-center ${
                        isDone ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"
                      }`}
                    >
                      {isDone && <Check size={14} className="text-zinc-950" />}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${isDone ? "text-zinc-400 line-through" : "text-zinc-100"}`}>
                        {ex.name}
                      </div>
                      <div className="text-xs text-zinc-400">{ex.detail}</div>
                      {ex.cue && <div className="text-xs text-orange-400/80 italic">{ex.cue}</div>}
                    </div>
                    {ex.restSeconds > 0 && (
                      <div className="text-xs text-zinc-500 flex items-center gap-1 shrink-0">
                        <Clock size={12} /> {ex.restSeconds}s
                      </div>
                    )}
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
