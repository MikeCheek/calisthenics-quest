"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Play, Plus, Check, Minus, ChevronRight } from "lucide-react";
import Modal from "./Modal";
import FormGuide from "@/components/FormGuide";
import ExerciseDemo from "./ExerciseDemo";
import ExerciseHistory from "./ExerciseHistory";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { activeSportOf } from "@/lib/sports";
import { libraryEntries, searchLibrary, type LibraryEntry, type LibraryKind } from "@/lib/exerciseLibrary";
import { AREA_LABEL, AREAS, type Area } from "@/lib/compare";
import { buildCustomSession, setsOf, type CustomItem } from "@/lib/customSession";
import { localizedDescription } from "@/lib/exerciseTiming";
import { localizeDetail } from "@/lib/i18n/detail";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { SKILL_FIELD_LABEL, type TrainingEquipment } from "@/lib/types";

// The exercise library (app/library) and, in "pick" mode, the picker the
// session builder uses. Tap an exercise for its sheet: how to do it, what
// it needs, and "Do it now" or "Add to my session".

export const EQUIPMENT_LABEL: Record<keyof TrainingEquipment, string> = {
  pullUpBar: "Pull-up bar",
  parallelBars: "Dip bars",
  rings: "Rings",
  wallSpace: "Wall",
  verticalPole: "Pole",
  monkeyBars: "Monkey bars",
  weights: "Weights",
  resistanceBands: "Bands",
  homeBar: "Pull-up bar at home",
  parallettes: "Parallettes",
};

const KINDS: { id: LibraryKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "skill", label: "Skills" },
  { id: "strength", label: "Strength" },
  { id: "mobility", label: "Mobility" },
  { id: "conditioning", label: "Conditioning" },
];

const PAGE = 30;
const DRAFT_KEY = "barquests:build-draft";

// the builder's draft, kept on the device until it's started or saved
export interface BuildDraft {
  name: string;
  items: CustomItem[];
  warmup: boolean;
}
export function readDraft(): BuildDraft {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null") as BuildDraft | null;
    if (d && Array.isArray(d.items)) return d;
  } catch {
    /* none */
  }
  return { name: "", items: [], warmup: true };
}
export function writeDraft(d: BuildDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* not important */
  }
}

export function Difficulty({ value }: { value: number }) {
  const { tx } = useLanguage();
  const n = Math.max(1, Math.min(5, Math.round(value)));
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={tx("Difficulty {n} of 5", { n })} title={tx("Difficulty {n} of 5", { n })}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`w-1.5 h-3 rounded-sm ${i <= n ? "bg-orange-400" : "bg-zinc-700"}`} />
      ))}
    </span>
  );
}

export default function ExerciseBrowser({ onPick, picked = [] }: { onPick?: (e: LibraryEntry) => void; picked?: string[] }) {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<LibraryKind | "all">("all");
  const [area, setArea] = useState<Area | "all">("all");
  const [mine, setMine] = useState(true);
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<LibraryEntry | null>(null);

  const sport = activeSportOf(userDoc);
  const all = useMemo(() => libraryEntries(sport), [sport]);
  const results = useMemo(
    () =>
      searchLibrary(
        all,
        { query, kind, area, equipment: mine && userDoc ? userDoc.equipment : undefined },
        (e) => (locale === "it" ? localizedDescription(e.exercise, "it") ?? "" : "")
      ),
    [all, query, kind, area, mine, userDoc, locale]
  );
  useEffect(() => setShown(PAGE), [query, kind, area, mine]);

  const chip = (on: boolean) =>
    `shrink-0 text-sm px-3 py-1.5 [@media(pointer:coarse)]:min-h-11 rounded-full border ${on ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"}`;

  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">{tx("Search exercises")}</span>
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tx("Search: pull-up, planche, wrists…")}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-3 py-3 text-zinc-100"
        />
      </label>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1" role="group" aria-label={tx("Type")}>
        {KINDS.map((k) => (
          <button key={k.id} onClick={() => setKind(k.id)} aria-pressed={kind === k.id} className={chip(kind === k.id)}>
            {tx(k.label)}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1" role="group" aria-label={tx("Muscle group")}>
        {(["all", ...AREAS] as (Area | "all")[]).map((a) => (
          <button key={a} onClick={() => setArea(a)} aria-pressed={area === a} className={chip(area === a)}>
            {a === "all" ? tx("Everywhere") : tx(AREA_LABEL[a])}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="w-5 h-5 accent-orange-500" />
        {tx("Only what my equipment allows")}
      </label>

      <p className="text-xs text-zinc-400" aria-live="polite">
        {tx("{n} exercises", { n: results.length })}
      </p>
      <ul className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
        {results.slice(0, shown).map((e) => {
          const isPicked = picked.includes(e.exercise.name);
          return (
            <li key={e.exercise.name}>
              <button
                onClick={() => (onPick ? onPick(e) : setOpen(e))}
                className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3 ${isPicked ? "bg-emerald-500/10 border border-emerald-500/50" : "bg-zinc-900 border border-zinc-800 hover:border-zinc-600"}`}
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-zinc-100">{e.exercise.name}</span>
                  <span className="block text-xs text-zinc-400 truncate">
                    {e.sportSkill ? `${e.sportSkill} · ${e.stage}` : e.skill ? `${SKILL_FIELD_LABEL[e.skill]} · ${tx(STAGE_LABEL[e.stage ?? ""] ?? e.stage ?? "")}` : tx(AREA_LABEL[e.area])} · {localizeDetail(e.exercise.detail, locale)}
                  </span>
                </span>
                <Difficulty value={e.difficulty} />
                {onPick ? (
                  isPicked ? <Check size={18} className="text-emerald-400 shrink-0" /> : <Plus size={18} className="text-zinc-400 shrink-0" />
                ) : (
                  <ChevronRight size={18} className="text-zinc-400 shrink-0" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {results.length > shown && (
        <button onClick={() => setShown((n) => n + PAGE)} className="w-full py-3 rounded-xl border border-zinc-700 text-sm text-zinc-200">
          {tx("Show more ({n} left)", { n: results.length - shown })}
        </button>
      )}
      {results.length === 0 && <p className="text-sm text-zinc-400 text-center py-6">{tx("Nothing matches — try fewer words, or include exercises for other equipment.")}</p>}

      <ExerciseSheet entry={open} onClose={() => setOpen(null)} />
    </div>
  );
}

// An exercise's sheet: what it is and how to do it — and "Do it now"
export function ExerciseSheet({ entry, onClose }: { entry: LibraryEntry | null; onClose: () => void }) {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const toast = useToast();
  const { session, startSession } = useTrainingSession();
  const [sets, setSets] = useState(3);
  const [warmup, setWarmup] = useState(false);
  const [replacing, setReplacing] = useState(false);

  useEffect(() => {
    if (entry) {
      setSets(setsOf(entry.exercise.detail));
      setReplacing(false);
    }
  }, [entry]);

  if (!entry || !userDoc) return null;
  const e = entry.exercise;
  const missing = entry.needs.filter((alts) => !alts.some((k) => userDoc.equipment[k]));

  const doItNow = () => {
    if (session && !replacing) return setReplacing(true);
    const s = buildCustomSession(e.name, [{ name: e.name, sets }], { warmup, equipment: userDoc.equipment });
    if (!s) return;
    onClose();
    startSession(s);
  };

  const addToSession = () => {
    const d = readDraft();
    if (d.items.some((i) => i.name === e.name)) return toast.info(tx("Already in your session."));
    writeDraft({ ...d, items: [...d.items, { name: e.name, sets }].slice(0, 12) });
    toast.success(tx("Added to your session — open Build a session to start it."));
  };

  return (
    <Modal open onClose={onClose} title={e.name}>
      <div className="space-y-3">
        <p className="text-sm text-zinc-400 flex items-center gap-2 flex-wrap">
          {entry.skill && (
            <span className="text-zinc-200">
              {SKILL_FIELD_LABEL[entry.skill]} · {tx(STAGE_LABEL[entry.stage ?? ""] ?? entry.stage ?? "")}
            </span>
          )}
          <span>{tx(AREA_LABEL[entry.area])}</span>
          <Difficulty value={entry.difficulty} />
        </p>
        {entry.hasDemo && <ExerciseDemo exerciseName={e.name} width={180} className="mx-auto" />}
        <p className="text-base text-zinc-200">{localizeDetail(e.detail, locale)}</p>
        {e.description && <p className="text-sm text-zinc-300">{localizedDescription(e, locale)}</p>}
        {e.cue && <p className="text-sm text-orange-300/90 italic">{tx(e.cue)}</p>}
        <FormGuide exerciseName={e.name} />
        <p className="text-xs text-zinc-400">
          {tx("Needs")}:{" "}
          {entry.needs.length ? entry.needs.map((alts) => alts.map((k) => tx(EQUIPMENT_LABEL[k])).join(tx(" or "))).join(" + ") : tx("nothing but the floor")}
        </p>
        <section className="rounded-xl bg-zinc-950/50 p-3" aria-label={tx("Your progress")}>
          <h3 className="text-xs uppercase tracking-wide text-zinc-400 mb-2">{tx("Your progress")}</h3>
          <ExerciseHistory name={e.name} />
        </section>
        {missing.length > 0 && <p className="text-sm text-amber-300">{tx("Your equipment doesn't include this — you can still do it if you're somewhere that has it.")}</p>}

        <div className="rounded-xl bg-zinc-950/50 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-200">{tx("Sets")}</span>
            <span className="flex items-center gap-2">
              <button onClick={() => setSets((n) => Math.max(1, n - 1))} className="w-11 h-11 rounded-xl border border-zinc-600 text-zinc-100 flex items-center justify-center" aria-label={tx("Fewer sets")}>
                <Minus size={18} />
              </button>
              <span className="stat-mono text-xl w-8 text-center" aria-live="polite">
                {sets}
              </span>
              <button onClick={() => setSets((n) => Math.min(10, n + 1))} className="w-11 h-11 rounded-xl border border-zinc-600 text-zinc-100 flex items-center justify-center" aria-label={tx("More sets")}>
                <Plus size={18} />
              </button>
            </span>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={warmup} onChange={(ev) => setWarmup(ev.target.checked)} className="w-5 h-5 accent-orange-500" />
            {tx("Warm up first (about 3 minutes)")}
          </label>
          {replacing && <p className="text-sm text-amber-300">{tx("A session is in progress — starting this one replaces it. Tap again to go ahead.")}</p>}
          <button onClick={doItNow} className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-base font-semibold flex items-center justify-center gap-2">
            <Play size={18} /> {replacing ? tx("Replace and start") : tx("Do it now")}
          </button>
          <button onClick={addToSession} className="w-full h-11 rounded-xl border border-zinc-600 text-zinc-100 text-sm flex items-center justify-center gap-2">
            <Plus size={16} /> {tx("Add to my session")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
