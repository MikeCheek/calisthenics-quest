"use client";

import { useEffect, useMemo, useState } from "react";
import { SkillProfile, StagedSkillKey, SkillMastery, TrainingEquipment } from "@/lib/types";
import {
  ASSESSMENT_AREAS,
  AssessmentAnswers,
  AssessmentArea,
  SideLevel,
  SOLIDITY_OPTIONS,
  DEFAULT_SOLIDITY,
  TIER_LABEL,
  answersFromProfile,
  applyAssessment,
  areaHasContent,
  areaTier,
  sideLevel,
  visibleBaselines,
  visibleLadders,
  visibleSides,
} from "@/lib/assessment";
import { levelFromXp } from "@/lib/xp";
import SkillTabPicker from "@/components/SkillTabPicker";
import ScrollPicker from "@/components/ScrollPicker";
import { Check, Settings2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Phase = "intro" | "area" | "summary" | "manual";

const SIDE_STATE: { label: string; cls: string }[] = [
  { label: "Not yet", cls: "border-zinc-500 bg-zinc-800 text-zinc-100" },
  { label: "Working on it", cls: "border-sky-500/60 bg-sky-500/10 text-sky-200" },
  { label: "Can do it", cls: "border-emerald-500 bg-emerald-500/10 text-emerald-200" },
];

export default function SkillAssessmentStep({
  skills,
  mastery,
  equipment,
  currentXp,
  onChange,
  onInProgressChange,
  onAtIntro,
  onSkip,
  skipLabel,
}: {
  skills: SkillProfile;
  mastery: Partial<Record<StagedSkillKey, SkillMastery>>;
  equipment: TrainingEquipment;
  currentXp: number;
  onChange: (skills: SkillProfile, mastery: Partial<Record<StagedSkillKey, SkillMastery>>) => void;
  onInProgressChange?: (inProgress: boolean) => void;
  // onboarding: the intro is a choice — assess, or skip on purpose
  onAtIntro?: (atIntro: boolean) => void;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  const { tx } = useLanguage();
  const [phase, setPhase] = useState<Phase>("intro");
  const [areaIdx, setAreaIdx] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>(() => answersFromProfile(skills, mastery));
  // the profile as it was when the assessment started — answers are always
  // folded onto this, so going back and changing one never compounds
  const [base, setBase] = useState<{ skills: SkillProfile; mastery: typeof mastery }>({ skills, mastery });

  useEffect(() => {
    onInProgressChange?.(phase === "area");
    onAtIntro?.(phase === "intro");
  }, [phase, onInProgressChange, onAtIntro]);

  const areas = useMemo(
    () => ASSESSMENT_AREAS.filter((a) => areaHasContent(a, answers, equipment)),
    [answers, equipment]
  );
  const area: AssessmentArea | undefined = areas[Math.min(areaIdx, areas.length - 1)];

  const update = (next: AssessmentAnswers) => {
    setAnswers(next);
    const applied = applyAssessment(base.skills, base.mastery, next, equipment);
    onChange(applied.skills, applied.mastery);
  };

  const start = () => {
    setBase({ skills, mastery });
    setAreaIdx(0);
    setPhase("area");
  };

  const level = levelFromXp(currentXp);

  if (phase === "manual") {
    return (
      <div className="space-y-3">
        <button onClick={() => setPhase("summary")} className="text-xs text-muted hover:text-orange-400">
          ← {tx("Back to assessment")}
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
          {tx("We'll go through each movement area separately — pulling, pushing, balance, core, legs and levers — because most people are strong in some and just starting in others. For each main skill, pick the hardest version you can do and how solid it is. Then tap any side skills you have. About 2–3 minutes.")}
        </p>
        <ul className="text-xs text-muted space-y-1">
          <li>• {tx("Only skills your equipment allows are asked.")}</li>
          <li>• {tx("Side skills adapt to your level in each area — no elite moves for beginners.")}</li>
          <li>• {tx("Not sure? Pick the lower option. Your training adapts as you go.")}</li>
          <li>• {tx("Everything you claim gets verified later by Skill Checks in your sessions.")}</li>
        </ul>
        <button
          onClick={start}
          className="w-full py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center gap-2"
        >
          <Sparkles size={15} /> {tx("Start assessment")}
        </button>
        <button
          onClick={() => setPhase("manual")}
          className="min-h-11 text-sm text-zinc-300 hover:text-orange-400 flex items-center gap-1.5"
        >
          <Settings2 size={14} /> {tx("Prefer to set every skill yourself?")}
        </button>
        {onSkip && (
          <div className="border-t border-zinc-800 pt-2">
            <button onClick={onSkip} className="min-h-11 text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-2">
              {tx(skipLabel ?? "Skip — start me as a beginner")}
            </button>
            <p className="text-xs text-muted">
              {tx(skipLabel === "Keep my current levels" ? "Your levels stay as they are." : "Sessions start at the easiest stage of every skill and step up as you go.")}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (phase === "area" && area) {
    const ladders = visibleLadders(area, answers, equipment);
    const sides = visibleSides(area, answers, equipment);
    const baselines = visibleBaselines(area, equipment);
    const unanswered = ladders.filter((l) => answers.stages[l.skill] === undefined);
    const tier = areaTier(area, answers, equipment);
    const isLast = areaIdx >= areas.length - 1;

    const goNext = () => {
      // lock in tier-assumed side chips as real answers before moving on,
      // so they don't silently flip if a later edit shifts the tier
      const sidesNow = { ...answers.sides };
      for (const s of sides) sidesNow[s.skill] = sideLevel(area, s, answers, equipment);
      update({ ...answers, sides: sidesNow });
      if (isLast) setPhase("summary");
      else setAreaIdx(areaIdx + 1);
      window.scrollTo?.({ top: 0, behavior: "smooth" });
    };

    return (
      <div className="space-y-5">
        <div>
          <div className="flex gap-1 mb-2">
            {areas.map((a, i) => (
              <div key={a.id} className={`h-1 flex-1 rounded-full ${i <= areaIdx ? "bg-orange-500" : "bg-zinc-800"}`} />
            ))}
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="heading text-lg text-zinc-100">{tx(area.title)}</h2>
            <div className="text-xs text-muted">
              {areaIdx + 1} / {areas.length}
            </div>
          </div>
          <p className="text-xs text-muted">{tx(area.blurb)}</p>
        </div>

        {baselines.length > 0 && (
          <div className={`grid gap-3 ${baselines.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {baselines.map((b) => (
              <ScrollPicker
                key={b.key}
                label={tx(b.label)}
                value={answers.baselines[b.key] ?? skills[b.key] ?? 0}
                min={0}
                max={b.max}
                variant="wheel"
                onChange={(v) => update({ ...answers, baselines: { ...answers.baselines, [b.key]: v } })}
              />
            ))}
          </div>
        )}
        {area.archerToggle && (equipment.pullUpBar || equipment.rings) && (
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={!!answers.archerPullUp}
              onChange={(e) => update({ ...answers, archerPullUp: e.target.checked })}
              className="accent-orange-500 w-4 h-4"
            />
            {tx("I can do archer pull-ups")}
          </label>
        )}

        {ladders.map((l) => {
          const selected = answers.stages[l.skill];
          return (
            <div key={l.skill} className="panel p-3.5 space-y-2">
              <div className="text-sm text-zinc-100 font-medium">
                {tx(l.title)} <span className="text-muted font-normal">— {tx("hardest version you can do")}</span>
              </div>
              <div className="space-y-1.5">
                {l.options.map((o) => {
                  const on = selected === o.stage;
                  return (
                    <button
                      key={o.stage}
                      type="button"
                      onClick={() => update({ ...answers, stages: { ...answers.stages, [l.skill]: o.stage } })}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center gap-2.5 transition-colors ${
                        on ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${
                          on ? "border-orange-500 bg-orange-500" : "border-zinc-600"
                        }`}
                      >
                        {on && <Check size={10} className="text-zinc-950" />}
                      </span>
                      <span>
                        {tx(o.label)}
                        {o.hint && <span className="block text-xs text-muted">{tx(o.hint)}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selected && selected !== "none" && (
                <div className="pt-1">
                  <div className="text-xs text-muted mb-1.5">{tx("How solid is it?")}</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SOLIDITY_OPTIONS.map((opt) => {
                      const on = (answers.solidity[l.skill] ?? DEFAULT_SOLIDITY) === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          title={tx(opt.hint)}
                          onClick={() => update({ ...answers, solidity: { ...answers.solidity, [l.skill]: opt.value } })}
                          className={`py-1.5 rounded-lg border text-xs ${
                            on ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {tx(opt.label)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sides.length > 0 && (
          <div className="space-y-2">
            <div>
              <div className="text-sm text-zinc-100 font-medium">{tx("Side skills")}</div>
              <div className="text-xs text-muted">{tx("For each: not yet, working on it, or can do it.")}</div>
            </div>
            {ladders.length + baselines.length > 0 && (
              <div className="text-xs text-muted">
                {tx("Shown for your level here:")} <span className="text-orange-400">{tx(TIER_LABEL[tier])}</span>
              </div>
            )}
            {/* one row per skill, its three answers side by side: nothing to discover by tapping */}
            <ul className="space-y-2">
              {sides.map((s) => {
                const lvl = sideLevel(area, s, answers, equipment);
                const assumed = answers.sides[s.skill] === undefined && lvl === 2;
                return (
                  <li key={s.skill} className="rounded-lg border border-zinc-800 p-2">
                    <div className="text-sm text-zinc-200 mb-1.5" id={`side-${s.skill}`}>
                      {tx(s.label)}
                      {assumed && <span className="text-xs text-muted"> · {tx("assumed from your level")}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-1" role="group" aria-labelledby={`side-${s.skill}`}>
                      {SIDE_STATE.map((st, i) => (
                        <button
                          key={st.label}
                          type="button"
                          aria-pressed={lvl === i}
                          onClick={() => update({ ...answers, sides: { ...answers.sides, [s.skill]: i as SideLevel } })}
                          className={`min-h-11 px-1 rounded-md border text-xs transition-colors ${lvl === i ? st.cls : "border-zinc-800 text-zinc-400 hover:border-zinc-600"}`}
                        >
                          {tx(st.label)}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => (areaIdx === 0 ? setPhase("intro") : setAreaIdx(areaIdx - 1))}
            className="px-4 py-3 rounded-lg border border-zinc-700 text-zinc-300 text-sm flex items-center gap-1"
          >
            <ChevronLeft size={15} /> {tx("Back")}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={unanswered.length > 0}
            className="flex-1 py-3 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-40 flex items-center justify-center gap-1"
          >
            {unanswered.length > 0
              ? tx("Answer {x}", { x: unanswered.map((u) => tx(u.title)).join(", ") })
              : isLast
              ? tx("See my results")
              : tx("Next area")}
            {unanswered.length === 0 && <ChevronRight size={15} />}
          </button>
        </div>
      </div>
    );
  }

  // summary
  return (
    <div className="space-y-4">
      <div className="panel p-5 text-center border-orange-500/40">
        <div className="text-xs text-muted uppercase tracking-wide mb-1">{tx("You're set up around")}</div>
        <div className="heading text-4xl text-zinc-100">{tx("Level {n}", { n: level })}</div>
      </div>
      {phase === "summary" && (
        <ul className="panel p-3 space-y-1.5">
          {areas.map((a) => {
            const t = areaTier(a, answers, equipment);
            const sidesOnly = visibleLadders(a, answers, equipment).length + visibleBaselines(a, equipment).length === 0;
            const marked = visibleSides(a, answers, equipment).filter((s) => sideLevel(a, s, answers, equipment) > 0).length;
            return (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{tx(a.title)}</span>
                {sidesOnly ? (
                  <span className="text-muted">{tx(marked === 1 ? "{n} skill marked" : "{n} skills marked", { n: marked })}</span>
                ) : (
                  <span className={t === 2 ? "text-emerald-400" : t === 1 ? "text-sky-400" : "text-muted"}>
                    {tx(TIER_LABEL[t])}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-muted text-center">
        {tx("A starting point, not a lock-in. Sessions adapt as you complete, skip or mark exercises too hard, and Skill Checks verify what you claimed.")}
      </p>
      <div className="flex gap-2">
        <button
          onClick={start}
          className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 text-sm"
        >
          {tx("Review answers")}
        </button>
        <button
          onClick={() => setPhase("manual")}
          className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 text-sm flex items-center justify-center gap-1.5"
        >
          <Settings2 size={14} /> {tx("Fine-tune")}
        </button>
      </div>
    </div>
  );
}
