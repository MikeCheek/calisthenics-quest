"use client";

import Modal from "@/components/Modal";
import ExerciseDemo from "@/components/ExerciseDemo";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { updateProgress } from "@/lib/store";
import { localizeDetail } from "@/lib/i18n/detail";
import { SPORTS } from "@/lib/sports";
import { passStageCheck } from "@/lib/sports/extras";
import type { ExtraSport } from "@/lib/sports/types";

// A stage check in yoga or Pilates: the current stage's main exercise, done
// cleanly, moves the skill up now (it's offered once the stage is nearly
// mastered, so it confirms what training already shows).
export default function StageCheck({ sport, skill, onClose }: { sport: ExtraSport; skill: string | null; onClose: () => void }) {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const toast = useToast();
  const def = SPORTS[sport];
  const sk = skill ? def.skills.find((s) => s.key === skill) : undefined;
  const track = userDoc?.sports?.[sport];
  if (!userDoc || !track || !sk) return <Modal open={false} onClose={onClose} title="">{null}</Modal>;
  const cur = Math.min(track.stage[sk.key] ?? 0, sk.stages.length - 1);
  const next = sk.stages[cur + 1];
  const exercise = sk.stages[cur].exercises[0];

  const pass = async () => {
    const { track: t, xp } = passStageCheck(def, track, sk.key);
    await updateProgress(userDoc.uid, { sports: { ...userDoc.sports, [sport]: t }, xp: (userDoc.xp ?? 0) + xp }).catch(() => {});
    await refreshUserDoc();
    toast.success(tx("{skill}: up to {stage}!", { skill: sk.name, stage: next?.label ?? "" }));
    onClose();
  };

  return (
    <Modal open={!!skill} onClose={onClose} title={tx("Stage check: {skill}", { skill: sk.name })}>
      <div className="space-y-3">
        <div className="aspect-[4/3] max-w-xs mx-auto">
          <ExerciseDemo exerciseName={exercise.name} width={260} className="h-full w-full [&_svg]:h-full [&_svg]:w-full" />
        </div>
        <p className="text-sm text-zinc-100 text-center">
          {exercise.name} · <span className="stat-mono">{localizeDetail(exercise.detail, locale)}</span>
        </p>
        <p className="text-sm text-zinc-400 text-center">{tx("Do this cleanly, with control, to move up to {stage}.", { stage: next?.label ?? "" })}</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => (toast.info(tx("Keep going — you're close.")), onClose())} className="py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200">
            {tx("Not yet")}
          </button>
          <button onClick={pass} className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium">
            {tx("I did it cleanly")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
