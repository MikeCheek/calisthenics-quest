"use client";

import { useRef, useState } from "react";
import { Exercise } from "@/lib/types";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import SkillCheckPanel from "@/components/SkillCheckPanel";
import { TimerLog, bestHoldFromLog } from "@/lib/timingLearning";
import { Check, Clock, Play, Minus, Plus, RotateCcw, ArrowDownCircle, Info, SkipForward, Sparkles, History, HeartCrack, MoreHorizontal } from "lucide-react";
import RowMenu from "@/components/RowMenu";
import { useLanguage } from "@/context/LanguageContext";
import { localizeDetail } from "@/lib/i18n/detail";

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
  onHurts,
  onSkip,
  onStopEarly,
  onUndoSwap,
  timerLog,
  onTimerLog,
  checkValue,
  onCheckChange,
  lastTime,
  checkVideoKey,
  onCheckVideo,
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
  onHurts?: () => void; // "This hurts": a gentler version, and it rests for two weeks
  onSkip?: () => void;
  onStopEarly?: (setsDone: number) => void;
  onUndoSwap?: () => void;
  timerLog?: TimerLog;
  onTimerLog?: (log: TimerLog) => void;
  checkValue?: number | boolean;
  onCheckChange?: (v: number | boolean | undefined) => void;
  lastTime?: string; // "12·11·10 reps · 12 Nov"
  checkVideoKey?: string;
  onCheckVideo?: (key: string | undefined) => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { tx, locale } = useLanguage();
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
          {/* a 22px box inside a 44px tap area */}
          <button
            onClick={onToggleDone}
            className="-m-2.5 p-2.5 shrink-0 rounded-lg"
            aria-label={isDone ? tx("Mark not done") : tx("Mark done")}
            aria-pressed={isDone}
          >
            <span
              className={`w-[22px] h-[22px] rounded-md border flex items-center justify-center ${
                isDone ? "bg-emerald-500 border-emerald-500" : "border-zinc-500"
              }`}
            >
              {isDone && <Check size={15} className="text-zinc-950" />}
            </span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className={`text-sm font-medium ${isDone ? "text-zinc-400 line-through" : "text-zinc-100"}`}>
                {exercise.name}
                {isSwapped && (
                  <span className="text-xs text-orange-400 font-normal">
                    {" "}({tx("swapped, easier")}
                    {onUndoSwap && (
                      <>
                        {" · "}
                        <button onClick={onUndoSwap} className="underline text-zinc-300 hover:text-zinc-100">
                          {tx("Undo")}
                        </button>
                      </>
                    )}
                    )
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setInfoOpen(true)}
                  className="text-muted hover:text-orange-400 p-3 -m-3"
                  aria-label={tx("How to do {ex}, with an AI tip", { ex: exercise.name })}
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
              {localizeDetail(displayedDetail, locale)}
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

            {/* one action up front, the set count, and the rest in a menu */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={onToggleTimer}
                className={`text-sm min-h-11 px-4 rounded-lg flex items-center gap-1.5 font-medium ${
                  timerOpen ? "bg-zinc-800 text-zinc-200" : "bg-orange-500/15 text-orange-300 hover:bg-orange-500/25"
                }`}
              >
                <Play size={13} /> {timerOpen ? tx("Hide") : tx("Start")}
              </button>
              {isSkipped && onSkip && (
                <button onClick={onSkip} className="text-sm min-h-11 px-3 rounded-lg bg-zinc-800 text-zinc-100 flex items-center gap-1.5">
                  <SkipForward size={13} /> {tx("Undo skip")}
                </button>
              )}
              <div className="flex items-center ml-auto shrink-0 rounded-lg border border-zinc-700 overflow-hidden" title={tx("Sets — or swipe the card")}>
                <button
                  onClick={() => onBump(-1)}
                  aria-label={tx("One set fewer")}
                  className="w-11 h-11 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 flex items-center justify-center"
                >
                  <Minus size={15} />
                </button>
                {isAdjusted && (
                  <button
                    onClick={onResetAdjust}
                    aria-label={tx("Reset to default")}
                    className="w-11 h-11 text-orange-400 hover:bg-zinc-800 flex items-center justify-center border-x border-zinc-700"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                <button
                  onClick={() => onBump(1)}
                  aria-label={tx("One set more")}
                  className="w-11 h-11 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 flex items-center justify-center"
                >
                  <Plus size={15} />
                </button>
              </div>
              {!isDone && (onSkip || onCantDo || onHurts) && (
                <RowMenu
                  label={tx("More for {ex}", { ex: exercise.name })}
                  icon={<MoreHorizontal size={18} />}
                  items={[
                    ...(onSkip && !isSkipped ? [{ label: tx("Skip"), icon: <SkipForward size={15} />, onClick: onSkip }] : []),
                    ...(onCantDo ? [{ label: tx("Too hard — an easier version"), icon: <ArrowDownCircle size={15} />, onClick: onCantDo }] : []),
                    ...(onHurts ? [{ label: tx("This hurts — a gentler version"), icon: <HeartCrack size={15} />, onClick: onHurts, tone: "rose" as const }] : []),
                  ]}
                />
              )}
            </div>

            {timerMounted && (
              <div className={timerOpen ? "" : "hidden"}>
                <ExerciseTimer key={exercise.name} exercise={displayedExercise} onLog={onTimerLog} onStopEarly={onStopEarly} />
              </div>
            )}
            {exercise.check && onCheckChange && (
              <SkillCheckPanel
                spec={exercise.check}
                value={checkValue}
                timerBest={bestHoldFromLog(timerLog)}
                onChange={onCheckChange}
                videoKey={checkVideoKey}
                onVideo={onCheckVideo}
              />
            )}
          </div>
        </div>
      </div>

      <ExerciseDetailModal exercise={exercise} trackLabel={trackLabel} open={infoOpen} onClose={() => setInfoOpen(false)} />
    </li>
  );
}
