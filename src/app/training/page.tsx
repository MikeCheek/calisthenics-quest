"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import Nav from "@/components/Nav";
import SessionView from "@/components/SessionView";
import PlanReviewButton from "@/components/PlanReviewButton";
import PomodoroTimer from "@/components/PomodoroTimer";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { generateSession, pickFocus, availableFocuses, FOCUS_LABEL } from "@/lib/trainingGenerator";
import { completeSession, Celebration } from "@/lib/sessionComplete";
import { SkillTrack, TrainingSession } from "@/lib/types";
import { Play, ChevronDown, Timer, CalendarDays, Dices } from "lucide-react";

export default function TrainingPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const router = useRouter();
  const { startSession, expand, session: globalSession, completed: globalCompleted } = useTrainingSession();
  const [focusOverride, setFocusOverride] = useState<SkillTrack | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showFocusPicker, setShowFocusPicker] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [aiAppliedSession, setAiAppliedSession] = useState<TrainingSession | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  // The floating "Start Training" button only shows once the on-page one
  // has scrolled out of view, and only when there isn't already a session
  // in progress (that has its own resume banner + the persistent bubble).
  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 280);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const equipment = userDoc?.equipment;
  const options = useMemo(() => (equipment ? availableFocuses(equipment) : []), [equipment]);
  const focus = focusOverride ?? (equipment ? pickFocus(new Date(), equipment, userDoc?.goalTracks ?? []) : null);

  const session = useMemo(() => {
    if (!userDoc || !focus) return null;
    return generateSession(userDoc.skills, userDoc.equipment, focus);
  }, [userDoc, focus]);

  // an AI-applied version only replaces the base session for as long as
  // it's actually for today's same focus — switching focus should show a
  // fresh, un-reviewed session, not a stale AI edit for a different track
  useEffect(() => {
    setAiAppliedSession(null);
  }, [focus]);

  const displayedSession = aiAppliedSession ?? session;

  if (loading || !userDoc || !displayedSession) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const handleComplete = async () => {
    const { patch, celebration: c } = await completeSession(userDoc, displayedSession);
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
        <div className="flex items-center justify-between gap-2">
          <h1 className="heading text-2xl text-zinc-100">Today&apos;s session</h1>
          <div className="flex gap-1.5 shrink-0">
            <Link
              href="/plan"
              className="p-2 border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 rounded-lg"
              aria-label="Plan ahead"
            >
              <CalendarDays size={16} />
            </Link>
            <button
              onClick={() => setShowTimer((s) => !s)}
              className={`p-2 border rounded-lg ${
                showTimer ? "border-orange-500 text-orange-400" : "border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100"
              }`}
              aria-label={showTimer ? "Hide focus timer" : "Show focus timer"}
            >
              <Timer size={16} />
            </button>
          </div>
        </div>

        {/* focus — collapsed to a single line by default; expand only to change it */}
        <button
          onClick={() => setShowFocusPicker((s) => !s)}
          className="w-full panel px-3.5 py-2.5 flex items-center justify-between text-sm"
        >
          <span className="text-zinc-300">
            Focus: <span className="text-zinc-100">{FOCUS_LABEL[focus!]}</span>
          </span>
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            Change <ChevronDown size={14} className={showFocusPicker ? "rotate-180 transition-transform" : "transition-transform"} />
          </span>
        </button>
        {showFocusPicker && (
          <div className="panel p-3 -mt-2">
            <div className="flex flex-wrap gap-1.5">
              {options.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFocusOverride(f);
                    setCompleted(false);
                    setXpGained(null);
                    setShowFocusPicker(false);
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
            <Link href="/onboarding" className="text-xs text-zinc-500 hover:text-orange-400 mt-2 inline-block">
              Not seeing a focus? Update your available equipment
            </Link>
          </div>
        )}

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
          session={displayedSession}
          equipment={userDoc.equipment}
          onComplete={handleComplete}
          completed={completed || globalCompleted}
          onStartFocusMode={() => startSession(displayedSession)}
        />

        <div className="grid grid-cols-2 gap-2">
          <PlanReviewButton
            session={displayedSession}
            skills={userDoc.skills}
            equipment={userDoc.equipment}
            onApply={setAiAppliedSession}
          />
          <Link
            href="/wheel"
            className="flex items-center justify-center gap-2 text-sm px-3 py-2.5 rounded-lg border border-orange-500/40 bg-orange-500/5 text-zinc-100 hover:bg-orange-500/10"
          >
            <Dices size={15} className="text-orange-400" /> Bonus wheel
          </Link>
        </div>
      </main>

      {showFab && !globalSession && (
        <button
          onClick={() => startSession(displayedSession)}
          className="fixed bottom-20 sm:bottom-6 left-4 z-40 heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 pl-4 pr-5 py-3 rounded-full shadow-lg flex items-center gap-2"
        >
          <Play size={15} /> Start Training
        </button>
      )}
    </>
  );
}
