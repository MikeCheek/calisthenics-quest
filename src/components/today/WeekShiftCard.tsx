"use client";

import { useState } from "react";
import { CalendarClock, MoveRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateProgress } from "@/lib/store";
import { todayISO, type WeekPlan } from "@/lib/weekShift";

// How this week's plan moved after a skipped day, and a way to move today's
// session to tomorrow before it's missed.
export default function WeekShiftCard({ plan, canSkipToday }: { plan: WeekPlan; canSkipToday: boolean }) {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const [busy, setBusy] = useState(false);
  if (!userDoc) return null;
  const dayName = (d: number) => new Date(2026, 10, 22 + d).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { weekday: "short" }); // the 22nd is a Sunday
  const list = [...plan.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(dayName).join(" · ");

  const skipToday = async () => {
    setBusy(true);
    const keep = (userDoc.skippedDays ?? []).filter((d) => d >= todayISO(new Date(Date.now() - 14 * 86400000)));
    await updateProgress(userDoc.uid, { skippedDays: [...keep, todayISO()] }).catch(() => {});
    await refreshUserDoc();
    setBusy(false);
  };

  // what can't happen this week any more, counted the way you'd count it
  const coming = [...plan.ahead].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(dayName).join(" · ");
  const note =
    plan.lost > 0
      ? coming
        ? tx(plan.lost === 1 ? "One of this week's sessions can't fit any more — still to come: {days}" : "{n} of this week's sessions can't fit any more — still to come: {days}", { n: plan.lost, days: coming })
        : tx(plan.lost === 1 ? "One of this week's sessions can't fit any more — a fresh week starts on Monday." : "{n} of this week's sessions can't fit any more — a fresh week starts on Monday.", { n: plan.lost })
      : plan.shifted
        ? tx("You missed a training day, so the rest of the week moved by a day: {days}", { days: list })
        : null;
  if (!note && !canSkipToday) return null;

  return (
    <section className="panel p-3 space-y-2" aria-label={tx("This week's plan")}>
      {note && (
        <p className="text-sm text-zinc-200 flex items-start gap-2">
          <CalendarClock size={17} className="text-sky-300 shrink-0 mt-0.5" aria-hidden /> {note}
        </p>
      )}
      {canSkipToday && (
        <button onClick={skipToday} disabled={busy} className="w-full py-2 rounded-xl border border-zinc-700 hover:border-sky-500 text-sm text-zinc-200 flex items-center justify-center gap-2">
          <MoveRight size={15} className="text-sky-300" aria-hidden /> {tx(plan.shifted ? "Can't today either? Skip this session" : "Can't train today? Move it to tomorrow")}
        </button>
      )}
    </section>
  );
}
