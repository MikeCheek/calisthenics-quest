import type { Exercise, ExerciseStat, SkillProfile, SkillTrack, TrainingEquipment } from "./types";
import { allExercises, aboveYourStage } from "./exerciseHierarchy";
import { exerciseNeeds } from "./equipmentNeeds";
import { statKey } from "./adaptation";

// ---------------------------------------------------------------------------
// Variety: two front lever days a few days apart shouldn't be the same
// session, and a skill day isn't the skill over and over.
//
//  - The skill block keeps its key hold, rotates the other drills (this
//    stage's, plus the stage below for volume) and rotates the set/rep
//    scheme.
//  - A "Strength for …" block builds what the skill needs — straight-arm
//    pulling and the core for the front lever, pushing and wrists for the
//    planche — rotated from a pool.
//  - Accessories rotate too.
//
// What you did least recently comes first; ties break on the date, so even
// without any history two different days differ, while the same day always
// gives the same session.
// ---------------------------------------------------------------------------

export interface History {
  stats?: Record<string, ExerciseStat>;
  records?: Record<string, { hold?: number; reps?: number }>;
}

type Gate = (s: SkillProfile) => boolean;
const pulls = (n: number): Gate => (s) => s.pullUpMaxReps >= n;
const pullsUnder = (n: number): Gate => (s) => s.pullUpMaxReps < n;
const dips = (n: number): Gate => (s) => s.dipMaxReps >= n;
const pushUps = (n: number): Gate => (s) => (s.pushUpMaxReps ?? s.dipMaxReps * 2) >= n;

// What builds each skill, beyond practising the skill itself.
export const SUPPORT: Partial<Record<SkillTrack, [name: string, gate?: Gate][]>> = {
  frontLever: [
    ["Straight-arm pull-downs (band)"],
    ["Front lever pulls", pulls(10)],
    ["Australian / inverted rows", pullsUnder(12)],
    ["Wide-grip rows"],
    ["Pull-ups", pulls(3)],
    ["Weighted pull-ups", pulls(10)],
    ["Scapula pulls (hang)"],
    ["Hollow body rocks"],
    ["Hanging leg raises (straight legs)"],
    ["Tuck dragon flag negatives"],
    ["Skin the cats"],
  ],
  backLever: [
    ["German hang holds"],
    ["Skin the cats"],
    ["Superman holds (full extension)"],
    ["Prone Y-T-W raises"],
    ["Pull-ups", pulls(3)],
    ["Parallel bar dips", dips(3)],
    ["Shoulder dislocates (band or stick)"],
    ["Hollow body holds"],
  ],
  planche: [
    ["Pseudo planche push-ups"],
    ["Planche lean (feet down)"],
    ["Straddle planche leans"],
    ["Parallel bar dips", dips(3)],
    ["Weighted dips", dips(12)],
    ["Ring / bar support hold"],
    ["Diamond push-ups", pushUps(15)],
    ["Decline push-ups", pushUps(10)],
    ["Hollow body holds"],
    ["Wrist prep & flexibility drills"],
  ],
  handstand: [
    ["Pike push-ups"],
    ["Elevated pike push-ups"],
    ["Wall handstand shoulder taps"],
    ["Wall walks"],
    ["Wall HSPU negatives"],
    ["Hollow body holds"],
    ["Shoulder dislocates (band or stick)"],
    ["Wrist prep & flexibility drills"],
  ],
  muscleUp: [
    ["Chest-to-bar pull-ups", pulls(8)],
    ["Explosive pull-ups", pulls(8)],
    ["High pull-ups (chest to bar)", pulls(8)],
    ["Negative pull-ups", pullsUnder(8)],
    ["Pull-ups", pulls(3)],
    ["Straight bar dips", dips(8)],
    ["Parallel bar dips", dips(3)],
    ["False grip hangs"],
    ["Hanging leg raises (straight legs)"],
    ["Archer pull-ups", pulls(8)],
    ["Wide-grip pull-ups", pulls(8)],
    ["Tempo pull-ups (5s up, 3s hold, 5s down)", pulls(6)],
    ["Australian / inverted rows", pullsUnder(10)],
    ["Deep ring/bar dips", dips(10)],
    ["Weighted dips", dips(12)],
    ["Scapula pulls (hang)"],
  ],
  humanFlag: [
    ["Side plank holds"],
    ["Oblique-focused side planks"],
    ["Windshield wipers"],
    ["Copenhagen plank (top leg bent)"],
    ["Pull-ups", pulls(3)],
    ["Pike push-ups"],
    ["Wall handstand holds"],
  ],
  core: [
    ["Hollow body rocks"],
    ["Hanging leg raises (straight legs)"],
    ["Toes-to-bar", pulls(8)],
    ["Pike compression holds"],
    ["Compression holds (knees to chest)"],
    ["Tuck dragon flag negatives"],
    ["Dead bug"],
    ["Windshield wipers"],
    ["Lying leg raises"],
    ["Side plank holds"],
    ["Reverse plank holds"],
    ["Superman holds (full extension)"],
    ["Knee raises (hang or support)"],
    ["Forearm plank holds"],
  ],
  legs: [
    ["Bulgarian split squats"],
    ["Cossack squats"],
    ["Shrimp squat progression"],
    ["Single-leg glute bridges"],
    ["Single-leg RDLs"],
    ["Calf raises"],
    ["Nordic curl negatives (partial ROM)"],
    ["Jump squats"],
    ["Split squats"],
    ["Rear-foot-elevated split squats"],
    ["Glute bridges"],
    ["Hamstring bridges"],
    ["Lateral lunges"],
    ["Bodyweight squats (pause at bottom)"],
  ],
};

let byName: Map<string, Exercise> | null = null;
export function exerciseByName(name: string): Exercise | undefined {
  if (!byName) byName = new Map(allExercises().map((x) => [x.exercise.name, x.exercise]));
  return byName.get(name);
}

const has = (equipment: TrainingEquipment, name: string) => exerciseNeeds(name).every((alts) => alts.some((k) => !!equipment[k]));

// a stable pseudo-random number for a name on a day
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

const DAY = 86_400_000;
const NEW_AGE = 21; // never done counts as three weeks ago: new things come in, but don't crowd out what you like
const LIKED_BONUS = 5; // days
const DISLIKED_PENALTY = 21;

/** how you get on with an exercise, from what you finish and what you skip */
export function preference(s: ExerciseStat | undefined): "liked" | "disliked" | null {
  if (!s) return null;
  // skipped on purpose (not just not reached) at least twice, and more often
  // than done; pain and "too hard" aren't dislike
  const sk = s.sk ?? 0;
  if (sk >= 2 && sk >= s.done) return "disliked";
  if (s.done >= 3 && !sk && s.tooHard * 4 <= s.done) return "liked";
  return null;
}

// The rotation's key: days since it was last done, nudged by how you get on
// with it — an exercise you always finish comes back a few days sooner, one
// you keep skipping waits three weeks longer.
function freshness(stats: History["stats"], name: string, nowMs: number): number {
  const s = stats?.[statKey(name)];
  const at = s?.lastAt ?? (s && s.done > 0 ? s.last : undefined);
  const age = at ? Math.max(0, (nowMs - Date.parse(at)) / DAY) : NEW_AGE;
  const pref = preference(s);
  return age + (pref === "liked" ? LIKED_BONUS : pref === "disliked" ? -DISLIKED_PENALTY : 0);
}

/**
 * the n freshest exercises: least recently done first (nudged by what you
 * like, see `freshness`), ties broken by the day. `seed` starts with the
 * session's day (YYYY-MM-DD), which is also "now" here.
 */
export function freshest(cands: Exercise[], n: number, history: History | undefined, seed: string): Exercise[] {
  const day = Date.parse(seed.slice(0, 10));
  const nowMs = (Number.isFinite(day) ? day : Date.now()) + DAY / 2;
  return [...cands]
    .map((e) => ({ e, f: freshness(history?.stats, e.name, nowMs), r: hash(`${seed}:${e.name}`) }))
    // the same day counts as the same: the hash decides
    .sort((a, b) => Math.round(b.f) - Math.round(a.f) || a.r - b.r)
    .slice(0, n)
    .map((x) => x.e);
}

/** the strength-building pool for a skill, for this athlete and kit */
export function supportPool(focus: SkillTrack, skills: SkillProfile, equipment: TrainingEquipment, taken: Set<string>): Exercise[] {
  const mine = skills as unknown as Record<string, unknown>;
  return (SUPPORT[focus] ?? []).flatMap(([name, gate]) => {
    const e = exerciseByName(name);
    if (!e || taken.has(name) || (gate && !gate(skills)) || !has(equipment, name) || aboveYourStage(name, mine)) return [];
    return [e];
  });
}

// ---- rotating the set/rep scheme ----
// The same exercise doesn't come back with the same prescription every time:
// a key hold alternates between max holds, shorter holds at two thirds of
// your best, and fewer all-out holds with longer rest; rep work between its
// usual scheme, more sets of fewer slower reps, and fewer sets of more.
export function rotateScheme(e: Exercise, turn: number, history: History | undefined): Exercise {
  const k = ((turn % 3) + 3) % 3;
  if (k === 0 || e.check) return e;
  const d = e.detail;
  const hold = d.match(/^(\d+)(?:-\d+)?\s*x\s*max hold\b/i);
  if (hold) {
    const best = history?.records?.[statKey(e.name)]?.hold;
    if (k === 1 && best && best >= 6) return { ...e, detail: `6 x ${Math.max(3, Math.round(best * 0.65))}s`, restSeconds: Math.max(45, Math.round(e.restSeconds * 0.6)), cue: "Shorter holds, more of them — crisp form on every one" };
    if (k === 2) return { ...e, detail: `3 x max hold`, restSeconds: Math.round(e.restSeconds * 1.5), cue: "Fewer, all-out holds — rest fully between them" };
    return e;
  }
  const reps = d.match(/^(\d+)\s*x\s*(\d+)(?:-(\d+))?\s*reps?\b(.*)$/i);
  if (reps) {
    const sets = parseInt(reps[1], 10);
    const lo = parseInt(reps[2], 10);
    const hi = parseInt(reps[3] ?? reps[2], 10);
    const tail = reps[4];
    // slower and fewer only makes sense with reps to spare (not wall walks or 3-rep work)
    const range = (a: number, b: number) => (a === b ? `${a}` : `${a}-${b}`);
    if (k === 1 && lo >= 5 && !/slow|descent|negative|down/i.test(tail)) return { ...e, detail: `${sets + 1} x ${range(lo - 2, hi - 2)} reps, 3s lower`, cue: "Fewer reps, slower lowering — own every inch" };
    if (k === 2 && sets > 2) return { ...e, detail: `${sets - 1} x ${range(lo + 1, hi + 1)} reps${tail}` };
  }
  return e;
}

/** how many times an exercise has been done, to turn its scheme */
export const timesDone = (history: History | undefined, name: string) => history?.stats?.[statKey(name)]?.done ?? 0;
