"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import Nav from "@/components/Nav";
import SessionView from "@/components/SessionView";
import PlanReviewButton from "@/components/PlanReviewButton";
import TrainSwitcher from "@/components/TrainSwitcher";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { FOCUS_LABEL } from "@/lib/trainingGenerator";
import { completeSession, Celebration } from "@/lib/sessionComplete";
import { ExerciseFeedback, TrainingSession } from "@/lib/types";
import { adaptedCount, historySummary } from "@/lib/adaptation";
import { useToast } from "@/context/ToastContext";
import { Play, ChevronDown, Dices } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTodaysSession } from "@/hooks/useTodaysSession";
import PageLoading from "@/components/PageLoading";

export default function TrainingPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const router = useRouter();
  const { startSession, expand, session: globalSession, completed: globalCompleted, showReport } = useTrainingSession();
  const toast = useToast();
  const { tx } = useLanguage();
  const [completed, setCompleted] = useState(false);
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

  const { focus, options, fitted, lighterBy, setFocusOverride } = useTodaysSession(userDoc);

  // an AI-applied version only replaces the base session for as long as
  // it's actually for today's same focus — switching focus should show a
  // fresh, un-reviewed session, not a stale AI edit for a different track
  useEffect(() => {
    setAiAppliedSession(null);
  }, [focus]);

  const displayedSession = aiAppliedSession ?? fitted?.session ?? null;

  if (loading || !userDoc || !displayedSession) {
    return <PageLoading variant="today" />;
  }

  const handleComplete = async (feedback: ExerciseFeedback[], meta: { durationMin?: number; effort?: { planned: number; done: number; tired: boolean } }) => {
    try {
      const { patch, celebration: c, report } = await completeSession(userDoc, displayedSession, {
        feedback,
        durationMin: meta.durationMin,
        effort: meta.effort,
      });
      const gained = (patch.xp ?? userDoc.xp) - userDoc.xp;
      setXpGained(gained);
      setCompleted(true);
      if (!showReport(report, { celebration: c, xpGained: gained })) setCelebration(c);
      await refreshUserDoc();
    } catch {
      toast.error("Couldn't log your session — check your connection and try again.");
    }
  };

  return (
    <>
      <Nav />
      <CelebrationOverlay celebration={celebration} />
      <main id="main" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <TrainSwitcher active="today" />
        <h1 className="heading text-2xl text-zinc-100">{tx("Today's session")}</h1>

        {/* focus — collapsed to a single line by default; expand only to change it */}
        <button
          onClick={() => setShowFocusPicker((s) => !s)}
          className="w-full panel px-3.5 py-2.5 flex items-center justify-between text-sm"
        >
          <span className="text-zinc-300">
            {tx("Focus:")} <span className="text-zinc-100">{tx(FOCUS_LABEL[focus!])}</span>
          </span>
          <span className="text-xs text-muted flex items-center gap-1">
            {tx("Change")} <ChevronDown size={14} className={showFocusPicker ? "rotate-180 transition-transform" : "transition-transform"} />
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
                  {tx(FOCUS_LABEL[f])}
                  {userDoc.goalTracks?.includes(f) && <span className="text-orange-400"> ★</span>}
                </button>
              ))}
            </div>
            <Link href="/onboarding" className="text-xs text-muted hover:text-orange-400 mt-2 inline-block">
              {tx("Not seeing a focus? Update your available equipment")}
            </Link>
          </div>
        )}


        {globalSession && !globalCompleted && (
          <div className="panel p-3 border-orange-500/40 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-100">{tx("A training session is already in progress.")}</div>
            <button
              onClick={expand}
              className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 shrink-0"
            >
              {tx("Resume it")}
            </button>
          </div>
        )}

        {completed && xpGained !== null && (
          <div className="panel p-3 border-emerald-600 text-emerald-400 text-sm">
            {tx("Session logged — you earned +{n} XP.", { n: xpGained })}
          </div>
        )}

        {fitted?.changed && !aiAppliedSession && !completed && (
          <div className="text-xs text-muted px-1">
            {tx("Fitted to your {n} min sessions (was ~{m} min).", {
              n: userDoc.body?.sessionLengthMinutes ?? 45,
              m: fitted.minutesBefore,
            })}{" "}
            <Link href="/profile?tab=settings" className="text-orange-400 underline underline-offset-2">
              {tx("Change")}
            </Link>
          </div>
        )}

        {lighterBy > 0 && !aiAppliedSession && !completed && (
          <div className="text-xs text-sky-400/90 px-1">
            {tx("About {n}% lighter today — matched to the effort you've had energy for in recent sessions.", { n: lighterBy })}
          </div>
        )}

        {adaptedCount(displayedSession) > 0 && !completed && (
          <div className="text-xs text-sky-400/90 px-1">
            {tx("{n} adapted from your recent sessions — based on what you completed, skipped or found too hard.", {
              n: adaptedCount(displayedSession),
            })}
          </div>
        )}

        <SessionView
          session={displayedSession}
          equipment={userDoc.equipment}
          onComplete={handleComplete}
          completed={completed || globalCompleted}
          onStartFocusMode={() => startSession(displayedSession)}
        />

        {!(completed || globalCompleted) && (
          <PlanReviewButton
            session={displayedSession}
            skills={userDoc.skills}
            history={historySummary(userDoc.exerciseStats, userDoc.claims)}
            equipment={userDoc.equipment}
            onApply={setAiAppliedSession}
          />
        )}

        {/* the wheel is a reward for finishing, not a main feature */}
        {(completed || globalCompleted) && (
          <Link
            href="/wheel"
            className="panel p-4 flex items-center gap-3 border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-transparent hover:border-orange-500 transition-colors animate-overlay-fade-in"
          >
            <span className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
              <Dices size={20} className="text-orange-400" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block heading text-base text-zinc-100">{tx("Bonus round unlocked")}</span>
              <span className="block text-xs text-zinc-400">{tx("Still have energy? Spin the wheel for one extra exercise and bonus XP.")}</span>
            </span>
          </Link>
        )}
      </main>

      {showFab && !globalSession && (
        <button
          onClick={() => startSession(displayedSession)}
          className="fixed bottom-20 sm:bottom-6 left-4 z-40 heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 pl-4 pr-5 py-3 rounded-full shadow-lg flex items-center gap-2"
        >
          <Play size={15} /> {tx("Start Training")}
        </button>
      )}
    </>
  );
}
