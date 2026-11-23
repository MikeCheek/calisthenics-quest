"use client";

import Link from "next/link";
import { BookOpen, ListPlus, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// "Something extra?" — the exercise library, your own sessions and bar parks, from Today
export default function ExtrasLinks() {
  const { tx } = useLanguage();
  return (
    <section className="panel p-3" aria-label={tx("Something extra?")}>
      <p className="text-xs text-zinc-400 px-1 mb-2">{tx("Something extra?")}</p>
      <div className="grid grid-cols-2 gap-2">
        <Link href="/library" className="h-12 rounded-xl border border-zinc-700 hover:border-orange-500 text-sm text-zinc-100 flex items-center justify-center gap-2">
          <BookOpen size={17} className="text-orange-400" /> {tx("Exercise library")}
        </Link>
        <Link href="/build" className="h-12 rounded-xl border border-zinc-700 hover:border-orange-500 text-sm text-zinc-100 flex items-center justify-center gap-2">
          <ListPlus size={17} className="text-orange-400" /> {tx("Build a session")}
        </Link>
        <Link href="/parks" className="col-span-2 h-12 rounded-xl border border-zinc-700 hover:border-orange-500 text-sm text-zinc-100 flex items-center justify-center gap-2">
          <MapPin size={17} className="text-orange-400" /> {tx("Bar parks near you")}
        </Link>
      </div>
    </section>
  );
}
