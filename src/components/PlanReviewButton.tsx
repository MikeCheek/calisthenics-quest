"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { useToast } from "@/context/ToastContext";
import { TrainingSession, SkillProfile, TrainingEquipment } from "@/lib/types";
import { Sparkles, Star, Check, X, ArrowRight } from "lucide-react";

interface Suggestion {
  key: string;
  suggestedName: string;
  suggestedDetail: string;
  reason: string;
}

interface ReviewResult {
  score: number;
  summary: string;
  suggestions: Suggestion[];
}

function summarizeSkills(focusLabel: string, skills: SkillProfile): string {
  // A short, focus-relevant slice of the athlete's profile rather than
  // dumping all 50 skills — the model only needs what's actually relevant
  // to judge today's session.
  return `training toward ${focusLabel}; pull-ups max ${skills.pullUpMaxReps}, dips max ${skills.dipMaxReps}`;
}

const EQUIPMENT_LABEL: Record<keyof TrainingEquipment, string> = {
  pullUpBar: "pull-up bar",
  parallelBars: "parallel bars / dip station",
  rings: "gymnastic rings",
  wallSpace: "wall space",
  verticalPole: "vertical pole / sturdy tree",
  monkeyBars: "monkey bars",
  weights: "weights",
  resistanceBands: "resistance bands",
};

function summarizeEquipment(equipment: TrainingEquipment): string {
  const owned = Object.entries(equipment)
    .filter(([, has]) => has)
    .map(([key]) => EQUIPMENT_LABEL[key as keyof TrainingEquipment] ?? key);
  return owned.length ? owned.join(", ") : "bodyweight only, no equipment";
}

export default function PlanReviewButton({
  session,
  skills,
  equipment,
  onApply,
}: {
  session: TrainingSession;
  skills: SkillProfile;
  equipment: TrainingEquipment;
  onApply: (next: TrainingSession) => void;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [approved, setApproved] = useState<Set<string>>(new Set());

  const runReview = async () => {
    setOpen(true);
    setLoading(true);
    setResult(null);
    setApproved(new Set());

    const exercises = session.sets.flatMap((set) =>
      set.exercises.map((ex, i) => ({ key: `${set.title}-${i}`, setTitle: set.title, name: ex.name, detail: ex.detail }))
    );

    try {
      const res = await fetch("/api/plan-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusLabel: session.focusLabel,
          skillsSummary: summarizeSkills(session.focusLabel, skills),
          equipmentSummary: summarizeEquipment(equipment),
          exercises,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.configured === false) {
        toast.warning(data.error ?? "AI review isn't available right now.");
        setOpen(false);
        return;
      }
      setResult({ score: data.score, summary: data.summary, suggestions: data.suggestions ?? [] });
      // pre-approve every suggestion by default — the athlete unchecks
      // whichever ones they'd rather keep as originally generated
      setApproved(new Set((data.suggestions ?? []).map((s: Suggestion) => s.key)));
    } catch {
      toast.error("Couldn't reach the AI reviewer — check your connection and try again.");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) => {
    setApproved((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const findOriginal = (key: string) => {
    for (const set of session.sets) {
      const idx = set.exercises.findIndex((_, i) => `${set.title}-${i}` === key);
      if (idx !== -1) return set.exercises[idx];
    }
    return null;
  };

  const applyApproved = () => {
    if (!result) return;
    const byKey = new Map(result.suggestions.filter((s) => approved.has(s.key)).map((s) => [s.key, s]));
    if (byKey.size === 0) {
      setOpen(false);
      return;
    }
    const next: TrainingSession = {
      ...session,
      sets: session.sets.map((set) => ({
        ...set,
        exercises: set.exercises.map((ex, i) => {
          const s = byKey.get(`${set.title}-${i}`);
          if (!s) return ex;
          return { name: s.suggestedName, detail: s.suggestedDetail, restSeconds: ex.restSeconds };
        }),
      })),
    };
    onApply(next);
    toast.success(`Applied ${byKey.size} AI suggestion${byKey.size === 1 ? "" : "s"}.`);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={runReview}
        className="w-full py-2.5 rounded-lg border border-orange-500/40 text-orange-300 hover:bg-orange-500/10 text-sm flex items-center justify-center gap-2"
      >
        <Sparkles size={15} /> Review with AI
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="AI plan review">
        {loading && <div className="text-sm text-zinc-400 py-6 text-center">Reviewing today&apos;s session...</div>}

        {!loading && result && (
          <div className="space-y-4">
            <div className="panel p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
                <Star size={20} className="text-orange-400" />
              </div>
              <div>
                <div className="stat-mono text-2xl text-zinc-100">{result.score}/10</div>
                <p className="text-xs text-zinc-400">{result.summary}</p>
              </div>
            </div>

            {result.suggestions.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-2">
                No changes suggested — the AI thinks today&apos;s session is already well-matched to you.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-zinc-500">
                  {result.suggestions.length} suggested change{result.suggestions.length === 1 ? "" : "s"} — pick which to apply
                </div>
                {result.suggestions.map((s) => {
                  const original = findOriginal(s.key);
                  const isApproved = approved.has(s.key);
                  return (
                    <div
                      key={s.key}
                      className={`panel p-3 border ${isApproved ? "border-orange-500/60" : "border-zinc-700"}`}
                    >
                      <div className="flex items-start justify-between gap-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="text-zinc-500 line-through truncate">
                            {original?.name} — {original?.detail}
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-100 mt-0.5">
                            <ArrowRight size={12} className="text-orange-400 shrink-0" />
                            <span className="truncate">
                              {s.suggestedName} — {s.suggestedDetail}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggle(s.key)}
                          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border ${
                            isApproved
                              ? "bg-orange-500 border-orange-500 text-zinc-950"
                              : "border-zinc-600 text-zinc-500"
                          }`}
                          aria-label={isApproved ? "Don't apply this change" : "Apply this change"}
                        >
                          {isApproved ? <Check size={14} /> : <X size={14} />}
                        </button>
                      </div>
                      {s.reason && <p className="text-xs text-zinc-500 mt-1.5">{s.reason}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm"
              >
                Keep my plan
              </button>
              {result.suggestions.length > 0 && (
                <button
                  onClick={applyApproved}
                  className="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium"
                >
                  Apply {approved.size > 0 ? `(${approved.size})` : ""}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
