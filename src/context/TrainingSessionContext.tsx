"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { ExerciseFeedback, TrainingSession } from "@/lib/types";
import { completeSession, Celebration } from "@/lib/sessionComplete";
import {
  AdaptationReport,
  StageSuggestion,
  acceptStageSuggestion,
  snoozeStageSuggestion,
} from "@/lib/adaptation";
import { updateProgress } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { plausibleDuration } from "@/lib/sessionHistory";

interface TrainingSessionContextValue {
  session: TrainingSession | null;
  expanded: boolean;
  paused: boolean;
  completed: boolean;
  currentExerciseName: string | null;
  celebration: Celebration | null;
  clearCelebration: () => void;
  startSession: (session: TrainingSession) => void;
  minimize: () => void;
  expand: () => void;
  togglePause: () => void;
  reportCurrentExercise: (name: string) => void;
  finishSession: (feedback?: ExerciseFeedback[], extras?: { transitionRestRatio?: number }) => Promise<void>;
  discardSession: () => void;
  report: AdaptationReport | null;
  showReport: (r: AdaptationReport) => void;
  clearReport: () => void;
  resolveSuggestion: (s: StageSuggestion, accept: boolean) => Promise<void>;
}

function reportIsWorthShowing(r: AdaptationReport): boolean {
  // every logged session now has something to offer: its share card
  return !!r.sessionRecord || r.masteryChanges.length > 0 || r.suggestions.length > 0 || r.verifications.length > 0 || r.records.length > 0;
}

const TrainingSessionContext = createContext<TrainingSessionContextValue | null>(null);

// Mounted once at the root, alongside Auth/Toast — a guided training
// session lives here rather than in the /training page's own state, so
// navigating to Profile, Skills, wherever, doesn't unmount (and lose) it.
// FocusTrainingMode and the draggable bubble both read from this; which
// one is visible is just `expanded` — the session itself never resets.
export function TrainingSessionProvider({ children }: { children: React.ReactNode }) {
  const { userDoc, refreshUserDoc } = useAuth();
  const toast = useToast();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentExerciseName, setCurrentExerciseName] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const clearCelebration = useCallback(() => setCelebration(null), []);
  const [report, setReport] = useState<AdaptationReport | null>(null);
  const showReport = useCallback((r: AdaptationReport) => {
    if (reportIsWorthShowing(r)) setReport(r);
  }, []);
  const clearReport = useCallback(() => setReport(null), []);

  // Accepting moves the skill's stage (the athlete's call, since it sets the
  // level); declining snoozes that suggestion for a week.
  const resolveSuggestion = useCallback(
    async (s: StageSuggestion, accept: boolean) => {
      if (!userDoc) return;
      try {
        if (accept) {
          const next = acceptStageSuggestion(userDoc.skills, userDoc.skillMastery ?? {}, userDoc.skillProgress ?? {}, s);
          await updateProgress(userDoc.uid, { skills: next.skills, skillMastery: next.mastery, skillProgress: next.progress });
          toast.success(s.direction === "up" ? "Stage updated — new progressions from your next session." : "Stage eased — next sessions will rebuild it.");
        } else {
          await updateProgress(userDoc.uid, { skillProgress: snoozeStageSuggestion(userDoc.skillProgress ?? {}, s) });
        }
        await refreshUserDoc();
      } catch {
        toast.error("Couldn't save that change — check your connection and try again.");
        return;
      }
      setReport((r) => {
        if (!r) return r;
        const rest = r.suggestions.filter((x) => x.skill !== s.skill);
        const next = { ...r, suggestions: rest };
        return reportIsWorthShowing(next) ? next : null;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userDoc]
  );

  // guided mode measures duration from when it was started
  const startedAtRef = useRef<number | null>(null);

  const startSession = useCallback((s: TrainingSession) => {
    startedAtRef.current = Date.now();
    setSession(s);
    setExpanded(true);
    setPaused(false);
    setCompleted(false);
    setCurrentExerciseName(null);
  }, []);

  const minimize = useCallback(() => setExpanded(false), []);
  const expand = useCallback(() => setExpanded(true), []);
  const togglePause = useCallback(() => setPaused((p) => !p), []);
  const reportCurrentExercise = useCallback((name: string) => setCurrentExerciseName(name), []);

  const discardSession = useCallback(() => {
    setSession(null);
    setExpanded(false);
    setPaused(false);
    setCompleted(false);
    setCurrentExerciseName(null);
  }, []);

  const finishSession = useCallback(async (feedback?: ExerciseFeedback[], extras?: { transitionRestRatio?: number }) => {
    if (!session || !userDoc || completed) return;
    try {
      const { patch, celebration: c, report: r } = await completeSession(userDoc, session, {
        feedback,
        transitionRestRatio: extras?.transitionRestRatio,
        durationMin: plausibleDuration(startedAtRef.current),
      });
      showReport(r);
      const xpGained = (patch.xp ?? userDoc.xp) - userDoc.xp;
      setCompleted(true);
      await refreshUserDoc();
      if (c.leveledUp) {
        setCelebration(c);
      } else {
        toast.success(`Session logged — you earned +${xpGained} XP.`);
      }
    } catch {
      toast.error("Couldn't log your session — check your connection and try again.");
      return;
    }
    setSession(null);
    setExpanded(false);
    setPaused(false);
    setCurrentExerciseName(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, userDoc, completed]);

  return (
    <TrainingSessionContext.Provider
      value={{
        session,
        expanded,
        paused,
        completed,
        currentExerciseName,
        celebration,
        clearCelebration,
        startSession,
        minimize,
        expand,
        togglePause,
        reportCurrentExercise,
        finishSession,
        discardSession,
        report,
        showReport,
        clearReport,
        resolveSuggestion,
      }}
    >
      {children}
    </TrainingSessionContext.Provider>
  );
}

export function useTrainingSession() {
  const ctx = useContext(TrainingSessionContext);
  if (!ctx) throw new Error("useTrainingSession must be used within TrainingSessionProvider");
  return ctx;
}
