"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import PageLoading from "@/components/PageLoading";
import ExerciseBrowser from "@/components/ExerciseBrowser";

export default function LibraryPage() {
  const { user, userDoc, loading } = useAuth();
  const { tx } = useLanguage();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);
  if (loading || !userDoc) return <PageLoading variant="list" />;

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="max-w-3xl lg:max-w-6xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <div>
          <h1 className="heading text-2xl text-zinc-100">{tx("Exercise library")}</h1>
          <p className="text-sm text-zinc-400">{tx("Every exercise in the app — how to do it, what it needs, and where it fits. Do one right now, or build a session.")}</p>
        </div>
        <Link href="/build" className="panel p-3 flex items-center gap-3 hover:border-orange-500/60">
          <ListPlus size={20} className="text-orange-400" />
          <span className="flex-1 text-sm text-zinc-100">{tx("Build a session of your own")}</span>
        </Link>
        <ExerciseBrowser />
      </main>
    </>
  );
}
