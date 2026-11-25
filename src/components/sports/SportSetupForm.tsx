"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { SPORTS, SPORT_META, type Experience, type ExtraSport } from "@/lib/sports";

const EXPERIENCE: { id: Experience; label: string; hint: string }[] = [
  { id: "new", label: "New to it", hint: "Start from the foundations" },
  { id: "some", label: "Some practice", hint: "Skip the very first steps" },
  { id: "experienced", label: "Experienced", hint: "Start further up each skill" },
];
const LENGTHS = [15, 25, 40, 60];

// Starting a sport: how much you've done, what you want most, how long you
// have. Used when adding a sport and when picking one at the first login.
export default function SportSetupForm({
  sport,
  initialMinutes = 25,
  busy = false,
  onBack,
  onStart,
}: {
  sport: ExtraSport;
  initialMinutes?: number;
  busy?: boolean;
  onBack: () => void;
  onStart: (experience: Experience, goals: string[], minutes: number) => void;
}) {
  const { tx } = useLanguage();
  const [experience, setExperience] = useState<Experience>("new");
  const [goals, setGoals] = useState<string[]>([]);
  const [minutes, setMinutes] = useState(LENGTHS.includes(initialMinutes) ? initialMinutes : 25);
  const name = tx(SPORT_META[sport].name);
  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-sm text-zinc-100 mb-2">{tx("How much {name} have you done?", { name })}</h3>
        <div className="grid grid-cols-1 gap-1.5" role="radiogroup" aria-label={tx("Experience")}>
          {EXPERIENCE.map((e) => (
            <button
              key={e.id}
              role="radio"
              aria-checked={experience === e.id}
              onClick={() => setExperience(e.id)}
              className={`text-left rounded-xl border px-3 py-2 ${experience === e.id ? "border-orange-500 bg-orange-500/10" : "border-zinc-800"}`}
            >
              <span className="block text-sm text-zinc-100">{tx(e.label)}</span>
              <span className="block text-xs text-zinc-400">{tx(e.hint)}</span>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-sm text-zinc-100 mb-1">{tx("What do you want most? (up to 3)")}</h3>
        <div className="flex flex-wrap gap-1.5">
          {SPORTS[sport].skills.map((sk) => {
            const on = goals.includes(sk.key);
            return (
              <button
                key={sk.key}
                aria-pressed={on}
                onClick={() => setGoals((g) => (on ? g.filter((x) => x !== sk.key) : g.length < 3 ? [...g, sk.key] : g))}
                className={`px-3 py-1.5 rounded-full text-xs border ${on ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-300"}`}
              >
                {sk.name}
              </button>
            );
          })}
        </div>
      </section>
      <section>
        <h3 className="text-sm text-zinc-100 mb-1">{tx("Session length")}</h3>
        <div className="flex gap-1.5" role="group" aria-label={tx("Session length")}>
          {LENGTHS.map((m) => (
            <button
              key={m}
              aria-pressed={minutes === m}
              onClick={() => setMinutes(m)}
              className={`px-3 py-1.5 rounded-full text-xs border ${minutes === m ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-300"}`}
            >
              {tx("{n} min", { n: m })}
            </button>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onBack} className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200">
          {tx("Back")}
        </button>
        <button
          onClick={() => onStart(experience, goals, minutes)}
          disabled={busy}
          className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium disabled:opacity-60"
        >
          {tx("Start {name}", { name })}
        </button>
      </div>
    </div>
  );
}
