"use client";

import { ChevronRight } from "lucide-react";
import ExerciseDemo from "@/components/ExerciseDemo";
import { useLanguage } from "@/context/LanguageContext";
import { EXTRA_SPORTS, SPORT_META, type SportId } from "@/lib/sports";

const DEMO: Record<SportId, string> = { calisthenics: "Pull-ups", yoga: "Tree pose", pilates: "Teaser" };

// The first screen after signing in: which sport to start with.
// Calisthenics is the main track and gets the big card; the others sit below.
export default function SportPicker({ suggested, onPick }: { suggested?: SportId | null; onPick: (s: SportId) => void }) {
  const { tx } = useLanguage();
  const ring = (s: SportId) => (suggested === s ? "border-orange-500 ring-1 ring-orange-500/60" : "border-zinc-800 hover:border-zinc-600");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="heading text-2xl text-zinc-100">{tx("What do you want to train?")}</h1>
        <p className="text-sm text-zinc-400 mt-1">{tx("Start with one. You can add the others whenever you like — each keeps its own progress.")}</p>
      </div>

      <button
        onClick={() => onPick("calisthenics")}
        className={`w-full text-left rounded-2xl border bg-zinc-900 p-4 flex items-center gap-4 ${ring("calisthenics")}`}
        aria-describedby="pick-cali"
      >
        <div className="w-28 shrink-0 aspect-square">
          <ExerciseDemo exerciseName={DEMO.calisthenics} width={112} decorative className="h-full w-full [&_svg]:h-full [&_svg]:w-full" />
        </div>
        <span className="flex-1 min-w-0">
          <span className="text-xs uppercase tracking-widest text-orange-400">{tx("Main track")}</span>
          <span className="block heading text-2xl text-zinc-100">
            <span aria-hidden="true">{SPORT_META.calisthenics.emoji}</span> {tx(SPORT_META.calisthenics.name)}
          </span>
          <span id="pick-cali" className="block text-sm text-zinc-400">
            {tx("Pull-ups to front lever, planche and handstand — at the bars or at home.")}
          </span>
        </span>
        <ChevronRight size={20} className="text-zinc-400 shrink-0" aria-hidden />
      </button>

      <div className="grid grid-cols-2 gap-3">
        {EXTRA_SPORTS.map((s) => (
          <button key={s} onClick={() => onPick(s)} className={`text-left rounded-2xl border bg-zinc-900 p-3 ${ring(s)}`} aria-describedby={`pick-${s}`}>
            <div className="aspect-[4/3]">
              <ExerciseDemo exerciseName={DEMO[s]} width={140} decorative className="h-full w-full [&_svg]:h-full [&_svg]:w-full" />
            </div>
            <span className="block heading text-lg text-zinc-100 mt-1">
              <span aria-hidden="true">{SPORT_META[s].emoji}</span> {tx(SPORT_META[s].name)}
            </span>
            <span id={`pick-${s}`} className="block text-xs text-zinc-400">
              {tx(SPORT_META[s].tagline)}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-400 text-center">{tx("Your streak and XP count every sport.")}</p>
    </div>
  );
}
