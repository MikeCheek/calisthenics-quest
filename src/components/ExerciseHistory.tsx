"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchSessionsBetween } from "@/lib/store";
import { exerciseHistory, pctChange } from "@/lib/compare";
import { statKey } from "@/lib/adaptation";
import { formatHeld } from "@/lib/volumeTotals";
import type { SessionRecord } from "@/lib/types";
import { Bone } from "./PageLoading";

// "Your progress" in an exercise's sheet: the best set each time you did
// it over the last year, and your record. The year's sessions are loaded
// once and shared by every sheet opened.

let cached: { uid: string; at: number; sessions: Promise<SessionRecord[]> } | null = null;
function yearOfSessions(uid: string): Promise<SessionRecord[]> {
  if (cached && cached.uid === uid && Date.now() - cached.at < 5 * 60000) return cached.sessions;
  const now = Date.now();
  const sessions = fetchSessionsBetween(uid, new Date(now - 365 * 86400000).toISOString(), new Date(now + 60000).toISOString()).catch(() => []);
  cached = { uid, at: now, sessions };
  return sessions;
}

export default function ExerciseHistory({ name }: { name: string }) {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const [sessions, setSessions] = useState<SessionRecord[] | null>(null);
  const uid = userDoc?.uid;
  useEffect(() => {
    if (!uid) return;
    let live = true;
    yearOfSessions(uid).then((s) => live && setSessions(s));
    return () => {
      live = false;
    };
  }, [uid]);

  const points = useMemo(() => (sessions ? exerciseHistory(sessions, name) : null), [sessions, name]);
  if (!userDoc) return null;
  const record = userDoc.records?.[statKey(name)];
  const fmt = (v: number, kind: "reps" | "hold") => (kind === "hold" ? formatHeld(Math.round(v)) : tx("{n} reps", { n: v }));
  const day = (iso: string) => new Date(iso).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "short" });

  if (!points) {
    return (
      <div className="space-y-2" role="status" aria-label={tx("Loading…")}>
        <Bone className="h-4 w-32" />
        <Bone className="h-20 w-full" />
      </div>
    );
  }
  if (!points.length) return <p className="text-sm text-zinc-400">{tx("You haven't done this one in the last year — your progress will show here once you do.")}</p>;

  const kind = points[points.length - 1].kind;
  const first = points[0], last = points[points.length - 1];
  const change = points.length > 1 ? pctChange(first.best, last.best) : null;

  const W = 300, H = 90, P = 8;
  const max = Math.max(...points.map((p) => p.best)), min = Math.min(...points.map((p) => p.best));
  const t0 = new Date(first.date).getTime(), t1 = new Date(last.date).getTime();
  const x = (iso: string) => (points.length === 1 ? W / 2 : P + ((new Date(iso).getTime() - t0) / Math.max(1, t1 - t0)) * (W - 2 * P));
  const y = (v: number) => H - P - ((v - min) / Math.max(1, max - min)) * (H - 2 * P);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)} ${y(p.best).toFixed(1)}`).join(" ");

  return (
    <div>
      <p className="text-sm text-zinc-300 flex items-center gap-2 flex-wrap">
        <TrendingUp size={15} className="text-emerald-400" />
        {tx("Done {n} times · last {d}", { n: points.length, d: day(last.date) })}
        {change !== null && change !== 0 && <span className={change > 0 ? "text-emerald-300" : "text-red-300"}>· {change > 0 ? "+" : ""}{change}%</span>}
      </p>
      {points.length > 1 && (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-24 mt-2"
          role="img"
          aria-label={tx("Best set from {a} to {b}", { a: fmt(first.best, kind), b: fmt(last.best, kind) })}
        >
          <path d={path} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={x(p.date)} cy={y(p.best)} r="3" fill={p.estimated ? "#18181b" : "#34d399"} stroke="#34d399" strokeWidth="1.5" />
          ))}
        </svg>
      )}
      <dl className="grid grid-cols-3 gap-2 text-xs mt-1">
        <div>
          <dt className="text-zinc-400">{tx("Last best set")}</dt>
          <dd className="text-zinc-100">
            {last.estimated ? "≈" : ""}
            {fmt(last.best, kind)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-400">{tx("Typical set")}</dt>
          <dd className="text-zinc-100">{fmt(last.perSet, kind)}</dd>
        </div>
        <div>
          <dt className="text-zinc-400">{tx("Record")}</dt>
          <dd className="text-amber-300">{record?.hold ? fmt(record.hold, "hold") : record?.reps ? fmt(record.reps, "reps") : "—"}</dd>
        </div>
      </dl>
      {points.some((p) => p.estimated) && <p className="text-xs text-zinc-400 mt-1">{tx("Hollow dots come from the plan, not a logged set.")}</p>}
    </div>
  );
}
