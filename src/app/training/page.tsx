"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import SessionView from "@/components/SessionView";
import PomodoroTimer from "@/components/PomodoroTimer";
import { generateSession, pickFocus, availableFocuses, FOCUS_LABEL } from "@/lib/trainingGenerator";
import { completeSession } from "@/lib/sessionComplete";
import { SkillTrack } from "@/lib/types";

export default function TrainingPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const router = useRouter();
  const [focusOverride, setFocusOverride] = useState<SkillTrack | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  const equipment = userDoc?.equipment;
  const options = useMemo(() => (equipment ? availableFocuses(equipment) : []), [equipment]);
  const focus = focusOverride ?? (equipment ? pickFocus(new Date(), equipment, userDoc?.goalTracks ?? []) : null);

  const session = useMemo(() => {
    if (!userDoc || !focus) return null;
    return generateSession(userDoc.skills, userDoc.equipment, focus);
  }, [userDoc, focus]);

  if (loading || !userDoc || !session) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const handleComplete = async () => {
    const patch = await completeSession(userDoc, session);
    setXpGained((patch.xp ?? userDoc.xp) - userDoc.xp);
    setCompleted(true);
    await refreshUserDoc();
  };

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="heading text-2xl text-zinc-100">Today&apos;s session</h1>
          <div className="flex gap-2">
            <Link
              href="/plan"
              className="text-xs px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 rounded-lg"
            >
              Plan ahead
            </Link>
            <button
              onClick={() => setShowTimer((s) => !s)}
              className="text-xs px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 rounded-lg"
            >
              {showTimer ? "Hide timer" : "Show focus timer"}
            </button>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5">
            {options.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFocusOverride(f);
                  setCompleted(false);
                  setXpGained(null);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                  f === focus
                    ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                    : "border-zinc-700 text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {FOCUS_LABEL[f]}
                {userDoc.goalTracks?.includes(f) && <span className="text-orange-400"> ★</span>}
              </button>
            ))}
          </div>
          <Link href="/onboarding" className="text-xs text-zinc-500 hover:text-orange-400 mt-1.5 inline-block">
            Not seeing a focus? Update your available equipment
          </Link>
        </div>

        {showTimer && <PomodoroTimer />}

        {completed && xpGained !== null && (
          <div className="panel p-3 border-emerald-600 text-emerald-400 text-sm">
            Session logged — you earned +{xpGained} XP.
          </div>
        )}

        <SessionView session={session} onComplete={handleComplete} completed={completed} />
      </main>
    </>
  );
}
