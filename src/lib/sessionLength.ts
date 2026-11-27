import type { ExerciseFeedback, TrainingSession } from "./types";
import type { SportId } from "./sports/types";
import { HIERARCHY_EXEMPT_SETS } from "./exerciseHierarchy";

// ---------------------------------------------------------------------------
// Planning around the session you actually get through.
//
// If 60-minute sessions usually end two thirds of the way in, the next ones
// are planned for about 40 minutes — key work first (sessionFit.ts trims the
// rest) — instead of a session that keeps getting cut short.
//
// Each finished session leaves one sample: the minutes it was planned for and
// how much of it was done. "Worked" minutes (planned × done) don't drift: a
// 40-minute plan done in full says 40, the same as two thirds of 60. Only a
// shorter plan is ever suggested — never longer than the length you chose —
// and you can always ask for the full length today.
// ---------------------------------------------------------------------------

export interface LengthSample {
  at: string;
  planned: number; // estimated minutes of the session as shown
  done: number; // share of its exercises done (0–1)
  sport?: SportId; // calisthenics unless stated
}

export const LENGTH_HISTORY = 8;
const RECENT = 6;
const MIN_SAMPLES = 3;
const SHORTER_BELOW = 0.85; // of your chosen length
const MIN_MINUTES = 20;

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** the share of a session's own work that was done (warm-up, cool-down and checks aside) */
export function doneShare(session: TrainingSession, feedback: ExerciseFeedback[]): number | undefined {
  const total = session.sets.filter((s) => !HIERARCHY_EXEMPT_SETS.has(s.title)).reduce((n, s) => n + s.exercises.filter((e) => !e.check).length, 0);
  if (!total) return undefined;
  const done = new Set(feedback.filter((f) => f.outcome === "done" && !f.check && !HIERARCHY_EXEMPT_SETS.has(f.setTitle)).map((f) => `${f.setTitle}|${f.name}`)).size;
  return Math.min(1, done / total);
}

export function lengthSample(session: TrainingSession, feedback: ExerciseFeedback[], plannedMinutes: number, at = new Date().toISOString()): LengthSample | null {
  const done = doneShare(session, feedback);
  if (done === undefined || plannedMinutes < 10) return null;
  return { at, planned: Math.round(plannedMinutes), done: +done.toFixed(2), ...(session.sport && session.sport !== "calisthenics" ? { sport: session.sport } : {}) };
}

export interface HabitualLength {
  minutes: number; // what to plan for
  chosen: number; // the length you set
  shorter: boolean;
}

/** the length to plan today's session for, from how much of recent sessions you got through */
export function habitualMinutes(chosen: number | undefined, history: LengthSample[] | undefined, sport: SportId = "calisthenics"): HabitualLength | null {
  if (!chosen) return null;
  const mine = (history ?? []).filter((s) => (s.sport ?? "calisthenics") === sport).slice(-RECENT);
  if (mine.length < MIN_SAMPLES) return { minutes: chosen, chosen, shorter: false };
  const usual = median(mine.map((s) => s.planned * s.done));
  if (usual >= chosen * SHORTER_BELOW) return { minutes: chosen, chosen, shorter: false };
  const minutes = Math.max(MIN_MINUTES, Math.round(usual / 5) * 5);
  return minutes < chosen ? { minutes, chosen, shorter: true } : { minutes: chosen, chosen, shorter: false };
}
