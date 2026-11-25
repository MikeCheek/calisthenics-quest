"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import PageLoading from "@/components/PageLoading";
import CoachInsightsCard from "@/components/CoachInsightsCard";
import CoachChat from "@/components/CoachChat";
import { useTuning } from "@/hooks/useTuning";
import { Bot, CalendarDays, ChevronRight, Dices, Sparkles } from "lucide-react";

// Coach: advice built on the athlete's own training — the AI chat, what the
// app has learned from their sessions, and the planning tools.
export default function CoachPage() {
  const { user, userDoc, loading } = useAuth();
  const { tx } = useLanguage();
  const router = useRouter();
  const { featureAiCoach } = useTuning(); // AI chat can be switched off from Remote Config

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) return <PageLoading variant="list" />;

  const tools: {
    href: string;
    icon: typeof Bot;
    title: string;
    body: string;
  }[] = [
    {
      href: "/training",
      icon: Sparkles,
      title: "Review today's session",
      body: "The AI checks today's session against your level and suggests changes you can apply.",
    },
    {
      href: "/plan",
      icon: CalendarDays,
      title: "Plan your week",
      body: "Lay out the sessions ahead, with optional AI coach notes.",
    },
    {
      href: "/wheel",
      icon: Dices,
      title: "Bonus wheel",
      body: "Spin for one extra exercise and bonus XP.",
    },
  ];

  return (
    <>
      <Nav />
      <main
        id="main"
        tabIndex={-1}
        className="max-w-3xl lg:max-w-6xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4"
      >
        <div>
          <h1 className="heading text-2xl text-zinc-100">{tx("Coach")}</h1>
          <p className="text-sm text-zinc-400">
            {tx("Advice built on your own training.")}
          </p>
        </div>

        {/* wide screens: the chat beside what the coach has learned */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
          {featureAiCoach && (
            <div id="chat" className="lg:col-span-7">
              <CoachChat />
            </div>
          )}
          <div
            id="insights"
            className={featureAiCoach ? "lg:col-span-5" : "lg:col-span-12"}
          >
            <CoachInsightsCard userDoc={userDoc} />
          </div>
        </div>

        <section>
          <h2 className="text-xs uppercase tracking-wide text-muted px-1 mb-2">
            {tx("Tools")}
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(({ href, icon: Icon, title, body }) => (
              <Link
                key={href}
                href={href}
                className="panel p-4 flex items-center gap-3 hover:border-zinc-600 transition-colors"
              >
                <span className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-orange-400" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-zinc-100">
                    {tx(title)}
                  </span>
                  <span className="block text-xs text-muted">{tx(body)}</span>
                </span>
                <ChevronRight size={16} className="text-muted shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
