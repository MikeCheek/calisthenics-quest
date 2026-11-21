import type { UserDoc } from "./types";
import { levelFromXp } from "./xp";
import { claimCounts, syncClaims } from "./verification";
import { STAGE_ORDER } from "./stageOrder";

// ---------------------------------------------------------------------------
// Achievements: badges for milestones. Each is worked out from what the
// profile already holds (sessions, streak, level, verified skills, records,
// the skill history…), so nothing extra is tracked; the date each was first
// earned is saved on the profile (userDoc.achievements).
// ---------------------------------------------------------------------------

export type Tier = "bronze" | "silver" | "gold";
export type BadgeIcon = "dumbbell" | "flame" | "star" | "check" | "trophy" | "trending" | "crown" | "sunrise" | "moon" | "users";

export interface Achievement {
  id: string;
  title: string; // English; Italian in phrases.it.ts
  description: string;
  icon: BadgeIcon;
  tier: Tier;
  // how far along (for locked ones) — value and target
  progress: (u: AchievementInput) => [number, number];
}

export type AchievementInput = Pick<
  UserDoc,
  "totalSessionsCompleted" | "streak" | "xp" | "claims" | "skills" | "records" | "skillHistory" | "lastSessionDateISO" | "missions" | "pastBlocks"
>;

const count = (value: (u: AchievementInput) => number, target: number) => (u: AchievementInput): [number, number] => [Math.min(value(u), target), target];

const sessions = (u: AchievementInput) => u.totalSessionsCompleted ?? 0;
const verified = (u: AchievementInput) => claimCounts(syncClaims(u.claims, u.skills)).verified;
const records = (u: AchievementInput) => Object.keys(u.records ?? {}).length;

// stages gained over the skill history (any skill, any step up)
export function stageUps(u: Pick<AchievementInput, "skillHistory">): number {
  const h = u.skillHistory ?? [];
  let ups = 0;
  for (let i = 1; i < h.length; i++) {
    for (const [skill, stage] of Object.entries(h[i].skills)) {
      const order = STAGE_ORDER[skill] ?? [];
      const before = order.indexOf(h[i - 1].skills[skill as keyof (typeof h)[number]["skills"]] ?? "none");
      const after = order.indexOf(stage ?? "none");
      if (after > before) ups += after - Math.max(0, before);
    }
  }
  return ups;
}

// a skill at its last stage ("full")
const fullSkills = (u: AchievementInput) =>
  Object.entries(u.skills ?? {}).filter(([k, v]) => {
    const o = STAGE_ORDER[k];
    return o && o.length > 1 && v === o[o.length - 1];
  }).length;

const lastHour = (u: AchievementInput) => (u.lastSessionDateISO && u.lastSessionDateISO.length > 10 ? new Date(u.lastSessionDateISO).getHours() : null);

export const ACHIEVEMENTS: Achievement[] = [
  { id: "sessions-1", title: "First rep", description: "Finish your first session.", icon: "dumbbell", tier: "bronze", progress: count(sessions, 1) },
  { id: "sessions-10", title: "Regular", description: "Finish 10 sessions.", icon: "dumbbell", tier: "bronze", progress: count(sessions, 10) },
  { id: "sessions-25", title: "Committed", description: "Finish 25 sessions.", icon: "dumbbell", tier: "silver", progress: count(sessions, 25) },
  { id: "sessions-50", title: "Bar park local", description: "Finish 50 sessions.", icon: "dumbbell", tier: "silver", progress: count(sessions, 50) },
  { id: "sessions-100", title: "Century", description: "Finish 100 sessions.", icon: "trophy", tier: "gold", progress: count(sessions, 100) },
  { id: "sessions-250", title: "Lifer", description: "Finish 250 sessions.", icon: "crown", tier: "gold", progress: count(sessions, 250) },

  { id: "streak-3", title: "On a roll", description: "Train 3 days in a row.", icon: "flame", tier: "bronze", progress: count((u) => u.streak ?? 0, 3) },
  { id: "streak-7", title: "Full week", description: "Keep a 7-day streak.", icon: "flame", tier: "silver", progress: count((u) => u.streak ?? 0, 7) },
  { id: "streak-14", title: "Two weeks strong", description: "Keep a 14-day streak.", icon: "flame", tier: "silver", progress: count((u) => u.streak ?? 0, 14) },
  { id: "streak-30", title: "Unbreakable", description: "Keep a 30-day streak.", icon: "flame", tier: "gold", progress: count((u) => u.streak ?? 0, 30) },

  { id: "level-5", title: "Level 5", description: "Reach level 5.", icon: "star", tier: "bronze", progress: count((u) => levelFromXp(u.xp ?? 0), 5) },
  { id: "level-10", title: "Level 10", description: "Reach level 10.", icon: "star", tier: "silver", progress: count((u) => levelFromXp(u.xp ?? 0), 10) },
  { id: "level-20", title: "Level 20", description: "Reach level 20.", icon: "star", tier: "gold", progress: count((u) => levelFromXp(u.xp ?? 0), 20) },
  { id: "level-30", title: "Level 30", description: "Reach level 30.", icon: "crown", tier: "gold", progress: count((u) => levelFromXp(u.xp ?? 0), 30) },

  { id: "verified-1", title: "Proven", description: "Verify your first skill in a Skill Check.", icon: "check", tier: "bronze", progress: count(verified, 1) },
  { id: "verified-5", title: "Show, don't tell", description: "Verify 5 skills.", icon: "check", tier: "silver", progress: count(verified, 5) },
  { id: "verified-10", title: "No doubt about it", description: "Verify 10 skills.", icon: "check", tier: "gold", progress: count(verified, 10) },

  { id: "records-1", title: "Personal best", description: "Set your first personal record.", icon: "trending", tier: "bronze", progress: count(records, 1) },
  { id: "records-10", title: "Record breaker", description: "Hold personal records on 10 exercises.", icon: "trending", tier: "silver", progress: count(records, 10) },
  { id: "records-25", title: "Always better", description: "Hold personal records on 25 exercises.", icon: "trending", tier: "gold", progress: count(records, 25) },

  { id: "stage-up-1", title: "Level up a skill", description: "Move a skill up a stage.", icon: "trending", tier: "bronze", progress: count(stageUps, 1) },
  { id: "stage-up-10", title: "Climber", description: "Move skills up 10 stages in all.", icon: "trending", tier: "silver", progress: count(stageUps, 10) },
  { id: "block-1", title: "Mission accomplished", description: "Reach the goal of a training block.", icon: "trophy", tier: "silver", progress: count((u) => (u.pastBlocks ?? []).filter((b) => b.outcome === "reached").length, 1) },
  { id: "full-skill", title: "The full thing", description: "Reach the last stage of any skill.", icon: "crown", tier: "gold", progress: count(fullSkills, 1) },

  { id: "early-bird", title: "Early bird", description: "Finish a session before 7 in the morning.", icon: "sunrise", tier: "bronze", progress: (u) => [lastHour(u) !== null && lastHour(u)! < 7 ? 1 : 0, 1] },
  { id: "night-owl", title: "Night owl", description: "Finish a session after 10 at night.", icon: "moon", tier: "bronze", progress: (u) => [lastHour(u) !== null && lastHour(u)! >= 22 ? 1 : 0, 1] },
  { id: "together", title: "Better together", description: "Train together with a friend.", icon: "users", tier: "silver", progress: (u) => [(u.missions ?? []).some((m) => m.kind === "pairing" && m.progress > 0) ? 1 : 0, 1] },
];

export const isEarned = (a: Achievement, u: AchievementInput) => {
  const [v, t] = a.progress(u);
  return v >= t;
};

// ids earned now that aren't saved yet
export function newlyEarned(u: AchievementInput & Pick<UserDoc, "achievements">): string[] {
  return ACHIEVEMENTS.filter((a) => !u.achievements?.[a.id] && isEarned(a, u)).map((a) => a.id);
}

export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
