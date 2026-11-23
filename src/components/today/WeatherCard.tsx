"use client";

import { useEffect, useState } from "react";
import { CloudRain, CloudSun, Home, MapPin, Sun, Snowflake, X } from "lucide-react";
import type { UserDoc } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { advise, fetchForecast, locate, localDay, savedPlace, savePlace, trainingHour, type Advice, type Place } from "@/lib/weather";
import { floorOnly, setTodayEquipment, type TodayEquipment } from "@/lib/todayEquipment";

const OFF_KEY = "barquests:weatherOff";
const clock = (h: number) => `${String(h).padStart(2, "0")}:00`;

// The weather at the hour you usually train: dry, a drier hour today, or a
// floor-only session indoors; plus a tip when it's very hot or cold.
export default function WeatherCard({ userDoc, override }: { userDoc: UserDoc; override: TodayEquipment | null }) {
  const { tx } = useLanguage();
  const [place, setPlace] = useState<Place | null | undefined>(undefined);
  const [off, setOff] = useState(true);
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [asking, setAsking] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setPlace(savedPlace());
    try {
      setOff(localStorage.getItem(OFF_KEY) === "1");
    } catch {
      setOff(false);
    }
  }, []);

  const hour = trainingHour(userDoc);
  const minutes = userDoc.body?.sessionLengthMinutes;
  useEffect(() => {
    if (!place) return;
    let live = true;
    fetchForecast(place)
      .then((f) => {
        const now = new Date();
        const from = now.getHours() + (now.getMinutes() > 30 ? 1 : 0);
        if (live) setAdvice(advise(f, { day: localDay(now), hour, from, minutes }));
      })
      .catch(() => live && setAdvice(null)); // offline or blocked: say nothing
    return () => {
      live = false;
    };
  }, [place, hour, minutes]);

  const hide = () => {
    try {
      localStorage.setItem(OFF_KEY, "1");
    } catch {
      // fine
    }
    savePlace(null);
    setPlace(null);
    setOff(true);
  };

  const useLocation = async () => {
    setAsking(true);
    try {
      const p = await locate();
      savePlace(p);
      setPlace(p);
    } catch {
      setDenied(true);
    } finally {
      setAsking(false);
    }
  };

  if (place === undefined) return null;

  if (!place) {
    if (off) return null;
    return (
      <section className="panel p-3 flex items-center gap-3" aria-label={tx("Weather")}>
        <CloudSun size={22} className="text-sky-300 shrink-0" />
        <p className="flex-1 text-sm text-zinc-300">
          {denied ? tx("Location is blocked — allow it in your browser settings to see the weather.") : tx("See the weather at your training time?")}
        </p>
        {!denied && (
          <button onClick={useLocation} disabled={asking} className="shrink-0 px-3 py-2 rounded-lg text-sm bg-sky-500/15 border border-sky-500/40 text-sky-200 hover:bg-sky-500/25 flex items-center gap-1.5">
            <MapPin size={14} /> {asking ? tx("Locating…") : tx("Use location")}
          </button>
        )}
        <button onClick={hide} className="shrink-0 p-2 rounded-lg text-zinc-400 hover:text-zinc-100" aria-label={tx("Not now")}>
          <X size={16} />
        </button>
      </section>
    );
  }

  if (!advice) return null;
  const at = advice.at;
  const tip = advice.kind === "indoors" ? undefined : advice.tip;
  const indoorsNow = override?.kind === "indoors";
  const goIndoors = () => setTodayEquipment({ kind: "indoors", label: "Indoors", equipment: floorOnly(userDoc.equipment) });

  const Icon = advice.kind === "dry" ? (tip === "cold" ? Snowflake : Sun) : CloudRain;
  const tone = advice.kind === "dry" ? "text-amber-300" : "text-sky-300";

  return (
    <section className="panel p-3" aria-label={tx("Weather")}>
      <div className="flex items-start gap-3">
        <Icon size={22} className={`${tone} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0 text-sm">
          {advice.kind === "dry" ? (
            <p className="text-zinc-100">{tx("Dry at {t} · {c}°", { t: clock(at.hour), c: Math.round(at.temp) })}</p>
          ) : (
            <p className="text-zinc-100">{tx("Rain likely at {t} ({p}%)", { t: clock(at.hour), p: Math.round(at.rainChance) })}</p>
          )}
          {(advice.kind === "moveEarlier" || advice.kind === "moveLater") && (
            <p className="text-zinc-300 mt-0.5">
              {tx(advice.kind === "moveEarlier" ? "Dry at {t} — train earlier, or indoors on the floor." : "Dry from {t} — train later, or indoors on the floor.", {
                t: clock(advice.window.hour),
              })}
            </p>
          )}
          {advice.kind === "indoors" && <p className="text-zinc-300 mt-0.5">{tx("Wet all day — a floor-only session indoors keeps the streak going.")}</p>}
          {tip === "hot" && <p className="text-amber-200 mt-1">{tx("Hot out: bring water, find shade and rest a bit longer between sets.")}</p>}
          {tip === "cold" && <p className="text-sky-200 mt-1">{tx("Cold out: warm up longer and keep a layer on until your grip is warm.")}</p>}
        </div>
        <button onClick={hide} className="shrink-0 p-1.5 -m-1 rounded-lg text-zinc-400 hover:text-zinc-100" aria-label={tx("Hide the weather")}>
          <X size={16} />
        </button>
      </div>
      {advice.kind !== "dry" && !indoorsNow && (
        <button onClick={goIndoors} className="mt-3 w-full py-2.5 rounded-xl text-sm border border-sky-500/40 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20 flex items-center justify-center gap-2">
          <Home size={15} /> {tx("Train indoors today")}
        </button>
      )}
    </section>
  );
}
