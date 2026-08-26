"use client";

import { useState } from "react";
import { SkillProfile, TrainingEquipment } from "@/lib/types";
import { WheelTrack, WHEEL_TRACK_LABEL, wheelPool } from "@/lib/wheelPool";
import ExerciseTimer from "@/components/ExerciseTimer";
import { playBeep } from "@/lib/sound";
import { Dices } from "lucide-react";

const TRACKS: WheelTrack[] = ["frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "legs", "core"];

const DIFFICULTIES: { value: -1 | 0 | 1; label: string }[] = [
  { value: -1, label: "Easier" },
  { value: 0, label: "Your level" },
  { value: 1, label: "Harder" },
];

const WEDGE_COLORS = ["#f97316", "#18181b", "#ea580c", "#27272a", "#fb923c", "#3f3f46"];

export default function DifficultyWheel({
  skills,
  equipment,
  defaultTrack,
}: {
  skills: SkillProfile;
  equipment: TrainingEquipment;
  defaultTrack?: WheelTrack;
}) {
  const [track, setTrack] = useState<WheelTrack>(defaultTrack ?? "frontLever");
  const [difficulty, setDifficulty] = useState<-1 | 0 | 1>(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ name: string; detail: string; restSeconds: number; cue?: string } | null>(null);

  const pool = wheelPool(track, skills, equipment, difficulty);
  const segCount = Math.max(1, pool.length);
  const anglePer = 360 / segCount;

  const gradient = pool
    .map((_, i) => `${WEDGE_COLORS[i % WEDGE_COLORS.length]} ${i * anglePer}deg ${(i + 1) * anglePer}deg`)
    .join(", ");

  const spin = () => {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    setResult(null);
    const winner = Math.floor(Math.random() * pool.length);
    const winnerCenter = winner * anglePer + anglePer / 2;
    const target = (360 - winnerCenter) % 360;
    const base = rotation - (rotation % 360);
    const nextRotation = base + 360 * 5 + target;
    setRotation(nextRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(pool[winner]);
      playBeep(880, 300);
    }, 3000);
  };

  return (
    <div className="panel p-4">
      <div className="heading text-base text-zinc-100 mb-1 flex items-center gap-2">
        <Dices size={16} className="text-orange-400" /> Spin for a bonus exercise
      </div>
      <p className="text-xs text-zinc-500 mb-3">
        Pick a skill and a difficulty relative to your level, then spin — it&apos;ll land on a
        random exercise at that difficulty, with the right sets and reps already set up.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {TRACKS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTrack(t);
              setResult(null);
            }}
            className={`text-xs px-2.5 py-1.5 rounded-lg border ${
              track === t ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-zinc-400"
            }`}
          >
            {WHEEL_TRACK_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 mb-4">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            onClick={() => {
              setDifficulty(d.value);
              setResult(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-sm border ${
              difficulty === d.value ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-zinc-400"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-48">
          <div
            className="absolute inset-0 rounded-full border-4 border-zinc-700"
            style={{
              background: `conic-gradient(${gradient})`,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 3s cubic-bezier(0.15, 0.75, 0.2, 1)" : "none",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-zinc-950 border-2 border-orange-500" />
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 pointer-events-none"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "14px solid #f97316",
            }}
          />
        </div>

        <button
          onClick={spin}
          disabled={spinning || pool.length === 0}
          className="px-6 py-2.5 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-50"
        >
          {spinning ? "Spinning..." : "Spin"}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-3 rounded-lg bg-zinc-800/60 border border-orange-500/40">
          <div className="text-sm font-medium text-zinc-100">{result.name}</div>
          <div className="text-xs text-zinc-400 mb-1">{result.detail}</div>
          {result.cue && <div className="text-xs text-orange-400/80 italic mb-1">{result.cue}</div>}
          <ExerciseTimer exercise={result} />
        </div>
      )}
    </div>
  );
}
