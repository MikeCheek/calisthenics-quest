"use client";

import Modal from "@/components/Modal";
import ExerciseTipButton from "@/components/ExerciseTipButton";
import { useLanguage } from "@/context/LanguageContext";
import { localizedDescription } from "@/lib/exerciseTiming";
import { Exercise } from "@/lib/types";
import { Clock } from "lucide-react";
import ExerciseDemo from "@/components/ExerciseDemo";
import FormGuide from "@/components/FormGuide";
import { localizeDetail } from "@/lib/i18n/detail";

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
  const { t, tx, locale } = useLanguage();
  if (!exercise) return null;
  const description = localizedDescription(exercise, locale);

  return (
    <Modal open={open} onClose={onClose} title={exercise.name}>
      <ExerciseDemo exerciseName={exercise.name} width={220} className="mb-3" />
      <div className="text-sm text-zinc-200 mb-2 stat-mono">{localizeDetail(exercise.detail, locale)}</div>
      {description && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wide text-emerald-400 mb-1">{t("exercise", "howTo")}</div>
          <p className="text-sm text-zinc-300">{description}</p>
        </div>
      )}
      {exercise.restSeconds > 0 && (
        <div className="text-xs text-muted flex items-center gap-1 mb-2">
          <Clock size={12} /> {exercise.restSeconds}{t("exercise", "restBetweenSets")}
        </div>
      )}
      {exercise.cue && <p className="text-sm text-orange-400/90 italic mb-3">{tx(exercise.cue)}</p>}
      <div className="mb-3">
        <FormGuide exerciseName={exercise.name} />
      </div>
      <ExerciseTipButton exerciseName={exercise.name} exerciseDetail={exercise.detail} trackLabel={trackLabel} />
    </Modal>
  );
}
