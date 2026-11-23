"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { levelProgress } from "@/lib/levelPath";
import { CalendarCheck, Layers, Bot, Users, User, BadgeCheck, LayoutGrid } from "lucide-react";
import Modal from "@/components/Modal";
import FeatureMenu from "@/components/nav/FeatureMenu";
import { claimCounts, syncClaims } from "@/lib/verification";

export default function Nav() {
  const { userDoc } = useAuth();
  const { t, tx } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = userDoc ? levelProgress(userDoc.xp) : null;
  const claims = userDoc ? claimCounts(syncClaims(userDoc.claims, userDoc.skills)) : { verified: 0, total: 0 };

  // Each tab owns a group of routes, so it stays highlighted on its
  // sub-pages (the full session and the week plan belong to Today, etc.).
  const TABS = [
    { href: "/dashboard", label: t("nav", "home"), icon: CalendarCheck, routes: ["/dashboard", "/training", "/plan", "/library", "/build"] },
    { href: "/skills", label: t("nav", "skills"), icon: Layers, routes: ["/skills", "/progress", "/path", "/compare"] },
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
          <div className="flex items-center gap-1">
            {/* every feature, one tap away (on large screens it's the sidebar) */}
            {userDoc && (
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden -ml-2 p-2 rounded-lg text-zinc-300 hover:text-orange-400"
                aria-label={tx("All features")}
                aria-haspopup="dialog"
              >
                <LayoutGrid size={20} aria-hidden />
              </button>
            )}
            <Link href="/dashboard" className="heading text-base text-zinc-100 flex items-center gap-1.5 lg:hidden">
              <span className="text-orange-400" aria-hidden="true">▲</span> BarQuests
            </Link>
          </div>
          {/* sign-out lives in Profile → Account; the header just shows where you stand */}
          {progress && (
            <Link
              href="/skills"
              className="text-xs text-zinc-400 stat-mono hover:text-orange-400 flex items-center gap-2"
              aria-label={
                tx("Level {n}", { n: progress.level }) +
                (claims.total > 0 ? ` · ${tx("{a} of {b} skills verified", { a: claims.verified, b: claims.total })}` : "")
              }
            >
              <span>LV {progress.level}</span>
              {claims.total > 0 && (
                <span className="flex items-center gap-0.5 text-emerald-400/90">
                  <BadgeCheck size={12} aria-hidden="true" /> {claims.verified}/{claims.total}
                </span>
              )}
            </Link>
          )}
        </div>
        {/* desktop-only secondary nav row, since bottom tabs are the mobile-first primary nav */}
        <nav className="hidden sm:flex lg:hidden max-w-5xl mx-auto px-4 gap-1 pb-2" aria-label={tx("Main menu")}>
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={isActive(t.routes) ? "page" : undefined}
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

      {/* large screens: a sidebar with the five sections and every feature */}
      {userDoc && (
        <aside id="app-sidebar" className="hidden lg:flex fixed inset-y-0 left-0 z-20 w-72 flex-col border-r border-zinc-800 bg-zinc-950">
          <Link href="/dashboard" className="heading text-lg text-zinc-100 flex items-center gap-1.5 px-5 py-4">
            <span className="text-orange-400" aria-hidden="true">▲</span> BarQuests
          </Link>
          <nav aria-label={tx("Main menu")} className="px-3">
            <ul className="space-y-0.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = isActive(t.routes);
                return (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                        active ? "bg-orange-500/15 text-orange-100 font-medium" : "text-zinc-300 hover:bg-zinc-800/70"
                      }`}
                    >
                      <Icon size={18} className={active ? "text-orange-400" : "text-zinc-400"} aria-hidden="true" /> {t.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-4 border-t border-zinc-800 px-3 pt-4 pb-6 overflow-y-auto flex-1" aria-label={tx("All features")} role="region">
            <FeatureMenu compact />
          </div>
        </aside>
      )}

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title={tx("All features")}>
        <FeatureMenu onNavigate={() => setMenuOpen(false)} />
      </Modal>

      {/* fixed bottom tab bar — primary navigation on phones */}
      <nav aria-label={tx("Main menu")} className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 safe-bottom">
        <div className="flex">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = isActive(t.routes);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                  active ? "text-orange-400" : "text-muted"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
