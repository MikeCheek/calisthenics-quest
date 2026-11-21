"use client";

import { useRef, useState } from "react";
import CancelSessionDialog from "@/components/CancelSessionDialog";
import { useLanguage } from "@/context/LanguageContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { Dumbbell, Pause, Play, X } from "lucide-react";

const DRAG_CLICK_THRESHOLD = 6; // px of movement below which a release counts as a tap, not a drag
const BUBBLE_SIZE = 64;
const MARGIN = 12;

export default function TrainingBubble() {
  const { session, expanded, paused, currentExerciseName, expand, togglePause } =
    useTrainingSession();

  const { tx } = useLanguage();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(
    null
  );
  const bubbleRef = useRef<HTMLDivElement>(null);

  if (!session || expanded) return <CancelSessionDialog open={cancelOpen} onClose={() => setCancelOpen(false)} />;

  const defaultPos = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 400;
    const h = typeof window !== "undefined" ? window.innerHeight : 800;
    return { x: w - BUBBLE_SIZE - MARGIN, y: h - BUBBLE_SIZE - 140 };
  };

  const current = pos ?? defaultPos();

  const clamp = (x: number, y: number) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      x: Math.min(Math.max(MARGIN, x), w - BUBBLE_SIZE - MARGIN),
      y: Math.min(Math.max(MARGIN, y), h - BUBBLE_SIZE - MARGIN),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: current.x, originY: current.y, moved: false };
    bubbleRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > DRAG_CLICK_THRESHOLD || Math.abs(dy) > DRAG_CLICK_THRESHOLD) {
      dragRef.current.moved = true;
    }
    setPos(clamp(dragRef.current.originX + dx, dragRef.current.originY + dy));
  };

  const onPointerUp = () => {
    const wasDrag = dragRef.current?.moved;
    dragRef.current = null;
    if (!wasDrag) expand();
  };

  return (
    <>
    <div
      ref={bubbleRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (dragRef.current = null)}
      style={{ left: current.x, top: current.y, width: BUBBLE_SIZE, touchAction: "none" }}
      className="fixed z-[150] rounded-full bg-zinc-900 border-2 border-orange-500 shadow-xl cursor-grab active:cursor-grabbing select-none animate-pop-in"
      role="group"
      aria-label={tx("Training in progress")}
    >
      <div className="relative w-full h-full flex items-center justify-center p-2">
        {/* taps are handled by the drag logic above; this button is the
            keyboard and screen-reader way in (e.detail 0 = not a pointer) */}
        <button
          type="button"
          onClick={(e) => e.detail === 0 && expand()}
          className="rounded-full p-1"
          aria-label={tx("Resume training")}
        >
          {paused ? (
            <Pause size={20} className="text-orange-400" />
          ) : (
            <Dumbbell size={20} className="text-orange-400 animate-flame-pulse" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePause();
          }}
          className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-300"
          aria-label={paused ? tx("Resume") : tx("Pause")}
        >
          {paused ? <Play size={11} /> : <Pause size={11} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCancelOpen(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-500 flex items-center justify-center text-zinc-200"
          aria-label={tx("Cancel session")}
        >
          <X size={14} />
        </button>
      </div>
      {currentExerciseName && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-max max-w-[140px] text-center text-xs text-zinc-400 truncate pointer-events-none">
          {currentExerciseName}
        </div>
      )}
    </div>
    <CancelSessionDialog open={cancelOpen} onClose={() => setCancelOpen(false)} />
    </>
  );
}
