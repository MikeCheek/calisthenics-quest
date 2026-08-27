"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { playCountdownTick, playGoSound, playRestSound } from "@/lib/sound";

type Phase = "work" | "rest" | "longRest";

const PHASE_LABEL: Record<Phase, string> = {
  work: "Training Block",
  rest: "Rest",
  longRest: "Long Rest",
};

const COUNTDOWN_FROM = 3;

export default function PomodoroTimer() {
  const [workMin, setWorkMin] = useState(25);
  const [restMin, setRestMin] = useState(5);
  const [longRestMin, setLongRestMin] = useState(15);
  const [roundsBeforeLong, setRoundsBeforeLong] = useState(4);

  const [phase, setPhase] = useState<Phase>("work");
  const [round, setRound] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60);
  const [running, setRunning] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [everStarted, setEverStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseSeconds = (p: Phase) =>
    p === "work" ? workMin * 60 : p === "rest" ? restMin * 60 : longRestMin * 60;

  // 3-2-1 countdown before the very first start (or after a reset) — a
  // pause/resume mid-session doesn't re-trigger it, only a genuinely fresh
  // start does.
  useEffect(() => {
    if (countdownValue === null) return;
    if (countdownValue <= 0) return;
    const t = setTimeout(() => {
      const next = countdownValue - 1;
      if (next === 0) {
        setCountdownValue(null);
        setEverStarted(true);
        setRunning(true);
        playGoSound();
      } else {
        playCountdownTick();
        setCountdownValue(next);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [countdownValue]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // phase transition — a distinct sound for "go train" vs "rest now"
        // so it's usable eyes-free with earphones
        if (phase === "work") {
          playRestSound();
          const nextIsLong = round % roundsBeforeLong === 0;
          const nextPhase: Phase = nextIsLong ? "longRest" : "rest";
          setPhase(nextPhase);
          return phaseSeconds(nextPhase);
        } else {
          playGoSound();
          setPhase("work");
          setRound((r) => r + 1);
          return phaseSeconds("work");
        }
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, roundsBeforeLong]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    if (countdownValue !== null) return; // already counting down
    if (!everStarted) {
      setCountdownValue(COUNTDOWN_FROM);
      playCountdownTick();
    } else {
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    setCountdownValue(null);
    setEverStarted(false);
    setPhase("work");
    setRound(1);
    setSecondsLeft(workMin * 60);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const total = phaseSeconds(phase);
  const pct = Math.round(((total - secondsLeft) / total) * 100);
  const counting = countdownValue !== null;

  return (
    <div className="panel rounded-lg p-5">
      <div className="heading text-lg text-zinc-100 mb-4">Focus Timer</div>

      <div className="text-center">
        {counting ? (
          <>
            <div className="text-xs uppercase tracking-widest text-orange-400 mb-1">Get ready</div>
            <div key={countdownValue} className="stat-mono text-6xl text-orange-400 mb-3 animate-pop-in">
              {countdownValue}
            </div>
          </>
        ) : (
          <>
            <div className="text-xs uppercase tracking-widest text-emerald-400 mb-1">
              {PHASE_LABEL[phase]} · Round {round}
            </div>
            <div className="stat-mono text-6xl text-zinc-100 mb-3">
              {mm}:{ss}
            </div>
          </>
        )}
        <div className="h-2 w-full bg-zinc-800 rounded-lg overflow-hidden mb-4">
          <div
            className={`h-full transition-all duration-1000 ${
              phase === "work" ? "bg-orange-500" : "bg-emerald-500"
            }`}
            style={{ width: counting ? 0 : `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggle}
            disabled={counting}
            className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center disabled:opacity-60"
            aria-label={running ? "Pause" : "Start"}
          >
            {running ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={reset}
            className="w-12 h-12 rounded-full border border-zinc-600 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center justify-center"
            aria-label="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
        <label className="flex flex-col gap-1 text-zinc-400">
          Work (min)
          <input
            type="number"
            min={1}
            value={workMin}
            onChange={(e) => {
              const v = Number(e.target.value) || 1;
              setWorkMin(v);
              if (phase === "work" && !running) setSecondsLeft(v * 60);
            }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-zinc-400">
          Rest (min)
          <input
            type="number"
            min={1}
            value={restMin}
            onChange={(e) => setRestMin(Number(e.target.value) || 1)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-zinc-400">
          Long rest (min)
          <input
            type="number"
            min={1}
            value={longRestMin}
            onChange={(e) => setLongRestMin(Number(e.target.value) || 1)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-zinc-400">
          Rounds before long rest
          <input
            type="number"
            min={2}
            value={roundsBeforeLong}
            onChange={(e) => setRoundsBeforeLong(Number(e.target.value) || 2)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-100"
          />
        </label>
      </div>
    </div>
  );
}
