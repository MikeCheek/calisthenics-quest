"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { TrainingSession } from "@/lib/types";
import { completeSession, Celebration } from "@/lib/sessionComplete";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

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
  finishSession: () => Promise<void>;
  discardSession: () => void;
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

  const startSession = useCallback((s: TrainingSession) => {
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

  const finishSession = useCallback(async () => {
    if (!session || !userDoc || completed) return;
    try {
      const { patch, celebration: c } = await completeSession(userDoc, session);
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
