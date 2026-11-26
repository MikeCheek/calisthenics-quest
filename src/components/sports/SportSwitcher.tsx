"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import SportSetupForm from "@/components/sports/SportSetupForm";
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
  const [busy, setBusy] = useState(false);
  const router = useRouter();
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
    // started with another sport: calisthenics' skill check comes first
    if (s === "calisthenics" && userDoc.calisthenicsPending) {
      setOpen(false);
      router.push("/onboarding?sport=calisthenics");
      return;
    }
    setBusy(true);
    await updateProgress(userDoc.uid, { activeSport: s }).catch(() => {});
    await refreshUserDoc();
    setBusy(false);
    setOpen(false);
  };

  const start = async (experience: Experience, goals: string[], minutes: number) => {
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

  const openSetup = (s: ExtraSport) => setSetup(s);

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
                  s === "calisthenics"
                    ? !userDoc.calisthenicsPending
                    : !!userDoc.sports?.[s as ExtraSport];
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
                          : isExtraSport(s)
                            ? openSetup(s)
                            : choose(s)
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
          <SportSetupForm
            sport={setup}
            initialMinutes={userDoc.body?.sessionLengthMinutes ?? 25}
            busy={busy}
            onBack={() => setSetup(null)}
            onStart={start}
          />
        )}
      </Modal>
    </>
  );
}
