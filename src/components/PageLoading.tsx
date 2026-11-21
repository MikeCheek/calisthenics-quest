"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ExerciseDemo from "./ExerciseDemo";
import Nav from "./Nav";
import { LOADING_TIPS } from "@/lib/loadingTips";

// While a page waits for sign-in or its data.
// - Nobody known yet (first visit on this device, signing in): the branded
//   screen — the logo, the stick figure doing pull-ups, what's happening
//   ("Signing in…", "Loading your training…") and a rotating tip. It only
//   appears after a short moment, so fast loads don't flash it.
// - The account is known and only this page's data is on its way: the
//   page's own layout as grey outlines (see Skeleton.tsx), so nothing jumps.

export type LoadingVariant = "splash" | "today" | "list" | "profile";

export default function PageLoading({ variant = "splash" }: { variant?: LoadingVariant }) {
  const { user, userDoc, loading } = useAuth();
  if (variant !== "splash" && user) return <PageSkeleton variant={variant} />;
  return <Splash status={loading ? "signin" : user && !userDoc ? "data" : "almost"} />;
}

function Splash({ status }: { status: "signin" | "data" | "almost" }) {
  const { tx } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 250);
    setTip(Math.floor(Math.random() * LOADING_TIPS.length));
    const next = setInterval(() => setTip((t) => (t + 1) % LOADING_TIPS.length), 4500);
    return () => {
      clearTimeout(show);
      clearInterval(next);
    };
  }, []);

  const line = status === "signin" ? tx("Signing in…") : status === "data" ? tx("Loading your training…") : tx("Almost there…");

  return (
    <main
      id="main"
      tabIndex={-1}
      aria-busy="true"
      className={`min-h-screen flex flex-col items-center justify-center px-6 text-center transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-orange-400 text-3xl" aria-hidden="true">
          ▲
        </span>
        <span className="heading text-3xl text-zinc-100">BarQuests</span>
      </div>
      <ExerciseDemo exerciseName="Pull-ups" width={150} decorative />
      <p className="mt-6 text-base text-zinc-200 flex items-center gap-2" role="status">
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" aria-hidden="true" />
        {line}
      </p>
      <div className="mt-2 w-40 h-1 rounded-full bg-zinc-800 overflow-hidden" aria-hidden="true">
        <div className="h-full w-1/3 rounded-full bg-orange-500 loading-bar" />
      </div>
      <p key={tip} className="mt-8 max-w-xs text-sm text-zinc-400 animate-overlay-fade-in">
        <span className="text-orange-300">{tx("Tip")}:</span> {tx(LOADING_TIPS[tip])}
      </p>
    </main>
  );
}

function PageSkeleton({ variant }: { variant: Exclude<LoadingVariant, "splash"> }) {
  const { tx } = useLanguage();
  return (
    <>
    <Nav />
    <main id="main" tabIndex={-1} aria-busy="true" className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
      <span className="sr-only" role="status">
        {tx("Loading…")}
      </span>
      {variant === "today" && (
        <>
          <Bone className="h-4 w-28" />
          <Bone className="h-8 w-40" />
          <div className="panel p-5 space-y-3">
            <Bone className="h-3 w-24" />
            <Bone className="h-7 w-44" />
            <Bone className="h-3 w-32" />
            {[0, 1, 2, 3].map((i) => (
              <Bone key={i} className="h-4 w-full" />
            ))}
            <Bone className="h-12 w-full rounded-xl" />
          </div>
          <div className="panel p-4 space-y-3">
            <Bone className="h-4 w-36" />
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }, (_, i) => (
                <Bone key={i} className="h-9 w-9 rounded-full mx-auto" />
              ))}
            </div>
          </div>
        </>
      )}
      {variant === "list" && (
        <>
          <Bone className="h-8 w-36" />
          {[0, 1, 2].map((k) => (
            <div key={k} className="panel p-4 space-y-3">
              <Bone className="h-5 w-40" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-5/6" />
              <Bone className="h-4 w-2/3" />
            </div>
          ))}
        </>
      )}
      {variant === "profile" && (
        <>
          <div className="panel p-4 flex items-center gap-3">
            <Bone className="h-14 w-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Bone className="h-5 w-32" />
              <Bone className="h-3 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Bone key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <div className="panel p-4 space-y-3">
            <Bone className="h-5 w-28" />
            <Bone className="h-24 w-full" />
          </div>
        </>
      )}
    </main>
    </>
  );
}

// one grey shape; shimmers unless reduced motion is on
export function Bone({ className = "" }: { className?: string }) {
  const round = /\brounded-/.test(className) ? "" : "rounded-lg";
  return <span className={`block ${round} bg-zinc-800/80 skeleton-shimmer ${className}`} aria-hidden="true" />;
}
