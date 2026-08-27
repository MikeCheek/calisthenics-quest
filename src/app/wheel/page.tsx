"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseTipButton from "@/components/ExerciseTipButton";
import ModifierReel from "@/components/ModifierReel";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { Exercise, StagedSkillKey, SKILL_FIELD_LABEL } from "@/lib/types";
import { wheelPoolWeighted, wheelTrackAvailable } from "@/lib/wheelPool";
import { isSkillAStretch, suggestEasierSkill, firstPathLevelForSkill, effectiveLevel } from "@/lib/levelPath";
import { Modifier, pickRandomModifier, applyModifier, modifierXpMultiplier } from "@/lib/wheelModifiers";
import { awardXp, Celebration } from "@/lib/sessionComplete";
import { playBeep } from "@/lib/sound";
import { Sparkles, X } from "lucide-react";

const SKILL_ORDER: StagedSkillKey[] = [
  "frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit",
  "oneArmPullUp", "oneArmPushUp", "oneArmHandstand", "handstandPushUp",
  "dragonFlag", "elbowLever", "manna", "nordicCurl", "shrimpSquat",
  "ironCross", "maltese", "impossibleDip",
  "chestToBarPullUp", "wideGripPullUp", "typewriterPullUp", "toesToBar", "lSitPullUp",
  "skinTheCat", "germanHang", "flagPullUp", "ringMuscleUp", "ninetyDegreePushUp",
  "clapPushUp", "kipUp", "handstandWalk", "wallWalk", "pikePress",
  "supermanHold", "sidePlank", "copenhagenPlank", "bridge", "turkishGetUp",
  "jumpPistol", "sissySquat", "cossackSquat", "ropeClimb",
  "backFlip", "frontFlip", "windmill", "aroundTheWorld",
  "invertedCross", "victorianCross",
];

const DIFFICULTIES: { value: -1 | 0 | 1; label: string }[] = [
  { value: -1, label: "Easier" },
  { value: 0, label: "Your level" },
  { value: 1, label: "Harder" },
];

const WEDGE_COLORS = ["#f97316", "#18181b", "#ea580c", "#27272a", "#fb923c", "#3f3f46", "#c2410c", "#52525b"];
const WHEEL_SPIN_MS = 3000;
const MODIFIER_REVEAL_DELAY_MS = 2000;
const BASE_BONUS_XP = 10;

type SpinPhase = "idle" | "wheelSpinning" | "wheelLanded" | "composed";

export default function WheelPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>
      }
    >
      <WheelContent />
    </Suspense>
  );
}

function WheelContent() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedSkill = searchParams.get("skill") as StagedSkillKey | null;

  const [track, setTrack] = useState<StagedSkillKey>(requestedSkill ?? "frontLever");
  const [difficulty, setDifficulty] = useState<-1 | 0 | 1>(0);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinPhase, setSpinPhase] = useState<SpinPhase>("idle");
  const [landedExercise, setLandedExercise] = useState<Exercise | null>(null);
  const [modifierPhase, setModifierPhase] = useState<"idle" | "cycling" | "revealed">("idle");
  const [modifier, setModifier] = useState<Modifier | null>(null);
  const [composed, setComposed] = useState<Exercise | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [displayPool, setDisplayPool] = useState<Exercise[]>([]);
  const spinPoolRef = useRef<Exercise[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Recompute the visible wheel only while idle — freezing it during a spin
  // (rather than reshuffling on every re-render) is what keeps the wedges
  // visually stable while the wheel is animating.
  useEffect(() => {
    if (!userDoc || spinPhase !== "idle") return;
    setDisplayPool(wheelPoolWeighted(track, userDoc.skills, userDoc.equipment, difficulty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDoc, track, difficulty, spinPhase]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const playerLevel = effectiveLevel(userDoc.xp, userDoc.skills, userDoc.skillMastery);
  const trackIsStretch = isSkillAStretch(track, playerLevel) && !suggestionDismissed;
  const easierSuggestion = trackIsStretch ? suggestEasierSkill(playerLevel, userDoc.skills) : null;
  const firstLevel = firstPathLevelForSkill(track);

  const currentPool = displayPool;
  const segCount = Math.max(1, currentPool.length);
  const anglePer = 360 / segCount;
  const gradient = currentPool
    .map((_, i) => `${WEDGE_COLORS[i % WEDGE_COLORS.length]} ${i * anglePer}deg ${(i + 1) * anglePer}deg`)
    .join(", ");

  const spin = () => {
    if (spinPhase !== "idle" || currentPool.length === 0) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    spinPoolRef.current = currentPool;
    setLandedExercise(null);
    setModifier(null);
    setComposed(null);
    setXpAwarded(null);
    setSpinPhase("wheelSpinning");
    setModifierPhase("cycling");

    const winner = Math.floor(Math.random() * currentPool.length);
    const winnerCenter = winner * anglePer + anglePer / 2;
    const target = (360 - winnerCenter) % 360;
    const base = rotation - (rotation % 360);
    setRotation(base + 360 * 6 + target);

    const t1 = setTimeout(() => {
      setSpinPhase("wheelLanded");
      setLandedExercise(spinPoolRef.current[winner]);
      playBeep(700, 250);
    }, WHEEL_SPIN_MS);

    const t2 = setTimeout(() => {
      const m = pickRandomModifier();
      setModifier(m);
      setModifierPhase("revealed");
      const finalExercise = applyModifier(spinPoolRef.current[winner], m);
      setComposed(finalExercise);
      setSpinPhase("composed");
      playBeep(m.kind === "golden" || m.kind === "doubleXp" ? 1046 : 880, m.kind === "golden" ? 500 : 300);
    }, WHEEL_SPIN_MS + MODIFIER_REVEAL_DELAY_MS);

    timers.current = [t1, t2];
  };

  const resetSpin = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSpinPhase("idle");
    setLandedExercise(null);
    setModifier(null);
    setComposed(null);
    setModifierPhase("idle");
    setXpAwarded(null);
  };

  const handleExerciseComplete = async () => {
    if (xpAwarded !== null) return; // already awarded for this spin
    const multiplier = modifier ? modifierXpMultiplier(modifier) : 1;
    const amount = BASE_BONUS_XP * multiplier;
    const result = await awardXp(userDoc, amount);
    setXpAwarded(amount);
    if (result.leveledUp) {
      setCelebration({ leveledUp: true, newLevel: result.newLevel, streakEvent: "none", newStreak: userDoc.streak });
    }
    await refreshUserDoc();
  };

  const availableSkills = SKILL_ORDER.filter((s) => wheelTrackAvailable(s, userDoc.equipment));
  const spinning = spinPhase === "wheelSpinning";

  return (
    <>
      <Nav />
      <CelebrationOverlay celebration={celebration} />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <div>
          <h1 className="heading text-2xl text-zinc-100">Bonus wheel</h1>
          <p className="text-zinc-400 text-sm">
            Pick a skill and a difficulty, spin, and let chance pick your bonus exercise —
            with a randomized bonus or malus thrown in.
          </p>
        </div>

        <div>
          <div className="text-xs text-zinc-400 mb-1.5">Skill ({availableSkills.length} available)</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {availableSkills.map((s) => (
              <button
                key={s}
                disabled={spinning}
                onClick={() => {
                  setTrack(s);
                  setSuggestionDismissed(false);
                }}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm border whitespace-nowrap disabled:opacity-50 ${
                  track === s ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-zinc-400"
                }`}
              >
                {SKILL_FIELD_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              disabled={spinning}
              onClick={() => setDifficulty(d.value)}
              className={`flex-1 py-1.5 rounded-lg text-sm border disabled:opacity-50 ${
                difficulty === d.value ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-zinc-400"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {trackIsStretch && easierSuggestion?.skill && (
          <div className="panel p-3 border-orange-500/40 flex items-start gap-2">
            <Sparkles size={14} className="text-orange-400 mt-0.5 shrink-0" />
            <div className="flex-1 text-xs text-zinc-300">
              {SKILL_FIELD_LABEL[track]} is a bit of a stretch for level {playerLevel} — the road
              doesn&apos;t suggest it until around level {firstLevel}.{" "}
              <button
                onClick={() => setTrack(easierSuggestion.skill!)}
                className="text-orange-400 underline"
              >
                Try {SKILL_FIELD_LABEL[easierSuggestion.skill]} instead
              </button>
              , or keep going.
            </div>
            <button
              onClick={() => setSuggestionDismissed(true)}
              className="text-zinc-500 hover:text-zinc-300 shrink-0"
              aria-label="Dismiss suggestion"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="panel p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-64 h-64">
              <div
                className="absolute inset-0 rounded-full border-4 border-zinc-700"
                style={{
                  background: `conic-gradient(${gradient})`,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? `transform ${WHEEL_SPIN_MS}ms cubic-bezier(0.12, 0.72, 0.18, 1)` : "none",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-orange-500 flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
              </div>
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 pointer-events-none"
                style={{
                  borderLeft: "9px solid transparent",
                  borderRight: "9px solid transparent",
                  borderTop: "16px solid #f97316",
                }}
              />
            </div>

            <div className="w-full">
              <ModifierReel phase={modifierPhase} result={modifier} />
            </div>

            {spinPhase === "idle" && (
              <button
                onClick={spin}
                disabled={currentPool.length === 0}
                className="px-8 py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-50"
              >
                🎰 Spin
              </button>
            )}
            {spinPhase === "wheelSpinning" && (
              <div className="text-sm text-zinc-400 animate-pulse">Spinning...</div>
            )}
            {landedExercise && spinPhase !== "composed" && (
              <div className="text-center animate-pop-in">
                <div className="text-xs text-zinc-500 uppercase tracking-wide">Landed on</div>
                <div className="text-lg text-zinc-100 heading">{landedExercise.name}</div>
                <div className="text-xs text-zinc-500 mt-1">waiting on the bonus roll...</div>
              </div>
            )}
          </div>
        </div>

        {composed && spinPhase === "composed" && (
          <div className="panel p-4 animate-slide-up-in border-orange-500/40">
            <div className="flex items-center justify-between mb-1">
              <div className="heading text-lg text-zinc-100">{composed.name}</div>
              {modifier && modifier.kind !== "none" && (
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    modifier.kind === "golden"
                      ? "border-yellow-400 text-yellow-300 bg-yellow-400/10"
                      : "border-orange-500 text-orange-400 bg-orange-500/10"
                  }`}
                >
                  {modifier.label}
                </span>
              )}
            </div>
            <div className="text-sm text-zinc-400 mb-1">{composed.detail}</div>
            {composed.cue && <div className="text-xs text-orange-400/80 italic mb-2">{composed.cue}</div>}
            <div className="flex items-center gap-2 mb-2">
              <ExerciseTipButton exerciseName={composed.name} exerciseDetail={composed.detail} trackLabel={SKILL_FIELD_LABEL[track]} />
              <span className="text-xs text-zinc-500 ml-auto">
                Worth +{BASE_BONUS_XP * (modifier ? modifierXpMultiplier(modifier) : 1)} XP
              </span>
            </div>
            <ExerciseTimer exercise={composed} onComplete={handleExerciseComplete} />
            {xpAwarded !== null && (
              <div className="mt-2 text-xs text-emerald-400">+{xpAwarded} XP banked!</div>
            )}
            <button
              onClick={resetSpin}
              className="w-full mt-3 py-2 rounded-lg text-sm border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100"
            >
              Spin again
            </button>
          </div>
        )}
      </main>
    </>
  );
}
