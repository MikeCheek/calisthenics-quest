import type { ExerciseFeedback, TrainingEquipment, TrainingSession } from "./types";

// ---------------------------------------------------------------------------
// Habits: when you train, where, and which blocks you leave out.
//
//  - Days and time: the weekly plan goes on the weekdays you actually train
//    (unless you picked days yourself), and the reminder comes an hour before
//    your usual time (unless you set one).
//  - Where: three of the last four times in the same situation — a rainy
//    day, or the same weekday — you chose home or the same park: Today
//    preselects it, and says so.
//  - Blocks: the warm-up cut short, or the finisher skipped, in four of the
//    last five sessions: Today asks once whether to shorten it or keep it.
//
// Times are the athlete's local ones (the phone's clock).
// ---------------------------------------------------------------------------

export interface TrainTime {
  d: string; // local YYYY-MM-DD
  w: number; // weekday, 0 = Sunday
  h: number; // local hour it started
}
export const TIME_HISTORY = 24;
const HABIT_WINDOW_DAYS = 42;
const MIN_SESSIONS = 6;
const MIN_WEEKS = 3;

const pad = (n: number) => String(n).padStart(2, "0");
export const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function trainTime(startedAt: Date): TrainTime {
  return { d: localDay(startedAt), w: startedAt.getDay(), h: startedAt.getHours() };
}

/** a session's start, kept (one per day — the first) */
export function addTrainTime(log: TrainTime[] | undefined, t: TrainTime): TrainTime[] {
  const list = (log ?? []).filter((x) => x.d !== t.d || x.h <= t.h);
  if (list.some((x) => x.d === t.d)) return list.slice(-TIME_HISTORY);
  return [...list, t].slice(-TIME_HISTORY);
}

const recent = (log: TrainTime[] | undefined, now: Date) => {
  const from = localDay(new Date(now.getTime() - HABIT_WINDOW_DAYS * 86_400_000));
  return (log ?? []).filter((x) => x.d >= from);
};

const weekOf = (d: string) => Math.floor(Date.parse(`${d}T12:00:00Z`) / (7 * 86_400_000));

/**
 * the weekdays you train on, as many as your training days a week — only
 * once there's a clear pattern (most sessions on those days, over 3+ weeks)
 */
export function habitDays(log: TrainTime[] | undefined, perWeek: number, now = new Date()): number[] | null {
  const xs = recent(log, now);
  if (xs.length < MIN_SESSIONS || new Set(xs.map((x) => weekOf(x.d))).size < MIN_WEEKS) return null;
  const count = new Map<number, number>();
  for (const x of xs) count.set(x.w, (count.get(x.w) ?? 0) + 1);
  const top = [...count.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, Math.max(1, Math.min(7, perWeek)));
  const covered = top.reduce((n, [, c]) => n + c, 0);
  if (covered / xs.length < 0.6) return null;
  return top.map(([w]) => w).sort((a, b) => a - b);
}

/** the hour you usually start, from the last ten sessions */
export function habitHour(log: TrainTime[] | undefined, now = new Date()): number | null {
  const hs = recent(log, now).slice(-10).map((x) => x.h).sort((a, b) => a - b);
  if (hs.length < 4) return null;
  return hs[Math.floor(hs.length / 2)];
}

/** the reminder an hour before your usual time, "HH:00" */
export const habitReminder = (hour: number) => `${pad((hour + 23) % 24)}:00`;

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const weekdayNames = (days: number[]) => days.map((d) => WEEKDAY[d]);

// ---- where ----

export type WhereKind = "usual" | "home" | "park";
export interface WhereSample {
  w: number;
  wet: boolean;
  k: WhereKind;
  park?: { id: string; label: string; equipment: TrainingEquipment };
}
export const WHERE_HISTORY = 12;

export interface WherePick {
  kind: "home" | "park";
  park?: WhereSample["park"];
  why: "wet" | "weekday";
}

/** where you usually train in today's situation, if it's clearly not your usual spot */
export function usualWhere(log: WhereSample[] | undefined, today: { w: number; wet: boolean }): WherePick | null {
  const pick = (xs: WhereSample[], why: WherePick["why"]): WherePick | null => {
    const last = xs.slice(-4);
    if (last.length < 3) return null;
    const key = (x: WhereSample) => (x.k === "park" ? `park:${x.park?.id}` : x.k);
    const counts = new Map<string, number>();
    for (const x of last) counts.set(key(x), (counts.get(key(x)) ?? 0) + 1);
    const [best, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (n < 3 || best === "usual") return null;
    const sample = [...last].reverse().find((x) => key(x) === best)!;
    if (sample.k === "park" && !sample.park) return null;
    return { kind: sample.k as "home" | "park", park: sample.park, why };
  };
  const all = log ?? [];
  // rain decides first; on a dry day, the weekday (its dry days only)
  if (today.wet) return pick(all.filter((x) => x.wet), "wet");
  return pick(all.filter((x) => !x.wet && x.w === today.w), "weekday");
}

// ---- blocks you leave out ----

export type Block = "warmup" | "finisher";
const WARMUP = new Set(["Warm-Up"]);
const FINISHER = new Set(["Final Hits", "Cool-Down"]);
export interface BlockSample {
  wu: boolean; // warm-up mostly left out
  fin: boolean; // finisher left out
}
export const BLOCK_HISTORY = 5;
const ASK_AGAIN_DAYS = 30;

export interface BlockPrefs {
  warmup?: "short" | "keep";
  finisher?: "short" | "keep";
  at?: Partial<Record<Block, string>>; // when each was answered
}

/** what was left out of a finished session (null when it had neither block) */
export function blockSample(session: TrainingSession, feedback: ExerciseFeedback[]): BlockSample | null {
  const share = (titles: Set<string>) => {
    const n = session.sets.filter((s) => titles.has(s.title)).reduce((k, s) => k + s.exercises.length, 0);
    if (!n) return null;
    const done = feedback.filter((f) => titles.has(f.setTitle) && f.outcome === "done").length;
    return done / n;
  };
  const wu = share(WARMUP);
  const fin = share(FINISHER);
  if (wu === null && fin === null) return null;
  return { wu: wu !== null && wu < 0.5, fin: fin !== null && fin === 0 };
}

/** a block you keep leaving out, not yet asked about (or not for a month) */
export function blockToAsk(history: BlockSample[] | undefined, prefs: BlockPrefs | undefined, now = new Date()): Block | null {
  const last = (history ?? []).slice(-BLOCK_HISTORY);
  if (last.length < 4) return null;
  const fresh = (b: Block) => {
    if (prefs?.[b] === "short") return false;
    const at = prefs?.at?.[b];
    return !at || (now.getTime() - Date.parse(at)) / 86_400_000 >= ASK_AGAIN_DAYS;
  };
  if (last.filter((x) => x.fin).length >= 4 && fresh("finisher")) return "finisher";
  if (last.filter((x) => x.wu).length >= 4 && fresh("warmup")) return "warmup";
  return null;
}

/** the warm-up down to two exercises, the finisher out (a cool-down down to one) */
export function applyBlockPrefs(session: TrainingSession, prefs: BlockPrefs | undefined): TrainingSession {
  if (prefs?.warmup !== "short" && prefs?.finisher !== "short") return session;
  const sets = session.sets.flatMap((s) => {
    if (prefs.warmup === "short" && WARMUP.has(s.title)) return [{ ...s, exercises: s.exercises.slice(0, 2) }];
    if (prefs.finisher === "short" && FINISHER.has(s.title)) return s.title === "Cool-Down" ? [{ ...s, exercises: s.exercises.slice(0, 1) }] : [];
    return [s];
  });
  return { ...session, sets };
}
