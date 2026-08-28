"use client";

import { useRef, useState } from "react";
import { Exercise } from "@/lib/types";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseTipButton from "@/components/ExerciseTipButton";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import { Check, Clock, Play, Minus, Plus, RotateCcw, ArrowDownCircle, Info } from "lucide-react";

const SWIPE_THRESHOLD = 55;
const SWIPE_MAX = 90;

export default function ExerciseRow({
  exercise,
  displayedDetail,
  isAdjusted,
  isSwapped,
  isDone,
  timerOpen,
  trackLabel,
  onToggleDone,
  onToggleTimer,
  onBump,
  onResetAdjust,
  onCantDo,
}: {
  exercise: Exercise;
  displayedDetail: string;
  isAdjusted: boolean;
  isSwapped?: boolean;
  isDone: boolean;
  timerOpen: boolean;
  trackLabel: string;
  onToggleDone: () => void;
  onToggleTimer: () => void;
  onBump: (delta: number) => void;
  onResetAdjust: () => void;
  onCantDo?: () => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
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
        isDone ? "border-emerald-600" : "border-zinc-700"
      }`}
    >
      {/* swipe hints revealed behind the card as you drag */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <div
          className="flex items-center gap-1 text-orange-400 text-xs font-medium transition-opacity"
          style={{ opacity: dragX < -15 ? Math.min(1, -dragX / SWIPE_THRESHOLD) : 0 }}
        >
          <Minus size={16} /> Easier
        </div>
        <div
          className="flex items-center gap-1 text-emerald-400 text-xs font-medium transition-opacity"
          style={{ opacity: dragX > 15 ? Math.min(1, dragX / SWIPE_THRESHOLD) : 0 }}
        >
          Harder <Plus size={16} />
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
            aria-label={isDone ? "Mark not done" : "Mark done"}
          >
            {isDone && <Check size={14} className="text-zinc-950" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className={`text-sm font-medium ${isDone ? "text-zinc-400 line-through" : "text-zinc-100"}`}>
                {exercise.name}
                {isSwapped && <span className="text-xs text-orange-400 font-normal"> (swapped, easier)</span>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setInfoOpen(true)}
                  className="text-zinc-500 hover:text-orange-400"
                  aria-label={`How to do ${exercise.name}`}
                >
                  <Info size={14} />
                </button>
                {exercise.restSeconds > 0 && (
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock size={12} /> {exercise.restSeconds}s
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-zinc-400">
              {displayedDetail}
              {isAdjusted && <span className="text-orange-400"> (adjusted)</span>}
            </div>
            {exercise.cue && <div className="text-xs text-orange-400/80 italic">{exercise.cue}</div>}

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <button
                onClick={onToggleTimer}
                className="text-xs px-2 py-1 rounded-lg border border-zinc-600 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center gap-1"
              >
                <Play size={11} /> {timerOpen ? "Hide timer" : "Start"}
              </button>
              <ExerciseTipButton exerciseName={exercise.name} exerciseDetail={exercise.detail} trackLabel={trackLabel} />
              {onCantDo && (
                <button
                  onClick={onCantDo}
                  className="text-xs px-2 py-1 rounded-lg border border-zinc-600 text-zinc-400 hover:border-orange-500 hover:text-orange-400 flex items-center gap-1"
                >
                  <ArrowDownCircle size={11} /> Can&apos;t do this
                </button>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => onBump(-1)}
                  aria-label="Make easier"
                  className="w-6 h-6 rounded-lg border border-zinc-600 text-zinc-400 hover:text-zinc-100 hover:border-zinc-400 flex items-center justify-center"
                >
                  <Minus size={11} />
                </button>
                {isAdjusted && (
                  <button
                    onClick={onResetAdjust}
                    aria-label="Reset to default"
                    className="w-6 h-6 rounded-lg border border-zinc-600 text-zinc-500 hover:text-orange-400 flex items-center justify-center"
                  >
                    <RotateCcw size={10} />
                  </button>
                )}
                <button
                  onClick={() => onBump(1)}
                  aria-label="Make harder"
                  className="w-6 h-6 rounded-lg border border-zinc-600 text-zinc-400 hover:text-zinc-100 hover:border-zinc-400 flex items-center justify-center"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>

            {timerOpen && <ExerciseTimer key={exercise.name} exercise={displayedExercise} />}
          </div>
        </div>
      </div>

      <ExerciseDetailModal exercise={exercise} trackLabel={trackLabel} open={infoOpen} onClose={() => setInfoOpen(false)} />
    </li>
  );
}
