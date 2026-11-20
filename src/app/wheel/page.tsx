"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Shuffle, Volume2, VolumeX, Coins, Sparkles, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import Nav from "@/components/Nav";
import Modal from "@/components/Modal";
import PageLoading from "@/components/PageLoading";
import PrizeWheel, { SEGMENT_STYLE } from "@/components/PrizeWheel";
import ModifierReel, { ReelPhase } from "@/components/ModifierReel";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseDemo from "@/components/ExerciseDemo";
import ExerciseTipButton from "@/components/ExerciseTipButton";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { updateProgress } from "@/lib/store";
import { awardXp, Celebration } from "@/lib/sessionComplete";
import { Exercise, StagedSkillKey, SKILL_FIELD_LABEL } from "@/lib/types";
import { localizeDetail } from "@/lib/i18n/detail";
import { localizedDescription } from "@/lib/exerciseTiming";
import { isSkillAStretch } from "@/lib/levelPath";
import { levelFromXp } from "@/lib/xp";
import {
  BASE_XP,
  BET_SPOTS,
  BETS_PER_DAY,
  Bet,
  CHIPS,
  SEGMENTS,
  SegmentValue,
  betReturn,
  betsLeft,
  bonusCards,
  maxStake,
  payout,
  pickExercise,
  stageOffset,
  wheelSkillAvailable,
} from "@/lib/bonusWheel";
import {
  ALL_MODIFIER_TYPES,
  ALL_QUANTITY_LABELS,
  Modifier,
  applyModifier,
  composeModifier,
  modifierFlatXpBonus,
  modifierXpMultiplier,
  pickRandomModifierType,
  pickRandomQuantity,
} from "@/lib/wheelModifiers";

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

const TYPE_LABELS = ALL_MODIFIER_TYPES.map((t) => t.label);
const SOUND_KEY = "barquests:wheel-sound";
const localDay = () => new Date().toLocaleDateString("en-CA");

// The reels above the wheel stop while it's still turning, one after the other
const TYPE_STOP_MS = 2200;
const QTY_STOP_MS = 3600;

type Phase = "betting" | "spinning" | "bonus" | "exercise";

interface Result {
  segment: SegmentValue;
  skill: StagedSkillKey;
  exercise: Exercise; // with the bonus/malus applied
  baseXp: number;
  modifier: Modifier;
  bet: Bet | null;
}

export default function WheelPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <WheelContent />
    </Suspense>
  );
}

function WheelContent() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const { locale, tx } = useLanguage();
  const toast = useToast();
  const router = useRouter();
  const requested = useSearchParams().get("skill") as StagedSkillKey | null;

  const [track, setTrack] = useState<StagedSkillKey | "surprise">(requested ?? "surprise");
  const [skillSheet, setSkillSheet] = useState(false);
  const [chip, setChip] = useState(CHIPS[0]);
  const [bet, setBet] = useState<Bet | null>(null);
  const [phase, setPhase] = useState<Phase>("betting");
  const [spin, setSpin] = useState<{ index: number; id: number } | null>(null);
  const [landed, setLanded] = useState<number | null>(null);
  const [typePhase, setTypePhase] = useState<ReelPhase>("idle");
  const [qtyPhase, setQtyPhase] = useState<ReelPhase>("idle");
  const [modifier, setModifier] = useState<Modifier | null>(null);
  const [cards, setCards] = useState<ReturnType<typeof bonusCards>>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [banked, setBanked] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [sound, setSound] = useState(true);
  const pending = useRef<{ segment: SegmentValue; skill: StagedSkillKey; modifier: Modifier; bet: Bet | null } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setSound(localStorage.getItem(SOUND_KEY) !== "off");
    } catch {
      /* default on */
    }
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  const available = useMemo(() => (userDoc ? SKILL_ORDER.filter((s) => wheelSkillAvailable(s, userDoc.equipment)) : []), [userDoc]);

  // a skill asked for in the link but not possible with this equipment
  useEffect(() => {
    if (track !== "surprise" && available.length && !available.includes(track)) setTrack("surprise");
  }, [available, track]);

  if (loading || !userDoc) return <PageLoading />;

  const today = localDay();
  const left = betsLeft(userDoc.wheelBets, today);
  const cap = maxStake(userDoc.xp);
  const level = levelFromXp(userDoc.xp);
  const busy = phase === "spinning";

  const toggleSound = () => {
    setSound((s) => {
      try {
        localStorage.setItem(SOUND_KEY, s ? "off" : "on");
      } catch {
        /* not important */
      }
      return !s;
    });
  };

  const placeBet = (on: SegmentValue) => {
    if (busy || phase !== "betting") return;
    if (bet?.on === on) return setBet(null); // tap again to take it back
    if (left === 0) return toast.info(tx("No bets left today — spin for fun, or come back tomorrow."));
    if (chip > cap) return toast.info(tx("You can bet up to {n} XP right now — what you've earned into this level.", { n: cap }));
    setBet({ on, stake: chip });
  };

  const startSpin = async () => {
    if (busy || !available.length) return;
    const skill = track === "surprise" ? available[Math.floor(Math.random() * available.length)] : track;
    const index = Math.floor(Math.random() * SEGMENTS.length);
    const type = pickRandomModifierType();
    const mod = composeModifier(type, pickRandomQuantity(type));
    const placed = bet && bet.stake <= cap && left > 0 ? bet : null;
    pending.current = { segment: SEGMENTS[index], skill, modifier: mod, bet: placed };

    // the stake goes now; anything won comes with the completed exercise
    if (placed) {
      try {
        await updateProgress(userDoc.uid, {
          xp: userDoc.xp - placed.stake,
          wheelBets: { day: today, count: (userDoc.wheelBets?.day === today ? userDoc.wheelBets.count : 0) + 1 },
        });
        await refreshUserDoc();
      } catch {
        toast.error("Something went wrong — try again.");
        return;
      }
    }

    setResult(null);
    setBanked(null);
    setLanded(null);
    setCards([]);
    setPicked(null);
    setModifier(null);
    setPhase("spinning");
    setTypePhase("cycling");
    setQtyPhase("cycling");
    setSpin({ index, id: Date.now() });
    timers.current.push(
      setTimeout(() => {
        setModifier(mod);
        setTypePhase("revealed");
      }, TYPE_STOP_MS),
      setTimeout(() => setQtyPhase("revealed"), QTY_STOP_MS)
    );
  };

  const onLanded = (index: number) => {
    const p = pending.current;
    if (!p) return;
    setLanded(index);
    if (p.segment === "bonus") {
      setCards(bonusCards(p.skill, userDoc.skills, userDoc.equipment));
      setPhase("bonus");
    } else {
      const picked = pickExercise(p.skill, userDoc.skills, userDoc.equipment, stageOffset(p.segment));
      if (!picked) return setPhase("betting");
      setResult({ segment: p.segment, skill: p.skill, exercise: applyModifier(picked.exercise, p.modifier), baseXp: BASE_XP[String(p.segment)], modifier: p.modifier, bet: p.bet });
      setPhase("exercise");
    }
    const won = betReturn(p.bet, p.segment);
    if (p.bet) {
      if (won) toast.success(tx("Your bet hit! Complete the exercise to collect {n} XP.", { n: won }));
      else toast.info(tx("No luck this time — the exercise still earns its XP."));
    }
    setBet(null);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  };

  const pickCard = (i: number) => {
    const p = pending.current;
    if (picked !== null || !p) return;
    setPicked(i);
    const c = cards[i];
    setTimeout(() => {
      setResult({ segment: "bonus", skill: p.skill, exercise: applyModifier(c.exercise, p.modifier), baseXp: c.xp, modifier: p.modifier, bet: p.bet });
      setPhase("exercise");
    }, 1400);
  };

  const exerciseXp = (r: Result) => Math.round(r.baseXp * modifierXpMultiplier(r.modifier) + modifierFlatXpBonus(r.modifier));

  const complete = async () => {
    if (!result || banked !== null) return;
    const amount = Math.max(0, exerciseXp(result)) + betReturn(result.bet, result.segment);
    const r = await awardXp(userDoc, amount);
    setBanked(amount);
    if (r.leveledUp) setCelebration({ leveledUp: true, newLevel: r.newLevel, streakEvent: "none", newStreak: userDoc.streak });
    await refreshUserDoc();
  };

  const again = () => {
    setPhase("betting");
    setResult(null);
    setLanded(null);
    setTypePhase("idle");
    setQtyPhase("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const skillName = (s: StagedSkillKey | "surprise") => (s === "surprise" ? tx("Surprise me") : SKILL_FIELD_LABEL[s]);
  const spotName = (v: SegmentValue) => (v === "bonus" ? tx("Bonus") : String(v));

  return (
    <>
      <Nav />
      <CelebrationOverlay celebration={celebration} />
      <main id="main" tabIndex={-1} className="max-w-xl mx-auto px-4 py-5 pb-28 sm:pb-8 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="heading text-2xl text-zinc-100">{tx("Bonus wheel")}</h1>
            <p className="text-sm text-zinc-400">{tx("Spin for a bonus exercise. The number is how hard it is — and what a bet on it pays.")}</p>
          </div>
          <button
            onClick={toggleSound}
            className="w-11 h-11 shrink-0 rounded-xl border border-zinc-700 text-zinc-300 flex items-center justify-center"
            aria-label={sound ? tx("Sound off") : tx("Sound on")}
            aria-pressed={sound}
          >
            {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        {/* skill */}
        <button
          onClick={() => setSkillSheet(true)}
          disabled={busy}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-left disabled:opacity-60"
          aria-haspopup="dialog"
        >
          <span>
            <span className="block text-xs text-zinc-400">{tx("Skill")}</span>
            <span className="block text-base text-zinc-100 font-medium flex items-center gap-1.5">
              {track === "surprise" && <Shuffle size={16} className="text-orange-400" />}
              {skillName(track)}
            </span>
          </span>
          <ChevronDown size={20} className="text-zinc-400" />
        </button>

        {/* reels and wheel */}
        <section className="panel p-3 sm:p-4" aria-label={tx("Bonus wheel")}>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <ModifierReel phase={typePhase} cyclingLabels={TYPE_LABELS.map((l) => tx(l))} resultLabel={modifier ? tx(modifier.typeLabel) : null} golden={modifier?.kind === "golden"} idleLabel={tx("Bonus / malus")} />
            <ModifierReel phase={qtyPhase} cyclingLabels={ALL_QUANTITY_LABELS.map((l) => tx(l))} resultLabel={modifier ? tx(modifier.quantity.label) : null} golden={modifier?.kind === "golden"} idleLabel={tx("Amount")} />
          </div>
          <div className="mx-auto w-full max-w-[22rem]">
            <PrizeWheel
              segments={SEGMENTS}
              spin={spin}
              onLanded={onLanded}
              sound={sound}
              highlight={phase === "spinning" ? null : landed}
              label={landed === null ? tx("Prize wheel") : tx("Landed on {v}", { v: spotName(SEGMENTS[landed]) })}
            />
          </div>
          <p className="sr-only" aria-live="polite">
            {phase === "spinning" ? tx("Spinning…") : landed !== null ? tx("Landed on {v}", { v: spotName(SEGMENTS[landed]) }) : ""}
          </p>
        </section>

        {/* betting board */}
        {(phase === "betting" || phase === "spinning") && (
          <section className="panel p-3 sm:p-4" aria-labelledby="bet-title">
            <div className="flex items-baseline justify-between mb-2">
              <h2 id="bet-title" className="heading text-base text-zinc-100 flex items-center gap-1.5">
                <Coins size={16} className="text-amber-400" /> {tx("Bet XP (optional)")}
              </h2>
              <span className="text-xs text-zinc-400">{tx("{n} of {m} bets left today", { n: left, m: BETS_PER_DAY })}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5" role="group" aria-label={tx("Where to bet")}>
              {BET_SPOTS.map((v) => {
                const st = SEGMENT_STYLE[String(v)];
                const on = bet?.on === v;
                return (
                  <button
                    key={String(v)}
                    onClick={() => placeBet(v)}
                    disabled={busy}
                    aria-pressed={on}
                    aria-label={tx("Bet on {v} — pays {p} to 1", { v: spotName(v), p: payout(v) })}
                    className={`relative h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-transform active:scale-95 disabled:opacity-70 ${
                      on ? "border-white scale-105" : "border-transparent"
                    }`}
                    style={{ background: v === "bonus" ? "linear-gradient(135deg,#fde68a,#d97706)" : st.fill }}
                  >
                    <span className="text-2xl font-extrabold" style={{ color: st.text }}>
                      {st.label}
                    </span>
                    <span className="text-[0.7rem] font-semibold" style={{ color: st.text }}>
                      {payout(v)}:1
                    </span>
                    {on && (
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-300 text-zinc-950 border-2 border-white text-xs font-bold flex items-center justify-center shadow-lg animate-pop-in">
                        {bet.stake}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3" role="group" aria-label={tx("Chip")}>
              <span className="text-xs text-zinc-400 mr-1">{tx("Chip")}</span>
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setChip(c);
                    if (bet) setBet({ ...bet, stake: Math.min(c, cap) });
                  }}
                  disabled={busy || c > cap}
                  aria-pressed={chip === c}
                  className={`w-12 h-12 rounded-full border-4 border-dashed text-sm font-bold disabled:opacity-30 ${
                    chip === c ? "border-amber-200 bg-amber-400 text-zinc-950" : "border-zinc-600 bg-zinc-800 text-zinc-200"
                  }`}
                >
                  {c}
                </button>
              ))}
              <span className="text-xs text-zinc-400 ml-auto text-right">{bet ? tx("Win {n} XP", { n: bet.stake * payout(bet.on) }) : tx("No bet")}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-3">
              {tx("The stake goes when the wheel spins. Winnings come with the exercise: complete it to collect. You can never bet the XP that holds your level.")}
            </p>
          </section>
        )}

        {/* spin */}
        {(phase === "betting" || phase === "spinning") && (
          <div className="sticky bottom-[4.75rem] sm:bottom-4 z-10 pt-2 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
          <button
            onClick={startSpin}
            disabled={busy || !available.length}
            className="w-full h-16 rounded-2xl heading text-xl tracking-wide text-zinc-950 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shadow-lg shadow-orange-900/40 disabled:opacity-60 active:scale-[0.98] transition-transform"
          >
            {busy ? tx("Spinning…") : bet ? tx("Spin — {n} XP on {v}", { n: bet.stake, v: spotName(bet.on) }) : tx("Spin")}
          </button>
          </div>
        )}
        {!available.length && <p className="text-sm text-zinc-400">{tx("Add some equipment in Me → Settings to unlock more of the wheel.")}</p>}

        <div ref={resultRef} />

        {/* bonus round: three cards */}
        {phase === "bonus" && (
          <section className="panel p-4 border-amber-500/50 animate-slide-up-in" aria-labelledby="bonus-title">
            <h2 id="bonus-title" className="heading text-xl text-amber-300 text-center flex items-center justify-center gap-2">
              <Sparkles size={18} /> {tx("Bonus round")}
            </h2>
            <p className="text-sm text-zinc-300 text-center mb-4">{tx("Pick a card: a harder exercise, worth more XP.")}</p>
            <div className="grid grid-cols-3 gap-2">
              {cards.map((c, i) => (
                <button
                  key={i}
                  onClick={() => pickCard(i)}
                  disabled={picked !== null}
                  className={`flip-card h-44 ${picked !== null ? "flip-card-flipped" : ""}`}
                  aria-label={picked === null ? tx("Card {n}", { n: i + 1 }) : `${c.exercise.name} · ${c.xp} XP`}
                >
                  <span className="flip-card-inner relative block w-full h-full">
                    <span className="flip-card-face absolute inset-0 rounded-xl bg-gradient-to-br from-amber-300 to-orange-600 border-2 border-amber-200 flex items-center justify-center text-4xl text-zinc-950 font-black">
                      ★
                    </span>
                    <span
                      className={`flip-card-face flip-card-back absolute inset-0 rounded-xl p-2 flex flex-col items-center justify-center text-center border-2 ${
                        picked === i ? "bg-zinc-900 border-amber-300" : "bg-zinc-900 border-zinc-700 opacity-60"
                      }`}
                    >
                      <span className="text-xs text-zinc-100 font-medium leading-tight">{c.exercise.name}</span>
                      <span className="mt-2 text-lg font-bold text-amber-300">{c.xp} XP</span>
                      {picked === i && <Check size={16} className="text-emerald-400 mt-1" />}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* the exercise */}
        {phase === "exercise" && result && (
          <section className="panel p-4 animate-slide-up-in border-orange-500/40" aria-labelledby="result-title">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-extrabold shrink-0"
                style={{ background: result.segment === "bonus" ? "linear-gradient(135deg,#fde68a,#d97706)" : SEGMENT_STYLE[String(result.segment)].fill, color: SEGMENT_STYLE[String(result.segment)].text }}
                aria-hidden="true"
              >
                {SEGMENT_STYLE[String(result.segment)].label}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-zinc-400">{SKILL_FIELD_LABEL[result.skill]}</p>
                <h2 id="result-title" className="heading text-lg text-zinc-100 leading-tight">
                  {result.exercise.name}
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {result.modifier.kind !== "none" && (
                <span className={`text-xs px-2.5 py-1 rounded-full border ${result.modifier.kind === "golden" ? "border-yellow-400 text-yellow-300 bg-yellow-400/10" : "border-orange-500 text-orange-300 bg-orange-500/10"}`}>
                  {tx(result.modifier.typeLabel)} · {tx(result.modifier.quantity.label)}
                </span>
              )}
              <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/60 text-emerald-300">+{exerciseXp(result)} XP</span>
              {result.bet && betReturn(result.bet, result.segment) > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-amber-400 text-amber-300 bg-amber-400/10">
                  {tx("Bet won: +{n} XP", { n: betReturn(result.bet, result.segment) })}
                </span>
              )}
              {result.bet && betReturn(result.bet, result.segment) === 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-zinc-600 text-zinc-400">{tx("Bet lost: −{n} XP", { n: result.bet.stake })}</span>
              )}
            </div>
            <p className="text-base text-zinc-200 mb-1">{localizeDetail(result.exercise.detail, locale)}</p>
            {result.exercise.description && <p className="text-sm text-zinc-400 mb-2">{localizedDescription(result.exercise, locale)}</p>}
            <ExerciseDemo exerciseName={result.exercise.name} width={150} className="my-3" />
            <div className="mb-2">
              <ExerciseTipButton exerciseName={result.exercise.name} exerciseDetail={result.exercise.detail} trackLabel={SKILL_FIELD_LABEL[result.skill]} />
            </div>
            <ExerciseTimer exercise={result.exercise} onComplete={complete} />
            {banked !== null ? (
              <p className="mt-3 text-center text-base text-emerald-300 font-semibold animate-pop-in">{tx("+{n} XP banked!", { n: banked })}</p>
            ) : (
              <p className="mt-3 text-center text-xs text-zinc-400">
                {tx("Complete it to collect {n} XP.", { n: exerciseXp(result) + betReturn(result.bet, result.segment) })}
              </p>
            )}
            <button onClick={again} className="w-full mt-3 h-12 rounded-xl border border-zinc-600 text-zinc-100 text-base hover:border-orange-500">
              {tx("Spin again")}
            </button>
          </section>
        )}
      </main>

      {/* skill picker: only what this equipment allows */}
      <Modal open={skillSheet} onClose={() => setSkillSheet(false)} title={tx("Pick a skill")}>
        <div className="space-y-1.5">
          <SkillRow label={tx("Surprise me")} hint={tx("A different skill on every spin")} active={track === "surprise"} onClick={() => { setTrack("surprise"); setSkillSheet(false); }} icon />
          {available.map((s) => (
            <SkillRow
              key={s}
              label={SKILL_FIELD_LABEL[s]}
              hint={isSkillAStretch(s, level) ? tx("A stretch at your level") : undefined}
              active={track === s}
              onClick={() => {
                setTrack(s);
                setSkillSheet(false);
              }}
            />
          ))}
          <p className="text-xs text-zinc-400 pt-2">{tx("Only skills you can train with your equipment are listed. Change it in Me → Settings.")}</p>
        </div>
      </Modal>
    </>
  );
}

function SkillRow({ label, hint, active, onClick, icon }: { label: string; hint?: string; active: boolean; onClick: () => void; icon?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`w-full min-h-[3rem] flex items-center gap-3 px-3 py-2 rounded-xl text-left ${active ? "bg-orange-500/15 border border-orange-500" : "bg-zinc-800/60 border border-transparent hover:bg-zinc-800"}`}
    >
      {icon && <Shuffle size={18} className="text-orange-400 shrink-0" />}
      <span className="flex-1">
        <span className="block text-base text-zinc-100">{label}</span>
        {hint && <span className="block text-xs text-zinc-400">{hint}</span>}
      </span>
      {active && <Check size={18} className="text-orange-400" />}
    </button>
  );
}
