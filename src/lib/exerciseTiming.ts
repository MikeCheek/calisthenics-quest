import { Exercise, TrainingSession } from "./types";

export interface ExerciseTiming {
  sets: number;
  workSeconds: number | null; // null = self-paced (rep based), not a countdown
  isTimed: boolean;
}

// Exercise `detail` strings follow a handful of consistent shapes across the
// app's data ("4 x max hold (target 8-12s)", "3 x 10-12 reps", "8 min, 1-2
// reps per minute", "4 x 15-20s"). This pulls out a set count and, when the
// exercise is a timed hold, a target number of seconds to count down.
export function parseTiming(detail: string): ExerciseTiming {
  const setsMatch = detail.match(/^(\d+)(?:-\d+)?\s*x/i);
  const sets = setsMatch ? parseInt(setsMatch[1], 10) : 1;

  const minMatch = detail.match(/(\d+)\s*min\b/i);
  if (minMatch) {
    return { sets: 1, workSeconds: parseInt(minMatch[1], 10) * 60, isTimed: true };
  }

  const secMatch = detail.match(/(\d+)(?:-(\d+))?\s*s\b/i);
  if (secMatch) {
    const a = parseInt(secMatch[1], 10);
    const b = secMatch[2] ? parseInt(secMatch[2], 10) : a;
    return { sets: sets || 1, workSeconds: Math.round((a + b) / 2), isTimed: true };
  }

  if (/hold/i.test(detail)) {
    // a hold with no explicit target seconds in the text — reasonable default
    return { sets: sets || 1, workSeconds: 20, isTimed: true };
  }

  return { sets: sets || 1, workSeconds: null, isTimed: false };
}

// Bumps the leading "N x" set count in a detail string by `delta`, clamped
// to a sane range. Used for the per-exercise easier/harder buttons — a
// local, in-session adjustment, not a change to the underlying progression.
export function adjustDetail(detail: string, delta: number): string {
  const match = detail.match(/^(\d+)((?:-\d+)?\s*x.*)$/i);
  if (!match) return detail;
  const current = parseInt(match[1], 10);
  const next = Math.min(10, Math.max(1, current + delta));
  return `${next}${match[2]}`;
}

export function currentSetCount(detail: string): number {
  const match = detail.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

// Shared with the guided full-screen mode's own between-exercise rest, so
// the estimate below and what actually happens during training can't drift
// apart — a floor so a warm-up drill's short set-rest doesn't produce an
// unrealistically brief transition, a ceiling so a heavy hold's long rest
// doesn't balloon the total.
export const MIN_BETWEEN_EXERCISE_REST = 20;
export const MAX_BETWEEN_EXERCISE_REST = 90;

const AVG_SECONDS_PER_REP = 3.5; // a controlled calisthenics rep, not a fast gym rep

function estimateExerciseSeconds(ex: Exercise): number {
  const timing = parseTiming(ex.detail);
  if (timing.isTimed && timing.workSeconds !== null) {
    return timing.sets * timing.workSeconds + Math.max(0, timing.sets - 1) * ex.restSeconds;
  }
  // Rep-based sets are self-paced, so there's no countdown to sum — instead,
  // estimate from whatever rep count the detail text actually mentions (a
  // range like "8-10 reps" averages to 9; if nothing parses, fall back to a
  // reasonable default rather than treating it as instant).
  const repMatch = ex.detail.match(/(\d+)(?:-(\d+))?\s*reps?/i);
  let avgReps = 8;
  if (repMatch) {
    const lo = parseInt(repMatch[1], 10);
    const hi = repMatch[2] ? parseInt(repMatch[2], 10) : lo;
    avgReps = (lo + hi) / 2;
  }
  const workPerSet = avgReps * AVG_SECONDS_PER_REP;
  return timing.sets * workPerSet + Math.max(0, timing.sets - 1) * ex.restSeconds;
}

// A rough total length in minutes for an ordered list of exercises — the
// shared core both `estimateSessionMinutes` below and the guided mode's
// "time remaining" readout are built on.
export function estimateExercisesMinutes(exercises: Exercise[]): number {
  if (exercises.length === 0) return 0;
  let totalSeconds = 0;
  exercises.forEach((ex, i) => {
    totalSeconds += estimateExerciseSeconds(ex);
    if (i < exercises.length - 1) {
      totalSeconds += Math.min(
        MAX_BETWEEN_EXERCISE_REST,
        Math.max(MIN_BETWEEN_EXERCISE_REST, ex.restSeconds || MIN_BETWEEN_EXERCISE_REST)
      );
    }
  });
  return Math.max(1, Math.round(totalSeconds / 60));
}

// A rough total session length in minutes, so an athlete can gauge how
// long a session will actually take before starting it. This mirrors
// exactly what the guided full-screen mode does: each exercise's own work
// + set-to-set rest (from the same `parseTiming` every per-exercise timer
// uses), plus a between-exercise rest clamped the same way
// `FocusTrainingMode` clamps its own transition rest — same source of
// truth, so the estimate and the actual guided flow can't disagree.
export function estimateSessionMinutes(session: TrainingSession): number {
  return estimateExercisesMinutes(session.sets.flatMap((s) => s.exercises));
}
