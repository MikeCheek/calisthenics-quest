"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Comeback } from "@/lib/comeback";

// Back after a week or more: say it, say what's different today, and say a
// streak that ended once, kindly (comeback.ts).
export default function ComebackNote({ comeback, className = "" }: { comeback: Comeback; className?: string }) {
  const { tx } = useLanguage();
  return (
    <div className={`rounded-lg border border-emerald-700/50 bg-emerald-500/10 p-3 text-sm text-emerald-100 ${className}`} data-testid="comeback">
      <p className="font-medium">👋 {tx("Welcome back — {n} days off.", { n: comeback.days })}</p>
      <p className="text-xs text-emerald-100/80 mt-0.5">
        {tx("Today is a gentler restart: about a quarter fewer sets, and the skill checks wait for next time.")}
        {comeback.streakEnded ? ` ${tx("Your {n}-week streak ended — this session starts a new one.", { n: comeback.streakEnded })}` : ""}
      </p>
    </div>
  );
}
