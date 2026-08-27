"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user, userDoc, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && userDoc) {
      router.replace(userDoc.onboarded ? "/dashboard" : "/onboarding");
    }
  }, [loading, user, userDoc, router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-orange-400 text-4xl mb-2">▲</div>
        <h1 className="heading text-5xl text-zinc-100 mb-3">BarQuests</h1>
        <p className="text-zinc-400 mb-8">
          Tailored calisthenics training for the outdoor bars. Level up your
          front lever, planche, muscle-up and handstand — track XP, complete
          missions, and train side-by-side with a friend.
        </p>
        <button
          onClick={() => signIn()}
          className="w-full py-3 rounded-lg heading tracking-wide bg-orange-500 hover:bg-orange-400 text-zinc-950"
        >
          Sign in with Google
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 text-left">
          {[
            ["Tailored plans", "Sessions built from your exact skill stage."],
            ["XP & missions", "Every session earns XP toward levels and weekly missions."],
            ["Pair training", "Share a code and train with a friend, each at their level."],
          ].map(([t, d]) => (
            <div key={t} className="panel rounded-lg p-3">
              <div className="text-xs heading text-emerald-400 mb-1">{t}</div>
              <div className="text-xs text-zinc-400">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
