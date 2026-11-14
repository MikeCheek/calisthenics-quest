import {
  Exercise,
  ExerciseFeedback,
  ExerciseStat,
  SkillMastery,
  SkillProfile,
  SkillProgress,
  StagedSkillKey,
  TrainingEquipment,
  TrainingSession,
  DEFAULT_MASTERY,
  SKILL_FIELD_LABEL,
} from "./types";
import {
  exerciseStage,
  findEasierExercise,
  findHarderExercise,
  HIERARCHY_EXEMPT_SETS,
} from "./exerciseHierarchy";
import { adjustDetail } from "./exerciseTiming";
import { STAGE_ORDER, STAGE_LABEL, stageIndex } from "./stageOrder";
import { median, scaleHoldDetail, round5 } from "./timingLearning";
import type { VerificationEvent } from "./verification";

// ---------------------------------------------------------------------------
// Learning from activity.
//
// Every finished session reports, per exercise, whether it was completed,
// skipped, or marked too hard (plus any +/- the athlete applied). Two
// memories are updated from that:
//
//  1. Per exercise (`exerciseStats`): a bounded "pressure" score. Too hard
//     pushes it up a lot, a skip a little, a clean completion pulls it down.
//     The next generated session reads it to swap in an easier rung, keep the
//     exercise as is, add a set, or step up a rung — and remembers the rep
//     adjustment the athlete keeps choosing.
//
//  2. Per skill (`skillProgress`): exercises are mapped back to the skill and
//     stage they belong to. Consistent completions at your current stage raise
//     that skill's mastery; repeated "too hard" lowers it. When mastery is
//     already at the top (or bottom) the engine *suggests* moving the stage
//     itself — the athlete confirms, since stage is what sets the level.
// ---------------------------------------------------------------------------

const P_MIN = -6;
const P_MAX = 6;
const EASE_AT = 2; // pressure at/above which the next session swaps in an easier rung
const VOLUME_AT = -3; // pressure at/below which a set is added
const STEP_UP_AT = -6; // pressure at/below which a harder rung is tried
const STEP_UP_MIN_DONE = 6;
const REP_DELTA_LIMIT = 3;

// timing (see timingLearning.ts for the per-sample and per-session cleaning)
const TIMING_HISTORY = 5; // sessions remembered per exercise
const REST_MIN_SESSIONS = 3; // rest only changes after this many clean sessions agree
const HOLD_MIN_SESSIONS = 2;
const REST_DEADBAND = 0.15; // ignore rest differences within ±15%
const HOLD_SHORTEN_BELOW = 0.75; // median held / target under this: shorten the target

const SKILL_SCORE_STEP = 6; // score needed to move mastery one notch (~1–2 full sessions)
const SNOOZE_DAYS = 7;

export function statKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 80) || "exercise";
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function emptyStat(nowISO: string): ExerciseStat {
  return { p: 0, done: 0, skipped: 0, tooHard: 0, last: nowISO };
}

// ---- 1. per-exercise memory ----

export function applyExerciseFeedback(
  stats: Record<string, ExerciseStat>,
  feedback: ExerciseFeedback[],
  nowISO: string = new Date().toISOString()
): Record<string, ExerciseStat> {
  const next: Record<string, ExerciseStat> = { ...stats };
  const get = (name: string) => {
    const k = statKey(name);
    next[k] = { ...(next[k] ?? emptyStat(nowISO)) };
    return next[k];
  };

  for (const fb of feedback) {
    if (HIERARCHY_EXEMPT_SETS.has(fb.setTitle)) continue; // warm-up / finisher: same for everyone
    if (fb.check) continue; // skill checks are handled by verification.ts
    const s = get(fb.name);
    s.last = nowISO;

    // one cleaned value per session (already a median of that session's sets)
    const t = fb.timing;
    if (t?.restRatio !== undefined) s.rr = [...(s.rr ?? []), +t.restRatio.toFixed(2)].slice(-TIMING_HISTORY);
    if (t?.holdRatio !== undefined) s.hr = [...(s.hr ?? []), +t.holdRatio.toFixed(2)].slice(-TIMING_HISTORY);

    if (fb.outcome === "done") {
      s.done += 1;
      // "done", but the timer shows broken holds or repeated mid-set
      // pauses: count it as done without crediting it toward easing/step-ups
      if (!t?.struggled) s.p = clamp(s.p - 1, P_MIN, P_MAX);
      if (fb.repDelta) s.rd = clamp((s.rd ?? 0) + fb.repDelta, -REP_DELTA_LIMIT, REP_DELTA_LIMIT);
    } else if (fb.outcome === "skipped") {
      s.skipped += 1;
      s.p = clamp(s.p + 1, P_MIN, P_MAX);
    } else {
      s.tooHard += 1;
      s.p = clamp(s.p + 2, P_MIN, P_MAX);
      // a lowered rep count that was *still* too hard shouldn't stick as the baseline
      if ((s.rd ?? 0) > 0) s.rd = 0;
    }

    // Feedback on a swapped-in exercise also informs the one it replaced:
    // nailing the easier rung brings the original back sooner; struggling
    // with a stepped-up rung cancels the step-up streak on the original.
    if (fb.adaptedFrom) {
      const orig = get(fb.adaptedFrom);
      if (fb.adaptDir === "easier" && fb.outcome === "done") {
        orig.p = clamp(orig.p - 1, P_MIN, P_MAX);
      } else if (fb.adaptDir === "harder" && fb.outcome !== "done") {
        orig.p = Math.max(orig.p, VOLUME_AT + 1);
      }
    }
  }
  return next;
}

function statFor(stats: Record<string, ExerciseStat> | undefined, name: string): ExerciseStat | undefined {
  return stats?.[statKey(name)];
}

// Rest and hold-target tweaks learned from the timer. Applied to whatever
// exercise ends up in the slot, using that exercise's own history.
function applyTiming(ex: Exercise, stats: Record<string, ExerciseStat>): Exercise {
  const s = statFor(stats, ex.name);
  if (!s) return ex;
  const notes: string[] = [];
  let out = ex;

  if ((s.rr?.length ?? 0) >= REST_MIN_SESSIONS && ex.restSeconds > 0) {
    const r = median(s.rr!);
    if (Math.abs(r - 1) > REST_DEADBAND) {
      const rest = round5(ex.restSeconds * clamp(r, 0.5, 1.75));
      if (rest !== ex.restSeconds) {
        notes.push(`rest ${ex.restSeconds}s → ${rest}s, matching what you take`);
        out = { ...out, restSeconds: rest };
      }
    }
  }

  if ((s.hr?.length ?? 0) >= HOLD_MIN_SESSIONS) {
    const h = median(s.hr!);
    if (h < HOLD_SHORTEN_BELOW) {
      const detail = scaleHoldDetail(out.detail, Math.max(0.5, h));
      if (detail !== out.detail) {
        notes.push("shorter hold target, matching your recent holds");
        out = { ...out, detail };
      }
    }
  }

  if (notes.length === 0) return out;
  const note = notes.join(" · ");
  return { ...out, adaptNote: out.adaptNote ? `${out.adaptNote} · ${note}` : note.charAt(0).toUpperCase() + note.slice(1) };
}

// `taken` holds the names already in this block: a swap never lands on
// one of them, since the easier/harder rung is often the neighbouring
// exercise in the same block and doing it twice isn't an adaptation.
function adaptOne(
  ex: Exercise,
  stats: Record<string, ExerciseStat>,
  equipment: TrainingEquipment,
  taken: Set<string>
): Exercise {
  const s = statFor(stats, ex.name);
  if (!s) return ex;

  // Too hard / skipped lately → step down, up to two rungs if the easier one
  // has been a struggle as well.
  if (s.p >= EASE_AT) {
    let replacement: Exercise | null = findEasierExercise(ex.name, equipment);
    let steps = 1;
    while (replacement && steps < 2 && (statFor(stats, replacement.name)?.p ?? 0) >= EASE_AT) {
      const further = findEasierExercise(replacement.name, equipment);
      if (!further) break;
      replacement = further;
      steps++;
    }
    const why = s.tooHard >= s.skipped ? "marked it too hard" : "skipped it";
    if (replacement && !taken.has(replacement.name)) {
      const rs = statFor(stats, replacement.name);
      return {
        ...replacement,
        detail: rs?.rd ? adjustDetail(replacement.detail, rs.rd) : replacement.detail,
        adaptedFrom: ex.name,
        adaptDir: "easier",
        adaptNote: `Eased from ${ex.name} — you ${why} recently`,
      };
    }
    // nothing easier exists: trim a set instead
    return { ...ex, detail: adjustDetail(ex.detail, -1), adaptNote: `One set fewer — you ${why} recently` };
  }

  // Nailed it many times in a row → try the next rung, unless that rung has
  // already proven too much.
  if (s.p <= STEP_UP_AT && s.done >= STEP_UP_MIN_DONE) {
    const harder = findHarderExercise(ex.name, equipment);
    if (harder && !taken.has(harder.name) && (statFor(stats, harder.name)?.p ?? 0) < 1) {
      const hs = statFor(stats, harder.name);
      return {
        ...harder,
        detail: hs?.rd ? adjustDetail(harder.detail, hs.rd) : harder.detail,
        adaptedFrom: ex.name,
        adaptDir: "harder",
        adaptNote: `Stepped up from ${ex.name} — you've been nailing it`,
      };
    }
  }

  let delta = s.rd ?? 0;
  const notes: string[] = [];
  if (s.rd) notes.push(`${s.rd > 0 ? "+" : ""}${s.rd} set${Math.abs(s.rd) === 1 ? "" : "s"}, as you usually adjust`);
  if (s.p <= VOLUME_AT) {
    delta += 1;
    notes.push("+1 set — consistently completed");
  }
  if (delta === 0) return ex;
  const detail = adjustDetail(ex.detail, delta);
  if (detail === ex.detail) return ex;
  return { ...ex, detail, adaptNote: notes.join(" · ") };
}

// Rewrites a freshly generated session using the athlete's history. Pure:
// the same stats + session always give the same result.
export function adaptSession(
  session: TrainingSession,
  stats: Record<string, ExerciseStat> | undefined,
  equipment: TrainingEquipment
): TrainingSession {
  if (!stats || Object.keys(stats).length === 0) return session;
  return {
    ...session,
    sets: session.sets.map((set) => {
      if (HIERARCHY_EXEMPT_SETS.has(set.title)) return set;
      const taken = new Set(set.exercises.map((e) => e.name));
      const exercises = set.exercises.map((ex) => {
        if (ex.check) return ex;
        const adapted = applyTiming(adaptOne(ex, stats, equipment, taken), stats);
        taken.add(adapted.name);
        return adapted;
      });
      return { ...set, exercises };
    }),
  };
}

export function adaptedCount(session: TrainingSession): number {
  return session.sets.reduce((n, s) => n + s.exercises.filter((e) => e.adaptNote).length, 0);
}

// ---- 2. per-skill memory ----

export interface MasteryChange {
  skill: StagedSkillKey;
  from: SkillMastery;
  to: SkillMastery;
}

export interface StageSuggestion {
  skill: StagedSkillKey;
  direction: "up" | "down";
  fromStage: string;
  toStage: string;
}

export interface AdaptationReport {
  masteryChanges: MasteryChange[];
  suggestions: StageSuggestion[];
  feedbackCounts: { done: number; skipped: number; tooHard: number };
  verifications: VerificationEvent[];
  ignoredTimingSamples: number; // timer samples dropped as unreliable
}

export function applySkillFeedback(
  skills: SkillProfile,
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>,
  progress: Partial<Record<StagedSkillKey, SkillProgress>>,
  feedback: ExerciseFeedback[],
  now: Date = new Date()
): {
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>;
  progress: Partial<Record<StagedSkillKey, SkillProgress>>;
  masteryChanges: MasteryChange[];
  suggestions: StageSuggestion[];
} {
  const delta: Partial<Record<StagedSkillKey, number>> = {};

  for (const fb of feedback) {
    if (HIERARCHY_EXEMPT_SETS.has(fb.setTitle) || fb.check) continue;
    const loc = exerciseStage(fb.name);
    if (!loc) continue;
    const userStage = (skills as unknown as Record<string, string>)[loc.skill] ?? "none";
    const rel = stageIndex(loc.skill, loc.stage) - stageIndex(loc.skill, userStage);
    let d = 0;
    if (fb.outcome === "done") d = fb.timing?.struggled ? 0 : rel >= 1 ? 2 : rel === 0 ? 1 : 0;
    else if (fb.outcome === "tooHard") d = rel >= 1 ? -1 : -2; // struggling above your stage is expected
    else d = rel >= 0 ? -0.5 : 0;
    delta[loc.skill] = (delta[loc.skill] ?? 0) + d;
  }

  const nextMastery = { ...mastery };
  const nextProgress = { ...progress };
  const masteryChanges: MasteryChange[] = [];
  const suggestions: StageSuggestion[] = [];
  const nowISO = now.toISOString();

  for (const skill of Object.keys(delta) as StagedSkillKey[]) {
    const d = delta[skill] ?? 0;
    if (d === 0) continue;
    const prev = nextProgress[skill] ?? { score: 0 };
    let score = prev.score + d;
    const current = (nextMastery[skill] ?? DEFAULT_MASTERY) as SkillMastery;
    const stage = (skills as unknown as Record<string, string>)[skill] ?? "none";
    const order = STAGE_ORDER[skill] ?? [];
    const idx = order.indexOf(stage);
    const snoozed = prev.snoozeUntil && prev.snoozeUntil > nowISO;

    if (score >= SKILL_SCORE_STEP) {
      if (current < 5 && stage !== "none") {
        const to = (current + 1) as SkillMastery;
        nextMastery[skill] = to;
        masteryChanges.push({ skill, from: current, to });
        score = 0;
      } else {
        score = SKILL_SCORE_STEP; // hold at the threshold until the athlete decides
        if (idx >= 0 && idx < order.length - 1 && !snoozed) {
          suggestions.push({ skill, direction: "up", fromStage: stage, toStage: order[idx + 1] });
        }
      }
    } else if (score <= -SKILL_SCORE_STEP) {
      if (current > 1 && stage !== "none") {
        const to = (current - 1) as SkillMastery;
        nextMastery[skill] = to;
        masteryChanges.push({ skill, from: current, to });
        score = 0;
      } else {
        score = -SKILL_SCORE_STEP;
        if (idx > 0 && !snoozed) {
          suggestions.push({ skill, direction: "down", fromStage: stage, toStage: order[idx - 1] });
        }
      }
    }
    nextProgress[skill] = { ...prev, score };
  }

  return { mastery: nextMastery, progress: nextProgress, masteryChanges, suggestions };
}

// The athlete accepted a suggestion: move the stage, reset that skill's
// signal, and start the new stage at a modest mastery.
export function acceptStageSuggestion(
  skills: SkillProfile,
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>,
  progress: Partial<Record<StagedSkillKey, SkillProgress>>,
  s: StageSuggestion
) {
  return {
    skills: { ...skills, [s.skill]: s.toStage } as SkillProfile,
    mastery: { ...mastery, [s.skill]: (s.direction === "up" ? 2 : 4) as SkillMastery },
    progress: { ...progress, [s.skill]: { score: 0 } },
  };
}

export function snoozeStageSuggestion(
  progress: Partial<Record<StagedSkillKey, SkillProgress>>,
  s: StageSuggestion,
  now: Date = new Date()
): Partial<Record<StagedSkillKey, SkillProgress>> {
  const until = new Date(now.getTime() + SNOOZE_DAYS * 86400000).toISOString();
  return { ...progress, [s.skill]: { score: 0, snoozeUntil: until } };
}

export function describeSuggestion(s: StageSuggestion): string {
  const name = SKILL_FIELD_LABEL[s.skill];
  return s.direction === "up"
    ? `You've been consistently completing your ${name} work. Ready to move from ${STAGE_LABEL[s.fromStage] ?? s.fromStage} to ${STAGE_LABEL[s.toStage] ?? s.toStage}?`
    : `${name} at ${STAGE_LABEL[s.fromStage] ?? s.fromStage} has been a struggle lately. Step back to ${STAGE_LABEL[s.toStage] ?? s.toStage} for a while to build it properly?`;
}
