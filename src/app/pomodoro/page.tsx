"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import PomodoroTimer from "@/components/PomodoroTimer";

export default function PomodoroPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  return (
    <>
      <Nav />
      <main className="max-w-md mx-auto px-4 py-6 pb-24 sm:pb-6">
        <h1 className="heading text-3xl text-zinc-100 mb-4">Focus Timer</h1>
        <p className="text-zinc-400 text-sm mb-4">
          Use work/rest intervals between skill attempts, or as a plain pomodoro for warm-up and mobility blocks.
        </p>
        <PomodoroTimer />
      </main>
    </>
  );
}
