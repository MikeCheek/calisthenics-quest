// Core domain types for BarQuest

export type FrontLeverStage =
  | "none" | "tuck" | "advancedTuck" | "oneLeg" | "straddle" | "full";

export type BackLeverStage =
  | "none" | "tuck" | "advancedTuck" | "oneLeg" | "straddle" | "full";

export type PlancheStage =
  | "none" | "tuck" | "advancedTuck" | "straddle" | "full";

export type MuscleUpStage = "none" | "band" | "single" | "multiple";

export type HandstandStage = "none" | "wall" | "freestanding";

export type HumanFlagStage = "none" | "tuck" | "advancedTuck" | "straddle" | "full";

export type PistolSquatStage = "none" | "negative" | "assisted" | "full";

export type LSitStage = "none" | "tuck" | "advanced" | "full";

// ---- Advanced / rarer skills ----
export type IronCrossStage = "none" | "support" | "tuckCross" | "full";
export type MalteseStage = "none" | "tuck" | "straddle" | "full";
export type OneArmPullUpStage = "none" | "assisted" | "negative" | "full";
export type OneArmHandstandStage = "none" | "wall" | "freestandingAttempts" | "full";
export type DragonFlagStage = "none" | "tuck" | "straddle" | "full";
export type ElbowLeverStage = "none" | "tuck" | "straddle" | "full";
export type OneArmPushUpStage = "none" | "assisted" | "negative" | "full";
export type NordicCurlStage = "none" | "assisted" | "negative" | "full";
export type ShrimpSquatStage = "none" | "assisted" | "full";
export type HandstandPushUpStage = "none" | "negative" | "wallFull" | "freestanding";
export type ImpossibleDipStage = "none" | "band" | "negative" | "full";
export type MannaStage = "none" | "vSit" | "straddle" | "full";

export interface SkillProfile {
  frontLever: FrontLeverStage;
  backLever: BackLeverStage;
  planche: PlancheStage;
  muscleUp: MuscleUpStage;
  handstand: HandstandStage;
  humanFlag: HumanFlagStage;
  pistolSquat: PistolSquatStage;
  lSit: LSitStage;
  ironCross: IronCrossStage;
  maltese: MalteseStage;
  oneArmPullUp: OneArmPullUpStage;
  oneArmHandstand: OneArmHandstandStage;
  dragonFlag: DragonFlagStage;
  elbowLever: ElbowLeverStage;
  oneArmPushUp: OneArmPushUpStage;
  nordicCurl: NordicCurlStage;
  shrimpSquat: ShrimpSquatStage;
  handstandPushUp: HandstandPushUpStage;
  impossibleDip: ImpossibleDipStage;
  manna: MannaStage;
  pullUpMaxReps: number;
  archerPullUp: boolean;
  dipMaxReps: number;
}

export interface BodyProfile {
  ageYears: number;
  weightKg: number;
  heightCm: number;
  sex?: "male" | "female" | "unspecified";
  experienceYears?: number;
  trainingDaysPerWeek?: number;
  trainingDaysOfWeek?: number[]; // 0=Sun..6=Sat (JS Date.getDay() convention)
  sessionLengthMinutes?: number;
}

// What's physically available at the place someone trains.
// Floor/ground space is assumed always available.
export interface TrainingEquipment {
  pullUpBar: boolean;
  parallelBars: boolean; // dip bars / parallettes / p-bars
  rings: boolean;
  wallSpace: boolean; // wall for handstand work
  verticalPole: boolean; // pole or sturdy tree for human flag
  monkeyBars: boolean; // grip / traverse work
  weights: boolean; // dip belt, weight vest, plates, or a loaded backpack
  resistanceBands: boolean; // elastic bands for assistance
}

export const DEFAULT_EQUIPMENT: TrainingEquipment = {
  pullUpBar: true,
  parallelBars: true,
  rings: false,
  wallSpace: true,
  verticalPole: false,
  monkeyBars: false,
  weights: false,
  resistanceBands: false,
};

// The 10 macro focuses used for the rotating daily session generator.
export type SkillTrack =
  | "frontLever"
  | "backLever"
  | "planche"
  | "muscleUp"
  | "handstand"
  | "humanFlag"
  | "pullStrength"
  | "pushStrength"
  | "legs"
  | "core";

// All individually-tracked skills, including the 12 rarer/advanced ones —
// used for self-assessment, the profile skill list, and the bonus wheel.
export type AdvancedSkill =
  | "ironCross"
  | "maltese"
  | "oneArmPullUp"
  | "oneArmHandstand"
  | "dragonFlag"
  | "elbowLever"
  | "oneArmPushUp"
  | "nordicCurl"
  | "shrimpSquat"
  | "handstandPushUp"
  | "impossibleDip"
  | "manna";

export type AnySkill = SkillTrack | AdvancedSkill;

export interface Exercise {
  name: string;
  detail: string; // sets x reps/time, tempo etc.
  restSeconds: number;
  cue?: string; // short coaching cue
}

export type TrainingSetKind = SkillTrack | "warmup" | "finisher" | "bonusSkill";

export interface TrainingSet {
  track: TrainingSetKind;
  title: string;
  exercises: Exercise[];
}

export interface TrainingSession {
  id: string;
  dateISO: string;
  focusLabel: string;
  sets: TrainingSet[];
  estXp: number;
  forUid?: string; // present in paired sessions
  partnerLabel?: string; // e.g. "Your side" / "Friend's side"
}

export interface PairedSession {
  focusLabel: string;
  hostSession: TrainingSession;
  guestSession: TrainingSession;
  sharedTracks: SkillTrack[];
}

export interface Mission {
  id: string;
  label: string;
  description: string;
  targetCount: number;
  progress: number;
  xpReward: number;
  kind: "sessionsThisWeek" | "streak" | "pairing" | "skillFocus";
  weekKey: string; // e.g. "2026-W35"
  completed: boolean;
}

export interface XPHistoryPoint {
  dateISO: string;
  xp: number;
}

export interface NotificationPrefs {
  enabled: boolean;
  time: string; // "HH:MM", 24h local time
}

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  enabled: false,
  time: "18:00",
};

export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  body: BodyProfile;
  skills: SkillProfile;
  equipment: TrainingEquipment;
  goalTracks: SkillTrack[];
  onboarded: boolean;
  xp: number;
  level: number;
  streak: number;
  lastSessionDateISO?: string;
  totalSessionsCompleted: number;
  missions: Mission[];
  xpHistory: XPHistoryPoint[];
  notifications: NotificationPrefs;
  friendCode: string;
  createdAt: string;
}

// Minimal public-facing profile, readable by any signed-in user, so friends
// can be found by code and shown in each other's friends list without
// exposing skills/equipment/body stats (those stay in the private users/{uid} doc).
export interface PublicProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  friendCode: string;
  level: number;
  streak: number;
}

export interface Friend {
  uid: string;
  displayName: string;
  photoURL?: string;
  addedAtISO: string;
}

export interface Ping {
  id: string;
  fromUid: string;
  fromName: string;
  message: string;
  createdAtISO: string;
}

export const DEFAULT_SKILLS: SkillProfile = {
  frontLever: "none",
  backLever: "none",
  planche: "none",
  muscleUp: "none",
  handstand: "none",
  humanFlag: "none",
  pistolSquat: "none",
  lSit: "none",
  ironCross: "none",
  maltese: "none",
  oneArmPullUp: "none",
  oneArmHandstand: "none",
  dragonFlag: "none",
  elbowLever: "none",
  oneArmPushUp: "none",
  nordicCurl: "none",
  shrimpSquat: "none",
  handstandPushUp: "none",
  impossibleDip: "none",
  manna: "none",
  pullUpMaxReps: 5,
  archerPullUp: false,
  dipMaxReps: 5,
};

export const DEFAULT_BODY: BodyProfile = {
  ageYears: 25,
  weightKg: 75,
  heightCm: 178,
  sex: "unspecified",
  experienceYears: 1,
  trainingDaysPerWeek: 3,
  trainingDaysOfWeek: [1, 3, 5], // Mon / Wed / Fri
  sessionLengthMinutes: 45,
};

// Track labels used across pickers, charts, and goal selection
export const TRACK_LABEL: Record<SkillTrack, string> = {
  frontLever: "Front Lever",
  backLever: "Back Lever",
  planche: "Planche",
  muscleUp: "Muscle-Up",
  handstand: "Handstand",
  humanFlag: "Human Flag",
  pullStrength: "Pull Strength",
  pushStrength: "Push Strength",
  legs: "Legs",
  core: "Core",
};

export const ADVANCED_SKILL_LABEL: Record<AdvancedSkill, string> = {
  ironCross: "Iron Cross",
  maltese: "Maltese",
  oneArmPullUp: "One-Arm Pull-Up",
  oneArmHandstand: "One-Arm Handstand",
  dragonFlag: "Dragon Flag",
  elbowLever: "Elbow Lever",
  oneArmPushUp: "One-Arm Push-Up",
  nordicCurl: "Nordic Curl",
  shrimpSquat: "Shrimp Squat",
  handstandPushUp: "Handstand Push-Up",
  impossibleDip: "Impossible Dip",
  manna: "Manna",
};

export const ANY_SKILL_LABEL: Record<AnySkill, string> = {
  ...TRACK_LABEL,
  ...ADVANCED_SKILL_LABEL,
};

// All 20 individually-progressed skills (SkillProfile's staged fields),
// labeled for display — distinct from TRACK_LABEL, since a couple of the
// 10 macro rotation tracks ("Legs", "Core") don't share a name with the
// specific skill they're built around (Pistol Squat, L-Sit).
export type StagedSkillKey =
  | "frontLever" | "backLever" | "planche" | "muscleUp" | "handstand"
  | "humanFlag" | "pistolSquat" | "lSit" | AdvancedSkill;

export const SKILL_FIELD_LABEL: Record<StagedSkillKey, string> = {
  frontLever: "Front Lever",
  backLever: "Back Lever",
  planche: "Planche",
  muscleUp: "Muscle-Up",
  handstand: "Handstand",
  humanFlag: "Human Flag",
  pistolSquat: "Pistol Squat",
  lSit: "L-Sit",
  ...ADVANCED_SKILL_LABEL,
};
