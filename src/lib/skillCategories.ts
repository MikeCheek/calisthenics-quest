import { StagedSkillKey } from "./types";

export interface SkillCategory {
  name: string;
  skills: StagedSkillKey[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Levers & Static Holds",
    skills: ["frontLever", "backLever", "planche", "ironCross", "maltese", "invertedCross", "victorianCross", "elbowLever"],
  },
  {
    name: "Pulling",
    skills: ["muscleUp", "oneArmPullUp", "chestToBarPullUp", "wideGripPullUp", "ringMuscleUp", "flagPullUp", "lSitPullUp", "typewriterPullUp", "toesToBar", "skinTheCat", "germanHang", "impossibleDip"],
  },
  {
    name: "Pressing & Balance",
    skills: ["handstand", "oneArmHandstand", "handstandPushUp", "handstandWalk", "wallWalk", "pikePress", "ninetyDegreePushUp", "oneArmPushUp", "clapPushUp"],
  },
  {
    name: "Core & Compression",
    skills: ["lSit", "dragonFlag", "manna", "supermanHold", "sidePlank", "copenhagenPlank", "bridge"],
  },
  {
    name: "Legs",
    skills: ["pistolSquat", "shrimpSquat", "nordicCurl", "sissySquat", "cossackSquat", "jumpPistol"],
  },
  {
    name: "Dynamic & Flashy",
    skills: ["humanFlag", "kipUp", "backFlip", "frontFlip", "windmill", "aroundTheWorld", "turkishGetUp", "ropeClimb"],
  },
];
