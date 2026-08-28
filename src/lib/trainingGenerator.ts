import {
  Exercise,
  PairedSession,
  SkillProfile,
  SkillTrack,
  TrainingEquipment,
  TrainingSession,
  TrainingSet,
  TRACK_LABEL,
} from "./types";
import {
  FRONT_LEVER_TABLE,
  BACK_LEVER_TABLE,
  PLANCHE_TABLE,
  HUMAN_FLAG_TABLE,
  legsTrack,
  CORE_TABLE,
  muscleUpTrack,
  handstandTrack,
  pullStrengthTrack,
  pushStrengthTrack,
} from "./trainingData";
import { pickWarmup, pickFinisher } from "./warmupFinisher";
import { bandAssistanceBonus } from "./bandBonus";
import { advancedSkillBonusSet } from "./advancedSkills";
import { STAGE_ORDER } from "./stageOrder";

const FOCUS_ORDER: SkillTrack[] = [
  "frontLever",
  "backLever",
  "planche",
  "muscleUp",
  "handstand",
  "humanFlag",
  "pullStrength",
  "pushStrength",
  "legs",
  "core",
];

const FOCUS_LABEL = TRACK_LABEL;

// A track only shows up if the required equipment is present.
// Everything not listed needs nothing beyond floor/ground space.
const REQUIRED_EQUIPMENT: Partial<Record<SkillTrack, (keyof TrainingEquipment)[]>> = {
  frontLever: ["pullUpBar"],
  backLever: ["pullUpBar"],
  muscleUp: ["pullUpBar"],
  pullStrength: ["pullUpBar"],
  humanFlag: ["verticalPole"],
};

export function availableFocuses(equipment: TrainingEquipment): SkillTrack[] {
  const list = FOCUS_ORDER.filter((track) => {
    const req = REQUIRED_EQUIPMENT[track];
    if (!req) return true;
    return req.some((key) => equipment[key]);
  });
  return list.length > 0 ? list : ["legs", "core", "pushStrength"]; // always trainable with nothing
}

// Goal tracks appear more often in the rotation (2x weight) so sessions
// lean toward what the athlete says they actually want to achieve.
function weightedFocuses(equipment: TrainingEquipment, goalTracks: SkillTrack[] = []): SkillTrack[] {
  const base = availableFocuses(equipment);
  const goals = base.filter((t) => goalTracks.includes(t));
  return [...base, ...goals];
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function exercisesForTrack(
  track: SkillTrack,
  skills: SkillProfile,
  equipment: TrainingEquipment
): Exercise[] {
  switch (track) {
    case "frontLever":
      return FRONT_LEVER_TABLE[skills.frontLever];
    case "backLever":
      return BACK_LEVER_TABLE[skills.backLever];
    case "planche":
      return PLANCHE_TABLE[skills.planche];
    case "muscleUp":
      return muscleUpTrack(skills, equipment);
    case "handstand":
      return handstandTrack(skills, equipment);
    case "humanFlag":
      return HUMAN_FLAG_TABLE[skills.humanFlag];
    case "pullStrength":
      return pullStrengthTrack(skills, equipment);
    case "pushStrength":
      return pushStrengthTrack(skills, equipment);
    case "legs":
      return legsTrack(skills, equipment);
    case "core":
      return CORE_TABLE[skills.lSit];
  }
}

const STAGE_WEIGHT: Record<string, number> = {
  none: 0,
  negative: 2,
  support: 3,
  vSit: 3,
  tuck: 4,
  band: 4,
  wall: 4,
  assisted: 6,
  developing: 9,
  advancedTuck: 8,
  single: 8,
  tuckCross: 10,
  wallFull: 10,
  advanced: 10,
  oneLeg: 12,
  freestandingAttempts: 12,
  straddle: 14,
  freestanding: 12,
  multiple: 16,
  full: 18,
};

// Sums a small mastery bonus across every one of the 50 tracked skills
// (iterating STAGE_ORDER's keys rather than hardcoding each field keeps
// this in sync automatically as skills are added). This is separate from
// — and smaller than — the level-floor mechanism in levelPath.ts; this one
// just nudges per-session XP rewards up a bit for more broadly skilled
// athletes, on top of the floor that guarantees their level itself.
function stageXpBonus(skills: SkillProfile): number {
  let total = 0;
  for (const key of Object.keys(STAGE_ORDER) as (keyof SkillProfile)[]) {
    const stage = skills[key] as string;
    total += STAGE_WEIGHT[stage] ?? 0;
  }
  return total;
}

export function pickFocus(
  date: Date,
  equipment: TrainingEquipment,
  goalTracks: SkillTrack[] = [],
  offset = 0
): SkillTrack {
  const list = weightedFocuses(equipment, goalTracks);
  const idx = (dayOfYear(date) + offset) % list.length;
  return list[idx];
}

function accessoryTrackFor(focus: SkillTrack, equipment: TrainingEquipment): SkillTrack {
  const available = availableFocuses(equipment).filter((t) => t !== focus);
  const preferred: SkillTrack[] = ["pullStrength", "pushStrength", "core", "legs"];
  return preferred.find((t) => available.includes(t)) ?? available[0] ?? focus;
}

// Builds a complete session: warm-up -> main skill focus (which itself runs
// from foundational/propedeutic drills up through the harder work for that
// stage, since the exercise tables are already ordered that way) ->
// accessory strength work -> a short finisher.
function buildSets(
  skills: SkillProfile,
  equipment: TrainingEquipment,
  focus: SkillTrack,
  dateISO: string,
  primaryLabel: string
): TrainingSet[] {
  const warmup: TrainingSet = {
    track: "warmup",
    title: "Warm-Up",
    exercises: pickWarmup(dateISO, focus),
  };

  const primary: TrainingSet = {
    track: focus,
    title: `Main Focus — ${primaryLabel}`,
    exercises: exercisesForTrack(focus, skills, equipment),
  };

  const bandBonus = bandAssistanceBonus(focus, skills, equipment);
  if (bandBonus) primary.exercises = [...primary.exercises, bandBonus];

  const sets: TrainingSet[] = [warmup, primary];

  const accessory = accessoryTrackFor(focus, equipment);
  if (accessory !== focus) {
    sets.push({
      track: accessory,
      title: `Accessory — ${FOCUS_LABEL[accessory]}`,
      exercises: exercisesForTrack(accessory, skills, equipment).slice(0, 2),
    });
  }

  const bonusSkillSet = advancedSkillBonusSet(skills, equipment, dateISO);
  if (bonusSkillSet) sets.push(bonusSkillSet);

  sets.push({
    track: "finisher",
    title: "Final Hits",
    exercises: [pickFinisher(dateISO, equipment)],
  });

  return sets;
}

export function generateSession(
  skills: SkillProfile,
  equipment: TrainingEquipment,
  focus: SkillTrack,
  date: Date = new Date()
): TrainingSession {
  const dateISO = date.toISOString().slice(0, 10);
  const sets = buildSets(skills, equipment, focus, dateISO, FOCUS_LABEL[focus]);

  const totalExercises = sets.reduce((n, s) => n + s.exercises.length, 0);
  const estXp = 20 + totalExercises * 8 + stageXpBonus(skills);

  return {
    id: `${dateISO}-${focus}`,
    dateISO,
    focusLabel: FOCUS_LABEL[focus],
    sets,
    estXp,
  };
}

export function generatePairedSession(
  hostSkills: SkillProfile,
  guestSkills: SkillProfile,
  sharedEquipment: TrainingEquipment,
  date: Date = new Date()
): PairedSession {
  const focus = pickFocus(date, sharedEquipment);
  const dateISO = date.toISOString().slice(0, 10);

  const buildSide = (skills: SkillProfile, label: string): TrainingSession => {
    const sets = buildSets(skills, sharedEquipment, focus, dateISO, `${FOCUS_LABEL[focus]} — ${label}`);
    const totalExercises = sets.reduce((n, s) => n + s.exercises.length, 0);
    const estXp = 20 + totalExercises * 8 + stageXpBonus(skills);
    return {
      id: `${dateISO}-${focus}-${label}`,
      dateISO,
      focusLabel: FOCUS_LABEL[focus],
      sets,
      estXp,
      partnerLabel: label,
    };
  };

  return {
    focusLabel: FOCUS_LABEL[focus],
    hostSession: buildSide(hostSkills, "Your side"),
    guestSession: buildSide(guestSkills, "Friend's side"),
    sharedTracks: [focus],
  };
}

export { FOCUS_ORDER, FOCUS_LABEL };
