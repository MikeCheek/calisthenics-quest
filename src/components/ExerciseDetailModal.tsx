"use client";

import Modal from "@/components/Modal";
import ExerciseTipButton from "@/components/ExerciseTipButton";
import { Exercise } from "@/lib/types";
import { Clock } from "lucide-react";

export default function ExerciseDetailModal({
  exercise,
  trackLabel,
  open,
  onClose,
}: {
  exercise: Exercise | null;
  trackLabel: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!exercise) return null;

  return (
    <Modal open={open} onClose={onClose} title={exercise.name}>
      <div className="text-sm text-zinc-200 mb-2 stat-mono">{exercise.detail}</div>
      {exercise.description && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wide text-emerald-400 mb-1">How to</div>
          <p className="text-sm text-zinc-300">{exercise.description}</p>
        </div>
      )}
      {exercise.restSeconds > 0 && (
        <div className="text-xs text-zinc-500 flex items-center gap-1 mb-2">
          <Clock size={12} /> {exercise.restSeconds}s rest between sets
        </div>
      )}
      {exercise.cue && <p className="text-sm text-orange-400/90 italic mb-3">{exercise.cue}</p>}
      <ExerciseTipButton exerciseName={exercise.name} exerciseDetail={exercise.detail} trackLabel={trackLabel} />
    </Modal>
  );
}
