import type { ExerciseFeedback, TrainingSession } from "./types";
import { exerciseEffort, stepsOf, totalEffort } from "./effort";

// ---------------------------------------------------------------------------
// XP comes from the training you actually do — the level is experience only.
//
//   15 for logging a session
//   + 4 per effort point of what you did (effort.ts: sets × difficulty ×
//     load, so harder skills and exercises earn more; only the sets you
//     did count; skipped and too-hard exercises earn nothing)
//   + 40 per skill proven in a Skill Check, + 10 per personal record
//   + 75 when you step up to a new stage (awarded when you accept)
// Declaring skills in the assessment earns nothing.
// ---------------------------------------------------------------------------

export const XP_RULES = { session: 15, perEffort: 4, verified: 40, record: 10, stageUp: 75 } as const;

// What a session is worth if you do all of it (shown before you start).
export function plannedXp(session: TrainingSession): number {
  return XP_RULES.session + Math.round(totalEffort(stepsOf(session)) * XP_RULES.perEffort);
}

export interface EarnedXp {
  total: number;
  work: number;
  bonus: number;
}

export function earnedXp(
  session: TrainingSession,
  feedback: ExerciseFeedback[],
  extras: { verified: number; records: number }
): EarnedXp {
  let effort = 0;
  if (feedback.length === 0) {
    effort = totalEffort(stepsOf(session)); // logged without per-exercise detail
  } else {
    // one entry per exercise done (a "too hard" press and its easier swap
    // both show up in feedback; only the done one earns)
    const seen = new Set<string>();
    for (const f of feedback) {
      if (f.outcome !== "done") continue;
      const key = `${f.setTitle}|${f.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const detail = f.detail ?? stepsOf(session).find((s) => s.exercise.name === f.name)?.exercise.detail ?? "";
      effort += exerciseEffort({ name: f.name, detail }, f.setTitle, f.setsDone);
    }
  }
  const work = Math.round(effort * XP_RULES.perEffort);
  const bonus = extras.verified * XP_RULES.verified + extras.records * XP_RULES.record;
  return { total: XP_RULES.session + work + bonus, work, bonus };
}
