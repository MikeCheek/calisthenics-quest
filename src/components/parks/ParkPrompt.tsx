"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchOsmCells, fetchUserParks, updateProgress } from "@/lib/store";
import { savedPlace } from "@/lib/weather";
import { cellsCovering, mergeEdits, parkName, type Park } from "@/lib/parks";
import { readTodayPark, setTodayPark, type TodayPark } from "@/lib/todayPark";
import type { UserDoc } from "@/lib/types";

const EVENT = "barquests:ask-park";
const NEAR_M = 1500;

// Before a session: "Where are you training?" — unless today's park is set
// already, you said not to ask, or there's nothing to pick (no favourites,
// no park near you). Resolves once you've answered (or closed it).
export async function askParkFirst(u: Pick<UserDoc, "askPark" | "favParks"> | null): Promise<void> {
  if (typeof window === "undefined" || !u || u.askPark === false || readTodayPark() !== null) return;
  const near = await Promise.race([nearbyParks().catch(() => []), new Promise<Park[]>((r) => setTimeout(() => r([]), 2500))]);
  if (!(u.favParks ?? []).length && !near.length) return;
  return new Promise((resolve) => window.dispatchEvent(new CustomEvent(EVENT, { detail: { resolve, near } })));
}

// parks within 1.5 km, straight from the shared cache (no slow OpenStreetMap call here)
async function nearbyParks(): Promise<Park[]> {
  const at = savedPlace();
  if (!at) return [];
  const cells = cellsCovering(at.lat, at.lon, NEAR_M);
  const [osm, added] = await Promise.all([fetchOsmCells(cells).catch(() => []), fetchUserParks(cells).catch(() => [])]);
  const raw = osm.flatMap((c) => c.parks).map((p) => ({ ...p, source: "osm" as const }));
  return mergeEdits(raw, added, at, NEAR_M).slice(0, 4);
}

export default function ParkPrompt() {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const [resolve, setResolve] = useState<(() => void) | null>(null);
  const [near, setNear] = useState<Park[] | null>(null);
  const [dontAsk, setDontAsk] = useState(false);

  useEffect(() => {
    const on = (e: Event) => {
      const { resolve: r, near: n } = (e as CustomEvent<{ resolve: () => void; near: Park[] }>).detail;
      setResolve(() => r);
      setNear(n);
      setDontAsk(false);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  if (!resolve || !userDoc) return null;

  const answer = async (park: TodayPark) => {
    setTodayPark(park);
    if (dontAsk) {
      await updateProgress(userDoc.uid, { askPark: false }).catch(() => {});
      refreshUserDoc().catch(() => {});
    }
    const r = resolve;
    setResolve(null);
    r();
  };

  const favs = userDoc.favParks ?? [];
  const nearOnly = (near ?? []).filter((p) => !favs.some((f) => f.id === p.id));
  const row = (id: string, name: string, icon: React.ReactNode, sub?: string) => (
    <li key={id}>
      <button onClick={() => answer({ id, name })} className="w-full text-left rounded-xl border border-zinc-800 hover:border-orange-500 px-3 py-2.5 flex items-center gap-2.5">
        {icon}
        <span className="flex-1 min-w-0">
          <span className="block text-sm text-zinc-100 truncate">{name}</span>
          {sub && <span className="block text-xs text-zinc-400">{sub}</span>}
        </span>
      </button>
    </li>
  );

  return (
    <Modal open onClose={() => answer("none")} title={tx("Where are you training?")}>
      <div className="space-y-3">
        <p className="text-sm text-zinc-400">{tx("Pick the bar park to log it with this session — it counts you among the athletes who train there.")}</p>
        <ul className="space-y-1.5">
          {favs.map((f) => row(f.id, f.name, <Star size={16} className="fill-amber-300 text-amber-300 shrink-0" aria-hidden />, tx("Favourite")))}
          {nearOnly.map((p) => row(p.id, parkName(p, tx("Bar park")), <MapPin size={16} className="text-orange-400 shrink-0" aria-hidden />, p.distanceM !== undefined ? (p.distanceM < 1000 ? tx("{n} m away", { n: p.distanceM }) : tx("{n} km away", { n: (p.distanceM / 1000).toFixed(1) })) : undefined))}
        </ul>
        {near === null && <p className="text-xs text-zinc-400" role="status">{tx("Looking for bar parks…")}</p>}
        {near !== null && !favs.length && !nearOnly.length && (
          <p className="text-xs text-zinc-400">
            {tx("No parks saved or nearby yet.")}{" "}
            <Link href="/parks" className="text-orange-300 underline" onClick={() => answer("none")}>
              {tx("Find one on the map")}
            </Link>
          </p>
        )}
        <button onClick={() => answer("none")} className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium">
          {tx("Not at a park — start")}
        </button>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={dontAsk} onChange={(e) => setDontAsk(e.target.checked)} className="w-4 h-4 accent-orange-500" />
          {tx("Don't ask me again (you can turn it back on in Settings)")}
        </label>
      </div>
    </Modal>
  );
}
