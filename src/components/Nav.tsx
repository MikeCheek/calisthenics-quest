"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { rankTitle } from "@/lib/xp";
import { effectiveXpProgress } from "@/lib/levelPath";
import { Home, Dumbbell, Users, User, Layers, LogOut } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/training", label: "Train", icon: Dumbbell },
  { href: "/skills", label: "Skills", icon: Layers },
  { href: "/pair", label: "Pair", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Nav() {
  const { userDoc, signOut } = useAuth();
  const pathname = usePathname();
  const progress = userDoc ? effectiveXpProgress(userDoc.xp, userDoc.skills, userDoc.skillMastery) : null;

  return (
    <>
      {/* slim top bar — identity + quick level glance, not a primary nav on mobile */}
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="heading text-base text-zinc-100 flex items-center gap-1.5">
            <span className="text-orange-400">▲</span> BarQuests
          </Link>
          <div className="flex items-center gap-3">
            {progress && (
              <Link href="/path" className="text-xs text-zinc-400 stat-mono hover:text-orange-400">
                LV {progress.level} · {rankTitle(progress.level)}
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="p-1.5 text-zinc-500 hover:text-zinc-200"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        {/* desktop-only secondary nav row, since bottom tabs are the mobile-first primary nav */}
        <nav className="hidden sm:flex max-w-5xl mx-auto px-4 gap-1 pb-2">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                pathname === t.href
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
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                  active ? "text-orange-400" : "text-zinc-500"
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
