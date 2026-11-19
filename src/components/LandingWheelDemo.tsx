"use client";

import { useState } from "react";
import { Exercise, StagedSkillKey, SKILL_FIELD_LABEL, DEFAULT_SKILLS, DEFAULT_EQUIPMENT } from "@/lib/types";
import { wheelPoolWeighted } from "@/lib/wheelPool";
import { useLanguage } from "@/context/LanguageContext";
import { localizedDescription } from "@/lib/exerciseTiming";
import ExerciseTimer from "@/components/ExerciseTimer";
import { playBeep } from "@/lib/sound";
import SkillInfoModal from "@/components/SkillInfoModal";
import InfoIconButton from "@/components/InfoIconButton";
import { Dices, Sparkles } from "lucide-react";

// A curated slice of the full 50-skill roster — enough variety to show
// range (beginner-friendly through absurd) without listing all 50 on a
// page meant to convert a first-time visitor in a few seconds.
const DEMO_SKILLS: StagedSkillKey[] = [
  "frontLever", "backLever", "planche", "muscleUp", "handstand",
  "humanFlag", "pistolSquat", "lSit", "oneArmPullUp", "dragonFlag",
  "ironCross", "victorianCross",
];

const WEDGE_COLORS = ["#f97316", "#18181b", "#ea580c", "#27272a", "#fb923c", "#3f3f46", "#c2410c", "#52525b"];
const WHEEL_SPIN_MS = 2600;

export default function LandingWheelDemo() {
  const { locale, tx } = useLanguage();
  const [skill, setSkill] = useState<StagedSkillKey>("frontLever");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Exercise | null>(null);
  const [infoSkill, setInfoSkill] = useState<StagedSkillKey | null>(null);

  // No account yet, so there's no real stage/equipment to weight by — this
  // spins at a beginner-appropriate difficulty using the same pool logic
  // the real wheel uses once you're signed in.
  const pool = wheelPoolWeighted(skill, DEFAULT_SKILLS, DEFAULT_EQUIPMENT, 0);
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
    setRotation(base + 360 * 5 + target);

    setTimeout(() => {
      setSpinning(false);
      setResult(pool[winner]);
      playBeep(880, 300);
    }, WHEEL_SPIN_MS);
  };

  return (
    <div className="panel p-4">
      <div className="heading text-base text-zinc-100 mb-1 flex items-center gap-2">
        <Dices size={16} className="text-orange-400" /> {tx("Try the bonus wheel")}
      </div>
      <p className="text-xs text-muted mb-3">
        {tx("No account needed — pick a skill and spin for a real exercise, exactly like the wheel you'll get once you sign in.")}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {DEMO_SKILLS.map((s) => (
          <div
            key={s}
            className={`flex items-center gap-1 pl-2.5 pr-1.5 py-1.5 rounded-lg border text-xs ${
              skill === s ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-zinc-400"
            }`}
          >
            <button
              disabled={spinning}
              onClick={() => {
                setSkill(s);
                setResult(null);
              }}
              className="disabled:opacity-50"
            >
              {tx(SKILL_FIELD_LABEL[s])}
            </button>
            <InfoIconButton onClick={() => setInfoSkill(s)} label={tx("About {skill}", { skill: tx(SKILL_FIELD_LABEL[s]) })} size={11} />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-48">
          <div
            className="absolute inset-0 rounded-full border-4 border-zinc-700"
            style={{
              background: `conic-gradient(${gradient})`,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? `transform ${WHEEL_SPIN_MS}ms cubic-bezier(0.12, 0.72, 0.18, 1)` : "none",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-zinc-950 border-2 border-orange-500 flex items-center justify-center">
              <span className="text-base">🎯</span>
            </div>
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-0 h-0 pointer-events-none"
            style={{
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "13px solid #f97316",
            }}
          />
        </div>

        <button
          onClick={spin}
          disabled={spinning || pool.length === 0}
          className="px-6 py-2.5 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-50"
        >
          {spinning ? tx("Spinning…") : `🎰 ${tx("Spin")}`}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-3 rounded-lg bg-zinc-800/60 border border-orange-500/40 animate-pop-in">
          <div className="text-sm font-medium text-zinc-100">{result.name}</div>
          <div className="text-xs text-zinc-400 mb-2">{result.detail}</div>
          {result.description && <p className="text-xs text-zinc-300 mb-2">{localizedDescription(result, locale)}</p>}
          {/* the AI routes need an account, so visitors get a pointer instead of a button that would refuse */}
          <div className="mb-2 text-xs text-zinc-400 flex items-center gap-1.5">
            <Sparkles size={12} className="text-orange-400 shrink-0" />
            {tx("AI technique tips for every exercise unlock when you sign in — or try it as a guest.")}
          </div>
          <ExerciseTimer exercise={result} />
          <div className="text-xs text-muted mt-3 text-center">
            {tx("Sign in to save this, bank bonus XP, and unlock all 50 skills")}
          </div>
        </div>
      )}

      <SkillInfoModal skill={infoSkill} onClose={() => setInfoSkill(null)} showTrainCta={false} />
    </div>
  );
}
