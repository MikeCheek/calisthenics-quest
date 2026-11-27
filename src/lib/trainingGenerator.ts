import {
  Exercise,
  PairedSession,
  SkillProfile,
  SkillTrack,
  TrainingEquipment,
  TrainingSession,
  TrainingSet,
  TrainingSetKind,
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
  homePullTrack,
  pushStrengthTrack,
} from "./trainingData";
import { pickWarmup, pickWarmupFor, pickFinisher } from "./warmupFinisher";
import { bandAssistanceBonus } from "./bandBonus";
import { advancedSkillBonusSet } from "./advancedSkills";
import { STAGE_ORDER } from "./stageOrder";
import { aboveYourStage, stageExercises } from "./exerciseHierarchy";
import { freshest, rotateScheme, rotationWhy, supportPool, timesDone, type History } from "./variety";
import { easeTired, volumeAccessory } from "./muscleLoad";

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
export const REQUIRED_EQUIPMENT: Partial<Record<SkillTrack, (keyof TrainingEquipment)[]>> = {
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

// The accessory balances the day: a pulling skill gets push strength, a
// pushing one pull strength; leg and core days alternate. (It used to
// always prefer pulling, so most sessions carried a pull block.)
const PULLING: SkillTrack[] = ["frontLever", "backLever", "muscleUp", "pullStrength", "humanFlag"];
function accessoryTrackFor(focus: SkillTrack, equipment: TrainingEquipment, dateISO = ""): SkillTrack {
  const available = availableFocuses(equipment).filter((t) => t !== focus);
  const odd = parseInt(dateISO.slice(8, 10) || "0", 10) % 2 === 1;
  const preferred: SkillTrack[] = PULLING.includes(focus)
    ? ["pushStrength", "core", "legs", "pullStrength"]
    : focus === "legs" || focus === "core"
      ? odd
        ? ["pullStrength", "pushStrength", "core", "legs"]
        : ["pushStrength", "pullStrength", "core", "legs"]
      : ["pullStrength", "pushStrength", "core", "legs"];
  return preferred.find((t) => available.includes(t)) ?? available[0] ?? focus;
}

// Builds a complete session: warm-up -> main skill focus (which itself runs
// from foundational/propedeutic drills up through the harder work for that
// stage, since the exercise tables are already ordered that way) ->
// accessory strength work -> a short finisher.
// Swaps anything above the athlete's stage in its skill for that stage's
// own work (or drops it), so a session never prescribes what they can't do.
function keepToYourStages(sets: TrainingSet[], skills: SkillProfile, equipment: TrainingEquipment): TrainingSet[] {
  const mine = skills as unknown as Record<string, unknown>;
  const taken = new Set(sets.flatMap((st) => st.exercises.map((e) => e.name)));
  return sets
    .map((set) => {
      if (set.track === "warmup" || set.track === "finisher") return set;
      const exercises = set.exercises.flatMap((ex) => {
        const above = aboveYourStage(ex.name, mine);
        if (!above) return [ex];
        const own = stageExercises(above.skill, above.stage, equipment).find((e) => !taken.has(e.name) && !aboveYourStage(e.name, mine));
        if (!own) return [];
        taken.add(own.name);
        return [own];
      });
      return { ...set, exercises };
    })
    .filter((set) => set.exercises.length > 0);
}

// the skill each staged track follows (its stage picks the table)
const SKILL_OF: Partial<Record<SkillTrack, keyof SkillProfile>> = {
  frontLever: "frontLever",
  backLever: "backLever",
  planche: "planche",
  humanFlag: "humanFlag",
  core: "lSit",
  muscleUp: "muscleUp",
  handstand: "handstand",
  legs: "pistolSquat",
};

// The skill practice: the key hold first, then two more drills — one of
// this stage's, one from this stage or the one below (volume) — whichever
// were done least recently. Schemes turn with how often each was done.
// Strength focuses rotate in pulling or pushing work from the skill pools.
function skillBlock(focus: SkillTrack, skills: SkillProfile, equipment: TrainingEquipment, history: History | undefined, seed: string): Exercise[] {
  const list = exercisesForTrack(focus, skills, equipment);
  if (list.length <= 1) return list;
  const [anchor, ...rest] = list;
  const taken = new Set([anchor.name]);
  let picked: Exercise[];
  if (focus === "pullStrength" || focus === "pushStrength") {
    const extra = patternExtras(focus, skills, equipment, taken).filter((e) => !rest.some((r) => r.name === e.name));
    const fromList = freshest(rest, Math.max(1, rest.length - 1), history, seed);
    fromList.forEach((e) => taken.add(e.name));
    picked = [...fromList, ...freshest(extra.filter((e) => !taken.has(e.name)), 1, history, seed)];
  } else {
    const key = SKILL_OF[focus];
    let below: Exercise[] = [];
    if (key) {
      const order = STAGE_ORDER[key] ?? [];
      const i = order.indexOf(String(skills[key]));
      if (i > 0) below = exercisesForTrack(focus, { ...skills, [key]: order[i - 1] } as SkillProfile, equipment);
    }
    const one = freshest(rest, 1, history, seed);
    one.forEach((e) => taken.add(e.name));
    let pool = [...rest, ...below].filter((e, i, a) => !taken.has(e.name) && a.findIndex((x) => x.name === e.name) === i);
    // a small stage (the first ones): top up from what builds the skill
    if (pool.length < 3) pool = [...pool, ...supportPool(focus, skills, equipment, new Set([...taken, ...pool.map((e) => e.name)]))];
    picked = [...one, ...freshest(pool, 1, history, seed)];
  }
  const ordered = picked.sort((a, b) => hashOf(`${seed}:${a.name}`) - hashOf(`${seed}:${b.name}`));
  return [anchor, ...ordered].map((e) => rotateScheme(e, timesDone(history, e.name), history));
}

// More pulling or pushing work from the skills' strength pools, so a
// strength block isn't the same three exercises every time.
function patternExtras(track: "pullStrength" | "pushStrength", skills: SkillProfile, equipment: TrainingEquipment, taken: Set<string>): Exercise[] {
  const kind = track === "pullStrength" ? /pull|row|chin/i : /push|dip|pike|support/i;
  const from: SkillTrack[] = track === "pullStrength" ? ["muscleUp", "frontLever", "backLever"] : ["planche", "handstand", "backLever"];
  const out = from.flatMap((t) => supportPool(t, skills, equipment, taken)).filter((e) => kind.test(e.name));
  return out.filter((e, i) => out.findIndex((x) => x.name === e.name) === i);
}

const hashOf = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

function buildSets(
  skills: SkillProfile,
  equipment: TrainingEquipment,
  focus: SkillTrack,
  dateISO: string,
  primaryLabel: string,
  accessoryCount = 2,
  history?: History
): TrainingSet[] {
  const warmup: TrainingSet = {
    track: "warmup",
    title: "Warm-Up",
    exercises: pickWarmup(dateISO, focus),
  };

  const block = skillBlock(focus, skills, equipment, history, dateISO);
  const primary: TrainingSet = {
    track: focus,
    title: `Main Focus — ${primaryLabel}`,
    exercises: block,
    why: ["The key exercise every time; the rest rotate", rotationWhy(block.slice(1).map((e) => e.name), history, dateISO)].filter(Boolean).join(" · "),
  };

  const bandBonus = bandAssistanceBonus(focus, skills, equipment);
  if (bandBonus) primary.exercises = [...primary.exercises, bandBonus];

  const sets: TrainingSet[] = [warmup, primary];
  const taken = new Set(primary.exercises.map((e) => e.name));

  // what builds the muscles the skill needs, rotated
  const strength = supportPool(focus, skills, equipment, taken);
  if (strength.length) {
    const picked = freshest(strength, accessoryCount >= 4 ? 3 : 2, history, `${dateISO}:s`).map((e) => rotateScheme(e, timesDone(history, e.name), history));
    picked.forEach((e) => taken.add(e.name));
    const why = rotationWhy(picked.map((e) => e.name), history, dateISO);
    sets.push({ track: focus, title: `Strength for ${primaryLabel}`, exercises: picked, why: [`Builds the strength ${primaryLabel} needs`, why].filter(Boolean).join(" · ") });
  }

  // the group furthest from its weekly target (muscleLoad.ts), once there's a log
  const byVolume = history?.load?.length ? volumeAccessory(focus, availableFocuses(equipment), history.load, dateISO) : null;
  const accessory = byVolume?.track ?? accessoryTrackFor(focus, equipment, dateISO);
  if (accessory !== focus) {
    const base = exercisesForTrack(accessory, skills, equipment);
    const extra = accessory === "pullStrength" || accessory === "pushStrength" ? patternExtras(accessory, skills, equipment, taken) : [];
    // never above your stage (it would be swapped for another skill's drill later)
    const options = [...base, ...extra].filter((e, i, a) => !taken.has(e.name) && a.findIndex((x) => x.name === e.name) === i && !aboveYourStage(e.name, skills as unknown as Record<string, unknown>));
    const picked = freshest(options, accessoryCount >= 4 ? 3 : 2, history, `${dateISO}:a`);
    picked.forEach((e) => taken.add(e.name));
    sets.push({
      track: accessory,
      title: `Accessory — ${FOCUS_LABEL[accessory]}`,
      exercises: picked,
      ...(byVolume?.why ? { why: byVolume.why } : {}),
    });
  }

  // no bar and no rings (home): pulling would vanish from the session —
  // keep it with door, towel and table rows
  if (!equipment.pullUpBar && !equipment.rings && focus !== "pullStrength") {
    sets.push({
      track: "pullStrength",
      title: `Accessory — ${FOCUS_LABEL.pullStrength}`,
      exercises: homePullTrack(skills, equipment).slice(0, accessoryCount),
    });
  }

  const bonusSkillSet = advancedSkillBonusSet(skills, equipment, dateISO);
  if (bonusSkillSet) sets.push(bonusSkillSet);

  sets.push({
    track: "finisher",
    title: "Final Hits",
    exercises: [pickFinisher(dateISO, equipment)],
  });

  // a block can borrow from another skill (planche push-ups in push
  // strength, HSPU in handstand work): never above where you are in it
  const kept = keepToYourStages(sets, skills, equipment);
  // a muscle group that had a hard day yesterday: a set lighter on what still loads it
  sets.splice(0, sets.length, ...easeTired(kept, history?.load, dateISO));

  // now the whole session is known: warm up for what it will actually load
  const matched = pickWarmupFor(
    sets.filter((s) => s !== warmup).flatMap((s) => s.exercises.map((e) => ({ name: e.name, detail: e.detail, setTitle: s.title }))),
    equipment,
    dateISO
  );
  if (matched.length) warmup.exercises = matched;

  return sets;
}

export function generateSession(
  skills: SkillProfile,
  equipment: TrainingEquipment,
  focus: SkillTrack,
  date: Date = new Date(),
  // Longer sessions get the whole accessory track to work with; the
  // session fitter (sessionFit.ts) then trims or extends to the minute.
  targetMinutes?: number,
  // what was done when (exerciseStats) and best sets (records): sessions
  // rotate away from what was done most recently
  history?: History
): TrainingSession {
  const dateISO = date.toISOString().slice(0, 10);
  const accessoryCount = targetMinutes && targetMinutes >= 60 ? 4 : 2;
  const sets = buildSets(skills, equipment, focus, dateISO, FOCUS_LABEL[focus], accessoryCount, history);

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

// Tracks that genuinely need a shared pull-up bar — front lever, back
// lever, and muscle-up all hang from one; pull strength's whole track is
// bar-based too. Planche/handstand/legs/core/push-strength/human-flag
// (a pole, not a bar) don't compete for the same piece of equipment.
const BAR_DEPENDENT_TRACKS = new Set<TrainingSetKind>(["frontLever", "backLever", "muscleUp", "pullStrength"]);

// With only one bar between two training partners, they can't both be on
// it at once — instead of training in parallel, they alternate turns. The
// rest period built into a bar-dependent exercise already accounts for one
// person's own recovery; with a single bar, that same window is also when
// the *other* person takes their turn, so it needs to be roughly doubled
// to actually cover both turns rather than rushing the partner who's
// waiting. Exercises that don't touch a shared bar (warm-up, legs, core,
// push strength, finisher) are untouched — everyone can do those in
// parallel regardless of bar count.
export function applyAlternatingBarTurns(session: TrainingSession): TrainingSession {
  return {
    ...session,
    sets: session.sets.map((set) => {
      if (!BAR_DEPENDENT_TRACKS.has(set.track)) return set;
      return {
        ...set,
        title: `${set.title} (alternate turns on the bar)`,
        exercises: set.exercises.map((ex) => ({ ...ex, restSeconds: ex.restSeconds * 2 })),
      };
    }),
  };
}
