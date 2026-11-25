"use client";

import { nameFor } from "@/lib/anonymize";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CircleHelp, Crosshair, Heart, MapPin, Navigation, Pencil, ThumbsUp, Trash2, X } from "lucide-react";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { deleteParkReport, fetchParkLikes, fetchParkReports, reactToParkReport, saveParkEdit, saveParkReport, setParkLike } from "@/lib/store";
import { settleWrite } from "@/lib/offlineWrites";
import {
  KIT_LABEL,
  NOTE_MAX,
  cellOf,
  wikidataPhoto,
  PARK_KIT,
  REACTIONS,
  cleanNote,
  confirmation,
  directionsUrl,
  equipmentAt,
  parkKit,
  parkName,
  reactionCounts,
  type Park,
  type ParkKit,
  type ParkReport,
  type Reaction,
} from "@/lib/parks";
import type { TrainingEquipment } from "@/lib/types";

const ago = (iso: string, locale: string) => {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  const rtf = new Intl.RelativeTimeFormat(locale === "it" ? "it" : "en", { numeric: "auto" });
  if (days < 1) return rtf.format(0, "day");
  if (days < 30) return rtf.format(-days, "day");
  if (days < 365) return rtf.format(-Math.round(days / 30), "month");
  return rtf.format(-Math.round(days / 365), "year");
};

// One park: what's there (from athletes' reports and the map), the latest
// updates with reactions, and your own report. "Train here" builds today's
// session for this park's kit.
export default function ParkSheet({
  park,
  onClose,
  onTrainHere,
  onMovePin,
  onChanged,
}: {
  park: Park | null;
  onClose: () => void;
  onTrainHere: (equipment: TrainingEquipment) => void;
  onMovePin?: (park: Park) => void; // pick its real spot on the map
  onChanged?: () => void; // the name or position changed
}) {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const [reports, setReports] = useState<ParkReport[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ParkReport["kit"]>({});
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [likes, setLikes] = useState<{ count: number; mine: boolean } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoOk, setPhotoOk] = useState(true);
  const uid = userDoc?.uid;

  // likes and a photo (from the map's tags, or the place's Wikidata item)
  useEffect(() => {
    setLikes(null);
    setPhoto(park?.photo ?? null);
    setPhotoOk(true);
    if (!park || !uid) return;
    let live = true;
    fetchParkLikes(park.id, uid)
      .then((l) => live && setLikes(l))
      .catch(() => live && setLikes({ count: 0, mine: false }));
    if (!park.photo && park.wikidata)
      wikidataPhoto(park.wikidata)
        .then((p) => live && p && setPhoto(p))
        .catch(() => {});
    return () => {
      live = false;
    };
  }, [park?.id, park?.photo, park?.wikidata, uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(() => {
    if (!park) return;
    fetchParkReports(park.id)
      .then(setReports)
      .catch(() => setReports([]));
  }, [park]);

  useEffect(() => {
    setReports(null);
    setEditing(false);
    setRenaming(null);
    setMsg(null);
    load();
  }, [load]);

  const status = useMemo(() => (park && reports ? parkKit(park, reports) : []), [park, reports]);
  const mine = reports?.find((r) => r.uid === uid);
  if (!park || !userDoc) return null;
  const name = parkName(park, tx("Bar park"));
  const known = status.filter((s) => s.state !== "unknown");

  const write = async (kit: ParkReport["kit"], text: string, done: string) => {
    setSaving(true);
    const report: Omit<ParkReport, "reactions"> = {
      uid: userDoc.uid,
      name: userDoc.displayName?.split(" ")[0] || "Athlete",
      kit,
      ...(cleanNote(text) ? { note: cleanNote(text) } : {}),
      atISO: new Date().toISOString(),
    };
    const state = await settleWrite(saveParkReport(park.id, report)).catch(() => null);
    setSaving(false);
    if (!state) return setMsg(tx("Couldn't save — try again."));
    setReports((rs) => [{ ...report, reactions: mine?.reactions }, ...(rs ?? []).filter((r) => r.uid !== userDoc.uid)]);
    setEditing(false);
    setMsg(state === "queued" ? tx("Saved on this device — it goes up when you're back online.") : done);
  };

  const rename = async () => {
    const name = (renaming ?? "").trim().slice(0, 60);
    if (!name) return;
    setSaving(true);
    const editor = { uid: userDoc.uid, name: userDoc.displayName?.split(" ")[0] || "Athlete" };
    const ok = await saveParkEdit({ id: park.id, source: park.source }, { name, lat: park.lat, lon: park.lon, cell: cellOf(park.lat, park.lon) }, editor)
      .then(() => true)
      .catch(() => false);
    setSaving(false);
    if (!ok) return setMsg(tx("Couldn't save — try again."));
    setRenaming(null);
    setMsg(tx("Thanks — the park is updated for everyone."));
    onChanged?.();
  };

  const toggleLike = async () => {
    if (!likes) return;
    const on = !likes.mine;
    setLikes({ count: likes.count + (on ? 1 : -1), mine: on });
    try {
      await setParkLike(park.id, userDoc.uid, on);
    } catch {
      setLikes(likes);
      setMsg(tx("Couldn't save — try again."));
    }
  };

  const startEdit = () => {
    setDraft(mine?.kit ?? confirmation(status));
    setNote(mine?.note ?? "");
    setEditing(true);
    setMsg(null);
  };

  const react = async (r: ParkReport, reaction: Reaction) => {
    const next = r.reactions?.[userDoc.uid] === reaction ? null : reaction;
    setReports((rs) =>
      (rs ?? []).map((x) => {
        if (x.uid !== r.uid) return x;
        const reactions = { ...(x.reactions ?? {}) };
        if (next) reactions[userDoc.uid] = next;
        else delete reactions[userDoc.uid];
        return { ...x, reactions };
      })
    );
    await reactToParkReport(park.id, r.uid, userDoc.uid, next).catch(() => {
      setMsg(tx("Couldn't save — try again."));
      load();
    });
  };

  const removeMine = async () => {
    await deleteParkReport(park.id, userDoc.uid).catch(() => {});
    setReports((rs) => (rs ?? []).filter((r) => r.uid !== userDoc.uid));
    setMsg(tx("Your report was removed."));
  };

  const setKit = (k: ParkKit, v: boolean | undefined) =>
    setDraft((d) => {
      const n = { ...d };
      if (v === undefined) delete n[k];
      else n[k] = v;
      return n;
    });

  return (
    <Modal open={!!park} onClose={onClose} title={name}>
      <div className="space-y-4">
        {photo && photoOk && (
          <figure className="-mt-1 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={tx("Photo of {name}", { name })} loading="lazy" onError={() => setPhotoOk(false)} className="w-full h-40 object-cover" />
            <figcaption className="px-2 py-1 text-xs text-zinc-400">{tx("Photo: Wikimedia Commons / OpenStreetMap")}</figcaption>
          </figure>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            disabled={!likes}
            aria-pressed={!!likes?.mine}
            aria-label={likes?.mine ? tx("Unlike {name}", { name }) : tx("Like {name}", { name })}
            className={`px-3 py-1.5 rounded-full border text-sm flex items-center gap-1.5 ${likes?.mine ? "border-rose-500 bg-rose-500/15 text-rose-100" : "border-zinc-700 text-zinc-200 hover:border-rose-400"}`}
          >
            <Heart size={15} className={likes?.mine ? "fill-rose-400 text-rose-400" : ""} aria-hidden /> {likes ? likes.count : "…"}
          </button>
          {park.place && !park.name && <span className="text-xs text-zinc-400 truncate">{tx("In {place}", { place: park.place })}</span>}
        </div>
        <p className="text-xs text-zinc-400 flex items-center gap-1.5">
          <MapPin size={13} />
          {park.distanceM !== undefined && (park.distanceM < 1000 ? tx("{n} m away", { n: park.distanceM }) : tx("{n} km away", { n: (park.distanceM / 1000).toFixed(1) }))}
          {park.source === "user" ? ` · ${tx("added by an athlete")}` : ` · ${tx("from OpenStreetMap")}`}
        </p>
        {park.edit?.editedAtISO && (
          <p className="text-xs text-sky-300 -mt-2">
            {tx("Name or position updated by {name} · {d}", { name: nameFor(park.edit.editedByName ?? "", tx), d: ago(park.edit.editedAtISO, locale) })}
          </p>
        )}

        {/* the park's own info: anyone can correct the name or the spot */}
        {renaming !== null ? (
          <div className="rounded-xl border border-zinc-800 p-3 space-y-2">
            <label className="block text-xs text-zinc-400">
              {tx("Name of the park")}
              <input
                value={renaming}
                maxLength={60}
                onChange={(e) => setRenaming(e.target.value)}
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-700 p-2 text-sm text-zinc-100"
              />
            </label>
            {park.source === "osm" && <p className="text-xs text-zinc-400">{tx("Changes show in BarQuests for everyone; OpenStreetMap itself isn't changed.")}</p>}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setRenaming(null)} className="py-2 rounded-xl border border-zinc-700 text-sm text-zinc-200">
                {tx("Cancel")}
              </button>
              <button onClick={rename} disabled={saving || !renaming.trim()} className="py-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-zinc-950 text-sm font-medium">
                {saving ? tx("Saving…") : tx("Save name")}
              </button>
            </div>
          </div>
        ) : (
          !editing && (
            <div className="flex gap-2 -mt-1">
              <button onClick={() => setRenaming(park.edit?.name ?? park.name ?? "")} className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-200 hover:border-orange-500 flex items-center gap-1.5">
                <Pencil size={13} aria-hidden /> {tx("Edit name")}
              </button>
              {onMovePin && (
                <button onClick={() => onMovePin(park)} className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-200 hover:border-orange-500 flex items-center gap-1.5">
                  <Crosshair size={13} aria-hidden /> {tx("Move the pin")}
                </button>
              )}
            </div>
          )
        )}

        {reports === null ? (
          <p className="text-sm text-zinc-400" role="status">
            {tx("Loading…")}
          </p>
        ) : editing ? (
          <section aria-label={tx("What's there?")} className="space-y-2">
            <h3 className="text-sm text-zinc-100">{tx("What's there?")}</h3>
            {PARK_KIT.map((k) => (
              <div key={k} className="flex items-center justify-between gap-2">
                <span className="text-sm text-zinc-200">{tx(KIT_LABEL[k])}</span>
                <div className="flex gap-1" role="group" aria-label={tx(KIT_LABEL[k])}>
                  {(
                    [
                      [true, tx("Yes")],
                      [false, tx("No")],
                      [undefined, tx("Not sure")],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={label}
                      onClick={() => setKit(k, v)}
                      aria-pressed={draft[k] === v}
                      className={`px-2.5 py-1.5 rounded-lg text-xs border ${
                        draft[k] === v ? (v === true ? "bg-emerald-500/20 border-emerald-500 text-emerald-100" : v === false ? "bg-red-500/15 border-red-500/70 text-red-100" : "bg-zinc-700 border-zinc-500 text-zinc-100") : "border-zinc-700 text-zinc-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <label className="block text-xs text-zinc-400 pt-1">
              {tx("A note for others (optional)")}
              <textarea
                value={note}
                maxLength={NOTE_MAX}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder={tx("e.g. new rings, the low bar is wobbly, busy after 6pm")}
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-700 p-2 text-sm text-zinc-100"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setEditing(false)} className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200">
                {tx("Cancel")}
              </button>
              <button
                disabled={saving || !Object.keys(draft).length}
                onClick={() => write(draft, note, tx("Thanks — your update is on the park."))}
                className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-zinc-950 text-sm font-medium"
              >
                {saving ? tx("Saving…") : tx("Save update")}
              </button>
            </div>
          </section>
        ) : (
          <>
            <section aria-label={tx("What's there")}>
              <ul className="space-y-1.5">
                {status.map((s) => (
                  <li key={s.kit} className="flex items-center gap-2 text-sm">
                    {s.state === "yes" ? (
                      <Check size={16} className="text-emerald-400 shrink-0" aria-hidden />
                    ) : s.state === "no" ? (
                      <X size={16} className="text-red-400 shrink-0" aria-hidden />
                    ) : (
                      <CircleHelp size={16} className="text-zinc-400 shrink-0" aria-hidden />
                    )}
                    <span className={s.state === "unknown" ? "text-zinc-400" : "text-zinc-100"}>
                      {tx(KIT_LABEL[s.kit])}
                      <span className="sr-only">: {s.state === "yes" ? tx("there") : s.state === "no" ? tx("not there") : tx("not sure")}</span>
                    </span>
                    <span className="ml-auto text-xs text-zinc-400 text-right">
                      {s.yes > 0
                        ? tx("{n} confirmed · {d}", { n: s.yes, d: ago(s.lastYesISO!, locale) })
                        : s.no > 0
                          ? tx("{n} say it's gone", { n: s.no })
                          : s.onMap
                            ? tx("on the map")
                            : ""}
                    </span>
                  </li>
                ))}
              </ul>
              {!known.length && <p className="text-xs text-zinc-400 mt-2">{tx("Nobody has said what's here yet — be the first.")}</p>}
            </section>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={saving}
                onClick={() => (known.length ? write(confirmation(status), mine?.note ?? "", tx("Thanks for confirming!")) : startEdit())}
                className="py-2.5 rounded-xl border border-emerald-600/60 bg-emerald-500/10 text-emerald-100 text-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <ThumbsUp size={15} /> {tx("Still like this")}
              </button>
              <button onClick={startEdit} className="py-2.5 rounded-xl border border-zinc-700 hover:border-orange-500 text-sm text-zinc-100 flex items-center justify-center gap-1.5">
                <Pencil size={15} /> {tx("Update equipment")}
              </button>
            </div>
          </>
        )}

        {msg && (
          <p className={`text-sm ${msg === tx("Couldn't save — try again.") ? "text-amber-300" : "text-emerald-300"}`} role="status">
            {msg}
          </p>
        )}

        {!editing && reports && reports.length > 0 && (
          <section aria-label={tx("Latest updates")}>
            <h3 className="text-xs uppercase tracking-wide text-zinc-400 mb-2">{tx("Latest updates")}</h3>
            <ul className="space-y-2">
              {reports.slice(0, 8).map((r) => {
                const counts = reactionCounts(r);
                const own = r.uid === userDoc.uid;
                const there = PARK_KIT.filter((k) => r.kit[k]).map((k) => tx(KIT_LABEL[k]));
                const gone = PARK_KIT.filter((k) => r.kit[k] === false).map((k) => tx(KIT_LABEL[k]));
                return (
                  <li key={r.uid} className="rounded-xl bg-zinc-950/60 p-2.5">
                    <p className="text-xs text-zinc-400">
                      <span className="text-zinc-200">{own ? tx("You") : nameFor(r.name, tx)}</span> · {ago(r.atISO, locale)}
                    </p>
                    {there.length > 0 && <p className="text-sm text-zinc-200">{there.join(", ")}</p>}
                    {gone.length > 0 && <p className="text-xs text-red-300">{tx("Not there: {list}", { list: gone.join(", ") })}</p>}
                    {r.note && <p className="text-sm text-zinc-300 mt-0.5 break-words">“{r.note}”</p>}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {(Object.keys(REACTIONS) as Reaction[]).map((k) => {
                        const on = r.reactions?.[userDoc.uid] === k;
                        return own ? (
                          counts[k] ? (
                            <span key={k} className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-200">
                              {REACTIONS[k]} {counts[k]}
                            </span>
                          ) : null
                        ) : (
                          <button
                            key={k}
                            onClick={() => react(r, k)}
                            aria-pressed={on}
                            aria-label={tx(k === "thanks" ? "Thanks" : k === "strong" ? "Strong" : "Fire")}
                            className={`px-2 py-0.5 rounded-full text-xs border ${on ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-300"}`}
                          >
                            {REACTIONS[k]} {counts[k] ?? ""}
                          </button>
                        );
                      })}
                      {own && (
                        <button onClick={removeMine} className="ml-auto p-1 text-zinc-400 hover:text-red-300" aria-label={tx("Remove my report")}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {!editing && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a href={directionsUrl(park)} target="_blank" rel="noopener noreferrer" className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-100 flex items-center justify-center gap-1.5">
              <Navigation size={15} /> {tx("Open map")}
            </a>
            <button
              onClick={() => onTrainHere(equipmentAt(status, userDoc.equipment))}
              disabled={!reports}
              className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium disabled:opacity-50"
            >
              {tx("Train here today")}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
