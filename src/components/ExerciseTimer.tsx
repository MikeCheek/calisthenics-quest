"use client";

import { useEffect, useRef, useState } from "react";
import { Exercise } from "@/lib/types";
import { parseTiming } from "@/lib/exerciseTiming";
import { playBeep } from "@/lib/sound";
import { Play, Pause, SkipForward, Check } from "lucide-react";

type Phase = "idle" | "work" | "rest" | "done";

export default function ExerciseTimer({ exercise }: { exercise: Exercise }) {
  const timing = parseTiming(exercise.detail);
  const [set, setSet] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(timing.workSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLastSet = set >= timing.sets;

  const advanceAfterWork = () => {
    playBeep(880, 250);
    if (isLastSet) {
      setPhase("done");
      setRunning(false);
      return;
    }
    setPhase("rest");
    setSecondsLeft(exercise.restSeconds || 30);
  };

  const advanceAfterRest = () => {
    playBeep(660, 300);
    setSet((s) => s + 1);
    setPhase("idle");
    setSecondsLeft(timing.workSeconds);
    setRunning(false);
  };

  // countdown loop — drives both timed work and rest phases
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
      if (timing.isTimed) {
        setPhase("work");
        setSecondsLeft(timing.workSeconds);
        setRunning(true);
      } else {
        // rep-based: no countdown, just marks the set "in progress"
        setPhase("work");
        setRunning(false);
      }
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
    setSecondsLeft(timing.workSeconds);
    setRunning(false);
  };

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
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
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
              onClick={() => (phase === "work" ? advanceAfterWork() : advanceAfterRest())}
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
