"use client";

import { useEffect, useMemo, useState } from "react";
import { Target, Play, Check, CalendarPlus, X, Minus, Plus } from "lucide-react";
import Modal from "./Modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { fetchSessionsBetween, updateProgress } from "@/lib/store";
import { SKILL_FIELD_LABEL, type SessionRecord, type SkillMastery, type StagedSkillKey } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { skillHistoryPatch } from "@/lib/skillHistory";
import { buildCustomSession } from "@/lib/customSession";
import {
  MAX_WEEKS,
  MIN_WEEKS,
  blockOutline,
  blockSkillsFor,
  blockWeek,
  newBlock,
  phaseOf,
  reached,
  suggestWeeks,
  targetsFor,
  testExercise,
  type FinishedBlock,
  type Phase,
  type TrainingBlock,
} from "@/lib/trainingBlock";

// A training block: a few weeks aimed at one stage (lib/trainingBlock.ts).
// On Today while one runs; on Skills, also the way to start one.

const PHASE_STYLE: Record<Phase, string> = { build: "bg-orange-500", deload: "bg-sky-400", test: "bg-yellow-400" };
const PHASE_LABEL: Record<Phase, string> = { build: "Build", deload: "Deload", test: "Test" };

export default function TrainingBlockCard({ invite = false }: { invite?: boolean }) {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const toast = useToast();
  const { startSession } = useTrainingSession();
  const [setup, setSetup] = useState(false);
  if (!userDoc) return null;
  const block = userDoc.trainingBlock ?? null;

  if (!block) {
    if (!invite) return null;
    return (
      <section className="panel p-4" aria-labelledby="block-invite-title">
        <h2 id="block-invite-title" className="heading text-base text-zinc-100 flex items-center gap-2">
          <Target size={16} className="text-orange-400" /> {tx("Training blocks")}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">{tx("Aim for a stage in a few weeks: sessions lean on that skill, with a lighter deload week and a test at the end.")}</p>
        <button onClick={() => setSetup(true)} className="w-full mt-3 h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold">
          {tx("Start a block")}
        </button>
        <BlockSetup open={setup} onClose={() => setSetup(false)} />
      </section>
    );
  }

  const skillName = SKILL_FIELD_LABEL[block.skill];
  const stage = (s: string) => tx(STAGE_LABEL[s] ?? s);
  const week = Math.min(blockWeek(block), block.weeks + 1);
  const done = reached(block, userDoc.skills);
  const phase: Phase = week > block.weeks ? "test" : phaseOf(block, week);

  const finish = async (outcome: FinishedBlock["outcome"]) => {
    const past = [{ ...block, endedAt: new Date().toISOString(), outcome }, ...(userDoc.pastBlocks ?? [])].slice(0, 10);
    await updateProgress(userDoc.uid, { trainingBlock: null, pastBlocks: past });
    await refreshUserDoc();
  };

  const moveUp = async () => {
    const skills = { ...userDoc.skills, [block.skill]: block.targetStage } as typeof userDoc.skills;
    await updateProgress(userDoc.uid, {
      skills,
      skillMastery: { ...(userDoc.skillMastery ?? {}), [block.skill]: 2 as SkillMastery },
      skillProgress: { ...(userDoc.skillProgress ?? {}), [block.skill]: { score: 0 } },
      ...skillHistoryPatch(userDoc, skills),
    });
    await finish("reached");
    toast.success(tx("{skill}: {stage} — block complete!", { skill: skillName, stage: stage(block.targetStage) }));
  };

  const extend = async () => {
    await updateProgress(userDoc.uid, { trainingBlock: { ...block, weeks: Math.min(MAX_WEEKS + 4, block.weeks + 2) } });
    await refreshUserDoc();
    toast.info(tx("Two more weeks added — keep at it."));
  };

  const takeTest = () => {
    const name = testExercise(block);
    if (!name) return;
    const s = buildCustomSession(tx("Test: {skill} {stage}", { skill: skillName, stage: stage(block.targetStage) }), [{ name, sets: 3 }], {
      warmup: true,
      equipment: userDoc.equipment,
    });
    if (s) startSession(s);
  };

  const end = async () => {
    if (!window.confirm(tx("End this block? Sessions go back to the normal rotation."))) return;
    await finish("stopped");
  };

  const PHASE_TEXT: Record<Phase, string> = {
    build: tx("Build week — most sessions focus on {skill}.", { skill: skillName }),
    deload: tx("Deload week — fewer sets on purpose, so you come back stronger."),
    test: tx("Test week — try {stage} once you're warm.", { stage: stage(block.targetStage) }),
  };

  return (
    <section className="panel p-4 border-orange-500/40" aria-labelledby="block-title">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-orange-300">{tx("Training block")}</p>
          <h2 id="block-title" className="heading text-lg text-zinc-100">
            {skillName}: {stage(block.fromStage)} → {stage(block.targetStage)}
          </h2>
        </div>
        <button onClick={end} className="p-2 -m-1 text-zinc-400 hover:text-zinc-100" aria-label={tx("End block")}>
          <X size={18} />
        </button>
      </div>
      <p className="text-sm text-zinc-300 mt-1">{done ? tx("Goal reached — nice work!") : tx("Week {w} of {n}", { w: Math.min(week, block.weeks), n: block.weeks })}</p>
      <ol className="flex gap-1 mt-2" aria-label={tx("Weeks")}>
        {blockOutline(block.weeks).map((p, i) => (
          <li
            key={i}
            className={`h-2 flex-1 rounded-full ${i + 1 < week ? PHASE_STYLE[p] : i + 1 === week ? `${PHASE_STYLE[p]} ring-2 ring-white/70` : "bg-zinc-800"}`}
            title={`${tx("Week {w}", { w: i + 1 })}: ${tx(PHASE_LABEL[p])}`}
          />
        ))}
      </ol>
      {!done && <p className="text-sm text-zinc-400 mt-2">{PHASE_TEXT[phase]}</p>}

      {done ? (
        <button onClick={() => finish("reached")} className="w-full mt-3 h-12 rounded-xl bg-emerald-500 text-zinc-950 font-semibold flex items-center justify-center gap-2">
          <Check size={18} /> {tx("Finish the block")}
        </button>
      ) : phase === "test" ? (
        <div className="space-y-2 mt-3">
          <button onClick={takeTest} className="w-full h-12 rounded-xl bg-yellow-400 text-zinc-950 font-semibold flex items-center justify-center gap-2">
            <Play size={18} /> {tx("Take the test")}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={moveUp} className="h-11 rounded-xl border border-emerald-500/60 text-emerald-200 text-sm flex items-center justify-center gap-1.5">
              <Check size={16} /> {tx("I did it — move me up")}
            </button>
            <button onClick={extend} className="h-11 rounded-xl border border-zinc-600 text-zinc-200 text-sm flex items-center justify-center gap-1.5">
              <CalendarPlus size={16} /> {tx("Not yet — 2 more weeks")}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

// Starting a block: the skill, the stage to aim for, how long
function BlockSetup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const toast = useToast();
  const [skill, setSkill] = useState<StagedSkillKey | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [weeks, setWeeks] = useState(6);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  const uid = userDoc?.uid;
  useEffect(() => {
    if (!open || !uid) return;
    const now = Date.now();
    fetchSessionsBetween(uid, new Date(now - 42 * 86400000).toISOString(), new Date(now + 60000).toISOString())
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [open, uid]);

  const skills = useMemo(() => (userDoc ? blockSkillsFor(userDoc.equipment) : []), [userDoc]);
  const current = skill && userDoc ? ((userDoc.skills as unknown as Record<string, string>)[skill] ?? "none") : "none";
  const targets = skill ? targetsFor(skill, current) : [];

  useEffect(() => {
    if (skill && target && userDoc) setWeeks(suggestWeeks(userDoc, sessions, skill, target));
  }, [skill, target, userDoc, sessions]);

  if (!userDoc) return null;
  const stage = (s: string) => tx(STAGE_LABEL[s] ?? s);
  const chip = (on: boolean) => `text-sm px-3 py-2 rounded-xl border ${on ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-200"}`;

  const start = async () => {
    if (!skill || !target) return;
    await updateProgress(userDoc.uid, { trainingBlock: newBlock(skill, current, target, weeks) });
    await refreshUserDoc();
    toast.success(tx("Block started — Today will lean on {skill}.", { skill: SKILL_FIELD_LABEL[skill] }));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={tx("Start a training block")}>
      <div className="space-y-4">
        <fieldset>
          <legend className="text-sm text-zinc-300 mb-2">{tx("Skill")}</legend>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <button key={s} onClick={() => { setSkill(s); setTarget(null); }} aria-pressed={skill === s} className={chip(skill === s)}>
                {SKILL_FIELD_LABEL[s]}
              </button>
            ))}
          </div>
        </fieldset>
        {skill && (
          <fieldset>
            <legend className="text-sm text-zinc-300 mb-2">{tx("Aim for (now: {s})", { s: stage(current) })}</legend>
            {targets.length ? (
              <div className="flex flex-wrap gap-1.5">
                {targets.map((t) => (
                  <button key={t} onClick={() => setTarget(t)} aria-pressed={target === t} className={chip(target === t)}>
                    {stage(t)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">{tx("You're at the last stage of this skill already.")}</p>
            )}
          </fieldset>
        )}
        {skill && target && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{tx("Length")}</span>
              <span className="flex items-center gap-2">
                <button onClick={() => setWeeks((w) => Math.max(MIN_WEEKS, w - 1))} className="w-11 h-11 rounded-xl border border-zinc-600 flex items-center justify-center" aria-label={tx("Fewer weeks")}>
                  <Minus size={16} />
                </button>
                <span className="stat-mono w-20 text-center text-zinc-100" aria-live="polite">
                  {tx("{n} weeks", { n: weeks })}
                </span>
                <button onClick={() => setWeeks((w) => Math.min(MAX_WEEKS, w + 1))} className="w-11 h-11 rounded-xl border border-zinc-600 flex items-center justify-center" aria-label={tx("More weeks")}>
                  <Plus size={16} />
                </button>
              </span>
            </div>
            <p className="text-xs text-zinc-400">{tx("Suggested from your recent pace — change it if you like.")}</p>
            <ol className="flex gap-1" aria-label={tx("Weeks")}>
              {blockOutline(weeks).map((p, i) => (
                <li key={i} className={`h-8 flex-1 rounded-md ${PHASE_STYLE[p]} flex items-end justify-center text-[0.65rem] font-bold text-zinc-950 pb-0.5`} title={tx(PHASE_LABEL[p])}>
                  {i + 1}
                </li>
              ))}
            </ol>
            <p className="text-xs text-zinc-400 flex gap-3 flex-wrap">
              {(["build", "deload", "test"] as Phase[]).map((p) => (
                <span key={p} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-sm ${PHASE_STYLE[p]}`} aria-hidden="true" /> {tx(PHASE_LABEL[p])}
                </span>
              ))}
            </p>
            <button onClick={start} className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold">
              {tx("Start the block")}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

export type { TrainingBlock };
