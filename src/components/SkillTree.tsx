"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserDoc, StagedSkillKey, SKILL_FIELD_LABEL, MASTERY_LABEL, SkillMastery, DEFAULT_MASTERY } from "@/lib/types";
import { SKILL_CATEGORIES } from "@/lib/skillCategories";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { nextUnlocks, stageStates } from "@/lib/skillTree";
import { useLanguage } from "@/context/LanguageContext";
import { BadgeCheck, ChevronDown, Check, Lock, Target, Dices, Info, ArrowRight } from "lucide-react";

// Skills as progressions rather than a flat list: each started skill shows
// its chain of stages (done / current / next / locked); tapping opens the
// full ladder. "Up next" pins the three next unlocks the athlete is closest
// to (see nextUnlocks in lib/skillTree.ts for the ranking).
export default function SkillTree({
  userDoc,
  playerLevel,
  onInfo,
}: {
  userDoc: UserDoc;
  playerLevel: number;
  onInfo: (skill: StagedSkillKey) => void;
}) {
  const { tx } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState<StagedSkillKey | null>(null);
  const [showUntouched, setShowUntouched] = useState<Set<string>>(new Set());
  const rec = userDoc.skills as unknown as Record<string, string>;
  const next = nextUnlocks(userDoc.skills, userDoc.skillMastery ?? {}, userDoc.goalTracks ?? [], userDoc.claims, playerLevel);

  const toggleUntouched = (cat: string) =>
    setShowUntouched((prev) => {
      const n = new Set(prev);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });

  const jumpTo = (skill: StagedSkillKey) => {
    const cat = SKILL_CATEGORIES.find((c) => c.skills.includes(skill));
    if (cat && rec[skill] === "none") setShowUntouched((p) => new Set(p).add(cat.name));
    setOpen(skill);
    setTimeout(() => document.getElementById(`skill-${skill}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  return (
    <div className="space-y-5">
      {next.length > 0 && (
        <section className="panel p-4 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
          <div className="heading text-base text-zinc-100 mb-3 flex items-center gap-2">
            <Target size={16} className="text-orange-400" /> {tx("Up next")}
          </div>
          <ul className="space-y-2">
            {next.map((u) => (
              <li key={u.skill}>
                <button
                  onClick={() => jumpTo(u.skill)}
                  className="w-full text-left rounded-xl bg-zinc-950/50 border border-zinc-800 hover:border-orange-500/60 p-3 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-sm text-zinc-100">
                    {SKILL_FIELD_LABEL[u.skill]}
                    {u.verified && <BadgeCheck size={13} className="text-emerald-400" aria-label={tx("verified")} />}
                    {u.isGoal && <span className="text-xs px-1.5 rounded bg-orange-500/15 text-orange-300">{tx("goal")}</span>}
                    <span className="ml-auto text-xs text-muted">{tx("~level {n}", { n: u.requiredLevel })}</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                    {tx(STAGE_LABEL[u.fromStage] ?? u.fromStage)} <ArrowRight size={11} />
                    <span className="text-orange-300">{tx(STAGE_LABEL[u.toStage] ?? u.toStage)}</span>
                  </div>
                  {u.fromStage !== "none" && <MasteryBar m={u.mastery} label={tx(MASTERY_LABEL[u.mastery])} />}
                  {u.unconfirmed && (
                    <div className="text-xs text-orange-300 mt-1.5">
                      {tx("Prove {stage} in a Skill Check first — it'll come up in a session soon.", { stage: tx(STAGE_LABEL[u.fromStage] ?? u.fromStage) })}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {SKILL_CATEGORIES.map((cat) => {
        const started = cat.skills.filter((s) => rec[s] !== "none");
        const untouched = cat.skills.filter((s) => rec[s] === "none");
        const showAll = showUntouched.has(cat.name);
        const visible = showAll ? cat.skills : started;
        return (
          <section key={cat.name}>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-xs uppercase tracking-wide text-emerald-400">{tx(cat.name)}</h3>
              <span className="text-xs text-muted">{tx("{a} of {b} started", { a: started.length, b: cat.skills.length })}</span>
            </div>
            <div className="space-y-1.5">
              {visible.map((skill) => (
                <SkillNode
                  key={skill}
                  skill={skill}
                  stage={rec[skill]}
                  mastery={(userDoc.skillMastery?.[skill] ?? DEFAULT_MASTERY) as SkillMastery}
                  verified={userDoc.claims?.[skill]?.status === "verified"}
                  playerLevel={playerLevel}
                  open={open === skill}
                  onToggle={() => setOpen(open === skill ? null : skill)}
                  onInfo={() => onInfo(skill)}
                  onTrain={() => router.push(`/wheel?skill=${skill}`)}
                />
              ))}
              {untouched.length > 0 && (
                <button
                  onClick={() => toggleUntouched(cat.name)}
                  className="w-full text-xs text-zinc-400 hover:text-zinc-200 py-2 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-600"
                >
                  {showAll ? tx("Hide not started") : tx("Show {n} not started", { n: untouched.length })}
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MasteryBar({ m, label }: { m: SkillMastery; label: string }) {
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-0.5 flex-1 max-w-[120px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= m ? "bg-emerald-500" : "bg-zinc-800"}`} />
        ))}
      </div>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

function SkillNode({
  skill,
  stage,
  mastery,
  verified,
  playerLevel,
  open,
  onToggle,
  onInfo,
  onTrain,
}: {
  skill: StagedSkillKey;
  stage: string;
  mastery: SkillMastery;
  verified: boolean;
  playerLevel: number;
  open: boolean;
  onToggle: () => void;
  onInfo: () => void;
  onTrain: () => void;
}) {
  const { tx } = useLanguage();
  const states = stageStates(skill, stage);
  const started = stage !== "none";

  return (
    <div id={`skill-${skill}`} className={`panel overflow-hidden ${open ? "border-zinc-600" : ""}`}>
      <button onClick={onToggle} aria-expanded={open} className="w-full text-left px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm truncate ${started ? "text-zinc-100" : "text-zinc-400"}`}>{SKILL_FIELD_LABEL[skill]}</span>
          {verified && <BadgeCheck size={13} className="text-emerald-400 shrink-0" aria-label={tx("verified")} />}
          <span className="ml-auto text-xs text-muted shrink-0">{tx(STAGE_LABEL[stage] ?? stage)}</span>
          <ChevronDown size={14} className={`text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
        {/* the chain: one pip per stage */}
        <div className="flex items-center gap-1 mt-2" aria-hidden>
          {states.map((s, i) => (
            <div key={s.stage} className="flex items-center flex-1 gap-1">
              <span
                className={`h-2 flex-1 rounded-full ${
                  s.state === "done"
                    ? "bg-emerald-500"
                    : s.state === "current"
                    ? "bg-orange-500"
                    : s.state === "next"
                    ? "bg-orange-500/25 ring-1 ring-orange-500/60"
                    : "bg-zinc-800"
                }`}
              />
              {i < states.length - 1 && <span className="w-0.5" />}
            </div>
          ))}
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-800 px-3 py-3 space-y-3">
          <ol className="relative pl-5 space-y-2.5">
            <span className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-zinc-800" aria-hidden />
            {states.map((s) => (
              <li key={s.stage} className="relative">
                <span
                  className={`absolute -left-5 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                    s.state === "done"
                      ? "bg-emerald-500"
                      : s.state === "current"
                      ? "bg-orange-500"
                      : s.state === "next"
                      ? "bg-zinc-900 border-2 border-orange-500"
                      : "bg-zinc-900 border border-zinc-700"
                  }`}
                >
                  {s.state === "done" && <Check size={10} className="text-zinc-950" />}
                  {s.state === "locked" && <Lock size={8} className="text-muted" />}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      s.state === "current" ? "text-zinc-100 font-medium" : s.state === "locked" ? "text-muted" : "text-zinc-300"
                    }`}
                  >
                    {tx(STAGE_LABEL[s.stage] ?? s.stage)}
                  </span>
                  {s.state === "current" && verified && <BadgeCheck size={13} className="text-emerald-400" />}
                  <span className={`ml-auto text-xs ${s.requiredLevel > playerLevel ? "text-muted" : "text-emerald-400/80"}`}>
                    {tx("~level {n}", { n: s.requiredLevel })}
                  </span>
                </div>
                {s.state === "current" && <MasteryBar m={mastery} label={tx(MASTERY_LABEL[mastery])} />}
                {s.state === "next" && <div className="text-xs text-orange-300/90 mt-0.5">{tx("Next to unlock")}</div>}
              </li>
            ))}
          </ol>
          <div className="flex gap-2">
            <button
              onClick={onInfo}
              className="flex-1 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300 hover:border-zinc-500 flex items-center justify-center gap-1.5"
            >
              <Info size={13} /> {tx("About this skill")}
            </button>
            <button
              onClick={onTrain}
              className="flex-1 py-2 rounded-xl bg-orange-500/15 text-orange-300 hover:bg-orange-500/25 text-xs flex items-center justify-center gap-1.5"
            >
              <Dices size={13} /> {tx("Train it on the wheel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
