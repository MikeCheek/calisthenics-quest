"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import Nav from "@/components/Nav";
import SessionView from "@/components/SessionView";
import PomodoroTimer from "@/components/PomodoroTimer";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { generateSession, pickFocus, availableFocuses, FOCUS_LABEL } from "@/lib/trainingGenerator";
import { completeSession, Celebration } from "@/lib/sessionComplete";
import { SkillTrack } from "@/lib/types";
import { Dices } from "lucide-react";

export default function TrainingPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const router = useRouter();
  const { startSession, expand, session: globalSession, completed: globalCompleted } = useTrainingSession();
  const [focusOverride, setFocusOverride] = useState<SkillTrack | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

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
    const { patch, celebration: c } = await completeSession(userDoc, session);
    setXpGained((patch.xp ?? userDoc.xp) - userDoc.xp);
    setCompleted(true);
    setCelebration(c);
    await refreshUserDoc();
  };

  return (
    <>
      <Nav />
      <CelebrationOverlay celebration={celebration} />
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

        {globalSession && !globalCompleted && (
          <div className="panel p-3 border-orange-500/40 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-100">A training session is already in progress.</div>
            <button
              onClick={expand}
              className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 shrink-0"
            >
              Resume it
            </button>
          </div>
        )}

        {completed && xpGained !== null && (
          <div className="panel p-3 border-emerald-600 text-emerald-400 text-sm">
            Session logged — you earned +{xpGained} XP.
          </div>
        )}

        <SessionView
          session={session}
          equipment={userDoc.equipment}
          onComplete={handleComplete}
          completed={completed || globalCompleted}
          onStartFocusMode={() => startSession(session)}
        />

        <Link
          href="/wheel"
          className="w-full flex items-center justify-center gap-2 text-sm px-3 py-3 rounded-lg border border-orange-500/40 bg-orange-500/5 text-zinc-100 hover:bg-orange-500/10"
        >
          <Dices size={16} className="text-orange-400" /> Spin the bonus wheel
        </Link>
      </main>
    </>
  );
}
