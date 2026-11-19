"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { effectiveXpProgress } from "@/lib/levelPath";
import { CalendarCheck, Layers, Bot, Users, User, BadgeCheck } from "lucide-react";
import { claimCounts, syncClaims } from "@/lib/verification";

export default function Nav() {
  const { userDoc } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const progress = userDoc ? effectiveXpProgress(userDoc.xp, userDoc.skills, userDoc.skillMastery) : null;
  const claims = userDoc ? claimCounts(syncClaims(userDoc.claims, userDoc.skills)) : { verified: 0, total: 0 };

  // Each tab owns a group of routes, so it stays highlighted on its
  // sub-pages (the full session and the week plan belong to Today, etc.).
  const TABS = [
    { href: "/dashboard", label: t("nav", "home"), icon: CalendarCheck, routes: ["/dashboard", "/training", "/plan"] },
    { href: "/skills", label: t("nav", "skills"), icon: Layers, routes: ["/skills", "/progress", "/path"] },
    { href: "/coach", label: t("nav", "coach"), icon: Bot, routes: ["/coach", "/wheel"] },
    { href: "/friends", label: t("nav", "friends"), icon: Users, routes: ["/friends", "/friend/", "/pair"] },
    { href: "/profile", label: t("nav", "profile"), icon: User, routes: ["/profile"] },
  ];
  const isActive = (routes: string[]) => routes.some((r) => pathname === r || (r.endsWith("/") ? pathname.startsWith(r) : pathname.startsWith(r + "/")));

  return (
    <>
      {/* slim top bar — identity + quick level glance, not a primary nav on mobile */}
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="heading text-base text-zinc-100 flex items-center gap-1.5">
            <span className="text-orange-400">▲</span> BarQuests
          </Link>
          {/* sign-out lives in Profile → Account; the header just shows where you stand */}
          {progress && (
            <Link href="/skills" className="text-xs text-zinc-400 stat-mono hover:text-orange-400 flex items-center gap-2">
              <span>LV {progress.level}</span>
              {claims.total > 0 && (
                <span className="flex items-center gap-0.5 text-emerald-400/90">
                  <BadgeCheck size={12} /> {claims.verified}/{claims.total}
                </span>
              )}
            </Link>
          )}
        </div>
        {/* desktop-only secondary nav row, since bottom tabs are the mobile-first primary nav */}
        <nav className="hidden sm:flex max-w-5xl mx-auto px-4 gap-1 pb-2">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                isActive(t.routes)
                  ? "border-orange-500 text-zinc-100 bg-orange-600/10"
                  : "border-transparent text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* fixed bottom tab bar — primary navigation on phones */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 safe-bottom">
        <div className="flex">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = isActive(t.routes);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                  active ? "text-orange-400" : "text-muted"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
