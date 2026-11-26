"use client";

import Link from "next/link";
import { ChevronRight, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  SPORTS,
  SPORT_META,
  activeSportOf,
  isExtraSport,
  upNext,
} from "@/lib/sports";
import { MASTERY_MAX } from "@/lib/sports/types";

// Today, in another sport: the skills closest to their next stage.
export default function SportProgressCard() {
  const { userDoc } = useAuth();
  const { tx } = useLanguage();
  const sport = activeSportOf(userDoc);
  if (!userDoc || !isExtraSport(sport)) return null;
  const track = userDoc.sports?.[sport];
  if (!track) return null;
  const items = upNext(SPORTS[sport], track);
  return (
    <section className="panel p-4" aria-labelledby="sport-next">
      <div className="flex items-center justify-between mb-2">
        <h2
          id="sport-next"
          className="heading text-base text-zinc-100 flex items-center gap-2"
        >
          <Target size={16} className="text-orange-400" aria-hidden />{" "}
          {tx("Up next in {sport}", { sport: tx(SPORT_META[sport].name) })}
        </h2>
        <Link
          href="/skills"
          className="text-xs text-zinc-400 hover:text-orange-300 flex items-center gap-0.5"
        >
          {tx("All skills")} <ChevronRight size={14} aria-hidden />
        </Link>
      </div>
      <ul className="space-y-2">
        {items.map((x) => (
          <li
            key={x.skill.key}
            className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-3"
          >
            <p className="text-sm text-zinc-100 flex items-center gap-1.5">
              {x.skill.name}
              {x.goal && (
                <span className="text-xs px-1.5 rounded bg-orange-500/15 text-orange-300">
                  {tx("goal")}
                </span>
              )}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {x.stage.label} →{" "}
              <span className="text-orange-300">{x.next!.label}</span>
            </p>
            <div
              className="flex gap-0.5 mt-1.5 max-w-[140px]"
              role="img"
              aria-label={tx("Mastery {n} of {m}", {
                n: Math.floor(x.mastery),
                m: MASTERY_MAX,
              })}
            >
              {Array.from({ length: MASTERY_MAX }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i < Math.floor(x.mastery) ? "bg-emerald-500" : "bg-zinc-800"}`}
                />
              ))}
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="text-sm text-zinc-400">
            {tx("You've reached the last stage of every skill. Impressive.")}
          </li>
        )}
      </ul>
    </section>
  );
}
