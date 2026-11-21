import type { SessionRecord, SkillTrack, StagedSkillKey, TrainingEquipment, TrainingSession, UserDoc } from "./types";
import { STAGE_ORDER } from "./stageOrder";
import { pickFocus, availableFocuses } from "./trainingGenerator";
import { skillTimeline } from "./skillTimeline";
import { setsOf, withSets } from "./customSession";
import { exercisesForSkillStage } from "./exerciseHierarchy";
import { HIERARCHY_EXEMPT_SETS } from "./exerciseHierarchy";

// ---------------------------------------------------------------------------
// Training blocks: a few weeks aimed at one goal ("Straddle front lever in
// 8 weeks"). While a block runs:
// - two of every three sessions focus on its skill;
// - every 4th week is a deload (about a third fewer sets) to recover;
// - the last week is a test: try the target stage, then either move up or
//   add two weeks.
// The length comes from the skill timeline when there's a pace to go on.
// ---------------------------------------------------------------------------

export const BLOCK_SKILLS: Partial<Record<StagedSkillKey, SkillTrack>> = {
  frontLever: "frontLever",
  backLever: "backLever",
  planche: "planche",
  muscleUp: "muscleUp",
  handstand: "handstand",
  humanFlag: "humanFlag",
  lSit: "core",
  pistolSquat: "legs",
};

export const MIN_WEEKS = 4;
export const MAX_WEEKS = 12;

export interface TrainingBlock {
  id: string;
  skill: StagedSkillKey;
  fromStage: string;
  targetStage: string;
  startISO: string; // start of day the block began
  weeks: number;
  createdAt: string;
}

export interface FinishedBlock extends TrainingBlock {
  endedAt: string;
  outcome: "reached" | "stopped";
}

export type Phase = "build" | "deload" | "test";

const DAY = 86400000;

export const blockSkillsFor = (equipment: TrainingEquipment) => {
  const tracks = availableFocuses(equipment);
  return (Object.entries(BLOCK_SKILLS) as [StagedSkillKey, SkillTrack][]).filter(([, t]) => tracks.includes(t)).map(([s]) => s);
};

export const stageIdx = (skill: StagedSkillKey, stage: string) => (STAGE_ORDER[skill] ?? []).indexOf(stage);

// stages a block can aim for: the next three
export function targetsFor(skill: StagedSkillKey, current: string): string[] {
  const order = STAGE_ORDER[skill] ?? [];
  const i = Math.max(0, order.indexOf(current));
  return order.slice(i + 1, i + 4);
}

// a suggested length: the timeline's estimate when there's a pace, else
// four weeks per stage; always 4–12 weeks
export function suggestWeeks(
  user: Pick<UserDoc, "skills" | "skillMastery" | "skillProgress">,
  sessions: Pick<SessionRecord, "finishedAt" | "exercises">[],
  skill: StagedSkillKey,
  target: string,
  now = new Date()
): number {
  const current = (user.skills as unknown as Record<string, string>)[skill] ?? "none";
  const steps = Math.max(1, stageIdx(skill, target) - stageIdx(skill, current));
  const t = skillTimeline(user, sessions, now).find((r) => r.skill === skill);
  const eta = t?.next[Math.min(steps, t.next.length) - 1]?.weeks;
  const weeks = eta && Number.isFinite(eta) ? Math.ceil(eta) + 1 : steps * 4;
  return Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, weeks));
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// week of the block, 1-based (0 before it starts, > weeks after it ends)
export function blockWeek(b: Pick<TrainingBlock, "startISO">, now = new Date()): number {
  const days = Math.floor((startOfDay(now).getTime() - startOfDay(new Date(b.startISO)).getTime()) / DAY);
  return days < 0 ? 0 : Math.floor(days / 7) + 1;
}

export function phaseOf(b: Pick<TrainingBlock, "weeks">, week: number): Phase {
  if (week >= b.weeks) return "test";
  return week % 4 === 0 ? "deload" : "build";
}

// the weeks laid out, for the block's overview
export const blockOutline = (weeks: number): Phase[] => Array.from({ length: weeks }, (_, i) => phaseOf({ weeks }, i + 1));

export const isActive = (b: TrainingBlock | undefined, now = new Date()): b is TrainingBlock => {
  if (!b) return false;
  const w = blockWeek(b, now);
  return w >= 1 && w <= b.weeks;
};

export const dayOfYear = (d: Date) => Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / DAY);

// today's focus: the block's skill on two of every three days
export function focusWithBlock(date: Date, equipment: TrainingEquipment, goalTracks: SkillTrack[], block?: TrainingBlock, offset = 0): SkillTrack {
  const normal = pickFocus(date, equipment, goalTracks, offset);
  if (!isActive(block, date)) return normal;
  const track = BLOCK_SKILLS[block.skill];
  if (!track || !availableFocuses(equipment).includes(track)) return normal;
  return (dayOfYear(date) + offset) % 3 === 2 ? normal : track;
}

// deload week: about a third fewer sets (never under two) on the main work
export function applyDeload(session: TrainingSession): TrainingSession {
  return {
    ...session,
    sets: session.sets.map((set) =>
      HIERARCHY_EXEMPT_SETS.has(set.title) || set.track === "skillCheck"
        ? set
        : {
            ...set,
            exercises: set.exercises.map((e) => {
              const n = setsOf(e.detail);
              const lighter = Math.max(2, Math.round(n * 0.67));
              return lighter < n ? { ...e, detail: withSets(e.detail, lighter), adaptNote: "Deload week: lighter on purpose" } : e;
            }),
          }
    ),
  };
}

// the exercise the test week tries: the target stage's main hold or move
export function testExercise(b: Pick<TrainingBlock, "skill" | "targetStage">): string | undefined {
  const names = exercisesForSkillStage(b.skill, b.targetStage);
  return names.find((n) => /hold/i.test(n)) ?? names[0];
}

export function newBlock(skill: StagedSkillKey, fromStage: string, targetStage: string, weeks: number, now = new Date()): TrainingBlock {
  return {
    id: `b-${now.getTime().toString(36)}`,
    skill,
    fromStage,
    targetStage,
    startISO: startOfDay(now).toISOString(),
    weeks: Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, weeks)),
    createdAt: now.toISOString(),
  };
}

export const reached = (b: TrainingBlock, skills: UserDoc["skills"]) =>
  stageIdx(b.skill, (skills as unknown as Record<string, string>)[b.skill] ?? "none") >= stageIdx(b.skill, b.targetStage);
