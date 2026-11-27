"use client";

import { sportOfSession, trackView } from "@/lib/sports/trackView";
import { useState } from "react";
import { TrainingSession, TrainingEquipment, Exercise, ExerciseFeedback } from "@/lib/types";
import { adjustDetail, estimateSessionMinutes } from "@/lib/exerciseTiming";
import { findEasierExercise, findHarderExercise, HIERARCHY_EXEMPT_SETS } from "@/lib/exerciseHierarchy";
import { easierForAthlete, gentlerFor } from "@/lib/adaptation";
import { useToast } from "@/context/ToastContext";
import ExerciseRow from "@/components/ExerciseRow";
import { TimerLog, summarizeTimerLog, bestHoldFromLog, cleanSets } from "@/lib/timingLearning";
import { useAuth } from "@/context/AuthContext";
import { statKey } from "@/lib/adaptation";
import { plausibleDuration } from "@/lib/sessionHistory";
import Modal from "@/components/Modal";
import { Play, Clock, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { localizeDetail } from "@/lib/i18n/detail";
import { exerciseEffort, fatigueOf, stepsOf, totalEffort } from "@/lib/effort";
import { parseTiming } from "@/lib/exerciseTiming";
import { plannedXp } from "@/lib/sessionXp";

type SessionLevel = "easier" | "default" | "harder";

const SESSION_LEVEL_OPTIONS: { value: SessionLevel; label: string }[] = [
  { value: "easier", label: "Too advanced" },
  { value: "default", label: "Feels right" },
  { value: "harder", label: "Too easy" },
];

// Warm-up and finisher are the same everyone-can-do-these content every
// session — collapsed by default so the card opens on what actually
// changes day to day (Main Focus, Accessory) instead of a long scroll.
const COLLAPSED_BY_DEFAULT = new Set(["Warm-Up", "Final Hits"]);

export default function SessionView({
  session,
  equipment,
  onComplete,
  completed,
  onStartFocusMode,
}: {
  session: TrainingSession;
  equipment?: TrainingEquipment;
  onComplete?: (feedback: ExerciseFeedback[], meta: { durationMin?: number; effort?: { planned: number; done: number; tired: boolean } }) => void;
  completed?: boolean;
  onStartFocusMode?: () => void;
}) {
  const totalExercises = session.sets.reduce((n, s) => n + s.exercises.length, 0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  // every "too hard" press, in order — the exercise it was pressed on, not
  // the easier one swapped in for it
  const [tooHard, setTooHard] = useState<ExerciseFeedback[]>([]);
  // how far through the effort the athlete was when skipping (lib/effort.ts)
  const [fatigueAt, setFatigueAt] = useState<Record<string, number>>({});
  // raw timer logs and Skill Check results, per row
  const [timerLogs, setTimerLogs] = useState<Record<string, TimerLog>>({});
  const [checkResults, setCheckResults] = useState<Record<string, number | boolean | undefined>>({});
  const [checkVideos, setCheckVideos] = useState<Record<string, string | undefined>>({});
  const [openTimers, setOpenTimers] = useState<Set<string>>(new Set());
  const [individualDelta, setIndividualDelta] = useState<Record<string, number>>({});
  const [sessionLevel, setSessionLevel] = useState<SessionLevel>("default");
  const [individualOverrides, setIndividualOverrides] = useState<Record<string, Exercise>>({});
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(COLLAPSED_BY_DEFAULT));
  const toast = useToast();
  const { tx, locale } = useLanguage();
  const eq = equipment ?? DEFAULT_LOOKUP_EQUIPMENT;

  const toggleSkip = (key: string) => {
    if (!skipped.has(key)) setFatigueAt((prev) => ({ ...prev, [key]: fatigueNow() }));
    setSkipped((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // when the athlete first actually did something — the start of the
  // session for duration purposes (opening the page isn't training)
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const markStarted = () => setStartedAt((t) => t ?? Date.now());
  const { userDoc } = useAuth();
  const lastTimeFor = (name: string): string | undefined => {
    // from the session's own sport (yoga's history for a yoga session)
    const st = userDoc ? trackView(userDoc, sportOfSession(session)).exerciseStats[statKey(name)] : undefined;
    if (!st?.lastSets || !st.lastAt) return undefined;
    const when = new Date(st.lastAt).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "short" });
    return `${localizeDetail(st.lastSets, locale)} · ${when}`;
  };

  const toggleDone = (key: string) => {
    markStarted();
    setSkipped((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setDone((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleTimer = (key: string) => {
    setOpenTimers((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleSection = (title: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  const bump = (key: string, delta: number) => {
    setIndividualDelta((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + delta }));
  };

  const resetAdjust = (key: string) => {
    setIndividualDelta((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // every exercise in the session now (swaps included): a swap never duplicates one
  const namesInSession = () => new Set([...session.sets.flatMap((st) => st.exercises.map((e) => e.name)), ...Object.values(individualOverrides).map((e) => e.name)]);

  const swapForEasier = (key: string, currentExercise: Exercise, setTitle: string) => {
    setTooHard((prev) => [...prev, { name: currentExercise.name, outcome: "tooHard", setTitle, fatigue: fatigueNow() }]);
    const easier = easierForAthlete(currentExercise.name, eq, { skills: userDoc?.skills, taken: namesInSession(), stats: userDoc?.exerciseStats });
    if (!easier) {
      toast.warning(`No easier variation for ${currentExercise.name} — noted, future sessions will ease off. Try fewer reps for now.`);
      bump(key, -1);
      return;
    }
    setIndividualOverrides((prev) => ({
      ...prev,
      [key]: { ...easier, adaptedFrom: currentExercise.name, adaptDir: "easier", adaptNote: undefined },
    }));
    toast.success(`Swapped in ${easier.name} — one step easier.`);
    // the old exercise's per-row reps adjustment doesn't carry over to a
    // different exercise's own baseline
    resetAdjust(key);
  };

  // This hurts: rest it for two weeks with a gentler rung, from now
  const swapForHurt = (key: string, currentExercise: Exercise, setTitle: string) => {
    setTooHard((prev) => [...prev, { name: currentExercise.name, outcome: "skipped", hurt: true, setTitle }]);
    const gentler = gentlerFor(currentExercise.name, eq, userDoc?.exerciseStats, undefined, { skills: userDoc?.skills, taken: namesInSession() });
    if (!gentler) {
      setSkipped((prev) => new Set(prev).add(key));
      toast.info(`${currentExercise.name} rests for two weeks — skipped for today. If the pain is sharp or doesn't go away, stop and get it checked.`);
      return;
    }
    setIndividualOverrides((prev) => ({ ...prev, [key]: { ...gentler, adaptedFrom: currentExercise.name, adaptDir: "easier", adaptNote: undefined } }));
    toast.success(`Swapped in ${gentler.name}. ${currentExercise.name} rests for two weeks — if the pain is sharp or doesn't go away, stop and get it checked.`);
    resetAdjust(key);
  };

  // "Too hard" pressed by mistake: the original exercise comes back and the
  // "too hard" is forgotten
  const undoSwap = (key: string, originalEx: Exercise, setTitle: string) => {
    setIndividualOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setTooHard((prev) => {
      const at = prev.map((t) => t.name === originalEx.name && t.setTitle === setTitle).lastIndexOf(true);
      return at === -1 ? prev : [...prev.slice(0, at), ...prev.slice(at + 1)];
    });
    toast.info(`Back to ${originalEx.name} — that's forgotten.`);
  };

  // the exercise actually shown in a row: a "too hard" swap wins, else the
  // whole-session easier/harder step, else what was generated
  const effectiveFor = (key: string, originalEx: Exercise, exempt: boolean): Exercise => {
    if (individualOverrides[key]) return individualOverrides[key];
    if (!exempt && sessionLevel !== "default") {
      const stepped =
        sessionLevel === "easier" ? findEasierExercise(originalEx.name, eq) : findHarderExercise(originalEx.name, eq);
      if (stepped) return stepped;
    }
    return originalEx;
  };

  // effort (lib/effort.ts): planned for the session, and done so far — the
  // ticked-off rows, at their adjusted set counts
  const plannedEffort = totalEffort(stepsOf(session));
  const effortDone = () => {
    let n = 0;
    session.sets.forEach((set) => {
      const exempt = HIERARCHY_EXEMPT_SETS.has(set.title);
      set.exercises.forEach((originalEx, i) => {
        const key = `${set.title}-${i}`;
        if (!done.has(key)) return;
        const ex = effectiveFor(key, originalEx, exempt);
        n += exerciseEffort({ name: ex.name, detail: adjustDetail(ex.detail, individualDelta[key] ?? 0) }, set.title);
      });
    });
    return +n.toFixed(1);
  };
  const fatigueNow = () => +fatigueOf(effortDone(), plannedEffort).toFixed(2);

  const collectFeedback = (): ExerciseFeedback[] => {
    const out: ExerciseFeedback[] = [...tooHard];
    session.sets.forEach((set) => {
      const exempt = HIERARCHY_EXEMPT_SETS.has(set.title);
      set.exercises.forEach((originalEx, i) => {
        const key = `${set.title}-${i}`;
        const ex = effectiveFor(key, originalEx, exempt);
        const checkResult = ex.check
          ? checkResults[key] ?? (ex.check.kind === "hold" ? bestHoldFromLog(timerLogs[key]) ?? undefined : undefined)
          : undefined;
        // logging a check result counts as doing it, even without the tick
        const isDone = done.has(key) || checkResult !== undefined;
        // a row pressed "too hard" with no easier swap and never done is
        // already recorded as too hard — don't also count it as a skip
        if (!isDone && !individualOverrides[key] && tooHard.some((t) => t.name === ex.name && t.setTitle === set.title)) return;
        out.push({
          name: ex.name,
          outcome: isDone ? "done" : "skipped",
          setTitle: set.title,
          repDelta: isDone ? individualDelta[key] ?? 0 : undefined,
          adaptedFrom: ex.adaptedFrom,
          adaptDir: ex.adaptDir,
          timing: summarizeTimerLog(timerLogs[key]),
          detail: adjustDetail(ex.detail, individualDelta[key] ?? 0),
          sets: isDone ? cleanSets(timerLogs[key]) : undefined,
          ...(!isDone && fatigueAt[key] !== undefined ? { fatigue: fatigueAt[key] } : {}),
          ...(!isDone && skipped.has(key) ? { chosen: true } : {}),
          check: ex.check,
          checkResult,
          checkVideoKey: ex.check ? checkVideos[key] : undefined,
        });
      });
    });
    return out;
  };

  const allDone = done.size + skipped.size >= totalExercises;
  const levelLabel = SESSION_LEVEL_OPTIONS.find((o) => o.value === sessionLevel)?.label;

  return (
    <div className="panel rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          {session.partnerLabel && (
            <div className="text-xs text-orange-400 stat-mono mb-0.5">{session.partnerLabel}</div>
          )}
          <div className="heading text-2xl text-zinc-100">{tx(session.focusLabel)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-400">{tx("Est. reward")}</div>
          <div className="stat-mono text-orange-400">+{plannedXp(session)} XP</div>
          <div className="text-xs text-muted mt-0.5 flex items-center justify-end gap-1">
            <Clock size={11} /> ~{estimateSessionMinutes(session)} min
          </div>
        </div>
      </div>

      {onStartFocusMode && (
        <button
          onClick={onStartFocusMode}
          className="w-full mt-3 py-2.5 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center gap-2"
        >
          <Play size={15} /> {tx("Start Training")}
        </button>
      )}

      <button
        onClick={() => setAdjustOpen(true)}
        className="w-full mt-2 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 flex items-center justify-center gap-1.5"
      >
        <SlidersHorizontal size={12} />
        {sessionLevel === "default" ? tx("Adjust today's difficulty") : tx("Difficulty: {x}", { x: tx(levelLabel ?? "") })}
      </button>

      <div className="space-y-3 mt-4">
        {session.sets.map((set) => {
          const exempt = HIERARCHY_EXEMPT_SETS.has(set.title);
          const isCollapsed = collapsed.has(set.title);
          return (
            <div key={set.title}>
              <button
                onClick={() => toggleSection(set.title)}
                className="w-full flex items-center justify-between text-sm uppercase tracking-wide text-emerald-400 mb-2"
              >
                <span>
                  {tx(set.title)} <span className="text-muted normal-case">({set.exercises.length})</span>
                </span>
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
              {!isCollapsed && (
                <ul className="space-y-2">
                  {set.exercises.map((originalEx, i) => {
                    const key = `${set.title}-${i}`;
                    const effectiveExercise = effectiveFor(key, originalEx, exempt);

                    const totalDelta = individualDelta[key] ?? 0;
                    const displayedDetail = adjustDetail(effectiveExercise.detail, totalDelta);
                    const isSwapped = effectiveExercise.name !== originalEx.name;

                    return (
                      <ExerciseRow
                        key={key}
                        exercise={effectiveExercise}
                        displayedDetail={displayedDetail}
                        isAdjusted={totalDelta !== 0}
                        isSwapped={isSwapped}
                        isDone={done.has(key)}
                        isSkipped={skipped.has(key)}
                        timerOpen={openTimers.has(key)}
                        trackLabel={session.focusLabel}
                        onToggleDone={() => toggleDone(key)}
                        onToggleTimer={() => toggleTimer(key)}
                        onBump={(delta) => bump(key, delta)}
                        onResetAdjust={() => resetAdjust(key)}
                        onCantDo={exempt || effectiveExercise.check ? undefined : () => swapForEasier(key, effectiveExercise, set.title)}
                        onHurts={exempt || effectiveExercise.check ? undefined : () => swapForHurt(key, effectiveExercise, set.title)}
                        timerLog={timerLogs[key]}
                        onTimerLog={(log) => {
                          markStarted();
                          setTimerLogs((prev) => ({ ...prev, [key]: log }));
                        }}
                        lastTime={exempt ? undefined : lastTimeFor(effectiveExercise.name)}
                        checkValue={checkResults[key]}
                        onCheckChange={(v) => setCheckResults((prev) => ({ ...prev, [key]: v }))}
                        checkVideoKey={checkVideos[key]}
                        onCheckVideo={(v) => setCheckVideos((prev) => ({ ...prev, [key]: v }))}
                        onSkip={() => toggleSkip(key)}
                        onUndoSwap={isSwapped && individualOverrides[key] ? () => undoSwap(key, originalEx, set.title) : undefined}
                        // "Finish here" in the row's timer: the row keeps only the sets done
                        onStopEarly={(n) => {
                          bump(key, n - parseTiming(displayedDetail).sets);
                          if (!done.has(key)) toggleDone(key);
                        }}
                      />
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {onComplete && (
        <button
          disabled={completed}
          onClick={() =>
            onComplete(collectFeedback(), { durationMin: plausibleDuration(startedAt), effort: { planned: plannedEffort, done: effortDone(), tired: false } })
          }
          className={`mt-5 w-full py-2.5 rounded-lg heading tracking-wide text-sm ${
            completed
              ? "bg-zinc-800 text-muted cursor-not-allowed"
              : allDone
              ? "bg-orange-500 hover:bg-orange-400 text-zinc-950"
              : "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          }`}
        >
          {completed ? tx("Session Logged") : allDone ? tx("Complete Session — Claim XP") : tx("Mark Complete Anyway")}
        </button>
      )}

      <Modal open={adjustOpen} onClose={() => setAdjustOpen(false)} title={tx("Adjust today's difficulty")}>
        <p className="text-xs text-muted mb-3">
          {tx("Drag an exercise left or right in the list for a quick per-exercise easier/harder reps adjustment, or use its own +/- buttons. This sets the difficulty for the whole session at once.")}
        </p>
        <div className="flex gap-1.5">
          {SESSION_LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSessionLevel(opt.value)}
              className={`flex-1 py-2 rounded-lg text-xs border ${
                sessionLevel === opt.value
                  ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {tx(opt.label)}
            </button>
          ))}
        </div>
        {sessionLevel !== "default" && (
          <p className="text-xs text-muted mt-3">
            {tx(sessionLevel === "easier"
              ? "Every skill exercise below is swapped for the easier one right next to it in that skill's progression. Warm-up and finisher exercises don't change; everyone can do those."
              : "Every skill exercise below is swapped for the harder one right next to it in that skill's progression. Warm-up and finisher exercises don't change; everyone can do those.")}
          </p>
        )}
        <button
          onClick={() => setAdjustOpen(false)}
          className="w-full mt-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium"
        >
          {tx("Done")}
        </button>
      </Modal>
    </div>
  );
}

const DEFAULT_LOOKUP_EQUIPMENT: TrainingEquipment = {
  pullUpBar: true, parallelBars: true, rings: true, wallSpace: true,
  verticalPole: true, monkeyBars: true, weights: true, resistanceBands: true,
};
