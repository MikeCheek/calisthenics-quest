"use client";

import { useEffect, useRef, useState } from "react";
import { Exercise } from "@/lib/types";
import { parseTiming } from "@/lib/exerciseTiming";
import { playCountdownTick, playGoSound, playRestSound, playCompleteSound } from "@/lib/sound";
import { Play, Pause, SkipForward, Check } from "lucide-react";

type Phase = "idle" | "countdown" | "work" | "rest" | "done";

const COUNTDOWN_FROM = 3;

export default function ExerciseTimer({
  exercise,
  onComplete,
}: {
  exercise: Exercise;
  onComplete?: () => void;
}) {
  const timing = parseTiming(exercise.detail);
  const [set, setSet] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdownValue, setCountdownValue] = useState(COUNTDOWN_FROM);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(timing.workSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedComplete = useRef(false);

  const isLastSet = set >= timing.sets;

  const beginWork = () => {
    playGoSound();
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

  const advanceAfterWork = () => {
    if (isLastSet) {
      playCompleteSound();
      setPhase("done");
      setRunning(false);
      return;
    }
    playRestSound();
    setPhase("rest");
    setSecondsLeft(exercise.restSeconds || 30);
    setRunning(true);
  };

  const advanceAfterRest = () => {
    setSet((s) => s + 1);
    // Fully hands-free from here: rest rolls straight into the next set's
    // 3-2-1 countdown rather than waiting for another tap, so a timed
    // exercise can run start-to-finish on audio cues alone.
    beginCountdown();
  };

  // countdown-before-start ticker
  useEffect(() => {
    if (phase !== "countdown") return;
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
  }, [phase, countdownValue]);

  // work/rest countdown loop
  useEffect(() => {
    if (!running) return;
    if (phase !== "work" && phase !== "rest") return;
    if (secondsLeft === null) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) return s;
        if (s > 1) return s - 1;
        if (phase === "work") advanceAfterWork();
        else advanceAfterRest();
        return 0;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  const start = () => {
    if (phase === "idle") {
      beginCountdown();
    } else {
      setRunning(true);
    }
  };

  const finishRepSet = () => {
    advanceAfterWork();
  };

  const reset = () => {
    setSet(1);
    setPhase("idle");
    setCountdownValue(COUNTDOWN_FROM);
    setSecondsLeft(timing.workSeconds);
    setRunning(false);
    firedComplete.current = false;
  };

  const skip = () => {
    if (phase === "countdown") {
      beginWork();
    } else if (phase === "work") {
      advanceAfterWork();
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
          Set {Math.min(set, timing.sets)} of {timing.sets}
        </span>
        {phase !== "done" && (
          <button onClick={reset} className="text-xs text-zinc-500 hover:text-zinc-300">
            Reset
          </button>
        )}
      </div>

      {phase === "done" ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm py-2 justify-center">
          <Check size={16} /> Exercise complete!
        </div>
      ) : phase === "idle" ? (
        <button
          onClick={start}
          className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium flex items-center justify-center gap-2"
        >
          <Play size={16} /> {timing.isTimed ? "Start timer" : `Start set ${set}`}
        </button>
      ) : phase === "countdown" ? (
        <div className="text-center py-2">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Get ready</div>
          <div key={countdownValue} className="stat-mono text-5xl text-orange-400 animate-pop-in">
            {countdownValue}
          </div>
        </div>
      ) : phase === "work" && !timing.isTimed ? (
        <div className="text-center space-y-2">
          <div className="text-sm text-zinc-300">Do your reps, then mark the set done.</div>
          <button
            onClick={finishRepSet}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-sm font-medium"
          >
            Done with set {set}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className={`text-xs uppercase tracking-wide mb-1 ${phase === "work" ? "text-orange-400" : "text-emerald-400"}`}>
            {phase === "work" ? "Go" : "Rest"}
          </div>
          <div className="stat-mono text-4xl text-zinc-100 mb-2">
            {mm}:{ss}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center"
              aria-label={running ? "Pause" : "Resume"}
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={skip}
              className="w-10 h-10 rounded-full border border-zinc-600 text-zinc-300 flex items-center justify-center"
              aria-label="Skip"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
