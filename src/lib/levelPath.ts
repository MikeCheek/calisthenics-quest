import { StagedSkillKey } from "./types";
import { RANK_TITLES } from "./xp";

export interface PathNode {
  level: number;
  title: string;
  skill?: StagedSkillKey;
  stage?: string;
  isStat?: boolean;
}

// The trophy road: every one of the 50 skills gets at least one milestone
// here (its first real stage), and the 8 foundational skills plus a few
// flagship advanced ones get later milestones too as they progress toward
// "full" — so leveling up keeps paying off on skills you already unlocked,
// not just handing out new ones. A handful of plain numeric milestones
// (pull-up/dip targets) are mixed in for the non-staged strength numbers.
export const LEVEL_PATH: PathNode[] = [
  { level: 1, title: "Wall Walk", skill: "wallWalk", stage: "developing" },
  { level: 2, title: "Pull-ups: 8 reps", isStat: true },
  { level: 3, title: "German Hang", skill: "germanHang", stage: "assisted" },
  { level: 4, title: "Skin the Cat (partial)", skill: "skinTheCat", stage: "assisted" },
  { level: 5, title: "Side Plank (full)", skill: "sidePlank", stage: "developing" },
  { level: 6, title: "Dips: 8 reps", isStat: true },
  { level: 7, title: "Full Bridge Hold", skill: "bridge", stage: "developing" },
  { level: 8, title: "Cossack Squat", skill: "cossackSquat", stage: "developing" },
  { level: 9, title: "Jump Pistol", skill: "jumpPistol", stage: "developing" },
  { level: 10, title: "Clap Push-Up", skill: "clapPushUp", stage: "developing" },
  { level: 11, title: "90° Push-Up", skill: "ninetyDegreePushUp", stage: "developing" },
  { level: 12, title: "Toes-to-Bar", skill: "toesToBar", stage: "developing" },
  { level: 13, title: "Tuck L-Sit", skill: "lSit", stage: "tuck" },
  { level: 14, title: "Wall Handstand", skill: "handstand", stage: "wall" },
  { level: 15, title: "Pistol Squat Negatives", skill: "pistolSquat", stage: "negative" },
  { level: 16, title: "Tuck Front Lever", skill: "frontLever", stage: "tuck" },
  { level: 17, title: "Tuck Back Lever", skill: "backLever", stage: "tuck" },
  { level: 18, title: "Chest-to-Bar Pull-Up", skill: "chestToBarPullUp", stage: "developing" },
  { level: 19, title: "Wide-Grip Pull-Up", skill: "wideGripPullUp", stage: "developing" },
  { level: 20, title: "Typewriter Pull-Up", skill: "typewriterPullUp", stage: "developing" },
  { level: 21, title: "Tuck Planche", skill: "planche", stage: "tuck" },
  { level: 22, title: "Band-Assisted Muscle-Up", skill: "muscleUp", stage: "band" },
  { level: 23, title: "Pull-ups: 12 reps", isStat: true },
  { level: 24, title: "Sissy Squat", skill: "sissySquat", stage: "developing" },
  { level: 25, title: "Superman Hold", skill: "supermanHold", stage: "developing" },
  { level: 26, title: "Copenhagen Plank", skill: "copenhagenPlank", stage: "developing" },
  { level: 27, title: "Tuck Dragon Flag", skill: "dragonFlag", stage: "tuck" },
  { level: 28, title: "Tuck Elbow Lever", skill: "elbowLever", stage: "tuck" },
  { level: 29, title: "Shrimp Squat (assisted)", skill: "shrimpSquat", stage: "assisted" },
  { level: 30, title: "Nordic Curl (assisted)", skill: "nordicCurl", stage: "assisted" },
  { level: 31, title: "Tuck Human Flag", skill: "humanFlag", stage: "tuck" },
  { level: 32, title: "Flag Pull-Up", skill: "flagPullUp", stage: "developing" },
  { level: 33, title: "Kip-Up", skill: "kipUp", stage: "full" },
  { level: 34, title: "Handstand Push-Up Negatives", skill: "handstandPushUp", stage: "negative" },
  { level: 35, title: "L-Sit Pull-Up", skill: "lSitPullUp", stage: "developing" },
  { level: 36, title: "Pike Press", skill: "pikePress", stage: "developing" },
  { level: 37, title: "Dips: 15 reps", isStat: true },
  { level: 38, title: "Turkish Get-Up", skill: "turkishGetUp", stage: "developing" },
  { level: 39, title: "Rope Climb", skill: "ropeClimb", stage: "developing" },
  { level: 40, title: "Straddle Front Lever", skill: "frontLever", stage: "straddle" },
  { level: 41, title: "Straddle Back Lever", skill: "backLever", stage: "straddle" },
  { level: 42, title: "Straddle Planche", skill: "planche", stage: "straddle" },
  { level: 43, title: "Strict Muscle-Up", skill: "muscleUp", stage: "single" },
  { level: 44, title: "Freestanding Handstand", skill: "handstand", stage: "freestanding" },
  { level: 45, title: "One-Arm Pull-Up (assisted)", skill: "oneArmPullUp", stage: "assisted" },
  { level: 46, title: "One-Arm Push-Up (assisted)", skill: "oneArmPushUp", stage: "assisted" },
  { level: 47, title: "One-Arm Handstand (wall)", skill: "oneArmHandstand", stage: "wall" },
  { level: 48, title: "Impossible Dip (band)", skill: "impossibleDip", stage: "band" },
  { level: 49, title: "Windmill", skill: "windmill", stage: "full" },
  { level: 50, title: "Around the World", skill: "aroundTheWorld", stage: "full" },
  { level: 51, title: "Handstand Walk", skill: "handstandWalk", stage: "full" },
  { level: 52, title: "Standing Back Flip", skill: "backFlip", stage: "full" },
  { level: 53, title: "Standing Front Flip", skill: "frontFlip", stage: "full" },
  { level: 54, title: "Ring Muscle-Up", skill: "ringMuscleUp", stage: "developing" },
  { level: 55, title: "Pull-ups: 18 reps", isStat: true },
  { level: 56, title: "Ring Support Hold", skill: "ironCross", stage: "support" },
  { level: 57, title: "Tuck Maltese", skill: "maltese", stage: "tuck" },
  { level: 58, title: "Full Dragon Flag", skill: "dragonFlag", stage: "full" },
  { level: 59, title: "Full Elbow Lever", skill: "elbowLever", stage: "full" },
  { level: 60, title: "V-Sit (Manna prep)", skill: "manna", stage: "vSit" },
  { level: 61, title: "Full Front Lever", skill: "frontLever", stage: "full" },
  { level: 62, title: "Full Planche", skill: "planche", stage: "full" },
  { level: 63, title: "One-Arm Pull-Up", skill: "oneArmPullUp", stage: "full" },
  { level: 64, title: "One-Arm Handstand", skill: "oneArmHandstand", stage: "full" },
  { level: 65, title: "Inverted Cross", skill: "invertedCross", stage: "full" },
  { level: 66, title: "Victorian Cross", skill: "victorianCross", stage: "full" },
];

export interface Chapter {
  title: string;
  blurb: string;
  minLevel: number;
  maxLevel: number;
  nodes: PathNode[];
}

// Groups the path into the same tiers used for rank titles elsewhere in the
// app (RANK_TITLES in xp.ts), so "Chapter 3" on the road and your rank
// badge always agree.
export function pathChapters(): Chapter[] {
  const sorted = [...RANK_TITLES].sort((a, b) => a.min - b.min);
  return sorted.map((tier, i) => {
    const next = sorted[i + 1];
    const maxLevel = next ? next.min - 1 : Infinity;
    return {
      title: tier.title,
      blurb: tier.blurb,
      minLevel: tier.min,
      maxLevel,
      nodes: LEVEL_PATH.filter((n) => n.level >= tier.min && n.level <= maxLevel),
    };
  });
}

export function nodeUnlocked(node: PathNode, currentLevel: number): boolean {
  return currentLevel >= node.level;
}

// The level at which a skill first shows up anywhere on the road — its
// "suggested starting point," not a hard requirement.
export function firstPathLevelForSkill(skill: StagedSkillKey): number | null {
  const node = LEVEL_PATH.find((n) => n.skill === skill);
  return node ? node.level : null;
}

// All path nodes for one skill, in level order — useful for showing a
// skill's whole suggested arc (e.g. tuck at 16, straddle at 40, full at 61).
export function pathNodesForSkill(skill: StagedSkillKey): PathNode[] {
  return LEVEL_PATH.filter((n) => n.skill === skill).sort((a, b) => a.level - b.level);
}

// A skill counts as "a stretch" for someone's current level if the road
// doesn't suggest it until well beyond where they are — advisory only,
// never a hard block.
const STRETCH_MARGIN = 6;

export function isSkillAStretch(skill: StagedSkillKey, playerLevel: number): boolean {
  const first = firstPathLevelForSkill(skill);
  if (first === null) return false;
  return first - playerLevel > STRETCH_MARGIN;
}

// Suggests a gentler skill to try instead: the highest-level road milestone
// that's already within reach (<= player level) and that the athlete
// hasn't self-reported any progress on yet. Falls back to the very first
// skill on the road if everything reachable is already underway.
export function suggestEasierSkill(
  playerLevel: number,
  skills: Partial<Record<StagedSkillKey, string>>
): PathNode | null {
  const reachable = LEVEL_PATH.filter((n) => n.skill && n.level <= playerLevel).sort(
    (a, b) => b.level - a.level
  );
  const notStarted = reachable.find((n) => n.skill && (skills[n.skill] ?? "none") === "none");
  if (notStarted) return notStarted;
  return reachable[0] ?? LEVEL_PATH.find((n) => n.skill) ?? null;
}
