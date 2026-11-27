"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Wind } from "lucide-react";
import Modal from "./Modal";
import ExerciseTimer from "./ExerciseTimer";
import { useLanguage } from "@/context/LanguageContext";
import { localizedDescription } from "@/lib/exerciseTiming";
import { MUSCLE_LABEL, planCoolDown, type CoolDown, type DoneExercise, type Load } from "@/lib/stretching";
import { planRestDay, recentLoad } from "@/lib/restDay";
import { useAuth } from "@/context/AuthContext";
import { fetchSessionsBetween } from "@/lib/store";

// The cool-down after a session (lib/stretching.ts): a card with the
// stretches for the muscles it worked most, and a guided run through them
// with a timer for each hold.

export function useCoolDown(exercises: DoneExercise[]): CoolDown | null {
  const key = exercises.map((e) => e.name).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => planCoolDown(exercises), [key]);
}

export default function CoolDownCard({ exercises, className = "" }: { exercises: DoneExercise[]; className?: string }) {
  const { tx } = useLanguage();
  const plan = useCoolDown(exercises);
  const [open, setOpen] = useState(false);
  if (!plan) return null;
  return (
    <section className={`panel p-4 ${className}`} aria-labelledby="cooldown-title">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center shrink-0">
          <Wind size={20} className="text-sky-300" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 id="cooldown-title" className="heading text-base text-zinc-100">
            {tx("Cool-down stretches")}
          </h2>
          <p className="text-sm text-zinc-400">
            {tx("About {n} min, for what you worked most: {m}.", { n: plan.minutes, m: plan.focus.map((m) => tx(MUSCLE_LABEL[m]).toLowerCase()).join(", ") })}
          </p>
        </div>
      </div>
      <ol className="mt-3 space-y-1.5">
        {plan.stretches.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            <span className="w-5 text-zinc-400 stat-mono text-xs">{i + 1}</span>
            <span className="flex-1 text-zinc-200">{s.name}</span>
            <span className="text-xs text-zinc-400">{s.perSide ? tx("30 s each side") : tx("{n} s", { n: s.detail.match(/(\d+)s/)?.[1] ?? 30 })}</span>
          </li>
        ))}
      </ol>
      <button onClick={() => setOpen(true)} className="w-full mt-4 h-12 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 text-base font-semibold flex items-center justify-center gap-2">
        <Wind size={18} /> {tx("Start cool-down")}
      </button>
      <CoolDownFlow plan={plan} open={open} onClose={() => setOpen(false)} />
    </section>
  );
}

export function CoolDownFlow({
  plan,
  open,
  onClose,
  title = "Cool-down",
  doneTitle = "Cool-down done",
}: {
  plan: CoolDown;
  open: boolean;
  onClose: () => void;
  title?: string;
  doneTitle?: string;
}) {
  const { tx, locale } = useLanguage();
  const [i, setI] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const s = plan.stretches[i];
  const last = i === plan.stretches.length - 1;
  const finished = done.size === plan.stretches.length;

  const close = () => {
    onClose();
    setI(0);
    setDone(new Set());
  };

  return (
    <Modal open={open} onClose={close} title={tx(title)}>
      {finished ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
            <Check size={26} className="text-emerald-400" />
          </div>
          <p className="heading text-xl text-zinc-100">{tx(doneTitle)}</p>
          <p className="text-sm text-zinc-400 mt-1">{tx("Nice work today. Drink some water.")}</p>
          <button onClick={close} className="w-full mt-5 h-12 rounded-xl bg-zinc-100 text-zinc-950 text-base font-semibold">
            {tx("Close")}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-1 mb-3" aria-hidden="true">
            {plan.stretches.map((x, k) => (
              <span key={x.id} className={`h-1.5 flex-1 rounded-full ${done.has(k) ? "bg-emerald-500" : k === i ? "bg-sky-400" : "bg-zinc-800"}`} />
            ))}
          </div>
          <p className="text-xs text-zinc-400">
            {tx(s.description ? "Move {a} of {b}" : "Stretch {a} of {b}", { a: i + 1, b: plan.stretches.length })} · {s.for.map((m) => tx(MUSCLE_LABEL[m])).join(", ")}
          </p>
          <h3 className="heading text-xl text-zinc-100 mt-1">{s.name}</h3>
          {s.perSide && <p className="text-sm text-sky-300">{s.description ? tx("Both sides.") : tx("One hold for each side.")}</p>}
          <p className="text-base text-zinc-300 mt-2">
            {s.description ? localizedDescription({ name: s.name, detail: s.detail, restSeconds: 10, description: s.description }, locale) : tx(s.how ?? "")}
          </p>
          <p className="text-xs text-zinc-400 mt-2">{tx("Ease into it — a stretch should feel strong, never painful.")}</p>
          <ExerciseTimer
            key={s.id}
            exercise={{ name: s.name, detail: s.detail, restSeconds: 5 }}
            onComplete={() => {
              setDone((d) => new Set(d).add(i));
              if (!last) setI(i + 1);
            }}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setI(Math.max(0, i - 1))}
              disabled={i === 0}
              className="w-14 h-12 rounded-xl border border-zinc-700 text-zinc-200 disabled:opacity-30 flex items-center justify-center"
              aria-label={tx("Back")}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => {
                setDone((d) => new Set(d).add(i));
                if (!last) setI(i + 1);
              }}
              className="flex-1 h-12 rounded-xl border border-zinc-600 text-zinc-100 text-base flex items-center justify-center gap-1.5"
            >
              {last ? tx("Finish") : s.description ? tx("Next") : tx("Next stretch")} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// Rest days: a ~10-minute mobility routine (lib/restDay.ts), easing what
// the last three days of training loaded and moving the whole body.
export function RestDayCard() {
  const { userDoc } = useAuth();
  const { tx } = useLanguage();
  const [recent, setRecent] = useState<Load | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userDoc) return;
    let live = true;
    const now = new Date();
    fetchSessionsBetween(userDoc.uid, new Date(now.getTime() - 3 * 86400000).toISOString(), new Date(now.getTime() + 60000).toISOString())
      .then((s) => live && setRecent(recentLoad(s, now)))
      .catch(() => live && setRecent({}));
    return () => {
      live = false;
    };
  }, [userDoc]);

  const plan = useMemo(
    () => (recent && userDoc ? planRestDay(recent, userDoc.equipment, new Date().getDate()) : null),
    [recent, userDoc]
  );
  if (!plan) return null;

  return (
    <section className="panel p-4" aria-labelledby="restday-title">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
          <Wind size={20} className="text-violet-300" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 id="restday-title" className="heading text-base text-zinc-100">
            {tx("Rest-day mobility")}
          </h2>
          <p className="text-sm text-zinc-400">
            {tx("About {n} min of easy movement and stretching — it helps you recover for the next session.", { n: plan.minutes })}
          </p>
        </div>
      </div>
      <p className="text-xs text-zinc-400 mt-3">
        {plan.stretches.length} {tx("moves")} · {plan.focus.map((m) => tx(MUSCLE_LABEL[m]).toLowerCase()).join(", ")}
      </p>
      {/* a secondary action: on Today the session's Start is the main one */}
      <button onClick={() => setOpen(true)} className="w-full mt-3 h-12 rounded-xl border border-violet-500/60 text-violet-200 hover:bg-violet-500/10 text-base font-semibold flex items-center justify-center gap-2">
        <Wind size={18} /> {tx("Start mobility")}
      </button>
      <CoolDownFlow plan={plan} open={open} onClose={() => setOpen(false)} title="Rest-day mobility" doneTitle="Mobility done" />
    </section>
  );
}
