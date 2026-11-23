"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, Award, BadgeCheck, Bell, BookOpen, CalendarDays, Dices, Dumbbell, Flag, GitCompareArrows, Globe, Handshake, History,
  Info, Layers, Lightbulb, ListPlus, MapPin, Medal, MessageCircle, Play, Ruler, Scale, Search, ShieldCheck, Sigma, Target,
  TrendingUp, Trophy, Users, Vibrate, type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ALL_FEATURES, URL_EVENT, announceUrlChange, isCurrent, searchFeatures, type FeatureIcon } from "@/lib/featureMap";

export const FEATURE_ICONS: Record<FeatureIcon, LucideIcon> = {
  play: Play, calendar: CalendarDays, book: BookOpen, list: ListPlus, map: MapPin, dice: Dices,
  layers: Layers, target: Target, badge: BadgeCheck, trophy: Trophy, compare: GitCompareArrows, award: Award, scale: Scale, sigma: Sigma,
  history: History, trend: TrendingUp, chat: MessageCircle, bulb: Lightbulb, users: Users, activity: Activity, medal: Medal, flag: Flag,
  handshake: Handshake, ruler: Ruler, dumbbell: Dumbbell, bell: Bell, globe: Globe, vibrate: Vibrate, shield: ShieldCheck, info: Info,
};

// Every feature, grouped, with a search box. Used by the desktop sidebar
// and the phone's "All features" sheet.
export default function FeatureMenu({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const { tx } = useLanguage();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const groups = useMemo(() => searchFeatures(q, tx), [q, tx]);
  // where we are, kept fresh when a ?tab or #section changes on the same page
  const [where, setWhere] = useState({ search: "", hash: "" });
  useEffect(() => {
    const read = () => setWhere({ search: window.location.search, hash: window.location.hash });
    read();
    window.addEventListener(URL_EVENT, read);
    window.addEventListener("hashchange", read);
    window.addEventListener("popstate", read);
    return () => {
      window.removeEventListener(URL_EVENT, read);
      window.removeEventListener("hashchange", read);
      window.removeEventListener("popstate", read);
    };
  }, [pathname]);

  return (
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">{tx("Search features")}</span>
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tx("Search: weight, parks, friends…")}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-700 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-400"
        />
      </label>
      {groups.length === 0 && <p className="text-sm text-zinc-400 px-1">{tx("Nothing matches — try another word.")}</p>}
      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`fm-${g.id}`}>
          <h3 id={`fm-${g.id}`} className="text-xs uppercase tracking-wide text-zinc-400 px-1 mb-1">
            {tx(g.label)}
          </h3>
          <ul className={compact ? "space-y-0.5" : "grid grid-cols-1 sm:grid-cols-2 gap-1.5"}>
            {g.features.map((f) => {
              const Icon = FEATURE_ICONS[f.icon];
              const current = isCurrent(f, pathname, where.search, where.hash, ALL_FEATURES);
              return (
                <li key={f.id}>
                  <Link
                    href={f.href}
                    onClick={() => {
                      announceUrlChange();
                      onNavigate?.();
                    }}
                    aria-current={current ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-2.5 ${compact ? "py-1.5" : "py-2.5 border border-zinc-800"} transition-colors ${
                      current ? "bg-orange-500/10 text-orange-100" : "text-zinc-200 hover:bg-zinc-800/70"
                    }`}
                  >
                    <Icon size={compact ? 16 : 18} className={current ? "text-orange-400 shrink-0" : "text-orange-400/80 shrink-0"} aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm truncate">{tx(f.label)}</span>
                      {!compact && <span className="block text-xs text-zinc-400 truncate">{tx(f.hint)}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
