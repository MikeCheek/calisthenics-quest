import {
  AdvancedSkill,
  SkillMastery,
  SkillProfile,
  StagedSkillKey,
  TrainingEquipment,
} from "./types";
import { STAGE_ORDER } from "./stageOrder";
import { advancedSkillAvailable } from "./advancedSkills";

// ---------------------------------------------------------------------------
// Onboarding assessment, one movement area at a time.
//
// The old quiz used a single yes/no bisection across all skills, which put
// everyone on one global number — someone with strong pulling and weak
// pushing landed in the middle of both. Here each area is assessed on its
// own:
//   - a few numeric baselines (max pull-ups, push-ups, dips)
//   - each main skill as a ladder: pick the hardest variation you can do,
//     described concretely (hold time, body position), then how solid it is
//   - side skills as quick chips: not yet / working on it / can do it,
//     filtered to the athlete's tier in that area so beginners aren't
//     shown elite skills and advanced athletes aren't asked about basics.
// Equipment filters out what can't be trained anyway.
// ---------------------------------------------------------------------------

export type Tier = 0 | 1 | 2; // beginner / intermediate / advanced, per area

export const TIER_LABEL: Record<Tier, string> = {
  0: "Beginner",
  1: "Intermediate",
  2: "Advanced",
};

export interface LadderOption {
  stage: string;
  label: string;
  hint?: string;
}

export interface LadderQuestion {
  skill: StagedSkillKey;
  title: string;
  options: LadderOption[];
  requires?: (keyof TrainingEquipment)[]; // any one of these
  // extra gate on what's already been answered — e.g. no one-arm handstand
  // question until a freestanding handstand is there
  showIf?: (a: AssessmentAnswers) => boolean;
}

export interface SideSkill {
  skill: StagedSkillKey;
  label: string;
  minTier?: Tier; // only shown at or above this tier in the area
  assumeAtTier?: Tier; // pre-ticked "can do" at or above this tier (still editable)
  requires?: (keyof TrainingEquipment)[];
}

export type BaselineKey = "pullUpMaxReps" | "pushUpMaxReps" | "dipMaxReps";

export interface Baseline {
  key: BaselineKey;
  label: string;
  max: number;
  requires?: (keyof TrainingEquipment)[];
}

export interface AssessmentArea {
  id: string;
  title: string;
  blurb: string;
  baselines?: Baseline[];
  archerToggle?: boolean;
  ladders: LadderQuestion[];
  sides: SideSkill[];
}

// 0 = not yet, 1 = working on it, 2 = can do it
export type SideLevel = 0 | 1 | 2;

export interface AssessmentAnswers {
  stages: Partial<Record<StagedSkillKey, string>>;
  solidity: Partial<Record<StagedSkillKey, SkillMastery>>;
  sides: Partial<Record<StagedSkillKey, SideLevel>>;
  baselines: Partial<Record<BaselineKey, number>>;
  archerPullUp?: boolean;
}

export const SOLIDITY_OPTIONS: { value: SkillMastery; label: string; hint: string }[] = [
  { value: 2, label: "Just about", hint: "Landed it, but it's rough" },
  { value: 4, label: "Most days", hint: "Reliable, decent form" },
  { value: 5, label: "Clean & easy", hint: "Full hold or reps, controlled" },
];
export const DEFAULT_SOLIDITY: SkillMastery = 4;

const has = (...keys: (keyof TrainingEquipment)[]) => keys;

export const ASSESSMENT_AREAS: AssessmentArea[] = [
  {
    id: "pull",
    title: "Pulling",
    blurb: "Pull-ups, rows and everything that hangs from a bar.",
    baselines: [{ key: "pullUpMaxReps", label: "Max strict pull-ups", max: 40, requires: has("pullUpBar", "rings") }],
    archerToggle: true,
    ladders: [
      {
        skill: "muscleUp",
        title: "Muscle-up",
        requires: has("pullUpBar", "rings"),
        showIf: (a) => (a.baselines.pullUpMaxReps ?? 0) >= 3,
        options: [
          { stage: "none", label: "Not yet" },
          { stage: "band", label: "With a band or a big kip", hint: "Getting over the bar with help" },
          { stage: "single", label: "1–2 strict", hint: "No kip, no swing" },
          { stage: "multiple", label: "3+ strict in a row" },
        ],
      },
    ],
    sides: [
      { skill: "germanHang", label: "German hang", assumeAtTier: 2, requires: has("pullUpBar", "rings") },
      { skill: "skinTheCat", label: "Skin the cat", assumeAtTier: 2, requires: has("pullUpBar", "rings") },
      { skill: "chestToBarPullUp", label: "Chest-to-bar pull-up", assumeAtTier: 2 },
      { skill: "wideGripPullUp", label: "Wide-grip pull-up", assumeAtTier: 2 },
      { skill: "ropeClimb", label: "Rope climb" },
      { skill: "lSitPullUp", label: "L-sit pull-up", minTier: 1 },
      { skill: "typewriterPullUp", label: "Typewriter pull-up", minTier: 1 },
      { skill: "ringMuscleUp", label: "Ring muscle-up", minTier: 1 },
      { skill: "oneArmPullUp", label: "One-arm pull-up", minTier: 2 },
    ],
  },
  {
    id: "push",
    title: "Pushing",
    blurb: "Push-ups, dips, and pressing toward planche and handstand push-ups.",
    baselines: [
      { key: "pushUpMaxReps", label: "Max push-ups", max: 80 },
      { key: "dipMaxReps", label: "Max dips", max: 50, requires: has("parallelBars", "rings") },
    ],
    ladders: [
      {
        skill: "planche",
        title: "Planche",
        options: [
          { stage: "none", label: "Can't lift my feet yet", hint: "Planche leans at most" },
          { stage: "tuck", label: "Tuck planche, 5s+", hint: "Knees tucked, feet off the ground" },
          { stage: "advancedTuck", label: "Advanced tuck, 5s+", hint: "Flat back, hips at shoulder height" },
          { stage: "straddle", label: "Straddle planche, 5s+" },
          { stage: "full", label: "Full planche, 5s+" },
        ],
      },
      {
        skill: "handstandPushUp",
        title: "Handstand push-up",
        requires: has("wallSpace"),
        showIf: (a) => (a.baselines.pushUpMaxReps ?? 0) >= 10,
        options: [
          { stage: "none", label: "Pike push-ups at most" },
          { stage: "negative", label: "Slow wall negatives", hint: "Lowering under control, can't press up" },
          { stage: "wallFull", label: "Full wall HSPU", hint: "Head to floor and back up" },
          { stage: "freestanding", label: "Freestanding HSPU" },
        ],
      },
    ],
    sides: [
      { skill: "clapPushUp", label: "Clap push-up", assumeAtTier: 2 },
      { skill: "pikePress", label: "Pike press to handstand", minTier: 1, requires: has("wallSpace") },
      { skill: "ninetyDegreePushUp", label: "90° push-up", minTier: 1 },
      { skill: "oneArmPushUp", label: "One-arm push-up", minTier: 1 },
      { skill: "elbowLever", label: "Elbow lever" },
      { skill: "impossibleDip", label: "Impossible dip", minTier: 2 },
    ],
  },
  {
    id: "balance",
    title: "Handstand & balance",
    blurb: "Being upside down — from the wall to one arm.",
    ladders: [
      {
        skill: "handstand",
        title: "Handstand",
        options: [
          { stage: "none", label: "Not yet", hint: "Kicking up, or not upside down at all" },
          { stage: "wall", label: "Wall handstand, 20s+" },
          { stage: "freestanding", label: "Freestanding, 10s+", hint: "No wall, controlled balance" },
        ],
      },
      {
        skill: "oneArmHandstand",
        title: "One-arm handstand",
        showIf: (a) => a.stages.handstand === "freestanding",
        options: [
          { stage: "none", label: "Not yet" },
          { stage: "wall", label: "One arm against a wall" },
          { stage: "freestandingAttempts", label: "Brief freestanding attempts" },
          { stage: "full", label: "Freestanding hold" },
        ],
      },
    ],
    sides: [
      { skill: "wallWalk", label: "Wall walk", assumeAtTier: 1, requires: has("wallSpace") },
      { skill: "handstandWalk", label: "Handstand walk", minTier: 1 },
      { skill: "kipUp", label: "Kip-up" },
    ],
  },
  {
    id: "core",
    title: "Core",
    blurb: "Compression and anti-extension: L-sits, dragon flags, leg raises.",
    ladders: [
      {
        skill: "lSit",
        title: "L-sit",
        options: [
          { stage: "none", label: "Can't lift both feet yet" },
          { stage: "tuck", label: "Tuck L-sit, 10s+", hint: "Knees bent, feet off the floor" },
          { stage: "advanced", label: "One leg straight, 10s+" },
          { stage: "full", label: "Full L-sit, 10s+", hint: "Both legs straight and level" },
        ],
      },
      {
        skill: "dragonFlag",
        title: "Dragon flag",
        options: [
          { stage: "none", label: "Not yet" },
          { stage: "tuck", label: "Tuck dragon flag", hint: "Knees bent, controlled lowering" },
          { stage: "straddle", label: "Straddle dragon flag" },
          { stage: "full", label: "Full, legs together" },
        ],
      },
    ],
    sides: [
      { skill: "sidePlank", label: "Side plank, 30s", assumeAtTier: 1 },
      { skill: "supermanHold", label: "Superman hold", assumeAtTier: 1 },
      { skill: "copenhagenPlank", label: "Copenhagen plank" },
      { skill: "toesToBar", label: "Toes-to-bar", assumeAtTier: 2 },
      { skill: "windmill", label: "Windmill", minTier: 1 },
      { skill: "aroundTheWorld", label: "Around the world", minTier: 1 },
      { skill: "manna", label: "Manna", minTier: 2 },
    ],
  },
  {
    id: "legs",
    title: "Legs",
    blurb: "Single-leg strength, knees-over-toes work and hamstrings.",
    ladders: [
      {
        skill: "pistolSquat",
        title: "Pistol squat",
        options: [
          { stage: "none", label: "Can't get low on one leg" },
          { stage: "negative", label: "Controlled lowering only", hint: "Can't stand back up" },
          { stage: "assisted", label: "Holding a support or onto a box" },
          { stage: "full", label: "Full pistol, no help" },
        ],
      },
    ],
    sides: [
      { skill: "cossackSquat", label: "Cossack squat", assumeAtTier: 2 },
      { skill: "shrimpSquat", label: "Shrimp squat" },
      { skill: "nordicCurl", label: "Nordic curl" },
      { skill: "sissySquat", label: "Sissy squat" },
      { skill: "jumpPistol", label: "Jump pistol", minTier: 1 },
    ],
  },
  {
    id: "statics",
    title: "Levers & rings",
    blurb: "Horizontal holds on the bar, the pole and the rings.",
    ladders: [
      {
        skill: "frontLever",
        title: "Front lever",
        requires: has("pullUpBar", "rings"),
        options: [
          { stage: "none", label: "No lever hold yet" },
          { stage: "tuck", label: "Tuck, 5s+", hint: "Knees to chest, body horizontal" },
          { stage: "advancedTuck", label: "Advanced tuck, 5s+", hint: "Flat back, thighs at 90°" },
          { stage: "oneLeg", label: "One leg straight, 5s+" },
          { stage: "straddle", label: "Straddle, 5s+" },
          { stage: "full", label: "Full front lever, 5s+" },
        ],
      },
      {
        skill: "backLever",
        title: "Back lever",
        requires: has("pullUpBar", "rings"),
        options: [
          { stage: "none", label: "No back lever yet" },
          { stage: "tuck", label: "Tuck, 5s+" },
          { stage: "advancedTuck", label: "Advanced tuck, 5s+" },
          { stage: "oneLeg", label: "One leg straight, 5s+" },
          { stage: "straddle", label: "Straddle, 5s+" },
          { stage: "full", label: "Full back lever, 5s+" },
        ],
      },
      {
        skill: "humanFlag",
        title: "Human flag",
        requires: has("verticalPole"),
        options: [
          { stage: "none", label: "Not yet" },
          { stage: "tuck", label: "Tuck flag, 3s+" },
          { stage: "advancedTuck", label: "Advanced tuck, 3s+" },
          { stage: "straddle", label: "Straddle flag, 3s+" },
          { stage: "full", label: "Full flag, 3s+" },
        ],
      },
    ],
    sides: [
      { skill: "flagPullUp", label: "Flag pull-up", minTier: 1 },
      { skill: "ironCross", label: "Iron cross (or support work)", minTier: 1 },
      { skill: "invertedCross", label: "Inverted cross", minTier: 2 },
      { skill: "maltese", label: "Maltese", minTier: 2 },
      { skill: "victorianCross", label: "Victorian cross", minTier: 2 },
    ],
  },
  {
    id: "mobility",
    title: "Mobility & tricks",
    blurb: "Last one — flexibility and a few acrobatic extras.",
    ladders: [],
    sides: [
      { skill: "bridge", label: "Full bridge" },
      { skill: "turkishGetUp", label: "Turkish get-up" },
      { skill: "backFlip", label: "Back flip" },
      { skill: "frontFlip", label: "Front flip" },
    ],
  },
];

// ---- availability / gating ----

function equipmentOk(req: (keyof TrainingEquipment)[] | undefined, eq: TrainingEquipment): boolean {
  return !req || req.some((k) => eq[k]);
}

const LADDER_SKILLS = new Set<string>(["frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit"]);

function skillEquipmentOk(skill: StagedSkillKey, eq: TrainingEquipment): boolean {
  if (LADDER_SKILLS.has(skill)) return true;
  return advancedSkillAvailable(skill as AdvancedSkill, eq);
}

export function visibleLadders(area: AssessmentArea, a: AssessmentAnswers, eq: TrainingEquipment): LadderQuestion[] {
  return area.ladders.filter(
    (l) => equipmentOk(l.requires, eq) && skillEquipmentOk(l.skill, eq) && (!l.showIf || l.showIf(a))
  );
}

export function visibleBaselines(area: AssessmentArea, eq: TrainingEquipment): Baseline[] {
  return (area.baselines ?? []).filter((b) => equipmentOk(b.requires, eq));
}

// Tier in an area from what's been answered: the average relative ladder
// position, nudged by the numeric baselines (rep counts are the most
// honest signal for beginners, who'll answer "none" to every ladder).
export function areaTier(area: AssessmentArea, a: AssessmentAnswers, eq: TrainingEquipment): Tier {
  const parts: number[] = [];
  for (const l of visibleLadders(area, a, eq)) {
    const order = STAGE_ORDER[l.skill] ?? [];
    const stage = a.stages[l.skill];
    if (!stage || order.length < 2) continue;
    parts.push(order.indexOf(stage) / (order.length - 1));
  }
  const b = a.baselines;
  if (area.id === "pull" && b.pullUpMaxReps !== undefined) parts.push(Math.min(1, b.pullUpMaxReps / 18));
  if (area.id === "push" && b.pushUpMaxReps !== undefined) parts.push(Math.min(1, b.pushUpMaxReps / 45));
  if (area.id === "push" && b.dipMaxReps !== undefined && eq.parallelBars) parts.push(Math.min(1, b.dipMaxReps / 25));
  if (area.id === "pull" && a.archerPullUp) parts.push(0.75);
  if (parts.length === 0) return 0;
  const avg = parts.reduce((x, y) => x + y, 0) / parts.length;
  return avg >= 0.6 ? 2 : avg >= 0.25 ? 1 : 0;
}

export function visibleSides(area: AssessmentArea, a: AssessmentAnswers, eq: TrainingEquipment): SideSkill[] {
  const tier = areaTier(area, a, eq);
  return area.sides.filter(
    (s) => (s.minTier ?? 0) <= tier && equipmentOk(s.requires, eq) && skillEquipmentOk(s.skill, eq)
  );
}

// The level a side chip shows: the athlete's own answer, else an
// assumption from their tier, else "not yet".
export function sideLevel(area: AssessmentArea, side: SideSkill, a: AssessmentAnswers, eq: TrainingEquipment): SideLevel {
  const own = a.sides[side.skill];
  if (own !== undefined) return own;
  if (side.assumeAtTier !== undefined && areaTier(area, a, eq) >= side.assumeAtTier) return 2;
  return 0;
}

export function areaHasContent(area: AssessmentArea, a: AssessmentAnswers, eq: TrainingEquipment): boolean {
  return visibleLadders(area, a, eq).length + visibleSides(area, a, eq).length + visibleBaselines(area, eq).length > 0;
}

// ---- prefill from an existing profile (re-taking from the profile page) ----

export function answersFromProfile(
  skills: SkillProfile,
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>
): AssessmentAnswers {
  const stages: AssessmentAnswers["stages"] = {};
  const solidity: AssessmentAnswers["solidity"] = {};
  const sides: AssessmentAnswers["sides"] = {};
  const rec = skills as unknown as Record<string, string>;
  for (const area of ASSESSMENT_AREAS) {
    for (const l of area.ladders) {
      const st = rec[l.skill];
      if (st && st !== "none") {
        stages[l.skill] = st;
        const m = mastery[l.skill];
        if (m) solidity[l.skill] = m <= 2 ? 2 : m >= 5 ? 5 : 4;
      }
    }
    for (const s of area.sides) {
      const st = rec[s.skill];
      if (st && st !== "none") sides[s.skill] = st === "full" ? 2 : 1;
    }
  }
  return {
    stages,
    solidity,
    sides,
    baselines: {
      pullUpMaxReps: skills.pullUpMaxReps,
      pushUpMaxReps: skills.pushUpMaxReps,
      dipMaxReps: skills.dipMaxReps,
    },
    archerPullUp: skills.archerPullUp,
  };
}

// ---- fold answers into the profile ----

const WORKING_MASTERY: SkillMastery = 3;
const CAN_DO_MASTERY: SkillMastery = 4;

// "Working on it" maps to the rung right before the full skill — e.g.
// "developing" for the simple 3-stage skills, a negative for one-arm work.
function workingStage(skill: StagedSkillKey): string {
  const order = STAGE_ORDER[skill] ?? ["none", "full"];
  return order[Math.max(1, order.length - 2)];
}

export function applyAssessment(
  baseSkills: SkillProfile,
  baseMastery: Partial<Record<StagedSkillKey, SkillMastery>>,
  a: AssessmentAnswers,
  eq: TrainingEquipment
): { skills: SkillProfile; mastery: Partial<Record<StagedSkillKey, SkillMastery>> } {
  const skills = { ...baseSkills } as SkillProfile;
  const rec = skills as unknown as Record<string, unknown>;
  const mastery = { ...baseMastery };

  for (const key of ["pullUpMaxReps", "pushUpMaxReps", "dipMaxReps"] as BaselineKey[]) {
    const v = a.baselines[key];
    if (v !== undefined) rec[key] = v;
  }
  if (a.archerPullUp !== undefined) skills.archerPullUp = a.archerPullUp;

  for (const area of ASSESSMENT_AREAS) {
    for (const l of visibleLadders(area, a, eq)) {
      const stage = a.stages[l.skill];
      if (stage === undefined) continue; // unanswered: leave as it was
      rec[l.skill] = stage;
      if (stage === "none") delete mastery[l.skill];
      else mastery[l.skill] = a.solidity[l.skill] ?? DEFAULT_SOLIDITY;
    }
    for (const s of visibleSides(area, a, eq)) {
      const level = sideLevel(area, s, a, eq);
      const before = rec[s.skill] as string;
      if (level === 0) {
        rec[s.skill] = "none";
        delete mastery[s.skill];
      } else if (level === 2) {
        if (before !== "full") mastery[s.skill] = CAN_DO_MASTERY;
        rec[s.skill] = "full";
      } else {
        // keep a more precise in-between stage if the profile already had one
        if (before === "none" || before === "full" || !before) {
          rec[s.skill] = workingStage(s.skill);
          mastery[s.skill] = WORKING_MASTERY;
        }
      }
    }
  }
  return { skills, mastery };
}
