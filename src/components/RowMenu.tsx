"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface RowMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  tone?: "rose";
}

// A small "⋯" menu for the less common actions on a row: opens below (or
// above, near the bottom of the screen), closes on a choice, Escape or a
// tap outside, and returns focus to its button.
export default function RowMenu({
  label,
  icon,
  items,
}: {
  label: string;
  icon: ReactNode;
  items: RowMenuItem[];
}) {
  const [open, setOpen] = useState(false);
  // fixed to the screen, rendered at the page's top level: a row clips what
  // overflows it, and its swipe transform would anchor "fixed" to the row
  const [pos, setPos] = useState<{
    right: number;
    top?: number;
    bottom?: number;
  }>({ right: 16 });
  const btn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    box.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        if (e.key !== "Escape") return;
        btn.current?.focus({ preventScroll: true });
      } else if (
        box.current?.contains(e.target as Node) ||
        btn.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const shut = () => setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    window.addEventListener("scroll", shut, { passive: true });
    window.addEventListener("resize", shut);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
      window.removeEventListener("scroll", shut);
      window.removeEventListener("resize", shut);
    };
  }, [open]);

  if (!items.length) return null;
  const toggle = () => {
    const r = btn.current?.getBoundingClientRect();
    if (r) {
      const right = Math.max(8, window.innerWidth - r.right);
      setPos(
        window.innerHeight - r.bottom < 200
          ? { right, bottom: window.innerHeight - r.top + 4 }
          : { right, top: r.bottom + 4 },
      );
    }
    setOpen((o) => !o);
  };

  return (
    <div className="shrink-0">
      <button
        ref={btn}
        onClick={toggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className="w-11 h-11 rounded-lg border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 flex items-center justify-center"
      >
        {icon}
      </button>
      {open &&
        createPortal(
          <div
            ref={box}
            id={id}
            role="menu"
            style={{ position: "fixed", ...pos }}
            className="z-50 min-w-56 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl p-1"
          >
            {items.map((it) => (
              <button
                key={it.label}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  btn.current?.focus({ preventScroll: true });
                  it.onClick();
                }}
                className={`w-full min-h-11 px-3 rounded-lg text-sm text-left flex items-center gap-2.5 hover:bg-zinc-800 focus:bg-zinc-800 ${
                  it.tone === "rose" ? "text-rose-300" : "text-zinc-200"
                }`}
              >
                {it.icon}
                {it.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
