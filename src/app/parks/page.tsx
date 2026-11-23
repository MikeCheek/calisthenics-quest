"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Loader2, LocateFixed, MapPin, Plus, RefreshCw, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import Modal from "@/components/Modal";
import PageLoading from "@/components/PageLoading";
import ParkSheet from "@/components/parks/ParkSheet";
import type { LatLon } from "@/components/parks/ParksMap";
import { addUserPark, fetchOsmCells, fetchUserParks, saveOsmCells, saveParkEdit } from "@/lib/store";
import { locate, savedPlace, savePlace } from "@/lib/weather";
import { REFRESH_MIN_HOURS, cellOf, cellsCovering, distanceM, KIT_LABEL, loadOsmParks, mergeEdits, parkName, type LoadResult, type Park, type UserParkDoc } from "@/lib/parks";
import { setTodayEquipment } from "@/lib/todayEquipment";
import type { TrainingEquipment } from "@/lib/types";

const ParksMap = dynamic(() => import("@/components/parks/ParksMap").catch(() => ({ default: () => null })), { ssr: false });

const RADII = [2000, 5000, 10000];
const ZOOM_FOR: Record<number, number> = { 2000: 14, 5000: 13, 10000: 12 };
const NOWHERE = { lat: 45.0, lon: 10.5, zoom: 5 }; // until you share a location or move the map

type Picking = { kind: "add" } | { kind: "move"; park: Park } | null;

export default function ParksPage() {
  const { user, userDoc, loading } = useAuth();
  const { tx, locale } = useLanguage();
  const router = useRouter();

  const [me, setMe] = useState<LatLon | null | undefined>(undefined);
  const [searchAt, setSearchAt] = useState<LatLon | null>(null);
  const [radius, setRadius] = useState(RADII[1]);
  const [view, setView] = useState<{ center: LatLon; zoom: number } | null>(null);
  const [flyTo, setFlyTo] = useState<(LatLon & { zoom?: number; n: number }) | null>(null);

  const [osm, setOsm] = useState<LoadResult | null>(null);
  const [docs, setDocs] = useState<UserParkDoc[]>([]);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  const [open, setOpen] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [picking, setPicking] = useState<Picking>(null);
  const [newSpot, setNewSpot] = useState<LatLon | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  useEffect(() => {
    const p = savedPlace();
    setMe(p);
    if (p) setSearchAt(p);
  }, []);

  const fly = (p: LatLon, zoom?: number) => setFlyTo({ ...p, zoom, n: Date.now() });

  const load = useCallback(async (at: LatLon, r: number, force = false) => {
    setBusy(true);
    const [result, added] = await Promise.all([
      loadOsmParks(at, r, { read: fetchOsmCells, write: saveOsmCells }, { force }),
      fetchUserParks(cellsCovering(at.lat, at.lon, r)).catch(() => [] as UserParkDoc[]),
    ]);
    setOsm(result);
    setDocs(added);
    setBusy(false);
  }, []);

  useEffect(() => {
    if (searchAt) load(searchAt, radius);
  }, [searchAt, radius, load]);

  const parks = useMemo(() => (osm && searchAt ? mergeEdits(osm.parks, docs, searchAt, radius) : []), [osm, docs, searchAt, radius]);

  const findMe = async () => {
    setLocating(true);
    try {
      const p = await locate();
      savePlace(p);
      setMe(p);
      setSearchAt(p);
      setDenied(false);
      fly(p, ZOOM_FOR[radius]);
    } catch {
      setDenied(true);
    } finally {
      setLocating(false);
    }
  };

  const searchHere = () => {
    if (!view) return;
    setSearchAt(view.center);
    setOpen(null);
  };

  const pickRadius = (r: number) => {
    setRadius(r);
    if (searchAt) fly(searchAt, ZOOM_FOR[r]);
  };

  const trainHere = (park: Park, equipment: TrainingEquipment) => {
    setTodayEquipment({ kind: "park", label: parkName(park, tx("Bar park")), parkId: park.id, equipment });
    router.push("/dashboard");
  };

  const editor = () => ({ uid: userDoc!.uid, name: userDoc!.displayName?.split(" ")[0] || "Athlete" });

  // the pin's spot is the map's centre while picking
  const confirmPick = async () => {
    if (!view || !picking || !userDoc) return;
    const spot = view.center;
    if (picking.kind === "add") {
      setNewSpot(spot);
      setPicking(null);
      return;
    }
    const park = picking.park;
    setPicking(null);
    await saveParkEdit({ id: park.id, source: park.source }, { name: park.edit?.name ?? park.name ?? "", lat: spot.lat, lon: spot.lon, cell: cellOf(spot.lat, spot.lon) }, editor()).catch(() => {});
    if (searchAt) await load(searchAt, radius);
    setOpen(park.id);
  };

  const addPark = async () => {
    if (!newSpot || !userDoc || !newName.trim()) return;
    const doc = { name: newName.trim().slice(0, 60), lat: newSpot.lat, lon: newSpot.lon, cell: cellOf(newSpot.lat, newSpot.lon), source: "user" as const, createdBy: userDoc.uid, createdAtISO: new Date().toISOString() };
    const id = await addUserPark(doc).catch(() => null);
    if (!id) return;
    setDocs((d) => [...d, { ...doc, id }]);
    setNewSpot(null);
    setNewName("");
    // a park added outside the current search still shows: search around it
    if (!searchAt || distanceM(searchAt, newSpot) > radius) setSearchAt(newSpot);
    setOpen(id);
  };

  if (loading || !userDoc || me === undefined) return <PageLoading variant="list" />;

  const selected = parks.find((p) => p.id === open) ?? null;
  const km = (m: number) => (m < 1000 ? tx("{n} m away", { n: m }) : tx("{n} km away", { n: (m / 1000).toFixed(1) }));
  const day = (iso: string) => new Date(iso).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const movedAway = !!view && (!searchAt || distanceM(view.center, searchAt) > radius * 0.35);
  const initial = searchAt ? { ...searchAt, zoom: ZOOM_FOR[radius] } : NOWHERE;
  const chip = "pointer-events-auto rounded-full border border-zinc-700 bg-zinc-950/85 backdrop-blur text-zinc-100 shadow-lg";

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="fixed inset-0 lg:left-72 z-30 bg-zinc-950 overflow-hidden">
        <ParksMap
          initial={initial}
          flyTo={flyTo}
          range={searchAt ? { ...searchAt, radiusM: radius } : null}
          me={me}
          parks={picking ? [] : parks}
          selected={open}
          onSelect={(id) => setOpen(id)}
          onMove={(center, zoom) => setView({ center, zoom })}
          picking={!!picking}
          label={tx("Map of bar parks")}
          labels={{
            cluster: (n) => tx("{n} parks here — zoom in", { n }),
            park: (p) => `${parkName(p, tx("Bar park"))}${p.mapKit.length ? ` · ${p.mapKit.map((k) => tx(KIT_LABEL[k])).join(", ")}` : ""}`,
            you: tx("You are here"),
          }}
        />

        {/* top: back, title, location; then the range and the search */}
        <div className="absolute top-0 inset-x-0 z-10 p-3 space-y-2 pointer-events-none safe-top">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className={`${chip} p-2.5`} aria-label={tx("Back to Today")}>
              <ArrowLeft size={18} aria-hidden />
            </Link>
            <h1 className={`${chip} px-4 py-2 heading text-base flex items-center gap-2 min-w-0`}>
              <MapPin size={16} className="text-orange-400 shrink-0" aria-hidden /> <span className="truncate">{tx("Bar parks near you")}</span>
            </h1>
            <button onClick={findMe} disabled={locating} className={`${chip} ml-auto p-2.5`} aria-label={tx("Go to my location")}>
              {locating ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <LocateFixed size={18} className="text-sky-300" aria-hidden />}
            </button>
          </div>
          {!picking && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex gap-1" role="group" aria-label={tx("Distance")}>
                {RADII.map((r) => (
                  <button
                    key={r}
                    onClick={() => pickRadius(r)}
                    aria-pressed={radius === r}
                    className={`${chip} px-3 py-1.5 text-xs ${radius === r ? "!border-orange-400 !bg-orange-500 !text-zinc-950 font-medium" : ""}`}
                  >
                    {r / 1000} km
                  </button>
                ))}
              </div>
              {movedAway && (
                <button onClick={searchHere} className={`${chip} px-3 py-1.5 text-xs !bg-orange-500 !border-orange-400 !text-zinc-950 font-medium flex items-center gap-1.5`}>
                  <Search size={13} aria-hidden /> {tx("Search this area")}
                </button>
              )}
            </div>
          )}
          {!picking && searchAt && (
            <p className={`${chip} inline-flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300`} role="status">
              {busy ? (
                <>
                  <Loader2 size={13} className="animate-spin" aria-hidden /> {tx("Looking for bar parks…")}
                </>
              ) : osm?.failed ? (
                <span className="text-amber-300">
                  {osm.updatedAtISO ? tx("OpenStreetMap is busy — showing data from {d}", { d: day(osm.updatedAtISO) }) : tx("Couldn't reach OpenStreetMap right now — showing only parks athletes added.")}
                </span>
              ) : osm?.updatedAtISO ? (
                tx("OpenStreetMap data · updated {d}", { d: day(osm.updatedAtISO) })
              ) : null}
              {!busy && osm && (osm.failed || !osm.updatedAtISO || Date.now() - Date.parse(osm.updatedAtISO) > REFRESH_MIN_HOURS * 3600000) && (
                <button onClick={() => searchAt && load(searchAt, radius, true)} className="flex items-center gap-1 text-orange-300 hover:text-orange-200 underline-offset-2 hover:underline">
                  <RefreshCw size={12} aria-hidden /> {osm.failed ? tx("Try again") : tx("Refresh")}
                </button>
              )}
            </p>
          )}
        </div>

        {/* no place yet */}
        {!searchAt && !picking && (
          <div className="absolute inset-x-3 top-1/3 z-10 mx-auto max-w-sm panel p-4 text-center space-y-3">
            <p className="text-sm text-zinc-300">
              {denied ? tx("Location is blocked — move the map to your area and search there instead.") : tx("Use your location, or move the map to any area and search there.")}
            </p>
            {!denied && (
              <button onClick={findMe} disabled={locating} className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium inline-flex items-center gap-2">
                <LocateFixed size={16} /> {locating ? tx("Locating…") : tx("Use my location")}
              </button>
            )}
          </div>
        )}

        {/* picking a spot: the pin stays in the middle, the map moves under it */}
        {picking && (
          <>
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full pointer-events-none" aria-hidden>
              <div className="park-pin park-pin--user is-selected">
                <span>+</span>
              </div>
            </div>
            <div className="absolute inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-10 mx-auto max-w-md panel p-3 space-y-2" role="dialog" aria-label={tx("Pick the spot")}>
              <p className="text-sm text-zinc-200">
                {picking.kind === "add" ? tx("Move the map until the pin is on the park, or tap the spot.") : tx("Move the map until the pin is on {name}'s real spot.", { name: parkName(picking.park, tx("Bar park")) })}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPicking(null)} className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200 flex items-center justify-center gap-1.5">
                  <X size={15} aria-hidden /> {tx("Cancel")}
                </button>
                <button onClick={confirmPick} className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium flex items-center justify-center gap-1.5">
                  <Check size={15} aria-hidden /> {picking.kind === "add" ? tx("Put the park here") : tx("Save position")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* the list: a sheet on phones, a panel on larger screens */}
        {!picking && searchAt && (
          <section
            aria-label={tx("Bar parks")}
            className={`absolute z-10 inset-x-0 bottom-0 sm:inset-x-auto sm:right-3 sm:top-36 sm:bottom-3 sm:w-96 flex flex-col rounded-t-2xl sm:rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur shadow-2xl safe-bottom ${
              listOpen ? "max-h-[60dvh]" : "max-h-[60dvh] sm:max-h-none"
            }`}
          >
            <button onClick={() => setListOpen((o) => !o)} aria-expanded={listOpen} className="flex items-center gap-2 px-4 py-3 text-left sm:cursor-default">
              <span className="flex-1 text-sm text-zinc-100">
                {busy && !osm ? tx("Looking for bar parks…") : parks.length === 1 ? tx("1 park in {km} km", { km: radius / 1000 }) : tx("{n} parks in {km} km", { n: parks.length, km: radius / 1000 })}
              </span>
              <span className="sm:hidden text-zinc-400">{listOpen ? <ChevronDown size={18} aria-hidden /> : <ChevronUp size={18} aria-hidden />}</span>
            </button>
            <div className={`${listOpen ? "flex" : "hidden"} sm:flex flex-col min-h-0 flex-1`}>
              <ul className="overflow-y-auto px-3 space-y-1.5 min-h-0 flex-1">
                {parks.length === 0 && !busy && <li className="text-sm text-zinc-400 px-1 pb-2">{tx("No bar parks mapped around here yet. Try a wider distance, or add one you know.")}</li>}
                {parks.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setOpen(p.id);
                        fly(p, 16);
                      }}
                      className={`w-full text-left rounded-xl border px-3 py-2.5 ${open === p.id ? "border-orange-500/70 bg-orange-500/10" : "border-zinc-800 hover:border-zinc-600"}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.source === "user" ? "bg-purple-400" : p.edit ? "bg-sky-400" : "bg-orange-500"}`} aria-hidden />
                        <span className="flex-1 min-w-0 truncate text-sm text-zinc-100">{parkName(p, tx("Bar park"))}</span>
                        {p.distanceM !== undefined && <span className="text-xs text-zinc-400 shrink-0">{km(p.distanceM)}</span>}
                      </span>
                      <span className="block text-xs text-zinc-400 mt-0.5 pl-[18px] truncate">
                        {p.mapKit.length ? p.mapKit.map((k) => tx(KIT_LABEL[k])).join(" · ") : tx("Equipment not mapped — tap to see what athletes say")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="p-3 border-t border-zinc-800">
                <button
                  onClick={() => {
                    setOpen(null);
                    setListOpen(false);
                    setPicking({ kind: "add" });
                  }}
                  className="w-full py-2.5 rounded-xl border border-zinc-700 hover:border-orange-500 text-sm text-zinc-100 flex items-center justify-center gap-2"
                >
                  <Plus size={16} className="text-orange-400" aria-hidden /> {tx("Add a missing park")}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <ParkSheet
        park={selected}
        onClose={() => setOpen(null)}
        onTrainHere={(eq) => selected && trainHere(selected, eq)}
        onMovePin={(p) => {
          setOpen(null);
          fly(p, 17);
          setPicking({ kind: "move", park: p });
        }}
        onChanged={() => searchAt && load(searchAt, radius)}
      />

      <Modal open={!!newSpot} onClose={() => setNewSpot(null)} title={tx("Add a park")}>
        <div className="space-y-3">
          <label className="block text-xs text-zinc-400">
            {tx("Name of the park")}
            <input
              value={newName}
              maxLength={60}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-700 p-2.5 text-sm text-zinc-100"
              placeholder={tx("e.g. Riverside bars")}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setNewSpot(null)} className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200">
              {tx("Cancel")}
            </button>
            <button onClick={addPark} disabled={!newName.trim()} className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-zinc-950 text-sm font-medium">
              {tx("Add park")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
