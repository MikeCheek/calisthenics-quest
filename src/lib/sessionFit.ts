import { TrainingSession, TrainingSet } from "./types";
import { adjustDetail, estimateSessionMinutes, currentSetCount } from "./exerciseTiming";

// ---------------------------------------------------------------------------
// Fitting a generated session to the athlete's chosen session length.
//
// Generation decides *what* to train; this decides *how much* fits. It runs
// last (after adaptation and the Skill Check are added), so the estimate
// reflects what will actually be on screen. Trimming goes from least to
// most important; extending only adds sets to the main skill work. The
// Skill Check is never touched — it's the point of the session for
// verification, and it's short.
// ---------------------------------------------------------------------------

const OVER = 1.1; // allowed overshoot before trimming
const UNDER = 0.85; // allowed undershoot before extending
const MIN_MAIN_EXERCISES = 2;
const MIN_WARMUP_EXERCISES = 2;
const MIN_SETS = 2;
const MAX_EXTRA_SETS = 3;
const XP_PER_EXERCISE = 8; // mirrors trainingGenerator's estXp formula

type Kind = TrainingSet["track"];
const isMain = (s: TrainingSet) => s.title.startsWith("Main Focus");
const isAccessory = (s: TrainingSet) => s.title.startsWith("Accessory");
const kindIs = (s: TrainingSet, k: Kind) => s.track === k;

export interface FitResult {
  session: TrainingSession;
  changed: boolean;
  minutesBefore: number;
  minutesAfter: number;
}

export function fitSessionToMinutes(session: TrainingSession, targetMinutes: number | undefined): FitResult {
  const before = estimateSessionMinutes(session);
  if (!targetMinutes || targetMinutes <= 0) return { session, changed: false, minutesBefore: before, minutesAfter: before };

  let sets: TrainingSet[] = session.sets.map((s) => ({ ...s, exercises: [...s.exercises] }));
  let removed = 0;
  const est = () => estimateSessionMinutes({ ...session, sets });
  const fits = () => est() <= targetMinutes * OVER;

  const dropSet = (pred: (s: TrainingSet) => boolean) => {
    const i = sets.findIndex(pred);
    if (i === -1) return false;
    removed += sets[i].exercises.length;
    sets = sets.filter((_, j) => j !== i);
    return true;
  };
  const trimTo = (pred: (s: TrainingSet) => boolean, keep: number) => {
    const set = sets.find(pred);
    if (!set) return false;
    let changed = false;
    while (set.exercises.length > keep && !fits()) {
      set.exercises.pop();
      removed++;
      changed = true;
    }
    return changed;
  };

  // ---- trim, least important first ----
  const trims: (() => unknown)[] = [
    () => dropSet((s) => kindIs(s, "bonusSkill")),
    () => dropSet((s) => kindIs(s, "finisher")),
    () => trimTo(isAccessory, 1),
    () => dropSet(isAccessory),
    () => trimTo((s) => kindIs(s, "warmup"), MIN_WARMUP_EXERCISES),
    () => trimTo(isMain, MIN_MAIN_EXERCISES),
  ];
  for (const step of trims) {
    if (fits()) break;
    step();
  }
  // still too long: shave sets off the main work, one round at a time
  let guard = 0;
  while (!fits() && guard++ < 10) {
    let shaved = false;
    for (const set of sets.filter(isMain)) {
      set.exercises = set.exercises.map((ex) => {
        if (fits() || currentSetCount(ex.detail) <= MIN_SETS) return ex;
        shaved = true;
        return { ...ex, detail: adjustDetail(ex.detail, -1) };
      });
    }
    if (!shaved) break;
  }

  // ---- extend: more sets on the main skill work first, then accessory
  // and bonus work (never warm-up, finisher or the Skill Check) ----
  const extra = new Map<string, number>();
  const extendable = [...sets.filter(isMain), ...sets.filter((s) => isAccessory(s) || kindIs(s, "bonusSkill"))];
  guard = 0;
  while (est() < targetMinutes * UNDER && guard++ < 10) {
    let added = false;
    for (const set of extendable) {
      set.exercises = set.exercises.map((ex) => {
        if (est() >= targetMinutes * UNDER) return ex;
        const n = extra.get(ex.name) ?? 0;
        if (n >= MAX_EXTRA_SETS) return ex;
        const next = adjustDetail(ex.detail, 1);
        if (next === ex.detail) return ex; // not a "N x ..." detail
        extra.set(ex.name, n + 1);
        added = true;
        return { ...ex, detail: next };
      });
    }
    if (!added) break;
  }

  const after = est();
  const changed = after !== before || removed > 0;
  return {
    session: changed
      ? { ...session, sets, estXp: Math.max(10, session.estXp - removed * XP_PER_EXERCISE) }
      : session,
    changed,
    minutesBefore: before,
    minutesAfter: after,
  };
}
