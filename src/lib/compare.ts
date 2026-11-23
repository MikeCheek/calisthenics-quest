import type { SessionRecord, SkillProfile, StagedSkillKey, UserDoc } from "./types";
import { ASSESSMENT_AREAS } from "./assessment";
import { findExerciseSource } from "./exerciseLookup";
import { exerciseDifficulty } from "./effort";
import { statKey } from "./adaptation";
import { parseTiming } from "./exerciseTiming";
import { STAGE_ORDER } from "./stageOrder";
import { skillsAt } from "./skillHistory";
import { levelFromXp } from "./xp";

// ---------------------------------------------------------------------------
// "Then vs now": two periods of training side by side.
//
// - Exercises done in both: best set and typical set, reps or seconds, and
//   how many sets per session — measured where you logged them, otherwise
//   the prescription (marked estimated).
// - Skills: the stage then and now — from the skill history when it reaches
//   back that far, otherwise worked out from the exercises you trained.
// - Strength per muscle group: how hard your exercises were times what you
//   did in them, so moving to a harder variation counts as progress even
//   when the reps drop.
// ---------------------------------------------------------------------------

export type Area = "pull" | "push" | "balance" | "core" | "legs" | "statics" | "mobility";
export const AREAS: Area[] = ["pull", "push", "statics", "balance", "core", "legs", "mobility"];
export const AREA_LABEL: Record<Area, string> = {
  pull: "Pulling",
  push: "Pushing",
  statics: "Levers & static holds",
  balance: "Handstand & balance",
  core: "Core",
  legs: "Legs",
  mobility: "Mobility & flow",
};

const SKILL_AREA = new Map<StagedSkillKey, Area>();
for (const a of ASSESSMENT_AREAS) {
  for (const l of a.ladders) if (l.skill) SKILL_AREA.set(l.skill as StagedSkillKey, a.id as Area);
  for (const s of a.sides) SKILL_AREA.set(s.skill as StagedSkillKey, a.id as Area);
}

export const skillArea = (skill: StagedSkillKey): Area => SKILL_AREA.get(skill) ?? "mobility";

export function exerciseArea(name: string): Area {
  const src = findExerciseSource(name);
  if (src) return skillArea(src.skill as StagedSkillKey);
  const n = name.toLowerCase();
  if (/pull-?up|chin|row|hang|muscle-?up/.test(n)) return "pull";
  if (/push-?up|dip|press/.test(n)) return "push";
  if (/handstand|balance/.test(n)) return "balance";
  if (/squat|lunge|pistol|calf|nordic|bridge|step/.test(n)) return "legs";
  if (/lever|planche|flag/.test(n)) return "statics";
  if (/plank|hollow|raise|l-sit|crunch|core|sit/.test(n)) return "core";
  return "mobility";
}

// ---- periods ----

export interface Period {
  from: string; // ISO, inclusive
  to: string; // ISO, exclusive
}

const DAY = 86400000;
export const WINDOW_DAYS = 14;

export type Preset = "start" | "3m" | "1m" | "custom";

// "then" is the two weeks from a start date; "now" the two weeks up to an
// end date (today unless chosen).
export function periodsFor(preset: Preset, opts: { startedAt: string; now?: Date; thenDate?: string; nowDate?: string }): { then: Period; now: Period } {
  const end = opts.nowDate ? new Date(new Date(opts.nowDate).getTime() + DAY) : opts.now ?? new Date();
  const nowP = { from: new Date(end.getTime() - WINDOW_DAYS * DAY).toISOString(), to: end.toISOString() };
  let thenStart: Date;
  if (preset === "custom" && opts.thenDate) thenStart = new Date(opts.thenDate);
  else if (preset === "3m") thenStart = new Date(end.getTime() - (91 + WINDOW_DAYS) * DAY);
  else if (preset === "1m") thenStart = new Date(end.getTime() - (30 + WINDOW_DAYS) * DAY);
  else thenStart = new Date(opts.startedAt);
  // the two windows never overlap
  const thenEnd = new Date(Math.min(thenStart.getTime() + WINDOW_DAYS * DAY, new Date(nowP.from).getTime()));
  return { then: { from: thenStart.toISOString(), to: thenEnd.toISOString() }, now: nowP };
}

export const inPeriod = (s: Pick<SessionRecord, "finishedAt">, p: Period) => s.finishedAt >= p.from && s.finishedAt < p.to;

// ---- exercises ----

export interface ExerciseLine {
  key: string;
  name: string;
  kind: "reps" | "hold";
  best: number; // best set
  perSet: number; // typical set (median)
  setsPerSession: number;
  sessions: number;
  difficulty: number; // effort.ts: 1 (easy) … 5 (elite)
  area: Area;
  estimated: boolean; // from the prescription, not logged
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0;
};

export function exerciseLines(sessions: Pick<SessionRecord, "exercises">[]): Map<string, ExerciseLine> {
  const acc = new Map<string, { name: string; kind: "reps" | "hold"; sets: number[]; setsPer: number[]; sessions: number; difficulty: number; estimated: boolean }>();
  for (const s of sessions) {
    for (const e of s.exercises ?? []) {
      if (e.outcome !== "done" || /^warm-?up$/i.test(e.setTitle ?? "")) continue;
      const name = e.name.replace(/^Skill check:\s*/i, "");
      let values: number[] = [];
      let kind: "reps" | "hold" = "reps";
      let estimated = false;
      const logged = (e.sets ?? []).filter((x) => x.reps !== undefined || x.holdSec !== undefined);
      if (logged.length) {
        kind = logged.some((x) => x.holdSec !== undefined) ? "hold" : "reps";
        values = logged.map((x) => (kind === "hold" ? x.holdSec ?? 0 : x.reps ?? 0)).filter((v) => v > 0);
      } else if (typeof e.checkResult === "number") {
        values = [e.checkResult];
        kind = /\bs\b|hold|sec/i.test(e.detail ?? "") ? "hold" : "reps";
      } else if (e.detail) {
        const t = parseTiming(e.detail);
        // "3 x 5 reps, 4s descent" is reps, even with a tempo in seconds
        const timed = t.isTimed && !/\breps?\b/i.test(e.detail);
        const per: number = timed ? t.workSeconds ?? 0 : parseInt((e.detail.replace(/^\d+(?:-\d+)?\s*x\s*/i, "").match(/^(\d+)/) ?? [])[1] ?? "0", 10);
        if (per > 0) {
          kind = timed ? "hold" : "reps";
          values = Array.from({ length: e.setsDone ?? t.sets }, () => per);
          estimated = true;
        }
      }
      if (!values.length) continue;
      const key = statKey(name);
      const a = acc.get(key) ?? { name, kind, sets: [], setsPer: [], sessions: 0, difficulty: exerciseDifficulty(name, e.setTitle ?? ""), estimated: true };
      a.sets.push(...values);
      a.setsPer.push(values.length);
      a.sessions += 1;
      a.estimated &&= estimated;
      acc.set(key, a);
    }
  }
  const out = new Map<string, ExerciseLine>();
  for (const [key, a] of acc) {
    out.set(key, {
      key,
      name: a.name,
      kind: a.kind,
      best: Math.max(...a.sets),
      perSet: Math.round(median(a.sets) * 10) / 10,
      setsPerSession: Math.round(median(a.setsPer) * 10) / 10,
      sessions: a.sessions,
      difficulty: a.difficulty,
      area: exerciseArea(a.name),
      estimated: a.estimated,
    });
  }
  return out;
}

export const pctChange = (from: number, to: number) => (from > 0 ? Math.round(((to - from) / from) * 100) : to > 0 ? 100 : 0);

export interface ExerciseChange {
  then: ExerciseLine;
  now: ExerciseLine;
  bestChange: number; // %
  perSetChange: number; // %
  setsChange: number; // sets per session, difference
}

export function compareExercises(then: Map<string, ExerciseLine>, now: Map<string, ExerciseLine>) {
  const both: ExerciseChange[] = [];
  for (const [key, n] of now) {
    const t = then.get(key);
    if (!t || t.kind !== n.kind) continue;
    both.push({
      then: t,
      now: n,
      bestChange: pctChange(t.best, n.best),
      perSetChange: pctChange(t.perSet, n.perSet),
      setsChange: Math.round((n.setsPerSession - t.setsPerSession) * 10) / 10,
    });
  }
  // measured ones first (estimates from the plan rarely move), biggest gain first
  both.sort((a, b) => Number(a.now.estimated && a.then.estimated) - Number(b.now.estimated && b.then.estimated) || b.bestChange - a.bestChange);
  // new in your training: harder ones first
  const added = [...now.values()].filter((n) => !then.has(n.key)).sort((a, b) => b.difficulty - a.difficulty);
  const dropped = [...then.values()].filter((t) => !now.has(t.key));
  return { both, added, dropped };
}

// ---- strength per muscle group ----

// One number per exercise. Each step up in difficulty roughly doubles to
// triples the demand (a straddle lever is a different world from a tuck),
// while extra reps add strength less than linearly — so difficulty counts
// exponentially and the work as a square root. A set of 10 reps or a 20 s
// hold is the unit. Tuck lever 15 s -> straddle 6 s comes out around +140%.
export const effortScore = (l: Pick<ExerciseLine, "difficulty" | "kind" | "perSet">) =>
  Math.pow(3, l.difficulty) * Math.sqrt(Math.max(0, l.kind === "hold" ? l.perSet / 20 : l.perSet / 10));

// The group's score is the average of its three hardest-working exercises.
export function areaScore(lines: ExerciseLine[]): number {
  const top = lines.map(effortScore).sort((a, b) => b - a).slice(0, 3);
  return top.length ? top.reduce((a, b) => a + b, 0) / top.length : 0;
}

export interface AreaChange {
  area: Area;
  then: number;
  now: number;
  change: number | null; // %; null when one side has nothing to compare
}

export function compareAreas(then: Map<string, ExerciseLine>, now: Map<string, ExerciseLine>): AreaChange[] {
  return AREAS.map((area) => {
    const t = areaScore([...then.values()].filter((l) => l.area === area));
    const n = areaScore([...now.values()].filter((l) => l.area === area));
    return { area, then: t, now: n, change: t > 0 && n > 0 ? pctChange(t, n) : null };
  }).filter((a) => a.then > 0 || a.now > 0);
}

// ---- skills ----

type Stages = Partial<Record<StagedSkillKey, string>>;

const order = (skill: StagedSkillKey) => STAGE_ORDER[skill] ?? [];
export const stageIdx = (skill: StagedSkillKey, stage: string | undefined) => (stage ? order(skill).indexOf(stage) : 0);

// The highest stage trained in these sessions, per skill
export function stagesTrained(sessions: Pick<SessionRecord, "exercises">[]): Stages {
  const out: Stages = {};
  for (const s of sessions) {
    for (const e of s.exercises ?? []) {
      if (e.outcome !== "done") continue;
      const src = findExerciseSource(e.name.replace(/^Skill check:\s*/i, ""));
      if (!src) continue;
      const skill = src.skill as StagedSkillKey;
      if (stageIdx(skill, src.stage) > stageIdx(skill, out[skill])) out[skill] = src.stage;
    }
  }
  return out;
}

export interface SkillChange {
  skill: StagedSkillKey;
  area: Area;
  from: string; // "unknown": not trained then, and no history to say
  to: string;
  steps: number;
}

// Only real staged skills (the profile also keeps rep counts like max
// pull-ups). When "then" is worked out from training, a skill that simply
// wasn't trained then is unknown, not "not started".
export function compareSkills(then: Stages, now: Stages, thenExact = true): SkillChange[] {
  const keys = new Set([...Object.keys(then), ...Object.keys(now)].filter((k) => STAGE_ORDER[k]) as StagedSkillKey[]);
  return [...keys]
    .map((skill) => {
      const from = then[skill] ?? (thenExact ? "none" : "unknown");
      const to = now[skill] ?? "none";
      const steps = from === "unknown" ? 0 : stageIdx(skill, to) - stageIdx(skill, from);
      return { skill, area: skillArea(skill), from, to, steps };
    })
    .filter((c) => (c.from !== "none" && c.from !== "unknown") || c.to !== "none")
    .sort((a, b) => b.steps - a.steps || (a.from === "unknown" ? 1 : 0) - (b.from === "unknown" ? 1 : 0) || a.skill.localeCompare(b.skill));
}

// The stages at the end of a period: the history when it reaches back that
// far, otherwise what was trained in it. "exact" says which.
export function stagesFor(
  period: Period,
  sessions: Pick<SessionRecord, "exercises">[],
  user: Pick<UserDoc, "skillHistory" | "skills">,
  isNow: boolean
): { stages: Stages; exact: boolean } {
  if (isNow && period.to >= new Date(Date.now() - 60000).toISOString()) {
    return { stages: Object.fromEntries(Object.entries(user.skills as SkillProfile).filter(([k, v]) => STAGE_ORDER[k] && v !== "none")) as Stages, exact: true };
  }
  const h = skillsAt(user.skillHistory, period.to);
  return h ? { stages: h, exact: true } : { stages: stagesTrained(sessions), exact: false };
}

// ---- the headline numbers ----

export interface Headline {
  sessionsPerWeek: [number, number];
  minutesPerWeek: [number, number];
  levelThen: number; // ≈ — XP earned outside sessions isn't dated
  levelNow: number;
}

export function headline(user: Pick<UserDoc, "xp">, all: Pick<SessionRecord, "finishedAt" | "xp" | "durationMin">[], then: Period, now: Period): Headline {
  const weeks = (p: Period) => Math.max(1, (new Date(p.to).getTime() - new Date(p.from).getTime()) / (7 * DAY));
  const per = (p: Period, f: (s: (typeof all)[number]) => number) => Math.round((all.filter((s) => inPeriod(s, p)).reduce((a, s) => a + f(s), 0) / weeks(p)) * 10) / 10;
  const xpAfterThen = all.filter((s) => s.finishedAt >= then.to).reduce((a, s) => a + (s.xp ?? 0), 0);
  return {
    sessionsPerWeek: [per(then, () => 1), per(now, () => 1)],
    minutesPerWeek: [Math.round(per(then, (s) => s.durationMin ?? 0)), Math.round(per(now, (s) => s.durationMin ?? 0))],
    levelThen: levelFromXp(Math.max(0, user.xp - xpAfterThen)),
    levelNow: levelFromXp(user.xp),
  };
}

// ---- one exercise over time (the library's "Your progress") ----

export interface HistoryPoint {
  date: string; // ISO of the session
  best: number;
  perSet: number;
  sets: number;
  kind: "reps" | "hold";
  estimated: boolean;
}

// every session that had this exercise, oldest first
export function exerciseHistory(sessions: Pick<SessionRecord, "finishedAt" | "exercises">[], name: string): HistoryPoint[] {
  const key = statKey(name);
  return [...sessions]
    .sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))
    .flatMap((s) => {
      const l = exerciseLines([s]).get(key);
      return l ? [{ date: s.finishedAt, best: l.best, perSet: l.perSet, sets: l.setsPerSession, kind: l.kind, estimated: l.estimated }] : [];
    });
}

// when the exercise was done at all (max sets without logged reps have no
// number to chart, but still count as done)
export function exerciseDoneDates(sessions: Pick<SessionRecord, "finishedAt" | "exercises">[], name: string): string[] {
  const key = statKey(name);
  return sessions
    .filter((s) => s.exercises.some((e) => e.outcome === "done" && statKey(e.name) === key))
    .map((s) => s.finishedAt)
    .sort();
}
