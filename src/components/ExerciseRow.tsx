"use client";

import { useRef, useState } from "react";
import { Exercise } from "@/lib/types";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import SkillCheckPanel from "@/components/SkillCheckPanel";
import { TimerLog, bestHoldFromLog } from "@/lib/timingLearning";
import { Check, Clock, Play, Minus, Plus, RotateCcw, ArrowDownCircle, Info, SkipForward, Sparkles, History } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SWIPE_THRESHOLD = 55;
const SWIPE_MAX = 90;

export default function ExerciseRow({
  exercise,
  displayedDetail,
  isAdjusted,
  isSwapped,
  isDone,
  isSkipped,
  timerOpen,
  trackLabel,
  onToggleDone,
  onToggleTimer,
  onBump,
  onResetAdjust,
  onCantDo,
  onSkip,
  timerLog,
  onTimerLog,
  checkValue,
  onCheckChange,
  lastTime,
}: {
  exercise: Exercise;
  displayedDetail: string;
  isAdjusted: boolean;
  isSwapped?: boolean;
  isDone: boolean;
  isSkipped?: boolean;
  timerOpen: boolean;
  trackLabel: string;
  onToggleDone: () => void;
  onToggleTimer: () => void;
  onBump: (delta: number) => void;
  onResetAdjust: () => void;
  onCantDo?: () => void;
  onSkip?: () => void;
  timerLog?: TimerLog;
  onTimerLog?: (log: TimerLog) => void;
  checkValue?: number | boolean;
  onCheckChange?: (v: number | boolean | undefined) => void;
  lastTime?: string; // "12·11·10 reps · 12 Nov"
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { tx } = useLanguage();
  // once opened, the timer stays mounted (just hidden) so hiding it doesn't
  // throw away its progress or the timing it has recorded
  const [timerMounted, setTimerMounted] = useState(false);
  if (timerOpen && !timerMounted) setTimerMounted(true);
  const start = useRef<{ x: number; y: number } | null>(null);
  const lockedAxis = useRef<"h" | "v" | null>(null);
  const displayedExercise = { ...exercise, detail: displayedDetail };

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    lockedAxis.current = null;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    if (lockedAxis.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        lockedAxis.current = Math.abs(dx) > Math.abs(dy) * 1.3 ? "h" : "v";
        if (lockedAxis.current === "h") setDragging(true);
      }
    }

    if (lockedAxis.current === "h") {
      e.preventDefault();
      setDragX(Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, dx)));
    }
  };

  const endDrag = () => {
    if (lockedAxis.current === "h") {
      if (dragX > SWIPE_THRESHOLD) onBump(1);
      else if (dragX < -SWIPE_THRESHOLD) onBump(-1);
    }
    start.current = null;
    lockedAxis.current = null;
    setDragging(false);
    setDragX(0);
  };

  return (
    <li
      className={`relative rounded-lg overflow-hidden border ${
        isDone ? "border-emerald-600" : isSkipped ? "border-zinc-800 opacity-60" : "border-zinc-700"
      }`}
    >
      {/* swipe hints revealed behind the card as you drag */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <div
          className="flex items-center gap-1 text-orange-400 text-xs font-medium transition-opacity"
          style={{ opacity: dragX < -15 ? Math.min(1, -dragX / SWIPE_THRESHOLD) : 0 }}
        >
          <Minus size={16} /> {tx("Easier")}
        </div>
        <div
          className="flex items-center gap-1 text-emerald-400 text-xs font-medium transition-opacity"
          style={{ opacity: dragX > 15 ? Math.min(1, dragX / SWIPE_THRESHOLD) : 0 }}
        >
          {tx("Harder")} <Plus size={16} />
        </div>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
          touchAction: "pan-y",
        }}
        className={`relative p-2.5 bg-zinc-900 ${isDone ? "bg-emerald-600/10" : ""}`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={onToggleDone}
            className={`mt-0.5 w-5 h-5 shrink-0 rounded-lg border flex items-center justify-center ${
              isDone ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"
            }`}
            aria-label={isDone ? tx("Mark not done") : tx("Mark done")}
          >
            {isDone && <Check size={14} className="text-zinc-950" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className={`text-sm font-medium ${isDone ? "text-zinc-400 line-through" : "text-zinc-100"}`}>
                {exercise.name}
                {isSwapped && <span className="text-xs text-orange-400 font-normal"> ({tx("swapped, easier")})</span>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setInfoOpen(true)}
                  className="text-muted hover:text-orange-400 p-0.5 -m-0.5"
                  aria-label={`How to do ${exercise.name}, with an AI tip`}
                  title={tx("How to · AI tip")}
                >
                  <Info size={15} />
                </button>
                {exercise.restSeconds > 0 && (
                  <div className="text-xs text-muted flex items-center gap-1">
                    <Clock size={12} /> {exercise.restSeconds}s
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-zinc-400">
              {displayedDetail}
              {isAdjusted && <span className="text-orange-400"> ({tx("adjusted")})</span>}
            </div>
            {lastTime && (
              <div className="text-xs text-muted flex items-center gap-1">
                <History size={10} className="shrink-0" /> {tx("Last time:")} <span className="text-zinc-300 stat-mono">{lastTime}</span>
              </div>
            )}
            {exercise.cue && <div className="text-xs text-orange-400/80 italic">{tx(exercise.cue)}</div>}
            {exercise.adaptNote && (
              <div className="text-xs text-sky-400/90 flex items-center gap-1 mt-0.5">
                <Sparkles size={10} className="shrink-0" /> {tx(exercise.adaptNote)}
              </div>
            )}
            {isSkipped && <div className="text-xs text-muted mt-0.5">{tx("Skipped")}</div>}

            <div className="flex items-center gap-1.5 mt-2">
              <button
                onClick={onToggleTimer}
                className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium ${
                  timerOpen ? "bg-zinc-800 text-zinc-200" : "bg-orange-500/15 text-orange-300 hover:bg-orange-500/25"
                }`}
              >
                <Play size={11} /> {timerOpen ? tx("Hide") : tx("Start")}
              </button>
              {onSkip && !isDone && (
                <button
                  onClick={onSkip}
                  className={`text-xs px-2 py-1.5 rounded-lg flex items-center gap-1 ${
                    isSkipped ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <SkipForward size={11} /> {isSkipped ? tx("Undo") : tx("Skip")}
                </button>
              )}
              {onCantDo && !isDone && (
                <button
                  onClick={onCantDo}
                  className="text-xs px-2 py-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-orange-400 flex items-center gap-1 whitespace-nowrap"
                >
                  <ArrowDownCircle size={11} /> {tx("Too hard")}
                </button>
              )}
              <div className="flex items-center ml-auto rounded-lg border border-zinc-700 overflow-hidden" title="Sets — or swipe the card">
                <button
                  onClick={() => onBump(-1)}
                  aria-label={tx("One set fewer")}
                  className="w-7 h-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 flex items-center justify-center"
                >
                  <Minus size={11} />
                </button>
                {isAdjusted && (
                  <button
                    onClick={onResetAdjust}
                    aria-label={tx("Reset to default")}
                    className="w-6 h-7 text-orange-400 hover:bg-zinc-800 flex items-center justify-center border-x border-zinc-700"
                  >
                    <RotateCcw size={10} />
                  </button>
                )}
                <button
                  onClick={() => onBump(1)}
                  aria-label={tx("One set more")}
                  className="w-7 h-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 flex items-center justify-center"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>

            {timerMounted && (
              <div className={timerOpen ? "" : "hidden"}>
                <ExerciseTimer key={exercise.name} exercise={displayedExercise} onLog={onTimerLog} />
              </div>
            )}
            {exercise.check && onCheckChange && (
              <SkillCheckPanel
                spec={exercise.check}
                value={checkValue}
                timerBest={bestHoldFromLog(timerLog)}
                onChange={onCheckChange}
              />
            )}
          </div>
        </div>
      </div>

      <ExerciseDetailModal exercise={exercise} trackLabel={trackLabel} open={infoOpen} onClose={() => setInfoOpen(false)} />
    </li>
  );
}
