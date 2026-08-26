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
