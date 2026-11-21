"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";

// The watcher (and the verification code it needs) loads only once someone
// is signed in, so it isn't part of the public pages' first load.
// a failed load (offline) just means no badges this time, never a crash
const Watcher = dynamic(
  () => import("./Achievements").then((m) => m.AchievementWatcher).catch(() => () => null),
  { ssr: false }
);

export default function AchievementWatcherLazy() {
  const { userDoc } = useAuth();
  return userDoc?.onboarded ? <Watcher /> : null;
}
