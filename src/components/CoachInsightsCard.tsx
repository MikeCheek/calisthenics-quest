"use client";

import { UserDoc, ExerciseStat, SKILL_FIELD_LABEL, StagedSkillKey } from "@/lib/types";
import { median } from "@/lib/timingLearning";
import { useLanguage } from "@/context/LanguageContext";
import { Brain, TrendingDown, TrendingUp, Timer, Hourglass } from "lucide-react";

// Turns the raw learning memory into a few readable lines: what's being
// eased, what's progressing, and what the timer has learned.
function prettyName(key: string): string {
  const s = key.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function CoachInsightsCard({ userDoc }: { userDoc: UserDoc }) {
  const { tx } = useLanguage();
  const entries = Object.entries(userDoc.exerciseStats ?? {}) as [string, ExerciseStat][];
  const struggling = entries.filter(([, s]) => s.p >= 2).sort((a, b) => b[1].p - a[1].p).slice(0, 4);
  const progressing = entries.filter(([, s]) => s.p <= -3).sort((a, b) => a[1].p - b[1].p).slice(0, 4);
  const restLearned = entries
    .filter(([, s]) => (s.rr?.length ?? 0) >= 3 && Math.abs(median(s.rr!) - 1) > 0.15)
    .slice(0, 3);
  const holdShort = entries.filter(([, s]) => (s.hr?.length ?? 0) >= 2 && median(s.hr!) < 0.75).slice(0, 3);
  const transition = userDoc.transitionRest && userDoc.transitionRest.length >= 3 ? median(userDoc.transitionRest) : null;
  const rising = (Object.entries(userDoc.skillProgress ?? {}) as [StagedSkillKey, { score: number }][])
    .filter(([, p]) => p.score >= 3)
    .map(([k]) => SKILL_FIELD_LABEL[k])
    .slice(0, 4);

  const empty =
    !struggling.length && !progressing.length && !restLearned.length && !holdShort.length && transition === null && !rising.length;

  return (
    <div className="panel p-4">
      <div className="heading text-base text-zinc-100 flex items-center gap-2 mb-1">
        <Brain size={16} className="text-sky-400" /> {tx("Coach insights")}
      </div>
      <p className="text-xs text-zinc-500 mb-3">{tx("What your training has taught the coach so far.")}</p>

      {empty ? (
        <p className="text-sm text-zinc-400">
          {tx("Nothing learned yet — complete, skip or mark exercises too hard and use the timer, and insights appear here.")}
        </p>
      ) : (
        <div className="space-y-3">
          {progressing.length > 0 && (
            <Group icon={<TrendingUp size={14} className="text-emerald-400" />} title={tx("Going well")}>
              {progressing.map(([k, s]) => (
                <Row key={k} name={prettyName(k)} detail={tx("{n} completions", { n: s.done })} />
              ))}
            </Group>
          )}
          {rising.length > 0 && (
            <Group icon={<TrendingUp size={14} className="text-emerald-400" />} title={tx("Skills trending up")}>
              <div className="text-sm text-zinc-300">{rising.join(", ")}</div>
            </Group>
          )}
          {struggling.length > 0 && (
            <Group icon={<TrendingDown size={14} className="text-orange-400" />} title={tx("Being eased off")}>
              {struggling.map(([k, s]) => (
                <Row key={k} name={prettyName(k)} detail={tx("{a} too hard · {b} skipped", { a: s.tooHard, b: s.skipped })} />
              ))}
            </Group>
          )}
          {(restLearned.length > 0 || transition !== null) && (
            <Group icon={<Timer size={14} className="text-sky-400" />} title={tx("Rest, learned from the timer")}>
              {restLearned.map(([k, s]) => {
                const r = median(s.rr!);
                return <Row key={k} name={prettyName(k)} detail={tx(r < 1 ? "{p}% shorter" : "{p}% longer", { p: Math.round(Math.abs(r - 1) * 100) })} />;
              })}
              {transition !== null && Math.abs(transition - 1) > 0.15 && (
                <Row
                  name={tx("Between exercises")}
                  detail={tx(transition < 1 ? "{p}% shorter" : "{p}% longer", { p: Math.round(Math.abs(transition - 1) * 100) })}
                />
              )}
            </Group>
          )}
          {holdShort.length > 0 && (
            <Group icon={<Hourglass size={14} className="text-orange-400" />} title={tx("Shorter hold targets")}>
              {holdShort.map(([k, s]) => (
                <Row key={k} name={prettyName(k)} detail={tx("holding ~{p}% of target", { p: Math.round(median(s.hr!) * 100) })} />
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1 flex items-center gap-1.5">
        {icon} {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-zinc-200 truncate">{name}</span>
      <span className="text-xs text-zinc-500 shrink-0">{detail}</span>
    </div>
  );
}
