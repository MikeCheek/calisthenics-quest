import { Exercise, StagedSkillKey, TrainingEquipment, AdvancedSkill } from "./types";
import { STAGE_ORDER } from "./stageOrder";
import {
  FRONT_LEVER_TABLE,
  BACK_LEVER_TABLE,
  PLANCHE_TABLE,
  HUMAN_FLAG_TABLE,
  CORE_TABLE,
  muscleUpStageTable,
  handstandStageTable,
  legsStageTable,
} from "./trainingData";
import { advancedSkillTable } from "./advancedSkills";

const CORE_SKILLS: StagedSkillKey[] = [
  "frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit",
];

const ADVANCED_SKILLS: AdvancedSkill[] = [
  "ironCross", "maltese", "oneArmPullUp", "oneArmHandstand", "dragonFlag", "elbowLever",
  "oneArmPushUp", "nordicCurl", "shrimpSquat", "handstandPushUp", "impossibleDip", "manna",
  "clapPushUp", "kipUp", "backFlip", "frontFlip", "windmill", "aroundTheWorld", "handstandWalk",
  "wallWalk", "supermanHold", "sidePlank", "copenhagenPlank", "bridge", "turkishGetUp", "pikePress",
  "ropeClimb", "skinTheCat", "germanHang", "chestToBarPullUp", "wideGripPullUp", "ringMuscleUp",
  "ninetyDegreePushUp", "jumpPistol", "sissySquat", "cossackSquat", "flagPullUp", "lSitPullUp",
  "typewriterPullUp", "toesToBar", "invertedCross", "victorianCross",
];

// Every piece of equipment enabled — for building the reverse index we want
// every exercise variant that could ever appear in any session, regardless
// of what the current athlete actually owns.
const ALL_EQUIPMENT: TrainingEquipment = {
  pullUpBar: true, parallelBars: true, rings: true, wallSpace: true,
  verticalPole: true, monkeyBars: true, weights: true, resistanceBands: true,
};

function tableForSkill(skill: StagedSkillKey, equipment: TrainingEquipment): Record<string, Exercise[]> {
  switch (skill) {
    case "frontLever": return FRONT_LEVER_TABLE;
    case "backLever": return BACK_LEVER_TABLE;
    case "planche": return PLANCHE_TABLE;
    case "humanFlag": return HUMAN_FLAG_TABLE;
    case "lSit": return CORE_TABLE;
    case "muscleUp": return muscleUpStageTable(equipment);
    case "handstand": return handstandStageTable(equipment);
    case "pistolSquat": return legsStageTable(equipment);
    default: return advancedSkillTable(skill as AdvancedSkill);
  }
}

interface ExerciseLocation {
  skill: StagedSkillKey;
  stage: string;
}

let index: Map<string, ExerciseLocation> | null = null;

function buildIndex(): Map<string, ExerciseLocation> {
  const map = new Map<string, ExerciseLocation>();
  for (const skill of [...CORE_SKILLS, ...ADVANCED_SKILLS]) {
    const table = tableForSkill(skill, ALL_EQUIPMENT);
    for (const stage of Object.keys(table)) {
      for (const ex of table[stage] ?? []) {
        // first table to claim a name wins — a handful of generic drill
        // names (e.g. "Scapula pulls") legitimately appear in more than
        // one skill's table; this is a best-effort match, not a guarantee
        if (!map.has(ex.name)) map.set(ex.name, { skill, stage });
      }
    }
  }
  return map;
}

function getIndex(): Map<string, ExerciseLocation> {
  if (!index) index = buildIndex();
  return index;
}

export function findExerciseSource(name: string): ExerciseLocation | null {
  return getIndex().get(name) ?? null;
}

// Steps down one stage at a time (skipping any stage that's empty for the
// current equipment, or whose only option is the same exercise) until it
// finds a genuinely different, easier exercise — or returns null if the
// exercise isn't in the index at all, or is already at the easiest tracked
// stage.
export function findEasierExercise(
  currentName: string,
  equipment: TrainingEquipment
): Exercise | null {
  const loc = findExerciseSource(currentName);
  if (!loc) return null;
  const order = STAGE_ORDER[loc.skill];
  if (!order) return null;
  const idx = order.indexOf(loc.stage);
  if (idx <= 0) return null;

  const table = tableForSkill(loc.skill, equipment);
  for (let i = idx - 1; i >= 0; i--) {
    const options = (table[order[i]] ?? []).filter((e) => e.name !== currentName);
    if (options.length > 0) {
      return options[Math.floor(Math.random() * options.length)];
    }
  }
  return null;
}
