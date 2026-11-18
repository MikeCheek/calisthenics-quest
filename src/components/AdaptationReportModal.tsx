"use client";

import { useState } from "react";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { describeSuggestion } from "@/lib/adaptation";
import { MASTERY_LABEL, SKILL_FIELD_LABEL } from "@/lib/types";
import Modal from "@/components/Modal";
import { TrendingUp, TrendingDown, Brain, BadgeCheck, HelpCircle, Ban, Trophy, Share2 } from "lucide-react";
import ShareSheet from "@/components/ShareSheet";
import type { ShareCard } from "@/lib/shareCards";
import { useAuth } from "@/context/AuthContext";
import { BASELINE_KEYS } from "@/lib/verification";
import type { ClaimKey, StagedSkillKey } from "@/lib/types";

const isStaged = (k: ClaimKey): k is StagedSkillKey => !(BASELINE_KEYS as string[]).includes(k);
import { useLanguage } from "@/context/LanguageContext";
import SaveProgressPrompt from "@/components/SaveProgressPrompt";

// Shown after a session when what the athlete did actually changed
// something: a skill's mastery moved, or the engine thinks a stage change
// is due. Stage changes need an explicit yes; "not now" snoozes for a week.
export default function AdaptationReportModal() {
  const { report, clearReport, resolveSuggestion } = useTrainingSession();
  const [busy, setBusy] = useState<string | null>(null);
  const [shareCard, setShareCard] = useState<ShareCard | null>(null);
  const { userDoc } = useAuth();
  const { tx } = useLanguage();
  if (!report) return null;
  const hasCoachNews =
    report.masteryChanges.length + report.suggestions.length + report.verifications.length + report.records.length > 0;

  const resolve = async (i: number, accept: boolean) => {
    const s = report.suggestions[i];
    setBusy(s.skill);
    await resolveSuggestion(s, accept);
    setBusy(null);
  };

  return (
    <>
    <Modal open onClose={clearReport} title={tx(hasCoachNews ? "Coach update" : "Session logged")}>
      <div className="space-y-4">
        {report.sessionRecord && (
          <button
            onClick={() => setShareCard({ kind: "session", record: report.sessionRecord! })}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium flex items-center justify-center gap-2"
          >
            <Share2 size={16} /> {tx("Share your session")}
          </button>
        )}
        {hasCoachNews && (
          <p className="text-xs text-zinc-400 flex items-start gap-2">
            <Brain size={14} className="text-orange-400 shrink-0 mt-0.5" />
            {tx("Based on what you completed, skipped and marked too hard, your plan has adjusted. Next sessions will reflect this automatically.")}
          </p>
        )}

        {report.records.length > 0 && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-3">
            <div className="text-xs uppercase tracking-wide text-amber-300 mb-1.5 flex items-center gap-1.5">
              <Trophy size={13} /> {tx("New personal records")}
            </div>
            <ul className="space-y-1">
              {report.records.map((r) => (
                <li key={r.name + r.kind} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-zinc-100 truncate">{r.name}</span>
                  <span className="stat-mono text-amber-300 shrink-0 ml-auto">
                    {r.kind === "hold" ? `${r.previous}s → ${r.value}s` : tx("{a} → {b} reps", { a: r.previous, b: r.value })}
                  </span>
                  <ShareIcon label={tx("Share this record")} onClick={() => setShareCard({ kind: "record", record: r, dateISO: new Date().toISOString() })} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.verifications.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-sky-400 mb-1.5">{tx("Skill check")}</div>
            <ul className="space-y-1.5">
              {report.verifications.map((v) => (
                <li key={v.key + v.outcome} className="flex items-start gap-2 text-sm text-zinc-200">
                  {v.outcome === "verified" || v.outcome === "raised" ? (
                    <BadgeCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : v.outcome === "ignored" ? (
                    <Ban size={15} className="text-muted shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle size={15} className="text-orange-400 shrink-0 mt-0.5" />
                  )}
                  <span className="flex-1">{tx(v.text)}</span>
                  {(v.outcome === "verified" || v.outcome === "raised") && v.label && (
                    <ShareIcon
                      label={tx("Share this verification")}
                      onClick={() =>
                        setShareCard({
                          kind: "verified",
                          label: v.label!,
                          result: v.result,
                          videoKey: v.videoKey,
                          dateISO: new Date().toISOString(),
                          ...(isStaged(v.key) ? { skill: v.key, stage: String(userDoc?.skills?.[v.key] ?? "") } : {}),
                        })
                      }
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.masteryChanges.length > 0 && (
          <ul className="space-y-1.5">
            {report.masteryChanges.map((c) => {
              const up = c.to > c.from;
              return (
                <li key={c.skill} className="flex items-center gap-2 text-sm">
                  {up ? (
                    <TrendingUp size={15} className="text-emerald-400" />
                  ) : (
                    <TrendingDown size={15} className="text-orange-400" />
                  )}
                  <span className="text-zinc-100">{SKILL_FIELD_LABEL[c.skill]}</span>
                  <span className="text-muted text-xs ml-auto">
                    {tx(MASTERY_LABEL[c.from])} → <span className={up ? "text-emerald-400" : "text-orange-400"}>{tx(MASTERY_LABEL[c.to])}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {report.suggestions.map((s, i) => (
          <div key={s.skill} className="panel p-3 border-orange-500/40 space-y-2.5">
            <div className="text-sm text-zinc-200">{tx(describeSuggestion(s))}</div>
            <div className="flex gap-2">
              <button
                disabled={busy !== null}
                onClick={() => resolve(i, false)}
                className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:text-zinc-200 disabled:opacity-50"
              >
                {tx("Not now")}
              </button>
              <button
                disabled={busy !== null}
                onClick={() => resolve(i, true)}
                className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-medium disabled:opacity-50"
              >
                {busy === s.skill ? tx("Saving...") : s.direction === "up" ? tx("Level it up") : tx("Step back")}
              </button>
            </div>
          </div>
        ))}

        {report.ignoredTimingSamples > 0 && (
          <p className="text-xs text-muted">
            {tx("{n} timer readings were left out as unreliable (app in the background, long interruptions or tapped-through sets).", { n: report.ignoredTimingSamples })}
          </p>
        )}

        <SaveProgressPrompt compact reason="Nice session! Save it with Google so your progress isn't tied to this device." />

        <button
          onClick={clearReport}
          className="w-full py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500"
        >
          {tx("Got it")}
        </button>
      </div>
    </Modal>
    <ShareSheet card={shareCard} onClose={() => setShareCard(null)} />
    </>
  );
}

function ShareIcon({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="p-1 -m-1 text-muted hover:text-orange-400 shrink-0">
      <Share2 size={14} />
    </button>
  );
}

