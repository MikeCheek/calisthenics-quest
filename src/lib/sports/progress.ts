import type { ExerciseFeedback, PersonalRecord } from "../types";
import { applyExerciseFeedback } from "../adaptation";
import { detectRecords, recordLastTimes } from "../sessionHistory";
import { locate } from "./index";
import { MASTERY_MAX, type SportDef, type SportTrack } from "./types";

// ---------------------------------------------------------------------------
// What a session does to your progress in a sport. Each skill has a stage
// and a mastery of it (1–5): an exercise of that skill done well adds half a
// point, one that was too hard takes a point off. Reaching 5 moves you up to
// the next stage (back to 2.5 there). Exercise history and records work as
// they do for calisthenics, kept per sport.
// ---------------------------------------------------------------------------

export interface StageUp {
  skill: string; // skill name
  from: string; // stage labels
  to: string;
}

export function applySportSession(
  def: SportDef,
  track: SportTrack,
  feedback: ExerciseFeedback[],
  now = new Date(),
): { track: SportTrack; stageUps: StageUp[]; newRecords: PersonalRecord[] } {
  const nowISO = now.toISOString();
  const exerciseStats = recordLastTimes(
    applyExerciseFeedback(track.exerciseStats ?? {}, feedback, nowISO),
    feedback,
    nowISO,
  );
  const { records, newRecords } = detectRecords(
    track.records ?? {},
    feedback,
    nowISO,
  );
  const mastery = { ...track.mastery };
  const stage = { ...track.stage };
  const touched = new Set<string>();
  for (const f of feedback) {
    if (f.setTitle === "Warm-Up" || f.setTitle === "Cool-Down") continue;
    const at = locate(def, f.name);
    if (!at) continue;
    // only the current stage counts toward moving up (a step-back exercise doesn't)
    if (at.stage !== (stage[at.skill] ?? 0) && f.outcome === "done") continue;
    const m = mastery[at.skill] ?? 2;
    if (f.outcome === "done")
      mastery[at.skill] = Math.min(MASTERY_MAX, m + 0.5);
    else if (f.outcome === "tooHard") mastery[at.skill] = Math.max(1, m - 1);
    touched.add(at.skill);
  }
  const stageUps: StageUp[] = [];
  for (const key of touched) {
    const sk = def.skills.find((s) => s.key === key)!;
    const i = stage[key] ?? 0;
    if ((mastery[key] ?? 0) >= MASTERY_MAX && i < sk.stages.length - 1) {
      stage[key] = i + 1;
      mastery[key] = 2.5;
      stageUps.push({
        skill: sk.name,
        from: sk.stages[i].label,
        to: sk.stages[i + 1].label,
      });
    }
  }
  return {
    track: {
      ...track,
      exerciseStats,
      records,
      mastery,
      stage,
      sessions: (track.sessions ?? 0) + 1,
      lastSessionISO: nowISO,
    },
    stageUps,
    newRecords,
  };
}
