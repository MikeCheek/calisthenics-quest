"use client";

import { XCircle } from "lucide-react";
import Modal from "./Modal";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useTrainingSession } from "@/context/TrainingSessionContext";
import { stopSpeaking } from "@/lib/voice";

// "Cancel this session?" — for when today's session just isn't possible
// (no time, no bar free, feeling off). Nothing is logged: no XP, the streak
// and the learning are untouched, and the session in progress is cleared.
export default function CancelSessionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tx } = useLanguage();
  const toast = useToast();
  const { discardSession } = useTrainingSession();

  const confirm = () => {
    stopSpeaking();
    onClose();
    discardSession();
    toast.info(tx("Session cancelled — nothing was logged."));
  };

  return (
    <Modal open={open} onClose={onClose} title={tx("Cancel this session?")}>
      <div className="space-y-4">
        <p className="text-base text-zinc-200">{tx("Nothing from it will be logged: no XP, and your streak and training history stay as they are.")}</p>
        <p className="text-sm text-zinc-400">{tx("Did some of it? Go back and use Finish here, or finish the session, to log what you did.")}</p>
        <div className="flex flex-col gap-2">
          <button onClick={onClose} className="w-full h-14 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-base font-semibold">
            {tx("Keep training")}
          </button>
          <button
            onClick={confirm}
            className="w-full h-14 rounded-xl border border-red-500/70 text-red-300 hover:bg-red-500/10 text-base font-medium flex items-center justify-center gap-2"
          >
            <XCircle size={20} /> {tx("Cancel session")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
