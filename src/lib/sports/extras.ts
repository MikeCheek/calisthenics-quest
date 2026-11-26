import { xpRules } from "../sessionXp";
import { newTrack } from "./index";
import { MASTERY_MAX, type SportBlock, type SportDef, type SportTrack } from "./types";

// ---------------------------------------------------------------------------
// What yoga and Pilates add on top of sessions, like calisthenics has:
// counting stage-ups (for achievements), a stage check that moves a skill
// up once it's nearly mastered, training blocks toward a stage, and the road
// of every stage. Pure functions: the screens save what these return.
// ---------------------------------------------------------------------------

// where each skill started (from the experience chosen when the sport began)
export const startStages = (def: SportDef, track: SportTrack): Record<string, number> => newTrack(def, track.experience, []).stage;

// stages gained since starting the sport, all skills together
export function sportStageUps(def: SportDef, track: SportTrack): number {
  const start = startStages(def, track);
  return def.skills.reduce((n, sk) => n + Math.max(0, (track.stage[sk.key] ?? 0) - (start[sk.key] ?? 0)), 0);
}

// skills at their last stage
export const fullSkills = (def: SportDef, track: SportTrack): number =>
  def.skills.filter((sk) => (track.stage[sk.key] ?? 0) >= sk.stages.length - 1).length;

// ---- stage check ----

// Once a stage is nearly mastered (4 of 5), doing its main exercise cleanly
// proves it: the skill moves up without waiting for more sessions.
export const STAGE_CHECK_FROM = 4;

export function canCheckStage(def: SportDef, track: SportTrack, skill: string): boolean {
  const sk = def.skills.find((s) => s.key === skill);
  if (!sk) return false;
  return (track.stage[skill] ?? 0) < sk.stages.length - 1 && (track.mastery[skill] ?? 0) >= STAGE_CHECK_FROM;
}

// Passed: up a stage (mastery back to 2.5, as after any stage-up), with the
// stage-up XP; a block on this skill may complete.
export function passStageCheck(def: SportDef, track: SportTrack, skill: string, now = new Date()): { track: SportTrack; xp: number } {
  if (!canCheckStage(def, track, skill)) return { track, xp: 0 };
  const xp = xpRules().stageUp;
  const next: SportTrack = {
    ...track,
    stage: { ...track.stage, [skill]: (track.stage[skill] ?? 0) + 1 },
    mastery: { ...track.mastery, [skill]: 2.5 },
    xp: (track.xp ?? 0) + xp,
  };
  return { track: settleBlock(next, now), xp };
}

// ---- training blocks ----

export const BLOCK_WEEKS = [2, 4, 6] as const;

export function startBlock(def: SportDef, track: SportTrack, skill: string, weeks: number, now = new Date()): SportTrack {
  const sk = def.skills.find((s) => s.key === skill);
  if (!sk) return track;
  const target = Math.min((track.stage[skill] ?? 0) + 1, sk.stages.length - 1);
  return { ...track, block: { skill, target, startISO: now.toISOString(), weeks } };
}

export const stopBlock = (track: SportTrack): SportTrack => {
  const { block: _b, ...rest } = track;
  return rest;
};

export interface BlockStatus {
  block: SportBlock;
  week: number; // 1-based, capped at the block's length
  weeks: number;
  daysLeft: number;
  overdue: boolean;
}

export function blockStatus(track: SportTrack, now = new Date()): BlockStatus | null {
  const b = track.block;
  if (!b) return null;
  const days = Math.floor((now.getTime() - new Date(b.startISO).getTime()) / 86400000);
  const total = b.weeks * 7;
  return { block: b, week: Math.min(b.weeks, Math.floor(days / 7) + 1), weeks: b.weeks, daysLeft: Math.max(0, total - days), overdue: days >= total };
}

// A block whose skill has reached its target is done: counted, and cleared.
// (Run after anything that can move a stage: sessions and stage checks.)
export function settleBlock(track: SportTrack, _now = new Date()): SportTrack {
  const b = track.block;
  if (!b || (track.stage[b.skill] ?? 0) < b.target) return track;
  return { ...stopBlock(track), blocksReached: (track.blocksReached ?? 0) + 1 };
}

// ---- the road: every stage of every skill, by tier ----

export interface RoadTier {
  tier: number; // stage index
  nodes: { skill: string; skillName: string; label: string; reached: boolean; current: boolean }[];
}

export function sportRoad(def: SportDef, track: SportTrack): RoadTier[] {
  const tiers = Math.max(...def.skills.map((s) => s.stages.length));
  return Array.from({ length: tiers }, (_, tier) => ({
    tier,
    nodes: def.skills
      .filter((sk) => sk.stages[tier])
      .map((sk) => {
        const at = track.stage[sk.key] ?? 0;
        return { skill: sk.key, skillName: sk.name, label: sk.stages[tier].label, reached: at >= tier, current: at === tier };
      }),
  }));
}

export { MASTERY_MAX };
