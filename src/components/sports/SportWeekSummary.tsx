"use client";

import { useLanguage } from "@/context/LanguageContext";
import { SPORT_META, enrolledSports } from "@/lib/sports";
import { sessionsBySport } from "@/lib/sports/trackView";
import type { SessionRecord, UserDoc } from "@/lib/types";

// This week across the sports you follow: one line, under the week strip.
// Only for people following more than one sport.
export default function SportWeekSummary({ userDoc, weekSessions }: { userDoc: UserDoc; weekSessions: SessionRecord[] }) {
  const { tx } = useLanguage();
  const sports = enrolledSports(userDoc);
  if (sports.length < 2) return null;
  const rows = sessionsBySport(weekSessions, sports);
  return (
    <p className="text-sm text-zinc-300 flex flex-wrap items-center gap-x-3 gap-y-1" aria-label={tx("This week, by sport")}>
      <span className="text-xs uppercase tracking-wide text-zinc-400">{tx("This week")}</span>
      {rows.map(({ sport, count }) => (
        <span key={sport} className={count ? "text-zinc-100" : "text-zinc-400"}>
          <span aria-hidden="true">{SPORT_META[sport].emoji}</span> {tx(SPORT_META[sport].name)} <span className="stat-mono">{count}</span>
        </span>
      ))}
    </p>
  );
}
