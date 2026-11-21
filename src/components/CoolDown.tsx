"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Wind } from "lucide-react";
import Modal from "./Modal";
import ExerciseTimer from "./ExerciseTimer";
import { useLanguage } from "@/context/LanguageContext";
import { MUSCLE_LABEL, planCoolDown, type CoolDown, type DoneExercise } from "@/lib/stretching";

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

export function CoolDownFlow({ plan, open, onClose }: { plan: CoolDown; open: boolean; onClose: () => void }) {
  const { tx } = useLanguage();
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
    <Modal open={open} onClose={close} title={tx("Cool-down")}>
      {finished ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
            <Check size={26} className="text-emerald-400" />
          </div>
          <p className="heading text-xl text-zinc-100">{tx("Cool-down done")}</p>
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
            {tx("Stretch {a} of {b}", { a: i + 1, b: plan.stretches.length })} · {s.for.map((m) => tx(MUSCLE_LABEL[m])).join(", ")}
          </p>
          <h3 className="heading text-xl text-zinc-100 mt-1">{s.name}</h3>
          {s.perSide && <p className="text-sm text-sky-300">{tx("One hold for each side.")}</p>}
          <p className="text-base text-zinc-300 mt-2">{tx(s.how)}</p>
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
              {last ? tx("Finish") : tx("Next stretch")} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
