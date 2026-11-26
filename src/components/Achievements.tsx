"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Crown, Dumbbell, Flame, Lock, Moon, Star, Sunrise, TrendingUp, Trophy, Users, X, type LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { updateProgress } from "@/lib/store";
import { ACHIEVEMENTS, achievementById, isEarned, newlyEarned, type Achievement, type BadgeIcon, type Tier } from "@/lib/achievements";

const ICONS: Record<BadgeIcon, LucideIcon> = {
  dumbbell: Dumbbell,
  flame: Flame,
  star: Star,
  check: Check,
  trophy: Trophy,
  trending: TrendingUp,
  crown: Crown,
  sunrise: Sunrise,
  moon: Moon,
  users: Users,
};

const TIER: Record<Tier, { ring: string; bg: string; icon: string; label: string }> = {
  bronze: { ring: "border-amber-700", bg: "bg-amber-800/25", icon: "text-amber-500", label: "Bronze" },
  silver: { ring: "border-zinc-300", bg: "bg-zinc-300/15", icon: "text-zinc-200", label: "Silver" },
  gold: { ring: "border-yellow-400", bg: "bg-yellow-400/20", icon: "text-yellow-300", label: "Gold" },
};

export function Badge({ a, earned, size = 56 }: { a: Achievement; earned: boolean; size?: number }) {
  const Icon = ICONS[a.icon];
  const t = TIER[a.tier];
  return (
    <span
      className={`rounded-full border-4 flex items-center justify-center shrink-0 ${earned ? `${t.ring} ${t.bg}` : "border-zinc-700 bg-zinc-800/60"}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {earned ? <Icon size={size * 0.42} className={t.icon} /> : <Lock size={size * 0.34} className="text-zinc-400" />}
    </span>
  );
}

// Watches the profile and saves achievements as they're earned, with a
// card for each new one. The first time it runs for an account, everything
// already earned is saved quietly, with a single note instead.
export function AchievementWatcher() {
  const { userDoc } = useAuth();
  const { tx } = useLanguage();
  const toast = useToast();
  const handled = useRef(new Set<string>());
  const [queue, setQueue] = useState<string[]>([]);

  useEffect(() => {
    if (!userDoc?.onboarded) return;
    const fresh = newlyEarned(userDoc).filter((id) => !handled.current.has(id));
    if (!fresh.length) return;
    fresh.forEach((id) => handled.current.add(id));
    const now = new Date().toISOString();
    const saved = { ...(userDoc.achievements ?? {}), ...Object.fromEntries(fresh.map((id) => [id, now])) };
    updateProgress(userDoc.uid, { achievements: saved }).catch(() => fresh.forEach((id) => handled.current.delete(id)));
    if (!userDoc.achievements) {
      toast.success(fresh.length === 1 ? tx("You've already earned an achievement — see it in Me.") : tx("You've already earned {n} achievements — see them in Me.", { n: fresh.length }));
    } else {
      setQueue((q) => [...q, ...fresh]);
    }
  }, [userDoc, toast, tx]);

  const current = queue[0] ? achievementById(queue[0]) : undefined;
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 6500);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-[210] w-[calc(100%-2rem)] max-w-sm" style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}>
      <section role="status" aria-label={tx("Achievement unlocked")} className="panel border border-yellow-400/60 shadow-2xl p-4 animate-slide-down-in">
        <div className="flex items-center gap-3">
          <span className="animate-pop-in">
            <Badge a={current} earned size={60} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-yellow-300">{tx("Achievement unlocked")}</p>
            <p className="heading text-lg text-zinc-100 leading-tight">{tx(current.title)}</p>
            <p className="text-sm text-zinc-400">{tx(current.description)}</p>
          </div>
          <button onClick={() => setQueue((q) => q.slice(1))} className="p-2 -m-1 text-zinc-400 hover:text-zinc-100 self-start" aria-label={tx("Close")}>
            <X size={16} />
          </button>
        </div>
        <Link href="/profile#achievements" onClick={() => setQueue((q) => q.slice(1))} className="block mt-3 text-sm text-yellow-200 underline underline-offset-2">
          {tx("See all achievements")}
        </Link>
      </section>
    </div>
  );
}

// The badge grid in Me
export function AchievementsCard() {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const [open, setOpen] = useState<Achievement | null>(null);
  if (!userDoc) return null;
  const earnedCount = ACHIEVEMENTS.filter((a) => userDoc.achievements?.[a.id] || isEarned(a, userDoc)).length;
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section id="achievements" className="panel p-4 scroll-mt-20" aria-labelledby="ach-title">
      <div className="flex items-baseline justify-between mb-3">
        <h2 id="ach-title" className="heading text-base text-zinc-100 flex items-center gap-2">
          <Trophy size={16} className="text-yellow-300" /> {tx("Achievements")}
        </h2>
        <span className="text-xs text-zinc-400">{tx("{a} of {b}", { a: earnedCount, b: ACHIEVEMENTS.length })}</span>
      </div>
      <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const earned = !!userDoc.achievements?.[a.id] || isEarned(a, userDoc);
          return (
            <li key={a.id}>
              <button
                onClick={() => setOpen(open?.id === a.id ? null : a)}
                aria-expanded={open?.id === a.id}
                className={`w-full rounded-xl p-2 flex flex-col items-center gap-1.5 text-center ${open?.id === a.id ? "bg-zinc-800" : "hover:bg-zinc-800/60"}`}
              >
                <Badge a={a} earned={earned} size={48} />
                <span className={`text-xs leading-tight ${earned ? "text-zinc-100" : "text-zinc-400"}`}>{tx(a.title)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {open && (
        <div className="mt-3 rounded-xl bg-zinc-950/50 p-3 flex items-center gap-3" aria-live="polite">
          <Badge a={open} earned={!!userDoc.achievements?.[open.id] || isEarned(open, userDoc)} size={44} />
          <div className="text-sm">
            <p className="text-zinc-100 font-medium">
              {tx(open.title)} <span className="text-xs text-zinc-400">· {tx(TIER[open.tier].label)}</span>
            </p>
            <p className="text-zinc-400">{tx(open.description)}</p>
            <p className="text-xs mt-0.5 text-zinc-300">
              {userDoc.achievements?.[open.id]
                ? tx("Earned {d}", { d: fmt(userDoc.achievements[open.id]) })
                : (() => {
                    const [v, t] = open.progress(userDoc);
                    return t > 1 ? tx("{a} of {b} so far", { a: v, b: t }) : tx("Not yet");
                  })()}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
