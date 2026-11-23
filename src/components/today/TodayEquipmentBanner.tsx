"use client";

import { Home, MapPin, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { setIndoorPlan, setTodayEquipment, type TodayEquipment } from "@/lib/todayEquipment";

// "Today: indoors, floor only" / "Today: at <park>" with a way back
export default function TodayEquipmentBanner({ value }: { value: TodayEquipment | null }) {
  const { tx, locale } = useLanguage();
  if (!value) return null;
  const Icon = value.kind === "park" ? MapPin : Home;
  const until = value.until
    ? new Date(...(value.until.split("-").map(Number).map((n, i) => (i === 1 ? n - 1 : n)) as [number, number, number])).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { weekday: "long" })
    : "";
  const label =
    value.kind === "indoorPlan" ? tx("Home plan until {d} (rainy days)", { d: until }) : value.kind === "indoors" ? tx("Today: indoors, floor only") : tx("Today at {place}", { place: value.label });
  const back = () => {
    if (value.kind === "indoorPlan") setIndoorPlan(null);
    setTodayEquipment(null);
  };
  return (
    <div className="panel px-3 py-2 flex items-center gap-2 text-sm" role="status">
      <Icon size={16} className="text-sky-300 shrink-0" />
      <p className="flex-1 min-w-0 truncate text-zinc-200">
        {label}
      </p>
      <button onClick={back} className="shrink-0 px-2 py-1 rounded-lg text-zinc-300 hover:text-zinc-100 flex items-center gap-1">
        <RotateCcw size={14} /> {tx("My usual kit")}
      </button>
    </div>
  );
}
