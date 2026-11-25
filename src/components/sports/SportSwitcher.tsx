"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateProgress } from "@/lib/store";
import { takeSportIntent } from "@/lib/sports/intent";
import { levelFromXp } from "@/lib/xp";
import {
  ALL_SPORTS,
  SPORTS,
  SPORT_META,
  activeSportOf,
  isExtraSport,
  newTrack,
  sportXp,
  type Experience,
  type ExtraSport,
  type SportId,
} from "@/lib/sports";

const EXPERIENCE: { id: Experience; label: string; hint: string }[] = [
  { id: "new", label: "New to it", hint: "Start from the foundations" },
  { id: "some", label: "Some practice", hint: "Skip the very first steps" },
  {
    id: "experienced",
    label: "Experienced",
    hint: "Start further up each skill",
  },
];
const LENGTHS = [15, 25, 40, 60];

// Like switching language on Duolingo: the sports you follow, each with its
// own level, one tap to switch, and others to start. Nothing is lost.
export default function SportSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const [open, setOpen] = useState(false);
  const [setup, setSetup] = useState<ExtraSport | null>(null);
  const [experience, setExperience] = useState<Experience>("new");
  const [goals, setGoals] = useState<string[]>([]);
  const [minutes, setMinutes] = useState(25);
  const [busy, setBusy] = useState(false);
  // arrived from a sport's landing page: offer its setup (or switch to it)
  const onboarded = !!userDoc?.onboarded;
  useEffect(() => {
    if (!onboarded || !compact) return; // the header one (always mounted) takes it; its dialog is a portal
    const want = takeSportIntent();
    if (!want) return;
    if (userDoc?.sports?.[want]) {
      if (userDoc.activeSport !== want)
        void updateProgress(userDoc.uid, { activeSport: want }).then(
          refreshUserDoc,
        );
      return;
    }
    setOpen(true);
    openSetup(want);
    // once, when the app is first ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarded]);
  if (!userDoc?.onboarded) return null;
  const active = activeSportOf(userDoc);
  const meta = SPORT_META[active];

  const choose = async (s: SportId) => {
    setBusy(true);
    await updateProgress(userDoc.uid, { activeSport: s }).catch(() => {});
    await refreshUserDoc();
    setBusy(false);
    setOpen(false);
  };

  const start = async () => {
    if (!setup) return;
    setBusy(true);
    const track = newTrack(SPORTS[setup], experience, goals, minutes);
    await updateProgress(userDoc.uid, {
      sports: { ...(userDoc.sports ?? {}), [setup]: track },
      activeSport: setup,
    }).catch(() => {});
    await refreshUserDoc();
    setBusy(false);
    setSetup(null);
    setOpen(false);
  };

  const openSetup = (s: ExtraSport) => {
    setSetup(s);
    setExperience("new");
    setGoals([]);
    setMinutes(
      userDoc.body?.sessionLengthMinutes &&
        userDoc.body.sessionLengthMinutes <= 60
        ? Math.min(60, userDoc.body.sessionLengthMinutes)
        : 25,
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={tx("Sport: {name} — change", { name: tx(meta.name) })}
        className={`flex items-center gap-1.5 rounded-full border border-zinc-700 hover:border-orange-500 text-zinc-100 ${compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}
      >
        <span aria-hidden>{meta.emoji}</span>
        <span className="truncate max-w-[7rem]">{tx(meta.name)}</span>
        <ChevronDown size={14} className="text-zinc-400" aria-hidden />
      </button>

      <Modal
        open={open}
        onClose={() => (setOpen(false), setSetup(null))}
        title={
          setup
            ? tx("Start {name}", { name: tx(SPORT_META[setup].name) })
            : tx("Your sports")
        }
      >
        {!setup ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              {tx(
                "Follow more than one sport: each keeps its own skills and level, and your streak and XP count them all.",
              )}
            </p>
            <ul className="space-y-2">
              {ALL_SPORTS.map((s) => {
                const m = SPORT_META[s];
                const started =
                  s === "calisthenics" || !!userDoc.sports?.[s as ExtraSport];
                const isActive = s === active;
                return (
                  <li key={s}>
                    <button
                      disabled={busy}
                      onClick={() =>
                        started
                          ? isActive
                            ? setOpen(false)
                            : choose(s)
                          : isExtraSport(s) && openSetup(s)
                      }
                      className={`w-full text-left rounded-xl border px-3 py-3 flex items-center gap-3 ${isActive ? "border-orange-500 bg-orange-500/10" : "border-zinc-800 hover:border-zinc-600"}`}
                    >
                      <span className="text-2xl" aria-hidden>
                        {m.emoji}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-zinc-100">
                          {tx(m.name)}
                          {s === "calisthenics" && (
                            <span className="ml-1.5 text-xs text-orange-300">
                              {tx("main")}
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-zinc-400 truncate">
                          {started
                            ? tx("Level {n} · {xp} XP", {
                                n: levelFromXp(sportXp(userDoc, s)),
                                xp: sportXp(userDoc, s),
                              })
                            : tx(m.tagline)}
                        </span>
                      </span>
                      {isActive ? (
                        <Check
                          size={18}
                          className="text-orange-400 shrink-0"
                          aria-label={tx("Current")}
                        />
                      ) : started ? (
                        <span className="text-xs text-zinc-300 shrink-0">
                          {tx("Switch")}
                        </span>
                      ) : (
                        <span className="text-xs text-orange-300 shrink-0 flex items-center gap-1">
                          <Plus size={13} aria-hidden /> {tx("Start")}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            <section>
              <h3 className="text-sm text-zinc-100 mb-2">
                {tx("How much {name} have you done?", {
                  name: tx(SPORT_META[setup].name),
                })}
              </h3>
              <div
                className="grid grid-cols-1 gap-1.5"
                role="radiogroup"
                aria-label={tx("Experience")}
              >
                {EXPERIENCE.map((e) => (
                  <button
                    key={e.id}
                    role="radio"
                    aria-checked={experience === e.id}
                    onClick={() => setExperience(e.id)}
                    className={`text-left rounded-xl border px-3 py-2 ${experience === e.id ? "border-orange-500 bg-orange-500/10" : "border-zinc-800"}`}
                  >
                    <span className="block text-sm text-zinc-100">
                      {tx(e.label)}
                    </span>
                    <span className="block text-xs text-zinc-400">
                      {tx(e.hint)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-sm text-zinc-100 mb-1">
                {tx("What do you want most? (up to 3)")}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {SPORTS[setup].skills.map((sk) => {
                  const on = goals.includes(sk.key);
                  return (
                    <button
                      key={sk.key}
                      aria-pressed={on}
                      onClick={() =>
                        setGoals((g) =>
                          on
                            ? g.filter((x) => x !== sk.key)
                            : g.length < 3
                              ? [...g, sk.key]
                              : g,
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs border ${on ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-300"}`}
                    >
                      {sk.name}
                    </button>
                  );
                })}
              </div>
            </section>
            <section>
              <h3 className="text-sm text-zinc-100 mb-1">
                {tx("Session length")}
              </h3>
              <div
                className="flex gap-1.5"
                role="group"
                aria-label={tx("Session length")}
              >
                {LENGTHS.map((m) => (
                  <button
                    key={m}
                    aria-pressed={minutes === m}
                    onClick={() => setMinutes(m)}
                    className={`px-3 py-1.5 rounded-full text-xs border ${minutes === m ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-300"}`}
                  >
                    {tx("{n} min", { n: m })}
                  </button>
                ))}
              </div>
            </section>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSetup(null)}
                className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200"
              >
                {tx("Back")}
              </button>
              <button
                onClick={start}
                disabled={busy}
                className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium disabled:opacity-60"
              >
                {tx("Start {name}", { name: tx(SPORT_META[setup].name) })}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
