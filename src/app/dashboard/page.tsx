"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import XPBar from "@/components/XPBar";
import MissionList from "@/components/MissionList";
import { ensureCurrentWeekMissions } from "@/lib/missions";
import { pickFocus, FOCUS_LABEL } from "@/lib/trainingGenerator";

export default function DashboardPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const missions = ensureCurrentWeekMissions(userDoc.missions ?? []);
  const todaysFocus = FOCUS_LABEL[pickFocus(new Date(), userDoc.equipment, userDoc.goalTracks)];

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-5">
        <div>
          <h1 className="heading text-2xl text-zinc-100">
            Welcome back, {userDoc.displayName?.split(" ")[0] ?? "Athlete"}
          </h1>
          <p className="text-zinc-400 text-sm">
            {userDoc.totalSessionsCompleted} sessions logged · today&apos;s focus: {todaysFocus}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <XPBar xp={userDoc.xp} streak={userDoc.streak} />
          <div className="panel p-4 flex flex-col justify-between">
            <div>
              <div className="heading text-base text-zinc-100 mb-1">Ready to move?</div>
              <div className="text-sm text-zinc-400">
                Get today&apos;s tailored session for {todaysFocus}.
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link
                href="/training"
                className="flex-1 text-center py-2.5 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950"
              >
                Start training
              </Link>
              <Link
                href="/pair"
                className="flex-1 text-center py-2.5 rounded-lg heading text-sm border border-zinc-700 text-zinc-100 hover:border-orange-500"
              >
                Pair up
              </Link>
            </div>
          </div>
        </div>

        <MissionList missions={missions} />

        <Link href="/path" className="panel p-4 flex items-center justify-between border-orange-500/30">
          <div>
            <div className="heading text-base text-zinc-100">Trophy road</div>
            <div className="text-sm text-zinc-400">All 50 skills, mapped across every level</div>
          </div>
          <span className="text-orange-400 text-sm">Open →</span>
        </Link>

        <Link href="/plan" className="panel p-4 flex items-center justify-between">
          <div>
            <div className="heading text-base text-zinc-100">Plan ahead</div>
            <div className="text-sm text-zinc-400">Generate a schedule for the week or month</div>
          </div>
          <span className="text-orange-400 text-sm">Open →</span>
        </Link>

        <Link href="/profile" className="panel p-4 flex items-center justify-between">
          <div>
            <div className="heading text-base text-zinc-100">Your progress</div>
            <div className="text-sm text-zinc-400">Skill radar, XP trend, and your goals</div>
          </div>
          <span className="text-orange-400 text-sm">View →</span>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/skills" className="panel p-3 text-center">
            <div className="text-sm text-zinc-100">Skills catalog</div>
            <div className="text-xs text-zinc-500">All 50, with tips</div>
          </Link>
          <Link href="/pomodoro" className="panel p-3 text-center">
            <div className="text-sm text-zinc-100">Focus timer</div>
            <div className="text-xs text-zinc-500">Pomodoro-style</div>
          </Link>
        </div>
      </main>
    </>
  );
}
