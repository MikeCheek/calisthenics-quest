import { Exercise, SkillProfile, StagedSkillKey, TrainingEquipment, SKILL_FIELD_LABEL } from "./types";
import { STAGE_ORDER, stageIndex, stageAtOffset } from "./stageOrder";
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
import { advancedSkillTable, advancedSkillAvailable, ADVANCED_SKILL_EQUIPMENT } from "./advancedSkills";
import { AdvancedSkill } from "./types";

// The wheel can spin for any of the 20 individually-staged skills.
export type WheelTrack = StagedSkillKey;
export const WHEEL_TRACK_LABEL = SKILL_FIELD_LABEL;

const MACRO_SKILLS: (keyof SkillProfile)[] = [
  "frontLever", "backLever", "planche", "muscleUp", "handstand", "humanFlag", "pistolSquat", "lSit",
];

export function wheelTrackAvailable(track: WheelTrack, equipment: TrainingEquipment): boolean {
  if ((MACRO_SKILLS as string[]).includes(track)) return true;
  return advancedSkillAvailable(track as AdvancedSkill, equipment);
}

export const WHEEL_TRACK_EQUIPMENT = ADVANCED_SKILL_EQUIPMENT;

function stageTableFor(track: WheelTrack, equipment: TrainingEquipment): Record<string, Exercise[]> {
  switch (track) {
    case "frontLever":
      return FRONT_LEVER_TABLE;
    case "backLever":
      return BACK_LEVER_TABLE;
    case "planche":
      return PLANCHE_TABLE;
    case "muscleUp":
      return muscleUpStageTable(equipment);
    case "handstand":
      return handstandStageTable(equipment);
    case "humanFlag":
      return HUMAN_FLAG_TABLE;
    case "pistolSquat":
      return legsStageTable(equipment);
    case "lSit":
      return CORE_TABLE;
    default:
      return advancedSkillTable(track as AdvancedSkill);
  }
}

// Single-stage pool (one exact stage, easier/current/harder) — used by the
// simple inline picker.
export function wheelPool(
  track: WheelTrack,
  skills: SkillProfile,
  equipment: TrainingEquipment,
  offset: number
): Exercise[] {
  const currentStage = skills[track as keyof SkillProfile] as string;
  const stage = stageAtOffset(track as keyof SkillProfile, currentStage, offset);
  const table = stageTableFor(track, equipment);
  return table[stage] ?? [];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A bigger, weighted pool for the casino-style wheel: combines exercises
// from EVERY stage of the skill (not just one), with stages closer to the
// chosen difficulty (current level ± offset) repeated more often — so they
// dominate the odds without excluding the rest, similar to a weighted
// casino wheel where some segments are simply more common. Aims for at
// least ~20 segments; caps at 24 so the wheel stays legible.
export function wheelPoolWeighted(
  track: WheelTrack,
  skills: SkillProfile,
  equipment: TrainingEquipment,
  difficulty: -1 | 0 | 1
): Exercise[] {
  const table = stageTableFor(track, equipment);
  const order = STAGE_ORDER[track] ?? Object.keys(table);
  const currentIdx = stageIndex(track as keyof SkillProfile, skills[track as keyof SkillProfile] as string);
  const focusIdx = Math.min(order.length - 1, Math.max(0, currentIdx + difficulty));

  const weighted: Exercise[] = [];
  order.forEach((stage, i) => {
    const dist = Math.abs(i - focusIdx);
    const repeat = Math.max(1, 4 - dist);
    const exs = table[stage] ?? [];
    for (let r = 0; r < repeat; r++) weighted.push(...exs);
  });

  const shuffled = shuffle(weighted);
  return shuffled.slice(0, Math.min(24, shuffled.length));
}
