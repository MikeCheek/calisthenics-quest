import { TrainingSession, UserDoc } from "./types";
import { ensureCurrentWeekMissions, bumpMissions } from "./missions";
import { updateProgress, syncPublicProfile } from "./store";
import { effectiveLevel } from "./levelPath";

export type StreakEvent = "none" | "started" | "increased" | "unfrozen" | "restarted";

export interface Celebration {
  leveledUp: boolean;
  newLevel: number;
  streakEvent: StreakEvent;
  newStreak: number;
}

export interface CompleteSessionResult {
  patch: Partial<UserDoc>;
  celebration: Celebration;
}

function isToday(dateISO: string): boolean {
  return new Date(dateISO).toDateString() === new Date().toDateString();
}

function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((dateOnly(b).getTime() - dateOnly(a).getTime()) / 86400000);
}

// The streak is "frozen" (paused, not broken) through any gap where every
// day in between was a day the athlete never intended to train, per their
// chosen weekly schedule. It "unfreezes" — continues rather than resetting
// — the next time they train on a scheduled day.
function gapIsAllRestDays(lastDate: Date, today: Date, trainingDaysOfWeek: number[] | undefined): boolean {
  if (!trainingDaysOfWeek || trainingDaysOfWeek.length === 0) return false;
  const gap = daysBetween(lastDate, today);
  for (let i = 1; i < gap; i++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i);
    if (trainingDaysOfWeek.includes(d.getDay())) return false;
  }
  return true;
}

function resolveStreak(userDoc: UserDoc, alreadyLoggedToday: boolean): { streak: number; event: StreakEvent } {
  if (alreadyLoggedToday) return { streak: userDoc.streak, event: "none" };
  if (!userDoc.lastSessionDateISO) return { streak: 1, event: "started" };

  const lastDate = new Date(userDoc.lastSessionDateISO);
  const today = new Date();
  const gap = daysBetween(lastDate, today);

  if (gap <= 1) return { streak: userDoc.streak + 1, event: "increased" };
  if (gapIsAllRestDays(lastDate, today, userDoc.body?.trainingDaysOfWeek)) {
    return { streak: userDoc.streak + 1, event: "unfrozen" };
  }
  return { streak: 1, event: "restarted" };
}

export interface XpAwardResult {
  newXp: number;
  leveledUp: boolean;
  newLevel: number;
}

// A smaller, standalone XP award for things outside a full session — e.g.
// finishing a bonus wheel spin. Doesn't touch streak or missions.
export async function awardXp(userDoc: UserDoc, amount: number): Promise<XpAwardResult> {
  const newXp = userDoc.xp + amount;
  const history = [...(userDoc.xpHistory ?? []), { dateISO: new Date().toISOString(), xp: newXp }];
  await updateProgress(userDoc.uid, { xp: newXp, xpHistory: history.slice(-30) });

  const oldLevel = effectiveLevel(userDoc.xp, userDoc.skills, userDoc.skillMastery);
  const newLevel = effectiveLevel(newXp, userDoc.skills, userDoc.skillMastery);
  return { newXp, leveledUp: newLevel > oldLevel, newLevel };
}

export async function completeSession(
  userDoc: UserDoc,
  session: TrainingSession,
  opts: { isPaired?: boolean } = {}
): Promise<CompleteSessionResult> {
  const alreadyLoggedToday = userDoc.lastSessionDateISO ? isToday(userDoc.lastSessionDateISO) : false;
  const { streak: newStreak, event: streakEvent } = resolveStreak(userDoc, alreadyLoggedToday);

  const missions = ensureCurrentWeekMissions(userDoc.missions ?? []);

  const { missions: updatedMissions, xpFromMissions } = bumpMissions(missions, {
    sessionCompleted: true,
    isPaired: opts.isPaired,
    streak: newStreak,
    repeatedFocus: true,
  });

  const totalXp = userDoc.xp + session.estXp + xpFromMissions;

  const history = [...(userDoc.xpHistory ?? []), { dateISO: new Date().toISOString(), xp: totalXp }];
  const trimmedHistory = history.slice(-30);

  const patch: Partial<UserDoc> = {
    xp: totalXp,
    streak: newStreak,
    lastSessionDateISO: new Date().toISOString(),
    totalSessionsCompleted: userDoc.totalSessionsCompleted + 1,
    missions: updatedMissions,
    xpHistory: trimmedHistory,
  };

  await updateProgress(userDoc.uid, patch);

  if (userDoc.friendCode) {
    syncPublicProfile({
      uid: userDoc.uid,
      displayName: userDoc.displayName,
      photoURL: userDoc.photoURL,
      friendCode: userDoc.friendCode,
      level: effectiveLevel(totalXp, userDoc.skills, userDoc.skillMastery),
      streak: newStreak,
      xp: totalXp,
      totalSessionsCompleted: userDoc.totalSessionsCompleted + 1,
      skills: userDoc.skills,
      skillMastery: userDoc.skillMastery,
    }).catch(() => {
      // best-effort — a stale level/streak shown to friends isn't critical
    });
  }

  const oldLevel = effectiveLevel(userDoc.xp, userDoc.skills, userDoc.skillMastery);
  const newLevel = effectiveLevel(totalXp, userDoc.skills, userDoc.skillMastery);

  return {
    patch,
    celebration: {
      leveledUp: newLevel > oldLevel,
      newLevel,
      streakEvent,
      newStreak,
    },
  };
}
