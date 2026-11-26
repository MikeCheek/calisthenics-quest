import { STAGE_LABEL, STAGE_ORDER } from "../stageOrder";
import { SKILL_FIELD_LABEL, type StagedSkillKey } from "../types";
import { demoFor } from "./catalog";

// The animation for a skill at a stage — the one you're on, or the first if
// you haven't started — found through the catalog by name ("Adv. tuck
// Planche" draws an advanced-tuck planche). Null for skills with no
// animation (the dynamic ones: flips, kip-up…).
export function skillDemoName(skill: StagedSkillKey, stage: string): string | null {
  const stages = (STAGE_ORDER[skill] ?? []).filter((s) => s !== "none");
  const shown = stage !== "none" && stages.includes(stage) ? stage : stages[0];
  if (!shown) return null;
  const name = `${STAGE_LABEL[shown] ?? shown} ${SKILL_FIELD_LABEL[skill]}`;
  return demoFor(name) ? name : null;
}
