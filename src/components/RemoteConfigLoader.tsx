"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { RemoteConfig } from "firebase/remote-config";
import { firebaseApp } from "@/lib/firebase";
import { DEMO_MODE } from "@/lib/demoMode/flag";
import { applyTuning, REMOTE_PARAMS } from "@/lib/tuning";

const FETCH_EVERY_MS = 12 * 60 * 60 * 1000;

// Loads tuning values from Firebase Remote Config (see lib/tuning.ts): the
// last activated values right away, then fresh ones at most every 12 h.
// Parameters that aren't set in the console simply keep their defaults.
// The public pages (landing, About) don't use any tuned value: Remote Config
// is loaded once the visitor reaches the app, and only then.
const PUBLIC = new Set(["/", "/it", "/about"]);

export default function RemoteConfigLoader() {
  const pathname = usePathname();
  const inApp = !PUBLIC.has(pathname);
  useEffect(() => {
    if (!inApp || DEMO_MODE || process.env.NEXT_PUBLIC_REMOTE_CONFIG === "off") return;
    let cancelled = false;
    const apply = (rc: RemoteConfig, getAll: typeof import("firebase/remote-config").getAll) => {
      const all = getAll(rc);
      const raw: Record<string, string> = {};
      for (const { param } of Object.values(REMOTE_PARAMS)) {
        const v = all[param];
        if (v && v.getSource() === "remote") raw[param] = v.asString();
      }
      const rejected = applyTuning(raw);
      if (rejected.length) console.warn("[remote-config] ignored invalid values:", rejected.join(", "));
    };
    (async () => {
      try {
        const { getRemoteConfig, ensureInitialized, fetchAndActivate, getAll } = await import("firebase/remote-config");
        const rc = getRemoteConfig(firebaseApp);
        rc.settings.minimumFetchIntervalMillis = FETCH_EVERY_MS;
        await ensureInitialized(rc);
        if (cancelled) return;
        apply(rc, getAll);
        if (await fetchAndActivate(rc)) apply(rc, getAll);
      } catch {
        // offline or not set up: defaults stay in place
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inApp]);
  return null;
}
