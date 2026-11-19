import { SkillMastery, SkillProfile, SkillTrack, StagedSkillKey, DEFAULT_MASTERY, ClaimKey, SkillClaim } from "./types";
import { STAGE_ORDER } from "./stageOrder";
import { LEVEL_PATH, PathNode, levelForSkillStage } from "./levelPath";

// ---------------------------------------------------------------------------
// What to work toward next: the skill tree's pinned "Up next" and the trophy
// road's next milestones.
// ---------------------------------------------------------------------------

const GOAL_SKILL: Partial<Record<SkillTrack, StagedSkillKey>> = {
  frontLever: "frontLever",
  backLever: "backLever",
  planche: "planche",
  muscleUp: "muscleUp",
  handstand: "handstand",
  humanFlag: "humanFlag",
  legs: "pistolSquat",
  core: "lSit",
};

export interface NextUnlock {
  skill: StagedSkillKey;
  fromStage: string;
  toStage: string;
  mastery: SkillMastery; // on the current stage — how close the next one is
  requiredLevel: number; // roughly where the next stage sits on the trophy road
  isGoal: boolean;
  verified: boolean; // the current stage has been proven in training
  unconfirmed: boolean; // a Skill Check on the current stage was missed — prove it first
}

// Ranks the next stage of every skill: the one the athlete is closest to
// first, then what sits nearest their level on the trophy road.
//   closeness = mastery on the current stage, plus a bonus when that stage
//               is verified and a penalty when its Skill Check was missed
//               (prove what you have before reaching for the next stage)
//   road      = how far the next stage sits above the athlete's level
// Goals are a nudge (worth about one mastery step), not an override.
// Started skills come before untouched ones; athletes who haven't started
// anything get reachable first stages.
export function nextUnlocks(
  skills: SkillProfile,
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>,
  goals: SkillTrack[],
  claims: Partial<Record<ClaimKey, SkillClaim>> | undefined,
  playerLevel: number,
  count = 3
): NextUnlock[] {
  const goalSkills = new Set(goals.map((g) => GOAL_SKILL[g]).filter(Boolean) as StagedSkillKey[]);
  const rec = skills as unknown as Record<string, string>;
  const options: (NextUnlock & { score: number })[] = [];

  for (const skill of Object.keys(STAGE_ORDER) as StagedSkillKey[]) {
    const order = STAGE_ORDER[skill];
    const stage = rec[skill] ?? "none";
    const idx = order.indexOf(stage);
    if (idx < 0 || idx >= order.length - 1) continue; // unknown or already at the top
    const started = stage !== "none";
    const isGoal = goalSkills.has(skill);
    const toStage = order[idx + 1];
    const requiredLevel = levelForSkillStage(skill, toStage);
    const m = (mastery[skill] ?? DEFAULT_MASTERY) as SkillMastery;
    // started skills and goals are what "next" means; untouched skills only
    // when they're within reach of the athlete's level
    if (!started && !isGoal && requiredLevel > playerLevel + 3) continue;
    const status = claims?.[skill]?.status;
    const verified = started && status === "verified";
    const unconfirmed = started && status === "unconfirmed";
    const closeness = started ? m * 8 + (verified ? 12 : 0) - (unconfirmed ? 16 : 0) : 0;
    const road = -Math.max(0, requiredLevel - playerLevel) * 2;
    const score = (started ? 40 : -requiredLevel * 0.1) + closeness + road + (isGoal ? 8 : 0);
    options.push({
      skill,
      fromStage: stage,
      toStage,
      mastery: m,
      requiredLevel,
      isGoal,
      verified,
      unconfirmed,
      score,
    });
  }
  return options
    .sort((a, b) => b.score - a.score || a.requiredLevel - b.requiredLevel)
    .slice(0, count)
    .map(({ score: _score, ...u }) => u);
}

// The next few trophy-road nodes above the athlete's level.
export function nextMilestones(playerLevel: number, count = 3): PathNode[] {
  return LEVEL_PATH.filter((n) => n.level > playerLevel)
    .sort((a, b) => a.level - b.level)
    .slice(0, count);
}

export type StageState = "done" | "current" | "next" | "locked";

export function stageStates(skill: StagedSkillKey, stage: string): { stage: string; state: StageState; requiredLevel: number }[] {
  const order = STAGE_ORDER[skill] ?? [];
  const idx = order.indexOf(stage);
  return order
    .filter((s) => s !== "none")
    .map((s) => {
      const i = order.indexOf(s);
      const state: StageState = i < idx ? "done" : i === idx ? "current" : i === idx + 1 ? "next" : "locked";
      return { stage: s, state, requiredLevel: levelForSkillStage(skill, s) };
    });
}
