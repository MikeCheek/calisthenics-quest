"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import NotificationPrompt from "@/components/NotificationPrompt";
import HeadlineCard from "@/components/HeadlineCard";
import MissionsSummary from "@/components/MissionsSummary";
import { ensureCurrentWeekMissions } from "@/lib/missions";
import { pickFocus, FOCUS_LABEL } from "@/lib/trainingGenerator";
import { Dumbbell, CalendarDays, Users2, Layers, History } from "lucide-react";
import SaveProgressPrompt from "@/components/SaveProgressPrompt";


export default function DashboardPage() {
  const { user, userDoc, loading } = useAuth();
  const { t, tx } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">{t("common", "loading")}</main>;
  }

  const missions = ensureCurrentWeekMissions(userDoc.missions ?? []);
  const todaysFocus = FOCUS_LABEL[pickFocus(new Date(), userDoc.equipment, userDoc.goalTracks)];

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-5">
        <div>
          <h1 className="heading text-2xl text-zinc-100">
            {t("dashboard", "welcomeBack", { name: userDoc.displayName?.split(" ")[0] ?? "Athlete" })}
          </h1>
          <p className="text-zinc-400 text-sm">{t("dashboard", "sessionsLogged", { count: userDoc.totalSessionsCompleted })}</p>
        </div>

        <SaveProgressPrompt compact />

        <NotificationPrompt />

        {/* Hero: today's session, the primary call to action */}
        <Link
          href="/training"
          className="panel p-5 flex items-center gap-4 border-orange-500/40 hover:border-orange-500 transition-colors block"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
            <Dumbbell size={22} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted uppercase tracking-wide">{t("dashboard", "todaysFocus")}</div>
            <div className="heading text-xl text-zinc-100 truncate">{todaysFocus}</div>
            <div className="text-xs text-muted">{t("dashboard", "sessionFlow")}</div>
          </div>
          <div className="shrink-0 heading text-sm bg-orange-500 text-zinc-950 px-4 py-2.5 rounded-lg">
            {t("dashboard", "start")}
          </div>
        </Link>

        <HeadlineCard userDoc={userDoc} />

        <MissionsSummary missions={missions} />

        {/* Quick actions grid */}
        <div>
          <div className="text-xs uppercase tracking-wide text-muted mb-2">{t("dashboard", "quickActions")}</div>
          <div className="grid grid-cols-4 gap-2">
            <QuickAction href="/plan" icon={CalendarDays} label={tx("This week")} />
            <QuickAction href="/progress?tab=skills" icon={Layers} label={t("dashboard", "skills")} />
            <QuickAction href="/progress?tab=history" icon={History} label={tx("History")} />
            <QuickAction href="/friends" icon={Users2} label={tx("Friends")} />
          </div>
        </div>
      </main>
    </>
  );
}


function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Dumbbell;
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
