"use client";

import { useEffect, useMemo, useState } from "react";
import { UserDoc, SessionRecord, ExerciseRecord } from "@/lib/types";
import { fetchSessionsBetween } from "@/lib/store";
import { formatSets } from "@/lib/timingLearning";
import { useLanguage } from "@/context/LanguageContext";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  Trophy,
  Check,
  SkipForward,
  ArrowDownCircle,
  ChevronDown,
  Loader2,
  CalendarDays,
} from "lucide-react";

// Monday-first calendar for the visible month, plus that month's sessions
// and the athlete's personal bests.
function monthStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function SessionHistory({ userDoc }: { userDoc: UserDoc }) {
  const { tx, locale } = useLanguage();
  const [month, setMonth] = useState(() => monthStart(new Date()));
  const [sessions, setSessions] = useState<SessionRecord[] | null>(null);
  const [error, setError] = useState(false);
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSessions(null);
    setError(false);
    setDayFilter(null);
    const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    fetchSessionsBetween(userDoc.uid, month.toISOString(), next.toISOString())
      .then((s) => !cancelled && setSessions(s))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [month, userDoc.uid]);

  const byDay = useMemo(() => {
    const m = new Map<string, SessionRecord[]>();
    for (const s of sessions ?? []) {
      const k = dayKey(new Date(s.finishedAt));
      m.set(k, [...(m.get(k) ?? []), s]);
    }
    return m;
  }, [sessions]);

  const fmtLocale = locale === "it" ? "it-IT" : "en-GB";
  const today = new Date();
  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const lead = (month.getDay() + 6) % 7; // Monday-first offset
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(fmtLocale, { weekday: "narrow" })
  );

  const shown = dayFilter ? byDay.get(dayFilter) ?? [] : sessions ?? [];
  const totalMin = (sessions ?? []).reduce((n, s) => n + (s.durationMin ?? 0), 0);
  const totalXp = (sessions ?? []).reduce((n, s) => n + (s.xp ?? 0), 0);
  const bests = Object.values(userDoc.records ?? {})
    .filter((r) => r.name)
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800"
            aria-label={tx("Previous month")}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="heading text-base text-zinc-100 capitalize">
            {month.toLocaleDateString(fmtLocale, { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
            aria-label={tx("Next month")}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {weekdays.map((w, i) => (
            <div key={i} className="text-[11px] text-zinc-500 pb-1 uppercase">
              {w}
            </div>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <div key={`b${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = new Date(month.getFullYear(), month.getMonth(), i + 1);
            const k = dayKey(d);
            const count = byDay.get(k)?.length ?? 0;
            const isToday = isCurrentMonth && d.getDate() === today.getDate();
            const selected = dayFilter === k;
            return (
              <button
                key={k}
                disabled={count === 0}
                onClick={() => setDayFilter(selected ? null : k)}
                className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  selected
                    ? "bg-orange-500 text-zinc-950 font-semibold"
                    : count > 0
                    ? "bg-orange-500/15 text-orange-200 hover:bg-orange-500/25"
                    : "text-zinc-500"
                } ${isToday && !selected ? "ring-1 ring-zinc-500" : ""}`}
                aria-label={count ? tx("{n} sessions on this day", { n: count }) : undefined}
              >
                {i + 1}
                {count > 0 && <span className={`w-1 h-1 rounded-full ${selected ? "bg-zinc-950" : "bg-orange-400"}`} />}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Summary icon={<CalendarDays size={13} className="text-orange-400" />} value={sessions?.length ?? "–"} label={tx("sessions")} />
          <Summary icon={<Clock size={13} className="text-sky-400" />} value={totalMin ? `${totalMin}′` : "–"} label={tx("trained")} />
          <Summary icon={<Zap size={13} className="text-amber-400" />} value={totalXp || "–"} label="XP" />
        </div>
      </div>

      <div className="space-y-2">
        {sessions === null && !error && (
          <div className="panel p-6 flex justify-center text-zinc-500">
            <Loader2 size={18} className="animate-spin" />
          </div>
        )}
        {error && (
          <div className="panel p-4 text-sm text-zinc-400">{tx("Couldn't load your history — check your connection and try again.")}</div>
        )}
        {sessions && shown.length === 0 && (
          <div className="panel p-4 text-sm text-zinc-400">
            {tx("No sessions logged this month yet. Every session you finish shows up here, with your sets and records.")}
          </div>
        )}
        {shown.map((s) => (
          <SessionCard
            key={s.id ?? s.finishedAt}
            session={s}
            open={openId === (s.id ?? s.finishedAt)}
            onToggle={() => setOpenId(openId === (s.id ?? s.finishedAt) ? null : s.id ?? s.finishedAt)}
            fmtLocale={fmtLocale}
          />
        ))}
      </div>

      {bests.length > 0 && (
        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" /> {tx("Personal bests")}
          </div>
          <ul className="space-y-1.5">
            {bests.map((b) => (
              <li key={b.name} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-zinc-200 truncate">{b.name}</span>
                <span className="text-xs text-zinc-500 shrink-0">
                  <span className="stat-mono text-amber-300">
                    {[b.reps ? tx("{n} reps", { n: b.reps }) : null, b.hold ? `${b.hold}s` : null].filter(Boolean).join(" · ")}
                  </span>{" "}
                  · {new Date(b.dateISO).toLocaleDateString(fmtLocale, { day: "numeric", month: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Summary({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 py-2 text-center">
      <div className="flex items-center justify-center gap-1 stat-mono text-sm text-zinc-100">
        {icon}
        {value}
      </div>
      <div className="text-[11px] text-zinc-500">{label}</div>
    </div>
  );
}

function SessionCard({
  session,
  open,
  onToggle,
  fmtLocale,
}: {
  session: SessionRecord;
  open: boolean;
  onToggle: () => void;
  fmtLocale: string;
}) {
  const { tx } = useLanguage();
  const main = session.exercises.filter((e) => e.setTitle !== "Warm-Up" && e.setTitle !== "Final Hits");
  const done = main.filter((e) => e.outcome === "done").length;
  const skipped = main.filter((e) => e.outcome === "skipped").length;
  const hard = main.filter((e) => e.outcome === "tooHard").length;
  const when = new Date(session.finishedAt);

  return (
    <div className="panel overflow-hidden">
      <button onClick={onToggle} className="w-full p-3.5 text-left flex items-center gap-3" aria-expanded={open}>
        <div className="w-11 shrink-0 text-center">
          <div className="text-[11px] uppercase text-zinc-500">{when.toLocaleDateString(fmtLocale, { weekday: "short" })}</div>
          <div className="heading text-lg text-zinc-100 leading-none">{when.getDate()}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-zinc-100 truncate flex items-center gap-1.5">
            {tx(session.focusLabel)}
            {session.paired && <span className="text-[10px] px-1.5 rounded bg-sky-500/15 text-sky-300">{tx("paired")}</span>}
            {session.records?.length ? <Trophy size={12} className="text-amber-400" /> : null}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2.5 mt-0.5">
            {session.durationMin ? (
              <span className="flex items-center gap-1">
                <Clock size={11} /> {session.durationMin}′
              </span>
            ) : null}
            <span className="flex items-center gap-1 text-emerald-400/90">
              <Check size={11} /> {done}
            </span>
            {skipped > 0 && (
              <span className="flex items-center gap-1">
                <SkipForward size={11} /> {skipped}
              </span>
            )}
            {hard > 0 && (
              <span className="flex items-center gap-1 text-orange-400/90">
                <ArrowDownCircle size={11} /> {hard}
              </span>
            )}
            <span className="flex items-center gap-1 text-amber-400/90">
              <Zap size={11} /> +{session.xp}
            </span>
          </div>
        </div>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="border-t border-zinc-800 px-3.5 py-2.5 space-y-1.5">
          {session.records?.map((r) => (
            <li key={`r${r.name}${r.kind}`} className="text-xs text-amber-300 flex items-center gap-1.5">
              <Trophy size={11} /> {r.name}: {r.kind === "hold" ? `${r.previous}s → ${r.value}s` : tx("{a} → {b} reps", { a: r.previous, b: r.value })}
            </li>
          ))}
          {session.exercises.map((e, i) => (
            <ExerciseLine key={i} e={e} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ExerciseLine({ e }: { e: ExerciseRecord }) {
  const { tx } = useLanguage();
  const result =
    formatSets(e.sets) ??
    (typeof e.checkResult === "number" ? `${e.checkResult}` : e.checkResult === true ? tx("done") : e.detail ?? "");
  return (
    <li className="flex items-center gap-2 text-sm">
      {e.outcome === "done" ? (
        <Check size={13} className="text-emerald-400 shrink-0" />
      ) : e.outcome === "tooHard" ? (
        <ArrowDownCircle size={13} className="text-orange-400 shrink-0" />
      ) : (
        <SkipForward size={13} className="text-zinc-600 shrink-0" />
      )}
      <span className={`truncate ${e.outcome === "done" ? "text-zinc-200" : "text-zinc-500"}`}>{e.name}</span>
      <span className="ml-auto text-xs text-zinc-500 stat-mono shrink-0">{e.outcome === "done" ? result : tx(e.outcome === "tooHard" ? "Too hard" : "Skipped")}</span>
    </li>
  );
}
