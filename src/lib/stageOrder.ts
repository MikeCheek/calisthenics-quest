import { SkillProfile } from "./types";

// Ordered from easiest to hardest for each staged skill. Shared so the
// radar chart and the difficulty wheel agree on what "one stage easier /
// harder than your level" means.
export const STAGE_ORDER: Record<string, string[]> = {
  frontLever: ["none", "tuck", "advancedTuck", "oneLeg", "straddle", "full"],
  backLever: ["none", "tuck", "advancedTuck", "straddle", "full"],
  planche: ["none", "tuck", "advancedTuck", "straddle", "full"],
  muscleUp: ["none", "band", "single", "multiple"],
  handstand: ["none", "wall", "freestanding"],
  humanFlag: ["none", "tuck", "straddle", "full"],
  pistolSquat: ["none", "assisted", "full"],
  lSit: ["none", "tuck", "advanced", "full"],
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
