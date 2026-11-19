"use client";

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
import { useTodaysSession } from "@/hooks/useTodaysSession";
import { ensureCurrentWeekMissions } from "@/lib/missions";
import { FOCUS_LABEL } from "@/lib/trainingGenerator";
import { levelProgress } from "@/lib/levelPath";
import { fetchSessionsBetween } from "@/lib/store";
import { trainedToday, weekStart, weekStrip } from "@/lib/weekStrip";
import { SessionRecord } from "@/lib/types";
import { Flame } from "lucide-react";

// Today: what to do now, in one screen. Today's session is the hero and
// starts in one tap; under it, the week so far, one goal to aim at, and
// this week's missions. Everything else lives in its own tab.
export default function TodayPage() {
  const { user, userDoc, loading } = useAuth();
  const { tx, locale } = useLanguage();
  const router = useRouter();
  const { session: activeSession, completed: activeCompleted, startSession, expand } = useTrainingSession();
  const { focus, fitted, check, lighterBy } = useTodaysSession(userDoc);
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
    fetchSessionsBetween(uid, weekStart(now).toISOString(), new Date(now.getTime() + 60_000).toISOString())
      .then(setWeekSessions)
      .catch(() => setWeekSessions([]));
  }, [uid, sessionsDone]);

  const now = useMemo(() => new Date(), []);
  if (loading || !userDoc || !fitted || !focus) return <PageLoading />;

  const level = levelProgress(userDoc.xp).level;
  const missions = ensureCurrentWeekMissions(userDoc.missions ?? []);
  const days = weekStrip(now, weekSessions, userDoc.body?.trainingDaysOfWeek ?? []);
  const doneToday = trainedToday(now, weekSessions);
  const plannedCount = userDoc.body?.trainingDaysOfWeek?.length ?? 0;
  const firstName = userDoc.displayName?.split(" ")[0] ?? "Athlete";
  const rawDate = now.toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { weekday: "long", day: "numeric", month: "long" });
  const dateLine = rawDate.charAt(0).toUpperCase() + rawDate.slice(1); // "giovedì 19 novembre" → "Giovedì 19 novembre"

  return (
    <>
      <Nav />
      <main className="max-w-xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <header className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">{dateLine}</p>
            <h1 className="heading text-2xl text-zinc-100 truncate">{tx("Hi, {name}", { name: firstName })}</h1>
          </div>
          {userDoc.streak > 0 && (
            <div
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm"
              aria-label={tx("{n}-day streak", { n: userDoc.streak })}
            >
              <Flame size={15} className="text-orange-400" />
              <span className="stat-mono">{userDoc.streak}</span>
            </div>
          )}
        </header>

        <SaveProgressPrompt compact />
        <NotificationPrompt />

        <TodaySessionCard
          session={fitted.session}
          focusLabel={FOCUS_LABEL[focus]}
          inProgress={!!activeSession && !activeCompleted}
          doneToday={doneToday}
          lighterBy={lighterBy}
          onStart={() => startSession(fitted.session)}
          onResume={expand}
        />

        <WeekStrip days={days} planned={plannedCount} />

        {/* once today's session is done, its Skill Check is no longer "today" */}
        <NextGoalCard userDoc={userDoc} check={doneToday ? null : check} playerLevel={level} />

        <MissionsSummary missions={missions} />
      </main>
    </>
  );
}
