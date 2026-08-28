"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import SessionView from "@/components/SessionView";
import { generatePlan, PlanDay, PlanRange } from "@/lib/planGenerator";
import { TRACK_LABEL } from "@/lib/types";
import { Sparkles, ChevronDown, ChevronUp, Moon } from "lucide-react";

const RANGE_OPTIONS: { value: PlanRange; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

function isToday(dateISO: string) {
  return dateISO === new Date().toISOString().slice(0, 10);
}

export default function PlanPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();
  const [range, setRange] = useState<PlanRange>("week");
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [aiIntro, setAiIntro] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<Record<string, string>>({});
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "error" | "unconfigured" | "done">("idle");
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  const skillsSummary = useMemo(() => {
    if (!userDoc) return "";
    const s = userDoc.skills;
    return [
      `front lever: ${s.frontLever}`,
      `back lever: ${s.backLever}`,
      `planche: ${s.planche}`,
      `muscle-up: ${s.muscleUp}`,
      `handstand: ${s.handstand}`,
      `human flag: ${s.humanFlag}`,
      `pistol squat: ${s.pistolSquat}`,
      `l-sit: ${s.lSit}`,
      `max pull-ups: ${s.pullUpMaxReps}`,
      `max dips: ${s.dipMaxReps}`,
    ].join(", ");
  }, [userDoc]);

  const handleGenerate = async () => {
    if (!userDoc) return;
    const newPlan = generatePlan(userDoc.skills, userDoc.equipment, userDoc.goalTracks ?? [], userDoc.body, range);
    setPlan(newPlan);
    setExpanded(newPlan.find((d) => !d.isRestDay)?.dateISO ?? null);
    setAiIntro(null);
    setAiNotes({});
    setAiError(null);
    setAiStatus("idle");

    if (useAI) {
      setAiStatus("loading");
      try {
        const res = await fetch("/api/plan-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            days: newPlan.map((d) => ({
              dateISO: d.dateISO,
              weekday: d.weekday,
              isRestDay: d.isRestDay,
              focusLabel: d.session?.focusLabel,
              mainExercises: d.session?.sets
                .find((s) => s.title.startsWith("Main Focus"))
                ?.exercises.map((e) => e.name)
                .slice(0, 3),
            })),
            goals: (userDoc.goalTracks ?? []).map((t) => TRACK_LABEL[t]),
            skillsSummary,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAiStatus(res.status === 501 ? "unconfigured" : "error");
          setAiError(data.error ?? "Couldn't reach the AI coach.");
          return;
        }
        setAiIntro(data.intro || null);
        setAiNotes(data.notes || {});
        setAiStatus("done");
      } catch (e) {
        setAiStatus("error");
        setAiError(e instanceof Error ? e.message : "Couldn't reach the AI coach.");
      }
    }
  };

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const trainingDays = plan.filter((d) => !d.isRestDay).length;

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <div>
          <h1 className="heading text-2xl text-zinc-100">Training plan</h1>
          <p className="text-zinc-400 text-sm">
            Lay out sessions ahead of time instead of just today&apos;s.
          </p>
        </div>

        <div className="panel p-4 space-y-3">
          <div className="flex gap-1.5">
            {RANGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setRange(o.value)}
                className={`flex-1 py-2 rounded-lg text-sm border ${
                  range === o.value
                    ? "border-orange-500 bg-orange-500/10 text-zinc-100"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="accent-orange-500 w-4 h-4"
            />
            <Sparkles size={14} className="text-orange-400" />
            Add AI coach notes (optional)
          </label>

          <button
            onClick={handleGenerate}
            className="w-full py-2.5 rounded-lg heading text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950"
          >
            Generate plan
          </button>
        </div>

        {aiStatus === "loading" && (
          <div className="text-xs text-zinc-500">Asking the AI coach for a few notes...</div>
        )}
        {aiStatus === "unconfigured" && (
          <div className="panel p-3 text-xs text-zinc-500">
            AI coach notes aren&apos;t set up on this server (missing OPENROUTER_API_KEY) —
            showing your plan without them. It still works fully without this.
          </div>
        )}
        {aiStatus === "error" && (
          <div className="panel p-3 text-xs text-zinc-500">
            {aiError} Showing your plan without AI notes.
          </div>
        )}
        {aiIntro && (
          <div className="panel p-3 text-sm text-zinc-300 border-orange-500/30">
            <span className="text-orange-400 mr-1">Coach:</span>
            {aiIntro}
          </div>
        )}

        {plan.length > 0 && (
          <div className="text-xs text-zinc-500">
            {trainingDays} training day{trainingDays === 1 ? "" : "s"} · {plan.length - trainingDays} rest day
            {plan.length - trainingDays === 1 ? "" : "s"}
          </div>
        )}

        <div className="space-y-2">
          {plan.map((d) => {
            const open = expanded === d.dateISO;
            const today = isToday(d.dateISO);
            return (
              <div key={d.dateISO} className="panel overflow-hidden">
                <button
                  onClick={() => setExpanded(open ? null : d.dateISO)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center w-10 shrink-0">
                      <div className="text-[10px] text-zinc-500 uppercase">{d.weekday}</div>
                      <div className="stat-mono text-sm text-zinc-200">{d.dateISO.slice(8, 10)}</div>
                    </div>
                    <div>
                      {d.isRestDay ? (
                        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                          <Moon size={14} /> Rest day
                        </div>
                      ) : (
                        <div className="text-sm text-zinc-100">
                          {d.session?.focusLabel}
                          {today && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                              TODAY
                            </span>
                          )}
                        </div>
                      )}
                      {aiNotes[d.dateISO] && (
                        <div className="text-xs text-zinc-500 mt-0.5">{aiNotes[d.dateISO]}</div>
                      )}
                    </div>
                  </div>
                  {!d.isRestDay &&
                    (open ? (
                      <ChevronUp size={16} className="text-zinc-500" />
                    ) : (
                      <ChevronDown size={16} className="text-zinc-500" />
                    ))}
                </button>
                {open && d.session && (
                  <div className="px-3 pb-3">
                    {today ? (
                      <Link href="/training" className="block text-center text-xs text-orange-400 mb-2 hover:underline">
                        Open today&apos;s session to start and log it →
                      </Link>
                    ) : (
                      <div className="text-xs text-zinc-500 mb-2">Preview — come back on this day to log it.</div>
                    )}
                    <SessionView session={d.session} equipment={userDoc.equipment} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
