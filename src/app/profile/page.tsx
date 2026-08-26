"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import SkillRadarChart from "@/components/SkillRadarChart";
import XPHistoryChart from "@/components/XPHistoryChart";
import { xpProgress, rankTitle } from "@/lib/xp";
import { TRACK_LABEL } from "@/lib/types";

export default function ProfilePage() {
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

  const progress = xpProgress(userDoc.xp);

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading text-2xl text-zinc-100">{userDoc.displayName}</h1>
            <p className="text-zinc-400 text-sm">
              Level {progress.level} · {rankTitle(progress.level)} · {userDoc.streak} day streak
            </p>
          </div>
          <Link
            href="/onboarding"
            className="text-xs px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 rounded-lg shrink-0"
          >
            Edit profile
          </Link>
        </div>

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">Skill radar</div>
          <SkillRadarChart skills={userDoc.skills} />
        </div>

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-3">XP over time</div>
          <XPHistoryChart history={userDoc.xpHistory ?? []} />
        </div>

        {userDoc.goalTracks?.length > 0 && (
          <div className="panel p-4">
            <div className="heading text-base text-zinc-100 mb-2">Your goals</div>
            <div className="flex flex-wrap gap-2">
              {userDoc.goalTracks.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-full border border-orange-500/50 bg-orange-500/10 text-orange-300"
                >
                  {TRACK_LABEL[t]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">Body</div>
          <div className="grid grid-cols-3 gap-2.5 text-sm">
            <Stat label="Age" value={`${userDoc.body.ageYears} yrs`} />
            <Stat label="Height" value={`${userDoc.body.heightCm} cm`} />
            <Stat label="Weight" value={`${userDoc.body.weightKg} kg`} />
          </div>
        </div>

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">Where you train</div>
          <div className="flex flex-wrap gap-2">
            {[
              ["Pull-up bar", userDoc.equipment.pullUpBar],
              ["Parallel bars / dip station", userDoc.equipment.parallelBars],
              ["Rings", userDoc.equipment.rings],
              ["Wall space", userDoc.equipment.wallSpace],
              ["Vertical pole", userDoc.equipment.verticalPole],
              ["Monkey bars", userDoc.equipment.monkeyBars],
            ].map(([label, has]) => (
              <span
                key={label as string}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  has ? "border-emerald-600 text-emerald-400 bg-emerald-600/10" : "border-zinc-700 text-zinc-500"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-700 rounded-lg p-2.5 text-center">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-zinc-100 stat-mono">{value}</div>
    </div>
  );
}
