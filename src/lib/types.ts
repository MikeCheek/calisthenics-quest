import type { EffortSample } from "./effort";
// Core domain types for BarQuests

export type Locale = "en" | "it";

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

// ---- 30 more skills (rounding out to 50 total). Two shared generic
// progressions are reused across most of these rather than inventing a
// unique stage vocabulary for each — keeps the data set tractable while
// still giving every skill a real none -> full arc.
export type SimpleSkillStage = "none" | "developing" | "full";
export type AssistedSkillStage = "none" | "assisted" | "developing" | "full";

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
  // 30 more skills
  clapPushUp: SimpleSkillStage;
  kipUp: SimpleSkillStage;
  backFlip: SimpleSkillStage;
  frontFlip: SimpleSkillStage;
  windmill: SimpleSkillStage;
  aroundTheWorld: SimpleSkillStage;
  handstandWalk: SimpleSkillStage;
  wallWalk: SimpleSkillStage;
  supermanHold: SimpleSkillStage;
  sidePlank: SimpleSkillStage;
  copenhagenPlank: SimpleSkillStage;
  bridge: SimpleSkillStage;
  turkishGetUp: SimpleSkillStage;
  pikePress: SimpleSkillStage;
  ropeClimb: SimpleSkillStage;
  skinTheCat: AssistedSkillStage;
  germanHang: AssistedSkillStage;
  chestToBarPullUp: AssistedSkillStage;
  wideGripPullUp: AssistedSkillStage;
  ringMuscleUp: AssistedSkillStage;
  ninetyDegreePushUp: AssistedSkillStage;
  jumpPistol: AssistedSkillStage;
  sissySquat: AssistedSkillStage;
  cossackSquat: AssistedSkillStage;
  flagPullUp: AssistedSkillStage;
  lSitPullUp: AssistedSkillStage;
  typewriterPullUp: AssistedSkillStage;
  toesToBar: AssistedSkillStage;
  invertedCross: AssistedSkillStage;
  victorianCross: AssistedSkillStage;
  pullUpMaxReps: number;
  archerPullUp: boolean;
  dipMaxReps: number;
  // Asked separately from dips in the assessment — floor-only athletes have
  // no dip numbers to give, and the two don't track each other closely.
  pushUpMaxReps?: number;
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
  // kit you own that only counts at home (a park has its own bars)
  homeBar?: boolean; // doorway / wall-mounted pull-up bar
  parallettes?: boolean; // floor parallettes, dip handles
}

// What the place gives you (a park, a gym, your usual spot) and what you
// bring along. The place changes with where you train today; your kit
// follows you.
export const SPOT_KEYS = ["pullUpBar", "parallelBars", "wallSpace", "verticalPole", "monkeyBars"] as const;
export const KIT_KEYS = ["weights", "resistanceBands", "rings", "homeBar", "parallettes"] as const;
export type SpotKey = (typeof SPOT_KEYS)[number];
export type KitKey = (typeof KIT_KEYS)[number];

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

// All individually-tracked skills beyond the 8 macro-track ones — the
// original 12 rarer/advanced skills plus the 30 that round it out to 50 —
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
  | "manna"
  | "clapPushUp"
  | "kipUp"
  | "backFlip"
  | "frontFlip"
  | "windmill"
  | "aroundTheWorld"
  | "handstandWalk"
  | "wallWalk"
  | "supermanHold"
  | "sidePlank"
  | "copenhagenPlank"
  | "bridge"
  | "turkishGetUp"
  | "pikePress"
  | "ropeClimb"
  | "skinTheCat"
  | "germanHang"
  | "chestToBarPullUp"
  | "wideGripPullUp"
  | "ringMuscleUp"
  | "ninetyDegreePushUp"
  | "jumpPistol"
  | "sissySquat"
  | "cossackSquat"
  | "flagPullUp"
  | "lSitPullUp"
  | "typewriterPullUp"
  | "toesToBar"
  | "invertedCross"
  | "victorianCross";

export type AnySkill = SkillTrack | AdvancedSkill;

export interface Exercise {
  name: string;
  detail: string; // sets x reps/time, tempo etc.
  restSeconds: number;
  cue?: string; // short coaching cue, shown during training
  description?: string; // how to actually perform the movement
  // Set by adaptation.ts when this exercise was changed because of the
  // athlete's own history — shown as a small "adapted" note in the UI.
  adaptNote?: string;
  adaptedFrom?: string; // the exercise name it replaced
  adaptDir?: "easier" | "harder";
  // Present on a "Skill Check" exercise: the claim it verifies and the
  // target that proves it (see verification.ts).
  check?: CheckSpec;
}

export type BaselineClaimKey = "pullUpMaxReps" | "pushUpMaxReps" | "dipMaxReps";
export type ClaimKey = StagedSkillKey | BaselineClaimKey;

export interface CheckSpec {
  key: ClaimKey;
  kind: "hold" | "reps" | "pass"; // seconds held / reps done / did-it yes-no
  target: number; // seconds or reps; 1 for "pass"
  label: string; // e.g. "Tuck Front Lever"
}

// Something the athlete said they can do — from the assessment or a profile
// edit. It stays "claimed" until a Skill Check in training proves it.
export interface SkillClaim {
  value: string | number; // stage, or a rep count for baselines
  status: "claimed" | "verified" | "unconfirmed";
  claimedAt: string;
  verifiedAt?: string;
  lastAttemptAt?: string;
  fails: number; // failed attempts on separate days since the claim
  best?: number; // best measured result so far
  videoKey?: string; // on-device clip of the attempt that verified it
  videoAt?: string;
}

// Cleaned timing from one exercise's timer, after filtering out
// interruptions and accidental taps (see timingLearning.ts).
export interface TimingSummary {
  restRatio?: number; // median rest actually taken / planned, this session
  holdRatio?: number; // median seconds held / target, this session
  repRatio?: number; // median logged reps / prescribed reps, this session
  bestReps?: number; // most reps logged in one clean set
  bestHold?: number; // longest clean hold, seconds
  struggled: boolean; // broke holds early, missed reps, or paused mid-set repeatedly
  ignored: number; // samples dropped as unreliable
}

// What happened to one exercise in a finished session — fed back into
// adaptation.ts so future sessions learn from it.
export type ExerciseOutcome = "done" | "skipped" | "tooHard";

export interface ExerciseFeedback {
  name: string;
  outcome: ExerciseOutcome;
  setTitle: string;
  hurt?: boolean; // "This hurts": rested for a while, not counted as too hard
  repDelta?: number; // the athlete's own in-session +/- adjustment
  adaptedFrom?: string;
  adaptDir?: "easier" | "harder";
  timing?: TimingSummary;
  check?: CheckSpec;
  checkResult?: number | boolean;
  checkVideoKey?: string; // an on-device clip of the Skill Check attempt
  detail?: string; // what was actually prescribed on screen, after adjustments
  sets?: SetRecord[]; // clean per-set results from the timer, when used
  // how far through the session's effort the athlete was when they marked
  // it (0–1, see effort.ts) — "too hard" late in a session weighs less
  fatigue?: number;
  setsDone?: number; // fewer than prescribed: stopped early, only these logged
  chosen?: boolean; // skipped on purpose (tapped Skip), not just not reached
}

// ---- session history ----
export interface SetRecord {
  reps?: number;
  holdSec?: number;
}

export interface ExerciseRecord {
  name: string;
  setTitle: string;
  outcome: ExerciseOutcome;
  detail?: string;
  sets?: SetRecord[];
  checkResult?: number | boolean;
  setsDone?: number; // stopped early: only this many sets were done
  fatigue?: number; // for "too hard"/skipped: how far into the session (effort.ts)
}

export interface PersonalRecord {
  name: string;
  kind: "reps" | "hold";
  value: number;
  previous: number;
}

// One finished session, stored at users/{uid}/sessions/{id}.
export interface SessionRecord {
  id?: string;
  finishedAt: string; // ISO timestamp
  focusLabel: string;
  durationMin?: number; // only when it could be measured plausibly
  xp: number;
  paired?: boolean;
  exercises: ExerciseRecord[];
  records?: PersonalRecord[];
  park?: { id: string; name: string }; // where it was done, when you said
  sport?: import("./sports/types").SportId; // calisthenics unless stated
}

// This week's running totals, mirrored to the public profile for the
// friends leaderboard.
export interface WeekStats {
  key: string; // ISO week, e.g. "2026-W47"
  sessions: number;
  minutes: number;
  verified: number;
  xp: number;
}

export interface ExerciseBest {
  name?: string;
  reps?: number;
  hold?: number;
  dateISO: string;
}

// Rolling per-exercise memory. `p` is a "pressure" score: too hard and
// skips push it up, clean completions pull it down. Thresholds on it decide
// whether the next session eases off, holds, adds volume or steps up.
export interface ExerciseStat {
  p: number;
  done: number;
  skipped: number;
  tooHard: number;
  rd?: number; // remembered rep/set adjustment the athlete keeps choosing
  rr?: number[]; // last few sessions' median rest ratio (taken / planned)
  hr?: number[]; // last few sessions' median hold ratio (held / target)
  rp?: number[]; // last few sessions' median rep ratio (logged / prescribed)
  lastSets?: string; // "12·11·10 reps" / "8s·7s" / the prescribed detail, from the last time it was done
  lastAt?: string;
  last: string;
  hurt?: string; // when it last hurt (ISO): rested for two weeks, then watched
  up?: number; // reps (or seconds) added after hitting the top of the range (progression.ts)
  miss?: number; // sessions in a row below the bottom of the range
  sk?: number; // skipped on purpose while fresh — a sign you'd rather not (variety.ts)
  sb?: number; // sessions since its last best (plateau.ts)
  pl?: string; // when its plateau-breaking fortnight started (plateau.ts)
}

// Rolling per-skill signal from every exercise belonging to that skill —
// drives automatic mastery changes and stage-up/down suggestions.
export interface SkillProgress {
  score: number;
  snoozeUntil?: string; // a declined suggestion isn't re-offered before this
}

export type TrainingSetKind = SkillTrack | "warmup" | "finisher" | "bonusSkill" | "skillCheck" | "sport";

export interface TrainingSet {
  track: TrainingSetKind;
  title: string;
  exercises: Exercise[];
  why?: string; // why this block today, in a line ("Pushing: 4 of 12 hard sets this week")
}

export interface TrainingSession {
  id: string;
  dateISO: string;
  focusLabel: string;
  sets: TrainingSet[];
  estXp: number;
  forUid?: string; // present in paired sessions
  sport?: import("./sports/types").SportId; // a session of another sport (sports/)
  partnerLabel?: string; // e.g. "Your side" / "Friend's side"
  why?: string; // why this focus today, when it moved (muscleLoad.ts)
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

export type SkillMastery = 1 | 2 | 3 | 4 | 5;

export const MASTERY_LABEL: Record<SkillMastery, string> = {
  1: "Attempted",
  2: "Touched it",
  3: "Getting there",
  4: "Consistent",
  5: "Mastered",
};

export const MASTERY_HINT: Record<SkillMastery, string> = {
  1: "Tried it, not really landing it yet",
  2: "Hit it once or twice — brief, rough form",
  3: "Can do it, but inconsistent or not clean",
  4: "Reliable, decent form most of the time",
  5: "Clean, full target reps or hold, controlled",
};

export const DEFAULT_MASTERY: SkillMastery = 3;

export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  body: BodyProfile;
  skills: SkillProfile;
  skillMastery: Partial<Record<StagedSkillKey, SkillMastery>>;
  equipment: TrainingEquipment;
  goalTracks: SkillTrack[];
  onboarded: boolean;
  xp: number;
  level: number;
  streak: number; // consecutive weeks with a session (weekStreak.ts)
  streakUnit?: "week"; // set once a day-based streak has been converted
  // days you said you'd skip (local yyyy-mm-dd, last two weeks): the week's plan moves (weekShift.ts)
  skippedDays?: string[];
  // favourite bar parks (parks.ts), and whether to ask which park you're at before training
  favParks?: import("./parks").FavPark[];
  askPark?: boolean;
  // other sports (sports/): the one Today shows, and your progress in each
  activeSport?: import("./sports/types").SportId;
  // started with another sport at the first login: calisthenics has no skill
  // check yet, so the first switch to it goes through onboarding
  calisthenicsPending?: boolean;
  sports?: Partial<Record<import("./sports/types").ExtraSport, import("./sports/types").SportTrack>>;
  lastSessionDateISO?: string;
  totalSessionsCompleted: number;
  missions: Mission[];
  xpHistory: XPHistoryPoint[];
  // "Done!" replies to friends' challenge nudges that earned XP today (nudges.ts)
  nudgeXp?: { day: string; count: number };
  // bodyweight over time (bodyweight.ts)
  weightLog?: import("./bodyweight").WeightEntry[];
  // a training block in progress, and the last few finished (trainingBlock.ts)
  trainingBlock?: import("./trainingBlock").TrainingBlock | null;
  pastBlocks?: import("./trainingBlock").FinishedBlock[];
  // sessions of your own, saved as favourites (customSession.ts)
  customWorkouts?: import("./customSession").CustomWorkout[];
  // achievements earned: id -> when (achievements.ts)
  achievements?: Record<string, string>;
  // skill stages over time, one snapshot per change (skillHistory.ts)
  skillHistory?: import("./skillHistory").SkillSnapshot[];
  // XP bets placed on the bonus wheel today (bonusWheel.ts)
  wheelBets?: { day: string; count: number };
  notifications: NotificationPrefs;
  friendCode: string;
  createdAt: string;
  locale?: Locale;
  exerciseStats?: Record<string, ExerciseStat>;
  skillProgress?: Partial<Record<StagedSkillKey, SkillProgress>>;
  claims?: Partial<Record<ClaimKey, SkillClaim>>;
  // guided mode: last few sessions' median rest-between-exercises ratio
  transitionRest?: number[];
  // best clean set per exercise (keyed like exerciseStats), for records
  records?: Record<string, ExerciseBest>;
  week?: WeekStats;
  // opted in to the global weekly leaderboard (everyone, not just friends)
  globalBoard?: boolean;
  // friends see your finished sessions in their feed (feed.ts); on unless turned off
  shareActivity?: boolean;
  // effort planned vs done in recent sessions, and whether "I'm tired" was
  // pressed — sessions are balanced against it (effort.ts)
  effortHistory?: EffortSample[];
  // how much of recent sessions was done — sessions are planned around it (sessionLength.ts)
  lengthHistory?: import("./sessionLength").LengthSample[];
  // hard sets per muscle group, per day, for two weeks — recovery and weekly volume (muscleLoad.ts)
  loadLog?: import("./muscleLoad").LoadDay[];
  // how you said you felt before recent sessions, and the lighter week (readiness.ts)
  readinessLog?: import("./readiness").ReadinessSample[];
  lighterWeek?: import("./readiness").LighterWeek;
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
  xp: number;
  totalSessionsCompleted: number;
  skills: SkillProfile;
  skillMastery: Partial<Record<StagedSkillKey, SkillMastery>>;
  week?: WeekStats;
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
  kind?: "nudge" | "pairing_invite" | "nudge_reply" | "kudos";
  pairingCode?: string;
  // a reply to your nudge (NUDGE_REPLIES id)
  reply?: string;
  // a ready-made nudge (nudges.ts), shown in the reader's language;
  // `message` keeps an English copy for older versions of the app
  nudge?: { id: string; vars: Record<string, string | number> };
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
  clapPushUp: "none",
  kipUp: "none",
  backFlip: "none",
  frontFlip: "none",
  windmill: "none",
  aroundTheWorld: "none",
  handstandWalk: "none",
  wallWalk: "none",
  supermanHold: "none",
  sidePlank: "none",
  copenhagenPlank: "none",
  bridge: "none",
  turkishGetUp: "none",
  pikePress: "none",
  ropeClimb: "none",
  skinTheCat: "none",
  germanHang: "none",
  chestToBarPullUp: "none",
  wideGripPullUp: "none",
  ringMuscleUp: "none",
  ninetyDegreePushUp: "none",
  jumpPistol: "none",
  sissySquat: "none",
  cossackSquat: "none",
  flagPullUp: "none",
  lSitPullUp: "none",
  typewriterPullUp: "none",
  toesToBar: "none",
  invertedCross: "none",
  victorianCross: "none",
  pullUpMaxReps: 5,
  archerPullUp: false,
  dipMaxReps: 5,
  pushUpMaxReps: 10,
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
  clapPushUp: "Clap Push-Up",
  kipUp: "Kip-Up",
  backFlip: "Back Flip",
  frontFlip: "Front Flip",
  windmill: "Windmill",
  aroundTheWorld: "Around the World",
  handstandWalk: "Handstand Walk",
  wallWalk: "Wall Walk",
  supermanHold: "Superman Hold",
  sidePlank: "Side Plank",
  copenhagenPlank: "Copenhagen Plank",
  bridge: "Bridge",
  turkishGetUp: "Turkish Get-Up",
  pikePress: "Pike Press",
  ropeClimb: "Rope Climb",
  skinTheCat: "Skin the Cat",
  germanHang: "German Hang",
  chestToBarPullUp: "Chest-to-Bar Pull-Up",
  wideGripPullUp: "Wide-Grip Pull-Up",
  ringMuscleUp: "Ring Muscle-Up",
  ninetyDegreePushUp: "90° Push-Up",
  jumpPistol: "Jump Pistol",
  sissySquat: "Sissy Squat",
  cossackSquat: "Cossack Squat",
  flagPullUp: "Flag Pull-Up",
  lSitPullUp: "L-Sit Pull-Up",
  typewriterPullUp: "Typewriter Pull-Up",
  toesToBar: "Toes-to-Bar",
  invertedCross: "Inverted Cross",
  victorianCross: "Victorian Cross",
};

export const ANY_SKILL_LABEL: Record<AnySkill, string> = {
  ...TRACK_LABEL,
  ...ADVANCED_SKILL_LABEL,
};

// All 50 individually-progressed skills (SkillProfile's staged fields),
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
