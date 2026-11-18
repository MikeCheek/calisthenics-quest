"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Exercise, ExerciseFeedback } from "@/lib/types";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import SkillCheckPanel from "@/components/SkillCheckPanel";
import ExerciseDemo from "@/components/ExerciseDemo";
import { TimerLog, TimerRestSample, summarizeTimerLog, bestHoldFromLog, learnedTransitionRest, cleanSets } from "@/lib/timingLearning";
import { statKey } from "@/lib/adaptation";
import { playRestSound, playGoSound } from "@/lib/sound";
import { MIN_BETWEEN_EXERCISE_REST, MAX_BETWEEN_EXERCISE_REST, estimateExercisesMinutes } from "@/lib/exerciseTiming";
import { findEasierExercise, HIERARCHY_EXEMPT_SETS } from "@/lib/exerciseHierarchy";
import { ChevronDown, ChevronLeft, ChevronRight, Info, Check, Pause, Play, SkipForward, BatteryLow, ArrowDownCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
  const { tx } = useLanguage();

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
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [tooHard, setTooHard] = useState<ExerciseFeedback[]>([]);
  const [timerLogs, setTimerLogs] = useState<Record<number, TimerLog>>({});
  const [checkResults, setCheckResults] = useState<Record<number, number | boolean | undefined>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [restWasLearned, setRestWasLearned] = useState(false);

  // ---- measuring rest between exercises (same cleaning as in-exercise rest) ----
  const transitionSamples = useRef<TimerRestSample[]>([]);
  const restMeter = useRef<{ planned: number; start: number; pauseStart: number | null; maxPauseMs: number; hiddenMs: number; hiddenStart: number | null } | null>(null);

  const startRestMeter = (planned: number) => {
    const now = Date.now();
    restMeter.current = { planned, start: now, pauseStart: null, maxPauseMs: 0, hiddenMs: 0, hiddenStart: document.hidden ? now : null };
  };
  const closeRestMeter = (keep: boolean) => {
    const m = restMeter.current;
    restMeter.current = null;
    if (!m || !keep) return;
    const now = Date.now();
    if (m.pauseStart !== null) m.maxPauseMs = Math.max(m.maxPauseMs, now - m.pauseStart);
    if (m.hiddenStart !== null) m.hiddenMs += now - m.hiddenStart;
    transitionSamples.current.push({ plannedSec: m.planned, takenSec: (now - m.start) / 1000, maxPauseMs: m.maxPauseMs, hiddenMs: m.hiddenMs });
  };

  useEffect(() => {
    const m = restMeter.current;
    if (!m) return;
    if (paused && m.pauseStart === null) m.pauseStart = Date.now();
    else if (!paused && m.pauseStart !== null) {
      m.maxPauseMs = Math.max(m.maxPauseMs, Date.now() - m.pauseStart);
      m.pauseStart = null;
    }
  }, [paused]);

  useEffect(() => {
    const onVis = () => {
      const m = restMeter.current;
      if (!m) return;
      if (document.hidden) m.hiddenStart = Date.now();
      else if (m.hiddenStart !== null) {
        m.hiddenMs += Date.now() - m.hiddenStart;
        m.hiddenStart = null;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // reset internal progress whenever a genuinely new session starts
  useEffect(() => {
    setIndex(0);
    setCompletedSteps(new Set());
    setAllDoneScreen(false);
    setRestSecondsLeft(null);
    setOverrides({});
    setSkippedSteps(new Set());
    setTooHard([]);
    setTimerLogs({});
    setCheckResults({});
    transitionSamples.current = [];
    restMeter.current = null;
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
    closeRestMeter(true);
    playGoSound();
    setRestSecondsLeft(null);
    setIndex((i) => i + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restSecondsLeft]);

  if (!session || !current) return null;

  const isLastStep = index === steps.length - 1;

  const markCompleteAndAdvance = () => {
    setCompletedSteps((prev) => new Set(prev).add(index));
    setSkippedSteps((prev) => {
      if (!prev.has(index)) return prev;
      const n = new Set(prev);
      n.delete(index);
      return n;
    });
    if (isLastStep) {
      setAllDoneScreen(true);
      return;
    }
    const planned = Math.min(MAX_BETWEEN_EXERCISE_REST, Math.max(MIN_BETWEEN_EXERCISE_REST, current.exercise.restSeconds || MIN_BETWEEN_EXERCISE_REST));
    // learned from how long this athlete actually rests between exercises
    const { seconds: rest, learned } = learnedTransitionRest(planned, userDoc?.transitionRest);
    setRestWasLearned(learned);
    startRestMeter(rest);
    playRestSound();
    setRestSecondsLeft(rest);
  };

  const skipRest = () => {
    closeRestMeter(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    playGoSound();
    setRestSecondsLeft(null);
    setIndex((i) => i + 1);
  };

  const goBack = () => {
    if (index === 0 && restSecondsLeft === null) return;
    setAllDoneScreen(false);
    setRestSecondsLeft(null);
    closeRestMeter(false); // going back isn't a rest decision
    if (restSecondsLeft !== null) return; // step back into the exercise we were resting after
    setIndex((i) => i - 1);
  };

  const goNext = () => {
    // Manual "Next" always marks the current exercise done, same as
    // finishing its timer would — the athlete is the judge of "done enough."
    markCompleteAndAdvance();
  };

  // Skip: move on without the rest period, and remember it was skipped.
  const handleSkip = () => {
    setSkippedSteps((prev) => new Set(prev).add(index));
    if (isLastStep) {
      setAllDoneScreen(true);
      return;
    }
    setIndex((i) => i + 1);
  };

  // Too hard: remember it against this exercise, and swap in the next rung
  // down right away so the athlete can keep going.
  const handleTooHard = () => {
    const ex = current.exercise;
    setTooHard((prev) => [...prev, { name: ex.name, outcome: "tooHard", setTitle: current.setTitle }]);
    const easier = findEasierExercise(ex.name, userDoc?.equipment ?? EASE_LOOKUP_EQUIPMENT);
    if (easier) {
      setOverrides((prev) => ({ ...prev, [index]: { ...easier, adaptedFrom: ex.name, adaptDir: "easier", adaptNote: undefined } }));
      toast.success(`Swapped in ${easier.name}. Noted for future sessions.`);
    } else {
      toast.info("Nothing easier for this one — noted for future sessions. Skipping ahead.");
      if (isLastStep) setAllDoneScreen(true);
      else setIndex((i) => i + 1);
    }
  };

  const collectFeedback = (): ExerciseFeedback[] => {
    const out: ExerciseFeedback[] = [...tooHard];
    steps.forEach((step, i) => {
      const ex = overrides[i] ?? step.exercise;
      const checkResult = ex.check
        ? checkResults[i] ?? (ex.check.kind === "hold" ? bestHoldFromLog(timerLogs[i]) ?? undefined : undefined)
        : undefined;
      const isDone = completedSteps.has(i) || checkResult !== undefined;
      if (!isDone && tooHard.some((t) => t.name === ex.name && t.setTitle === step.setTitle)) return;
      out.push({
        name: ex.name,
        outcome: isDone ? "done" : "skipped",
        setTitle: step.setTitle,
        adaptedFrom: ex.adaptedFrom,
        adaptDir: ex.adaptDir,
        timing: summarizeTimerLog(timerLogs[i]),
        detail: ex.detail,
        sets: isDone ? cleanSets(timerLogs[i]) : undefined,
        check: ex.check,
        checkResult,
      });
    });
    return out;
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
      toast.success(`Eased up what's left — ${swapped} swapped for something gentler.`);
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
        <button onClick={minimize} className="p-1.5 text-muted hover:text-zinc-200" aria-label={tx("Minimize")}>
          <ChevronDown size={20} />
        </button>
        <div className="text-xs text-muted stat-mono">
          {Math.min(index + 1, steps.length)} / {steps.length}
          {!allDoneScreen && (
            <span className="text-muted"> · ~{estimateExercisesMinutes(steps.slice(index).map((s, i) => overrides[index + i] ?? s.exercise))} {tx("min left")}</span>
          )}
        </div>
        <button
          onClick={togglePause}
          className={`p-1.5 rounded-lg ${paused ? "text-orange-400" : "text-muted hover:text-zinc-200"}`}
          aria-label={paused ? tx("Resume training") : tx("Pause training")}
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
                completedSteps.has(i) ? "bg-emerald-500" : skippedSteps.has(i) ? "bg-zinc-600" : i === index ? "bg-orange-500" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>
        {!allDoneScreen && !isLastStep && (
          <div className="text-xs text-muted mt-2 truncate">{tx("Next:")} {next?.exercise.name}</div>
        )}
      </div>

      {restSecondsLeft !== null ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-xs uppercase tracking-wide text-emerald-400 mb-2">{tx("Rest before next exercise")}</div>
          <div className="stat-mono text-6xl text-zinc-100 mb-2">
            {mm}:{ss}
          </div>
          {next && <div className="text-sm text-zinc-400 mb-1">{tx("Up next:")} {next.exercise.name}</div>}
          <div className="text-xs text-muted mb-6 h-4">{restWasLearned ? tx("Rest adjusted to your usual pace") : ""}</div>
          {paused && (
            <div className="text-xs text-orange-400 flex items-center gap-1.5 mb-4">
              <Pause size={12} /> {tx("Training paused")}
            </div>
          )}
          <button
            onClick={skipRest}
            className="px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center gap-2 text-sm"
          >
            <SkipForward size={15} /> {tx("Skip rest")}
          </button>
        </div>
      ) : allDoneScreen ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
            <Check size={28} className="text-emerald-400" />
          </div>
          <div className="heading text-2xl text-zinc-100 mb-2">{tx("Session complete!")}</div>
          <p className="text-sm text-zinc-400 mb-6">
            {skippedSteps.size === 0
              ? tx("Every exercise is done. Log it to bank your XP and streak.")
              : tx("{a} done, {b} skipped. Log it to bank your XP. Your next sessions adapt to what you skipped.", { a: completedSteps.size, b: skippedSteps.size })}
          </p>
          <button
            onClick={() =>
              finishSession(collectFeedback(), {
                transitionRestRatio: summarizeTimerLog({ sets: [], rests: transitionSamples.current, workPauses: 0 })?.restRatio,
              })
            }
            className="w-full max-w-xs py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950"
          >
            {tx("Finish & log session")}
          </button>
          <button onClick={goBack} className="text-xs text-muted hover:text-zinc-300 mt-3">
            {tx("Go back and review")}
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
            <div className="text-center mb-6">
              <div className="text-xs uppercase tracking-wide text-emerald-400 mb-1">{tx(current.setTitle)}</div>
              <div className="flex items-center justify-center gap-2">
                <div className="heading text-2xl text-zinc-100">{current.exercise.name}</div>
                <button
                  onClick={() => setInfoOpen(true)}
                  className="p-1 text-muted hover:text-orange-400"
                  aria-label={`Details for ${current.exercise.name}`}
                >
                  <Info size={18} />
                </button>
              </div>
              {index in overrides ? (
                <div className="text-xs text-orange-400 mt-0.5">{tx("Swapped in — something gentler")}</div>
              ) : (
                current.exercise.adaptNote && (
                  <div className="text-xs text-sky-400/90 mt-0.5 flex items-center justify-center gap-1">
                    <Sparkles size={11} /> {tx(current.exercise.adaptNote)}
                  </div>
                )
              )}
              <div className="text-sm text-zinc-400 mt-1">{current.exercise.detail}</div>
              {!HIERARCHY_EXEMPT_SETS.has(current.setTitle) && userDoc?.exerciseStats?.[statKey(current.exercise.name)]?.lastSets && (
                <div className="text-xs text-muted mt-0.5">
                  {tx("Last time:")}{" "}
                  <span className="text-zinc-300 stat-mono">{userDoc.exerciseStats[statKey(current.exercise.name)].lastSets}</span>
                </div>
              )}
              {current.exercise.cue && (
                <div className="text-xs text-orange-400/80 italic mt-1">{tx(current.exercise.cue)}</div>
              )}
            </div>

            {paused && (
              <div className="max-w-sm w-full mx-auto mb-3 text-center text-xs text-orange-400 flex items-center justify-center gap-1.5">
                <Pause size={12} /> {tx("Training paused — your spot is saved")}
              </div>
            )}

            <ExerciseDemo exerciseName={current.exercise.name} width={170} className="mb-4" />
            <div className="max-w-sm w-full mx-auto">
              <ExerciseTimer
                key={`${current.key}-${current.exercise.name}`}
                exercise={current.exercise}
                // a Skill Check waits on "Next" so the result can be logged first
                onComplete={current.exercise.check ? undefined : markCompleteAndAdvance}
                externallyPaused={paused}
                onLog={(log) => setTimerLogs((prev) => ({ ...prev, [index]: log }))}
              />
              {current.exercise.check && (
                <SkillCheckPanel
                  spec={current.exercise.check}
                  value={checkResults[index]}
                  timerBest={bestHoldFromLog(timerLogs[index])}
                  onChange={(v) => setCheckResults((prev) => ({ ...prev, [index]: v }))}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-4 border-t border-zinc-800 gap-3">
            <button
              onClick={goBack}
              disabled={index === 0}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm"
            >
              <ChevronLeft size={16} /> {tx("Back")}
            </button>
            <button
              onClick={goNext}
              disabled={paused}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center justify-center gap-1.5 text-sm disabled:opacity-40"
            >
              {tx("Next")} <ChevronRight size={16} />
            </button>
          </div>
          {!HIERARCHY_EXEMPT_SETS.has(current.setTitle) && (
            <div className="grid grid-cols-2 gap-2 mx-4 mb-2">
              <button
                onClick={handleSkip}
                className="py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 flex items-center justify-center gap-1.5 text-xs"
              >
                <SkipForward size={13} /> {tx("Skip")}
              </button>
              {!current.exercise.check && (
              <button
                onClick={handleTooHard}
                className="py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400 flex items-center justify-center gap-1.5 text-xs"
              >
                <ArrowDownCircle size={13} /> {tx("Too hard")}
              </button>
              )}
            </div>
          )}
          <button
            onClick={handleTired}
            className="mx-4 mb-4 py-2 rounded-lg border border-zinc-800 text-muted hover:border-orange-500/50 hover:text-orange-400 flex items-center justify-center gap-1.5 text-xs"
          >
            <BatteryLow size={13} /> {tx("I'm tired — ease up what's left")}
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
