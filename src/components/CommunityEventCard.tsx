"use client";

import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTuning } from "@/hooks/useTuning";
import { fetchEventTotals, fetchSessionsBetween, setEventContribution } from "@/lib/store";
import { contribution, currentEvent, daysLeftInMonth, monthRange, progress, MAX_CONTRIBUTION } from "@/lib/events";
import { formatHeld } from "@/lib/volumeTotals";

// This month's community event: everyone's total toward one goal, and your
// own part. Your part is recounted from your sessions each time the card
// shows, and saved only when it changed.
const savedKey = (key: string) => `barquests:event:${key}`;

export default function CommunityEventCard() {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const { featureEvents, eventGoalScale } = useTuning();
  const event = useMemo(() => currentEvent(new Date(), eventGoalScale), [eventGoalScale]);
  const [mine, setMine] = useState<number | null>(null);
  const [community, setCommunity] = useState<{ total: number; players: number } | null>(null);

  useEffect(() => {
    if (!userDoc || !featureEvents) return;
    let live = true;
    (async () => {
      const { from, to } = monthRange();
      const sessions = await fetchSessionsBetween(userDoc.uid, from.toISOString(), to.toISOString()).catch(() => []);
      const value = Math.min(MAX_CONTRIBUTION, contribution(event, sessions));
      if (!live) return;
      setMine(value);
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(savedKey(event.key));
      } catch {
        /* storage blocked */
      }
      // nothing to say until you've trained; after a reset, back to 0
      if ((value > 0 || saved !== null) && saved !== String(value)) {
        await setEventContribution(event.key, userDoc.uid, value)
          .then(() => {
            try {
              localStorage.setItem(savedKey(event.key), String(value));
            } catch {
              /* not important */
            }
          })
          .catch(() => {});
      }
      const totals = await fetchEventTotals(event.key).catch(() => null);
      if (live) setCommunity(totals);
    })();
    return () => {
      live = false;
    };
  }, [userDoc, featureEvents, event]);

  if (!userDoc || !featureEvents) return null;

  const fmt = (n: number) =>
    event.unit === "seconds"
      ? formatHeld(n)
      : tx(event.unit === "reps" ? "{n} reps" : event.unit === "sessions" ? "{n} sessions" : "{n} min", { n: n.toLocaleString(locale === "it" ? "it-IT" : "en-GB") });
  const month = new Date().toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { month: "long" });
  const total = community?.total ?? 0;
  const reached = total >= event.communityGoal;
  const days = daysLeftInMonth();

  return (
    <section className="panel p-4" aria-labelledby="event-title">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <p className="text-xs uppercase tracking-wide text-sky-300">{tx("{month} community event", { month })}</p>
          <h2 id="event-title" className="heading text-lg text-zinc-100">
            <span aria-hidden="true">{event.emoji} </span>
            {tx(event.title)}
          </h2>
        </div>
        <span className="text-xs text-muted shrink-0 mt-1">{days === 0 ? tx("Last day") : tx("{n} days left", { n: days })}</span>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{tx(event.blurb)}</p>

      <div className="flex items-baseline justify-between text-sm mb-1">
        <span className="text-zinc-200">{tx("Everyone together")}</span>
        <span className="stat-mono text-zinc-300">
          {community ? fmt(total) : "…"} <span className="text-muted">/ {fmt(event.communityGoal)}</span>
        </span>
      </div>
      <div
        className="h-3 rounded-full bg-zinc-800 overflow-hidden"
        role="progressbar"
        aria-label={tx("Everyone together")}
        aria-valuemin={0}
        aria-valuemax={event.communityGoal}
        aria-valuenow={Math.min(total, event.communityGoal)}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all" style={{ width: `${progress(total, event.communityGoal) * 100}%` }} />
      </div>
      <p className="text-xs text-muted mt-1.5 flex items-center gap-1">
        <Users size={12} />
        {community ? (reached ? tx("Goal reached — {n} athletes did it together!", { n: community.players }) : tx("{n} athletes taking part", { n: community.players })) : tx("Loading…")}
      </p>

      <div className="flex items-baseline justify-between text-sm mt-3 mb-1">
        <span className="text-zinc-200">{tx("Your part")}</span>
        <span className="stat-mono text-orange-400">
          {mine === null ? "…" : fmt(mine)} <span className="text-muted">/ {fmt(event.personalGoal)}</span>
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-zinc-800 overflow-hidden"
        role="progressbar"
        aria-label={tx("Your part")}
        aria-valuemin={0}
        aria-valuemax={event.personalGoal}
        aria-valuenow={Math.min(mine ?? 0, event.personalGoal)}
      >
        <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${progress(mine ?? 0, event.personalGoal) * 100}%` }} />
      </div>
      {mine === 0 && <p className="text-xs text-muted mt-1.5">{tx("Your sessions this month count automatically.")}</p>}
    </section>
  );
}
