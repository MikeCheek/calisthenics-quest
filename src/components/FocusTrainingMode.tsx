"use client";

import { useMemo, useState } from "react";
import { TrainingSession, Exercise } from "@/lib/types";
import ExerciseTimer from "@/components/ExerciseTimer";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import { X, ChevronLeft, ChevronRight, Info, Check } from "lucide-react";

interface Step {
  key: string;
  setTitle: string;
  exercise: Exercise;
}

function flattenSession(session: TrainingSession): Step[] {
  const steps: Step[] = [];
  session.sets.forEach((set) => {
    set.exercises.forEach((ex, i) => {
      steps.push({ key: `${set.title}-${i}`, setTitle: set.title, exercise: ex });
    });
  });
  return steps;
}

export default function FocusTrainingMode({
  session,
  onExit,
  onFinish,
}: {
  session: TrainingSession;
  onExit: () => void;
  onFinish: () => void;
}) {
  const steps = useMemo(() => flattenSession(session), [session]);
  const [index, setIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [infoOpen, setInfoOpen] = useState(false);
  const [allDoneScreen, setAllDoneScreen] = useState(false);

  const current = steps[index];
  const isLastStep = index === steps.length - 1;

  const markCompleteAndAdvance = () => {
    setCompletedSteps((prev) => new Set(prev).add(index));
    if (isLastStep) {
      setAllDoneScreen(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (index === 0) return;
    setAllDoneScreen(false);
    setIndex((i) => i - 1);
  };

  const goNext = () => {
    // Manual "Next" always marks the current exercise done, same as
    // finishing its timer would — the athlete is the judge of "done enough."
    markCompleteAndAdvance();
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col safe-top safe-bottom">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button onClick={onExit} className="p-1.5 text-zinc-500 hover:text-zinc-200" aria-label="Exit focus mode">
          <X size={20} />
        </button>
        <div className="text-xs text-zinc-500 stat-mono">
          {Math.min(index + 1, steps.length)} / {steps.length}
        </div>
      </div>

      {/* stepper */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`h-1.5 flex-1 rounded-full ${
                completedSteps.has(i)
                  ? "bg-emerald-500"
                  : i === index
                  ? "bg-orange-500"
                  : "bg-zinc-800"
              }`}
            />
          ))}
        </div>
        {!allDoneScreen && !isLastStep && (
          <div className="text-xs text-zinc-500 mt-2 truncate">
            Next: {steps[index + 1].exercise.name}
          </div>
        )}
      </div>

      {allDoneScreen ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
            <Check size={28} className="text-emerald-400" />
          </div>
          <div className="heading text-2xl text-zinc-100 mb-2">Session complete!</div>
          <p className="text-sm text-zinc-400 mb-6">Every exercise is done. Log it to bank your XP and streak.</p>
          <button
            onClick={onFinish}
            className="w-full max-w-xs py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950"
          >
            Finish &amp; log session
          </button>
          <button onClick={goBack} className="text-xs text-zinc-500 hover:text-zinc-300 mt-3">
            Go back and review
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
            <div className="text-center mb-6">
              <div className="text-xs uppercase tracking-wide text-emerald-400 mb-1">{current.setTitle}</div>
              <div className="flex items-center justify-center gap-2">
                <div className="heading text-2xl text-zinc-100">{current.exercise.name}</div>
                <button
                  onClick={() => setInfoOpen(true)}
                  className="p-1 text-zinc-500 hover:text-orange-400"
                  aria-label={`Details for ${current.exercise.name}`}
                >
                  <Info size={18} />
                </button>
              </div>
              <div className="text-sm text-zinc-400 mt-1">{current.exercise.detail}</div>
            </div>

            <div className="max-w-sm w-full mx-auto">
              <ExerciseTimer key={current.key} exercise={current.exercise} onComplete={markCompleteAndAdvance} />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-4 border-t border-zinc-800 gap-3">
            <button
              onClick={goBack}
              disabled={index === 0}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={goNext}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center justify-center gap-1.5 text-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      <ExerciseDetailModal
        exercise={current.exercise}
        trackLabel={session.focusLabel}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
}
