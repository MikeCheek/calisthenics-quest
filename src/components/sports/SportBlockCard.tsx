"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateProgress } from "@/lib/store";
import { SPORTS } from "@/lib/sports";
import { BLOCK_WEEKS, blockStatus, startBlock, stopBlock } from "@/lib/sports/extras";
import type { ExtraSport } from "@/lib/sports/types";

// A training block in yoga or Pilates: one skill's next stage, in 2–6 weeks.
// While it runs, sessions bring that skill's group up most often.
export default function SportBlockCard({ sport }: { sport: ExtraSport }) {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const def = SPORTS[sport];
  const track = userDoc?.sports?.[sport];
  const open = def.skills.filter((sk) => (track?.stage[sk.key] ?? 0) < sk.stages.length - 1);
  const [skill, setSkill] = useState(open[0]?.key ?? "");
  const [weeks, setWeeks] = useState<number>(4);
  if (!userDoc || !track) return null;
  const save = async (t: typeof track) => {
    await updateProgress(userDoc.uid, { sports: { ...userDoc.sports, [sport]: t } }).catch(() => {});
    await refreshUserDoc();
  };
  const status = blockStatus(track);
  const bsk = status ? def.skills.find((s) => s.key === status.block.skill) : undefined;

  return (
    <section className="panel p-4 space-y-3" aria-labelledby="sport-block">
      <h2 id="sport-block" className="heading text-base text-zinc-100 flex items-center gap-2">
        <Flag size={16} className="text-orange-400" aria-hidden /> {tx("Training block")}
      </h2>
      {status && bsk ? (
        <>
          <p className="text-sm text-zinc-100">{tx("{skill} → {stage}", { skill: bsk.name, stage: bsk.stages[status.block.target]?.label ?? "" })}</p>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden" role="progressbar" aria-label={tx("Training block")} aria-valuemin={0} aria-valuemax={status.weeks} aria-valuenow={status.week}>
            <div className="h-full bg-orange-500" style={{ width: `${(status.week / status.weeks) * 100}%` }} />
          </div>
          <p className="text-xs text-zinc-400">
            {status.overdue ? tx("Time's up — keep going, or stop the block.") : tx("Week {a} of {b} · {n} days left", { a: status.week, b: status.weeks, n: status.daysLeft })}
          </p>
          <button onClick={() => save(stopBlock(track))} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500">
            {tx("Stop block")}
          </button>
        </>
      ) : open.length ? (
        <>
          <p className="text-xs text-zinc-400">{tx("Aim for a skill's next stage in a few weeks: sessions lean on it meanwhile.")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="text-xs text-zinc-400">
              {tx("Skill")}
              <select value={skill} onChange={(e) => setSkill(e.target.value)} className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100">
                {open.map((sk) => (
                  <option key={sk.key} value={sk.key}>
                    {sk.name} → {sk.stages[Math.min((track.stage[sk.key] ?? 0) + 1, sk.stages.length - 1)].label}
                  </option>
                ))}
              </select>
            </label>
            <div className="text-xs text-zinc-400">
              {tx("Weeks")}
              <div className="mt-1 flex gap-1.5" role="group" aria-label={tx("Weeks")}>
                {BLOCK_WEEKS.map((w) => (
                  <button key={w} aria-pressed={weeks === w} onClick={() => setWeeks(w)} className={`px-3 py-2 rounded-lg text-xs border ${weeks === w ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-300"}`}>
                    {tx("{n} weeks", { n: w })}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => save(startBlock(def, track, skill, weeks))} disabled={!skill} className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium disabled:opacity-60">
            {tx("Start block")}
          </button>
        </>
      ) : null}
    </section>
  );
}
