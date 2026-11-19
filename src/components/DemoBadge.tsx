"use client";

import { DEMO_MODE } from "@/lib/demoMode/flag";

// Always visible in demo mode, so example data is never mistaken for real.
export default function DemoBadge() {
  if (!DEMO_MODE) return null;
  return (
    // a slim tab on the left edge, clear of every screen's header and controls
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] pointer-events-none px-1 py-2 rounded-r-md bg-sky-500/90 text-zinc-950 text-xs font-bold tracking-widest shadow [writing-mode:vertical-rl] rotate-180"
      aria-label="Demo data"
    >
      DEMO
    </div>
  );
}
