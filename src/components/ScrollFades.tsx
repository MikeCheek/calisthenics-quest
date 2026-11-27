"use client";

import { useEffect } from "react";

// Rows of chips that scroll sideways (`.no-scrollbar` with overflow) get a
// soft fade on whichever edge has more to see — a hint that they scroll,
// instead of words cut off at the edge. One watcher for the whole app.
export default function ScrollFades() {
  useEffect(() => {
    const mark = (el: HTMLElement) => {
      const more = el.scrollWidth - el.clientWidth;
      if (more < 2) return el.removeAttribute("data-fade");
      const atStart = el.scrollLeft < 2;
      const atEnd = el.scrollLeft > more - 2;
      el.setAttribute("data-fade", atStart ? "end" : atEnd ? "start" : "both");
    };
    const seen = new WeakSet<HTMLElement>();
    const ro = new ResizeObserver((entries) => entries.forEach((e) => mark(e.target as HTMLElement)));
    const onScroll = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el instanceof HTMLElement && el.classList?.contains("no-scrollbar")) mark(el);
    };
    const scan = () =>
      document.querySelectorAll<HTMLElement>(".no-scrollbar").forEach((el) => {
        if (seen.has(el)) return mark(el);
        seen.add(el);
        ro.observe(el);
        mark(el);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      mo.disconnect();
      ro.disconnect();
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, []);
  return null;
}
