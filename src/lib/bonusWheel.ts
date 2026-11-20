import type { Exercise, SkillProfile, StagedSkillKey, TrainingEquipment } from "./types";
import { STAGE_ORDER, stageIndex } from "./stageOrder";
import { fitsEquipment } from "./equipmentNeeds";
import { REQUIRED_EQUIPMENT } from "./trainingGenerator";
import { stageTableFor } from "./wheelPool";
import { advancedSkillAvailable } from "./advancedSkills";
import { xpForLevel, levelFromXp } from "./xp";
import type { AdvancedSkill, SkillTrack } from "./types";

// ---------------------------------------------------------------------------
// The bonus wheel: a big prize wheel of 24 segments. Each number is how hard
// the exercise is — and what a bet on it pays:
//   1   an easier variation      pays 1 to 1
//   2   your level               pays 2 to 1
//   5   a step harder            pays 5 to 1
//   10  two steps harder         pays 10 to 1
//   ★   bonus round: pick one of three cards (harder exercises, more XP)
// The odds are what you see: every segment is equally likely.
//
// Bets are in XP, a few a day, never more than you've earned into your
// current level (a bet can't cost you a level). The stake goes when the
// wheel spins; winnings are paid when you complete the exercise it picks.
// ---------------------------------------------------------------------------

export type SegmentValue = 1 | 2 | 5 | 10 | "bonus";

// Fixed order around the wheel, spread so equal values aren't neighbours.
export const SEGMENTS: SegmentValue[] = [
  1, 2, 1, 5, 1, 2, "bonus", 1, 2, 1, 10, 2,
  1, 5, 1, 2, 5, 1, "bonus", 2, 1, 10, 2, 5,
];

export const BET_SPOTS: SegmentValue[] = [1, 2, 5, 10, "bonus"];

export const payout = (v: SegmentValue) => (v === "bonus" ? 10 : v);

// How many stages away from the player's own the exercise comes from
export const stageOffset = (v: SegmentValue) => (v === 1 ? -1 : v === 2 ? 0 : v === 5 ? 1 : 2);

// XP for completing the exercise, before the bonus/malus reels
export const BASE_XP: Record<string, number> = { "1": 5, "2": 10, "5": 20, "10": 35, bonus: 0 };
export const BONUS_CARD_XP = [30, 45, 60];

export const CHIPS = [5, 10, 25];
export const BETS_PER_DAY = 5;

export const segmentCount = (v: SegmentValue) => SEGMENTS.filter((s) => s === v).length;
export const chance = (v: SegmentValue) => segmentCount(v) / SEGMENTS.length;

// What a bet returns on average, per XP staked (1 = break even)
export const expectedReturn = (v: SegmentValue) => chance(v) * (payout(v) + 1);

export interface Bet {
  on: SegmentValue;
  stake: number;
}

// The most a player can stake now: their XP into the current level (so a
// lost bet never costs a level), capped at the biggest chip.
export function maxStake(xp: number): number {
  return Math.max(0, Math.min(Math.max(...CHIPS), xp - xpForLevel(levelFromXp(xp))));
}

export function betsLeft(stored: { day: string; count: number } | undefined, today: string): number {
  return Math.max(0, BETS_PER_DAY - (stored && stored.day === today ? stored.count : 0));
}

// What comes back if the exercise is completed: the stake plus winnings on
// a hit, nothing on a miss.
export function betReturn(bet: Bet | null, landed: SegmentValue): number {
  if (!bet || bet.on !== landed) return 0;
  return bet.stake + bet.stake * payout(landed);
}

// ---- which skills and exercises the wheel can offer ----

const MACRO = new Set<string>(["frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit"]);

function skillHasGear(track: StagedSkillKey, eq: TrainingEquipment): boolean {
  if (MACRO.has(track)) {
    const req = REQUIRED_EQUIPMENT[track as SkillTrack];
    return !req || req.some((k) => eq[k]);
  }
  return advancedSkillAvailable(track as AdvancedSkill, eq);
}

// Exercises of one stage that the player's equipment allows
export function stageExercises(track: StagedSkillKey, stage: string, eq: TrainingEquipment): Exercise[] {
  return (stageTableFor(track, eq)[stage] ?? []).filter((e) => fitsEquipment(e, eq));
}

// A skill is on offer when the player has its gear and enough of its
// exercises fit their equipment to fill a wheel's worth of choices.
export function wheelSkillAvailable(track: StagedSkillKey, eq: TrainingEquipment): boolean {
  if (!skillHasGear(track, eq)) return false;
  const order = STAGE_ORDER[track] ?? [];
  const usable = order.filter((st) => stageExercises(track, st, eq).length > 0);
  return usable.length >= 2;
}

// The exercise for a segment: from the stage that many steps from the
// player's own, or the nearest stage that has something they can do.
export function pickExercise(
  track: StagedSkillKey,
  skills: SkillProfile,
  eq: TrainingEquipment,
  offset: number,
  rnd: () => number = Math.random
): { exercise: Exercise; stage: string } | null {
  const order = STAGE_ORDER[track] ?? [];
  if (!order.length) return null;
  const current = Math.max(0, stageIndex(track as keyof SkillProfile, skills[track as keyof SkillProfile] as string));
  // "none" (not started) has nothing above it to step down to
  const target = Math.min(order.length - 1, Math.max(0, current + offset));
  for (let d = 0; d < order.length; d++) {
    // look outward from the target, preferring the easier side on ties
    for (const i of offset > 0 ? [target + d, target - d] : [target - d, target + d]) {
      if (i < 0 || i >= order.length) continue;
      const list = stageExercises(track, order[i], eq);
      if (list.length) return { exercise: list[Math.floor(rnd() * list.length)], stage: order[i] };
    }
  }
  return null;
}

// Three face-down cards for the bonus round: harder exercises, more XP.
export function bonusCards(track: StagedSkillKey, skills: SkillProfile, eq: TrainingEquipment, rnd: () => number = Math.random) {
  const xp = [...BONUS_CARD_XP].sort(() => rnd() - 0.5);
  return [1, 1, 2].map((offset, i) => ({ ...pickExercise(track, skills, eq, offset, rnd), xp: xp[i] })).filter((c) => c.exercise) as {
    exercise: Exercise;
    stage: string;
    xp: number;
  }[];
}
