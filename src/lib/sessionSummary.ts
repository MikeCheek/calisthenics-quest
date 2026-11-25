import type { Celebration } from "./sessionComplete";

// The level-up / streak / XP line at the top of the post-session report.
// Returns English templates plus their values, for the phrase translator.
export interface SummaryLine {
  text: string;
  vars?: Record<string, string | number>;
}

function streakLine(c: Celebration): SummaryLine | null {
  switch (c.streakEvent) {
    case "started":
      return { text: "Streak started!" };
    case "increased":
      return { text: "Streak up — {n} weeks in a row", vars: { n: c.newStreak } };
    case "unfrozen":
      return { text: "Streak unfrozen — {n} days, rest days don't break it", vars: { n: c.newStreak } };
    case "restarted":
      return { text: "Fresh start — a new streak begins this week" };
    default:
      return null;
  }
}

// Level-up leads when there is one, with the streak underneath; otherwise
// the streak is the headline.
export function summaryLines(c: Celebration, xpGained: number): { headline: SummaryLine; detail: SummaryLine | null; xp: SummaryLine } {
  const streak = streakLine(c);
  const xp = { text: "+{n} XP", vars: { n: xpGained } };
  if (c.leveledUp) return { headline: { text: "Level {n}!", vars: { n: c.newLevel } }, detail: streak, xp };
  return { headline: streak ?? { text: "Session complete" }, detail: null, xp };
}
