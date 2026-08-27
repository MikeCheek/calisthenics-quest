import { StagedSkillKey, SkillMastery, SkillProfile } from "./types";
import { levelForSkillStage, LEVEL_PATH } from "./levelPath";

export interface DiagnosticQuestion {
  id: string;
  text: string;
  skill: StagedSkillKey;
  stage: string;
}

// A concrete, checkable yes/no per question — never "are you flexible?",
// always "can you do this specific thing?" — spanning the full range from
// foundational to elite, so the adaptive engine below has real material to
// bisect through at any starting guess.
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  { id: "q_wall_hs", text: "Can you hold a wall handstand for 20+ seconds?", skill: "handstand", stage: "wall" },
  { id: "q_tuck_lsit", text: "Can you hold a tuck L-sit (knees bent, feet off the ground) for 5+ seconds?", skill: "lSit", stage: "tuck" },
  { id: "q_bridge", text: "Can you hold a full bridge (hands and feet on the floor, chest open) for a few seconds?", skill: "bridge", stage: "developing" },
  { id: "q_side_plank", text: "Can you hold a full side plank (straight body, hips lifted) for 20+ seconds?", skill: "sidePlank", stage: "developing" },
  { id: "q_pistol_neg", text: "Can you lower into a single-leg squat slowly and with control, even if you can't stand back up (a pistol negative)?", skill: "pistolSquat", stage: "negative" },
  { id: "q_german_hang", text: "Can you hang in a German hang (arms overhead, shoulders stretched) for a few seconds, even briefly?", skill: "germanHang", stage: "assisted" },
  { id: "q_knee_raise", text: "Can you do hanging knee raises (knees to chest) from a bar?", skill: "toesToBar", stage: "assisted" },
  { id: "q_band_mu", text: "Have you attempted a band-assisted muscle-up?", skill: "muscleUp", stage: "band" },

  { id: "q_tuck_fl", text: "Can you hold a tuck front lever for 5+ seconds?", skill: "frontLever", stage: "tuck" },
  { id: "q_tuck_bl", text: "Can you hold a tuck back lever for 5+ seconds?", skill: "backLever", stage: "tuck" },
  { id: "q_tuck_planche", text: "Can you hold a tuck planche for 5+ seconds?", skill: "planche", stage: "tuck" },
  { id: "q_strict_mu", text: "Can you do a strict muscle-up — no kip, no swing?", skill: "muscleUp", stage: "single" },
  { id: "q_free_hs", text: "Can you hold a freestanding handstand (no wall) for 10+ seconds?", skill: "handstand", stage: "freestanding" },
  { id: "q_full_pistol", text: "Can you do a full, unassisted pistol squat on one leg?", skill: "pistolSquat", stage: "full" },
  { id: "q_wide_pullup", text: "Can you do a few wide-grip pull-ups with good form?", skill: "wideGripPullUp", stage: "developing" },
  { id: "q_tuck_dragon", text: "Can you do a tuck dragon flag with control?", skill: "dragonFlag", stage: "tuck" },

  { id: "q_straddle_fl", text: "Can you hold a straddle front lever for 5+ seconds?", skill: "frontLever", stage: "straddle" },
  { id: "q_straddle_planche", text: "Can you hold a straddle planche for 5+ seconds?", skill: "planche", stage: "straddle" },
  { id: "q_ring_mu", text: "Can you do a strict muscle-up on rings?", skill: "ringMuscleUp", stage: "developing" },
  { id: "q_assisted_oapu", text: "Can you do an assisted one-arm pull-up (band or a real controlled negative)?", skill: "oneArmPullUp", stage: "assisted" },
  { id: "q_wall_hspu", text: "Can you do a handstand push-up against the wall through full range?", skill: "handstandPushUp", stage: "wallFull" },
  { id: "q_multi_mu", text: "Can you do 3 or more strict muscle-ups in a row?", skill: "muscleUp", stage: "multiple" },
  { id: "q_ring_support", text: "Can you hold a ring support hold (arms straight, body upright on rings) for 10+ seconds?", skill: "ironCross", stage: "support" },
  { id: "q_full_dragon", text: "Can you do a dragon flag with straight, together legs (not tucked)?", skill: "dragonFlag", stage: "full" },

  { id: "q_full_fl", text: "Can you hold a full front lever for 5+ seconds?", skill: "frontLever", stage: "full" },
  { id: "q_full_planche", text: "Can you hold a full planche for 5+ seconds?", skill: "planche", stage: "full" },
  { id: "q_full_oapu", text: "Can you do a strict one-arm pull-up, dead hang to chin over the bar?", skill: "oneArmPullUp", stage: "full" },
  { id: "q_free_oah", text: "Can you hold a freestanding one-arm handstand?", skill: "oneArmHandstand", stage: "full" },
  { id: "q_full_cross", text: "Can you hold an iron cross for 5+ seconds?", skill: "ironCross", stage: "full" },
  { id: "q_tuck_maltese", text: "Can you hold a tuck maltese on rings?", skill: "maltese", stage: "tuck" },
  { id: "q_multi_oapu", text: "Can you do multiple strict one-arm push-ups?", skill: "oneArmPushUp", stage: "full" },
  { id: "q_full_manna", text: "Can you hold a full manna?", skill: "manna", stage: "full" },
];

export interface ScoredQuestion extends DiagnosticQuestion {
  difficulty: number; // the trophy road's level for this exact (skill, stage)
}

// Every question's difficulty is the same number the trophy road already
// uses for that skill+stage — one source of truth, so the adaptive engine
// below and the level the road eventually shows can't drift apart.
export const SCORED_QUESTIONS: ScoredQuestion[] = DIAGNOSTIC_QUESTIONS.map((q) => ({
  ...q,
  difficulty: levelForSkillStage(q.skill, q.stage),
})).sort((a, b) => a.difficulty - b.difficulty);

const MAX_LEVEL = Math.max(...LEVEL_PATH.map((n) => n.level));
const CONVERGENCE_WINDOW = 8; // stop once the bracket is this tight
const MAX_QUESTIONS = 12; // safety cap — convergence almost always ends it sooner

export interface QuizState {
  answers: Record<string, boolean>;
  askedIds: string[];
}

export const EMPTY_QUIZ_STATE: QuizState = { answers: {}, askedIds: [] };

// The current [low, high] bracket implied by everything answered so far —
// low is the highest difficulty confirmed reachable, high is the lowest
// difficulty confirmed out of reach. Recomputed fresh from history each
// time rather than tracked as separate state, so it's always consistent
// with whatever's actually been answered.
export function currentBracket(state: QuizState): { low: number; high: number } {
  let low = 1;
  let high = MAX_LEVEL + 1;
  for (const id of state.askedIds) {
    const q = SCORED_QUESTIONS.find((x) => x.id === id);
    if (!q) continue;
    if (state.answers[id]) low = Math.max(low, q.difficulty);
    else high = Math.min(high, q.difficulty);
  }
  return { low, high };
}

// Picks the next question to ask, or null when the quiz has enough
// information to stop. The first question is the easiest in the whole
// pool, the second is the hardest — bracketing the full range immediately
// — before switching to picking whichever remaining question sits closest
// to the midpoint of the current bracket (bisection). Stops as soon as the
// bracket narrows below the convergence window, or the pool runs out, or a
// safety cap is hit — never a fixed question count.
export function nextQuestion(state: QuizState): ScoredQuestion | null {
  const remaining = SCORED_QUESTIONS.filter((q) => !state.askedIds.includes(q.id));
  if (remaining.length === 0) return null;
  if (state.askedIds.length >= MAX_QUESTIONS) return null;

  if (state.askedIds.length === 0) return remaining[0]; // easiest
  if (state.askedIds.length === 1) return remaining[remaining.length - 1]; // hardest

  const { low, high } = currentBracket(state);
  if (high - low <= CONVERGENCE_WINDOW) return null; // converged

  const mid = (low + high) / 2;
  let best = remaining[0];
  let bestDist = Math.abs(best.difficulty - mid);
  for (const q of remaining) {
    const dist = Math.abs(q.difficulty - mid);
    if (dist < bestDist) {
      best = q;
      bestDist = dist;
    }
  }
  return best;
}

export function isConverged(state: QuizState): boolean {
  return nextQuestion(state) === null;
}

const QUIZ_MASTERY: SkillMastery = 4;

// Folds every "yes" answer into skill+mastery updates. A "yes" sets that
// stage at a solid-but-not-maxed mastery; a "no" (or unanswered) leaves the
// skill exactly as it was — this never downgrades anything.
export function applyQuizAnswers(
  skills: SkillProfile,
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>,
  state: QuizState
): { skills: SkillProfile; mastery: Partial<Record<StagedSkillKey, SkillMastery>> } {
  const nextSkills = { ...skills };
  const nextMastery = { ...mastery };
  for (const id of state.askedIds) {
    if (!state.answers[id]) continue;
    const q = SCORED_QUESTIONS.find((x) => x.id === id);
    if (!q) continue;
    (nextSkills as Record<string, unknown>)[q.skill] = q.stage;
    nextMastery[q.skill] = QUIZ_MASTERY;
  }
  return { skills: nextSkills, mastery: nextMastery };
}
