import type { UserDoc } from "./types";

// ---------------------------------------------------------------------------
// The streak counts WEEKS: a week counts when you trained at least once in
// it (Monday to Sunday, your own time). It goes up with the first session
// of a new week if the week before counted too, stays alive through the
// current week, and is lost once a whole week passes without training.
// ---------------------------------------------------------------------------

export type StreakEvent = "started" | "increased" | "unfrozen" | "restarted" | "none";

const DAY = 86400000;

// Monday 00:00 of the date's week, local time
export function weekOf(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

// whole weeks from a's week to b's week (0 = same week)
export const weeksBetween = (a: Date, b: Date) => Math.round((weekOf(b).getTime() - weekOf(a).getTime()) / (7 * DAY));

// the streak after a session now
export function nextStreak(u: Pick<UserDoc, "streak" | "lastSessionDateISO">, now = new Date()): { streak: number; event: StreakEvent } {
  if (!u.lastSessionDateISO) return { streak: 1, event: "started" };
  const gap = weeksBetween(new Date(u.lastSessionDateISO), now);
  if (gap <= 0) return { streak: Math.max(1, u.streak ?? 0), event: "none" };
  if (gap === 1) return { streak: (u.streak ?? 0) + 1, event: "increased" };
  return { streak: 1, event: "restarted" };
}

// the streak to show: the stored one only changes when you train, so after a
// week without training it's shown as lost (0)
export function shownStreak(u: Pick<UserDoc, "streak" | "lastSessionDateISO"> | null | undefined, now = new Date()): number {
  if (!u?.lastSessionDateISO || !u.streak) return 0;
  return weeksBetween(new Date(u.lastSessionDateISO), now) <= 1 ? u.streak : 0;
}

// trained already this week?
export const trainedThisWeek = (u: Pick<UserDoc, "lastSessionDateISO"> | null | undefined, now = new Date()) =>
  !!u?.lastSessionDateISO && weeksBetween(new Date(u.lastSessionDateISO), now) === 0;

// from a history of session dates: consecutive weeks with a session, ending
// this week (or last week, if this one has none yet)
export function streakFromSessions(dates: string[], now = new Date()): number {
  const weeks = new Set(dates.map((d) => weekOf(new Date(d)).getTime()));
  let w = weekOf(now).getTime();
  if (!weeks.has(w)) w -= 7 * DAY;
  let n = 0;
  while (weeks.has(w)) {
    n++;
    w = weekOf(new Date(w - 3 * DAY)).getTime(); // the Monday before (DST-safe)
  }
  return n;
}
