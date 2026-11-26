"use client";

import { Bone } from "@/components/PageLoading";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, Layers, CalendarDays, Dumbbell, Sparkles, Share2 } from "lucide-react";
import ShareSheet from "@/components/ShareSheet";
import type { ShareCard } from "@/lib/shareCards";
import { absoluteChange, weightAt } from "@/lib/bodyweight";
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
  presetDate,
  ymd,
  endOfDay,
  snapshotSessions,
  weeksBefore,
  LOOKBACK_DAYS,
  stagesFor,
  stagesTrained,
} from "@/lib/compare";

// Then vs now: you today next to you on one day you pick — the stages you
// were at, your level and weight, and how you last did each exercise before
// that day (lib/compare.ts).

const PRESETS: { id: Preset; label: string }[] = [
  { id: "start", label: "When you started" },
  { id: "3m", label: "3 months ago" },
  { id: "1m", label: "1 month ago" },
];

const SHOWN = 12;

export default function ComparePage() {
  const { user, userDoc, loading } = useAuth();
  const { tx, locale } = useLanguage();
  const router = useRouter();
  const [picked, setPicked] = useState(""); // yyyy-mm-dd; empty = when you started
  const [nowAt] = useState(() => new Date().toISOString());
  const [sessions, setSessions] = useState<SessionRecord[] | null>(null);
  const [area, setArea] = useState<Area | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const [share, setShare] = useState<ShareCard | null>(null);

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

  const startedAt = firstSession ?? userDoc?.createdAt;
  const startDay = startedAt ? ymd(new Date(startedAt)) : "";
  const yesterday = ymd(new Date(new Date(nowAt).getTime() - 86400000));
  const thenDate = picked || (startedAt ? presetDate("start", { startedAt }) : "");
  const thenAt = thenDate ? endOfDay(thenDate) : "";

  const data = useMemo(() => {
    if (!userDoc || !sessions || !thenAt) return null;
    const thenS = snapshotSessions(sessions, thenAt);
    const nowS = snapshotSessions(sessions, nowAt);
    const lookback = (at: string) => sessions.filter((s) => inPeriod(s, { from: new Date(new Date(at).getTime() - LOOKBACK_DAYS * 86400000).toISOString(), to: at })).length;
    const tl = exerciseLines(thenS);
    const nl = exerciseLines(nowS);
    const stThen = stagesFor({ from: thenAt, to: thenAt }, thenS, userDoc, false);
    // like for like: if "then" had to be worked out from training, so is "now"
    const stNow = stThen.exact ? stagesFor({ from: nowAt, to: nowAt }, nowS, userDoc, true) : { stages: stagesTrained(nowS), exact: false };
    const areas = compareAreas(tl, nl);
    const withChange = areas.filter((a) => a.change !== null);
    return {
      thenCount: lookback(thenAt),
      nowCount: lookback(nowAt),
      thenHas: thenS.length > 0,
      nowHas: nowS.length > 0,
      exercises: compareExercises(tl, nl),
      skills: compareSkills(stThen.stages, stNow.stages, stThen.exact),
      reconstructed: !stThen.exact || !stNow.exact,
      areas,
      overall: withChange.length ? Math.round(withChange.reduce((a, x) => a + (x.change ?? 0), 0) / withChange.length) : null,
      head: headline(userDoc, sessions, weeksBefore(thenAt), weeksBefore(nowAt)),
      kg: [weightAt(userDoc.weightLog, userDoc.body?.weightKg, thenAt), weightAt(userDoc.weightLog, userDoc.body?.weightKg, nowAt)] as [number | undefined, number | undefined],
    };
  }, [userDoc, sessions, thenAt, nowAt]);

  if (loading || !userDoc || !thenDate) return <PageLoading variant="list" />;

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const fmtDay = (d: string) => fmtDate(`${d}T12:00:00`);
  // the quick picks, only those after you started
  const presets = PRESETS.map((p) => ({ ...p, date: presetDate(p.id, { startedAt: startedAt ?? nowAt }) })).filter((p) => p.id === "start" || p.date > startDay);
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
          <p className="text-sm text-zinc-400">{tx("You today next to you on a day you pick: how far your exercises, skills and strength have come.")}</p>
        </div>

        {/* then: one day you pick; now: today */}
        <section className="panel p-3 space-y-3" aria-label={tx("Compare")}>
          <label className="block">
            <span className="text-xs text-zinc-400">{tx("Compare today with")}</span>
            <input
              type="date"
              value={thenDate}
              min={startDay || undefined}
              max={yesterday}
              onChange={(e) => e.target.value && setPicked(e.target.value)}
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-base"
            />
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={tx("Quick picks")}>
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => setPicked(p.id === "start" ? "" : p.date)}
                aria-pressed={thenDate === p.date}
                className={`text-sm px-3 py-1.5 rounded-full border ${thenDate === p.date ? "border-orange-500 bg-orange-500/15 text-orange-200" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}
              >
                {tx(p.label)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-zinc-800/50 px-3 py-2">
              <span className="block text-zinc-400 uppercase tracking-wide">{tx("Then")}</span>
              <span className="text-zinc-200 text-sm">{fmtDay(thenDate)}</span>
              {data && <span className="block text-zinc-400">{tx("{n} sessions in the 6 weeks before", { n: data.thenCount })}</span>}
            </div>
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 px-3 py-2">
              <span className="block text-orange-300 uppercase tracking-wide">{tx("Now")}</span>
              <span className="text-zinc-200 text-sm">{tx("Today")}</span>
              {data && <span className="block text-zinc-400">{tx("{n} sessions in the last 6 weeks", { n: data.nowCount })}</span>}
            </div>
          </div>
        </section>

        {!data ? (
          <div className="space-y-3" role="status" aria-label={tx("Loading…")}>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Bone key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Bone className="h-56 w-full rounded-xl" />
          </div>
        ) : !data.thenHas || !data.nowHas ? (
          <section className="panel p-5 text-center">
            <p className="text-zinc-200">{!data.thenHas ? tx("No training logged in the 6 weeks before {d}.", { d: fmtDay(thenDate) }) : tx("No training logged in the last 6 weeks.")}</p>
            <p className="text-sm text-zinc-400 mt-1">{!data.thenHas ? tx("Pick a later day — the comparison needs a few sessions before it.") : tx("Train a little and come back — the comparison fills in as you log sessions.")}</p>
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
            {/* bodyweight exercises measure strength for your weight: when the
                weight moved, the absolute change too */}
            {data.kg[0] && data.kg[1] && Math.abs(data.kg[1] - data.kg[0]) >= 0.5 && (
              <p className="panel p-3 text-sm text-zinc-300">
                {tx("Bodyweight {a} → {b} kg.", { a: data.kg[0], b: data.kg[1] })}{" "}
                {data.overall !== null &&
                  tx("Strength for your weight {r}%; absolute {x}%.", {
                    r: sign(data.overall),
                    x: sign(absoluteChange(data.overall, data.kg[0], data.kg[1])),
                  })}
              </p>
            )}

            <button
              onClick={() =>
                setShare({
                  kind: "progress",
                  fromISO: `${thenDate}T12:00:00.000Z`,
                  dateISO: nowAt,
                  strength: data.overall,
                  stages: stagesUp,
                  levels: [data.head.levelThen, data.head.levelNow],
                  skills: data.skills
                    .filter((x) => x.steps > 0)
                    .map((x) => ({ name: SKILL_FIELD_LABEL[x.skill as StagedSkillKey], from: stage(x.from), to: stage(x.to), skill: x.skill as StagedSkillKey, stage: x.to })),
                  exercises: data.exercises.both
                    .filter((r) => r.bestChange > 0)
                    .map((r) => ({ name: r.now.name, from: val(r.then, r.then.best), to: val(r.now, r.now.best), change: r.bestChange })),
                  areas: data.areas.filter((a) => a.change !== null).map((a) => ({ name: tx(AREA_LABEL[a.area]), change: a.change ?? 0 })).sort((a, b) => b.change - a.change),
                  // the hardest thing trained now, to draw
                  figure: [...data.exercises.both.map((r) => r.now), ...data.exercises.added].sort((a, b) => b.difficulty - a.difficulty)[0]?.name,
                })
              }
              className="w-full h-12 rounded-xl border border-emerald-500/60 text-emerald-200 hover:bg-emerald-500/10 text-base flex items-center justify-center gap-2"
            >
              <Share2 size={18} /> {tx("Share your progress")}
            </button>

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
                {data.reconstructed && <p className="text-xs text-zinc-400 mt-2">{tx("Worked out from the hardest exercise you trained for each skill before each day; from now on every stage change is recorded.")}</p>}
              </section>
            )}

            {/* exercises */}
            <section className="panel p-4" aria-labelledby="ex-title">
              <h2 id="ex-title" className="heading text-base text-zinc-100 mb-1">{tx("Exercises you did in both")}</h2>
              <p className="text-xs text-zinc-400 mb-3">{tx("The last times you did each one before that day, and the last times now: best set, typical set and sets per session. ≈ means it comes from the plan, not a logged set.")}</p>
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
                <p className="text-sm text-zinc-400">{tx("No exercise you did then is in your recent training — see what's new below.")}</p>
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
      <ShareSheet card={share} onClose={() => setShare(null)} />
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
