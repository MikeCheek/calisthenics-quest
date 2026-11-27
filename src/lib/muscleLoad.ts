import type { ExerciseFeedback, SkillTrack, TrainingSet } from "./types";
import type { SportId } from "./sports/types";
import { HIERARCHY_EXEMPT_SETS, exerciseStage } from "./exerciseHierarchy";
import { adjustDetail, currentSetCount } from "./exerciseTiming";

// ---------------------------------------------------------------------------
// Load per muscle group, across days and sports.
//
// Every finished session adds its hard sets per group (pulling, pushing,
// wrists, core, legs) to a two-week log on the user document. From it:
//
//  - Recovery: a group with a hard day yesterday rests today. The focus moves
//    to a goal that trains something else, the accessory avoids it, and what
//    still touches it is a set lighter.
//  - Weekly volume: the accessory goes to the group furthest from its weekly
//    target of hard sets, so the week stays balanced.
//
// Yoga and Pilates count at half: they load the same muscles, less hard.
// ---------------------------------------------------------------------------

export type Group = "pull" | "push" | "wrists" | "core" | "legs";
export const GROUPS: Group[] = ["pull", "push", "wrists", "core", "legs"];
export type Load = Partial<Record<Group, number>>;
export interface LoadDay {
  d: string; // YYYY-MM-DD
  g: Load;
}

export const LOAD_DAYS = 14;
// hard sets a week that keep each group progressing; wrists aren't a target
export const WEEKLY_TARGET: Record<Exclude<Group, "wrists">, number> = { pull: 12, push: 12, core: 8, legs: 8 };
// hard sets in a day after which the group needs a day off
export const HEAVY_DAY: Record<Group, number> = { pull: 8, push: 8, wrists: 8, core: 10, legs: 8 };
const SPORT_WEIGHT = 0.5;

export const GROUP_LABEL: Record<Group, string> = { pull: "Pulling", push: "Pushing", wrists: "Wrists", core: "Core", legs: "Legs" };

// the groups each focus loads, the main one first
export const FOCUS_GROUPS: Record<SkillTrack, Group[]> = {
  frontLever: ["pull", "core"],
  backLever: ["pull"],
  muscleUp: ["pull", "push"],
  pullStrength: ["pull"],
  humanFlag: ["core", "pull"],
  planche: ["push", "wrists"],
  handstand: ["push", "wrists"],
  pushStrength: ["push"],
  legs: ["legs"],
  core: ["core"],
};

// the accessory tracks, by the group they train
const ACCESSORY: [SkillTrack, Exclude<Group, "wrists">][] = [
  ["pullStrength", "pull"],
  ["pushStrength", "push"],
  ["core", "core"],
  ["legs", "legs"],
];

const CORE_ONLY = /leg raise|knee raise|toes-to-bar|windshield|compression|dead bug/i;
const PULL = /pull|\brows?\b|chin|lever|muscle-?up|skin the cat|\bhang|scapula|german|rope|archer|towel|door frame|flag/i;
const PUSH = /push|dip|planche|handstand|\bhs\b|hspu|pike (push|press)|support|wall walk|press\b|lean|chaturanga|crow|downward dog|bear crawl/i;
const WRISTS = /planche|handstand|hspu|lean|wrist|wall walk|crow|l-sit|pseudo|chaturanga|tiger bend/i;
const CORE = /hollow|leg raise|knee raise|toes|l-sit|v-sit|dragon|plank|compression|dead bug|windshield|superman|boat|hundred|roll[- ]?up|crunch|sit-?up|teaser|ab wheel|flag|lever/i;
const LEGS = /squat|lunge|pistol|bridge|calf|nordic|rdl|deadlift|jump|cossack|step-?up|warrior|chair pose|hamstring|glute|wall sit/i;

// what a skill loads, for exercises whose name doesn't say (flips, crosses, mannas…)
const SKILL_GROUPS: Record<string, Group[]> = {
  frontLever: ["pull", "core"], backLever: ["pull"], planche: ["push", "wrists"], humanFlag: ["core", "pull"], lSit: ["core", "wrists"],
  muscleUp: ["pull", "push"], ringMuscleUp: ["pull", "push"], handstand: ["push", "wrists"], pistolSquat: ["legs"], jumpPistol: ["legs"],
  ironCross: ["pull", "push"], maltese: ["push", "wrists"], invertedCross: ["pull", "push"], victorianCross: ["pull"],
  oneArmPullUp: ["pull"], oneArmHandstand: ["push", "wrists"], oneArmPushUp: ["push"], dragonFlag: ["core"], elbowLever: ["push", "wrists", "core"],
  nordicCurl: ["legs"], manna: ["push", "core", "wrists"], kipUp: ["core", "legs"], backFlip: ["legs"], frontFlip: ["legs"],
  windmill: ["pull", "core"], aroundTheWorld: ["pull", "core"], handstandWalk: ["push", "wrists"], wallWalk: ["push", "wrists"],
  supermanHold: ["core"], copenhagenPlank: ["core", "legs"], turkishGetUp: ["core", "push"], pikePress: ["push", "core", "wrists"],
  germanHang: ["pull"], chestToBarPullUp: ["pull"], wideGripPullUp: ["pull"],
};

/** the muscle groups an exercise loads, from its name (or else its skill) */
export function groupsOf(name: string): Group[] {
  const named = groupsFromName(name);
  if (named.length) return named;
  const at = exerciseStage(name);
  return (at && SKILL_GROUPS[at.skill]) || (/pull|monkey|chest-to-bar|wide-grip/i.test(name) ? ["pull"] : []);
}

function groupsFromName(name: string): Group[] {
  if (CORE_ONLY.test(name)) return ["core"];
  const out: Group[] = [];
  if (PULL.test(name)) out.push("pull");
  if (PUSH.test(name)) out.push("push");
  if (WRISTS.test(name)) out.push("wrists");
  if (CORE.test(name)) out.push("core");
  if (LEGS.test(name)) out.push("legs");
  return out;
}

/** hard sets per group in a finished session (warm-up, cool-down and checks aside) */
export function sessionLoad(feedback: ExerciseFeedback[], sport?: SportId): Load {
  const w = sport && sport !== "calisthenics" ? SPORT_WEIGHT : 1;
  const load: Load = {};
  for (const fb of feedback) {
    if (fb.outcome !== "done" || fb.check || HIERARCHY_EXEMPT_SETS.has(fb.setTitle)) continue;
    const sets = fb.setsDone ?? fb.sets?.length ?? currentSetCount(fb.detail ?? "1");
    for (const g of groupsOf(fb.name)) load[g] = +((load[g] ?? 0) + sets * w).toFixed(1);
  }
  return load;
}

/** adds a session's load to its day, keeping the last two weeks */
export function addLoad(log: LoadDay[] | undefined, day: string, load: Load): LoadDay[] {
  const days = [...(log ?? [])];
  const i = days.findIndex((x) => x.d === day);
  const merged: Load = { ...(i >= 0 ? days[i].g : {}) };
  for (const g of GROUPS) if (load[g]) merged[g] = +((merged[g] ?? 0) + load[g]!).toFixed(1);
  if (i >= 0) days[i] = { d: day, g: merged };
  else days.push({ d: day, g: merged });
  const oldest = shiftDay(day, -(LOAD_DAYS - 1));
  return days.filter((x) => x.d >= oldest && x.d <= day).sort((a, b) => a.d.localeCompare(b.d));
}

export function shiftDay(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const sum = (days: LoadDay[], g: Group) => days.reduce((n, x) => n + (x.g[g] ?? 0), 0);

/** hard sets per group over the 7 days up to and including `day` */
export function weekLoad(log: LoadDay[] | undefined, day: string): Record<Group, number> {
  const from = shiftDay(day, -6);
  const days = (log ?? []).filter((x) => x.d >= from && x.d <= day);
  return Object.fromEntries(GROUPS.map((g) => [g, +sum(days, g).toFixed(1)])) as Record<Group, number>;
}

/** groups that had a hard day yesterday (or earlier today) — they rest today */
export function tiredGroups(log: LoadDay[] | undefined, day: string): Map<Group, number> {
  const recent = (log ?? []).filter((x) => x.d === day || x.d === shiftDay(day, -1));
  const out = new Map<Group, number>();
  for (const g of GROUPS) {
    const n = sum(recent, g);
    if (n >= HEAVY_DAY[g]) out.set(g, Math.round(n));
  }
  return out;
}

export interface FocusChoice {
  focus: SkillTrack;
  why?: string;
}

/**
 * today's focus, moved off a group that needs rest: to the first goal (then
 * any focus, in rotation order) whose main group is fresh. Kept when nothing
 * fresh is available — the session is lighter instead (`easeTired`).
 */
export function restAwareFocus(focus: SkillTrack, options: SkillTrack[], goals: SkillTrack[], log: LoadDay[] | undefined, day: string, label: (t: SkillTrack) => string): FocusChoice {
  const tired = tiredGroups(log, day);
  const main = FOCUS_GROUPS[focus][0];
  if (!tired.has(main)) return { focus };
  const fresh = (t: SkillTrack) => !tired.has(FOCUS_GROUPS[t][0]);
  const start = options.indexOf(focus);
  const rotation = [...options.slice(start + 1), ...options.slice(0, Math.max(0, start))];
  const next = [...goals.filter((g) => options.includes(g)), ...rotation].find((t) => t !== focus && fresh(t));
  if (!next) return { focus };
  return { focus: next, why: `${label(next)} instead of ${label(focus)} — ${GROUP_LABEL[main]}: ${tired.get(main)} hard sets yesterday, it rests today` };
}

export interface AccessoryChoice {
  track: SkillTrack;
  why?: string;
}

/** the accessory for the group furthest from its weekly target, avoiding what's tired and what the focus already trains */
export function volumeAccessory(focus: SkillTrack, available: SkillTrack[], log: LoadDay[], day: string): AccessoryChoice | null {
  const week = weekLoad(log, day);
  const tired = tiredGroups(log, day);
  const own = new Set(FOCUS_GROUPS[focus]);
  const cands = ACCESSORY.filter(([t, g]) => t !== focus && available.includes(t) && !own.has(g));
  const rested = cands.filter(([, g]) => !tired.has(g));
  const pool = rested.length ? rested : cands;
  if (!pool.length) return null;
  // the lowest share of its target; earlier in the list on a tie
  const [track, group] = [...pool].sort((a, b) => week[a[1]] / WEEKLY_TARGET[a[1]] - week[b[1]] / WEEKLY_TARGET[b[1]])[0];
  return { track, why: `${GROUP_LABEL[group]}: ${Math.round(week[group])} of ${WEEKLY_TARGET[group]} hard sets this week` };
}

/** a set fewer on whatever still loads a tired group (never under two) */
export function easeTired(sets: TrainingSet[], log: LoadDay[] | undefined, day: string): TrainingSet[] {
  const tired = tiredGroups(log, day);
  if (!tired.size) return sets;
  return sets.map((set) => {
    if (HIERARCHY_EXEMPT_SETS.has(set.title) || set.track === "skillCheck") return set;
    let hit: Group | undefined;
    const exercises = set.exercises.map((e) => {
      const g = groupsOf(e.name).find((x) => tired.has(x));
      if (!g || e.check || currentSetCount(e.detail) <= 2) return e;
      hit ??= g;
      return { ...e, detail: adjustDetail(e.detail, -1) };
    });
    if (!hit) return set;
    const note = `Lighter today — ${GROUP_LABEL[hit]}: ${tired.get(hit)} hard sets yesterday`;
    return { ...set, exercises, why: set.why ? `${set.why} · ${note}` : note };
  });
}
