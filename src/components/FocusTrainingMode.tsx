"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Exercise, ExerciseFeedback } from "@/lib/types";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import SkillCheckPanel from "@/components/SkillCheckPanel";
import ExerciseDemo from "@/components/ExerciseDemo";
import { TimerLog, TimerRestSample, summarizeTimerLog, bestHoldFromLog, learnedTransitionRest, cleanSets } from "@/lib/timingLearning";
import { statKey } from "@/lib/adaptation";
import { playRestSound, playGoSound } from "@/lib/sound";
import { MIN_BETWEEN_EXERCISE_REST, MAX_BETWEEN_EXERCISE_REST, estimateExercisesMinutes } from "@/lib/exerciseTiming";
import { findEasierExercise, HIERARCHY_EXEMPT_SETS } from "@/lib/exerciseHierarchy";
import { ChevronDown, ChevronLeft, ChevronRight, Info, Check, Pause, Play, SkipForward, BatteryLow, ArrowDownCircle, Sparkles, Volume2, VolumeX, Smartphone, MoreHorizontal, XCircle } from "lucide-react";
import Modal from "@/components/Modal";
import CancelSessionDialog from "@/components/CancelSessionDialog";
import dynamic from "next/dynamic";
import { mediaSessionSupported, lockScreenPref, setLockScreenPref, startKeepAlive, stopKeepAlive, updateLockScreen } from "@/lib/mediaSession";
import { speak, stopSpeaking, speakableDetail, speakableName, voicePref, setVoicePref, voiceSupported } from "@/lib/voice";
import type { TimerEvent } from "@/components/ExerciseTimer";
import { useLanguage } from "@/context/LanguageContext";
import { localizeDetail } from "@/lib/i18n/detail";
import { loadActiveSession, loadTimer, saveGuidedProgress, secondsLeftOf } from "@/lib/activeSession";
import { clockTime, closeTrainingNotice, keepScreenOn, letScreenSleep, showTrainingNotice, TrainingNotice } from "@/lib/backgroundSession";
import { parseTiming } from "@/lib/exerciseTiming";
import { exerciseEffort, fatigueOf, planEaseUp, totalEffort } from "@/lib/effort";

// the cool-down button loads only when the session is complete
const SessionCoolDown = dynamic(() => import("@/components/SessionCoolDown"), { ssr: false });

interface Step {
  key: string;
  setTitle: string;
  exercise: Exercise;
}

const EASE_LOOKUP_EQUIPMENT = {
  pullUpBar: true, parallelBars: true, rings: true, wallSpace: true,
  verticalPole: true, monkeyBars: true, weights: true, resistanceBands: true,
};

export default function FocusTrainingMode() {
  const { session, expanded, paused, minimize, togglePause, reportCurrentExercise, finishSession } =
    useTrainingSession();
  const { userDoc } = useAuth();
  const toast = useToast();
  const { tx, locale } = useLanguage();

  // ---- voice coaching ----
  const [voiceOn, setVoiceOn] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => {
    setCanSpeak(voiceSupported());
    setVoiceOn(voiceSupported() && voicePref());
  }, []);
  const voiceOnRef = useRef(voiceOn);
  voiceOnRef.current = voiceOn;
  const say = (english: string, vars?: Record<string, string | number>, interrupt = false) => {
    if (voiceOnRef.current) speak(tx(english, vars), locale, { interrupt });
  };
  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    setVoicePref(next);
    if (!next) stopSpeaking();
    else speak(tx("Voice coaching on"), locale, { interrupt: true });
  };
  // ---- lock-screen controls (opt-in: keeps silent audio playing) ----
  const [lockOn, setLockOn] = useState(false);
  const [canLock, setCanLock] = useState(false);
  useEffect(() => {
    setCanLock(mediaSessionSupported());
    setLockOn(mediaSessionSupported() && lockScreenPref());
  }, []);
  const toggleLock = () => {
    const next = !lockOn;
    setLockOn(next);
    setLockScreenPref(next);
    if (next) {
      startKeepAlive(); // from this tap, so playback is allowed
      toast.info("Lock-screen controls on. On some phones this pauses music from other apps.");
    } else stopKeepAlive();
  };
  const lockHandlers = useRef({ togglePause: () => {}, next: () => {}, previous: () => {} });

  const onTimerEvent = (e: TimerEvent) => {
    if (e.type === "setStart" && e.sets > 1) say(e.set === e.sets ? "Last set" : "Set {a} of {b}", { a: e.set, b: e.sets }, true);
    else if (e.type === "tenLeft") say("Ten seconds", undefined, true);
    else if (e.type === "rest") say("Rest {n} seconds", { n: e.seconds });
    else if (e.type === "done") say("Exercise complete");
  };

  const steps: Step[] = useMemo(() => {
    if (!session) return [];
    const flat: Step[] = [];
    session.sets.forEach((set) => {
      set.exercises.forEach((ex, i) => flat.push({ key: `${set.title}-${i}`, setTitle: set.title, exercise: ex }));
    });
    return flat;
  }, [session]);

  const [index, setIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [infoOpen, setInfoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [allDoneScreen, setAllDoneScreen] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [overrides, setOverrides] = useState<Record<number, Exercise>>({});
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [tooHard, setTooHard] = useState<ExerciseFeedback[]>([]);
  const [timerLogs, setTimerLogs] = useState<Record<number, TimerLog>>({});
  const [checkResults, setCheckResults] = useState<Record<number, number | boolean | undefined>>({});
  const [checkVideos, setCheckVideos] = useState<Record<number, string | undefined>>({});
  // effort (lib/effort.ts): sets done when stopped early, fatigue at each
  // skip, and the effort done when "I'm tired" was pressed
  const [earlyStops, setEarlyStops] = useState<Record<number, number>>({});
  const [fatigueAt, setFatigueAt] = useState<Record<number, number>>({});
  const [tiredAt, setTiredAt] = useState<number | null>(null);
  const plannedEffort = useMemo(() => totalEffort(steps), [steps]);
  // the cool-down covers what was actually done (swaps included)
  const doneExercises = steps
    .map((st, i) => ({ st, i }))
    .filter(({ i }) => completedSteps.has(i))
    .map(({ st, i }) => ({ name: (overrides[i] ?? st.exercise).name, detail: (overrides[i] ?? st.exercise).detail, setTitle: st.setTitle }));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [restWasLearned, setRestWasLearned] = useState(false);

  // ---- measuring rest between exercises (same cleaning as in-exercise rest) ----
  const transitionSamples = useRef<TimerRestSample[]>([]);
  const restMeter = useRef<{ planned: number; start: number; pauseStart: number | null; maxPauseMs: number; hiddenMs: number; hiddenStart: number | null } | null>(null);

  const startRestMeter = (planned: number) => {
    const now = Date.now();
    restMeter.current = { planned, start: now, pauseStart: null, maxPauseMs: 0, hiddenMs: 0, hiddenStart: document.hidden ? now : null };
  };
  const closeRestMeter = (keep: boolean) => {
    const m = restMeter.current;
    restMeter.current = null;
    if (!m || !keep) return;
    const now = Date.now();
    if (m.pauseStart !== null) m.maxPauseMs = Math.max(m.maxPauseMs, now - m.pauseStart);
    if (m.hiddenStart !== null) m.hiddenMs += now - m.hiddenStart;
    transitionSamples.current.push({ plannedSec: m.planned, takenSec: (now - m.start) / 1000, maxPauseMs: m.maxPauseMs, hiddenMs: m.hiddenMs });
  };

  useEffect(() => {
    const m = restMeter.current;
    if (!m) return;
    if (paused && m.pauseStart === null) m.pauseStart = Date.now();
    else if (!paused && m.pauseStart !== null) {
      m.maxPauseMs = Math.max(m.maxPauseMs, Date.now() - m.pauseStart);
      m.pauseStart = null;
    }
  }, [paused]);

  useEffect(() => {
    const onVis = () => {
      const m = restMeter.current;
      if (!m) return;
      if (document.hidden) m.hiddenStart = Date.now();
      else if (m.hiddenStart !== null) {
        m.hiddenMs += Date.now() - m.hiddenStart;
        m.hiddenStart = null;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // reset internal progress whenever a genuinely new session starts — or
  // pick up where it was left, when this is a session saved on the device
  const restoredFrom = useRef<string | null>(null);
  useEffect(() => {
    // only this session's own saved progress (a new session starts fresh)
    const saved = session && userDoc ? loadActiveSession(userDoc.uid) : null;
    const g = session && saved?.session.id === session.id && restoredFrom.current !== session.id ? saved.guided : undefined;
    if (session) restoredFrom.current = session.id;
    setIndex(g ? Math.min(g.index, Math.max(0, steps.length - 1)) : 0);
    setCompletedSteps(new Set(g?.completed ?? []));
    setAllDoneScreen(false);
    setRestSecondsLeft(g ? secondsLeftOf(g.restEndsAt, g.restLeft) : null);
    setOverrides(g?.overrides ?? {});
    setSkippedSteps(new Set(g?.skipped ?? []));
    setTooHard(g?.tooHard ?? []);
    setTimerLogs(g?.timerLogs ?? {});
    setCheckResults(g?.checkResults ?? {});
    setCheckVideos(g?.checkVideos ?? {});
    setEarlyStops(g?.earlyStops ?? {});
    setFatigueAt(g?.fatigueAt ?? {});
    setTiredAt(g?.tiredAt ?? null);
    transitionSamples.current = [];
    restMeter.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // saved as the athlete goes (not every second: a running rest is saved
  // once, as its end time)
  const resting = restSecondsLeft !== null;
  useEffect(() => {
    if (!session || restoredFrom.current !== session.id) return;
    saveGuidedProgress(session.id, {
      index,
      completed: [...completedSteps],
      skipped: [...skippedSteps],
      overrides,
      tooHard,
      timerLogs,
      checkResults,
      checkVideos,
      restEndsAt: resting && !paused ? Date.now() + (restSecondsLeft ?? 0) * 1000 : null,
      restLeft: resting && paused ? restSecondsLeft : null,
      earlyStops,
      fatigueAt,
      tiredAt,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, index, completedSteps, skippedSteps, overrides, tooHard, timerLogs, checkResults, checkVideos, resting, paused, earlyStops, fatigueAt, tiredAt]);

  const rawCurrent = steps[index];
  const current = useMemo(
    () => (rawCurrent ? { ...rawCurrent, exercise: overrides[index] ?? rawCurrent.exercise } : undefined),
    [rawCurrent, overrides, index]
  );
  const rawNext = steps[index + 1];
  const next = useMemo(
    () => (rawNext ? { ...rawNext, exercise: overrides[index + 1] ?? rawNext.exercise } : undefined),
    [rawNext, overrides, index]
  );

  useEffect(() => {
    if (current) reportCurrentExercise(current.exercise.name);
  }, [current, reportCurrentExercise]);

  // the between-exercise rest countdown — pauses right alongside the
  // per-exercise timer when training is paused, and advances to the next
  // exercise on its own once it hits zero
  // Clock-based like the exercise timer, so a rest that ran out while the
  // phone was locked is over when you come back.
  const restEndsAt = useRef<number | null>(null);
  const restTotal = useRef<number | null>(null); // full length, for the lock-screen bar
  useEffect(() => {
    if (restSecondsLeft === null) restTotal.current = null;
    else if (restTotal.current === null) restTotal.current = restSecondsLeft;
  }, [restSecondsLeft]);
  useEffect(() => {
    if (restSecondsLeft === null || paused) return;
    restEndsAt.current = Date.now() + restSecondsLeft * 1000;
    const tick = () => {
      if (restEndsAt.current === null) return;
      const left = Math.max(0, Math.ceil((restEndsAt.current - Date.now()) / 1000));
      setRestSecondsLeft((s) => (s === null ? s : left));
    };
    intervalRef.current = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", tick);
      restEndsAt.current = null;
    };
  }, [restSecondsLeft !== null, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (restSecondsLeft !== 0) return;
    closeRestMeter(true);
    playGoSound();
    setRestSecondsLeft(null);
    setIndex((i) => i + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restSecondsLeft]);

  const announced = useRef("");
  useEffect(() => {
    if (!session || !current || restSecondsLeft !== null || allDoneScreen) return;
    const key = `${session.id}:${index}:${current.exercise.name}`;
    if (announced.current === key) return;
    announced.current = key;
    const prefix = current.exercise.check ? `${tx("Skill check.")} ` : "";
    say(`${prefix}${speakableName(current.exercise.name)}. ${speakableDetail(current.exercise.detail, locale)}`, undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, current, restSecondsLeft, allDoneScreen, index]);

  useEffect(() => {
    if (restSecondsLeft === 5) say("Get ready");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restSecondsLeft]);

  useEffect(() => {
    if (allDoneScreen) say("Session complete. Great work!", undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDoneScreen]);

  useEffect(() => {
    if (!session) stopSpeaking();
  }, [session]);

  useEffect(() => {
    if (!lockOn || !session || !current) return;
    const resting = restSecondsLeft !== null;
    updateLockScreen(
      {
        title: allDoneScreen ? tx("Session complete!") : resting ? `${tx("Rest")} · ${restSecondsLeft}s` : current.exercise.name,
        subtitle: resting && next ? `${tx("Up next:")} ${next.exercise.name}` : `${index + 1}/${steps.length} · ${tx(current.setTitle)}`,
        paused,
        progress: resting && restTotal.current ? { total: restTotal.current, left: restSecondsLeft ?? 0 } : null,
      },
      {
        togglePause: () => lockHandlers.current.togglePause(),
        next: () => lockHandlers.current.next(),
        previous: () => lockHandlers.current.previous(),
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockOn, session, current, restSecondsLeft, paused, allDoneScreen, index]);

  // ---- while you're not looking at the app (see lib/backgroundSession.ts) ----
  // the screen stays on while guided mode is open
  useEffect(() => {
    if (!session || !expanded || allDoneScreen) {
      letScreenSleep();
      return;
    }
    keepScreenOn();
    const onVis = () => document.visibilityState === "visible" && keepScreenOn();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      letScreenSleep();
    };
  }, [session?.id, expanded, allDoneScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  // a "training in progress" notification while the app is in the background
  const noticeRef = useRef<() => TrainingNotice | null>(() => null);
  noticeRef.current = () => {
    if (!session || !current) return null;
    const name = current.exercise.name;
    if (allDoneScreen) return { title: tx("Session complete!"), body: tx("Tap to log it.") };
    const restTitle = next ? `${tx("Rest")} · ${tx("Up next:")} ${next.exercise.name}` : tx("Rest");
    if (paused) return { title: restSecondsLeft !== null ? restTitle : name, body: tx("Paused — tap to resume") };
    if (restSecondsLeft !== null) {
      return { title: restTitle, body: tx("Rest until {t}", { t: clockTime(Date.now() + restSecondsLeft * 1000, locale) }) };
    }
    const sets = parseTiming(current.exercise.detail).sets;
    const t = loadTimer(session.id, index);
    const setLine = tx("Set {a} of {b}", { a: t?.set ?? 1, b: sets });
    if (t?.endsAt) {
      const until = clockTime(t.endsAt, locale);
      return { title: name, body: `${setLine} · ${t.phase === "rest" ? tx("rest until {t}", { t: until }) : tx("hold until {t}", { t: until })}` };
    }
    return { title: name, body: `${setLine} · ${tx("tap to continue")}` };
  };
  useEffect(() => {
    if (!session) {
      closeTrainingNotice();
      return;
    }
    const onVis = () => {
      if (document.hidden) {
        const n = noticeRef.current();
        if (n) showTrainingNotice(n);
      } else closeTrainingNotice();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // kept current if the page is still running in the background (e.g. with
  // lock-screen controls on)
  useEffect(() => {
    if (!session || !document.hidden) return;
    const n = noticeRef.current();
    if (n) showTrainingNotice(n);
  }, [index, restSecondsLeft !== null, paused, allDoneScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session || !current) return null;

  const isLastStep = index === steps.length - 1;

  const markCompleteAndAdvance = () => {
    setCompletedSteps((prev) => new Set(prev).add(index));
    setSkippedSteps((prev) => {
      if (!prev.has(index)) return prev;
      const n = new Set(prev);
      n.delete(index);
      return n;
    });
    if (isLastStep) {
      setAllDoneScreen(true);
      return;
    }
    const planned = Math.min(MAX_BETWEEN_EXERCISE_REST, Math.max(MIN_BETWEEN_EXERCISE_REST, current.exercise.restSeconds || MIN_BETWEEN_EXERCISE_REST));
    // learned from how long this athlete actually rests between exercises
    const { seconds: rest, learned } = learnedTransitionRest(planned, userDoc?.transitionRest);
    if (next) say("Rest. Up next: {x}", { x: speakableName(next.exercise.name) }, true);
    setRestWasLearned(learned);
    startRestMeter(rest);
    playRestSound();
    setRestSecondsLeft(rest);
  };

  const skipRest = () => {
    closeRestMeter(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    playGoSound();
    setRestSecondsLeft(null);
    setIndex((i) => i + 1);
  };

  const goBack = () => {
    if (index === 0 && restSecondsLeft === null) return;
    setAllDoneScreen(false);
    setRestSecondsLeft(null);
    closeRestMeter(false); // going back isn't a rest decision
    if (restSecondsLeft !== null) return; // step back into the exercise we were resting after
    setIndex((i) => i - 1);
  };

  lockHandlers.current = {
    togglePause,
    next: () => (restSecondsLeft !== null ? skipRest() : goNext()),
    previous: () => goBack(),
  };

  const goNext = () => {
    // Manual "Next" always marks the current exercise done, same as
    // finishing its timer would — the athlete is the judge of "done enough."
    markCompleteAndAdvance();
  };

  // Skip: move on without the rest period, and remember it was skipped.
  // effort done so far: finished exercises (only the sets done, if stopped
  // early) plus the sets already done of the current one
  const effortDone = () => {
    let n = 0;
    completedSteps.forEach((i) => {
      const st = steps[i];
      if (st) n += exerciseEffort(overrides[i] ?? st.exercise, st.setTitle, earlyStops[i]);
    });
    const doneSets = completedSteps.has(index) ? 0 : timerLogs[index]?.sets.length ?? 0;
    if (doneSets) n += exerciseEffort(current.exercise, current.setTitle, doneSets);
    return +n.toFixed(1);
  };
  const fatigueNow = () => +fatigueOf(effortDone(), plannedEffort).toFixed(2);

  const handleSkip = () => {
    setFatigueAt((prev) => ({ ...prev, [index]: fatigueNow() }));
    setSkippedSteps((prev) => new Set(prev).add(index));
    if (isLastStep) {
      setAllDoneScreen(true);
      return;
    }
    setIndex((i) => i + 1);
  };

  // Too hard: remember it against this exercise, and swap in the next rung
  // down right away so the athlete can keep going.
  const handleTooHard = () => {
    const ex = current.exercise;
    setTooHard((prev) => [...prev, { name: ex.name, outcome: "tooHard", setTitle: current.setTitle, fatigue: fatigueNow() }]);
    const easier = findEasierExercise(ex.name, userDoc?.equipment ?? EASE_LOOKUP_EQUIPMENT);
    if (easier) {
      setOverrides((prev) => ({ ...prev, [index]: { ...easier, adaptedFrom: ex.name, adaptDir: "easier", adaptNote: undefined } }));
      toast.success(`Swapped in ${easier.name}. Noted for future sessions.`);
      say("Swapped in {ex}", { ex: speakableName(easier.name) }, true);
    } else {
      toast.info("Nothing easier for this one — noted for future sessions. Skipping ahead.");
      if (isLastStep) setAllDoneScreen(true);
      else setIndex((i) => i + 1);
    }
  };

  // Pressed "too hard" (or eased) by mistake: put the original back and
  // forget the "too hard", as if it never happened.
  const undoSwap = () => {
    const swapped = overrides[index];
    if (!swapped) return;
    const original = steps[index].exercise;
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setTooHard((prev) => {
      const at = prev.map((t) => t.name === original.name && t.setTitle === current.setTitle).lastIndexOf(true);
      return at === -1 ? prev : [...prev.slice(0, at), ...prev.slice(at + 1)];
    });
    toast.info(`Back to ${original.name} — the "too hard" is forgotten.`);
  };

  const collectFeedback = (): ExerciseFeedback[] => {
    const out: ExerciseFeedback[] = [...tooHard];
    steps.forEach((step, i) => {
      const ex = overrides[i] ?? step.exercise;
      const checkResult = ex.check
        ? checkResults[i] ?? (ex.check.kind === "hold" ? bestHoldFromLog(timerLogs[i]) ?? undefined : undefined)
        : undefined;
      const isDone = completedSteps.has(i) || checkResult !== undefined;
      if (!isDone && tooHard.some((t) => t.name === ex.name && t.setTitle === step.setTitle)) return;
      out.push({
        name: ex.name,
        outcome: isDone ? "done" : "skipped",
        setTitle: step.setTitle,
        adaptedFrom: ex.adaptedFrom,
        adaptDir: ex.adaptDir,
        timing: summarizeTimerLog(timerLogs[i]),
        detail: ex.detail,
        sets: isDone ? cleanSets(timerLogs[i]) : undefined,
        ...(isDone && earlyStops[i] !== undefined ? { setsDone: earlyStops[i] } : {}),
        ...(!isDone && fatigueAt[i] !== undefined ? { fatigue: fatigueAt[i] } : {}),
        check: ex.check,
        checkResult,
        checkVideoKey: ex.check ? checkVideos[i] : undefined,
      });
    });
    return out;
  };

  // "I'm tired": cut what's left by an amount that depends on how far in
  // you are — about half early on, a fifth near the end (lib/effort.ts)
  const handleTired = () => {
    const f = fatigueNow();
    if (tiredAt === null) setTiredAt(effortDone());
    const withOverrides = steps.map((s, i) => ({ setTitle: s.setTitle, exercise: overrides[i] ?? s.exercise }));
    const { changes, cut, before } = planEaseUp(withOverrides, index, f, (name) =>
      findEasierExercise(name, userDoc?.equipment ?? EASE_LOOKUP_EQUIPMENT)
    );
    if (!changes.length) {
      toast.info("Everything left is already about as easy as it gets — hang in there.");
      return;
    }
    setOverrides((prev) => {
      const next = { ...prev };
      for (const c of changes) next[c.index] = c.exercise;
      return next;
    });
    const easier = changes.filter((c) => c.kind === "easier").length;
    const fewer = changes.length - easier;
    const pct = before > 0 ? Math.round((cut / before) * 100) : 0;
    toast.success(`Eased up what's left by about ${pct}% — ${easier} easier, ${fewer} with fewer sets.`);
  };

  const mm = restSecondsLeft !== null ? String(Math.floor(restSecondsLeft / 60)).padStart(2, "0") : "00";
  const ss = restSecondsLeft !== null ? String(restSecondsLeft % 60).padStart(2, "0") : "00";

  return (
    <div
      className={`fixed inset-0 z-50 bg-zinc-950 flex-col safe-top safe-bottom ${expanded ? "flex" : "hidden"}`}
    >
      {/* top: minimize, where you are, pause — everything else is in "More" */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-800">
        <button onClick={minimize} className="w-11 h-11 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-100" aria-label={tx("Minimize")}>
          <ChevronDown size={24} />
        </button>
        <div className="text-xs text-muted stat-mono">
          {Math.min(index + 1, steps.length)} / {steps.length}
          {!allDoneScreen && (
            <span className="text-muted"> · ~{estimateExercisesMinutes(steps.slice(index).map((s, i) => overrides[index + i] ?? s.exercise))} {tx("min left")}</span>
          )}
        </div>
        <button
          onClick={togglePause}
          className={`w-11 h-11 flex items-center justify-center rounded-xl border ${
            paused ? "border-orange-500 bg-orange-500 text-zinc-950" : "border-zinc-700 text-zinc-200 hover:border-zinc-500"
          }`}
          aria-label={paused ? tx("Resume training") : tx("Pause training")}
          aria-pressed={paused}
        >
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </button>
      </div>

      {/* stepper */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`h-1.5 flex-1 rounded-full ${
                completedSteps.has(i) ? "bg-emerald-500" : skippedSteps.has(i) ? "bg-zinc-600" : i === index ? "bg-orange-500" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>
        {!allDoneScreen && !isLastStep && (
          <div className="text-xs text-muted mt-2 truncate">{tx("Next:")} {next?.exercise.name}</div>
        )}
      </div>

      {restSecondsLeft !== null ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-xs uppercase tracking-wide text-emerald-400 mb-2">{tx("Rest before next exercise")}</div>
          <div className="stat-mono text-6xl text-zinc-100 mb-2">
            {mm}:{ss}
          </div>
          {next && <div className="text-sm text-zinc-400 mb-1">{tx("Up next:")} {next.exercise.name}</div>}
          <div className="text-xs text-muted mb-6 h-4">{restWasLearned ? tx("Rest adjusted to your usual pace") : ""}</div>
          {paused && (
            <div className="text-xs text-orange-400 flex items-center gap-1.5 mb-4">
              <Pause size={12} /> {tx("Training paused")}
            </div>
          )}
          <button
            onClick={skipRest}
            className="w-full max-w-xs py-4 rounded-xl border border-zinc-600 text-zinc-100 hover:border-orange-500 flex items-center justify-center gap-2 text-base font-medium"
          >
            <SkipForward size={18} /> {tx("Skip rest")}
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="mt-3 w-full max-w-xs py-3 rounded-xl text-zinc-300 hover:text-zinc-100 flex items-center justify-center gap-2 text-sm"
            aria-haspopup="dialog"
          >
            <MoreHorizontal size={18} /> {tx("More options")}
          </button>
        </div>
      ) : allDoneScreen ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
            <Check size={28} className="text-emerald-400" />
          </div>
          <div className="heading text-2xl text-zinc-100 mb-2">{tx("Session complete!")}</div>
          <p className="text-sm text-zinc-400 mb-6">
            {skippedSteps.size === 0
              ? tx("Every exercise is done. Log it to bank your XP and streak.")
              : tx("{a} done, {b} skipped. Log it to bank your XP. Your next sessions adapt to what you skipped.", { a: completedSteps.size, b: skippedSteps.size })}
          </p>
          <button
            onClick={() =>
              finishSession(collectFeedback(), {
                transitionRestRatio: summarizeTimerLog({ sets: [], rests: transitionSamples.current, workPauses: 0 })?.restRatio,
                effort: { planned: plannedEffort, done: tiredAt ?? effortDone(), tired: tiredAt !== null },
              })
            }
            className="w-full max-w-xs py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950"
          >
            {tx("Finish & log session")}
          </button>
          <SessionCoolDown exercises={doneExercises} />
          <button onClick={goBack} className="text-xs text-muted hover:text-zinc-300 mt-3 py-2">
            {tx("Go back and review")}
          </button>

        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
            <div className="text-center mb-6">
              <div className="text-xs uppercase tracking-wide text-emerald-400 mb-1">{tx(current.setTitle)}</div>
              <div className="flex items-center justify-center gap-2">
                <div className="heading text-2xl text-zinc-100">{current.exercise.name}</div>
                <button
                  onClick={() => setInfoOpen(true)}
                  className="w-10 h-10 -my-2 flex items-center justify-center rounded-full text-zinc-400 hover:text-orange-400"
                  aria-label={tx("Details for {ex}", { ex: current.exercise.name })}
                >
                  <Info size={20} />
                </button>
              </div>
              {index in overrides ? (
                <div className="text-xs text-orange-400 mt-0.5 flex items-center justify-center gap-2">
                  {tx("Swapped in — something gentler")}
                  <button onClick={undoSwap} className="underline text-zinc-300 hover:text-zinc-100 px-2 py-1.5">
                    {tx("Undo")}
                  </button>
                </div>
              ) : (
                current.exercise.adaptNote && (
                  <div className="text-xs text-sky-400/90 mt-0.5 flex items-center justify-center gap-1">
                    <Sparkles size={11} /> {tx(current.exercise.adaptNote)}
                  </div>
                )
              )}
              <div className="text-sm text-zinc-400 mt-1">{localizeDetail(current.exercise.detail, locale)}</div>
              {!HIERARCHY_EXEMPT_SETS.has(current.setTitle) && userDoc?.exerciseStats?.[statKey(current.exercise.name)]?.lastSets && (
                <div className="text-xs text-muted mt-0.5">
                  {tx("Last time:")}{" "}
                  <span className="text-zinc-300 stat-mono">{localizeDetail(userDoc.exerciseStats[statKey(current.exercise.name)].lastSets ?? "", locale)}</span>
                </div>
              )}
              {current.exercise.cue && (
                <div className="text-xs text-orange-400/80 italic mt-1">{tx(current.exercise.cue)}</div>
              )}
            </div>

            {paused && (
              <div className="max-w-sm w-full mx-auto mb-3 text-center text-xs text-orange-400 flex items-center justify-center gap-1.5">
                <Pause size={12} /> {tx("Training paused — your spot is saved")}
              </div>
            )}

            <ExerciseDemo exerciseName={current.exercise.name} width={170} className="mb-4" />
            <div className="max-w-sm w-full mx-auto">
              <ExerciseTimer
                key={`${current.key}-${current.exercise.name}`}
                exercise={current.exercise}
                persist={{ sessionId: session.id, step: index }}
                onStopEarly={(n) => setEarlyStops((prev) => ({ ...prev, [index]: n }))}
                // a Skill Check waits on "Next" so the result can be logged first
                onComplete={current.exercise.check ? undefined : markCompleteAndAdvance}
                externallyPaused={paused}
                onLog={(log) => setTimerLogs((prev) => ({ ...prev, [index]: log }))}
                onEvent={onTimerEvent}
              />
              {current.exercise.check && (
                <SkillCheckPanel
                  spec={current.exercise.check}
                  value={checkResults[index]}
                  timerBest={bestHoldFromLog(timerLogs[index])}
                  onChange={(v) => setCheckResults((prev) => ({ ...prev, [index]: v }))}
                  videoKey={checkVideos[index]}
                  onVideo={(v) => setCheckVideos((prev) => ({ ...prev, [index]: v }))}
                />
              )}
            </div>
          </div>

          {/* bottom, under the thumb: three big buttons */}
          <div className="flex items-stretch gap-2 px-3 py-3 border-t border-zinc-800">
            <button
              onClick={goBack}
              disabled={index === 0}
              className="w-14 h-14 shrink-0 rounded-xl border border-zinc-700 text-zinc-200 disabled:opacity-30 flex items-center justify-center"
              aria-label={tx("Back")}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goNext}
              disabled={paused}
              className="flex-1 h-14 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-base font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              {tx("Next")} <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="w-14 h-14 shrink-0 rounded-xl border border-zinc-700 text-zinc-200 flex flex-col items-center justify-center text-[0.7rem] leading-none gap-0.5"
              aria-label={tx("More options")}
              aria-haspopup="dialog"
            >
              <MoreHorizontal size={22} />
              <span aria-hidden="true">{tx("More")}</span>
            </button>
          </div>
        </>
      )}

      {/* everything that isn't needed every set */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title={tx("Options")}>
        <div className="space-y-1.5">
          {!allDoneScreen && restSecondsLeft === null && !HIERARCHY_EXEMPT_SETS.has(current.setTitle) && (
            <>
              <MenuRow icon={SkipForward} label={tx("Skip this exercise")} hint={tx("Your next sessions adapt to what you skip.")} onClick={() => { setMenuOpen(false); handleSkip(); }} />
              {!current.exercise.check && (
                <MenuRow icon={ArrowDownCircle} label={tx("Too hard — swap for an easier one")} hint={tx("You can undo it right after.")} onClick={() => { setMenuOpen(false); handleTooHard(); }} />
              )}
            </>
          )}
          {!allDoneScreen && (
            <MenuRow icon={BatteryLow} label={tx("I'm tired — ease up what's left")} hint={tx("Easier swaps or fewer sets for the rest of the session.")} onClick={() => { setMenuOpen(false); handleTired(); }} />
          )}
          {!allDoneScreen && restSecondsLeft === null && (
            <MenuRow icon={Info} label={tx("Exercise details")} hint={tx("How to do it, and the common mistakes.")} onClick={() => { setMenuOpen(false); setInfoOpen(true); }} />
          )}
          {(canSpeak || canLock) && <div className="border-t border-zinc-800 my-2" />}
          {canSpeak && (
            <MenuRow
              icon={voiceOn ? Volume2 : VolumeX}
              label={tx("Voice coaching")}
              hint={tx("Sets, countdowns and what's next, read out loud.")}
              toggle={voiceOn}
              onClick={toggleVoice}
            />
          )}
          {canLock && (
            <MenuRow icon={Smartphone} label={tx("Lock-screen controls")} hint={tx("Exercise, rest and next on your lock screen.")} toggle={lockOn} onClick={toggleLock} />
          )}
          <div className="border-t border-zinc-800 my-2" />
          <MenuRow
            icon={XCircle}
            label={tx("Cancel session")}
            hint={tx("Can't do it today? Stop without logging anything.")}
            danger
            onClick={() => {
              setMenuOpen(false);
              setCancelOpen(true);
            }}
          />
        </div>
      </Modal>
      <CancelSessionDialog open={cancelOpen} onClose={() => setCancelOpen(false)} />

      <ExerciseDetailModal
        exercise={current.exercise}
        trackLabel={session.focusLabel}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
}

// One row of the options sheet: big enough to hit mid-set, with a line on
// what it does; settings show their on/off state as a switch.
function MenuRow({
  icon: Icon,
  label,
  hint,
  onClick,
  toggle,
  danger,
}: {
  icon: typeof Info;
  label: string;
  hint: string;
  onClick: () => void;
  toggle?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      role={toggle === undefined ? undefined : "switch"}
      aria-checked={toggle}
      className="w-full min-h-[3.5rem] flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-left"
    >
      <Icon size={22} className={`${danger ? "text-red-400" : "text-orange-400"} shrink-0`} />
      <span className="flex-1 min-w-0">
        <span className={`block text-base ${danger ? "text-red-300" : "text-zinc-100"}`}>{label}</span>
        <span className="block text-xs text-zinc-400">{hint}</span>
      </span>
      {toggle !== undefined && (
        <span className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${toggle ? "bg-orange-500" : "bg-zinc-600"}`} aria-hidden="true">
          <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${toggle ? "translate-x-5" : ""}`} />
        </span>
      )}
    </button>
  );
}
