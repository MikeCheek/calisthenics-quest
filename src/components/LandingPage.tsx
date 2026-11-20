"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LandingWheelDemo from "@/components/LandingWheelDemo";
import LandingProgressPreview from "@/components/LandingProgressPreview";
import { Bot, Trophy, Users, Bell, Layers, RefreshCw } from "lucide-react";

const FEATURES: { icon: typeof Bot; title: string; body: string }[] = [
  { icon: Layers, title: "50 tracked skills", body: "From front lever to iron cross and manna — each with its own progressions." },
  { icon: Trophy, title: "Trophy road", body: "A Clash Royale-style path you climb by training — harder work and proven skills earn more XP." },
  { icon: Bot, title: "AI coaching tips", body: "On-demand technique cues and common mistakes for any exercise." },
  { icon: Users, title: "Train with a friend", body: "Share a code and get sessions tailored to each of your levels, side by side." },
  { icon: RefreshCw, title: "Built around your gear", body: "Bar, rings, bands, or just the ground — sessions adapt to what you actually have." },
  { icon: Bell, title: "Reminders that don't nag", body: "A different fun nudge each time, plus streaks that freeze through rest days." },
];

export default function LandingPage() {
  const { user, userDoc, loading, signIn, startAsGuest, setupFailures } = useAuth();
  const [startingGuest, setStartingGuest] = useState(false);
  const { tx } = useLanguage();
  const tryAsGuest = async () => {
    setStartingGuest(true);
    if (!(await startAsGuest())) setStartingGuest(false);
    // on success the redirect below sends the new guest to onboarding
  };
  const router = useRouter();

  // the account was created but its data couldn't be saved: let them retry
  useEffect(() => {
    if (setupFailures > 0) setStartingGuest(false);
  }, [setupFailures]);

  useEffect(() => {
    if (loading) return;
    if (user && userDoc) {
      router.replace(userDoc.onboarded ? "/dashboard" : "/onboarding");
    }
  }, [loading, user, userDoc, router]);

  return (
    <main id="main" tabIndex={-1} className="min-h-screen px-4 py-10">
      {/* Hero */}
      <div className="max-w-md mx-auto text-center mb-10">
        <div className="text-orange-400 text-4xl mb-2" aria-hidden="true">▲</div>
        <h1 className="heading text-5xl text-zinc-100 mb-1">BarQuests</h1>
        <p className="heading text-lg text-orange-300 mb-3">{tx("Your calisthenics journey")}</p>
        <p className="text-zinc-400 mb-6">
          {tx("Tailored calisthenics training for the outdoor bars. Level up your front lever, planche, muscle-up and handstand — track XP, complete missions, and train side-by-side with a friend.")}
        </p>
        <button
          onClick={() => signIn()}
          className="w-full py-3 rounded-lg heading tracking-wide bg-orange-500 hover:bg-orange-400 text-zinc-950"
        >
          {tx("Sign in with Google")}
        </button>
        <button
          onClick={tryAsGuest}
          disabled={startingGuest}
          className="w-full mt-2 py-3 rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500 text-sm disabled:opacity-60"
        >
          {startingGuest ? tx("Starting…") : tx("Try it first — no account needed")}
        </button>
        <p className="text-xs text-muted mt-2">
          {tx("Take the assessment and train as a guest. Save your progress with Google whenever you like.")}
        </p>
      </div>

      {/* Try it now — no account needed */}
      <div className="max-w-md mx-auto mb-10">
        <LandingWheelDemo />
      </div>

      {/* What tracking looks like */}
      <div className="max-w-md mx-auto mb-10">
        <h2 className="heading text-xl text-zinc-100 mb-1">{tx("See your progress add up")}</h2>
        <p className="text-sm text-zinc-400 mb-4">
          {tx("Once you sign in, every session, skill, and streak gets tracked automatically. Here's what that looks like — this is example data, not yours yet.")}
        </p>
        <LandingProgressPreview />
      </div>

      {/* Feature grid */}
      <div className="max-w-md mx-auto mb-10">
        <h2 className="heading text-xl text-zinc-100 mb-4">{tx("Why make an account")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel p-4">
              <Icon size={18} className="text-orange-400 mb-2" />
              <h3 className="text-sm heading text-zinc-100 mb-1">{tx(title)}</h3>
              <div className="text-xs text-zinc-400">{tx(body)}</div>
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
          {tx("Sign in with Google")}
        </button>
        <p className="text-xs text-muted mt-3">{tx("Free. Takes about a minute to set up.")}</p>
      </div>

      <footer className="max-w-md mx-auto text-center mt-8">
        <Link href="/about" className="text-xs text-muted hover:text-zinc-400">
          {tx("About & privacy")}
        </Link>
      </footer>
    </main>
  );
}
