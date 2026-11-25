import type { Exercise, UserDoc } from "../types";
import { YOGA } from "./yoga";
import { PILATES } from "./pilates";
import type { Experience, ExtraSport, SportDef, SportId, SportTrack } from "./types";

export * from "./types";

export const SPORTS: Record<ExtraSport, SportDef> = { yoga: YOGA, pilates: PILATES };
export const EXTRA_SPORTS = Object.keys(SPORTS) as ExtraSport[];
export const ALL_SPORTS: SportId[] = ["calisthenics", ...EXTRA_SPORTS];

// what the switcher and the sport cards show
export const SPORT_META: Record<SportId, { name: string; emoji: string; tagline: string; indoor: boolean }> = {
  calisthenics: { name: "Calisthenics", emoji: "🤸", tagline: "Bodyweight strength and skills at the bar", indoor: false },
  yoga: { name: YOGA.name, emoji: YOGA.emoji, tagline: YOGA.tagline, indoor: YOGA.indoor },
  pilates: { name: PILATES.name, emoji: PILATES.emoji, tagline: PILATES.tagline, indoor: PILATES.indoor },
};

export const isExtraSport = (s: unknown): s is ExtraSport => typeof s === "string" && s in SPORTS;

// the sport Today shows: calisthenics unless another one is picked and started
export function activeSportOf(u: Pick<UserDoc, "activeSport" | "sports"> | null | undefined): SportId {
  const a = u?.activeSport;
  return isExtraSport(a) && u?.sports?.[a] ? a : "calisthenics";
}

export const trackOf = (u: Pick<UserDoc, "sports"> | null | undefined, s: ExtraSport): SportTrack | undefined => u?.sports?.[s];

// sports you've started, calisthenics first
export const enrolledSports = (u: Pick<UserDoc, "sports"> | null | undefined): SportId[] => ["calisthenics", ...EXTRA_SPORTS.filter((s) => !!u?.sports?.[s])];

// where an exercise sits in a sport: its skill and stage
export function locate(def: SportDef, name: string): { skill: string; stage: number } | null {
  for (const sk of def.skills) {
    const i = sk.stages.findIndex((st) => st.exercises.some((e) => e.name === name));
    if (i >= 0) return { skill: sk.key, stage: i };
  }
  return null;
}

const START_STAGE: Record<Experience, number> = { new: 0, some: 1, experienced: 2 };

export function newTrack(def: SportDef, experience: Experience, goals: string[], sessionLengthMinutes?: number, now = new Date()): SportTrack {
  const stage: Record<string, number> = {};
  const mastery: Record<string, number> = {};
  for (const sk of def.skills) {
    stage[sk.key] = Math.min(START_STAGE[experience], sk.stages.length - 1);
    mastery[sk.key] = 2;
  }
  return {
    startedAt: now.toISOString(),
    experience,
    stage,
    mastery,
    goals: goals.filter((g) => def.skills.some((s) => s.key === g)).slice(0, 3),
    exerciseStats: {},
    records: {},
    xp: 0,
    sessions: 0,
    ...(sessionLengthMinutes ? { sessionLengthMinutes } : {}),
  };
}

// every exercise of every sport, for the library, translations and demos
export function sportExercises(def: SportDef): { exercise: Exercise; skill?: string; stage?: number; part: "skill" | "warmup" | "cooldown" }[] {
  return [
    ...def.skills.flatMap((sk) => sk.stages.flatMap((st, i) => st.exercises.map((exercise) => ({ exercise, skill: sk.key, stage: i, part: "skill" as const })))),
    ...def.warmup.map((exercise) => ({ exercise, part: "warmup" as const })),
    ...def.cooldown.map((exercise) => ({ exercise, part: "cooldown" as const })),
  ];
}

// Italian descriptions and cues kept with the sport content
export const SPORT_DESCRIPTIONS_IT: Record<string, string> = Object.fromEntries(
  Object.values(SPORTS).flatMap((d) => sportExercises(d).flatMap(({ exercise }) => {
    const it = (exercise as { it?: { description?: string } }).it?.description;
    return it ? [[exercise.name, it]] : [];
  }))
);

export const SPORT_CUES_IT: [string, string][] = Object.values(SPORTS).flatMap((d) =>
  sportExercises(d).flatMap(({ exercise }) => {
    const e = exercise as { cue?: string; it?: { cue?: string } };
    return e.cue && e.it?.cue ? [[e.cue, e.it.cue] as [string, string]] : [];
  })
);
