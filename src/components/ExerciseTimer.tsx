"use client";

import { useEffect, useRef, useState } from "react";
import { Exercise } from "@/lib/types";
import { parseTiming } from "@/lib/exerciseTiming";
import { TimerLog, EMPTY_TIMER_LOG } from "@/lib/timingLearning";
import { playCountdownTick, playGoSound, playRestSound, playCompleteSound } from "@/lib/sound";
import { Play, Pause, SkipForward, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Phase = "idle" | "countdown" | "work" | "rest" | "done";

const COUNTDOWN_FROM = 3;

export default function ExerciseTimer({
  exercise,
  onComplete,
  externallyPaused,
  onLog,
}: {
  exercise: Exercise;
  onComplete?: () => void;
  // Receives the raw timing log (holds, rests, pauses) after every set and
  // rest, so the session can learn from it — cleaning happens downstream.
  onLog?: (log: TimerLog) => void;
  // Forces the timer to pause regardless of its own play/resume state —
  // used by the "Pause Training" control in the full-screen guided mode,
  // which needs to stop a running countdown from outside this component.
  externallyPaused?: boolean;
}) {
  const timing = parseTiming(exercise.detail);
  const { tx } = useLanguage();
  // lower end of a prescribed rep range ("3 x 8-10 reps" -> 8); null = max reps
  const repMatch = exercise.detail.match(/(\d+)(?:-\d+)?\s*reps?\b/i);
  const targetReps = repMatch ? parseInt(repMatch[1], 10) : /max/i.test(exercise.detail) ? null : undefined;
  const [repLog, setRepLog] = useState<(number | undefined)[]>([]);
  const [set, setSet] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdownValue, setCountdownValue] = useState(COUNTDOWN_FROM);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(timing.workSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedComplete = useRef(false);

  const isLastSet = set >= timing.sets;

  // ---- raw timing capture (wall clock, so throttled intervals don't lie) ----
  const logRef = useRef<TimerLog>({ ...EMPTY_TIMER_LOG, sets: [], rests: [] });
  const onLogRef = useRef(onLog);
  onLogRef.current = onLog;
  const meter = useRef({ start: 0, pausedMs: 0, maxPauseMs: 0, pauseStart: null as number | null, hiddenMs: 0, hiddenStart: null as number | null });

  const startMeter = () => {
    const now = Date.now();
    meter.current = {
      start: now,
      pausedMs: 0,
      maxPauseMs: 0,
      pauseStart: null,
      hiddenMs: 0,
      hiddenStart: typeof document !== "undefined" && document.hidden ? now : null,
    };
  };

  const closeMeter = () => {
    const now = Date.now();
    const m = meter.current;
    if (m.pauseStart !== null) {
      const d = now - m.pauseStart;
      m.pausedMs += d;
      m.maxPauseMs = Math.max(m.maxPauseMs, d);
      m.pauseStart = null;
    }
    if (m.hiddenStart !== null) {
      m.hiddenMs += now - m.hiddenStart;
      m.hiddenStart = null;
    }
    return { elapsedMs: now - m.start, pausedMs: m.pausedMs, maxPauseMs: m.maxPauseMs, hiddenMs: m.hiddenMs };
  };

  const emitLog = () => {
    const l = logRef.current;
    onLogRef.current?.({ sets: [...l.sets], rests: [...l.rests], workPauses: l.workPauses });
  };

  // Optional per-set rep logging for rep-based exercises: shown during the
  // rest after a set (and once finished). Untouched = not logged, so a
  // prefilled number never pretends to be data.
  const repSetIdx = timing.isTimed ? -1 : logRef.current.sets.length - 1;
  const lastLogged = [...repLog].reverse().find((r) => r !== undefined);
  const repDefault = lastLogged ?? targetReps ?? 5;
  const logReps = (v: number) => {
    const sample = logRef.current.sets[repSetIdx];
    if (!sample) return;
    sample.reps = v;
    setRepLog((prev) => {
      const next = [...prev];
      next[repSetIdx] = v;
      return next;
    });
    emitLog();
  };

  const isPausedNow =
    !!externallyPaused || (!running && (phase === "rest" || (phase === "work" && timing.isTimed)));

  useEffect(() => {
    if (phase !== "work" && phase !== "rest") return;
    const m = meter.current;
    if (isPausedNow && m.pauseStart === null) {
      m.pauseStart = Date.now();
      if (phase === "work") logRef.current.workPauses += 1;
    } else if (!isPausedNow && m.pauseStart !== null) {
      const d = Date.now() - m.pauseStart;
      m.pausedMs += d;
      m.maxPauseMs = Math.max(m.maxPauseMs, d);
      m.pauseStart = null;
    }
  }, [isPausedNow, phase]);

  useEffect(() => {
    const onVis = () => {
      const m = meter.current;
      if (document.hidden) m.hiddenStart = Date.now();
      else if (m.hiddenStart !== null) {
        m.hiddenMs += Date.now() - m.hiddenStart;
        m.hiddenStart = null;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // the countdown advances from inside a state updater, which React may
  // invoke twice in development — record each metered phase only once
  const lastRecordedStart = useRef(-1);

  const recordWork = (remaining: number | null) => {
    if (lastRecordedStart.current === meter.current.start) return;
    lastRecordedStart.current = meter.current.start;
    const m = closeMeter();
    const isHold = timing.isTimed && timing.workSeconds !== null;
    // "max hold" has no real target (the timer just uses a default), so
    // stopping it early isn't falling short — record it without a target
    const explicitTarget = /\d+\s*(s|min)\b/i.test(exercise.detail);
    logRef.current.sets.push({
      kind: isHold ? "hold" : "reps",
      targetSec: isHold && explicitTarget ? timing.workSeconds : null,
      activeSec: isHold
        ? Math.max(0, (timing.workSeconds ?? 0) - (remaining ?? 0))
        : Math.max(0, (m.elapsedMs - m.pausedMs) / 1000),
      endedEarly: isHold && (remaining ?? 0) > 0,
      targetReps: isHold ? undefined : targetReps,
      maxPauseMs: m.maxPauseMs,
      hiddenMs: m.hiddenMs,
    });
    emitLog();
  };

  const recordRest = () => {
    if (lastRecordedStart.current === meter.current.start) return;
    lastRecordedStart.current = meter.current.start;
    const m = closeMeter();
    logRef.current.rests.push({
      plannedSec: exercise.restSeconds || 30,
      takenSec: m.elapsedMs / 1000,
      maxPauseMs: m.maxPauseMs,
      hiddenMs: m.hiddenMs,
    });
    emitLog();
  };

  const beginWork = () => {
    playGoSound();
    startMeter();
    if (timing.isTimed) {
      setPhase("work");
      setSecondsLeft(timing.workSeconds);
      setRunning(true);
    } else {
      // rep-based: no countdown to run, just waits on the "Done" tap
      setPhase("work");
      setRunning(false);
    }
  };

  const beginCountdown = () => {
    setCountdownValue(COUNTDOWN_FROM);
    setPhase("countdown");
    playCountdownTick();
  };

  const advanceAfterWork = (remaining: number | null) => {
    recordWork(remaining);
    if (isLastSet) {
      playCompleteSound();
      setPhase("done");
      setRunning(false);
      return;
    }
    playRestSound();
    startMeter();
    setPhase("rest");
    setSecondsLeft(exercise.restSeconds || 30);
    setRunning(true);
  };

  const advanceAfterRest = () => {
    recordRest();
    setSet((s) => s + 1);
    // Fully hands-free from here: rest rolls straight into the next set's
    // 3-2-1 countdown rather than waiting for another tap, so a timed
    // exercise can run start-to-finish on audio cues alone.
    beginCountdown();
  };

  // countdown-before-start ticker
  useEffect(() => {
    if (phase !== "countdown" || externallyPaused) return;
    if (countdownValue <= 0) return;
    const t = setTimeout(() => {
      const next = countdownValue - 1;
      if (next === 0) {
        beginWork();
      } else {
        playCountdownTick();
        setCountdownValue(next);
      }
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdownValue, externallyPaused]);

  // work/rest countdown loop
  useEffect(() => {
    if (!running || externallyPaused) return;
    if (phase !== "work" && phase !== "rest") return;
    if (secondsLeft === null) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) return s;
        if (s > 1) return s - 1;
        if (phase === "work") advanceAfterWork(0);
        else advanceAfterRest();
        return 0;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, externallyPaused]);

  const start = () => {
    if (externallyPaused) return;
    if (phase === "idle") {
      beginCountdown();
    } else {
      setRunning(true);
    }
  };

  const finishRepSet = () => {
    advanceAfterWork(null);
  };

  const reset = () => {
    setSet(1);
    setPhase("idle");
    setCountdownValue(COUNTDOWN_FROM);
    setSecondsLeft(timing.workSeconds);
    setRunning(false);
    firedComplete.current = false;
    // a reset means "start over" — the aborted attempt isn't representative
    logRef.current = { sets: [], rests: [], workPauses: 0 };
    setRepLog([]);
    emitLog();
  };

  const skip = () => {
    if (phase === "countdown") {
      beginWork();
    } else if (phase === "work") {
      advanceAfterWork(secondsLeft);
    } else if (phase === "rest") {
      advanceAfterRest();
    }
  };

  useEffect(() => {
    if (phase === "done" && !firedComplete.current) {
      firedComplete.current = true;
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const mm = secondsLeft !== null ? String(Math.floor(secondsLeft / 60)).padStart(2, "0") : "--";
  const ss = secondsLeft !== null ? String(secondsLeft % 60).padStart(2, "0") : "--";

  return (
    <div className="mt-2 p-3 rounded-lg bg-zinc-800/60 border border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-400">
          {tx("Set {a} of {b}", { a: Math.min(set, timing.sets), b: timing.sets })}
        </span>
        {phase !== "done" && (
          <button onClick={reset} className="text-xs text-muted hover:text-zinc-300">
            {tx("Reset")}
          </button>
        )}
      </div>

      {phase === "done" ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm py-2 justify-center">
          <Check size={16} /> {tx("Exercise complete!")}
        </div>
      ) : phase === "idle" ? (
        <button
          onClick={start}
          disabled={externallyPaused}
          className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Play size={16} /> {timing.isTimed ? tx("Start timer") : tx("Start set {n}", { n: set })}
        </button>
      ) : phase === "countdown" ? (
        <div className="text-center py-2">
          <div className="text-xs uppercase tracking-wide text-muted mb-1">{tx("Get ready")}</div>
          <div key={countdownValue} className="stat-mono text-5xl text-orange-400 animate-pop-in">
            {countdownValue}
          </div>
        </div>
      ) : phase === "work" && !timing.isTimed ? (
        <div className="text-center space-y-2">
          <div className="text-sm text-zinc-300">{tx("Do your reps, then mark the set done.")}</div>
          <button
            onClick={finishRepSet}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-sm font-medium"
          >
            {tx("Done with set {n}", { n: set })}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className={`text-xs uppercase tracking-wide mb-1 ${phase === "work" ? "text-orange-400" : "text-emerald-400"}`}>
            {externallyPaused ? tx("Paused") : phase === "work" ? tx("Go") : tx("Rest")}
          </div>
          <div className="stat-mono text-4xl text-zinc-100 mb-2">
            {mm}:{ss}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => !externallyPaused && setRunning((r) => !r)}
              disabled={externallyPaused}
              className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center disabled:opacity-50"
              aria-label={running ? tx("Pause") : tx("Resume")}
            >
              {running && !externallyPaused ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={skip}
              disabled={externallyPaused}
              className="w-10 h-10 rounded-full border border-zinc-600 text-zinc-300 flex items-center justify-center disabled:opacity-50"
              aria-label={tx("Skip")}
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      )}

      {repSetIdx >= 0 && (phase === "rest" || phase === "done") && (
        <div className="mt-3 pt-3 border-t border-zinc-700 flex items-center gap-2">
          <span className="text-xs text-zinc-400 flex-1">{tx("Reps in set {n}", { n: repSetIdx + 1 })}</span>
          <button
            type="button"
            aria-label={tx("Fewer reps")}
            onClick={() => logReps(Math.max(0, (repLog[repSetIdx] ?? repDefault) - 1))}
            className="w-7 h-7 rounded-lg border border-zinc-600 text-zinc-300"
          >
            −
          </button>
          <span className={`stat-mono w-8 text-center text-sm ${repLog[repSetIdx] === undefined ? "text-muted" : "text-zinc-100"}`}>
            {repLog[repSetIdx] ?? repDefault}
          </span>
          <button
            type="button"
            aria-label={tx("More reps")}
            onClick={() => logReps((repLog[repSetIdx] ?? repDefault) + 1)}
            className="w-7 h-7 rounded-lg border border-zinc-600 text-zinc-300"
          >
            +
          </button>
          {repLog[repSetIdx] === undefined && (
            <button
              type="button"
              onClick={() => logReps(repDefault)}
              className="text-xs px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-300"
            >
              {tx("Log")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
