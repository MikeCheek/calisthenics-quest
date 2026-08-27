"use client";

import { useState } from "react";
import { SkillProfile, StagedSkillKey, SkillMastery } from "@/lib/types";
import {
  SelfTier,
  TIER_LABEL,
  TIER_HINT,
  questionsForTier,
  applyDiagnosticAnswers,
} from "@/lib/diagnosticQuestions";
import { effectiveLevel } from "@/lib/levelPath";
import { rankTitle } from "@/lib/xp";
import SkillTabPicker from "@/components/SkillTabPicker";
import { Check, X, Settings2, ArrowRight } from "lucide-react";

type Phase = "tier" | "quiz" | "summary" | "manual";

const TIERS: SelfTier[] = ["beginner", "intermediate", "advanced", "expert"];

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
  const [phase, setPhase] = useState<Phase>("tier");
  const [tier, setTier] = useState<SelfTier | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const questions = tier ? questionsForTier(tier) : [];
  const currentQuestion = questions[qIndex];

  const pickTier = (t: SelfTier) => {
    setTier(t);
    setQIndex(0);
    setAnswers({});
    setPhase("quiz");
  };

  const answer = (yes: boolean) => {
    if (!currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: yes };
    setAnswers(nextAnswers);
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      const { skills: nextSkills, mastery: nextMastery } = applyDiagnosticAnswers(
        skills,
        mastery,
        tier!,
        nextAnswers
      );
      onChange(nextSkills, nextMastery);
      setPhase("summary");
    }
  };

  const restart = () => {
    setPhase("tier");
    setTier(null);
    setQIndex(0);
    setAnswers({});
  };

  const level = effectiveLevel(currentXp, skills, mastery);
  const yesCount = Object.values(answers).filter(Boolean).length;

  if (phase === "manual") {
    return (
      <div className="space-y-3">
        <button onClick={() => setPhase(tier ? "summary" : "tier")} className="text-xs text-zinc-500 hover:text-orange-400">
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

  if (phase === "tier") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          A few quick questions get you set up at roughly the right level — you can always
          fine-tune individual skills later from your profile. First, how would you describe
          yourself?
        </p>
        <div className="space-y-2">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => pickTier(t)}
              className="w-full text-left panel p-3 hover:border-orange-500 transition-colors"
            >
              <div className="text-sm heading text-zinc-100">{TIER_LABEL[t]}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{TIER_HINT[t]}</div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setPhase("manual")}
          className="text-xs text-zinc-500 hover:text-orange-400 flex items-center gap-1"
        >
          <Settings2 size={12} /> Prefer to set every skill yourself?
        </button>
      </div>
    );
  }

  if (phase === "quiz" && currentQuestion) {
    return (
      <div className="space-y-5">
        <div className="flex gap-1.5">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-1.5 flex-1 rounded-full ${i < qIndex ? "bg-orange-500" : i === qIndex ? "bg-orange-500/50" : "bg-zinc-800"}`}
            />
          ))}
        </div>
        <div className="text-xs text-zinc-500">
          Question {qIndex + 1} of {questions.length}
        </div>
        <div className="panel p-5 text-center">
          <div className="text-lg text-zinc-100">{currentQuestion.text}</div>
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
          {yesCount} of {questions.length} confirmed from {tier ? TIER_LABEL[tier] : ""}
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
