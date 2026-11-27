"use client";

import { useBelowTopBar } from "@/hooks/useBelowTopBar";
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

  const top = useBelowTopBar(!!current);
  if (!current) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-[210] w-[calc(100%-2rem)] max-w-sm" style={{ top }}>
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

// The badge grid in Me. Tapping a badge opens its card right there, pointing
// at it — not a panel under the whole grid.
const POP_W = 240;
const NEXT_UP = 3;
const GAP = 8;
export function AchievementsCard() {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const [open, setOpen] = useState<Achievement | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; arrow: number; above: boolean } | null>(null);
  const anchor = useRef<HTMLButtonElement | null>(null);
  const pop = useRef<HTMLDivElement | null>(null);

  // place the card under the badge (or above, near the bottom of the screen),
  // kept inside the screen, with its arrow on the badge
  const place = () => {
    const b = anchor.current?.getBoundingClientRect();
    if (!b) return;
    const vw = window.innerWidth;
    const w = Math.min(POP_W, vw - 2 * GAP);
    const left = Math.max(GAP, Math.min(b.left + b.width / 2 - w / 2, vw - w - GAP));
    const h = pop.current?.offsetHeight ?? 120;
    const above = b.bottom + GAP + h > window.innerHeight && b.top - GAP - h > 0;
    setPos({ left, top: above ? b.top - GAP - h : b.bottom + GAP, arrow: b.left + b.width / 2 - left, above });
  };

  useEffect(() => {
    if (!open) return;
    place();
    const close = () => setOpen(null);
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!pop.current?.contains(t) && !anchor.current?.contains(t)) close();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        anchor.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
    // re-measure once the card has rendered (its height decides above/below)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!userDoc) return null;
  const isMine = (a: Achievement) => !!userDoc.achievements?.[a.id] || isEarned(a, userDoc);
  const earnedCount = ACHIEVEMENTS.filter(isMine).length;
  // what you've earned and the three closest to it; the rest on request
  const share = (a: Achievement) => {
    const [v, t] = a.progress(userDoc);
    return t > 0 ? v / t : 0;
  };
  const nextUp = ACHIEVEMENTS.filter((a) => !isMine(a)).sort((a, b) => share(b) - share(a)).slice(0, NEXT_UP);
  const shown = showAll ? ACHIEVEMENTS : [...ACHIEVEMENTS.filter(isMine), ...nextUp];
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
        {shown.map((a) => {
          const earned = !!userDoc.achievements?.[a.id] || isEarned(a, userDoc);
          return (
            <li key={a.id}>
              <button
                onClick={(e) => {
                  anchor.current = e.currentTarget;
                  setPos(null);
                  setOpen(open?.id === a.id ? null : a);
                }}
                aria-expanded={open?.id === a.id}
                aria-controls={open?.id === a.id ? "achievement-card" : undefined}
                className={`w-full rounded-xl p-2 flex flex-col items-center gap-1.5 text-center ${open?.id === a.id ? "bg-zinc-800" : "hover:bg-zinc-800/60"}`}
              >
                <Badge a={a} earned={earned} size={48} />
                <span className={`text-xs leading-tight ${earned ? "text-zinc-100" : "text-zinc-400"}`}>{tx(a.title)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {ACHIEVEMENTS.length > shown.length || showAll ? (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          aria-expanded={showAll}
          className="w-full mt-2 min-h-11 rounded-lg text-sm text-zinc-300 border border-zinc-800 hover:border-zinc-600"
        >
          {showAll ? tx("Show fewer") : tx("See all {n} achievements", { n: ACHIEVEMENTS.length })}
        </button>
      ) : null}
      {open && (
        <div
          ref={(el) => {
            pop.current = el;
          }}
          id="achievement-card"
          role="dialog"
          aria-label={tx(open.title)}
          style={{ position: "fixed", left: pos?.left ?? 0, top: pos?.top ?? 0, width: `min(${POP_W}px, calc(100vw - ${2 * GAP}px))`, visibility: pos ? "visible" : "hidden" }}
          className="z-50 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl p-3 flex items-start gap-3 animate-overlay-fade-in"
        >
          {pos && (
            <span
              aria-hidden
              style={{ left: Math.max(12, Math.min(pos.arrow, POP_W - 12)) - 6 }}
              className={`absolute w-3 h-3 rotate-45 bg-zinc-900 border-zinc-700 ${pos.above ? "-bottom-1.5 border-r border-b" : "-top-1.5 border-l border-t"}`}
            />
          )}
          <Badge a={open} earned={!!userDoc.achievements?.[open.id] || isEarned(open, userDoc)} size={44} />
          <div className="text-sm min-w-0">
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
