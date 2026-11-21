"use client";

import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// The way into "Then vs now" (app/compare), from Skills and from Me.
export default function CompareLink() {
  const { tx } = useLanguage();
  return (
    <Link href="/compare" className="panel p-4 flex items-center gap-3 hover:border-orange-500/60 transition-colors">
      <span className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
        <TrendingUp size={20} className="text-emerald-400" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block heading text-base text-zinc-100">{tx("Then vs now")}</span>
        <span className="block text-sm text-zinc-400">{tx("Compare your strength, skills and exercises with when you started.")}</span>
      </span>
      <ChevronRight size={20} className="text-zinc-400 shrink-0" />
    </Link>
  );
}
