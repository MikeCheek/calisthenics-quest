import type { ExerciseRecord, SessionRecord } from "./types";
import { parseTiming } from "./exerciseTiming";
import { statKey } from "./adaptation";

// ---------------------------------------------------------------------------
// Lifetime counters: how many reps (or how much time held) of each exercise,
// added up from the recorded sessions — "40 muscle-ups in November".
//
// What counts, most precise first:
//   - reps you logged per set, or seconds the timer measured on a hold
//   - a Skill Check's result
//   - otherwise, for an exercise marked done, its prescription: sets × the
//     low end of the rep range ("3 x 8-10 reps" → 24), or × the hold time.
//     "per side" counts both sides. "Max reps" with nothing logged can't be
//     counted honestly, so it isn't.
// Skipped and too-hard exercises count nothing.
// ---------------------------------------------------------------------------

export interface Volume {
  reps: number;
  holdSec: number;
  estimated: boolean; // some of it came from the prescription, not a measurement
}

const NONE: Volume = { reps: 0, holdSec: 0, estimated: false };

export function exerciseVolume(e: Pick<ExerciseRecord, "outcome" | "detail" | "sets" | "checkResult">): Volume {
  if (e.outcome !== "done") return NONE;
  const detail = e.detail ?? "";
  // "3 x 10 per side" is 10 a side; "3 x 20 (10 per side)" is 20 in all
  const sides = /\b(per|each) side\b/i.test(detail) && !/\(\s*\d+\s*(per|each) side\s*\)/i.test(detail) ? 2 : 1;
  const timing = parseTiming(detail);

  // measured: logged reps / timer holds
  const sets = e.sets ?? [];
  const loggedReps = sets.reduce((n, s) => n + (s.reps ?? 0), 0);
  const heldSec = sets.reduce((n, s) => n + (s.holdSec ?? 0), 0);
  if (loggedReps > 0 || heldSec > 0) return { reps: loggedReps, holdSec: Math.round(heldSec), estimated: false };

  // a Skill Check's result (reps, or seconds for a hold)
  if (typeof e.checkResult === "number" && e.checkResult > 0) {
    return timing.isTimed ? { reps: 0, holdSec: Math.round(e.checkResult), estimated: false } : { reps: e.checkResult, holdSec: 0, estimated: false };
  }

  // the prescription
  // "8 min, 1-2 reps per minute": reps, not a hold
  const emom = detail.match(/^(\d+)\s*min\b.*?(\d+)(?:-\d+)?\s*reps?\s+per\s+minute/i);
  if (emom) return { reps: parseInt(emom[1], 10) * parseInt(emom[2], 10), holdSec: 0, estimated: true };
  // "5 x max attempt, accumulate 30-45s": the time to accumulate
  const accumulate = detail.match(/accumulate\s+(\d+)(?:-\d+)?\s*s\b/i);
  if (accumulate) return { reps: 0, holdSec: parseInt(accumulate[1], 10), estimated: true };
  if (timing.isTimed && timing.workSeconds) {
    if (/\bmax\b/i.test(detail) && !/target/i.test(detail)) return NONE; // "max hold": no number to assume
    return { reps: 0, holdSec: timing.sets * timing.workSeconds * sides, estimated: true };
  }
  // "3 x 8-10 reps": the low end of the number after the set count;
  // "3 x max reps" and attempt-based work have no number to assume
  if (!/^\d+(?:-\d+)?\s*x\s*/i.test(detail) || /\b(attempts?|steps|laps)\b/i.test(detail)) return NONE;
  const n = detail.replace(/^\d+(?:-\d+)?\s*x\s*/i, "").match(/^(\d+)/);
  if (!n) return NONE;
  return { reps: timing.sets * parseInt(n[1], 10) * sides, holdSec: 0, estimated: true };
}

export interface ExerciseTotal extends Volume {
  key: string;
  name: string;
  sessions: number; // sessions it was done in
  lastAt: string;
}

// Warm-up drills (wrist circles, cat-cow…) aren't what anyone counts.
const isWarmup = (setTitle: string | undefined) => /^warm-?up$/i.test((setTitle ?? "").trim());

// Totals per exercise for the sessions given, biggest first (reps, then time).
export function totalsByExercise(sessions: Pick<SessionRecord, "finishedAt" | "exercises">[]): ExerciseTotal[] {
  const by = new Map<string, ExerciseTotal & { seen: Set<number> }>();
  sessions.forEach((s, si) => {
    for (const e of s.exercises ?? []) {
      if (isWarmup(e.setTitle)) continue;
      const v = exerciseVolume(e);
      if (!v.reps && !v.holdSec) continue;
      const key = statKey(e.name.replace(/^Skill check:\s*/i, ""));
      const t = by.get(key) ?? { key, name: e.name.replace(/^Skill check:\s*/i, ""), reps: 0, holdSec: 0, estimated: false, sessions: 0, lastAt: "", seen: new Set<number>() };
      t.reps += v.reps;
      t.holdSec += v.holdSec;
      t.estimated ||= v.estimated;
      if (!t.seen.has(si)) {
        t.seen.add(si);
        t.sessions += 1;
      }
      if (s.finishedAt > t.lastAt) {
        t.lastAt = s.finishedAt;
        t.name = e.name.replace(/^Skill check:\s*/i, "");
      }
      by.set(key, t);
    }
  });
  return [...by.values()]
    .map(({ seen: _seen, ...t }) => t)
    .sort((a, b) => b.reps - a.reps || b.holdSec - a.holdSec || a.name.localeCompare(b.name));
}

// "4 min 32 s", "45 s", "2 h 05 min"
export function formatHeld(sec: number): string {
  if (sec < 60) return `${sec} s`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h} h ${String(m).padStart(2, "0")} min`;
  return s ? `${m} min ${s} s` : `${m} min`;
}
