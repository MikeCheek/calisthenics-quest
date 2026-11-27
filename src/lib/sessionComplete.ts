import { settleWrite } from "./offlineWrites";
import { readTodayPark } from "./todayPark";
import { nextStreak } from "./weekStreak";
import { SPORTS, isExtraSport } from "./sports";
import { applySportSession } from "./sports/progress";
import { skillHistoryPatch } from "./skillHistory";
import { earnedXp, xpRules } from "./sessionXp";
import { EFFORT_HISTORY } from "./effort";
import { LENGTH_HISTORY, lengthSample } from "./sessionLength";
import { estimateSessionMinutes } from "./exerciseTiming";
import { ExerciseFeedback, PersonalRecord, TrainingSession, UserDoc } from "./types";
import { applyExerciseFeedback, applySkillFeedback, AdaptationReport } from "./adaptation";
import { applyCheckResults, syncClaims } from "./verification";
import { buildSessionRecord, detectRecords, recordLastTimes } from "./sessionHistory";
import { addToWeek } from "./leaderboard";
import { ensureCurrentWeekMissions, bumpMissions } from "./missions";
import { updateProgress, syncPublicProfile, saveSessionRecord, setGlobalBoardEntry, addFeedItem, recordParkVisit } from "./store";
import { feedItemFor, sharesActivity } from "./feed";
import { levelFromXp } from "./xp";

export type { StreakEvent } from "./weekStreak";
import type { StreakEvent } from "./weekStreak";

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
  offline: boolean; // saved on the phone, sent when the connection is back
}

// the streak counts weeks with at least one session (weekStreak.ts)
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
  const { streak: newStreak, event: streakEvent } = nextStreak(userDoc);

  const missions = ensureCurrentWeekMissions(userDoc.missions ?? []);

  const { missions: updatedMissions, xpFromMissions } = bumpMissions(missions, {
    sessionCompleted: true,
    isPaired: opts.isPaired,
    streak: newStreak,
    repeatedFocus: true,
  });


  const counts = {
    done: feedback.filter((f) => f.outcome === "done").length,
    skipped: feedback.filter((f) => f.outcome === "skipped").length,
    tooHard: feedback.filter((f) => f.outcome === "tooHard").length,
  };
  const ignoredTimingSamples = feedback.reduce((n, f) => n + (f.timing?.ignored ?? 0), 0);

  // What the session teaches: calisthenics learns its skills, checks and
  // claims (adaptation.ts, verification.ts); another sport moves its own
  // track (sports/progress.ts). Both earn XP the same way.
  let learnPatch: Partial<UserDoc>;
  let report: AdaptationReport;
  let earnedTotal: number;
  let verifiedCount = 0;
  let newRecords: PersonalRecord[];
  let profileSkills = userDoc.skills;
  let profileMastery = userDoc.skillMastery ?? {};
  const sport = isExtraSport(session.sport) && userDoc.sports?.[session.sport] ? session.sport : null;

  if (sport) {
    const def = SPORTS[sport];
    const applied = applySportSession(def, userDoc.sports![sport]!, feedback);
    newRecords = applied.newRecords;
    const earned = earnedXp(session, feedback, { verified: 0, records: newRecords.length });
    earnedTotal = earned.total + applied.stageUps.length * xpRules().stageUp;
    learnPatch = { sports: { ...userDoc.sports, [sport]: { ...applied.track, xp: (applied.track.xp ?? 0) + earnedTotal } } };
    report = { masteryChanges: [], suggestions: [], verifications: [], ignoredTimingSamples, records: newRecords, feedbackCounts: counts, stageUps: applied.stageUps };
  } else {
    // Learn from what actually happened in this session (see adaptation.ts).
    const exerciseStats = recordLastTimes(applyExerciseFeedback(userDoc.exerciseStats ?? {}, feedback), feedback);
    const detected = detectRecords(userDoc.records ?? {}, feedback);
    newRecords = detected.newRecords;
    const learned = applySkillFeedback(userDoc.skills, userDoc.skillMastery ?? {}, userDoc.skillProgress ?? {}, feedback);
    // Verify (or question) what the athlete claimed, from any Skill Check.
    const verified = applyCheckResults(syncClaims(userDoc.claims, userDoc.skills), userDoc.skills, learned.mastery, learned.progress, feedback);
    const newSkills = verified.skills;
    const claims = syncClaims(verified.claims, newSkills);
    verifiedCount = verified.events.filter((e) => e.outcome === "verified" || e.outcome === "raised").length;
    // XP from the work actually done, plus bonuses for proving skills and
    // new records (sessionXp.ts) — the level comes from this alone
    earnedTotal = earnedXp(session, feedback, { verified: verifiedCount, records: newRecords.length }).total;
    const suggestions = [...verified.suggestions, ...learned.suggestions.filter((s) => !verified.suggestions.some((v) => v.skill === s.skill))];
    report = { masteryChanges: learned.masteryChanges, suggestions, verifications: verified.events, ignoredTimingSamples, records: newRecords, feedbackCounts: counts };
    profileSkills = newSkills;
    profileMastery = verified.mastery;
    learnPatch = {
      exerciseStats,
      skillProgress: learned.progress,
      skillMastery: verified.mastery,
      skills: newSkills,
      ...skillHistoryPatch(userDoc, newSkills),
      claims,
      records: detected.records,
      // a skipped transition (well under half) isn't a preference — not learned
      ...(opts.transitionRestRatio !== undefined && opts.transitionRestRatio >= 0.4 ? { transitionRest: [...(userDoc.transitionRest ?? []), +opts.transitionRestRatio.toFixed(2)].slice(-5) } : {}),
    };
  }

  const totalXp = userDoc.xp + earnedTotal + xpFromMissions;
  // missions finished by this session count for its sport too, so each
  // sport's XP plus calisthenics' always adds up to the total
  if (isExtraSport(sport) && learnPatch.sports?.[sport]) {
    const t = learnPatch.sports[sport]!;
    learnPatch = { sports: { ...learnPatch.sports, [sport]: { ...t, xp: t.xp + xpFromMissions } } };
  }
  const trimmedHistory = [...(userDoc.xpHistory ?? []), { dateISO: new Date().toISOString(), xp: totalXp }].slice(-30);

  // this week's totals, for the friends leaderboard
  const week = addToWeek(userDoc.week, {
    minutes: opts.durationMin,
    xp: totalXp - userDoc.xp,
    verified: verifiedCount,
  });

  // how much of it you got through, to plan the next ones (sessionLength.ts)
  const length = lengthSample(session, feedback, estimateSessionMinutes(session));

  const patch: Partial<UserDoc> = {
    ...learnPatch,
    week,
    ...(length && !opts.isPaired ? { lengthHistory: [...(userDoc.lengthHistory ?? []), length].slice(-LENGTH_HISTORY) } : {}),
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
    streakUnit: "week",
    lastSessionDateISO: new Date().toISOString(),
    totalSessionsCompleted: userDoc.totalSessionsCompleted + 1,
    missions: updatedMissions,
    xpHistory: trimmedHistory,
  };

  // offline, this is saved on the phone and sent later (offlineWrites.ts)
  const saved = await settleWrite(updateProgress(userDoc.uid, patch));

  // Keep the session itself for the history view. Best-effort: progress is
  // already saved, so a failed history write shouldn't fail the whole log.
  const sessionRecord = buildSessionRecord(session, feedback, {
    xp: totalXp - userDoc.xp,
    durationMin: opts.durationMin,
    paired: opts.isPaired,
    records: newRecords,
  });
  if (sport) sessionRecord.sport = sport;
  // where it was done, if you said (todayPark.ts): on the session, and as a visit to the park
  const park = readTodayPark();
  if (park && park !== "none") {
    sessionRecord.park = park;
    recordParkVisit(park.id, userDoc.uid).catch(() => {});
  }
  await settleWrite(saveSessionRecord(userDoc.uid, sessionRecord)).catch(() => {});
  report.sessionRecord = sessionRecord; // for the share card
  // friends see it in their feed, unless sharing is off (feed.ts)
  if (sharesActivity(userDoc)) settleWrite(addFeedItem(userDoc.uid, feedItemFor(userDoc, sessionRecord, newStreak))).catch(() => {});

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
      skills: profileSkills,
      skillMastery: profileMastery,
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
    offline: saved === "queued",
    celebration: {
      leveledUp: newLevel > oldLevel,
      newLevel,
      streakEvent,
      newStreak,
    },
  };
}
