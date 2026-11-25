import type { Exercise, ExerciseBest, ExerciseStat } from "../types";

// ---------------------------------------------------------------------------
// Sports beyond calisthenics, Duolingo-style: you can follow several, each
// with its own progress, and switch any time without losing any. The streak
// and total XP are shared; skills, levels, history and records are per sport.
// Calisthenics keeps its own (richer) data at the top of the profile.
// ---------------------------------------------------------------------------

export type SportId = "calisthenics" | "yoga" | "pilates";
export type ExtraSport = Exclude<SportId, "calisthenics">;

export interface SportExercise extends Exercise {
  it?: { description?: string; cue?: string }; // Italian, kept next to the English
}

export interface SportStage {
  id: string; // stable key, e.g. "crow"
  label: string; // English; stage names stay English like exercise names
  exercises: SportExercise[];
}

export interface SportSkill {
  key: string;
  name: string; // English (skill names stay English)
  group: string; // focus group key
  stages: SportStage[];
}

export interface SportGroup {
  key: string;
  label: string; // English; Italian in phrases.it.ts
}

export interface SportDef {
  id: ExtraSport;
  name: string;
  emoji: string;
  tagline: string; // English; Italian in phrases.it.ts
  indoor: boolean;
  groups: SportGroup[];
  skills: SportSkill[];
  warmup: SportExercise[];
  cooldown: SportExercise[];
}

export type Experience = "new" | "some" | "experienced";

// your progress in one sport (userDoc.sports[id])
export interface SportTrack {
  startedAt: string;
  experience: Experience;
  stage: Record<string, number>; // skill key -> index of the current stage
  mastery: Record<string, number>; // skill key -> 1..5, how solid the current stage is
  goals: string[]; // skill keys you want most
  exerciseStats: Record<string, ExerciseStat>;
  records: Record<string, ExerciseBest>;
  xp: number;
  sessions: number;
  lastSessionISO?: string;
  sessionLengthMinutes?: number;
}

export const MASTERY_MAX = 5;
