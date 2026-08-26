import { TrainingSession, UserDoc } from "./types";
import { ensureCurrentWeekMissions, bumpMissions } from "./missions";
import { updateProgress } from "./store";

function isYesterday(dateISO: string): boolean {
  const d = new Date(dateISO);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
}

function isToday(dateISO: string): boolean {
  return new Date(dateISO).toDateString() === new Date().toDateString();
}

export async function completeSession(
  userDoc: UserDoc,
  session: TrainingSession,
  opts: { isPaired?: boolean } = {}
): Promise<Partial<UserDoc>> {
  const alreadyLoggedToday = userDoc.lastSessionDateISO
    ? isToday(userDoc.lastSessionDateISO)
    : false;

  const newStreak = alreadyLoggedToday
    ? userDoc.streak
    : userDoc.lastSessionDateISO && isYesterday(userDoc.lastSessionDateISO)
    ? userDoc.streak + 1
    : 1;

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
  return patch;
}
