"use client";

import Modal from "@/components/Modal";
import { useLanguage } from "@/context/LanguageContext";

// Change today's focus right on Today: a sheet with every focus you can do
// here (goals starred), instead of a trip to the session page.
export default function FocusSheet({
  open,
  onClose,
  options,
  current,
  goals = [],
  labelOf,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  options: string[];
  current: string | null;
  goals?: string[];
  labelOf: (f: string) => string;
  onPick: (f: string) => void;
}) {
  const { tx } = useLanguage();
  return (
    <Modal open={open} onClose={onClose} title={tx("Today's focus")}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={f === current}
            onClick={() => {
              onPick(f);
              onClose();
            }}
            className={`min-h-11 px-3 rounded-lg border text-sm text-left ${
              f === current ? "border-orange-500 bg-orange-500/10 text-zinc-100" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            {tx(labelOf(f))}
            {goals.includes(f) && <span className="text-orange-400" aria-label={tx("goal")}> ★</span>}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted mt-3">{tx("★ your goals. Only what your spot or kit allows today is listed.")}</p>
    </Modal>
  );
}
