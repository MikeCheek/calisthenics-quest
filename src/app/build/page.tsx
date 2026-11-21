"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Minus, Play, Plus, Save, Trash2, X, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import Nav from "@/components/Nav";
import Modal from "@/components/Modal";
import PageLoading from "@/components/PageLoading";
import ExerciseBrowser, { readDraft, writeDraft, type BuildDraft } from "@/components/ExerciseBrowser";
import { updateProgress } from "@/lib/store";
import { findEntry } from "@/lib/exerciseLibrary";
import { MAX_ITEMS, MAX_SAVED_WORKOUTS, buildCustomSession, newWorkoutId, setsOf, withSets, type CustomWorkout } from "@/lib/customSession";
import { localizeDetail } from "@/lib/i18n/detail";

// Build a session of your own: pick exercises from the library, set the
// sets, start it in guided mode — and save the ones you like.
export default function BuildPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const toast = useToast();
  const router = useRouter();
  const { session, startSession } = useTrainingSession();
  const [draft, setDraft] = useState<BuildDraft>({ name: "", items: [], warmup: true });
  const [picking, setPicking] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);

  useEffect(() => setDraft(readDraft()), []);
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  const update = (d: BuildDraft) => {
    setDraft(d);
    writeDraft(d);
  };

  if (loading || !userDoc) return <PageLoading variant="list" />;
  const saved = userDoc.customWorkouts ?? [];

  const move = (i: number, dir: -1 | 1) => {
    const items = [...draft.items];
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    update({ ...draft, items });
  };
  const setItemSets = (i: number, n: number) => update({ ...draft, items: draft.items.map((it, k) => (k === i ? { ...it, sets: Math.max(1, Math.min(10, n)) } : it)) });
  const remove = (i: number) => update({ ...draft, items: draft.items.filter((_, k) => k !== i) });

  const start = (w: { name: string; items: BuildDraft["items"]; warmup: boolean }) => {
    if (session && !replacing) {
      setReplacing(true);
      toast.info(tx("A session is in progress — tap Start again to replace it."));
      return;
    }
    const s = buildCustomSession(w.name || tx("Your session"), w.items, { warmup: w.warmup, equipment: userDoc.equipment });
    if (!s) return;
    setReplacing(false);
    startSession(s);
  };

  const save = async () => {
    if (!draft.items.length) return;
    const name = draft.name.trim() || tx("My session");
    const workout: CustomWorkout = { id: editingId ?? newWorkoutId(), name, items: draft.items, warmup: draft.warmup, createdAt: new Date().toISOString() };
    const list = editingId ? saved.map((w) => (w.id === editingId ? workout : w)) : [workout, ...saved];
    if (list.length > MAX_SAVED_WORKOUTS) return toast.error(tx("You can keep up to {n} sessions — delete one first.", { n: MAX_SAVED_WORKOUTS }));
    try {
      await updateProgress(userDoc.uid, { customWorkouts: list });
      await refreshUserDoc();
      setEditingId(workout.id);
      toast.success(tx("Saved “{name}”.", { name }));
    } catch {
      toast.error("Something went wrong — try again.");
    }
  };

  const del = async (w: CustomWorkout) => {
    if (!window.confirm(tx("Delete “{name}”?", { name: w.name }))) return;
    await updateProgress(userDoc.uid, { customWorkouts: saved.filter((x) => x.id !== w.id) });
    await refreshUserDoc();
    if (editingId === w.id) setEditingId(null);
  };

  const edit = (w: CustomWorkout) => {
    update({ name: w.name, items: w.items, warmup: w.warmup });
    setEditingId(w.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const newOne = () => {
    update({ name: "", items: [], warmup: true });
    setEditingId(null);
  };

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <div>
          <h1 className="heading text-2xl text-zinc-100">{tx("Build a session")}</h1>
          <p className="text-sm text-zinc-400">{tx("Pick the exercises you want, set the sets, and train them in guided mode — timers, logging and XP included.")}</p>
        </div>

        <section className="panel p-4 space-y-3" aria-labelledby="draft-title">
          <div className="flex items-center justify-between gap-2">
            <h2 id="draft-title" className="heading text-base text-zinc-100">
              {editingId ? tx("Editing a saved session") : tx("Your session")}
            </h2>
            {(draft.items.length > 0 || editingId) && (
              <button onClick={newOne} className="text-sm text-zinc-400 hover:text-zinc-100 px-2 py-1">
                {tx("Start over")}
              </button>
            )}
          </div>
          <label className="block text-xs text-zinc-400">
            {tx("Name")}
            <input
              value={draft.name}
              onChange={(e) => update({ ...draft, name: e.target.value.slice(0, 40) })}
              placeholder={tx("e.g. Quick pull day")}
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-base"
            />
          </label>

          {draft.items.length === 0 ? (
            <p className="text-sm text-zinc-400 py-2">{tx("No exercises yet — add some from the library.")}</p>
          ) : (
            <ol className="space-y-2">
              {draft.items.map((it, i) => {
                const entry = findEntry(it.name);
                const detail = entry ? (it.sets ? withSets(entry.exercise.detail, it.sets) : entry.exercise.detail) : "";
                const n = it.sets ?? setsOf(entry?.exercise.detail ?? "3 x");
                return (
                  <li key={it.name} className="rounded-xl bg-zinc-950/50 p-3">
                    <div className="flex items-start gap-2">
                      <span className="stat-mono text-xs text-zinc-400 w-4 mt-0.5">{i + 1}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-zinc-100">{it.name}</span>
                        <span className="block text-xs text-zinc-400">{localizeDetail(detail, locale)}</span>
                      </span>
                      <button onClick={() => remove(i)} className="p-2 -m-1 text-zinc-400 hover:text-red-300" aria-label={tx("Remove {ex}", { ex: it.name })}>
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1.5">
                        <button onClick={() => move(i, -1)} disabled={i === 0} className="w-10 h-10 rounded-lg border border-zinc-700 text-zinc-300 disabled:opacity-30 flex items-center justify-center" aria-label={tx("Move up")}>
                          <ArrowUp size={16} />
                        </button>
                        <button onClick={() => move(i, 1)} disabled={i === draft.items.length - 1} className="w-10 h-10 rounded-lg border border-zinc-700 text-zinc-300 disabled:opacity-30 flex items-center justify-center" aria-label={tx("Move down")}>
                          <ArrowDown size={16} />
                        </button>
                      </span>
                      <span className="flex items-center gap-2" role="group" aria-label={tx("Sets for {ex}", { ex: it.name })}>
                        <button onClick={() => setItemSets(i, n - 1)} className="w-10 h-10 rounded-lg border border-zinc-600 text-zinc-100 flex items-center justify-center" aria-label={tx("Fewer sets")}>
                          <Minus size={16} />
                        </button>
                        <span className="stat-mono w-14 text-center text-sm text-zinc-100">{tx("Sets: {n}", { n })}</span>
                        <button onClick={() => setItemSets(i, n + 1)} className="w-10 h-10 rounded-lg border border-zinc-600 text-zinc-100 flex items-center justify-center" aria-label={tx("More sets")}>
                          <Plus size={16} />
                        </button>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <button
            onClick={() => setPicking(true)}
            disabled={draft.items.length >= MAX_ITEMS}
            className="w-full h-12 rounded-xl border border-dashed border-zinc-600 text-zinc-100 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Plus size={18} /> {tx("Add exercises")}
          </button>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={draft.warmup} onChange={(e) => update({ ...draft, warmup: e.target.checked })} className="w-5 h-5 accent-orange-500" />
            {tx("Start with a warm-up matched to these exercises")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={save} disabled={!draft.items.length} className="h-12 rounded-xl border border-zinc-600 text-zinc-100 flex items-center justify-center gap-2 disabled:opacity-40">
              <Save size={17} /> {editingId ? tx("Save changes") : tx("Save")}
            </button>
            <button
              onClick={() => start(draft)}
              disabled={!draft.items.length}
              className="h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Play size={17} /> {replacing ? tx("Replace and start") : tx("Start")}
            </button>
          </div>
        </section>

        <section className="panel p-4" aria-labelledby="saved-title">
          <h2 id="saved-title" className="heading text-base text-zinc-100 mb-2">
            {tx("Saved sessions")}
          </h2>
          {saved.length === 0 ? (
            <p className="text-sm text-zinc-400">{tx("Sessions you save show up here, one tap from starting.")}</p>
          ) : (
            <ul className="space-y-2">
              {saved.map((w) => (
                <li key={w.id} className="rounded-xl bg-zinc-950/50 p-3 flex items-center gap-2">
                  <button onClick={() => edit(w)} className="flex-1 min-w-0 text-left">
                    <span className="block text-sm text-zinc-100 truncate">{w.name}</span>
                    <span className="block text-xs text-zinc-400">{tx("{n} exercises", { n: w.items.length })}</span>
                  </button>
                  <button onClick={() => del(w)} className="w-10 h-10 rounded-lg text-zinc-400 hover:text-red-300 flex items-center justify-center" aria-label={tx("Delete {name}", { name: w.name })}>
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => start(w)} className="h-10 px-4 rounded-lg bg-orange-500 text-zinc-950 text-sm font-semibold flex items-center gap-1.5" aria-label={tx("Start {name}", { name: w.name })}>
                    <Play size={15} /> {tx("Start")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link href="/library" className="panel p-3 flex items-center gap-3 hover:border-orange-500/60">
          <BookOpen size={20} className="text-orange-400" />
          <span className="flex-1 text-sm text-zinc-100">{tx("Browse the exercise library")}</span>
        </Link>
      </main>

      <Modal open={picking} onClose={() => setPicking(false)} title={tx("Add exercises")}>
        <ExerciseBrowser
          picked={draft.items.map((i) => i.name)}
          onPick={(e) => {
            const has = draft.items.some((i) => i.name === e.exercise.name);
            if (has) update({ ...draft, items: draft.items.filter((i) => i.name !== e.exercise.name) });
            else if (draft.items.length < MAX_ITEMS) update({ ...draft, items: [...draft.items, { name: e.exercise.name }] });
          }}
        />
        <button onClick={() => setPicking(false)} className="sticky bottom-0 w-full mt-3 h-12 rounded-xl bg-zinc-100 text-zinc-950 font-semibold">
          {tx("Done ({n})", { n: draft.items.length })}
        </button>
      </Modal>
    </>
  );
}
