"use client";

import { useEffect, useMemo, useState } from "react";
import { Hourglass, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchSessionsBetween } from "@/lib/store";
import { SKILL_FIELD_LABEL, type SessionRecord } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { PACE_WEEKS, etaLabel, skillTimeline } from "@/lib/skillTimeline";
import { Bone } from "./PageLoading";

// "Front Lever: Straddle in 3–5 weeks" — when the next stages should come,
// at the pace of the last few weeks (lib/skillTimeline.ts).
export default function SkillTimelineCard() {
  const { userDoc } = useAuth();
  const { tx } = useLanguage();
  const [sessions, setSessions] = useState<SessionRecord[] | null>(null);

  const uid = userDoc?.uid;
  useEffect(() => {
    if (!uid) return;
    let live = true;
    const now = Date.now();
    fetchSessionsBetween(uid, new Date(now - PACE_WEEKS * 7 * 86400000).toISOString(), new Date(now + 60000).toISOString())
      .then((s) => live && setSessions(s))
      .catch(() => live && setSessions([]));
    return () => {
      live = false;
    };
  }, [uid]);

  const rows = useMemo(() => (userDoc && sessions ? skillTimeline(userDoc, sessions).slice(0, 5) : null), [userDoc, sessions]);
  if (!userDoc) return null;
  const stage = (s: string) => tx(STAGE_LABEL[s] ?? s);
  const eta = (e: { low: number; high: number }) => {
    const l = etaLabel(e);
    return tx(l.key, l.vars);
  };

  return (
    <section className="panel p-4" aria-labelledby="timeline-title">
      <h2 id="timeline-title" className="heading text-base text-zinc-100 flex items-center gap-2">
        <Hourglass size={16} className="text-amber-300" /> {tx("Your skill timeline")}
      </h2>
      <p className="text-xs text-zinc-400 mt-0.5 mb-3">{tx("When your next stages should come, at the pace of your last six weeks.")}</p>
      {!rows ? (
        <div className="space-y-2" role="status" aria-label={tx("Loading…")}>
          {[0, 1, 2].map((i) => (
            <Bone key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-zinc-400">{tx("Train a skill for a couple of weeks and its timeline shows up here.")}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.skill} className="rounded-xl bg-zinc-950/40 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-zinc-100">{SKILL_FIELD_LABEL[r.skill]}</span>
                <span className="text-xs text-zinc-400">{tx("now: {s}", { s: stage(r.current) })}</span>
              </div>
              <ol className="mt-1 space-y-0.5">
                {r.next.map((n, i) => (
                  <li key={n.stage} className={`text-sm flex items-center gap-1.5 ${i === 0 ? "text-amber-200" : "text-zinc-400"}`}>
                    <ArrowRight size={12} aria-hidden="true" />
                    <span>{stage(n.stage)}</span>
                    <span className="text-zinc-400" aria-hidden="true">·</span>
                    <span>{eta(n)}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-zinc-400 mt-3">{tx("An estimate, not a promise: train a skill more often and it comes sooner.")}</p>
    </section>
  );
}
