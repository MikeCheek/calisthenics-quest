"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { CalendarDays, Dumbbell } from "lucide-react";

// The full session and the week plan: two views under the Today tab.
export default function TrainSwitcher({ active }: { active: "today" | "week" }) {
  const { tx } = useLanguage();
  const item = (key: "today" | "week", href: string, label: string, Icon: typeof Dumbbell) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={`flex-1 min-h-11 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors ${
        active === key ? "bg-zinc-800 text-zinc-100 shadow" : "text-muted hover:text-zinc-300"
      }`}
    >
      <Icon size={14} /> {tx(label)}
    </Link>
  );
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
      {item("today", "/training", "Session", Dumbbell)}
      {item("week", "/plan", "This week", CalendarDays)}
    </div>
  );
}
