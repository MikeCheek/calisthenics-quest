import type { TrainingSession, TrainingSet } from "./types";
import type { EffortSample } from "./effort";
import { HIERARCHY_EXEMPT_SETS } from "./exerciseHierarchy";
import { setsOf, withSets } from "./customSession";

// ---------------------------------------------------------------------------
// How you feel today, and lighter weeks when the signs pile up.
//
// Readiness: one tap before starting (😴 / 🙂 / 💪). Tired → about a quarter
// fewer sets; strong → one more set on the key work. Remembered for the day,
// and kept with the session for the lighter-week signal.
//
// Lighter week: about 60% of the usual sets for seven days, when recent
// sessions show it's needed — you've been pressing "I'm tired", doing well
// under what was planned, or saying you feel tired — or after 18 sessions
// without one. Skill checks wait for its last two days, when you're fresh.
// A training block keeps its own deload week instead.
// ---------------------------------------------------------------------------

export type Readiness = "tired" | "ok" | "strong";
export interface ReadinessSample {
  d: string; // YYYY-MM-DD
  r: Readiness;
}
export const READINESS_HISTORY = 8;

export interface LighterWeek {
  from?: string; // ISO day it started; absent when none is running
  sessions: number; // sessions since the last one ended
  why?: "tired" | "due";
}

export const LIGHTER_DAYS = 7;
export const LIGHTER_EVERY = 18; // sessions
const MIN_SESSIONS_BEFORE = 6; // signals need some training to mean anything
const DAY = 86_400_000;

const KEY = "barquests:readiness";
const today = () => new Date().toISOString().slice(0, 10);

export function readReadiness(): Readiness | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as { d: string; r: Readiness } | null;
    return v && v.d === today() ? v.r : null;
  } catch {
    return null;
  }
}

export function saveReadiness(r: Readiness | null) {
  try {
    if (r) sessionStorage.setItem(KEY, JSON.stringify({ d: today(), r }));
    else sessionStorage.removeItem(KEY);
  } catch {
    // this page only
  }
}

const isWork = (set: TrainingSet) => !HIERARCHY_EXEMPT_SETS.has(set.title) && set.track !== "skillCheck";
const withNote = (note: string | undefined, add: string) => (note ? `${note} · ${add}` : add);

/** scales the sets of the session's work (never under two) */
export function scaleSets(session: TrainingSession, factor: number, note: string): TrainingSession {
  return {
    ...session,
    sets: session.sets.map((set) =>
      !isWork(set)
        ? set
        : {
            ...set,
            exercises: set.exercises.map((e) => {
              if (e.check) return e;
              const n = setsOf(e.detail);
              const m = Math.max(2, Math.round(n * factor));
              return m < n ? { ...e, detail: withSets(e.detail, m), adaptNote: withNote(e.adaptNote, note) } : e;
            }),
          }
    ),
  };
}

/** today's session, for how you said you feel */
export function applyReadiness(session: TrainingSession, r: Readiness | null): TrainingSession {
  if (r === "tired") return scaleSets(session, 0.75, "Easier today — you said you're tired");
  if (r !== "strong") return session;
  const main = session.sets.findIndex((s) => s.title.startsWith("Main Focus") || s.track === "sport");
  if (main < 0) return session;
  return {
    ...session,
    sets: session.sets.map((set, i) =>
      i !== main
        ? set
        : {
            ...set,
            exercises: set.exercises.map((e, j) => {
              // the key exercise and the next one
              if (j > 1 || e.check || !/^\d+(?:-\d+)?\s*x/i.test(e.detail)) return e;
              const n = setsOf(e.detail);
              const more = withSets(e.detail, Math.min(10, n + 1));
              return more === e.detail ? e : { ...e, detail: more, adaptNote: withNote(e.adaptNote, "+1 set — you're feeling strong") };
            }),
          }
    ),
  };
}

export const lighterActive = (w: LighterWeek | undefined, day = today()): w is LighterWeek & { from: string } =>
  !!w?.from && (Date.parse(day) - Date.parse(w.from)) / DAY < LIGHTER_DAYS;

/** day 1–7 of a running lighter week */
export const lighterDay = (w: LighterWeek & { from: string }, day = today()) => Math.floor((Date.parse(day) - Date.parse(w.from)) / DAY) + 1;

/** recent sessions say you're running on empty */
export function tiredSignal(effort: EffortSample[] | undefined, readiness: ReadinessSample[] | undefined): boolean {
  const recent = (effort ?? []).slice(-4);
  const pressedTired = recent.filter((s) => s.tired).length >= 3;
  const ratios = recent.filter((s) => s.planned > 0).map((s) => s.done / s.planned).sort((a, b) => a - b);
  const underDone = ratios.length >= 4 && (ratios[1] + ratios[2]) / 2 < 0.6;
  const saidTired = (readiness ?? []).slice(-4).filter((x) => x.r === "tired").length >= 3;
  return pressedTired || underDone || saidTired;
}

/**
 * after a session: the lighter week's counter, and whether one starts
 * tomorrow. `inBlock`: a training block has its own deload week.
 */
export function nextLighterWeek(
  w: LighterWeek | undefined,
  effort: EffortSample[] | undefined,
  readiness: ReadinessSample[] | undefined,
  day: string,
  inBlock: boolean
): LighterWeek {
  const cur: LighterWeek = { sessions: 0, ...(w ?? {}) };
  if (lighterActive(cur, day)) return cur;
  // one just ended: the count starts again from its end
  const sessions = (cur.from ? 0 : cur.sessions) + 1;
  if (inBlock) return { sessions };
  const tomorrow = new Date(Date.parse(day) + DAY).toISOString().slice(0, 10);
  if (sessions >= MIN_SESSIONS_BEFORE && tiredSignal(effort, readiness)) return { from: tomorrow, sessions: 0, why: "tired" };
  if (sessions >= LIGHTER_EVERY) return { from: tomorrow, sessions: 0, why: "due" };
  return { sessions };
}
