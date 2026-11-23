"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// "On this page": chips for a long screen's sections that stay at the top
// while you scroll, with the section you're reading highlighted.
export default function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const { tx } = useLanguage();
  const [current, setCurrent] = useState<string | null>(null);
  const key = sections.map((s) => s.id).join(",");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const first = sections.find((s) => seen.get(s.id));
        if (first) setCurrent(first.id);
      },
      { rootMargin: "-80px 0px -55% 0px" }
    );
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const observe = () => {
      const els = sections.map((s) => document.getElementById(s.id)).filter((x): x is HTMLElement => !!x);
      els.forEach((el) => io.observe(el));
      if (els.length < sections.length && tries++ < 20) timer = setTimeout(observe, 200);
    };
    observe();
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(window.history.state, "", url);
    setCurrent(id);
  };

  return (
    <nav aria-label={tx("On this page")} className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/60">
      <ul className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                go(s.id);
              }}
              aria-current={current === s.id ? "location" : undefined}
              className={`block px-3 py-1.5 rounded-full text-xs border transition-colors ${
                current === s.id ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-300 hover:text-zinc-100"
              }`}
            >
              {tx(s.label)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
