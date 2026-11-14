"use client";

import { useState } from "react";
import { TrainingSession, TrainingEquipment, Exercise, ExerciseFeedback } from "@/lib/types";
import { adjustDetail, estimateSessionMinutes } from "@/lib/exerciseTiming";
import { findEasierExercise, findHarderExercise, HIERARCHY_EXEMPT_SETS } from "@/lib/exerciseHierarchy";
import { useToast } from "@/context/ToastContext";
import ExerciseRow from "@/components/ExerciseRow";
import { TimerLog, summarizeTimerLog, bestHoldFromLog } from "@/lib/timingLearning";
import Modal from "@/components/Modal";
import { Play, Clock, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

type SessionLevel = "easier" | "default" | "harder";

const SESSION_LEVEL_OPTIONS: { value: SessionLevel; label: string }[] = [
  { value: "easier", label: "Too advanced" },
  { value: "default", label: "Feels right" },
  { value: "harder", label: "Too easy" },
];

// Warm-up and finisher are the same everyone-can-do-these content every
// session — collapsed by default so the card opens on what actually
// changes day to day (Main Focus, Accessory) instead of a long scroll.
const COLLAPSED_BY_DEFAULT = new Set(["Warm-Up", "Final Hits"]);

export default function SessionView({
  session,
  equipment,
  onComplete,
  completed,
  onStartFocusMode,
}: {
  session: TrainingSession;
  equipment?: TrainingEquipment;
  onComplete?: (feedback: ExerciseFeedback[]) => void;
  completed?: boolean;
  onStartFocusMode?: () => void;
}) {
  const totalExercises = session.sets.reduce((n, s) => n + s.exercises.length, 0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  // every "too hard" press, in order — the exercise it was pressed on, not
  // the easier one swapped in for it
  const [tooHard, setTooHard] = useState<ExerciseFeedback[]>([]);
  // raw timer logs and Skill Check results, per row
  const [timerLogs, setTimerLogs] = useState<Record<string, TimerLog>>({});
  const [checkResults, setCheckResults] = useState<Record<string, number | boolean | undefined>>({});
  const [openTimers, setOpenTimers] = useState<Set<string>>(new Set());
  const [individualDelta, setIndividualDelta] = useState<Record<string, number>>({});
  const [sessionLevel, setSessionLevel] = useState<SessionLevel>("default");
  const [individualOverrides, setIndividualOverrides] = useState<Record<string, Exercise>>({});
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(COLLAPSED_BY_DEFAULT));
  const toast = useToast();
  const eq = equipment ?? DEFAULT_LOOKUP_EQUIPMENT;

  const toggleSkip = (key: string) => {
    setSkipped((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleDone = (key: string) => {
    setSkipped((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
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

  const toggleSection = (title: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
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

  const swapForEasier = (key: string, currentExercise: Exercise, setTitle: string) => {
    setTooHard((prev) => [...prev, { name: currentExercise.name, outcome: "tooHard", setTitle }]);
    const easier = findEasierExercise(currentExercise.name, eq);
    if (!easier) {
      toast.warning(`No easier variation for ${currentExercise.name} — noted, future sessions will ease off. Try fewer reps for now.`);
      bump(key, -1);
      return;
    }
    setIndividualOverrides((prev) => ({
      ...prev,
      [key]: { ...easier, adaptedFrom: currentExercise.name, adaptDir: "easier", adaptNote: undefined },
    }));
    toast.success(`Swapped in ${easier.name} — one step easier.`);
    // the old exercise's per-row reps adjustment doesn't carry over to a
    // different exercise's own baseline
    resetAdjust(key);
  };

  // the exercise actually shown in a row: a "too hard" swap wins, else the
  // whole-session easier/harder step, else what was generated
  const effectiveFor = (key: string, originalEx: Exercise, exempt: boolean): Exercise => {
    if (individualOverrides[key]) return individualOverrides[key];
    if (!exempt && sessionLevel !== "default") {
      const stepped =
        sessionLevel === "easier" ? findEasierExercise(originalEx.name, eq) : findHarderExercise(originalEx.name, eq);
      if (stepped) return stepped;
    }
    return originalEx;
  };

  const collectFeedback = (): ExerciseFeedback[] => {
    const out: ExerciseFeedback[] = [...tooHard];
    session.sets.forEach((set) => {
      const exempt = HIERARCHY_EXEMPT_SETS.has(set.title);
      set.exercises.forEach((originalEx, i) => {
        const key = `${set.title}-${i}`;
        const ex = effectiveFor(key, originalEx, exempt);
        const checkResult = ex.check
          ? checkResults[key] ?? (ex.check.kind === "hold" ? bestHoldFromLog(timerLogs[key]) ?? undefined : undefined)
          : undefined;
        // logging a check result counts as doing it, even without the tick
        const isDone = done.has(key) || checkResult !== undefined;
        // a row pressed "too hard" with no easier swap and never done is
        // already recorded as too hard — don't also count it as a skip
        if (!isDone && !individualOverrides[key] && tooHard.some((t) => t.name === ex.name && t.setTitle === set.title)) return;
        out.push({
          name: ex.name,
          outcome: isDone ? "done" : "skipped",
          setTitle: set.title,
          repDelta: isDone ? individualDelta[key] ?? 0 : undefined,
          adaptedFrom: ex.adaptedFrom,
          adaptDir: ex.adaptDir,
          timing: summarizeTimerLog(timerLogs[key]),
          check: ex.check,
          checkResult,
        });
      });
    });
    return out;
  };

  const allDone = done.size + skipped.size >= totalExercises;
  const levelLabel = SESSION_LEVEL_OPTIONS.find((o) => o.value === sessionLevel)?.label;

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
          <div className="text-xs text-zinc-500 mt-0.5 flex items-center justify-end gap-1">
            <Clock size={11} /> ~{estimateSessionMinutes(session)} min
          </div>
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

      <button
        onClick={() => setAdjustOpen(true)}
        className="w-full mt-2 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 flex items-center justify-center gap-1.5"
      >
        <SlidersHorizontal size={12} />
        {sessionLevel === "default" ? "Adjust today's difficulty" : `Difficulty: ${levelLabel}`}
      </button>

      <div className="space-y-3 mt-4">
        {session.sets.map((set) => {
          const exempt = HIERARCHY_EXEMPT_SETS.has(set.title);
          const isCollapsed = collapsed.has(set.title);
          return (
            <div key={set.title}>
              <button
                onClick={() => toggleSection(set.title)}
                className="w-full flex items-center justify-between text-sm uppercase tracking-wide text-emerald-400 mb-2"
              >
                <span>
                  {set.title} <span className="text-zinc-600 normal-case">({set.exercises.length})</span>
                </span>
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
              {!isCollapsed && (
                <ul className="space-y-2">
                  {set.exercises.map((originalEx, i) => {
                    const key = `${set.title}-${i}`;
                    const effectiveExercise = effectiveFor(key, originalEx, exempt);

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
                        isSkipped={skipped.has(key)}
                        timerOpen={openTimers.has(key)}
                        trackLabel={session.focusLabel}
                        onToggleDone={() => toggleDone(key)}
                        onToggleTimer={() => toggleTimer(key)}
                        onBump={(delta) => bump(key, delta)}
                        onResetAdjust={() => resetAdjust(key)}
                        onCantDo={exempt || effectiveExercise.check ? undefined : () => swapForEasier(key, effectiveExercise, set.title)}
                        timerLog={timerLogs[key]}
                        onTimerLog={(log) => setTimerLogs((prev) => ({ ...prev, [key]: log }))}
                        checkValue={checkResults[key]}
                        onCheckChange={(v) => setCheckResults((prev) => ({ ...prev, [key]: v }))}
                        onSkip={() => toggleSkip(key)}
                      />
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {onComplete && (
        <button
          disabled={completed}
          onClick={() => onComplete(collectFeedback())}
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

      <Modal open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Adjust today's difficulty">
        <p className="text-xs text-zinc-500 mb-3">
          Drag an exercise left or right in the list for a quick per-exercise easier/harder reps
          adjustment, or use its own +/- buttons. This sets the difficulty for the whole session at once.
        </p>
        <div className="flex gap-1.5">
          {SESSION_LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSessionLevel(opt.value)}
              className={`flex-1 py-2 rounded-lg text-xs border ${
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
          <p className="text-xs text-zinc-500 mt-3">
            Every skill exercise below is swapped for the {sessionLevel === "easier" ? "easier" : "harder"}{" "}
            one right next to it in that skill&apos;s progression — reps stay as prescribed for whichever
            exercise ends up in place. Warm-up and finisher exercises don&apos;t change; everyone can do those.
          </p>
        )}
        <button
          onClick={() => setAdjustOpen(false)}
          className="w-full mt-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium"
        >
          Done
        </button>
      </Modal>
    </div>
  );
}

const DEFAULT_LOOKUP_EQUIPMENT: TrainingEquipment = {
  pullUpBar: true, parallelBars: true, rings: true, wallSpace: true,
  verticalPole: true, monkeyBars: true, weights: true, resistanceBands: true,
};
