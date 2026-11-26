import { SetRecord, TimingSummary } from "./types";

// ---------------------------------------------------------------------------
// Learning from time and pauses.
//
// The per-exercise timer records raw samples: how long each hold actually
// lasted, how long each rest really was, and every pause. Raw timing data is
// noisy — the phone gets locked, someone answers a call, a set gets tapped
// through without training, a timer gets forgotten — so it's cleaned in
// three layers before it can change anything:
//
//   1. Per sample: drop anything that overlapped the app being in the
//      background, contained an interruption-length pause, or is physically
//      implausible (a 1s "rep set", a 20-minute rest).
//   2. Per session: collapse the surviving samples to a median, so one odd
//      set doesn't define the session.
//   3. Across sessions (adaptation.ts): act only on the median of several
//      sessions, so one bad day doesn't define the athlete.
// ---------------------------------------------------------------------------

export interface TimerSetSample {
  kind: "hold" | "reps";
  targetSec: number | null; // holds only
  activeSec: number; // seconds actually held / spent on the set (pauses excluded)
  endedEarly: boolean; // a hold stopped before its target
  maxPauseMs: number; // longest single pause during the set
  hiddenMs: number; // time the app spent in the background during the set
  reps?: number; // reps (or laps, attempts…) the athlete logged for this set (count sets, optional)
  loggedSec?: number; // seconds the athlete says they held (open-ended holds)
  targetReps?: number | null; // lower end of the prescribed range; null = "max reps"
}

export interface TimerRestSample {
  plannedSec: number;
  takenSec: number; // wall-clock rest, including any pause (= wanted more rest)
  maxPauseMs: number;
  hiddenMs: number;
}

export interface TimerLog {
  sets: TimerSetSample[];
  rests: TimerRestSample[];
  workPauses: number; // short pauses taken in the middle of a working set
}

export const EMPTY_TIMER_LOG: TimerLog = { sets: [], rests: [], workPauses: 0 };

const INTERRUPTION_MS = 5 * 60_000; // a pause this long is an interruption, not rest
const MAX_HIDDEN_MS = 10_000; // backgrounded longer than this: timers aren't trustworthy
const MIN_HOLD_SEC = 1; // shorter = an accidental tap on start/skip
const MIN_REP_SET_SEC = 3; // shorter = tapped through without doing the set
const MAX_REP_SET_SEC = 300; // longer = forgot to tap "done"
const MIN_REST_SEC = 2; // shorter = double-tap through the rest screen
const STRUGGLE_HOLD_RATIO = 0.7;
const STRUGGLE_REP_RATIO = 0.75; // logging well under the prescribed reps

export function median(xs: number[]): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function sampleTrustworthy(s: { maxPauseMs: number; hiddenMs: number }): boolean {
  return s.maxPauseMs < INTERRUPTION_MS && s.hiddenMs <= MAX_HIDDEN_MS;
}

// Trustworthy holds, with or without a target (max holds have none).
export function validHoldSamples(log: TimerLog): TimerSetSample[] {
  return log.sets.filter((s) => s.kind === "hold" && sampleTrustworthy(s) && s.activeSec >= MIN_HOLD_SEC);
}

// The longest trustworthy hold in the log — used to fill in a Skill Check
// result automatically instead of asking the athlete to type it.
export function bestHoldFromLog(log: TimerLog | undefined): number | null {
  if (!log) return null;
  const holds = validHoldSamples(log);
  if (holds.length === 0) return null;
  return Math.max(...holds.map((h) => Math.round(h.activeSec)));
}

export function summarizeTimerLog(log: TimerLog | undefined): TimingSummary | undefined {
  if (!log || (log.sets.length === 0 && log.rests.length === 0)) return undefined;
  let ignored = 0;

  const holdRatios: number[] = [];
  // only holds with a real target say anything about falling short
  for (const s of log.sets.filter((x) => x.kind === "hold" && x.targetSec)) {
    if (!sampleTrustworthy(s) || s.activeSec < MIN_HOLD_SEC) {
      ignored++;
      continue;
    }
    holdRatios.push(Math.min(1.5, s.activeSec / s.targetSec!));
  }

  const repSets = log.sets.filter((x) => x.kind === "reps");
  const validRepSets = repSets.filter(
    (s) => sampleTrustworthy(s) && s.activeSec >= MIN_REP_SET_SEC && s.activeSec <= MAX_REP_SET_SEC
  );
  ignored += repSets.length - validRepSets.length;
  // every rep set tapped straight through: the athlete wasn't really using
  // the timer, so its rest data is meaningless too
  const tappedThrough = repSets.length >= 2 && validRepSets.length === 0;

  const restRatios: number[] = [];
  for (const r of log.rests) {
    const plausible =
      r.plannedSec > 0 &&
      r.takenSec >= MIN_REST_SEC &&
      r.takenSec <= Math.max(r.plannedSec * 4, 300) &&
      sampleTrustworthy(r);
    if (!plausible || tappedThrough) {
      ignored++;
      continue;
    }
    // a rest cut to under 40% of the plan is a tap on "Skip rest", not how
    // long you need: it says nothing about the right rest, so it's not learned
    if (r.takenSec / r.plannedSec < 0.4) {
      ignored++;
      continue;
    }
    restRatios.push(Math.min(3, r.takenSec / r.plannedSec));
  }

  // logged reps: only from trustworthy sets, and only plausible counts
  const repRatios: number[] = [];
  let bestReps: number | undefined;
  for (const s of validRepSets) {
    if (s.reps === undefined) continue;
    if (s.reps > Math.max((s.targetReps ?? 0) * 4, 100)) {
      ignored++;
      continue;
    }
    bestReps = Math.max(bestReps ?? 0, s.reps);
    if (s.targetReps) repRatios.push(Math.min(2, s.reps / s.targetReps));
  }

  const holdRatio = holdRatios.length ? median(holdRatios) : undefined;
  const restRatio = restRatios.length ? median(restRatios) : undefined;
  const repRatio = repRatios.length ? median(repRatios) : undefined;
  const bestHold = bestHoldFromLog(log) ?? undefined;
  const struggled =
    (holdRatio !== undefined && holdRatio < STRUGGLE_HOLD_RATIO) ||
    (repRatio !== undefined && repRatio < STRUGGLE_REP_RATIO) ||
    log.workPauses >= 2;

  return { holdRatio, restRatio, repRatio, bestReps, bestHold, struggled, ignored };
}

// Scales every "Ns" / "N-Ms" seconds figure in a detail string, e.g.
// "4 x 15-20s" * 0.7 -> "4 x 11-14s". Leaves rep counts and minutes alone.
export function scaleHoldDetail(detail: string, factor: number): string {
  const r = (n: number) => Math.max(2, Math.round(n * factor));
  return detail.replace(/(\d+)(?:-(\d+))?(\s*)s\b/g, (_m, a: string, b: string | undefined, sp: string) =>
    b ? `${r(+a)}-${r(+b)}${sp}s` : `${r(+a)}${sp}s`
  );
}

// Rest between exercises in guided mode, learned from the last few
// sessions' medians; returns the planned rest when there isn't enough data.
export function learnedTransitionRest(planned: number, history: number[] | undefined): { seconds: number; learned: boolean } {
  if (!history || history.length < 3) return { seconds: planned, learned: false };
  const r = median(history);
  if (Math.abs(r - 1) <= 0.15) return { seconds: planned, learned: false };
  const seconds = Math.min(150, round5(planned * Math.max(0.5, Math.min(1.75, r))));
  return { seconds, learned: seconds !== planned };
}

export function round5(n: number): number {
  return Math.max(15, Math.round(n / 5) * 5);
}

// Per-set results worth keeping in the session history: only sets that pass
// the same trust filters as the learning (no backgrounded or interrupted
// sets, no accidental taps, no implausible rep counts).
export function cleanSets(log: TimerLog | undefined): SetRecord[] | undefined {
  if (!log) return undefined;
  const out: SetRecord[] = [];
  for (const s of log.sets) {
    if (!sampleTrustworthy(s)) continue;
    if (s.kind === "hold") {
      const held = s.loggedSec ?? s.activeSec;
      if (held >= MIN_HOLD_SEC) out.push({ holdSec: Math.round(held) });
    } else if (s.reps !== undefined && s.activeSec >= MIN_REP_SET_SEC && s.reps <= Math.max((s.targetReps ?? 0) * 4, 100)) {
      out.push({ reps: s.reps });
    }
  }
  return out.length ? out : undefined;
}

// "12·11·10 reps" / "8s·7s·9s" — compact enough for a hint under an exercise.
export function formatSets(sets: SetRecord[] | undefined): string | undefined {
  if (!sets?.length) return undefined;
  const reps = sets.filter((s) => s.reps !== undefined).map((s) => s.reps);
  const holds = sets.filter((s) => s.holdSec !== undefined).map((s) => `${s.holdSec}s`);
  if (reps.length) return `${reps.join("·")} reps`;
  if (holds.length) return holds.join("·");
  return undefined;
}
