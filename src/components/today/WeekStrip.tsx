"use client";

import Link from "next/link";
import { StripDay } from "@/lib/weekStrip";
import { useLanguage } from "@/context/LanguageContext";
import { Check, ChevronRight } from "lucide-react";

const LETTERS = { en: ["S", "M", "T", "W", "T", "F", "S"], it: ["D", "L", "M", "M", "G", "V", "S"] };

// This week at a glance: done days filled, planned days outlined, today ringed.
export default function WeekStrip({ days, planned }: { days: StripDay[]; planned: number }) {
  const { tx, locale } = useLanguage();
  const letters = LETTERS[locale === "it" ? "it" : "en"];
  const done = days.filter((d) => d.done).length;
  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-zinc-100">
          {tx("This week")}{" "}
          <span className="text-muted">
            · {planned > 0 ? tx("{a} of {b} sessions", { a: done, b: planned }) : tx("{n} sessions", { n: done })}
          </span>
        </div>
        <Link href="/plan" className="text-xs text-zinc-400 hover:text-orange-400 flex items-center gap-0.5">
          {tx("Plan")} <ChevronRight size={13} />
        </Link>
      </div>
      <ol className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <li key={d.dateISO} className="flex flex-col items-center gap-1">
            <span className={`text-xs ${d.isToday ? "text-orange-400 font-semibold" : "text-muted"}`}>{letters[d.weekday]}</span>
            <span
              role="img"
              aria-label={`${new Date(d.dateISO + "T12:00:00").toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { weekday: "long", day: "numeric", month: "long" })}: ${
                d.done ? tx("trained") : d.planned ? tx("planned") : tx("rest")
              }${d.isToday ? ` (${tx("today")})` : ""}`}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs ${
                d.done
                  ? "bg-emerald-500 text-zinc-950"
                  : d.planned
                  ? d.isPast
                    ? "border border-dashed border-zinc-600 text-muted"
                    : "border-2 border-orange-500/60 text-zinc-300"
                  : "bg-zinc-800/60 text-muted"
              } ${d.isToday ? "ring-2 ring-orange-400 ring-offset-2 ring-offset-zinc-900" : ""}`}
            >
              {d.done ? <Check size={15} strokeWidth={3} /> : Number(d.dateISO.slice(8))}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
