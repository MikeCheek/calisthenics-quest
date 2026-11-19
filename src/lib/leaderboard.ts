import { WeekStats } from "./types";
import { currentWeekKey } from "./missions";

// ---------------------------------------------------------------------------
// Friends leaderboard + a weekly challenge that rotates by ISO week, so the
// crew has one shared thing to chase each week. Stats come from each
// friend's public profile (written by their own client when they log a
// session); stale weeks count as zero.
// ---------------------------------------------------------------------------

export type Metric = "sessions" | "minutes" | "verified" | "xp";

export const METRIC_LABEL: Record<Metric, string> = {
  sessions: "Sessions",
  minutes: "Minutes",
  verified: "Skills proven",
  xp: "XP",
};

const CHALLENGES: { metric: Metric; title: string; blurb: string }[] = [
  { metric: "sessions", title: "Show-up week", blurb: "Most sessions logged this week wins." },
  { metric: "minutes", title: "Time under the bar", blurb: "Most minutes trained this week wins." },
  { metric: "verified", title: "Prove it", blurb: "Most skills verified in training this week wins." },
  { metric: "xp", title: "XP race", blurb: "Most XP earned this week wins." },
];

export function weekNumber(weekKey: string): number {
  const m = weekKey.match(/W(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function weeklyChallenge(weekKey: string = currentWeekKey()) {
  return CHALLENGES[weekNumber(weekKey) % CHALLENGES.length];
}

export const EMPTY_WEEK = (key: string): WeekStats => ({ key, sessions: 0, minutes: 0, verified: 0, xp: 0 });

// Adds one logged session to this week's running totals (resetting when a
// new week starts).
export function addToWeek(
  prev: WeekStats | undefined,
  add: { minutes?: number; verified?: number; xp?: number },
  weekKey: string = currentWeekKey()
): WeekStats {
  const base = prev && prev.key === weekKey ? prev : EMPTY_WEEK(weekKey);
  return {
    key: weekKey,
    sessions: base.sessions + 1,
    minutes: base.minutes + Math.max(0, Math.round(add.minutes ?? 0)),
    verified: base.verified + Math.max(0, add.verified ?? 0),
    xp: base.xp + Math.max(0, Math.round(add.xp ?? 0)),
  };
}

export interface BoardEntry {
  uid: string;
  name: string;
  photoURL?: string;
  isMe: boolean;
  week?: WeekStats;
}

export interface RankedEntry extends BoardEntry {
  value: number;
  rank: number; // ties share a rank
}

export function rankBoard(entries: BoardEntry[], metric: Metric, weekKey: string = currentWeekKey()): RankedEntry[] {
  const withValues = entries.map((e) => ({ ...e, value: e.week && e.week.key === weekKey ? e.week[metric] : 0 }));
  withValues.sort((a, b) => b.value - a.value || Number(b.isMe) - Number(a.isMe) || a.name.localeCompare(b.name));
  let lastValue = Infinity;
  let lastRank = 0;
  return withValues.map((e, i) => {
    const rank = e.value === lastValue ? lastRank : i + 1;
    lastValue = e.value;
    lastRank = rank;
    return { ...e, rank };
  });
}

// ---- global board (everyone who opted in) ----
// Entries live in leaderboard/{weekKey}/entries/{uid} (see store.ts).
export const GLOBAL_BOARD_SIZE = 50;

// Totals are self-reported by each player's device, so numbers no real week
// could produce are left off the public board. The Firestore rules enforce
// the same limits on write (README → security rules); keep them in step.
export const BOARD_LIMITS = { sessions: 21, minutes: 1800, verified: 30, xp: 20000 } as const;
export function plausibleWeek(w: Pick<WeekStats, "sessions" | "minutes" | "verified" | "xp">): boolean {
  const ok = (n: unknown, max: number) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= max;
  return (
    ok(w.sessions, BOARD_LIMITS.sessions) && ok(w.minutes, BOARD_LIMITS.minutes) && ok(w.verified, BOARD_LIMITS.verified) && ok(w.xp, BOARD_LIMITS.xp)
  );
}

// Strangers see first name + last initial ("Michele P."), not the full name.
export function boardName(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Athlete";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}
