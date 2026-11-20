import type { SessionRecord } from "./types";
import { totalsByExercise } from "./volumeTotals";

// ---------------------------------------------------------------------------
// Monthly community events: one theme a month ("Push-up December"), a goal
// everyone works toward together, and a goal of your own.
//
// Each player's part is worked out from their own sessions this month, with
// the same rules as "Your totals" (volumeTotals.ts), and saved as a single
// number under events/{month}/players/{uid}. The community total is a sum
// over those numbers — no names, nothing else.
// ---------------------------------------------------------------------------

export type EventMetric =
  | { kind: "reps"; match: RegExp }
  | { kind: "hold"; match: RegExp } // seconds held
  | { kind: "sessions" }
  | { kind: "minutes" };

export interface EventTheme {
  id: string;
  emoji: string;
  title: string; // English; Italian in phrases.it.ts
  blurb: string;
  unit: "reps" | "seconds" | "sessions" | "minutes";
  metric: EventMetric;
  communityGoal: number; // before tuning's event_goal_scale
  personalGoal: number;
}

const PULL = /pull-?ups?|chin-?ups?/i;
const PUSH = /push-?ups?/i;

// January … December
export const EVENT_THEMES: EventTheme[] = [
  { id: "pull-jan", emoji: "🧗", title: "New Year pull-ups", blurb: "Every pull-up and chin-up variation counts.", unit: "reps", metric: { kind: "reps", match: PULL }, communityGoal: 5000, personalGoal: 200 },
  { id: "push-feb", emoji: "💥", title: "Push-up February", blurb: "Every push-up variation counts, from incline to pseudo-planche.", unit: "reps", metric: { kind: "reps", match: PUSH }, communityGoal: 10000, personalGoal: 400 },
  { id: "dips-mar", emoji: "🔻", title: "March of the dips", blurb: "Bar dips, ring dips, bench dips — all of them.", unit: "reps", metric: { kind: "reps", match: /\bdips?\b/i }, communityGoal: 5000, personalGoal: 200 },
  { id: "core-apr", emoji: "🧱", title: "Core April", blurb: "Seconds held in hollow bodies, planks, L-sits and V-sits.", unit: "seconds", metric: { kind: "hold", match: /hollow|plank|l-sit|v-sit|tuck sit/i }, communityGoal: 30000, personalGoal: 1200 },
  { id: "hang-may", emoji: "🪝", title: "May hang", blurb: "Seconds hanging from the bar, any kind of hang.", unit: "seconds", metric: { kind: "hold", match: /hang/i }, communityGoal: 30000, personalGoal: 1200 },
  { id: "sessions-jun", emoji: "☀️", title: "Summer sessions", blurb: "Every session you finish counts.", unit: "sessions", metric: { kind: "sessions" }, communityGoal: 500, personalGoal: 12 },
  { id: "legs-jul", emoji: "🦵", title: "Legs of July", blurb: "Squats, lunges, pistols and step-ups — don't skip leg day.", unit: "reps", metric: { kind: "reps", match: /squat|lunge|pistol|step-?up|calf/i }, communityGoal: 10000, personalGoal: 400 },
  { id: "minutes-aug", emoji: "⏱️", title: "August minutes", blurb: "Minutes of training, all together.", unit: "minutes", metric: { kind: "minutes" }, communityGoal: 20000, personalGoal: 600 },
  { id: "pull-sep", emoji: "🔙", title: "Back to the bar", blurb: "Pull-ups and chin-ups to start the season.", unit: "reps", metric: { kind: "reps", match: PULL }, communityGoal: 5000, personalGoal: 200 },
  { id: "hs-oct", emoji: "🤸", title: "Handstand October", blurb: "Seconds upside down: wall, free or on the bars.", unit: "seconds", metric: { kind: "hold", match: /handstand/i }, communityGoal: 20000, personalGoal: 900 },
  { id: "sessions-nov", emoji: "🍂", title: "No-excuse November", blurb: "Every session you finish counts, rain or shine.", unit: "sessions", metric: { kind: "sessions" }, communityGoal: 500, personalGoal: 12 },
  { id: "push-dec", emoji: "🎄", title: "Push-up December", blurb: "Every push-up variation counts. Merry reps.", unit: "reps", metric: { kind: "reps", match: PUSH }, communityGoal: 10000, personalGoal: 400 },
];

const pad = (n: number) => String(n).padStart(2, "0");

// "2026-11", in local time
export const monthKey = (d: Date = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

export function monthRange(d: Date = new Date()): { from: Date; to: Date } {
  return { from: new Date(d.getFullYear(), d.getMonth(), 1), to: new Date(d.getFullYear(), d.getMonth() + 1, 1) };
}

export const daysLeftInMonth = (d: Date = new Date()) => Math.max(0, Math.round((monthRange(d).to.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000) - 1);

export interface CommunityEvent extends EventTheme {
  key: string; // the month, e.g. "2026-11"
}

export function currentEvent(d: Date = new Date(), goalScale = 1): CommunityEvent {
  const theme = EVENT_THEMES[d.getMonth()];
  const scaled = Math.max(1, Math.round(theme.communityGoal * goalScale));
  return { ...theme, key: monthKey(d), communityGoal: scaled };
}

// Your part, from this month's sessions.
export function contribution(event: Pick<EventTheme, "metric">, sessions: Pick<SessionRecord, "finishedAt" | "exercises" | "durationMin">[]): number {
  const m = event.metric;
  if (m.kind === "sessions") return sessions.length;
  if (m.kind === "minutes") return Math.round(sessions.reduce((a, s) => a + (s.durationMin ?? 0), 0));
  const totals = totalsByExercise(sessions).filter((t) => m.match.test(t.name));
  return Math.round(totals.reduce((a, t) => a + (m.kind === "reps" ? t.reps : t.holdSec), 0));
}

// The largest single contribution the security rules accept, per unit
export const MAX_CONTRIBUTION = 100000;

export const progress = (value: number, goal: number) => Math.max(0, Math.min(1, goal > 0 ? value / goal : 0));
