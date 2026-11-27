import type { ExerciseStat, SetRecord } from "./types";

// ---------------------------------------------------------------------------
// Progressing from the numbers you log ("double progression").
//
// Hit the top of the range on every set and the next time it asks for a bit
// more: one rep, or a couple of seconds on a hold. Fall short of the bottom
// of the range twice in a row and it gives that back. In between it holds
// steady. Once the reps have climbed far enough the existing step-up
// (adaptation.ts) moves you to the harder exercise, which starts fresh.
//
// The offset (`up`) lives on the exercise's stat and is added to whatever
// range the generator prescribes — so it follows the exercise through the
// rotating schemes in variety.ts.
// ---------------------------------------------------------------------------

export const MAX_UP_REPS = 5;
export const MAX_UP_SECONDS = 15;
const MISSES_TO_EASE = 2;

export interface Target {
  sets: number;
  lo: number;
  hi: number;
  unit: "reps" | "s";
}

// "4 x 6-8 reps", "3 x 10 reps per side", "4 x 15-20s", "6 x 10s"
const TARGET = /^(\d+)\s*x\s*(\d+)(?:-(\d+))?\s*(reps?\b|s\b)/i;

export function parseTarget(detail: string | undefined): Target | null {
  const m = detail?.match(TARGET);
  if (!m) return null;
  const lo = parseInt(m[2], 10);
  const hi = parseInt(m[3] ?? m[2], 10);
  if (!(lo > 0) || hi < lo) return null;
  return { sets: parseInt(m[1], 10), lo, hi, unit: m[4].toLowerCase().startsWith("rep") ? "reps" : "s" };
}

// Slow-lowering or tempo work is about control: more reps there isn't the
// goal, and its range is already lowered on purpose (variety.ts).
const isTempo = (detail: string) => /lower|tempo|descent|negative|\ds\s*(down|up)\b/i.test(detail);

const stepFor = (t: Target) => (t.unit === "reps" ? 1 : Math.max(2, Math.round(t.hi * 0.1)));
const capFor = (t: Target) => (t.unit === "reps" ? MAX_UP_REPS : MAX_UP_SECONDS);

/** what the logged sets say about the prescription: "top", "short" or "steady" */
export function judgeSets(detail: string | undefined, sets: SetRecord[] | undefined): "top" | "short" | "steady" | null {
  const t = parseTarget(detail);
  if (!t || !detail || isTempo(detail) || !sets?.length) return null;
  const values = sets.map((s) => (t.unit === "reps" ? s.reps : s.holdSec)).filter((v): v is number => v !== undefined);
  if (!values.length) return null;
  if (values.length >= t.sets && values.every((v) => v >= t.hi)) return "top";
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted[Math.floor((sorted.length - 1) / 2)];
  return mid < t.lo ? "short" : "steady";
}

/** updates the stat's progression from one session's logged sets (mutates `s`) */
export function learnProgression(s: ExerciseStat, detail: string | undefined, sets: SetRecord[] | undefined): void {
  const verdict = judgeSets(detail, sets);
  if (!verdict) return;
  const t = parseTarget(detail)!;
  if (verdict === "top") {
    s.up = Math.min(capFor(t), (s.up ?? 0) + stepFor(t));
    delete s.miss;
  } else if (verdict === "short") {
    const miss = (s.miss ?? 0) + 1;
    if (miss >= MISSES_TO_EASE && (s.up ?? 0) > 0) {
      s.up = Math.max(0, (s.up ?? 0) - stepFor(t));
      if (!s.up) delete s.up;
      delete s.miss;
    } else s.miss = miss;
  } else delete s.miss;
}

/** marked too hard: give back one step of what was added */
export function easeProgression(s: ExerciseStat, detail: string | undefined): void {
  const t = parseTarget(detail);
  if (!t || !s.up) return;
  s.up = Math.max(0, s.up - stepFor(t));
  if (!s.up) delete s.up;
  delete s.miss;
}

/** adds the learned offset to a prescription's range */
export function applyProgression(detail: string, up: number | undefined): string {
  if (!up) return detail;
  const t = parseTarget(detail);
  if (!t || isTempo(detail)) return detail;
  const lo = Math.max(1, t.lo + up);
  const hi = Math.max(lo, t.hi + up);
  const range = lo === hi ? `${lo}` : `${lo}-${hi}`;
  return detail.replace(TARGET, (_m, sets: string, _a, _b, unit: string) => `${sets} x ${range}${unit.toLowerCase().startsWith("rep") ? " reps" : "s"}`);
}

export function progressionNote(detail: string, up: number): string {
  const t = parseTarget(detail);
  if (!t) return "";
  return t.unit === "reps"
    ? `+${up} rep${up === 1 ? "" : "s"} — you hit the top of the range on every set`
    : `+${up}s — you held the full target on every set`;
}
