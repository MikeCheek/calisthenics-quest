"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LocateFixed, MapPin, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import PageLoading from "@/components/PageLoading";
import ParkSheet from "@/components/parks/ParkSheet";
import { addUserPark, fetchUserParks } from "@/lib/store";
import { locate, savedPlace, savePlace, type Place } from "@/lib/weather";
import { cellOf, cellsAround, fetchOsmParks, KIT_LABEL, parkName, userParkToPark, type Park } from "@/lib/parks";
import { setTodayEquipment } from "@/lib/todayEquipment";
import type { TrainingEquipment } from "@/lib/types";

const ParksMap = dynamic(() => import("@/components/parks/ParksMap").catch(() => ({ default: () => null })), { ssr: false });

const RADII = [2000, 5000, 10000];

export default function ParksPage() {
  const { user, userDoc, loading } = useAuth();
  const { tx } = useLanguage();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null | undefined>(undefined);
  const [radius, setRadius] = useState(RADII[1]);
  const [parks, setParks] = useState<Park[] | null>(null);
  const [failed, setFailed] = useState<false | "down" | "stale">(false);
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  useEffect(() => setPlace(savedPlace()), []);

  const load = useCallback(async (p: Place, r: number) => {
    setParks(null);
    setFailed(false);
    const [osm, mine] = await Promise.all([
      fetchOsmParks(p.lat, p.lon, r).catch(() => null),
      fetchUserParks(cellsAround(p.lat, p.lon)).catch(() => []),
    ]);
    setFailed(!osm ? "down" : osm.stale ? "stale" : false);
    const added = mine.map((u) => userParkToPark(u, p)).filter((x) => (x.distanceM ?? 0) <= r);
    setParks([...(osm?.parks ?? []), ...added].sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0)));
  }, []);

  useEffect(() => {
    if (place) load(place, radius);
  }, [place, radius, load]);

  const findMe = async () => {
    setLocating(true);
    try {
      const p = await locate();
      savePlace(p);
      setPlace(p);
      setDenied(false);
    } catch {
      setDenied(true);
    } finally {
      setLocating(false);
    }
  };

  const trainHere = (park: Park, equipment: TrainingEquipment) => {
    setTodayEquipment({ kind: "park", label: parkName(park, tx("Bar park")), parkId: park.id, equipment });
    router.push("/dashboard");
  };

  const addPark = async () => {
    if (!place || !userDoc || !newName.trim()) return;
    const doc = { name: newName.trim().slice(0, 60), lat: place.lat, lon: place.lon, cell: cellOf(place.lat, place.lon), source: "user" as const, createdBy: userDoc.uid, createdAtISO: new Date().toISOString() };
    const id = await addUserPark(doc).catch(() => null);
    if (!id) return;
    const park = userParkToPark({ ...doc, id }, place);
    setParks((ps) => [park, ...(ps ?? [])]);
    setAdding(false);
    setNewName("");
    setOpen(id);
  };

  if (loading || !userDoc || place === undefined) return <PageLoading variant="list" />;
  const selected = parks?.find((p) => p.id === open) ?? null;
  const km = (m: number) => (m < 1000 ? tx("{n} m away", { n: m }) : tx("{n} km away", { n: (m / 1000).toFixed(1) }));

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <div>
          <h1 className="heading text-2xl text-zinc-100">{tx("Bar parks near you")}</h1>
          <p className="text-sm text-zinc-400">{tx("Outdoor bars from OpenStreetMap, with what athletes say is really there. Pick one and today's session fits its equipment.")}</p>
        </div>

        {!place ? (
          <section className="panel p-4 text-center space-y-3">
            <MapPin size={28} className="text-orange-400 mx-auto" />
            <p className="text-sm text-zinc-300">
              {denied ? tx("Location is blocked — allow it in your browser settings to find parks.") : tx("Share your location to find bar parks around you. It stays on this device, rounded to about 1 km.")}
            </p>
            <button onClick={findMe} disabled={locating} className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium inline-flex items-center gap-2">
              <LocateFixed size={16} /> {locating ? tx("Locating…") : tx("Find parks near me")}
            </button>
          </section>
        ) : (
          <>
            <ParksMap center={place} parks={parks ?? []} selected={open} onSelect={setOpen} label={tx("Map of bar parks")} />
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1" role="group" aria-label={tx("Distance")}>
                {RADII.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    aria-pressed={radius === r}
                    className={`px-3 py-1.5 rounded-full text-xs border ${radius === r ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-300"}`}
                  >
                    {r / 1000} km
                  </button>
                ))}
              </div>
              <button onClick={findMe} disabled={locating} className="ml-auto px-3 py-1.5 rounded-full text-xs border border-zinc-700 text-zinc-300 flex items-center gap-1">
                <LocateFixed size={13} /> {locating ? tx("Locating…") : tx("Update location")}
              </button>
            </div>

            {failed && (
              <div className="panel p-3 flex items-center gap-3" role="status">
                <p className="flex-1 text-sm text-amber-300">
                  {failed === "stale" ? tx("OpenStreetMap is busy — showing your last search around here.") : tx("Couldn't reach OpenStreetMap right now — showing only parks athletes added.")}
                </p>
                <button onClick={() => place && load(place, radius)} className="shrink-0 px-3 py-2 rounded-lg text-sm border border-zinc-700 text-zinc-100 hover:border-orange-500">
                  {tx("Try again")}
                </button>
              </div>
            )}

            {parks === null ? (
              <p className="text-sm text-zinc-400" role="status">
                {tx("Looking for bar parks…")}
              </p>
            ) : parks.length === 0 ? (
              <p className="text-sm text-zinc-400">{tx("No bar parks mapped around here yet. Try a wider distance, or add one you know.")}</p>
            ) : (
              <ul className="space-y-2" aria-label={tx("Bar parks")}>
                {parks.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => setOpen(p.id)} className={`w-full text-left panel p-3 hover:border-orange-500/60 ${open === p.id ? "border-orange-500/70" : ""}`}>
                      <span className="flex items-center gap-2">
                        <MapPin size={16} className={p.source === "user" ? "text-purple-300" : "text-orange-400"} />
                        <span className="flex-1 min-w-0 truncate text-sm text-zinc-100">{parkName(p, tx("Bar park"))}</span>
                        {p.distanceM !== undefined && <span className="text-xs text-zinc-400 shrink-0">{km(p.distanceM)}</span>}
                      </span>
                      <span className="block text-xs text-zinc-400 mt-1 pl-6">
                        {p.mapKit.length ? p.mapKit.map((k) => tx(KIT_LABEL[k])).join(" · ") : tx("Equipment not mapped — tap to see what athletes say")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {adding ? (
              <section className="panel p-3 space-y-2" aria-label={tx("Add a park")}>
                <label className="block text-xs text-zinc-400">
                  {tx("Name of the park at your location")}
                  <input
                    value={newName}
                    maxLength={60}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-700 p-2 text-sm text-zinc-100"
                    placeholder={tx("e.g. Riverside bars")}
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setAdding(false)} className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200">
                    {tx("Cancel")}
                  </button>
                  <button onClick={addPark} disabled={!newName.trim()} className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-zinc-950 text-sm font-medium">
                    {tx("Add park")}
                  </button>
                </div>
              </section>
            ) : (
              <button onClick={() => setAdding(true)} className="w-full panel p-3 text-sm text-zinc-200 flex items-center justify-center gap-2 hover:border-orange-500/60">
                <Plus size={16} className="text-orange-400" /> {tx("Training at a park that's missing? Add it")}
              </button>
            )}
          </>
        )}
      </main>
      <ParkSheet park={selected} onClose={() => setOpen(null)} onTrainHere={(eq) => selected && trainHere(selected, eq)} />
    </>
  );
}
