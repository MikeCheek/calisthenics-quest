"use client";

import { useState } from "react";
import { TrainingSession, TrainingEquipment, Exercise } from "@/lib/types";
import { adjustDetail } from "@/lib/exerciseTiming";
import { findEasierExercise, findHarderExercise } from "@/lib/exerciseHierarchy";
import { useToast } from "@/context/ToastContext";
import ExerciseRow from "@/components/ExerciseRow";
import { Play } from "lucide-react";

// Warm-up and finisher exercises are generic conditioning, not part of any
// skill's difficulty hierarchy — everyone can do those regardless of level,
// so neither the whole-session feedback nor "can't do this" touches them.
const HIERARCHY_EXEMPT_SETS = new Set(["Warm-Up", "Final Hits"]);

type SessionLevel = "easier" | "default" | "harder";

const SESSION_LEVEL_OPTIONS: { value: SessionLevel; label: string }[] = [
  { value: "easier", label: "Too advanced" },
  { value: "default", label: "Feels right" },
  { value: "harder", label: "Too easy" },
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
  const [sessionLevel, setSessionLevel] = useState<SessionLevel>("default");
  const [individualOverrides, setIndividualOverrides] = useState<Record<string, Exercise>>({});
  const toast = useToast();
  const eq = equipment ?? DEFAULT_LOOKUP_EQUIPMENT;

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
    const easier = findEasierExercise(currentExercise.name, eq);
    if (!easier) {
      toast.warning(`No easier variation found for ${currentExercise.name} — try adjusting reps instead.`);
      return;
    }
    setIndividualOverrides((prev) => ({ ...prev, [key]: easier }));
    toast.success(`Swapped in ${easier.name} — one step easier.`);
    // the old exercise's per-row reps adjustment doesn't carry over to a
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
          {SESSION_LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSessionLevel(opt.value)}
              className={`flex-1 py-1.5 rounded-lg text-xs border ${
                sessionLevel === opt.value
                  ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {sessionLevel !== "default" && (
          <p className="text-xs text-zinc-500 mt-1.5">
            Every skill exercise below is swapped for the {sessionLevel === "easier" ? "easier" : "harder"}{" "}
            one right next to it in that skill&apos;s progression — reps stay as prescribed for whichever
            exercise ends up in place. Warm-up and finisher exercises don&apos;t change; everyone can do those.
          </p>
        )}
      </div>

      <p className="text-xs text-zinc-500 mt-2">
        Drag an exercise left or right for a quick easier/harder reps adjustment, or use the buttons.
      </p>

      <div className="space-y-5 mt-4">
        {session.sets.map((set) => {
          const exempt = HIERARCHY_EXEMPT_SETS.has(set.title);
          return (
            <div key={set.title}>
              <div className="text-sm uppercase tracking-wide text-emerald-400 mb-2">{set.title}</div>
              <ul className="space-y-2">
                {set.exercises.map((originalEx, i) => {
                  const key = `${set.title}-${i}`;
                  let effectiveExercise = individualOverrides[key] ?? originalEx;

                  if (!exempt && sessionLevel !== "default" && !(key in individualOverrides)) {
                    const stepped =
                      sessionLevel === "easier"
                        ? findEasierExercise(effectiveExercise.name, eq)
                        : findHarderExercise(effectiveExercise.name, eq);
                    if (stepped) effectiveExercise = stepped;
                  }

                  const totalDelta = individualDelta[key] ?? 0;
                  const displayedDetail = adjustDetail(effectiveExercise.detail, totalDelta);
                  const isSwapped = effectiveExercise.name !== originalEx.name;

                  return (
                    <ExerciseRow
                      key={key}
                      exercise={effectiveExercise}
                      displayedDetail={displayedDetail}
                      isAdjusted={totalDelta !== 0}
                      isSwapped={isSwapped}
                      isDone={done.has(key)}
                      timerOpen={openTimers.has(key)}
                      trackLabel={session.focusLabel}
                      onToggleDone={() => toggleDone(key)}
                      onToggleTimer={() => toggleTimer(key)}
                      onBump={(delta) => bump(key, delta)}
                      onResetAdjust={() => resetAdjust(key)}
                      onCantDo={exempt ? undefined : () => swapForEasier(key, effectiveExercise)}
                    />
                  );
                })}
              </ul>
            </div>
          );
        })}
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
