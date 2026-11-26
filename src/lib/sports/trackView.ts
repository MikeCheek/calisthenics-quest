import type { ExerciseBest, ExerciseStat, StagedSkillKey, UserDoc } from "../types";
import { SKILL_FIELD_LABEL } from "../types";
import { EXTRA_SPORTS, SPORTS, activeSportOf, isExtraSport, sportXp } from "./index";
import type { SportId } from "./types";

// ---------------------------------------------------------------------------
// Every sport in one shape. Calisthenics keeps its data at the top of the
// user document (it came first); yoga and Pilates keep theirs under
// sports.<id>. Code that only needs "this sport's history, records, XP" reads
// it through here instead of branching on the sport — and writes stats back
// with statsPatch(), which puts them in the right place.
// ---------------------------------------------------------------------------

export interface TrackView {
  sport: SportId;
  exerciseStats: Record<string, ExerciseStat>;
  records: Record<string, ExerciseBest>;
  xp: number;
  sessions: number;
  // skills moving toward their next stage (names, for display)
  rising: string[];
  // the update that saves new exercise stats for this sport
  statsPatch(stats: Record<string, ExerciseStat>): Partial<UserDoc>;
}

type Source = Pick<UserDoc, "xp" | "sports" | "exerciseStats" | "records" | "skillProgress" | "totalSessionsCompleted" | "activeSport">;

export function trackView(u: Source, sport: SportId = activeSportOf(u as UserDoc)): TrackView {
  if (isExtraSport(sport)) {
    const t = u.sports?.[sport];
    const def = SPORTS[sport];
    return {
      sport,
      exerciseStats: t?.exerciseStats ?? {},
      records: t?.records ?? {},
      xp: t?.xp ?? 0,
      sessions: t?.sessions ?? 0,
      // mastery 4 of 5 or more: the next stage is close
      rising: t ? def.skills.filter((sk) => (t.mastery[sk.key] ?? 0) >= 4).map((sk) => sk.name) : [],
      statsPatch: (exerciseStats) => (t ? { sports: { ...u.sports, [sport]: { ...t, exerciseStats } } } : {}),
    };
  }
  const otherSessions = EXTRA_SPORTS.reduce((n, id) => n + (u.sports?.[id]?.sessions ?? 0), 0);
  return {
    sport: "calisthenics",
    exerciseStats: u.exerciseStats ?? {},
    records: u.records ?? {},
    xp: sportXp(u, "calisthenics"),
    sessions: Math.max(0, (u.totalSessionsCompleted ?? 0) - otherSessions),
    rising: (Object.entries(u.skillProgress ?? {}) as [StagedSkillKey, { score: number }][])
      .filter(([, p]) => p.score >= 3)
      .map(([k]) => SKILL_FIELD_LABEL[k]),
    statsPatch: (exerciseStats) => ({ exerciseStats }),
  };
}

// The sport a session belongs to (sessions without one are calisthenics).
export const sportOfSession = (s: { sport?: SportId } | null | undefined): SportId => s?.sport ?? "calisthenics";

// All personal records across every sport (for counts and achievements).
export function allRecords(u: Source): ExerciseBest[] {
  return [Object.values(u.records ?? {}), ...EXTRA_SPORTS.map((s) => Object.values(u.sports?.[s]?.records ?? {}))].flat();
}

// An exercise's best in whichever sport it belongs to (names are per sport;
// the active sport is checked first for the few they share).
export function recordFor(u: Source, key: string): ExerciseBest | undefined {
  const order = [activeSportOf(u as UserDoc), "calisthenics" as SportId, ...EXTRA_SPORTS];
  for (const s of order) {
    const r = trackView(u, s).records[key];
    if (r) return r;
  }
  return undefined;
}

// This week's sessions per sport, in the order sports are listed (for the
// weekly balance on Today). Sessions are counted as given — pass this week's.
export function sessionsBySport(sessions: { sport?: SportId }[], sports: SportId[]): { sport: SportId; count: number }[] {
  return sports.map((sport) => ({ sport, count: sessions.filter((s) => sportOfSession(s) === sport).length }));
}
