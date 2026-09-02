"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import { useAuth } from "@/context/AuthContext";
import { Heart, Github, Globe, ShieldCheck, Cookie, Info, ExternalLink, ChevronLeft } from "lucide-react";

const APP_VERSION = "1.0.0";

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <>
      {user && <Nav />}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-5">
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/profile" className="text-sm text-zinc-400 flex items-center gap-1 shrink-0">
              <ChevronLeft size={16} /> Back
            </Link>
          ) : (
            <Link href="/" className="text-sm text-zinc-400 flex items-center gap-1 shrink-0">
              <ChevronLeft size={16} /> Back
            </Link>
          )}
        </div>

        <div>
          <h1 className="heading text-2xl text-zinc-100">About BarQuests</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Version {APP_VERSION} — an independent, personal calisthenics training project.
          </p>
        </div>

        {/* Who made this */}
        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
            <Info size={16} className="text-orange-400" /> Who made this
          </div>
          <p className="text-sm text-zinc-300 mb-4">
            BarQuests is built and maintained by <span className="text-zinc-100 font-medium">Michele Pulvirenti</span>,
            an independent developer. It&apos;s a passion project, not a company product — if it&apos;s
            helped your training and you&apos;d like to support keeping it going, a coffee is always
            appreciated.
          </p>
          <div className="grid gap-2">
            <a
              href="https://ko-fi.com/michelepulvirenti"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <Heart size={15} /> Support on Ko-fi
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
                <Globe size={15} /> Portfolio website
              </span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-orange-400" /> Privacy notice
          </div>
          <div className="text-sm text-zinc-300 space-y-3">
            <p>
              <span className="text-zinc-100 font-medium">What&apos;s collected.</span> When you sign in
              with Google, BarQuests stores your name, email address, and profile photo. Beyond that,
              it stores what you enter directly: your body stats, which equipment you have, your skill
              stages and self-assessed mastery, training sessions and streaks, XP and level, weekly
              missions progress, friend connections, and your notification and language preferences.
            </p>
            <p>
              <span className="text-zinc-100 font-medium">What it&apos;s used for.</span> Exclusively to
              run the app: generating training sessions matched to your level and equipment, tracking
              your progress, and enabling the social features (friend codes, nudges, paired training)
              you choose to use.
            </p>
            <p>
              <span className="text-zinc-100 font-medium">Where it lives.</span> Your data is stored in
              Google Firebase (Firestore and Authentication), Google&apos;s cloud infrastructure. If you
              use the optional AI features (exercise tips, plan coaching, AI plan review), the relevant
              exercise names and a short skill/equipment summary — never your name, email, or photo —
              are sent to OpenRouter to generate that response. Friends you add can see a public summary
              of your profile (name, photo, level, streak, XP, skills) — nothing else.
            </p>
            <p>
              <span className="text-zinc-100 font-medium">Your control.</span> You can remove a friend,
              turn off notifications, or change your language at any time from your profile. To request
              a copy of your data or full account deletion, reach out through the GitHub link above.
            </p>
          </div>
        </div>

        {/* Cookie policy */}
        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
            <Cookie size={16} className="text-orange-400" /> Cookie policy
          </div>
          <div className="text-sm text-zinc-300 space-y-2">
            <p>
              BarQuests doesn&apos;t use tracking or advertising cookies — there are no ads, no
              analytics trackers, and nothing here is sold or shared with advertisers.
            </p>
            <p>What the app does store locally on your device, all functional and non-personal:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Your signed-in session, via Firebase Authentication&apos;s own browser storage</li>
              <li>Your chosen language (English/Italiano), so it persists across visits</li>
              <li>Which reminder message was shown last, so they rotate instead of repeating</li>
            </ul>
            <p>Clearing your browser&apos;s site data removes all of it.</p>
          </div>
        </div>

        {/* Other useful info */}
        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">Other useful things to know</div>
          <div className="text-sm text-zinc-300 space-y-2">
            <p>
              BarQuests isn&apos;t a substitute for professional coaching, physical therapy, or medical
              advice — train within your ability, warm up properly, and check with a doctor before
              starting a new training program if you have any health concerns.
            </p>
            <p>
              Built with Next.js, Firebase, and Tailwind CSS, and installable as a Progressive Web App —
              add it to your home screen from your browser&apos;s share/menu button for an app-like
              experience with offline support for cached pages.
            </p>
            <p>
              Found a bug or have an idea? The GitHub link above is the best place to reach out.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
