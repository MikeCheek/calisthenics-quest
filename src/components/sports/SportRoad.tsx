"use client";

import { Check, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { SPORTS } from "@/lib/sports";
import { sportRoad } from "@/lib/sports/extras";
import type { ExtraSport } from "@/lib/sports/types";

// The road in yoga or Pilates: every stage of every skill, tier by tier,
// with what you've reached — the sport's trophy road.
export default function SportRoad({ sport }: { sport: ExtraSport }) {
  const { userDoc } = useAuth();
  const { tx } = useLanguage();
  const track = userDoc?.sports?.[sport];
  if (!track) return null;
  const road = sportRoad(SPORTS[sport], track);
  const all = road.flatMap((t) => t.nodes);
  return (
    <details className="panel p-4 group" id="road">
      <summary className="cursor-pointer list-none flex items-center justify-between gap-2">
        <span>
          <span className="heading text-base text-zinc-100 block">{tx("Your road")}</span>
          <span className="text-xs text-zinc-400">{tx("{a} of {b} reached", { a: all.filter((n) => n.reached).length, b: all.length })}</span>
        </span>
        <span className="text-xs text-orange-300 group-open:hidden">▾</span>
      </summary>
      <p className="text-xs text-zinc-400 mt-2 mb-3">{tx("Every stage of every skill, and how far you've come.")}</p>
      <ol className="space-y-3">
        {road.map((t) => (
          <li key={t.tier}>
            <h3 className="text-xs uppercase tracking-wide text-zinc-400 mb-1">{tx("Stage {n}", { n: t.tier + 1 })}</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {t.nodes.map((n) => (
                <li
                  key={n.skill}
                  className={`text-xs rounded-lg px-2.5 py-1.5 flex items-center gap-2 border ${n.current ? "border-orange-500 bg-orange-500/10 text-orange-100" : n.reached ? "border-emerald-700/50 text-emerald-200" : "border-zinc-800 text-zinc-400"}`}
                >
                  {n.reached ? <Check size={13} aria-hidden /> : <Lock size={12} aria-hidden />}
                  <span className="flex-1 min-w-0 truncate">
                    {n.skillName} · {n.label}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </details>
  );
}
