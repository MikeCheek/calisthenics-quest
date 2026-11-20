"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ExerciseFeedback, TrainingSession } from "@/lib/types";
import { awardXp, completeSession, Celebration } from "@/lib/sessionComplete";
import { xpRules } from "@/lib/sessionXp";
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
import { lockScreenPref, startKeepAlive, stopKeepAlive } from "@/lib/mediaSession";
import { clearActiveSession, loadActiveSession, saveActiveSession } from "@/lib/activeSession";

// What the session earned, shown at the top of the post-session report so a
// finished session ends in one window instead of a celebration overlay, a
// toast and a modal stacked on top of each other.
export interface SessionSummary {
  celebration: Celebration;
  xpGained: number;
}

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
  finishSession: (
    feedback?: ExerciseFeedback[],
    extras?: { transitionRestRatio?: number; effort?: { planned: number; done: number; tired: boolean } }
  ) => Promise<void>;
  discardSession: () => void;
  report: AdaptationReport | null;
  summary: SessionSummary | null;
  // returns false when there was nothing worth a report, so the caller can
  // fall back to a celebration overlay or toast
  showReport: (r: AdaptationReport, summary?: SessionSummary) => boolean;
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
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const showReport = useCallback((r: AdaptationReport, s?: SessionSummary) => {
    if (!reportIsWorthShowing(r)) return false;
    setReport(r);
    setSummary(s ?? null);
    return true;
  }, []);
  const clearReport = useCallback(() => {
    setReport(null);
    setSummary(null);
  }, []);

  // Accepting moves the skill's stage (the athlete's call, since it sets the
  // level); declining snoozes that suggestion for a week.
  const resolveSuggestion = useCallback(
    async (s: StageSuggestion, accept: boolean) => {
      if (!userDoc) return;
      try {
        if (accept) {
          const next = acceptStageSuggestion(userDoc.skills, userDoc.skillMastery ?? {}, userDoc.skillProgress ?? {}, s);
          await updateProgress(userDoc.uid, { skills: next.skills, skillMastery: next.mastery, skillProgress: next.progress });
          if (s.direction === "up") {
            // stepping up a stage earned in training is worth a bonus (sessionXp.ts)
            const bonus = xpRules().stageUp;
            await awardXp(userDoc, bonus);
            toast.success(`Stage updated — new progressions from your next session. +${bonus} XP`);
          } else toast.success("Stage eased — next sessions will rebuild it.");
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

  // ---- kept on this device, so closing or reloading doesn't lose it ----
  const uid = userDoc?.uid ?? null;
  const restoredFor = useRef<string | null>(null);
  useEffect(() => {
    if (!uid || restoredFor.current === uid) return;
    restoredFor.current = uid;
    const saved = loadActiveSession(uid);
    if (!saved) return;
    startedAtRef.current = saved.startedAt;
    setSession(saved.session);
    setPaused(saved.paused);
    setCompleted(false);
    // opened from the "training in progress" notification: straight back in;
    // otherwise the resume bubble shows and one tap reopens it
    const url = new URL(window.location.href);
    const fromNotice = url.searchParams.get("resume") === "1";
    setExpanded(fromNotice);
    if (fromNotice) {
      url.searchParams.delete("resume"); // a later reload shouldn't reopen it again
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [uid]);

  useEffect(() => {
    if (!uid || !session) return;
    saveActiveSession({ uid, startedAt: startedAtRef.current, session, paused });
  }, [uid, session, paused]);

  const startSession = useCallback((s: TrainingSession) => {
    startedAtRef.current = Date.now();
    // lock-screen controls need audio started from this tap (opt-in)
    if (lockScreenPref()) startKeepAlive();
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
    stopKeepAlive();
    clearActiveSession();
    setSession(null);
    setExpanded(false);
    setPaused(false);
    setCompleted(false);
    setCurrentExerciseName(null);
  }, []);

  const finishSession = useCallback(async (feedback?: ExerciseFeedback[], extras?: { transitionRestRatio?: number; effort?: { planned: number; done: number; tired: boolean } }) => {
    if (!session || !userDoc || completed) return;
    try {
      const { patch, celebration: c, report: r } = await completeSession(userDoc, session, {
        feedback,
        transitionRestRatio: extras?.transitionRestRatio,
        effort: extras?.effort,
        durationMin: plausibleDuration(startedAtRef.current),
      });
      const xpGained = (patch.xp ?? userDoc.xp) - userDoc.xp;
      const shown = showReport(r, { celebration: c, xpGained });
      setCompleted(true);
      await refreshUserDoc();
      if (!shown) {
        if (c.leveledUp) setCelebration(c);
        else toast.success(`Session logged — you earned +${xpGained} XP.`);
      }
    } catch {
      toast.error("Couldn't log your session — check your connection and try again.");
      return;
    }
    stopKeepAlive();
    clearActiveSession();
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
        summary,
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
