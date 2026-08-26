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
  LEGS_TABLE,
  CORE_TABLE,
  muscleUpTrack,
  handstandTrack,
  pullStrengthTrack,
  pushStrengthTrack,
} from "./trainingData";

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
      return LEGS_TABLE[skills.pistolSquat];
    case "core":
      return CORE_TABLE[skills.lSit];
  }
}

const STAGE_WEIGHT: Record<string, number> = {
  none: 0,
  tuck: 4,
  band: 4,
  wall: 4,
  assisted: 6,
  advancedTuck: 8,
  single: 8,
  advanced: 10,
  oneLeg: 12,
  straddle: 14,
  freestanding: 12,
  multiple: 16,
  full: 18,
};

function stageXpBonus(skills: SkillProfile): number {
  return (
    (STAGE_WEIGHT[skills.frontLever] ?? 0) +
    (STAGE_WEIGHT[skills.backLever] ?? 0) +
    (STAGE_WEIGHT[skills.planche] ?? 0) +
    (STAGE_WEIGHT[skills.muscleUp] ?? 0) +
    (STAGE_WEIGHT[skills.handstand] ?? 0) +
    (STAGE_WEIGHT[skills.humanFlag] ?? 0) +
    (STAGE_WEIGHT[skills.pistolSquat] ?? 0) +
    (STAGE_WEIGHT[skills.lSit] ?? 0)
  );
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

export function generateSession(
  skills: SkillProfile,
  equipment: TrainingEquipment,
  focus: SkillTrack,
  date: Date = new Date()
): TrainingSession {
  const primary: TrainingSet = {
    track: focus,
    title: `${FOCUS_LABEL[focus]} — Skill Work`,
    exercises: exercisesForTrack(focus, skills, equipment),
  };

  const sets: TrainingSet[] = [primary];

  const accessory = accessoryTrackFor(focus, equipment);
  if (accessory !== focus) {
    sets.push({
      track: accessory,
      title: `Accessory — ${FOCUS_LABEL[accessory]}`,
      exercises: exercisesForTrack(accessory, skills, equipment).slice(0, 2),
    });
  }

  const totalExercises = sets.reduce((n, s) => n + s.exercises.length, 0);
  const estXp = 20 + totalExercises * 8 + stageXpBonus(skills);

  return {
    id: `${date.toISOString().slice(0, 10)}-${focus}`,
    dateISO: date.toISOString().slice(0, 10),
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
  const accessory = accessoryTrackFor(focus, sharedEquipment);

  const buildSide = (skills: SkillProfile, label: string): TrainingSession => {
    const primary: TrainingSet = {
      track: focus,
      title: `${FOCUS_LABEL[focus]} — ${label}`,
      exercises: exercisesForTrack(focus, skills, sharedEquipment),
    };
    const sets = [primary];
    if (accessory !== focus) {
      sets.push({
        track: accessory,
        title: `Accessory — ${FOCUS_LABEL[accessory]}`,
        exercises: exercisesForTrack(accessory, skills, sharedEquipment).slice(0, 2),
      });
    }
    const totalExercises = sets.reduce((n, s) => n + s.exercises.length, 0);
    const estXp = 20 + totalExercises * 8 + stageXpBonus(skills);
    return {
      id: `${date.toISOString().slice(0, 10)}-${focus}-${label}`,
      dateISO: date.toISOString().slice(0, 10),
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
    sharedTracks: accessory !== focus ? [focus, accessory] : [focus],
  };
}

export { FOCUS_ORDER, FOCUS_LABEL };
