"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import XPBar from "@/components/XPBar";
import MissionList from "@/components/MissionList";
import { ensureCurrentWeekMissions } from "@/lib/missions";
import { pickFocus, FOCUS_LABEL } from "@/lib/trainingGenerator";
import { SKILL_CATEGORIES } from "@/lib/skillCategories";
import { Dumbbell, Dices, CalendarDays, Users2, Layers, Timer, ChevronRight } from "lucide-react";

const ALL_50_SKILLS = SKILL_CATEGORIES.flatMap((c) => c.skills);

export default function DashboardPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const missions = ensureCurrentWeekMissions(userDoc.missions ?? []);
  const todaysFocus = FOCUS_LABEL[pickFocus(new Date(), userDoc.equipment, userDoc.goalTracks)];
  const skillsStarted = ALL_50_SKILLS.filter((s) => userDoc.skills[s] !== "none").length;

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-5">
        <div>
          <h1 className="heading text-2xl text-zinc-100">
            Welcome back, {userDoc.displayName?.split(" ")[0] ?? "Athlete"}
          </h1>
          <p className="text-zinc-400 text-sm">{userDoc.totalSessionsCompleted} sessions logged</p>
        </div>

        {/* Hero: today's session, the primary call to action */}
        <Link
          href="/training"
          className="panel p-5 flex items-center gap-4 border-orange-500/40 hover:border-orange-500 transition-colors block"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
            <Dumbbell size={22} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Today&apos;s focus</div>
            <div className="heading text-xl text-zinc-100 truncate">{todaysFocus}</div>
            <div className="text-xs text-zinc-500">Warm-up → skill work → accessory → finisher</div>
          </div>
          <div className="shrink-0 heading text-sm bg-orange-500 text-zinc-950 px-4 py-2.5 rounded-lg">
            Start
          </div>
        </Link>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            href="/path"
            value={String(userDoc.streak)}
            suffix="🔥"
            label="day streak"
          />
          <StatTile
            href="/skills"
            value={`${skillsStarted}/50`}
            label="skills started"
          />
          <StatTile
            href="/profile"
            value={String(userDoc.totalSessionsCompleted)}
            label="sessions"
          />
        </div>

        <XPBar xp={userDoc.xp} streak={userDoc.streak} skills={userDoc.skills} mastery={userDoc.skillMastery} />

        <MissionList missions={missions} />

        {/* Quick actions grid */}
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Quick actions</div>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction href="/wheel" icon={Dices} label="Bonus wheel" />
            <QuickAction href="/plan" icon={CalendarDays} label="Plan ahead" />
            <QuickAction href="/pair" icon={Users2} label="Pair up" />
            <QuickAction href="/skills" icon={Layers} label="Skills" />
            <QuickAction href="/pomodoro" icon={Timer} label="Focus timer" />
            <QuickAction href="/path" icon={ChevronRight} label="Trophy road" />
          </div>
        </div>
      </main>
    </>
  );
}

function StatTile({ href, value, suffix, label }: { href: string; value: string; suffix?: string; label: string }) {
  return (
    <Link href={href} className="panel p-3 text-center hover:border-orange-500/50 transition-colors">
      <div className="stat-mono text-xl text-zinc-100">
        {value}
        {suffix && <span className="text-base">{suffix}</span>}
      </div>
      <div className="text-xs text-zinc-500">{label}</div>
    </Link>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Dices;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="panel p-3 flex flex-col items-center justify-center gap-1.5 text-center hover:border-orange-500/50 transition-colors"
    >
      <Icon size={20} className="text-orange-400" />
      <span className="text-xs text-zinc-300">{label}</span>
    </Link>
  );
}
