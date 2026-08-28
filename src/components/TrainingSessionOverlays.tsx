"use client";

import { useTrainingSession } from "@/context/TrainingSessionContext";
import FocusTrainingMode from "@/components/FocusTrainingMode";
import TrainingBubble from "@/components/TrainingBubble";
import CelebrationOverlay from "@/components/CelebrationOverlay";

export default function TrainingSessionOverlays() {
  const { celebration } = useTrainingSession();
  return (
    <>
      <FocusTrainingMode />
      <TrainingBubble />
      <CelebrationOverlay celebration={celebration} />
    </>
  );
}
