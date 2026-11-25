"use client";

import { useState } from "react";
import { Check, Lock, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateProgress } from "@/lib/store";
import { levelProgress } from "@/lib/levelPath";
import {
  SPORTS,
  SPORT_META,
  activeSportOf,
  isExtraSport,
  sportXp,
} from "@/lib/sports";
import { MASTERY_MAX } from "@/lib/sports/types";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import type { Exercise } from "@/lib/types";

// Skills screen for a non-calisthenics sport: every skill as a ladder of
// stages, with mastery towards the next one and goals you can star.
export default function SportSkills() {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const [detail, setDetail] = useState<Exercise | null>(null);
  const sport = activeSportOf(userDoc);
  if (!userDoc || !isExtraSport(sport)) return null;
  const track = userDoc.sports?.[sport];
  if (!track) return null;
  const def = SPORTS[sport];
  const lp = levelProgress(sportXp(userDoc, sport));

  const toggleGoal = async (key: string) => {
    const on = track.goals.includes(key);
    if (!on && track.goals.length >= 3) return;
    const goals = on
      ? track.goals.filter((g) => g !== key)
      : [...track.goals, key];
    await updateProgress(userDoc.uid, {
      sports: { ...userDoc.sports, [sport]: { ...track, goals } },
    }).catch(() => {});
    await refreshUserDoc();
  };

  return (
    <div className="space-y-4">
      <section className="panel p-4 flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {SPORT_META[sport].emoji}
        </span>
        <div className="flex-1">
          <p className="text-sm text-zinc-100">
            {tx(SPORT_META[sport].name)} · {tx("Level {n}", { n: lp.level })}
          </p>
          <p className="text-xs text-zinc-400">
            {tx("{n} sessions · star up to 3 skills to train them more often", {
              n: track.sessions,
            })}
          </p>
        </div>
      </section>
      {def.groups.map((g) => {
        const skills = def.skills.filter((s) => s.group === g.key);
        if (!skills.length) return null;
        return (
          <section key={g.key} aria-labelledby={`grp-${g.key}`}>
            <h2
              id={`grp-${g.key}`}
              className="heading text-base text-zinc-100 mb-2"
            >
              {tx(g.label)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map((sk) => {
                const cur = Math.min(
                  track.stage[sk.key] ?? 0,
                  sk.stages.length - 1,
                );
                const m = track.mastery[sk.key] ?? 2;
                const goal = track.goals.includes(sk.key);
                return (
                  <article
                    key={sk.key}
                    className="panel p-3"
                    data-sport-skill={sk.key}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm text-zinc-100">{sk.name}</h3>
                      <button
                        onClick={() => toggleGoal(sk.key)}
                        aria-pressed={goal}
                        aria-label={tx(
                          goal
                            ? "Remove {name} from goals"
                            : "Make {name} a goal",
                          { name: sk.name },
                        )}
                        className={`p-1.5 rounded-lg ${goal ? "text-orange-400" : "text-zinc-400 hover:text-zinc-200"}`}
                      >
                        <Star
                          size={16}
                          fill={goal ? "currentColor" : "none"}
                          aria-hidden
                        />
                      </button>
                    </div>
                    <ol className="mt-2 space-y-1">
                      {sk.stages.map((st, i) => (
                        <li
                          key={st.id}
                          className={`flex items-center gap-2 text-xs ${i === cur ? "text-orange-200" : i < cur ? "text-emerald-300" : "text-zinc-400"}`}
                        >
                          {i < cur ? (
                            <Check size={13} aria-hidden />
                          ) : i > cur ? (
                            <Lock size={12} aria-hidden />
                          ) : (
                            <span
                              className="w-[13px] h-[13px] rounded-full border-2 border-orange-400"
                              aria-hidden
                            />
                          )}
                          <span className="flex-1">{st.label}</span>
                          {i === cur && (
                            <span
                              className="flex gap-0.5 w-16"
                              aria-label={tx("Mastery {n} of {m}", {
                                n: Math.floor(m),
                                m: MASTERY_MAX,
                              })}
                            >
                              {Array.from({ length: MASTERY_MAX }, (_, k) => (
                                <span
                                  key={k}
                                  className={`h-1.5 flex-1 rounded-full ${k < Math.floor(m) ? "bg-emerald-500" : "bg-zinc-800"}`}
                                />
                              ))}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sk.stages[cur].exercises.map((e) => (
                        <button
                          key={e.name}
                          onClick={() => setDetail(e)}
                          className="text-xs px-2 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-orange-500"
                        >
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
      <ExerciseDetailModal
        exercise={detail}
        open={!!detail}
        trackLabel={tx(SPORT_META[sport].name)}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}
