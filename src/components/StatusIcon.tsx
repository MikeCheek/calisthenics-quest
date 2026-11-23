"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { badgeCount, statusIconHref, streakStatus } from "@/lib/streakStatus";

// Keeps the browser tab's icon and the installed app's badge in step with
// today's status: in a session, trained today, streak at risk, or nothing.
export default function StatusIcon() {
  const { userDoc } = useAuth();
  const { session, completed } = useTrainingSession();
  const [tick, setTick] = useState(0);

  // a new day can change the status without anything else changing
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!userDoc) return;
    const status = streakStatus(userDoc, { inSession: !!session && !completed });
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-status]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.dataset.status = "";
      document.head.appendChild(link);
    }
    link.href = statusIconHref(status);
    link.dataset.status = status;
    const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    const n = badgeCount(status);
    if (n && nav.setAppBadge) nav.setAppBadge(n).catch(() => {});
    else if (!n && nav.clearAppBadge) nav.clearAppBadge().catch(() => {});
  }, [userDoc, session, completed, tick]);

  return null;
}
