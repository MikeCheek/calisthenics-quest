"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ABOUT } from "@/lib/aboutCopy";
import { Heart, Github, Globe, ShieldCheck, Cookie, Info, ExternalLink, ChevronLeft } from "lucide-react";

const APP_VERSION = "1.0.0";

export default function AboutPage() {
  const { user } = useAuth();
  const { tx } = useLanguage();

  return (
    <>
      {user && <Nav />}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-5">
        <div className="flex items-center gap-2">
          <Link href={user ? "/profile" : "/"} className="text-sm text-zinc-400 flex items-center gap-1 shrink-0">
            <ChevronLeft size={16} /> {tx(ABOUT.back)}
          </Link>
        </div>

        <div>
          <h1 className="heading text-2xl text-zinc-100">{tx(ABOUT.title)}</h1>
          <p className="text-zinc-400 text-sm mt-1">{tx(ABOUT.version, { v: APP_VERSION })}</p>
        </div>

        {/* Who made this */}
        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
            <Info size={16} className="text-orange-400" /> {tx(ABOUT.whoTitle)}
          </div>
          <p className="text-sm text-zinc-300 mb-4">
            {tx(ABOUT.whoBefore)} <span className="text-zinc-100 font-medium">Michele Pulvirenti</span>
            {tx(ABOUT.whoAfter)}
          </p>
          <div className="grid gap-2">
            <a
              href="https://ko-fi.com/michelepulvirenti"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <Heart size={15} /> {tx(ABOUT.kofi)}
              </span>
              <ExternalLink size={14} />
            </a>
            <a
              href="https://github.com/MikeCheek"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500 text-sm"
            >
              <span className="flex items-center gap-2">
                <Github size={15} /> GitHub — @MikeCheek
              </span>
              <ExternalLink size={14} />
            </a>
            <a
              href="https://michelepulvirenti.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500 text-sm"
            >
              <span className="flex items-center gap-2">
                <Globe size={15} /> {tx(ABOUT.portfolio)}
              </span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-orange-400" /> {tx(ABOUT.privacyTitle)}
          </div>
          <div className="text-sm text-zinc-300 space-y-3">
            {(
              [
                [ABOUT.collectedLead, ABOUT.collected],
                [ABOUT.usedLead, ABOUT.used],
                [ABOUT.livesLead, ABOUT.lives],
                [ABOUT.controlLead, ABOUT.control],
              ] as const
            ).map(([lead, body]) => (
              <p key={lead}>
                <span className="text-zinc-100 font-medium">{tx(lead)}</span> {tx(body)}
              </p>
            ))}
          </div>
        </div>

        {/* Cookie policy */}
        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
            <Cookie size={16} className="text-orange-400" /> {tx(ABOUT.cookieTitle)}
          </div>
          <div className="text-sm text-zinc-300 space-y-2">
            <p>{tx(ABOUT.cookieIntro)}</p>
            <p>{tx(ABOUT.localIntro)}</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              {ABOUT.localItems.map((item) => (
                <li key={item}>{tx(item)}</li>
              ))}
            </ul>
            <p>{tx(ABOUT.localClear)}</p>
          </div>
        </div>

        {/* Other useful info */}
        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">{tx(ABOUT.otherTitle)}</div>
          <div className="text-sm text-zinc-300 space-y-2">
            <p>{tx(ABOUT.notMedical)}</p>
            <p>{tx(ABOUT.builtWith)}</p>
            <p>{tx(ABOUT.reachOut)}</p>
          </div>
        </div>
      </main>
    </>
  );
}
