"use client";

import Link from "next/link";
import { UserDoc } from "@/lib/types";
import { effectiveXpProgress } from "@/lib/levelPath";
import { claimCounts, syncClaims } from "@/lib/verification";
import { useLanguage } from "@/context/LanguageContext";
import { BadgeCheck, ChevronRight, Flame } from "lucide-react";

// The one headline: your level (and how far to the next), with verified
// skills as the proof beside it. Rank titles, mastery, missions and the
// rest live in their detail views.
export default function HeadlineCard({ userDoc }: { userDoc: UserDoc }) {
  const { tx } = useLanguage();
  const p = effectiveXpProgress(userDoc.xp, userDoc.skills, userDoc.skillMastery);
  const { verified, total } = claimCounts(syncClaims(userDoc.claims, userDoc.skills));

  return (
    <section className="panel p-4 relative overflow-hidden">
      <div className="absolute -top-20 -right-12 w-56 h-56 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="flex items-stretch gap-3 relative">
        <Link href="/skills?tab=road" className="flex-1 min-w-0 group">
          <div className="text-xs uppercase tracking-wide text-muted">{tx("Level")}</div>
          <div className="flex items-baseline gap-1">
            <span className="heading text-5xl text-zinc-100 stat-mono leading-none">{p.level}</span>
            <ChevronRight size={18} className="text-muted group-hover:text-orange-400 transition-colors" />
          </div>
          <div className="mt-3 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-600 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${p.pct}%` }} />
          </div>
          <div className="text-xs text-zinc-400 mt-1.5 stat-mono">
            {p.catchingUp
              ? tx("{p}% to match your skill level", { p: p.pct })
              : tx("{a} / {b} XP to level {n}", { a: p.into, b: p.span, n: p.level + 1 })}
          </div>
        </Link>
        <Link
          href="/skills?tab=proven"
          className="w-28 shrink-0 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-emerald-600/60 p-3 flex flex-col justify-between transition-colors"
        >
          <div className="text-xs uppercase tracking-wide text-muted flex items-center gap-1">
            <BadgeCheck size={12} className="text-emerald-400" /> {tx("Verified")}
          </div>
          <div className="stat-mono text-2xl text-zinc-100 leading-none">
            {verified}
            <span className="text-base text-muted">/{total || 0}</span>
          </div>
          <div className="text-xs text-zinc-400">{tx("skills proven")}</div>
        </Link>
      </div>
      {userDoc.streak > 0 && (
        <div className="relative mt-3 inline-flex items-center gap-1 text-xs text-orange-300 bg-orange-500/10 rounded-full px-2.5 py-1">
          <Flame size={12} /> {tx(userDoc.streak === 1 ? "1-day streak" : "{n}-day streak", { n: userDoc.streak })}
        </div>
      )}
    </section>
  );
}
