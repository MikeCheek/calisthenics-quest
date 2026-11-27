"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const WIDE = "(min-width: 1024px)";

// A long card on a wide screen keeps to a set height: its content scrolls
// inside (with a fade where there's more), and "Expand" shows it all. That
// way one long list doesn't stretch a column and leave a gap beside it.
// On a phone it's the whole card, scrolled with the page.
export default function CappedHeight({ children, max = 440, label }: { children: ReactNode; max?: number; label?: string }) {
  const { tx } = useLanguage();
  const box = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  const [over, setOver] = useState(false);
  const [open, setOpen] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setOver(el.scrollHeight > max + 48);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [max, children]);

  const capped = wide && over && !open;
  return (
    <div>
      <div
        ref={box}
        onScroll={(e) => {
          const el = e.currentTarget;
          setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
        }}
        tabIndex={capped ? 0 : undefined}
        role={capped ? "region" : undefined}
        aria-label={capped ? label : undefined}
        className={capped ? "overflow-y-auto overscroll-contain rounded-lg" : ""}
        style={
          capped
            ? {
                maxHeight: max,
                ...(atEnd ? {} : { maskImage: "linear-gradient(to bottom, #000 85%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 85%, transparent)" }),
              }
            : undefined
        }
      >
        {children}
      </div>
      {wide && over && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-2 w-full min-h-10 rounded-lg text-xs text-zinc-300 border border-zinc-800 hover:border-zinc-600 flex items-center justify-center gap-1"
        >
          {open ? tx("Show less") : tx("Expand")}
          <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} aria-hidden />
        </button>
      )}
    </div>
  );
}
