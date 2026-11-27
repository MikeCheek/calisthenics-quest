"use client";

import { useEffect, useState } from "react";

const GAP = 8;
const MIN = 12;

// Where a notification from the top should sit: just under the app's top
// bar while it's on screen (it scrolls away with the page), else near the
// top edge — so a notice never covers the sport switcher or the level.
export function useBelowTopBar(active: boolean): string {
  const [top, setTop] = useState(MIN);
  useEffect(() => {
    if (!active) return;
    const place = () => {
      const bar = document.getElementById("top-bar");
      const bottom = bar ? bar.getBoundingClientRect().bottom : 0;
      setTop(Math.max(MIN, Math.round(bottom + GAP)));
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [active]);
  return `calc(env(safe-area-inset-top, 0px) + ${top}px)`;
}
