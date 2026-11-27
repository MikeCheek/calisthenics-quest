"use client";

import CappedHeight from "@/components/CappedHeight";
import { Bone } from "@/components/PageLoading";
import { useEffect, useMemo, useState } from "react";
import { UserDoc, SessionRecord } from "@/lib/types";
import { fetchSessionsBetween } from "@/lib/store";
import { formatHeld, totalsByExercise } from "@/lib/volumeTotals";
import { useLanguage } from "@/context/LanguageContext";
import { Sigma } from "lucide-react";

type Period = "month" | "year" | "all";
const SHOWN = 8;

// "40 muscle-ups in November": reps (and time held) per exercise, added up
// from the recorded sessions (see lib/volumeTotals.ts for what counts).
export default function VolumeTotalsCard({ userDoc }: { userDoc: UserDoc }) {
  const { tx, locale } = useLanguage();
  const [period, setPeriod] = useState<Period>("month");
  const [cache, setCache] = useState<Partial<Record<Period, SessionRecord[]>>>({});
  const [showAll, setShowAll] = useState(false);
  const now = useMemo(() => new Date(), []);

  const range = useMemo(() => {
    const to = new Date(now.getTime() + 60_000).toISOString();
    if (period === "month") return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to };
    if (period === "year") return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to };
    return { from: "2000-01-01T00:00:00.000Z", to };
  }, [period, now]);

  // refetched after each logged session
  const done = userDoc.totalSessionsCompleted;
  useEffect(() => {
    let cancelled = false;
    fetchSessionsBetween(userDoc.uid, range.from, range.to)
      .then((s) => !cancelled && setCache((c) => ({ ...c, [period]: s })))
      .catch(() => !cancelled && setCache((c) => ({ ...c, [period]: [] })));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, userDoc.uid, done]);

  const sessions = cache[period];
  const totals = useMemo(() => (sessions ? totalsByExercise(sessions) : null), [sessions]);
  const loc = locale === "it" ? "it-IT" : "en-GB";
  const label =
    period === "month"
      ? now.toLocaleDateString(loc, { month: "long" })
      : period === "year"
      ? String(now.getFullYear())
      : "";
  // reps and holds ranked separately: a hold's seconds and a rep count don't compare
  const repRows = totals?.filter((t) => t.reps > 0) ?? [];
  const holdRows = (totals?.filter((t) => t.holdSec > 0) ?? []).sort((a, b) => b.holdSec - a.holdSec);
  const anyEstimated = totals?.some((t) => t.estimated);

  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="heading text-base text-zinc-100 flex items-center gap-2">
          <Sigma size={16} className="text-orange-400" /> {tx("Your totals")}
        </h2>
        <div className="flex p-0.5 rounded-lg bg-zinc-800/60 gap-0.5" role="tablist" aria-label={tx("Period")}>
          {(
            [
              ["month", tx("Month")],
              ["year", tx("Year")],
              ["all", tx("All time")],
            ] as const
          ).map(([id, text]) => (
            <button
              key={id}
              role="tab"
              aria-selected={period === id}
              onClick={() => {
                setPeriod(id);
                setShowAll(false);
              }}
              className={`px-2.5 py-1 rounded-md text-xs ${period === id ? "bg-zinc-950 text-zinc-100" : "text-zinc-400"}`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {totals === null ? (
        <div className="space-y-2 py-1" role="status" aria-label={tx("Loading…")}>
            {[0, 1, 2, 3].map((i) => (
              <Bone key={i} className="h-9 w-full" />
            ))}
          </div>
      ) : totals.length === 0 ? (
        <p className="text-sm text-zinc-400">{tx("Nothing counted yet — finish a session and it adds up here.")}</p>
      ) : (
        <>
          <p className="text-sm text-zinc-300 mb-3">
            {period === "month"
              ? tx("{n} exercises in {p}, across {s} sessions.", { n: totals.length, p: label, s: sessions?.length ?? 0 })
              : period === "year"
              ? tx("{n} exercises in {y}, across {s} sessions.", { n: totals.length, y: label, s: sessions?.length ?? 0 })
              : tx("{n} exercises so far, across {s} sessions.", { n: totals.length, s: sessions?.length ?? 0 })}
          </p>
          {/* reps and time side by side on a wide screen (the card spans the page there) */}
          <CappedHeight label={tx("Your totals")}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-4">
          {(
            [
              ["reps", tx("Reps"), repRows],
              ["holds", tx("Time"), holdRows],
            ] as const
          ).map(([id, heading, rows]) =>
            rows.length === 0 ? null : (
              <div key={id} className="mb-3">
                <h3 className="text-xs uppercase tracking-wide text-muted mb-1.5 px-1">{heading}</h3>
                <ol className="space-y-1.5">
                  {(showAll ? rows : rows.slice(0, SHOWN)).map((t, i) => (
                    <li key={t.key} className="flex items-center gap-3 rounded-xl px-3 py-2 bg-zinc-950/40">
                      <span className="stat-mono text-xs text-muted w-5 text-right shrink-0">{i + 1}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-zinc-100 truncate">{t.name}</span>
                        <span className="block text-xs text-muted">
                          {t.sessions === 1 ? tx("1 session") : tx("{n} sessions", { n: t.sessions })}
                        </span>
                      </span>
                      <span className="text-right shrink-0">
                        <span className="stat-mono text-base text-orange-300">
                          {t.estimated ? "≈" : ""}
                          {id === "reps" ? t.reps.toLocaleString(loc) : formatHeld(t.holdSec)}
                        </span>
                        {id === "reps" && <span className="block text-xs text-muted leading-none">{tx("reps")}</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )
          )}
          </div>
          </CappedHeight>
          {(repRows.length > SHOWN || holdRows.length > SHOWN) && (
            <button onClick={() => setShowAll((v) => !v)} className="text-xs text-zinc-400 hover:text-orange-400">
              {showAll ? tx("Show less") : tx("Show all {n}", { n: totals.length })}
            </button>
          )}
          {anyEstimated && (
            <p className="text-xs text-muted mt-2">
              {tx("≈ includes sets you marked done without logging reps, counted as prescribed (low end of the range). Max sets and attempts only count when logged.")}
            </p>
          )}
        </>
      )}
    </section>
  );
}
