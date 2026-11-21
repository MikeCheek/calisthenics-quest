import type { SessionRecord, SkillMastery, SkillProfile, SkillProgress, StagedSkillKey, UserDoc } from "./types";
import { DEFAULT_MASTERY } from "./types";
import { STAGE_ORDER, stageIndex } from "./stageOrder";
import { exerciseStage } from "./exerciseHierarchy";
import { SKILL_SCORE_STEP } from "./adaptation";

// ---------------------------------------------------------------------------
// "Next stage in about N weeks": how far a skill still has to go, at the
// pace the last few weeks of training set.
//
// The app moves a skill on with a score (adaptation.ts): good sessions add
// to it, "too hard" and skips take away, and every SKILL_SCORE_STEP points
// raise the mastery one notch (Attempted … Mastered); at Mastered it
// suggests the next stage, which starts again at "Touched it".
// - Points still needed = the notches left to Mastered, plus one more step
//   for the suggestion, minus what's already on the score.
// - Pace = the points the last six weeks of sessions earned for that skill,
//   recomputed with the same rules, per week.
// - Every stage after the next one takes 30% longer than the one before:
//   harder stages come slower.
// ---------------------------------------------------------------------------

export const PACE_WEEKS = 6;
const SLOWDOWN = 1.3;
const NEW_STAGE_MASTERY = 2;

// points one session's exercises earned for each skill (same rules as
// applySkillFeedback, against today's stage)
export function sessionPoints(skills: SkillProfile, session: Pick<SessionRecord, "exercises">): Partial<Record<StagedSkillKey, number>> {
  const out: Partial<Record<StagedSkillKey, number>> = {};
  for (const e of session.exercises ?? []) {
    if (/^(warm-?up|final hits)$/i.test(e.setTitle ?? "") || /^skill check:/i.test(e.name)) continue;
    const loc = exerciseStage(e.name);
    if (!loc) continue;
    const user = (skills as unknown as Record<string, string>)[loc.skill] ?? "none";
    const rel = stageIndex(loc.skill, loc.stage) - stageIndex(loc.skill, user);
    let d = 0;
    if (e.outcome === "done" && e.setsDone === undefined) d = rel >= 1 ? 2 : rel === 0 ? 1 : 0;
    else if (e.outcome === "tooHard") d = rel >= 1 ? -1 : -2;
    else if (e.outcome === "skipped") d = rel >= 0 ? -0.5 : 0;
    out[loc.skill as StagedSkillKey] = (out[loc.skill as StagedSkillKey] ?? 0) + d;
  }
  return out;
}

// points per week for each skill over the last PACE_WEEKS
export function skillPace(skills: SkillProfile, sessions: Pick<SessionRecord, "finishedAt" | "exercises">[], now = new Date()) {
  const since = new Date(now.getTime() - PACE_WEEKS * 7 * 86400000).toISOString();
  const total: Partial<Record<StagedSkillKey, number>> = {};
  for (const s of sessions) {
    if (s.finishedAt < since) continue;
    for (const [k, v] of Object.entries(sessionPoints(skills, s)) as [StagedSkillKey, number][]) total[k] = (total[k] ?? 0) + v;
  }
  return Object.fromEntries(Object.entries(total).map(([k, v]) => [k, (v ?? 0) / PACE_WEEKS])) as Partial<Record<StagedSkillKey, number>>;
}

// points still needed for the next stage
export function pointsToNextStage(mastery: SkillMastery, progress?: SkillProgress) {
  const notches = 5 - mastery;
  return Math.max(0, notches * SKILL_SCORE_STEP + SKILL_SCORE_STEP - Math.max(0, progress?.score ?? 0));
}

export interface StageEta {
  stage: string;
  weeks: number; // central estimate
  low: number;
  high: number;
}

export interface SkillTimeline {
  skill: StagedSkillKey;
  current: string;
  pace: number; // points a week
  next: StageEta[]; // the next one or two stages
}

export function skillTimeline(
  user: Pick<UserDoc, "skills" | "skillMastery" | "skillProgress">,
  sessions: Pick<SessionRecord, "finishedAt" | "exercises">[],
  now = new Date()
): SkillTimeline[] {
  const pace = skillPace(user.skills, sessions, now);
  const out: SkillTimeline[] = [];
  for (const [skill, p] of Object.entries(pace) as [StagedSkillKey, number][]) {
    if (!(p > 0)) continue;
    const order = STAGE_ORDER[skill] ?? [];
    const current = (user.skills as unknown as Record<string, string>)[skill] ?? "none";
    const idx = order.indexOf(current);
    if (idx < 0 || idx >= order.length - 1) continue;
    const mastery = (user.skillMastery?.[skill] ?? DEFAULT_MASTERY) as SkillMastery;
    let weeks = pointsToNextStage(mastery, user.skillProgress?.[skill]) / p;
    const next: StageEta[] = [];
    for (let k = 1; k <= 2 && idx + k < order.length; k++) {
      if (k > 1) weeks += (pointsToNextStage(NEW_STAGE_MASTERY as SkillMastery) / p) * Math.pow(SLOWDOWN, k - 1);
      next.push({ stage: order[idx + k], weeks, low: weeks * 0.7, high: weeks * 1.4 });
    }
    out.push({ skill, current, pace: p, next });
  }
  return out.sort((a, b) => a.next[0].weeks - b.next[0].weeks);
}

// "1–2 weeks", "about 2 months", "over a year" — as data, for translation
export function etaLabel(e: Pick<StageEta, "low" | "high">): { key: string; vars: Record<string, number> } {
  const lo = Math.max(1, Math.round(e.low));
  const hi = Math.max(lo, Math.round(e.high));
  if (hi > 52) return { key: "over a year", vars: {} };
  if (hi <= 1) return { key: "this week or next", vars: {} };
  if (hi <= 10) return { key: lo === hi ? "about {n} weeks" : "{a}–{b} weeks", vars: lo === hi ? { n: lo } : { a: lo, b: hi } };
  const mlo = Math.max(1, Math.round(e.low / 4.3));
  const mhi = Math.max(mlo, Math.round(e.high / 4.3));
  return { key: mlo === mhi ? "about {n} months" : "{a}–{b} months", vars: mlo === mhi ? { n: mlo } : { a: mlo, b: mhi } };
}
