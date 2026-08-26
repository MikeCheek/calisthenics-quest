import { Exercise, SkillProfile, TrainingEquipment } from "./types";
import { stageAtOffset } from "./stageOrder";
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

// Only the "staged" skills (as opposed to the rep-count-based pull/push
// strength tracks) have a clean notion of "one level easier/harder", so
// those are the only tracks the wheel offers.
export type WheelTrack =
  | "frontLever"
  | "backLever"
  | "planche"
  | "muscleUp"
  | "handstand"
  | "humanFlag"
  | "legs"
  | "core";

export const WHEEL_TRACK_LABEL: Record<WheelTrack, string> = {
  frontLever: "Front Lever",
  backLever: "Back Lever",
  planche: "Planche",
  muscleUp: "Muscle-Up",
  handstand: "Handstand",
  humanFlag: "Human Flag",
  legs: "Pistol Squat",
  core: "L-Sit",
};

const WHEEL_SKILL_KEY: Record<WheelTrack, keyof SkillProfile> = {
  frontLever: "frontLever",
  backLever: "backLever",
  planche: "planche",
  muscleUp: "muscleUp",
  handstand: "handstand",
  humanFlag: "humanFlag",
  legs: "pistolSquat",
  core: "lSit",
};

export function wheelPool(
  track: WheelTrack,
  skills: SkillProfile,
  equipment: TrainingEquipment,
  offset: number
): Exercise[] {
  const skillKey = WHEEL_SKILL_KEY[track];
  const currentStage = skills[skillKey] as string;
  const stage = stageAtOffset(skillKey, currentStage, offset);

  switch (track) {
    case "frontLever":
      return FRONT_LEVER_TABLE[stage as keyof typeof FRONT_LEVER_TABLE];
    case "backLever":
      return BACK_LEVER_TABLE[stage as keyof typeof BACK_LEVER_TABLE];
    case "planche":
      return PLANCHE_TABLE[stage as keyof typeof PLANCHE_TABLE];
    case "muscleUp":
      return muscleUpStageTable(equipment)[stage as keyof ReturnType<typeof muscleUpStageTable>];
    case "handstand":
      return handstandStageTable(equipment)[stage as keyof ReturnType<typeof handstandStageTable>];
    case "humanFlag":
      return HUMAN_FLAG_TABLE[stage as keyof typeof HUMAN_FLAG_TABLE];
    case "legs":
      return legsStageTable(equipment)[stage as keyof ReturnType<typeof legsStageTable>];
    case "core":
      return CORE_TABLE[stage as keyof typeof CORE_TABLE];
  }
}
