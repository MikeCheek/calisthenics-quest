"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Exercise } from "@/lib/types";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import { playRestSound, playGoSound } from "@/lib/sound";
import { MIN_BETWEEN_EXERCISE_REST, MAX_BETWEEN_EXERCISE_REST, estimateExercisesMinutes } from "@/lib/exerciseTiming";
import { findEasierExercise, HIERARCHY_EXEMPT_SETS } from "@/lib/exerciseHierarchy";
import { ChevronDown, ChevronLeft, ChevronRight, Info, Check, Pause, Play, SkipForward, BatteryLow } from "lucide-react";

interface Step {
  key: string;
  setTitle: string;
  exercise: Exercise;
}

const EASE_LOOKUP_EQUIPMENT = {
  pullUpBar: true, parallelBars: true, rings: true, wallSpace: true,
  verticalPole: true, monkeyBars: true, weights: true, resistanceBands: true,
};

export default function FocusTrainingMode() {
  const { session, expanded, paused, minimize, togglePause, reportCurrentExercise, finishSession } =
    useTrainingSession();
  const { userDoc } = useAuth();
  const toast = useToast();

  const steps: Step[] = useMemo(() => {
    if (!session) return [];
    const flat: Step[] = [];
    session.sets.forEach((set) => {
      set.exercises.forEach((ex, i) => flat.push({ key: `${set.title}-${i}`, setTitle: set.title, exercise: ex }));
    });
    return flat;
  }, [session]);

  const [index, setIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [infoOpen, setInfoOpen] = useState(false);
  const [allDoneScreen, setAllDoneScreen] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [overrides, setOverrides] = useState<Record<number, Exercise>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // reset internal progress whenever a genuinely new session starts
  useEffect(() => {
    setIndex(0);
    setCompletedSteps(new Set());
    setAllDoneScreen(false);
    setRestSecondsLeft(null);
    setOverrides({});
  }, [session]);

  const rawCurrent = steps[index];
  const current = useMemo(
    () => (rawCurrent ? { ...rawCurrent, exercise: overrides[index] ?? rawCurrent.exercise } : undefined),
    [rawCurrent, overrides, index]
  );
  const rawNext = steps[index + 1];
  const next = useMemo(
    () => (rawNext ? { ...rawNext, exercise: overrides[index + 1] ?? rawNext.exercise } : undefined),
    [rawNext, overrides, index]
  );

  useEffect(() => {
    if (current) reportCurrentExercise(current.exercise.name);
  }, [current, reportCurrentExercise]);

  // the between-exercise rest countdown — pauses right alongside the
  // per-exercise timer when training is paused, and advances to the next
  // exercise on its own once it hits zero
  useEffect(() => {
    if (restSecondsLeft === null || paused) return;
    intervalRef.current = setInterval(() => {
      setRestSecondsLeft((s) => {
        if (s === null) return s;
        if (s > 1) return s - 1;
        return 0;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [restSecondsLeft !== null, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (restSecondsLeft !== 0) return;
    playGoSound();
    setRestSecondsLeft(null);
    setIndex((i) => i + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restSecondsLeft]);

  if (!session || !current) return null;

  const isLastStep = index === steps.length - 1;

  const markCompleteAndAdvance = () => {
    setCompletedSteps((prev) => new Set(prev).add(index));
    if (isLastStep) {
      setAllDoneScreen(true);
      return;
    }
    const rest = Math.min(MAX_BETWEEN_EXERCISE_REST, Math.max(MIN_BETWEEN_EXERCISE_REST, current.exercise.restSeconds || MIN_BETWEEN_EXERCISE_REST));
    playRestSound();
    setRestSecondsLeft(rest);
  };

  const skipRest = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    playGoSound();
    setRestSecondsLeft(null);
    setIndex((i) => i + 1);
  };

  const goBack = () => {
    if (index === 0 && restSecondsLeft === null) return;
    setAllDoneScreen(false);
    setRestSecondsLeft(null);
    if (restSecondsLeft !== null) return; // step back into the exercise we were resting after
    setIndex((i) => i - 1);
  };

  const goNext = () => {
    // Manual "Next" always marks the current exercise done, same as
    // finishing its timer would — the athlete is the judge of "done enough."
    markCompleteAndAdvance();
  };

  const handleTired = () => {
    const updates: Record<number, Exercise> = { ...overrides };
    let swapped = 0;
    for (let i = index; i < steps.length; i++) {
      const step = steps[i];
      if (HIERARCHY_EXEMPT_SETS.has(step.setTitle)) continue;
      const currentEx = updates[i] ?? step.exercise;
      const easier = findEasierExercise(currentEx.name, userDoc?.equipment ?? EASE_LOOKUP_EQUIPMENT);
      if (easier) {
        updates[i] = easier;
        swapped++;
      }
    }
    setOverrides(updates);
    if (swapped > 0) {
      toast.success(`Eased up what's left — ${swapped} exercise${swapped === 1 ? "" : "s"} swapped for something gentler.`);
    } else {
      toast.info("Everything left is already about as easy as it gets — hang in there.");
    }
  };

  const mm = restSecondsLeft !== null ? String(Math.floor(restSecondsLeft / 60)).padStart(2, "0") : "00";
  const ss = restSecondsLeft !== null ? String(restSecondsLeft % 60).padStart(2, "0") : "00";

  return (
    <div
      className={`fixed inset-0 z-50 bg-zinc-950 flex-col safe-top safe-bottom ${expanded ? "flex" : "hidden"}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button onClick={minimize} className="p-1.5 text-zinc-500 hover:text-zinc-200" aria-label="Minimize">
          <ChevronDown size={20} />
        </button>
        <div className="text-xs text-zinc-500 stat-mono">
          {Math.min(index + 1, steps.length)} / {steps.length}
          {!allDoneScreen && (
            <span className="text-zinc-600"> · ~{estimateExercisesMinutes(steps.slice(index).map((s, i) => overrides[index + i] ?? s.exercise))} min left</span>
          )}
        </div>
        <button
          onClick={togglePause}
          className={`p-1.5 rounded-lg ${paused ? "text-orange-400" : "text-zinc-500 hover:text-zinc-200"}`}
          aria-label={paused ? "Resume training" : "Pause training"}
        >
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>

      {/* stepper */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`h-1.5 flex-1 rounded-full ${
                completedSteps.has(i) ? "bg-emerald-500" : i === index ? "bg-orange-500" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>
        {!allDoneScreen && !isLastStep && (
          <div className="text-xs text-zinc-500 mt-2 truncate">Next: {next?.exercise.name}</div>
        )}
      </div>

      {restSecondsLeft !== null ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-xs uppercase tracking-wide text-emerald-400 mb-2">Rest before next exercise</div>
          <div className="stat-mono text-6xl text-zinc-100 mb-2">
            {mm}:{ss}
          </div>
          {next && <div className="text-sm text-zinc-400 mb-6">Up next: {next.exercise.name}</div>}
          {paused && (
            <div className="text-xs text-orange-400 flex items-center gap-1.5 mb-4">
              <Pause size={12} /> Training paused
            </div>
          )}
          <button
            onClick={skipRest}
            className="px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center gap-2 text-sm"
          >
            <SkipForward size={15} /> Skip rest
          </button>
        </div>
      ) : allDoneScreen ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
            <Check size={28} className="text-emerald-400" />
          </div>
          <div className="heading text-2xl text-zinc-100 mb-2">Session complete!</div>
          <p className="text-sm text-zinc-400 mb-6">Every exercise is done. Log it to bank your XP and streak.</p>
          <button
            onClick={finishSession}
            className="w-full max-w-xs py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950"
          >
            Finish &amp; log session
          </button>
          <button onClick={goBack} className="text-xs text-zinc-500 hover:text-zinc-300 mt-3">
            Go back and review
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
            <div className="text-center mb-6">
              <div className="text-xs uppercase tracking-wide text-emerald-400 mb-1">{current.setTitle}</div>
              <div className="flex items-center justify-center gap-2">
                <div className="heading text-2xl text-zinc-100">{current.exercise.name}</div>
                <button
                  onClick={() => setInfoOpen(true)}
                  className="p-1 text-zinc-500 hover:text-orange-400"
                  aria-label={`Details for ${current.exercise.name}`}
                >
                  <Info size={18} />
                </button>
              </div>
              {index in overrides && (
                <div className="text-xs text-orange-400 mt-0.5">Swapped in — something gentler</div>
              )}
              <div className="text-sm text-zinc-400 mt-1">{current.exercise.detail}</div>
            </div>

            {paused && (
              <div className="max-w-sm w-full mx-auto mb-3 text-center text-xs text-orange-400 flex items-center justify-center gap-1.5">
                <Pause size={12} /> Training paused — your spot is saved
              </div>
            )}

            <div className="max-w-sm w-full mx-auto">
              <ExerciseTimer
                key={`${current.key}-${current.exercise.name}`}
                exercise={current.exercise}
                onComplete={markCompleteAndAdvance}
                externallyPaused={paused}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-4 border-t border-zinc-800 gap-3">
            <button
              onClick={goBack}
              disabled={index === 0}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={goNext}
              disabled={paused}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center justify-center gap-1.5 text-sm disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={handleTired}
            className="mx-4 mb-4 py-2 rounded-lg border border-zinc-800 text-zinc-500 hover:border-orange-500/50 hover:text-orange-400 flex items-center justify-center gap-1.5 text-xs"
          >
            <BatteryLow size={13} /> I&apos;m tired — ease up what&apos;s left
          </button>
        </>
      )}

      <ExerciseDetailModal
        exercise={current.exercise}
        trackLabel={session.focusLabel}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
}
