"use client";

import { useLanguage } from "@/context/LanguageContext";

const DAY_LABELS = { en: ["S", "M", "T", "W", "T", "F", "S"], it: ["D", "L", "M", "M", "G", "V", "S"] };
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function WeekdayPicker({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: number[];
  onChange: (days: number[]) => void;
}) {
  const { tx, locale } = useLanguage();
  const toggle = (day: number) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day].sort());
    }
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="stat-mono text-xs text-orange-400">
          {selected.length === 1 ? tx("1 day/week") : tx("{n} days/week", { n: selected.length })}
        </span>
      </div>
      <div className="flex gap-1.5">
        {DAY_LABELS[locale === "it" ? "it" : "en"].map((d, i) => {
          const active = selected.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-label={tx(DAY_FULL[i])}
              aria-pressed={active}
              className={`flex-1 aspect-square rounded-lg text-sm border flex items-center justify-center transition-colors ${
                active
                  ? "border-orange-500 bg-orange-500/15 text-zinc-100"
                  : "border-zinc-700 text-muted"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-orange-400 mt-1.5">{tx("Pick at least one day to get a plan.")}</p>
      )}
    </div>
  );
}
