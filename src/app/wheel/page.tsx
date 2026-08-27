"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseTipButton from "@/components/ExerciseTipButton";
import ModifierReel, { ReelPhase } from "@/components/ModifierReel";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { Exercise, StagedSkillKey, SKILL_FIELD_LABEL } from "@/lib/types";
import { wheelPoolWeighted, wheelTrackAvailable } from "@/lib/wheelPool";
import { isSkillAStretch, suggestEasierSkill, firstPathLevelForSkill, effectiveLevel } from "@/lib/levelPath";
import {
  Modifier,
  ModifierType,
  QuantityOption,
  pickRandomModifierType,
  pickRandomQuantity,
  composeModifier,
  applyModifier,
  modifierXpMultiplier,
  modifierFlatXpBonus,
  ALL_MODIFIER_TYPES,
  ALL_QUANTITY_LABELS,
} from "@/lib/wheelModifiers";
import { awardXp, Celebration } from "@/lib/sessionComplete";
import { playBeep } from "@/lib/sound";
import { Sparkles, X, Shuffle } from "lucide-react";
import SkillInfoModal from "@/components/SkillInfoModal";
import InfoIconButton from "@/components/InfoIconButton";

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

// Sequencing per the requested reveal order: modifier TYPE stops first,
// then its QUANTITY, and only then does the wheel itself land on the
// exercise — the wheel keeps spinning underneath the whole time and its
// CSS transition duration is set to finish exactly when this schedule says
// it should.
const TYPE_SPIN_MS = 2000;
const QTY_SPIN_MS = 1200;
const WHEEL_REVEAL_DELAY_MS = 1000;
const WHEEL_SPIN_MS = TYPE_SPIN_MS + QTY_SPIN_MS + WHEEL_REVEAL_DELAY_MS;

const BASE_BONUS_XP = 10;

type SpinPhase = "idle" | "spinning" | "composed";

const TYPE_LABELS = ALL_MODIFIER_TYPES.map((t) => t.label);

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
  const [infoSkill, setInfoSkill] = useState<StagedSkillKey | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinPhase, setSpinPhase] = useState<SpinPhase>("idle");
  const [landedExercise, setLandedExercise] = useState<Exercise | null>(null);

  const [typePhase, setTypePhase] = useState<ReelPhase>("idle");
  const [qtyPhase, setQtyPhase] = useState<ReelPhase>("idle");
  const [revealedType, setRevealedType] = useState<ModifierType | null>(null);
  const [revealedQuantity, setRevealedQuantity] = useState<QuantityOption | null>(null);
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

  const spin = () => runSpin(currentPool);

  const spinRandomSkill = () => {
    if (spinPhase !== "idle" || availableSkills.length === 0) return;
    const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    const randomDifficulty = ([-1, 0, 1] as const)[Math.floor(Math.random() * 3)];
    const pool = wheelPoolWeighted(randomSkill, userDoc.skills, userDoc.equipment, randomDifficulty);
    setTrack(randomSkill);
    setDifficulty(randomDifficulty);
    setSuggestionDismissed(false);
    setDisplayPool(pool);
    // runSpin sets spinPhase to "spinning" synchronously in this same
    // event handler, so the pool-recompute effect above (which only fires
    // while idle) never gets a chance to reshuffle what we just set here —
    // both updates land in the same React batch.
    runSpin(pool);
  };

  const runSpin = (pool: Exercise[]) => {
    if (spinPhase !== "idle" || pool.length === 0) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const segs = Math.max(1, pool.length);
    const anglePerSeg = 360 / segs;

    spinPoolRef.current = pool;
    setLandedExercise(null);
    setRevealedType(null);
    setRevealedQuantity(null);
    setModifier(null);
    setComposed(null);
    setXpAwarded(null);
    setSpinPhase("spinning");
    setTypePhase("cycling");
    setQtyPhase("cycling");

    // Pre-select every winner up front so each reel's reveal is just a
    // scheduled disclosure of an already-decided outcome.
    const winnerExerciseIdx = Math.floor(Math.random() * pool.length);
    const winnerType = pickRandomModifierType();
    const winnerQuantity = pickRandomQuantity(winnerType);

    const winnerCenter = winnerExerciseIdx * anglePerSeg + anglePerSeg / 2;
    const target = (360 - winnerCenter) % 360;
    const base = rotation - (rotation % 360);
    setRotation(base + 360 * 6 + target);

    const t1 = setTimeout(() => {
      setTypePhase("revealed");
      setRevealedType(winnerType);
      playBeep(700, 220);
    }, TYPE_SPIN_MS);

    const t2 = setTimeout(() => {
      setQtyPhase("revealed");
      setRevealedQuantity(winnerQuantity);
      const m = composeModifier(winnerType, winnerQuantity);
      setModifier(m);
      playBeep(winnerType.kind === "golden" ? 950 : 850, 260);
    }, TYPE_SPIN_MS + QTY_SPIN_MS);

    const t3 = setTimeout(() => {
      const finalModifier = composeModifier(winnerType, winnerQuantity);
      const exercise = spinPoolRef.current[winnerExerciseIdx];
      setLandedExercise(exercise);
      setComposed(applyModifier(exercise, finalModifier));
      setSpinPhase("composed");
      playBeep(winnerType.kind === "golden" ? 1200 : 1046, winnerType.kind === "golden" ? 500 : 350);
    }, WHEEL_SPIN_MS);

    timers.current = [t1, t2, t3];
  };

  const resetSpin = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSpinPhase("idle");
    setLandedExercise(null);
    setTypePhase("idle");
    setQtyPhase("idle");
    setRevealedType(null);
    setRevealedQuantity(null);
    setModifier(null);
    setComposed(null);
    setXpAwarded(null);
  };

  const handleExerciseComplete = async () => {
    if (xpAwarded !== null) return; // already awarded for this spin
    const multiplier = modifier ? modifierXpMultiplier(modifier) : 1;
    const flatBonus = modifier ? modifierFlatXpBonus(modifier) : 0;
    const amount = BASE_BONUS_XP * multiplier + flatBonus;
    const result = await awardXp(userDoc, amount);
    setXpAwarded(amount);
    if (result.leveledUp) {
      setCelebration({ leveledUp: true, newLevel: result.newLevel, streakEvent: "none", newStreak: userDoc.streak });
    }
    await refreshUserDoc();
  };

  const availableSkills = SKILL_ORDER.filter((s) => wheelTrackAvailable(s, userDoc.equipment));
  const spinning = spinPhase === "spinning";
  const isGolden = revealedType?.kind === "golden";

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
          <div className="text-xs text-zinc-400 mb-1.5 flex items-center gap-1.5">
            Skill: <span className="text-zinc-200">{SKILL_FIELD_LABEL[track]}</span>
            <InfoIconButton onClick={() => setInfoSkill(track)} label={`About ${SKILL_FIELD_LABEL[track]}`} />
            <span className="ml-auto">{availableSkills.length} available</span>
          </div>
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
          {/* modifier reels sit above the wheel — type resolves first, then quantity */}
          <div className="mb-4">
            <div className="text-xs text-zinc-500 mb-1.5 text-center uppercase tracking-wide">Bonus / malus</div>
            <div className="grid grid-cols-2 gap-2">
              <ModifierReel
                phase={typePhase}
                cyclingLabels={TYPE_LABELS}
                resultLabel={revealedType?.label ?? null}
                golden={isGolden}
                idleLabel="Modifier"
              />
              <ModifierReel
                phase={qtyPhase}
                cyclingLabels={ALL_QUANTITY_LABELS}
                resultLabel={revealedQuantity?.label ?? null}
                golden={isGolden}
                idleLabel="Amount"
              />
            </div>
          </div>

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

            {spinPhase === "idle" && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={spin}
                  disabled={currentPool.length === 0}
                  className="px-8 py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-50"
                >
                  🎰 Spin
                </button>
                <button
                  onClick={spinRandomSkill}
                  disabled={availableSkills.length === 0}
                  className="text-xs px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Shuffle size={12} /> Randomize skill too
                </button>
              </div>
            )}
            {spinPhase === "spinning" && (
              <div className="text-sm text-zinc-400 animate-pulse">Spinning...</div>
            )}
            {landedExercise && spinPhase === "composed" && (
              <div className="text-center animate-pop-in">
                <div className="text-xs text-zinc-500 uppercase tracking-wide">Landed on</div>
                <div className="text-lg text-zinc-100 heading">{landedExercise.name}</div>
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
                  {modifier.typeLabel} · {modifier.quantity.label}
                </span>
              )}
            </div>
            <div className="text-sm text-zinc-400 mb-1">{composed.detail}</div>
            {composed.cue && <div className="text-xs text-orange-400/80 italic mb-2">{composed.cue}</div>}
            <div className="flex items-center gap-2 mb-2">
              <ExerciseTipButton exerciseName={composed.name} exerciseDetail={composed.detail} trackLabel={SKILL_FIELD_LABEL[track]} />
              <span className="text-xs text-zinc-500 ml-auto">
                Worth +
                {BASE_BONUS_XP * (modifier ? modifierXpMultiplier(modifier) : 1) +
                  (modifier ? modifierFlatXpBonus(modifier) : 0)}{" "}
                XP
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

      <SkillInfoModal
        skill={infoSkill}
        onClose={() => setInfoSkill(null)}
        playerLevel={playerLevel}
        skills={userDoc.skills}
        skillMastery={userDoc.skillMastery}
      />
    </>
  );
}
