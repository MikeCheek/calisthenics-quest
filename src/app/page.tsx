"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LandingWheelDemo from "@/components/LandingWheelDemo";
import LandingProgressPreview from "@/components/LandingProgressPreview";
import { Bot, Trophy, Users, Bell, Layers, RefreshCw } from "lucide-react";

const FEATURES: { icon: typeof Bot; title: string; body: string }[] = [
  { icon: Layers, title: "50 tracked skills", body: "From front lever to iron cross and manna — each with its own progressions." },
  { icon: Trophy, title: "Trophy road", body: "A Clash Royale-style path where already-mastered skills raise your level immediately." },
  { icon: Bot, title: "AI coaching tips", body: "On-demand technique cues and common mistakes for any exercise." },
  { icon: Users, title: "Train with a friend", body: "Share a code and get sessions tailored to each of your levels, side by side." },
  { icon: RefreshCw, title: "Built around your gear", body: "Bar, rings, bands, or just the ground — sessions adapt to what you actually have." },
  { icon: Bell, title: "Reminders that don't nag", body: "A different fun nudge each time, plus streaks that freeze through rest days." },
];

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
    <main className="min-h-screen px-4 py-10">
      {/* Hero */}
      <div className="max-w-md mx-auto text-center mb-10">
        <div className="text-orange-400 text-4xl mb-2">▲</div>
        <h1 className="heading text-5xl text-zinc-100 mb-3">BarQuests</h1>
        <p className="text-zinc-400 mb-6">
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
      </div>

      {/* Try it now — no account needed */}
      <div className="max-w-md mx-auto mb-10">
        <LandingWheelDemo />
      </div>

      {/* What tracking looks like */}
      <div className="max-w-md mx-auto mb-10">
        <h2 className="heading text-xl text-zinc-100 mb-1">See your progress add up</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Once you sign in, every session, skill, and streak gets tracked automatically.
          Here&apos;s what that looks like — this is example data, not yours yet.
        </p>
        <LandingProgressPreview />
      </div>

      {/* Feature grid */}
      <div className="max-w-md mx-auto mb-10">
        <h2 className="heading text-xl text-zinc-100 mb-4">Why make an account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel p-4">
              <Icon size={18} className="text-orange-400 mb-2" />
              <div className="text-sm heading text-zinc-100 mb-1">{title}</div>
              <div className="text-xs text-zinc-400">{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-md mx-auto text-center">
        <button
          onClick={() => signIn()}
          className="w-full py-3 rounded-lg heading tracking-wide bg-orange-500 hover:bg-orange-400 text-zinc-950"
        >
          Sign in with Google
        </button>
        <p className="text-xs text-zinc-600 mt-3">Free. Takes about a minute to set up.</p>
      </div>
    </main>
  );
}
