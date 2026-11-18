import {
  ExerciseBest,
  ExerciseFeedback,
  ExerciseRecord,
  ExerciseStat,
  PersonalRecord,
  SessionRecord,
  TrainingSession,
} from "./types";
import { statKey } from "./adaptation";
import { HIERARCHY_EXEMPT_SETS } from "./exerciseHierarchy";
import { formatSets } from "./timingLearning";

// ---------------------------------------------------------------------------
// Session history: what gets stored for every finished session, the "last
// time" hint shown under each exercise, and personal records.
// ---------------------------------------------------------------------------

const MIN_PLAUSIBLE_MIN = 3;
const MAX_PLAUSIBLE_MIN = 240;

// A start→finish span outside this range means the session was left open
// (or tapped through), not trained — better no duration than a wrong one.
export function plausibleDuration(startedAtMs: number | null | undefined, nowMs: number = Date.now()): number | undefined {
  if (!startedAtMs) return undefined;
  const min = Math.round((nowMs - startedAtMs) / 60000);
  return min >= MIN_PLAUSIBLE_MIN && min <= MAX_PLAUSIBLE_MIN ? min : undefined;
}

const tracked = (fb: ExerciseFeedback) => !HIERARCHY_EXEMPT_SETS.has(fb.setTitle) && !fb.check;

// Remembers how each exercise went the last time it was done, so the next
// session can show "Last time: 12·11·10 reps".
export function recordLastTimes(
  stats: Record<string, ExerciseStat>,
  feedback: ExerciseFeedback[],
  nowISO: string = new Date().toISOString()
): Record<string, ExerciseStat> {
  const next = { ...stats };
  for (const fb of feedback) {
    if (!tracked(fb) || fb.outcome !== "done") continue;
    const k = statKey(fb.name);
    const prev = next[k] ?? { p: 0, done: 0, skipped: 0, tooHard: 0, last: nowISO };
    next[k] = { ...prev, lastSets: formatSets(fb.sets) ?? fb.detail ?? prev.lastSets, lastAt: nowISO };
  }
  return next;
}

// Best clean set per exercise. A new best only counts as a *record* when
// there was a previous best to beat — the first time just sets the bar.
export function detectRecords(
  records: Record<string, ExerciseBest>,
  feedback: ExerciseFeedback[],
  nowISO: string = new Date().toISOString()
): { records: Record<string, ExerciseBest>; newRecords: PersonalRecord[] } {
  const next = { ...records };
  const newRecords: PersonalRecord[] = [];
  for (const fb of feedback) {
    if (!tracked(fb) || fb.outcome !== "done" || !fb.sets?.length) continue;
    const k = statKey(fb.name);
    const prev = next[k];
    const reps = Math.max(0, ...fb.sets.map((s) => s.reps ?? 0));
    const hold = Math.max(0, ...fb.sets.map((s) => s.holdSec ?? 0));
    const entry: ExerciseBest = { ...(prev ?? {}), dateISO: prev?.dateISO ?? nowISO };
    let improved = false;
    if (reps > 0 && reps > (prev?.reps ?? 0)) {
      if (prev?.reps) newRecords.push({ name: fb.name, kind: "reps", value: reps, previous: prev.reps });
      entry.reps = reps;
      improved = true;
    }
    if (hold > 0 && hold > (prev?.hold ?? 0)) {
      if (prev?.hold) newRecords.push({ name: fb.name, kind: "hold", value: hold, previous: prev.hold });
      entry.hold = hold;
      improved = true;
    }
    if (improved) next[k] = { ...entry, name: fb.name, dateISO: nowISO };
  }
  return { records: next, newRecords };
}

export function buildSessionRecord(
  session: TrainingSession,
  feedback: ExerciseFeedback[],
  opts: { xp: number; durationMin?: number; paired?: boolean; records?: PersonalRecord[]; finishedAt?: string }
): SessionRecord {
  // Feedback is the source of truth for what happened; fall back to the
  // session's own list when a session was logged without per-exercise detail.
  const exercises: ExerciseRecord[] = feedback.length
    ? feedback
        .filter((f, i, all) => all.findIndex((g) => g.name === f.name && g.setTitle === f.setTitle && g.outcome === f.outcome) === i)
        .map((f) => ({
          name: f.name,
          setTitle: f.setTitle,
          outcome: f.outcome,
          detail: f.detail,
          sets: f.sets,
          checkResult: f.checkResult,
        }))
    : session.sets.flatMap((s) => s.exercises.map((e) => ({ name: e.name, setTitle: s.title, outcome: "done" as const, detail: e.detail })));
  return {
    finishedAt: opts.finishedAt ?? new Date().toISOString(),
    focusLabel: session.focusLabel,
    durationMin: opts.durationMin,
    xp: opts.xp,
    paired: opts.paired || undefined,
    exercises,
    records: opts.records?.length ? opts.records : undefined,
  };
}
