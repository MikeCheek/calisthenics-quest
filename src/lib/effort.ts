import type { Exercise, TrainingSession } from "./types";
import { parseTiming } from "./exerciseTiming";
import { exerciseRung, exerciseStage, HIERARCHY_EXEMPT_SETS } from "./exerciseHierarchy";
import { levelForSkillStage } from "./levelPath";
import { tuning } from "./tuning";

// ---------------------------------------------------------------------------
// Effort points: how much work an exercise is, so a session knows how far
// through it you really are — not just how many exercises you've passed.
//
//   effort = sets × difficulty (1–5) × load per set (0.5–1.5)
//
// Difficulty: a skill exercise's stage on the trophy road (so a tuck
// planche outweighs a tuck front lever, like on the road), else its rung on
// its strength ladder; warm-ups 0.5, finishers 1.5. Load: 1 for a normal
// set, more for clearly bigger ones (12+ reps, 30+ s) and both sides.
//
// Used to weigh "too hard" and skips by how tired you probably were, to
// size "I'm tired" to what's left, and to keep sessions within the effort
// you've had energy for lately.
// ---------------------------------------------------------------------------

const WARMUP = "Warm-Up";
const FINISHER = "Final Hits";

export function exerciseDifficulty(name: string, setTitle: string): number {
  if (setTitle === WARMUP) return 0.5;
  if (setTitle === FINISHER) return 1.5;
  const stage = exerciseStage(name);
  if (stage) return +(1 + (4 * Math.min(80, levelForSkillStage(stage.skill, stage.stage))) / 80).toFixed(2);
  const rung = exerciseRung(name);
  if (rung) return +(1 + (3 * rung.index) / Math.max(1, rung.length - 1)).toFixed(2);
  return 2.5;
}

export function setLoad(detail: string): number {
  // Hard exercises are prescribed in low reps and short holds precisely
  // because they're hard, so a small set is still a full effort: load only
  // grows for clearly bigger sets (and for both sides).
  const sides = /\b(per|each) side\b/i.test(detail) ? 1.3 : 1;
  const t = parseTiming(detail);
  let base = 1;
  if (t.isTimed && t.workSeconds) base = t.workSeconds >= 45 ? 1.4 : t.workSeconds >= 30 ? 1.2 : 1;
  else {
    const reps = detail.replace(/^\d+(?:-\d+)?\s*x\s*/i, "").match(/^(\d+)/);
    if (reps) base = parseInt(reps[1], 10) >= 20 ? 1.4 : parseInt(reps[1], 10) >= 12 ? 1.2 : 1;
  }
  return +Math.min(1.5, base * sides).toFixed(2);
}

export function exerciseEffort(ex: Pick<Exercise, "name" | "detail">, setTitle: string, setsDone?: number): number {
  const sets = setsDone ?? parseTiming(ex.detail).sets;
  return +(sets * exerciseDifficulty(ex.name, setTitle) * setLoad(ex.detail)).toFixed(1);
}

export interface Step {
  setTitle: string;
  exercise: Pick<Exercise, "name" | "detail">;
}

export function stepsOf(session: TrainingSession): Step[] {
  return session.sets.flatMap((s) => s.exercises.map((exercise) => ({ setTitle: s.title, exercise })));
}

export function totalEffort(steps: Step[]): number {
  return +steps.reduce((n, s) => n + exerciseEffort(s.exercise, s.setTitle), 0).toFixed(1);
}

// How far through the session's effort you are (0–1).
export function fatigueOf(done: number, total: number): number {
  return total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;
}

// How much a "too hard" or a skip says about the exercise itself: full
// weight while you're fresh, about a third near the end of a session,
// where it's mostly tiredness talking.
export function feedbackWeight(fatigue: number | undefined): number {
  if (fatigue === undefined) return 1;
  const { fatigueFullUntil: from, fatigueFloorFrom: to, fatigueFloor: floor } = tuning();
  if (fatigue <= from) return 1;
  if (fatigue >= to) return floor;
  return +(1 - ((fatigue - from) / (to - from)) * (1 - floor)).toFixed(2);
}

// ---- "I'm tired": cut what's left, more the earlier you are ----
export interface EaseUpChange {
  index: number; // into the remaining steps' original positions
  exercise: Exercise;
  kind: "easier" | "fewerSets";
}

export function easeUpTarget(fatigue: number): number {
  const t = tuning();
  return fatigue < 0.35 ? t.easeUpEarly : fatigue < 0.7 ? t.easeUpMid : t.easeUpLate;
}

const dropSet = (ex: Exercise, minSets: number): Exercise | null => {
  const m = ex.detail.match(/^(\d+)((?:-\d+)?\s*x.*)$/i);
  if (!m || parseInt(m[1], 10) <= minSets) return null;
  return { ...ex, detail: `${parseInt(m[1], 10) - 1}${m[2]}` };
};

// Plans the cut for the steps from `from` on. Late in a session it only
// drops sets (keeping the skill work as it is); earlier it swaps in easier
// rungs first, then drops sets. Warm-ups are left alone.
export function planEaseUp(
  steps: { setTitle: string; exercise: Exercise }[],
  from: number,
  fatigue: number,
  findEasier: (name: string) => Exercise | null
): { changes: EaseUpChange[]; cut: number; target: number; before: number } {
  const remaining = steps.slice(from).map((s, i) => ({ ...s, index: from + i }));
  const before = remaining.reduce((n, s) => n + exerciseEffort(s.exercise, s.setTitle), 0);
  const target = easeUpTarget(fatigue) * before;
  const current = new Map(remaining.map((s) => [s.index, s.exercise]));
  const kinds = new Map<number, EaseUpChange["kind"]>();
  const effortNow = () => remaining.reduce((n, s) => n + exerciseEffort(current.get(s.index)!, s.setTitle), 0);
  // everything but the warm-up and the Skill Check (it proves a claim, so it
  // stays as prescribed); finishers can lose sets, not be swapped
  const eligible = remaining.filter(
    (s) => !s.exercise.check && (s.setTitle === FINISHER || (s.setTitle !== WARMUP && !HIERARCHY_EXEMPT_SETS.has(s.setTitle)))
  );
  // never below 2 sets, except near the end where one more set is all that's left
  const minSets = fatigue >= 0.7 ? 1 : 2;

  const passes: ("easier" | "fewerSets")[] = fatigue >= 0.7 ? ["fewerSets", "fewerSets"] : ["easier", "fewerSets", "fewerSets"];
  for (const kind of passes) {
    // heaviest first, so the fewest changes reach the target
    const order = [...eligible].sort((a, b) => exerciseEffort(current.get(b.index)!, b.setTitle) - exerciseEffort(current.get(a.index)!, a.setTitle));
    for (const s of order) {
      if (before - effortNow() >= target) break;
      const ex = current.get(s.index)!;
      if (kind === "easier") {
        if (s.setTitle === FINISHER) continue;
        const found = findEasier(ex.name);
        if (!found) continue;
        // the easier rung at no more sets than the exercise it replaces —
        // and only if that really is less work
        const sets = parseTiming(ex.detail).sets;
        const own = found.detail.match(/^(\d+)((?:-\d+)?\s*x.*)$/i);
        const detail = own && parseInt(own[1], 10) > sets ? `${sets}${own[2]}` : found.detail;
        const easier: Exercise = { ...found, detail, adaptedFrom: ex.adaptedFrom ?? ex.name, adaptDir: "easier", adaptNote: undefined };
        if (exerciseEffort(easier, s.setTitle) >= exerciseEffort(ex, s.setTitle)) continue;
        current.set(s.index, easier);
        kinds.set(s.index, kinds.get(s.index) === "fewerSets" ? "fewerSets" : "easier");
      } else {
        const fewer = dropSet(ex, minSets);
        if (!fewer) continue;
        current.set(s.index, fewer);
        if (!kinds.has(s.index)) kinds.set(s.index, "fewerSets");
      }
    }
  }
  const changes = remaining
    .filter((s) => current.get(s.index) !== s.exercise)
    .map((s) => ({ index: s.index, exercise: current.get(s.index)!, kind: kinds.get(s.index) ?? "fewerSets" }));
  return { changes, cut: +(before - effortNow()).toFixed(1), target: +target.toFixed(1), before: +before.toFixed(1) };
}

// ---- balanced sessions: within the effort you've had energy for ----
export interface EffortSample {
  at: string;
  planned: number;
  done: number;
  tired: boolean; // pressed "I'm tired" (done = effort at that moment)
}

export const EFFORT_HISTORY = 8;

// The effort you've run out of energy at recently — only once it's
// happened in at least 2 of the last 6 sessions, so one bad day doesn't
// shrink every session after it.
export function effortCapacity(history: EffortSample[] | undefined): number | null {
  const recent = (history ?? []).slice(-6);
  const tired = recent.filter((s) => s.tired && s.done > 0).map((s) => s.done).sort((a, b) => a - b);
  if (tired.length < tuning().tiredSessionsNeeded) return null;
  const mid = Math.floor(tired.length / 2);
  const median = tired.length % 2 ? tired[mid] : (tired[mid - 1] + tired[mid]) / 2;
  // full sessions done since then show there's more in the tank
  const fullDone = recent.filter((s) => !s.tired).map((s) => s.done);
  return +Math.max(median, ...fullDone, 0).toFixed(1);
}

// Trims accessory sets (then main-focus ones, never below 2 sets) until the
// session fits within the capacity plus some headroom. Never touches the
// warm-up, the Skill Check or the skill work's first exercise.
export function balanceSession(session: TrainingSession, capacity: number | null): { session: TrainingSession; trimmed: number } {
  if (!capacity) return { session, trimmed: 0 };
  const limit = capacity * tuning().balanceHeadroom;
  const planned = totalEffort(stepsOf(session));
  if (planned <= limit) return { session, trimmed: 0 };
  const sets = session.sets.map((s) => ({ ...s, exercises: [...s.exercises] }));
  const order = sets
    // the bonus skill block goes first, then the finisher, then accessories
    .map((s, si) => ({ s, si, rank: s.track === "warmup" || s.track === "skillCheck" ? -1 : s.title.startsWith("Bonus") ? 0 : s.track === "finisher" ? 0.5 : s.title.startsWith("Accessory") ? 1 : s.title.startsWith("Strength for") ? 1.5 : 2 }))
    .filter((x) => x.rank >= 0)
    .sort((a, b) => a.rank - b.rank);
  const effortNow = () => totalEffort(sets.flatMap((s) => s.exercises.map((exercise) => ({ setTitle: s.title, exercise }))));
  for (let round = 0; round < 3 && effortNow() > limit; round++) {
    for (const { s, rank } of order) {
      for (let i = s.exercises.length - 1; i >= 0 && effortNow() > limit; i--) {
        if (rank === 2 && i === 0) continue; // keep the main skill's first exercise whole
        const m = s.exercises[i].detail.match(/^(\d+)((?:-\d+)?\s*x.*)$/i);
        if (!m || parseInt(m[1], 10) <= 2) continue;
        s.exercises[i] = { ...s.exercises[i], detail: `${parseInt(m[1], 10) - 1}${m[2]}` };
      }
    }
  }
  // still too much with every set trimmed: drop whole exercises — the bonus
  // block, then accessories from the end (keeping one), then the finisher
  if (effortNow() > limit) {
    const bonus = sets.findIndex((s) => s.title.startsWith("Bonus"));
    if (bonus >= 0) sets.splice(bonus, 1);
    // accessories give way before the work that builds the skill
    for (const s of [...sets.filter((x) => x.title.startsWith("Accessory")), ...sets.filter((x) => x.title.startsWith("Strength for"))]) {
      while (s.exercises.length > 1 && effortNow() > limit) s.exercises.pop();
    }
    const fin = sets.findIndex((s) => s.track === "finisher");
    if (fin >= 0 && effortNow() > limit) sets.splice(fin, 1);
  }
  const after = effortNow();
  return { session: { ...session, sets }, trimmed: Math.round((1 - after / planned) * 100) };
}
