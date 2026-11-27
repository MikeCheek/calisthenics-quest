"use client";

import { BlockQuestion } from "@/components/BlockPrefs";
import SportWeekSummary from "@/components/sports/SportWeekSummary";
import { SPORT_META } from "@/lib/sports";
import SportProgressCard from "@/components/sports/SportProgressCard";
import { askParkFirst } from "@/components/parks/ParkPrompt";
import { shownStreak } from "@/lib/weekStreak";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import Nav from "@/components/Nav";
import NotificationPrompt from "@/components/NotificationPrompt";
import MissionsSummary from "@/components/MissionsSummary";
import SaveProgressPrompt from "@/components/SaveProgressPrompt";
import PageLoading from "@/components/PageLoading";
import TodaySessionCard from "@/components/today/TodaySessionCard";
import WeekStrip from "@/components/today/WeekStrip";
import NextGoalCard from "@/components/today/NextGoalCard";
import CommunityEventCard from "@/components/CommunityEventCard";
import { useTodaysSession } from "@/hooks/useTodaysSession";
import { ensureCurrentWeekMissions } from "@/lib/missions";
import { levelProgress } from "@/lib/levelPath";
import { fetchSessionsBetween } from "@/lib/store";
import { trainedToday, weekStart, weekStrip } from "@/lib/weekStrip";
import CoolDownCard, { RestDayCard } from "@/components/CoolDown";
import ExtrasLinks from "@/components/ExtrasLinks";
import TrainingBlockCard from "@/components/TrainingBlockCard";
import WeatherCard from "@/components/today/WeatherCard";
import WeekShiftCard from "@/components/today/WeekShiftCard";
import { weekPlan } from "@/lib/weekShift";
import TodayEquipmentBanner from "@/components/today/TodayEquipmentBanner";
import { SessionRecord } from "@/lib/types";
import { Flame } from "lucide-react";

// Today: what to do now, in one screen. Today's session is the hero and
// starts in one tap; under it, the week so far, one goal to aim at, and
// this week's missions. Everything else lives in its own tab.
export default function TodayPage() {
  const { user, userDoc, loading } = useAuth();
  const { tx, locale } = useLanguage();
  const router = useRouter();
  const {
    session: activeSession,
    completed: activeCompleted,
    startSession,
    expand,
  } = useTrainingSession();
  const { sport, focus, fitted, check, lighterBy, todayEquipment, labelOf, usualLength, fullLengthToday, readiness, setReadiness, lighterWeek } = useTodaysSession(userDoc);
  const [weekSessions, setWeekSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  // this week's sessions, refetched after each one is logged
  const uid = userDoc?.uid;
  const sessionsDone = userDoc?.totalSessionsCompleted;
  useEffect(() => {
    if (!uid) return;
    const now = new Date();
    fetchSessionsBetween(
      uid,
      weekStart(now).toISOString(),
      new Date(now.getTime() + 60_000).toISOString(),
    )
      .then(setWeekSessions)
      .catch(() => setWeekSessions([]));
  }, [uid, sessionsDone]);

  const now = useMemo(() => new Date(), []);
  if (loading || !userDoc || !fitted || !focus)
    return <PageLoading variant="today" />;

  const level = levelProgress(userDoc.xp).level;
  const outdoor = !SPORT_META[sport].indoor; // weather, parks and the park question
  const missions = ensureCurrentWeekMissions(userDoc.missions ?? []);
  // the week's plan, moved if a training day was skipped (weekShift.ts)
  const baseDays = userDoc.body?.trainingDaysOfWeek ?? [];
  const plan = weekPlan(baseDays, weekSessions, now, userDoc.skippedDays);
  const days = weekStrip(now, weekSessions, plan.days);
  const doneToday = trainedToday(now, weekSessions);
  const inSession = !!activeSession && !activeCompleted;
  const plannedCount = userDoc.body?.trainingDaysOfWeek?.length ?? 0;
  const firstName = userDoc.displayName?.split(" ")[0] ?? "Athlete";
  const rawDate = now.toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const dateLine = rawDate.charAt(0).toUpperCase() + rawDate.slice(1); // "giovedì 19 novembre" → "Giovedì 19 novembre"

  return (
    <>
      <Nav />
      <main
        id="main"
        tabIndex={-1}
        className="max-w-xl md:max-w-6xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4"
      >
        <header className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">{dateLine}</p>
            <h1 className="heading text-2xl text-zinc-100 truncate">
              {tx("Hi, {name}", { name: firstName })}
            </h1>
          </div>
          {shownStreak(userDoc) > 0 && (
            <div
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm"
              aria-label={tx(
                shownStreak(userDoc) === 1
                  ? "1-week streak"
                  : "{n}-week streak",
                { n: shownStreak(userDoc) },
              )}
            >
              <Flame size={15} className="text-orange-400" />
              <span className="stat-mono">{shownStreak(userDoc)}</span>
            </div>
          )}
        </header>

        {/* a dashboard on wide screens: today's session and what goes with it on the
            left, the week, goals and missions on the right; one column on a phone */}
        {/* two columns from a tablet up */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-5 md:items-start">
          <div className="space-y-4 md:col-span-7">
            <TodaySessionCard
              session={fitted.session}
              focusLabel={labelOf(focus)}
              inProgress={!!activeSession && !activeCompleted}
              doneToday={doneToday}
              lighterBy={lighterBy}
              usualLength={usualLength}
              onFullLength={fullLengthToday}
              readiness={readiness}
              onReadiness={setReadiness}
              lighterWeek={lighterWeek}
              where={outdoor && !doneToday ? tx(!todayEquipment ? "Usual spot" : todayEquipment.kind === "park" ? todayEquipment.label : "At home") : undefined}
              onStart={() =>
                outdoor
                  ? askParkFirst(userDoc).then(() => startSession(fitted.session))
                  : startSession(fitted.session)
              }
              onResume={expand}
            />

            {/* the session comes first; where, the weather and one-off questions after it */}
            {outdoor && !doneToday && !(activeSession && !activeCompleted) && (
              <>
                <TodayEquipmentBanner value={todayEquipment} own={userDoc.equipment} whereLog={userDoc.whereLog} />
                <WeatherCard userDoc={userDoc} override={todayEquipment} />
              </>
            )}

            <BlockQuestion />
            <SaveProgressPrompt compact />
            <NotificationPrompt />

            {baseDays.length > 0 && !doneToday && !inSession && (
              <WeekShiftCard plan={plan} canSkipToday={plan.todayPlanned} />
            )}

            {/* stretches for what today's session worked most */}
            {doneToday && !(activeSession && !activeCompleted) && (
              <CoolDownCard
                exercises={weekSessions
                  .filter(
                    (s) =>
                      new Date(s.finishedAt).toDateString() ===
                      now.toDateString(),
                  )
                  .flatMap((s) =>
                    s.exercises.filter((e) => e.outcome === "done"),
                  )}
              />
            )}

            {/* a day off in the plan: easy mobility instead */}
            {!doneToday &&
              !(activeSession && !activeCompleted) &&
              days.some((d) => d.isToday && !d.planned) && <RestDayCard />}
          </div>

          <div className="space-y-4 md:col-span-5">
            <WeekStrip days={days} planned={plannedCount} />
            <SportWeekSummary userDoc={userDoc} weekSessions={weekSessions} />

            {outdoor ? (
              <>
                <TrainingBlockCard />
                {/* once today's session is done, its Skill Check is no longer "today" */}
                <NextGoalCard
                  userDoc={userDoc}
                  check={doneToday ? null : check}
                  playerLevel={level}
                />
              </>
            ) : (
              <SportProgressCard />
            )}

            <ExtrasLinks />

            <MissionsSummary missions={missions} />

            <CommunityEventCard />
          </div>
        </div>
      </main>
    </>
  );
}
