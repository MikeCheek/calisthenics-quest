import { skillHistoryPatch } from "./skillHistory";
import { earnedXp } from "./sessionXp";
import { EFFORT_HISTORY } from "./effort";
import { ExerciseFeedback, TrainingSession, UserDoc } from "./types";
import { applyExerciseFeedback, applySkillFeedback, AdaptationReport } from "./adaptation";
import { applyCheckResults, syncClaims } from "./verification";
import { buildSessionRecord, detectRecords, recordLastTimes } from "./sessionHistory";
import { addToWeek } from "./leaderboard";
import { ensureCurrentWeekMissions, bumpMissions } from "./missions";
import { updateProgress, syncPublicProfile, saveSessionRecord, setGlobalBoardEntry } from "./store";
import { levelFromXp } from "./xp";

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
  report: AdaptationReport;
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

  const oldLevel = levelFromXp(userDoc.xp);
  const newLevel = levelFromXp(newXp);
  return { newXp, leveledUp: newLevel > oldLevel, newLevel };
}

export async function completeSession(
  userDoc: UserDoc,
  session: TrainingSession,
  opts: {
    isPaired?: boolean;
    feedback?: ExerciseFeedback[];
    transitionRestRatio?: number;
    durationMin?: number;
    // effort planned and done, and whether "I'm tired" was pressed (effort.ts)
    effort?: { planned: number; done: number; tired: boolean };
  } = {}
): Promise<CompleteSessionResult> {
  const feedback = opts.feedback ?? [];
  const alreadyLoggedToday = userDoc.lastSessionDateISO ? isToday(userDoc.lastSessionDateISO) : false;
  const { streak: newStreak, event: streakEvent } = resolveStreak(userDoc, alreadyLoggedToday);

  const missions = ensureCurrentWeekMissions(userDoc.missions ?? []);

  const { missions: updatedMissions, xpFromMissions } = bumpMissions(missions, {
    sessionCompleted: true,
    isPaired: opts.isPaired,
    streak: newStreak,
    repeatedFocus: true,
  });


  // Learn from what actually happened in this session (see adaptation.ts).
  const exerciseStats = recordLastTimes(applyExerciseFeedback(userDoc.exerciseStats ?? {}, feedback), feedback);
  const { records, newRecords } = detectRecords(userDoc.records ?? {}, feedback);
  const learned = applySkillFeedback(
    userDoc.skills,
    userDoc.skillMastery ?? {},
    userDoc.skillProgress ?? {},
    feedback
  );
  // Verify (or question) what the athlete claimed, from any Skill Check.
  const verified = applyCheckResults(
    syncClaims(userDoc.claims, userDoc.skills),
    userDoc.skills,
    learned.mastery,
    learned.progress,
    feedback
  );
  const newSkills = verified.skills;
  const claims = syncClaims(verified.claims, newSkills);

  // XP from the work actually done, plus bonuses for proving skills and
  // new records (sessionXp.ts) — the level comes from this alone
  const earned = earnedXp(session, feedback, {
    verified: verified.events.filter((e) => e.outcome === "verified" || e.outcome === "raised").length,
    records: newRecords.length,
  });
  const totalXp = userDoc.xp + earned.total + xpFromMissions;
  const history = [...(userDoc.xpHistory ?? []), { dateISO: new Date().toISOString(), xp: totalXp }];
  const trimmedHistory = history.slice(-30);
  const suggestions = [
    ...verified.suggestions,
    ...learned.suggestions.filter((s) => !verified.suggestions.some((v) => v.skill === s.skill)),
  ];

  const report: AdaptationReport = {
    masteryChanges: learned.masteryChanges,
    suggestions,
    verifications: verified.events,
    ignoredTimingSamples: feedback.reduce((n, f) => n + (f.timing?.ignored ?? 0), 0),
    records: newRecords,
    feedbackCounts: {
      done: feedback.filter((f) => f.outcome === "done").length,
      skipped: feedback.filter((f) => f.outcome === "skipped").length,
      tooHard: feedback.filter((f) => f.outcome === "tooHard").length,
    },
  };
  const newMastery = verified.mastery;

  // this week's totals, for the friends leaderboard
  const week = addToWeek(userDoc.week, {
    minutes: opts.durationMin,
    xp: totalXp - userDoc.xp,
    verified: verified.events.filter((e) => e.outcome === "verified" || e.outcome === "raised").length,
  });

  const patch: Partial<UserDoc> = {
    week,
    exerciseStats,
    skillProgress: learned.progress,
    skillMastery: newMastery,
    skills: newSkills,
    ...skillHistoryPatch(userDoc, newSkills),
    claims,
    records,
    ...(opts.transitionRestRatio !== undefined
      ? { transitionRest: [...(userDoc.transitionRest ?? []), +opts.transitionRestRatio.toFixed(2)].slice(-5) }
      : {}),
    ...(opts.effort && opts.effort.planned > 0
      ? {
          effortHistory: [
            ...(userDoc.effortHistory ?? []),
            { at: new Date().toISOString(), planned: opts.effort.planned, done: opts.effort.done, tired: opts.effort.tired },
          ].slice(-EFFORT_HISTORY),
        }
      : {}),
    xp: totalXp,
    streak: newStreak,
    lastSessionDateISO: new Date().toISOString(),
    totalSessionsCompleted: userDoc.totalSessionsCompleted + 1,
    missions: updatedMissions,
    xpHistory: trimmedHistory,
  };

  await updateProgress(userDoc.uid, patch);

  // Keep the session itself for the history view. Best-effort: progress is
  // already saved, so a failed history write shouldn't fail the whole log.
  const sessionRecord = buildSessionRecord(session, feedback, {
    xp: totalXp - userDoc.xp,
    durationMin: opts.durationMin,
    paired: opts.isPaired,
    records: newRecords,
  });
  await saveSessionRecord(userDoc.uid, sessionRecord).catch(() => {});
  report.sessionRecord = sessionRecord; // for the share card

  if (userDoc.friendCode) {
    syncPublicProfile({
      uid: userDoc.uid,
      displayName: userDoc.displayName,
      photoURL: userDoc.photoURL,
      friendCode: userDoc.friendCode,
      level: levelFromXp(totalXp),
      streak: newStreak,
      xp: totalXp,
      totalSessionsCompleted: userDoc.totalSessionsCompleted + 1,
      skills: newSkills,
      skillMastery: newMastery,
      week,
    }).catch(() => {
      // best-effort — a stale level/streak shown to friends isn't critical
    });
    // the global board, for players who joined it; last week's entry is
    // removed when a new week starts
    if (userDoc.globalBoard) {
      const stale = userDoc.week && userDoc.week.key !== week.key ? [userDoc.week.key] : [];
      setGlobalBoardEntry(userDoc.uid, { displayName: userDoc.displayName, level: levelFromXp(totalXp), week }, stale).catch(() => {});
    }
  }

  const oldLevel = levelFromXp(userDoc.xp);
  const newLevel = levelFromXp(totalXp);

  return {
    patch,
    report,
    celebration: {
      leveledUp: newLevel > oldLevel,
      newLevel,
      streakEvent,
      newStreak,
    },
  };
}
