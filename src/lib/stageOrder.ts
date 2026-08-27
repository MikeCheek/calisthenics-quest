import { SkillProfile } from "./types";

// Ordered from easiest to hardest for each staged skill. Shared so the
// radar chart, onboarding, and the difficulty wheel all agree on what "one
// stage easier / harder than your level" means. Keys match SkillProfile's
// staged fields exactly (StagedSkillKey in types.ts).
export const STAGE_ORDER: Record<string, string[]> = {
  frontLever: ["none", "tuck", "advancedTuck", "oneLeg", "straddle", "full"],
  backLever: ["none", "tuck", "advancedTuck", "oneLeg", "straddle", "full"],
  planche: ["none", "tuck", "advancedTuck", "straddle", "full"],
  muscleUp: ["none", "band", "single", "multiple"],
  handstand: ["none", "wall", "freestanding"],
  humanFlag: ["none", "tuck", "advancedTuck", "straddle", "full"],
  pistolSquat: ["none", "negative", "assisted", "full"],
  lSit: ["none", "tuck", "advanced", "full"],
  ironCross: ["none", "support", "tuckCross", "full"],
  maltese: ["none", "tuck", "straddle", "full"],
  oneArmPullUp: ["none", "assisted", "negative", "full"],
  oneArmHandstand: ["none", "wall", "freestandingAttempts", "full"],
  dragonFlag: ["none", "tuck", "straddle", "full"],
  elbowLever: ["none", "tuck", "straddle", "full"],
  oneArmPushUp: ["none", "assisted", "negative", "full"],
  nordicCurl: ["none", "assisted", "negative", "full"],
  shrimpSquat: ["none", "assisted", "full"],
  handstandPushUp: ["none", "negative", "wallFull", "freestanding"],
  impossibleDip: ["none", "band", "negative", "full"],
  manna: ["none", "vSit", "straddle", "full"],
  // 30 more skills — simple (none/developing/full)
  clapPushUp: ["none", "developing", "full"],
  kipUp: ["none", "developing", "full"],
  backFlip: ["none", "developing", "full"],
  frontFlip: ["none", "developing", "full"],
  windmill: ["none", "developing", "full"],
  aroundTheWorld: ["none", "developing", "full"],
  handstandWalk: ["none", "developing", "full"],
  wallWalk: ["none", "developing", "full"],
  supermanHold: ["none", "developing", "full"],
  sidePlank: ["none", "developing", "full"],
  copenhagenPlank: ["none", "developing", "full"],
  bridge: ["none", "developing", "full"],
  turkishGetUp: ["none", "developing", "full"],
  pikePress: ["none", "developing", "full"],
  ropeClimb: ["none", "developing", "full"],
  // 30 more skills — assisted (none/assisted/developing/full)
  skinTheCat: ["none", "assisted", "developing", "full"],
  germanHang: ["none", "assisted", "developing", "full"],
  chestToBarPullUp: ["none", "assisted", "developing", "full"],
  wideGripPullUp: ["none", "assisted", "developing", "full"],
  ringMuscleUp: ["none", "assisted", "developing", "full"],
  ninetyDegreePushUp: ["none", "assisted", "developing", "full"],
  jumpPistol: ["none", "assisted", "developing", "full"],
  sissySquat: ["none", "assisted", "developing", "full"],
  cossackSquat: ["none", "assisted", "developing", "full"],
  flagPullUp: ["none", "assisted", "developing", "full"],
  lSitPullUp: ["none", "assisted", "developing", "full"],
  typewriterPullUp: ["none", "assisted", "developing", "full"],
  toesToBar: ["none", "assisted", "developing", "full"],
  invertedCross: ["none", "assisted", "developing", "full"],
  victorianCross: ["none", "assisted", "developing", "full"],
};

export function stageIndex(skillKey: keyof SkillProfile, stage: string): number {
  const order = STAGE_ORDER[skillKey as string];
  if (!order) return 0;
  const idx = order.indexOf(stage);
  return idx < 0 ? 0 : idx;
}

// Clamped stage `offset` steps away from the given stage (negative = easier,
// positive = harder), for the same skill's ordering.
export function stageAtOffset(skillKey: keyof SkillProfile, stage: string, offset: number): string {
  const order = STAGE_ORDER[skillKey as string];
  if (!order) return stage;
  const idx = Math.min(order.length - 1, Math.max(0, stageIndex(skillKey, stage) + offset));
  return order[idx];
}

// Friendly display label for a stage value — shared across every skill
// that uses that stage name, so onboarding, the profile list, and the
// wheel all show the same wording.
export const STAGE_LABEL: Record<string, string> = {
  none: "Not started",
  negative: "Negative",
  support: "Support hold",
  vSit: "V-sit",
  tuck: "Tuck",
  developing: "Developing",
  band: "Band-assisted",
  wall: "Wall-assisted",
  assisted: "Assisted",
  advancedTuck: "Adv. tuck",
  single: "A few strict",
  tuckCross: "Tuck cross",
  wallFull: "Wall (full ROM)",
  advanced: "One-leg ext.",
  oneLeg: "One leg",
  freestandingAttempts: "Freestanding attempts",
  straddle: "Straddle",
  freestanding: "Freestanding",
  multiple: "Multiple",
  full: "Full",
};
