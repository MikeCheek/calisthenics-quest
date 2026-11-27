"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Home, MapPin, Trees } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { TrainingEquipment } from "@/lib/types";
import { atHome, choseWhereToday, onTodayEquipment, readTodayEquipment, readWetToday, setIndoorPlan, setTodayEquipment, type TodayEquipment } from "@/lib/todayEquipment";
import { usualWhere, type WhereSample } from "@/lib/trainingHabits";

// Where today's calisthenics happens — your usual spot, at home, or a bar
// park — chosen any day, rain or not. The session is built for the place:
// at home it's the floor, a wall and the kit you own.
export default function TodayEquipmentBanner({ value, own, whereLog }: { value: TodayEquipment | null; own: TrainingEquipment; whereLog?: WhereSample[] }) {
  const { tx, locale } = useLanguage();

  // where you usually train in today's situation, until you pick yourself
  // (re-checked when the weather card says it's wet)
  useEffect(() => {
    const apply = () => {
      if (choseWhereToday() || readTodayEquipment()) return;
      const pick = usualWhere(whereLog, { w: new Date().getDay(), wet: readWetToday() });
      if (!pick) return;
      if (pick.kind === "home") setTodayEquipment({ kind: "indoors", label: "Indoors", equipment: atHome(own), auto: pick.why });
      else if (pick.park) setTodayEquipment({ kind: "park", label: pick.park.label, parkId: pick.park.id, equipment: pick.park.equipment, auto: pick.why });
    };
    apply();
    return onTodayEquipment(apply);
  }, [whereLog, own]);
  const where = !value ? "usual" : value.kind === "park" ? "park" : "home";
  const until = value?.until
    ? new Date(...(value.until.split("-").map(Number).map((n, i) => (i === 1 ? n - 1 : n)) as [number, number, number])).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { weekday: "long" })
    : "";

  const usual = () => {
    if (value?.kind === "indoorPlan") setIndoorPlan(null);
    setTodayEquipment(null);
  };
  const home = () => setTodayEquipment({ kind: "indoors", label: "Indoors", equipment: atHome(own) });

  const chip = (on: boolean) =>
    `flex-1 min-w-0 py-2 px-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors ${
      on ? "bg-sky-500/20 border border-sky-500/50 text-sky-100" : "border border-zinc-700 text-zinc-300 hover:border-zinc-500"
    }`;

  const kit = [own.homeBar && tx("pull-up bar"), own.parallettes && tx("parallettes"), own.resistanceBands && tx("bands"), own.weights && tx("weights")].filter(Boolean) as string[];
  const weekday = new Date().toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { weekday: "long" });
  const usualNote = value?.auto === "wet" ? tx("As usual on a rainy day.") : value?.auto === "weekday" ? tx("As usual on {day}.", { day: weekday }) : null;
  const note =
    value?.kind === "indoorPlan"
      ? tx("Home plan until {d} (rainy days)", { d: until })
      : where === "home"
        ? kit.length
          ? tx("At home: floor, a wall and your {kit}.", { kit: kit.join(", ") })
          : tx("At home: floor and a wall — add a doorway bar or parallettes to your kit for pulls and dips.")
        : where === "park"
          ? tx("Today at {place}", { place: value!.label })
          : null;

  return (
    <section className="panel p-3" aria-label={tx("Where today?")}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs uppercase tracking-wide text-zinc-400">{tx("Where today?")}</h2>
      </div>
      <div className="flex gap-2" role="group" aria-label={tx("Where today?")}>
        <button onClick={usual} aria-pressed={where === "usual"} className={chip(where === "usual")}>
          <Trees size={15} aria-hidden className="hidden sm:block shrink-0" /> <span className="truncate">{tx("Usual spot")}</span>
        </button>
        <button onClick={home} aria-pressed={where === "home"} className={chip(where === "home")}>
          <Home size={15} aria-hidden className="hidden sm:block shrink-0" /> <span className="truncate">{tx("At home")}</span>
        </button>
        <Link href="/parks" aria-current={where === "park" ? "true" : undefined} className={chip(where === "park")}>
          <MapPin size={15} aria-hidden className="hidden sm:block shrink-0" /> <span className="truncate">{tx("A park")}</span>
        </Link>
      </div>
      {note && (
        <p className="text-xs text-zinc-400 mt-2" role="status">
          {usualNote && <span data-testid="usual-where">{usualNote} </span>}
          {note}
          {where === "home" && !kit.length && (
            <>
              {" "}
              <Link href="/profile?tab=settings#equipment" className="text-sky-300 underline">
                {tx("Your kit")}
              </Link>
            </>
          )}
        </p>
      )}
    </section>
  );
}
