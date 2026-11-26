"use client";

import { useEffect, useRef, useState } from "react";
import { Exercise } from "@/lib/types";
import { countUnit, isOpenHold, parseTiming, targetCount, type CountUnit } from "@/lib/exerciseTiming";
import { TimerLog, EMPTY_TIMER_LOG } from "@/lib/timingLearning";
import { loadTimer, saveTimer, secondsLeftOf } from "@/lib/activeSession";

export type TimerEvent =
  | { type: "setStart"; set: number; sets: number }
  | { type: "tenLeft" }
  | { type: "rest"; seconds: number }
  | { type: "done" };
import { playCountdownTick, playGoSound, playRestSound, playCompleteSound } from "@/lib/sound";
import { Play, Pause, SkipForward, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Phase = "idle" | "countdown" | "work" | "rest" | "done";

const COUNTDOWN_FROM = 3;

// the logger under a set speaks the exercise's own unit
type LogUnit = CountUnit | "seconds";
const LOG_LABEL: Record<LogUnit, string> = { reps: "Reps in set {n}", laps: "Laps in set {n}", attempts: "Attempts in set {n}", steps: "Steps in set {n}", seconds: "Seconds held in set {n}" };
const LESS_LABEL: Record<LogUnit, string> = { reps: "Fewer reps", laps: "Fewer laps", attempts: "Fewer attempts", steps: "Fewer steps", seconds: "5 seconds less" };
const MORE_LABEL: Record<LogUnit, string> = { reps: "More reps", laps: "More laps", attempts: "More attempts", steps: "More steps", seconds: "5 seconds more" };

export default function ExerciseTimer({
  exercise,
  onComplete,
  externallyPaused,
  onLog,
  onEvent,
  persist,
  onStopEarly,
}: {
  exercise: Exercise;
  // "Finish here" between sets: called with how many sets were done, then
  // the exercise completes with only those logged
  onStopEarly?: (setsDone: number) => void;
  // guided mode: keep this timer on the device (see lib/activeSession.ts),
  // so a reload mid-set picks up at the same set, phase and time
  persist?: { sessionId: string; step: number };
  onComplete?: () => void;
  // Receives the raw timing log (holds, rests, pauses) after every set and
  // rest, so the session can learn from it — cleaning happens downstream.
  onLog?: (log: TimerLog) => void;
  // Forces the timer to pause regardless of its own play/resume state —
  // used by the "Pause Training" control in the full-screen guided mode,
  // which needs to stop a running countdown from outside this component.
  externallyPaused?: boolean;
  // Coaching moments (for voice cues in guided mode).
  onEvent?: (e: TimerEvent) => void;
}) {
  const timing = parseTiming(exercise.detail);
  const { tx } = useLanguage();
  // lower end of the prescribed count ("3 x 8-10 reps" -> 8, "1-2 laps" -> 1); null = max
  const targetReps = targetCount(exercise.detail);
  const unit = countUnit(exercise.detail);
  const openHold = timing.isTimed && isOpenHold(exercise.detail);
  // a max hold, a skill check or an "accumulate" target: the countdown is the
  // goal, not the limit — at zero it keeps counting up until you tap Done,
  // so a longer hold is recorded in full
  const keepsGoing = timing.isTimed && timing.workSeconds !== null && (openHold || !!exercise.check || /accumulate|max attempt/i.test(exercise.detail));
  const [overSec, setOverSec] = useState<number | null>(null);
  const overStart = useRef<number | null>(null);
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
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  // state updaters can run twice in development — emit each moment once
  const lastEvent = useRef("");
  const emitEvent = (e: TimerEvent, key: string) => {
    if (lastEvent.current === key) return;
    lastEvent.current = key;
    onEventRef.current?.(e);
  };
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
  // (open-ended holds log the seconds held instead, in steps of 5)
  const repSetIdx = timing.isTimed && !openHold ? -1 : logRef.current.sets.length - 1;
  const lastLogged = [...repLog].reverse().find((r) => r !== undefined);
  const heldNow = Math.round(logRef.current.sets[repSetIdx]?.activeSec ?? 0);
  const repDefault = openHold ? heldNow || 10 : lastLogged ?? targetReps ?? (unit === "laps" ? 1 : 5);
  const step = openHold ? 5 : 1;
  const logReps = (v: number) => {
    const sample = logRef.current.sets[repSetIdx];
    if (!sample) return;
    if (openHold) {
      sample.loggedSec = v;
      sample.endedEarly = false;
    } else sample.reps = v;
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
    // in overtime, the extra seconds count as held (a negative "remaining")
    if (overStart.current !== null) {
      remaining = -Math.floor((Date.now() - overStart.current) / 1000);
      overStart.current = null;
      setOverSec(null);
    }
    recordWork(remaining);
    if (isLastSet) {
      playCompleteSound();
      emitEvent({ type: "done" }, `done-${set}`);
      setPhase("done");
      setRunning(false);
      return;
    }
    playRestSound();
    startMeter();
    emitEvent({ type: "rest", seconds: exercise.restSeconds || 30 }, `rest-${set}`);
    setPhase("rest");
    setSecondsLeft(exercise.restSeconds || 30);
    setRunning(true);
  };

  const advanceAfterRest = () => {
    recordRest();
    emitEvent({ type: "setStart", set: set + 1, sets: timing.sets }, `set-${set + 1}`);
    setSet((s) => s + 1);
    // Fully hands-free from here: rest rolls straight into the next set's
    // 3-2-1 countdown rather than waiting for another tap, so a timed
    // exercise can run start-to-finish on audio cues alone.
    beginCountdown();
  };

  // ---- kept on the device in guided mode ----
  const restored = useRef(false);
  useEffect(() => {
    if (!persist || restored.current) return;
    restored.current = true;
    const t = loadTimer(persist.sessionId, persist.step);
    if (!t) return;
    logRef.current = { sets: [...t.log.sets], rests: [...t.log.rests], workPauses: t.log.workPauses };
    setRepLog(t.log.sets.map((x) => x.reps));
    setSet(t.set);
    setPhase(t.phase);
    setSecondsLeft(secondsLeftOf(t.endsAt, t.secondsLeft) ?? timing.workSeconds);
    setRunning(t.endsAt !== null);
    // the interrupted set or rest counts as time away, so the timing
    // learning leaves it out rather than learning from it
    meter.current = { start: Date.now(), pausedMs: 0, maxPauseMs: 0, pauseStart: null, hiddenMs: 1e9, hiddenStart: null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!persist || !restored.current) return;
    if (phase === "work" || phase === "rest") {
      const live = running && !externallyPaused && secondsLeft !== null;
      saveTimer({
        ...persist,
        set,
        phase,
        endsAt: live ? Date.now() + (secondsLeft ?? 0) * 1000 : null,
        secondsLeft: live ? null : secondsLeft,
        log: logRef.current,
      });
    } else if (phase === "done") {
      if (loadTimer(persist.sessionId, persist.step)) saveTimer(null);
    }
    // saved on changes of state, not on every second of a countdown
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set, phase, running, externallyPaused]);

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

  // work/rest countdown loop. The clock, not the number of ticks, decides
  // what's left: browsers slow or suspend timers while the phone is locked
  // or the app is in the background, so each tick (and coming back to the
  // app) recomputes from the end time — a rest that ran out meanwhile ends.
  const endsAt = useRef<number | null>(null);
  const shownLeft = useRef<number | null>(null);
  useEffect(() => {
    if (!running || externallyPaused) return;
    if (phase !== "work" && phase !== "rest") return;
    if (secondsLeft === null) return;

    endsAt.current = Date.now() + secondsLeft * 1000;
    shownLeft.current = secondsLeft;
    const tick = () => {
      if (endsAt.current === null || overStart.current !== null) return;
      const left = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      const prev = shownLeft.current ?? left;
      if (left === prev && left > 0) return;
      shownLeft.current = left;
      // a heads-up on longer holds, ten seconds out
      if (phase === "work" && prev > 10 && left <= 10 && left > 0 && (timing.workSeconds ?? 0) >= 20) emitEvent({ type: "tenLeft" }, `ten-${set}`);
      if (left > 0) {
        setSecondsLeft(left);
        return;
      }
      endsAt.current = null;
      setSecondsLeft(0);
      if (phase === "work" && keepsGoing) {
        // target reached: keep going — counts up until Done
        playCompleteSound();
        overStart.current = Date.now();
        setOverSec(0);
        return;
      }
      if (phase === "work") advanceAfterWork(0);
      else advanceAfterRest();
    };
    intervalRef.current = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", tick);
      endsAt.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, externallyPaused]);

  useEffect(() => {
    if (overSec === null) return;
    const t = setInterval(() => overStart.current !== null && setOverSec(Math.floor((Date.now() - overStart.current) / 1000)), 250);
    return () => clearInterval(t);
  }, [overSec === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    if (externallyPaused) return;
    if (phase === "idle") {
      emitEvent({ type: "setStart", set: 1, sets: timing.sets }, "set-1");
      beginCountdown();
    } else {
      setRunning(true);
    }
  };

  const finishRepSet = () => {
    advanceAfterWork(null);
  };

  const reset = () => {
    overStart.current = null;
    setOverSec(null);
    setSet(1);
    setPhase("idle");
    setCountdownValue(COUNTDOWN_FROM);
    setSecondsLeft(timing.workSeconds);
    setRunning(false);
    firedComplete.current = false;
    // a reset means "start over" — the aborted attempt isn't representative
    logRef.current = { sets: [], rests: [], workPauses: 0 };
    lastEvent.current = "";
    setRepLog([]);
    emitLog();
  };

  // Done fewer sets than prescribed: log just those and finish.
  const finishEarly = () => {
    // the rest was cut short, so it isn't recorded as a rest sample
    onStopEarly?.(set);
    playCompleteSound();
    emitEvent({ type: "done" }, `done-${set}`);
    setPhase("done");
    setRunning(false);
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
    <div className="mt-2 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-300">
          {tx("Set {a} of {b}", { a: Math.min(set, timing.sets), b: timing.sets })}
        </span>
        {phase !== "done" && (
          <button onClick={reset} className="text-xs text-muted hover:text-zinc-300 px-2 py-1.5 -mr-2">
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
          className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Play size={20} /> {timing.isTimed ? tx("Start timer") : tx("Start set {n}", { n: set })}
        </button>
      ) : phase === "countdown" ? (
        <div className="text-center py-2">
          <div className="text-xs uppercase tracking-wide text-muted mb-1">{tx("Get ready")}</div>
          <div key={countdownValue} className="stat-mono text-6xl text-orange-400 animate-pop-in">
            {countdownValue}
          </div>
        </div>
      ) : phase === "work" && !timing.isTimed ? (
        <div className="text-center space-y-2">
          <div className="text-sm text-zinc-300">{tx("Do your reps, then mark the set done.")}</div>
          <button
            onClick={finishRepSet}
            className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-base font-semibold"
          >
            {tx("Done with set {n}", { n: set })}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className={`text-xs uppercase tracking-wide mb-1 ${phase === "work" ? "text-orange-400" : "text-emerald-400"}`}>
            {externallyPaused ? tx("Paused") : phase === "work" ? tx("Go") : tx("Rest")}
          </div>
          {overSec !== null ? (
            <>
              <div className="stat-mono text-6xl text-emerald-300 mb-1">
                +{String(Math.floor(overSec / 60)).padStart(2, "0")}:{String(overSec % 60).padStart(2, "0")}
              </div>
              <p className="text-sm text-zinc-300 mb-3">{tx("Target reached — keep holding, tap Done when you stop.")}</p>
              <button
                onClick={() => advanceAfterWork(0)}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-base font-semibold"
              >
                {tx("Done with set {n}", { n: set })}
              </button>
            </>
          ) : (
          <div className="stat-mono text-6xl text-zinc-100 mb-3">
            {mm}:{ss}
          </div>
          )}
          {overSec === null && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => !externallyPaused && setRunning((r) => !r)}
              disabled={externallyPaused}
              className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center disabled:opacity-50"
              aria-label={running ? tx("Pause") : tx("Resume")}
            >
              {running && !externallyPaused ? <Pause size={26} /> : <Play size={26} />}
            </button>
            <button
              onClick={skip}
              disabled={externallyPaused}
              className="w-16 h-16 rounded-full border border-zinc-600 text-zinc-200 flex items-center justify-center disabled:opacity-50"
              aria-label={phase === "rest" ? tx("Skip rest") : tx("Skip")}
            >
              <SkipForward size={24} />
            </button>
          </div>
          )}
          {phase === "rest" && onStopEarly && (
            <button
              onClick={finishEarly}
              className="mt-4 w-full py-3 rounded-xl border border-zinc-700 text-zinc-200 hover:border-zinc-500 text-sm"
            >
              {tx("Finish here — {a} of {b} sets", { a: set, b: timing.sets })}
            </button>
          )}
        </div>
      )}

      {repSetIdx >= 0 && (phase === "rest" || phase === "done") && (
        <div className="mt-3 pt-3 border-t border-zinc-700 flex items-center gap-2">
          <span className="text-sm text-zinc-300 flex-1">{tx(LOG_LABEL[openHold ? "seconds" : unit], { n: repSetIdx + 1 })}</span>
          <button
            type="button"
            aria-label={tx(LESS_LABEL[openHold ? "seconds" : unit])}
            onClick={() => logReps(Math.max(0, (repLog[repSetIdx] ?? repDefault) - step))}
            className="w-11 h-11 rounded-xl border border-zinc-600 text-zinc-100 text-xl"
          >
            −
          </button>
          <span className={`stat-mono w-10 text-center text-xl ${repLog[repSetIdx] === undefined ? "text-muted" : "text-zinc-100"}`}>
            {repLog[repSetIdx] ?? repDefault}
            {openHold && <span className="text-sm">s</span>}
          </span>
          <button
            type="button"
            aria-label={tx(MORE_LABEL[openHold ? "seconds" : unit])}
            onClick={() => logReps((repLog[repSetIdx] ?? repDefault) + step)}
            className="w-11 h-11 rounded-xl border border-zinc-600 text-zinc-100 text-xl"
          >
            +
          </button>
          {repLog[repSetIdx] === undefined && (
            <button
              type="button"
              onClick={() => logReps(repDefault)}
              className="h-11 text-sm px-3 rounded-xl bg-emerald-600/20 text-emerald-300"
            >
              {tx("Log")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
