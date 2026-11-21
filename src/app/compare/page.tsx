"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, Layers, CalendarDays, Dumbbell, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import PageLoading from "@/components/PageLoading";
import { fetchSessionsBetween } from "@/lib/store";
import { SKILL_FIELD_LABEL, type SessionRecord, type StagedSkillKey } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { formatHeld } from "@/lib/volumeTotals";
import {
  AREA_LABEL,
  type Area,
  type ExerciseLine,
  type Preset,
  compareAreas,
  compareExercises,
  compareSkills,
  exerciseLines,
  headline,
  inPeriod,
  periodsFor,
  stagesFor,
  stagesTrained,
} from "@/lib/compare";

// Then vs now: two two-week windows of training side by side — since you
// started, a month or three ago, or any dates you pick (lib/compare.ts).

const PRESETS: { id: Preset; label: string }[] = [
  { id: "start", label: "Since you started" },
  { id: "3m", label: "3 months" },
  { id: "1m", label: "1 month" },
  { id: "custom", label: "Custom" },
];

const day = (iso: string) => iso.slice(0, 10);
const SHOWN = 12;

export default function ComparePage() {
  const { user, userDoc, loading } = useAuth();
  const { tx, locale } = useLanguage();
  const router = useRouter();
  const [preset, setPreset] = useState<Preset>("start");
  const [thenDate, setThenDate] = useState("");
  const [nowDate, setNowDate] = useState("");
  const [sessions, setSessions] = useState<SessionRecord[] | null>(null);
  const [area, setArea] = useState<Area | "all">("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  // every session since the account began, loaded once; "since you
  // started" begins at the first of them, not at sign-up
  const uid = userDoc?.uid;
  const createdAt = userDoc?.createdAt;
  useEffect(() => {
    if (!uid || !createdAt) return;
    let live = true;
    fetchSessionsBetween(uid, createdAt, new Date(Date.now() + 86400000).toISOString())
      .then((s) => live && setSessions(s))
      .catch(() => live && setSessions([]));
    return () => {
      live = false;
    };
  }, [uid, createdAt]);

  const firstSession = useMemo(() => (sessions?.length ? sessions.reduce((a, s) => (s.finishedAt < a ? s.finishedAt : a), sessions[0].finishedAt) : undefined), [sessions]);

  const periods = useMemo(
    () =>
      userDoc
        ? periodsFor(preset, { startedAt: firstSession ?? userDoc.createdAt, thenDate: thenDate || undefined, nowDate: nowDate || undefined })
        : null,
    [userDoc, preset, thenDate, nowDate, firstSession]
  );

  const data = useMemo(() => {
    if (!userDoc || !periods || !sessions) return null;
    const thenS = sessions.filter((s) => inPeriod(s, periods.then));
    const nowS = sessions.filter((s) => inPeriod(s, periods.now));
    const tl = exerciseLines(thenS);
    const nl = exerciseLines(nowS);
    const stThen = stagesFor(periods.then, thenS, userDoc, false);
    // like for like: if "then" had to be worked out from training, so is "now"
    const stNow = stThen.exact ? stagesFor(periods.now, nowS, userDoc, true) : { stages: stagesTrained(nowS), exact: false };
    const areas = compareAreas(tl, nl);
    const withChange = areas.filter((a) => a.change !== null);
    return {
      thenCount: thenS.length,
      nowCount: nowS.length,
      exercises: compareExercises(tl, nl),
      skills: compareSkills(stThen.stages, stNow.stages, stThen.exact),
      reconstructed: !stThen.exact || !stNow.exact,
      areas,
      overall: withChange.length ? Math.round(withChange.reduce((a, x) => a + (x.change ?? 0), 0) / withChange.length) : null,
      head: headline(userDoc, sessions, periods.then, periods.now),
    };
  }, [userDoc, periods, sessions]);

  if (loading || !userDoc || !periods) return <PageLoading />;

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const range = (p: { from: string; to: string }) => `${fmtDate(p.from)} – ${fmtDate(new Date(new Date(p.to).getTime() - 86400000).toISOString())}`;
  const val = (l: ExerciseLine, v: number) => (l.kind === "hold" ? formatHeld(Math.round(v)) : tx("{n} reps", { n: v }));
  const stage = (s: string) => (s === "none" ? tx("Not started") : s === "unknown" ? tx("not trained then") : tx(STAGE_LABEL[s] ?? s));
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const chip = (n: number | null) =>
    n === null ? "text-zinc-400 border-zinc-700" : n > 0 ? "text-emerald-300 border-emerald-500/50 bg-emerald-500/10" : n < 0 ? "text-red-300 border-red-500/50 bg-red-500/10" : "text-zinc-300 border-zinc-600";

  const stagesUp = data ? data.skills.reduce((a, s) => a + Math.max(0, s.steps), 0) : 0;
  const rows = data ? data.exercises.both.filter((r) => area === "all" || r.now.area === area) : [];
  const areasPresent = data ? [...new Set(data.exercises.both.map((r) => r.now.area))] : [];
  const maxScore = data ? Math.max(0.01, ...data.areas.flatMap((a) => [a.then, a.now])) : 1;

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <div>
          <h1 className="heading text-2xl text-zinc-100">{tx("Then vs now")}</h1>
          <p className="text-sm text-zinc-400">{tx("Two weeks of your training side by side: how far your exercises, skills and strength have come.")}</p>
        </div>

        {/* which two periods */}
        <section className="panel p-3 space-y-3" aria-label={tx("Compare")}>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-800/60" role="group" aria-label={tx("Compare")}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                aria-pressed={preset === p.id}
                className={`py-2 px-1 rounded-lg text-sm leading-tight ${preset === p.id ? "bg-orange-500 text-zinc-950 font-semibold" : "text-zinc-300 hover:text-zinc-100"}`}
              >
                {tx(p.label)}
              </button>
            ))}
          </div>
          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-zinc-400">
                {tx("Then — from")}
                <input
                  type="date"
                  value={thenDate || day(periods.then.from)}
                  max={nowDate || day(new Date().toISOString())}
                  onChange={(e) => setThenDate(e.target.value)}
                  className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100"
                />
              </label>
              <label className="text-xs text-zinc-400">
                {tx("Now — up to")}
                <input
                  type="date"
                  value={nowDate || day(new Date().toISOString())}
                  min={thenDate || undefined}
                  max={day(new Date().toISOString())}
                  onChange={(e) => setNowDate(e.target.value)}
                  className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100"
                />
              </label>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-zinc-800/50 px-3 py-2">
              <span className="block text-zinc-400 uppercase tracking-wide">{tx("Then")}</span>
              <span className="text-zinc-200">{range(periods.then)}</span>
              {data && <span className="block text-zinc-400">{tx("{n} sessions", { n: data.thenCount })}</span>}
            </div>
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 px-3 py-2">
              <span className="block text-orange-300 uppercase tracking-wide">{tx("Now")}</span>
              <span className="text-zinc-200">{range(periods.now)}</span>
              {data && <span className="block text-zinc-400">{tx("{n} sessions", { n: data.nowCount })}</span>}
            </div>
          </div>
        </section>

        {!data ? (
          <PageLoadingInline label={tx("Loading…")} />
        ) : data.thenCount === 0 || data.nowCount === 0 ? (
          <section className="panel p-5 text-center">
            <p className="text-zinc-200">{data.thenCount === 0 ? tx("No sessions in the “then” period.") : tx("No sessions in the “now” period.")}</p>
            <p className="text-sm text-zinc-400 mt-1">{tx("Pick other dates, or train a little more — the comparison fills in as you log sessions.")}</p>
          </section>
        ) : (
          <>
            {/* headline */}
            <section className="grid grid-cols-2 gap-2" aria-label={tx("Summary")}>
              <Stat icon={TrendingUp} label={tx("Strength")} value={data.overall === null ? "—" : `${sign(data.overall)}%`} good={(data.overall ?? 0) > 0} />
              <Stat icon={Layers} label={tx("Skill stages")} value={stagesUp ? `+${stagesUp}` : "0"} good={stagesUp > 0} />
              <Stat icon={Sparkles} label={tx("Level")} value={`≈${data.head.levelThen} → ${data.head.levelNow}`} good={data.head.levelNow > data.head.levelThen} />
              <Stat icon={CalendarDays} label={tx("Sessions a week")} value={`${data.head.sessionsPerWeek[0]} → ${data.head.sessionsPerWeek[1]}`} good={data.head.sessionsPerWeek[1] >= data.head.sessionsPerWeek[0]} />
            </section>

            {/* muscle groups */}
            <section className="panel p-4" aria-labelledby="areas-title">
              <h2 id="areas-title" className="heading text-base text-zinc-100 mb-1">{tx("Strength by muscle group")}</h2>
              <p className="text-xs text-zinc-400 mb-3">{tx("How hard your exercises are, times what you did in them — moving to a harder variation counts, even if the reps drop.")}</p>
              <ul className="space-y-3">
                {data.areas.map((a) => (
                  <li key={a.area}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-zinc-200">{tx(AREA_LABEL[a.area])}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${chip(a.change)}`}>{a.change === null ? (a.then ? tx("not trained now") : tx("new")) : `${sign(a.change)}%`}</span>
                    </div>
                    <div className="space-y-1" aria-hidden="true">
                      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${(a.then / maxScore) * 100}%` }} />
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(a.now / maxScore) * 100}%` }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-zinc-400 mt-3 flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-full bg-zinc-500 inline-block" /> {tx("Then")}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-full bg-orange-500 inline-block" /> {tx("Now")}</span>
              </p>
            </section>

            {/* skills */}
            {data.skills.length > 0 && (
              <section className="panel p-4" aria-labelledby="skills-title">
                <h2 id="skills-title" className="heading text-base text-zinc-100 mb-3">{tx("Skills")}</h2>
                <ul className="divide-y divide-zinc-800">
                  {data.skills.map((s) => (
                    <li key={s.skill} className="py-2 flex items-center gap-2">
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-zinc-100">{SKILL_FIELD_LABEL[s.skill as StagedSkillKey]}</span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1 flex-wrap">
                          {stage(s.from)} <ArrowRight size={11} aria-label={tx("to")} /> <span className="text-zinc-200">{stage(s.to)}</span>
                        </span>
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${chip(s.steps)}`}>
                        {s.from === "unknown"
                          ? tx("now")
                          : s.steps === 0
                          ? tx("same")
                          : Math.abs(s.steps) === 1
                          ? s.steps > 0 ? tx("+1 stage") : tx("−1 stage")
                          : s.steps > 0
                          ? tx("+{n} stages", { n: s.steps })
                          : tx("{n} stages", { n: s.steps })}
                      </span>
                    </li>
                  ))}
                </ul>
                {data.reconstructed && <p className="text-xs text-zinc-400 mt-2">{tx("Worked out from the hardest exercise you trained for each skill in each period; from now on every stage change is recorded.")}</p>}
              </section>
            )}

            {/* exercises */}
            <section className="panel p-4" aria-labelledby="ex-title">
              <h2 id="ex-title" className="heading text-base text-zinc-100 mb-1">{tx("Exercises you did in both")}</h2>
              <p className="text-xs text-zinc-400 mb-3">{tx("Best set, typical set and sets per session. ≈ means it comes from the plan, not a logged set.")}</p>
              {areasPresent.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1" role="group" aria-label={tx("Muscle group")}>
                  {(["all", ...areasPresent] as (Area | "all")[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => setArea(a)}
                      aria-pressed={area === a}
                      className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${area === a ? "border-orange-500 bg-orange-500/15 text-orange-200" : "border-zinc-700 text-zinc-300"}`}
                    >
                      {a === "all" ? tx("All") : tx(AREA_LABEL[a])}
                    </button>
                  ))}
                </div>
              )}
              {rows.length === 0 ? (
                <p className="text-sm text-zinc-400">{tx("No exercise appears in both periods — see what's new below.")}</p>
              ) : (
                <ul className="space-y-2">
                  {(showAll ? rows : rows.slice(0, SHOWN)).map((r) => (
                    <li key={r.now.key} className="rounded-xl bg-zinc-950/40 px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm text-zinc-100">{r.now.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${chip(r.bestChange)}`}>{sign(r.bestChange)}%</span>
                      </div>
                      <dl className="grid grid-cols-3 gap-2 mt-1.5 text-xs">
                        <div>
                          <dt className="text-zinc-400">{tx("Best set")}</dt>
                          <dd className="text-zinc-200">
                            {r.then.estimated ? "≈" : ""}
                            {val(r.then, r.then.best)} → {r.now.estimated ? "≈" : ""}
                            {val(r.now, r.now.best)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-zinc-400">{tx("Typical set")}</dt>
                          <dd className="text-zinc-200">
                            {val(r.then, r.then.perSet)} → {val(r.now, r.now.perSet)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-zinc-400">{tx("Sets")}</dt>
                          <dd className="text-zinc-200">
                            {r.then.setsPerSession} → {r.now.setsPerSession}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              )}
              {rows.length > SHOWN && (
                <button onClick={() => setShowAll((v) => !v)} className="w-full mt-2 py-2.5 text-sm text-zinc-300 hover:text-zinc-100">
                  {showAll ? tx("Show less") : tx("Show all {n}", { n: rows.length })}
                </button>
              )}
            </section>

            {data.exercises.added.length > 0 && (
              <section className="panel p-4" aria-labelledby="new-title">
                <h2 id="new-title" className="heading text-base text-zinc-100 mb-1 flex items-center gap-2">
                  <Dumbbell size={16} className="text-orange-400" /> {tx("New in your training")}
                </h2>
                <p className="text-xs text-zinc-400 mb-3">{tx("Exercises you do now that you didn't then — harder ones first.")}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {data.exercises.added.slice(0, 16).map((n) => (
                    <li key={n.key} className="text-xs px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-200">
                      {n.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}

function Stat({ icon: Icon, label, value, good }: { icon: typeof TrendingUp; label: string; value: string; good: boolean }) {
  return (
    <div className="panel p-3">
      <span className="text-xs text-zinc-400 flex items-center gap-1.5">
        <Icon size={13} className={good ? "text-emerald-400" : "text-zinc-400"} /> {label}
      </span>
      <span className={`block stat-mono text-2xl mt-1 ${good ? "text-emerald-300" : "text-zinc-100"}`}>{value}</span>
    </div>
  );
}

function PageLoadingInline({ label }: { label: string }) {
  return <p className="text-sm text-zinc-400 text-center py-8">{label}</p>;
}
