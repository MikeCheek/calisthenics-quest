import type { Exercise, ExerciseBest, ExerciseFeedback, ExerciseStat, TrainingEquipment } from "./types";
import { HIERARCHY_EXEMPT_SETS } from "./exerciseHierarchy";
import { statKey } from "./adaptation";
import { parseTarget } from "./progression";

// ---------------------------------------------------------------------------
// Breaking a plateau.
//
// An exercise you keep training whose best (hold or reps) hasn't moved in
// three weeks gets a different stimulus for two weeks, then goes back:
//
//  - holds: band-assisted longer holds when you have a band, or more,
//    shorter holds with short rests
//  - reps: weighted sets when you have weights, or slow negatives
//
// The switch is decided when a session is logged (it needs the records) and
// stored on the exercise's stat (`pl`, when it started); generation reads it.
// ---------------------------------------------------------------------------

export const PLATEAU_DAYS = 21; // no new best for this long…
export const PLATEAU_SESSIONS = 5; // …across at least this many sessions of it
export const SWITCH_DAYS = 14;
const DAY = 86_400_000;

const days = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / DAY;

/** an exercise in its plateau-breaking fortnight */
export const inSwitch = (s: ExerciseStat | undefined, nowISO: string) => !!s?.pl && days(s.pl, nowISO) < SWITCH_DAYS;

/**
 * after a session: counts sessions since each exercise's last best, and
 * starts a switch when it's stuck (mutates nothing, returns new stats)
 */
export function trackPlateaus(
  stats: Record<string, ExerciseStat>,
  records: Record<string, ExerciseBest>,
  feedback: ExerciseFeedback[],
  improved: Set<string>,
  nowISO: string
): Record<string, ExerciseStat> {
  const next = { ...stats };
  for (const fb of feedback) {
    if (fb.outcome !== "done" || fb.check || HIERARCHY_EXEMPT_SETS.has(fb.setTitle) || fb.adaptedFrom) continue;
    const k = statKey(fb.name);
    const s = next[k];
    if (!s) continue;
    const t: ExerciseStat = { ...s };
    if (improved.has(k)) {
      t.sb = 0;
      delete t.pl; // a new best: whatever was stuck isn't any more
    } else t.sb = (t.sb ?? 0) + 1;
    const best = records[k];
    const stuck = best?.dateISO && days(best.dateISO, nowISO) >= PLATEAU_DAYS && (t.sb ?? 0) >= PLATEAU_SESSIONS;
    // a fresh switch only after the last one has had time to work and come back
    const rested = !t.pl || days(t.pl, nowISO) >= SWITCH_DAYS + PLATEAU_DAYS;
    if (stuck && rested) {
      t.pl = nowISO;
      t.sb = 0;
    }
    next[k] = t;
  }
  return next;
}

const isHold = (detail: string) => /max hold|\d\s*s\b/i.test(detail) && !/reps?\b/i.test(detail);

/** the other stimulus, for an exercise in its switch fortnight */
export function plateauVariant(ex: Exercise, equipment: TrainingEquipment, best: { hold?: number } | undefined): Exercise | null {
  const sets = parseInt(ex.detail.match(/^(\d+)/)?.[1] ?? "3", 10);
  const t = parseTarget(ex.detail);
  if (isHold(ex.detail)) {
    const ref = best?.hold ?? (t?.unit === "s" ? t.hi : undefined);
    if (!ref || ref < 4) return null;
    if (equipment.resistanceBands)
      return { ...ex, detail: `${sets} x ${Math.round(ref * 1.3)}s with a band`, restSeconds: ex.restSeconds, adaptNote: "No new best in three weeks — band-assisted longer holds for two weeks", cue: "A band takes some weight: hold longer, perfect shape" };
    return { ...ex, detail: `8 x ${Math.max(3, Math.round(ref * 0.5))}s`, restSeconds: Math.max(30, Math.round(ex.restSeconds * 0.4)), adaptNote: "No new best in three weeks — more, shorter holds for two weeks", cue: "Short holds, short rests — lots of quality time in the position" };
  }
  if (t?.unit === "reps") {
    if (/lower|negative|descent|tempo/i.test(ex.detail)) return null;
    if (equipment.weights && t.lo >= 5)
      return { ...ex, detail: `${sets} x ${Math.max(3, t.lo - 3)}-${Math.max(4, t.hi - 3)} reps, weighted`, restSeconds: Math.max(ex.restSeconds, 120), adaptNote: "No new best in three weeks — weighted sets for two weeks", cue: "Add a little weight: fewer, heavier reps" };
    return { ...ex, detail: `${sets} x ${Math.max(2, Math.round(t.lo / 2))}-${Math.max(3, Math.round(t.hi / 2))} reps, 5s lower`, adaptNote: "No new best in three weeks — slow negatives for two weeks", cue: "Lower for a slow five seconds — strength from the way down" };
  }
  return null;
}
