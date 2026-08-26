"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

type Phase = "work" | "rest" | "longRest";

const PHASE_LABEL: Record<Phase, string> = {
  work: "Training Block",
  rest: "Rest",
  longRest: "Long Rest",
};

export default function PomodoroTimer() {
  const [workMin, setWorkMin] = useState(25);
  const [restMin, setRestMin] = useState(5);
  const [longRestMin, setLongRestMin] = useState(15);
  const [roundsBeforeLong, setRoundsBeforeLong] = useState(4);

  const [phase, setPhase] = useState<Phase>("work");
  const [round, setRound] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const phaseSeconds = (p: Phase) =>
    p === "work" ? workMin * 60 : p === "rest" ? restMin * 60 : longRestMin * 60;

  const beep = () => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 660;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // audio not available, ignore
    }
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // phase transition
        beep();
        if (phase === "work") {
          const nextIsLong = round % roundsBeforeLong === 0;
          const nextPhase: Phase = nextIsLong ? "longRest" : "rest";
          setPhase(nextPhase);
          return phaseSeconds(nextPhase);
        } else {
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

  const reset = () => {
    setRunning(false);
    setPhase("work");
    setRound(1);
    setSecondsLeft(workMin * 60);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const total = phaseSeconds(phase);
  const pct = Math.round(((total - secondsLeft) / total) * 100);

  return (
    <div className="panel rounded-lg p-5">
      <div className="heading text-lg text-zinc-100 mb-4">Focus Timer</div>

      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-emerald-400 mb-1">
          {PHASE_LABEL[phase]} · Round {round}
        </div>
        <div className="stat-mono text-6xl text-zinc-100 mb-3">
          {mm}:{ss}
        </div>
        <div className="h-2 w-full bg-zinc-800 rounded-lg overflow-hidden mb-4">
          <div
            className={`h-full transition-all duration-1000 ${
              phase === "work" ? "bg-orange-500" : "bg-emerald-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center"
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
