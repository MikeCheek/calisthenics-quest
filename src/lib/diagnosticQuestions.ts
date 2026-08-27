import { StagedSkillKey, SkillMastery, SkillProfile } from "./types";

export type SelfTier = "beginner" | "intermediate" | "advanced" | "expert";

export const TIER_LABEL: Record<SelfTier, string> = {
  beginner: "Just starting out",
  intermediate: "Can do a few things",
  advanced: "Can do some solid things",
  expert: "Expert / very experienced",
};

export const TIER_HINT: Record<SelfTier, string> = {
  beginner: "New to bar training, or still building the basics.",
  intermediate: "Comfortable with the basics, working on real skills.",
  advanced: "Several skills are genuinely solid, chasing the harder stuff.",
  expert: "Deep into advanced strength skills already.",
};

export interface DiagnosticQuestion {
  id: string;
  tier: SelfTier;
  text: string;
  skill: StagedSkillKey;
  stage: string;
}

// A concrete, checkable yes/no per question — never "are you flexible?",
// always "can you do this specific thing?" — so the answer maps cleanly
// onto a real skill+stage. A "yes" is recorded at mastery 4 (Consistent):
// specific enough to trust, short of claiming full mastery outright. A
// "no" simply leaves that skill wherever it already was — this is a quick
// starting point, not an exhaustive test, and is presented as such.
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ---- beginner ----
  { id: "b1", tier: "beginner", text: "Can you hold a wall handstand for 20+ seconds?", skill: "handstand", stage: "wall" },
  { id: "b2", tier: "beginner", text: "Can you hold a tuck L-sit (knees bent, feet off the ground) for 5+ seconds?", skill: "lSit", stage: "tuck" },
  { id: "b3", tier: "beginner", text: "Can you hold a full bridge (hands and feet on the floor, chest open) for a few seconds?", skill: "bridge", stage: "developing" },
  { id: "b4", tier: "beginner", text: "Can you hold a full side plank (straight body, hips lifted) for 20+ seconds?", skill: "sidePlank", stage: "developing" },
  { id: "b5", tier: "beginner", text: "Can you lower into a single-leg squat slowly and with control, even if you can't stand back up (a pistol negative)?", skill: "pistolSquat", stage: "negative" },
  { id: "b6", tier: "beginner", text: "Can you hang in a German hang (arms overhead, shoulders stretched) for a few seconds, even briefly?", skill: "germanHang", stage: "assisted" },
  { id: "b7", tier: "beginner", text: "Can you do hanging knee raises (knees to chest) from a bar?", skill: "toesToBar", stage: "assisted" },
  { id: "b8", tier: "beginner", text: "Have you attempted a band-assisted muscle-up?", skill: "muscleUp", stage: "band" },

  // ---- intermediate ----
  { id: "i1", tier: "intermediate", text: "Can you hold a tuck front lever for 5+ seconds?", skill: "frontLever", stage: "tuck" },
  { id: "i2", tier: "intermediate", text: "Can you hold a tuck back lever for 5+ seconds?", skill: "backLever", stage: "tuck" },
  { id: "i3", tier: "intermediate", text: "Can you hold a tuck planche for 5+ seconds?", skill: "planche", stage: "tuck" },
  { id: "i4", tier: "intermediate", text: "Can you do a strict muscle-up — no kip, no swing?", skill: "muscleUp", stage: "single" },
  { id: "i5", tier: "intermediate", text: "Can you hold a freestanding handstand (no wall) for 10+ seconds?", skill: "handstand", stage: "freestanding" },
  { id: "i6", tier: "intermediate", text: "Can you do a full, unassisted pistol squat on one leg?", skill: "pistolSquat", stage: "full" },
  { id: "i7", tier: "intermediate", text: "Can you do a few wide-grip pull-ups with good form?", skill: "wideGripPullUp", stage: "developing" },
  { id: "i8", tier: "intermediate", text: "Can you do a tuck dragon flag with control?", skill: "dragonFlag", stage: "tuck" },

  // ---- advanced ----
  { id: "a1", tier: "advanced", text: "Can you hold a straddle front lever for 5+ seconds?", skill: "frontLever", stage: "straddle" },
  { id: "a2", tier: "advanced", text: "Can you hold a straddle planche for 5+ seconds?", skill: "planche", stage: "straddle" },
  { id: "a3", tier: "advanced", text: "Can you do a strict muscle-up on rings?", skill: "ringMuscleUp", stage: "developing" },
  { id: "a4", tier: "advanced", text: "Can you do an assisted one-arm pull-up (band or a real controlled negative)?", skill: "oneArmPullUp", stage: "assisted" },
  { id: "a5", tier: "advanced", text: "Can you do a handstand push-up against the wall through full range?", skill: "handstandPushUp", stage: "wallFull" },
  { id: "a6", tier: "advanced", text: "Can you do 3 or more strict muscle-ups in a row?", skill: "muscleUp", stage: "multiple" },
  { id: "a7", tier: "advanced", text: "Can you hold a ring support hold (arms straight, body upright on rings) for 10+ seconds?", skill: "ironCross", stage: "support" },
  { id: "a8", tier: "advanced", text: "Can you do a dragon flag with straight, together legs (not tucked)?", skill: "dragonFlag", stage: "full" },

  // ---- expert ----
  { id: "e1", tier: "expert", text: "Can you hold a full front lever for 5+ seconds?", skill: "frontLever", stage: "full" },
  { id: "e2", tier: "expert", text: "Can you hold a full planche for 5+ seconds?", skill: "planche", stage: "full" },
  { id: "e3", tier: "expert", text: "Can you do a strict one-arm pull-up, dead hang to chin over the bar?", skill: "oneArmPullUp", stage: "full" },
  { id: "e4", tier: "expert", text: "Can you hold a freestanding one-arm handstand?", skill: "oneArmHandstand", stage: "full" },
  { id: "e5", tier: "expert", text: "Can you hold an iron cross for 5+ seconds?", skill: "ironCross", stage: "full" },
  { id: "e6", tier: "expert", text: "Can you hold a tuck maltese on rings?", skill: "maltese", stage: "tuck" },
  { id: "e7", tier: "expert", text: "Can you do multiple strict one-arm push-ups?", skill: "oneArmPushUp", stage: "full" },
  { id: "e8", tier: "expert", text: "Can you hold a full manna?", skill: "manna", stage: "full" },
];

export function questionsForTier(tier: SelfTier): DiagnosticQuestion[] {
  return DIAGNOSTIC_QUESTIONS.filter((q) => q.tier === tier);
}

const QUIZ_MASTERY: SkillMastery = 4;

// Folds a set of yes/no answers into skill+mastery updates. A "yes" sets
// that stage at a solid-but-not-maxed mastery; a "no" (or unanswered)
// leaves the skill exactly as it was — this never downgrades anything.
export function applyDiagnosticAnswers(
  skills: SkillProfile,
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>,
  tier: SelfTier,
  answers: Record<string, boolean>
): { skills: SkillProfile; mastery: Partial<Record<StagedSkillKey, SkillMastery>> } {
  const nextSkills = { ...skills };
  const nextMastery = { ...mastery };
  for (const q of questionsForTier(tier)) {
    if (answers[q.id]) {
      (nextSkills as Record<string, unknown>)[q.skill] = q.stage;
      nextMastery[q.skill] = QUIZ_MASTERY;
    }
  }
  return { skills: nextSkills, mastery: nextMastery };
}
