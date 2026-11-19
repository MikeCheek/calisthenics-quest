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
import { Bot, CalendarDays, ChevronRight, Dices, Sparkles } from "lucide-react";

// Coach: advice built on the athlete's own training — the AI chat, what the
// app has learned from their sessions, and the planning tools.
export default function CoachPage() {
  const { user, userDoc, loading } = useAuth();
  const { tx } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  if (loading || !userDoc) return <PageLoading />;

  const tools: { href: string; icon: typeof Bot; title: string; body: string }[] = [
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
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <div>
          <h1 className="heading text-2xl text-zinc-100">{tx("Coach")}</h1>
          <p className="text-sm text-zinc-400">{tx("Advice built on your own training.")}</p>
        </div>

        <CoachChat />

        <CoachInsightsCard userDoc={userDoc} />

        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-wide text-muted px-1">{tx("Tools")}</h2>
          {tools.map(({ href, icon: Icon, title, body }) => (
            <Link key={href} href={href} className="panel p-4 flex items-center gap-3 hover:border-zinc-600 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-orange-400" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-zinc-100">{tx(title)}</span>
                <span className="block text-xs text-muted">{tx(body)}</span>
              </span>
              <ChevronRight size={16} className="text-muted shrink-0" />
            </Link>
          ))}
        </section>
      </main>
    </>
  );
}
