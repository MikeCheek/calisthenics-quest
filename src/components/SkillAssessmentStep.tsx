"use client";

import { useState } from "react";
import { SkillProfile, StagedSkillKey, SkillMastery } from "@/lib/types";
import {
  QuizState,
  EMPTY_QUIZ_STATE,
  nextQuestion,
  currentBracket,
  applyQuizAnswers,
} from "@/lib/diagnosticQuestions";
import { effectiveLevel } from "@/lib/levelPath";
import { rankTitle } from "@/lib/xp";
import SkillTabPicker from "@/components/SkillTabPicker";
import { Check, X, Settings2, ArrowRight, Sparkles } from "lucide-react";

type Phase = "intro" | "quiz" | "summary" | "manual";

export default function SkillAssessmentStep({
  skills,
  mastery,
  currentXp,
  onChange,
}: {
  skills: SkillProfile;
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>;
  currentXp: number;
  onChange: (skills: SkillProfile, mastery: Partial<Record<StagedSkillKey, SkillMastery>>) => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [quiz, setQuiz] = useState<QuizState>(EMPTY_QUIZ_STATE);

  const question = phase === "quiz" ? nextQuestion(quiz) : null;
  const { low, high } = currentBracket(quiz);

  const start = () => {
    setQuiz(EMPTY_QUIZ_STATE);
    setPhase("quiz");
  };

  const answer = (yes: boolean) => {
    if (!question) return;
    const nextState: QuizState = {
      answers: { ...quiz.answers, [question.id]: yes },
      askedIds: [...quiz.askedIds, question.id],
    };
    setQuiz(nextState);

    if (nextQuestion(nextState) === null) {
      const { skills: nextSkills, mastery: nextMastery } = applyQuizAnswers(skills, mastery, nextState);
      onChange(nextSkills, nextMastery);
      setPhase("summary");
    }
  };

  const restart = () => {
    setQuiz(EMPTY_QUIZ_STATE);
    setPhase("intro");
  };

  const level = effectiveLevel(currentXp, skills, mastery);
  const yesCount = Object.values(quiz.answers).filter(Boolean).length;

  if (phase === "manual") {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setPhase(quiz.askedIds.length > 0 ? "summary" : "intro")}
          className="text-xs text-zinc-500 hover:text-orange-400"
        >
          ← Back to assessment
        </button>
        <SkillTabPicker
          skills={skills}
          mastery={mastery}
          liveLevel={level}
          onStageChange={(skill, stage) => onChange({ ...skills, [skill]: stage } as SkillProfile, mastery)}
          onMasteryChange={(skill, m) => onChange(skills, { ...mastery, [skill]: m })}
        />
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          A few quick questions get you set up at roughly the right level. They adapt as you
          answer — starting with one easy and one hard question to bracket where you are, then
          narrowing in — so it&apos;s usually done in well under 10 questions, sometimes just 2 or 3.
        </p>
        <button
          onClick={start}
          className="w-full py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center gap-2"
        >
          <Sparkles size={15} /> Start
        </button>
        <button
          onClick={() => setPhase("manual")}
          className="text-xs text-zinc-500 hover:text-orange-400 flex items-center gap-1"
        >
          <Settings2 size={12} /> Prefer to set every skill yourself?
        </button>
      </div>
    );
  }

  if (phase === "quiz" && question) {
    // a rough visual sense of "how narrowed down are we" — not a fixed
    // question count, since there isn't one
    const spanPct = Math.max(4, Math.min(100, 100 - ((high - low) / 66) * 100));
    return (
      <div className="space-y-5">
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${spanPct}%` }} />
        </div>
        <div className="text-xs text-zinc-500">Question {quiz.askedIds.length + 1}</div>
        <div className="panel p-5 text-center">
          <div className="text-lg text-zinc-100">{question.text}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => answer(false)}
            className="py-3.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 flex items-center justify-center gap-2 text-sm"
          >
            <X size={16} /> No
          </button>
          <button
            onClick={() => answer(true)}
            className="py-3.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Check size={16} /> Yes
          </button>
        </div>
      </div>
    );
  }

  // summary
  return (
    <div className="space-y-4">
      <div className="panel p-5 text-center border-orange-500/40">
        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">You&apos;re set up around</div>
        <div className="heading text-4xl text-zinc-100">Level {level}</div>
        <div className="text-sm text-orange-400 stat-mono mt-1">{rankTitle(level)}</div>
        <div className="text-xs text-zinc-500 mt-2">
          {yesCount} confirmed across {quiz.askedIds.length} question{quiz.askedIds.length === 1 ? "" : "s"}
        </div>
      </div>
      <p className="text-xs text-zinc-500 text-center">
        This is a starting point, not a strict lock-in — adjust any individual skill anytime
        from your profile.
      </p>
      <div className="flex gap-2">
        <button
          onClick={restart}
          className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 text-sm"
        >
          Retake
        </button>
        <button
          onClick={() => setPhase("manual")}
          className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 text-sm flex items-center justify-center gap-1.5"
        >
          <Settings2 size={14} /> Fine-tune
        </button>
      </div>
      <div className="text-xs text-zinc-600 flex items-center justify-center gap-1">
        Continue below when ready <ArrowRight size={12} />
      </div>
    </div>
  );
}
