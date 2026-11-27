import type { UserDoc } from "./types";
import { shownStreak } from "./weekStreak";

// ---------------------------------------------------------------------------
// Coming back after a break. A week or more without training: today says
// welcome back, the first session is a gentler restart (about a quarter fewer
// sets, skill checks wait for the next one), and a streak that ended is said
// once, kindly — instead of a badge that silently disappears.
// ---------------------------------------------------------------------------

export const BREAK_DAYS = 7;
export const COMEBACK_FACTOR = 0.75;

export interface Comeback {
  days: number; // days since the last session
  streakEnded?: number; // the weekly streak that ended, if there was one worth saying
}

const DAY = 86_400_000;
const localMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function comeback(u: Pick<UserDoc, "lastSessionDateISO" | "streak"> | null | undefined, now = new Date()): Comeback | null {
  if (!u?.lastSessionDateISO) return null;
  const last = new Date(u.lastSessionDateISO.length === 10 ? `${u.lastSessionDateISO}T12:00:00` : u.lastSessionDateISO);
  if (Number.isNaN(last.getTime())) return null;
  const days = Math.round((localMidnight(now) - localMidnight(last)) / DAY);
  if (days < BREAK_DAYS) return null;
  const ended = (u.streak ?? 0) > 1 && shownStreak(u, now) === 0 ? u.streak : undefined;
  return { days, ...(ended ? { streakEnded: ended } : {}) };
}
