"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ITEM_H = 40;
const VISIBLE = 5; // odd number, center item is the selected one
const HEIGHT = ITEM_H * VISIBLE;

export default function ScrollPicker({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  variant = "wheel",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  variant?: "wheel" | "ruler";
  onChange: (v: number) => void;
}) {
  const { tx } = useLanguage();
  const values = useMemo(() => {
    const arr: number[] = [];
    for (let v = min; v <= max; v += step) arr.push(Math.round(v * 100) / 100);
    return arr;
  }, [min, max, step]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [fraction, setFraction] = useState(() => values.indexOf(value));
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current || !containerRef.current) return;
    const idx = Math.max(0, values.indexOf(value));
    containerRef.current.scrollTop = idx * ITEM_H;
    setFraction(idx);
    didInit.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const rafRef = useRef<number | null>(null);
  const handleScroll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const raw = el.scrollTop / ITEM_H;
      setFraction(raw);
      const idx = Math.round(raw);
      const clamped = Math.min(values.length - 1, Math.max(0, idx));
      const v = values[clamped];
      if (v !== undefined && v !== value) onChange(v);
    });
  };

  const step1 = (dir: 1 | -1) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ top: dir * ITEM_H, behavior: "smooth" });
  };

  // keyboard: arrows move one step, Page keys five, Home/End to the ends
  const onKeyDown = (e: React.KeyboardEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.max(0, values.indexOf(value));
    const by: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -1, ArrowRight: 1, PageUp: -5, PageDown: 5 };
    let next: number | null = null;
    if (e.key in by) next = idx + by[e.key];
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = values.length - 1;
    if (next === null) return;
    e.preventDefault();
    next = Math.min(values.length - 1, Math.max(0, next));
    el.scrollTo({ top: next * ITEM_H, behavior: "smooth" });
  };

  const labelId = useMemo(() => `picker-${label.replace(/\W+/g, "-")}-${min}-${max}`, [label, min, max]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span id={labelId} className="text-xs text-zinc-400">{label}</span>
        <span className="stat-mono text-sm text-orange-400">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => step1(-1)}
          className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 text-muted p-1"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ChevronUp size={16} />
        </button>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="spinbutton"
          aria-labelledby={labelId}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={unit ? `${value} ${unit}` : String(value)}
          title={tx("Use the arrow keys to change")}
          className="overflow-y-auto snap-y snap-mandatory no-scrollbar rounded-lg bg-zinc-800/50 border border-zinc-700"
          style={{ height: HEIGHT, scrollPaddingTop: 0 }}
        >
          <div style={{ height: ITEM_H * Math.floor(VISIBLE / 2) }} />
          {values.map((v, i) => {
            const dist = Math.abs(i - fraction);
            // fades with distance, but never below what stays readable (4.5:1)
            const opacity = Math.max(0.55, 1 - dist * 0.22);
            const scale = variant === "wheel" ? Math.max(0.72, 1 - dist * 0.14) : 1;
            const isTick = variant === "ruler" && Math.round(v) % 5 !== 0;
            return (
              <div
                key={v}
                className="snap-center flex items-center justify-center"
                aria-hidden="true"
                style={{ height: ITEM_H }}
              >
                {variant === "ruler" ? (
                  <div className="flex items-center gap-2" style={{ opacity }}>
                    <span className={`bg-zinc-500 ${isTick ? "w-3 h-px" : "w-5 h-0.5 bg-orange-400/70"}`} />
                    {!isTick && (
                      <span className="stat-mono text-sm text-zinc-200 w-8 text-left">{v}</span>
                    )}
                  </div>
                ) : (
                  <span
                    className="stat-mono text-zinc-100"
                    style={{ opacity, transform: `scale(${scale})`, fontSize: 18 }}
                  >
                    {v}
                  </span>
                )}
              </div>
            );
          })}
          <div style={{ height: ITEM_H * Math.floor(VISIBLE / 2) }} />
        </div>
        <button
          type="button"
          onClick={() => step1(1)}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 text-muted p-1"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ChevronDown size={16} />
        </button>
        {/* center highlight band */}
        <div
          className="absolute left-0 right-0 border-y border-orange-500/40 pointer-events-none"
          style={{ top: ITEM_H * Math.floor(VISIBLE / 2), height: ITEM_H }}
        />
      </div>
    </div>
  );
}
