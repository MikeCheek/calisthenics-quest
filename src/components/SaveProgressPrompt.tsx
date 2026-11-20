"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Modal from "@/components/Modal";
import { CloudUpload, Loader2 } from "lucide-react";

// Shown to guests: keep this device's progress by linking a Google account.
// `reason` tailors the pitch to where it appears (friends need an account,
// a session was just logged, ...).
export default function SaveProgressPrompt({
  reason = "Your progress lives on this device only. Save it with Google to keep it, use it on any device and add friends.",
  compact = false,
}: {
  reason?: string;
  compact?: boolean;
}) {
  const { isGuest, saveWithGoogle, switchToExistingAccount } = useAuth();
  const { tx } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [exists, setExists] = useState(false);
  if (!isGuest) return null;

  const save = async () => {
    setBusy(true);
    const r = await saveWithGoogle();
    setBusy(false);
    if (r === "exists") setExists(true);
  };

  return (
    <>
      <div
        className={`rounded-2xl border border-sky-500/40 bg-gradient-to-br from-sky-500/10 to-transparent ${
          compact ? "p-3 flex items-center gap-3" : "p-4"
        }`}
      >
        {!compact && (
          <h2 className="heading text-base text-zinc-100 mb-1 flex items-center gap-2">
            <CloudUpload size={16} className="text-sky-400" /> {tx("You're training as a guest")}
          </h2>
        )}
        <p className={`text-sm text-zinc-300 ${compact ? "flex-1" : "mb-3"}`}>{tx(reason)}</p>
        <button
          onClick={save}
          disabled={busy}
          className={`${compact ? "shrink-0 px-3" : "w-full"} py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60`}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <CloudUpload size={15} />}
          {tx("Save with Google")}
        </button>
      </div>

      <Modal open={exists} onClose={() => setExists(false)} title={tx("That Google account already has progress")}>
        <p className="text-sm text-zinc-300 mb-4">
          {tx(
            "This Google account is already linked to a BarQuests profile. You can switch to it, but the guest progress on this device can't be merged into it and will be left behind."
          )}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setExists(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300">
            {tx("Keep training as guest")}
          </button>
          <button
            onClick={async () => {
              setExists(false);
              await switchToExistingAccount();
            }}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium"
          >
            {tx("Switch to that account")}
          </button>
        </div>
      </Modal>
    </>
  );
}
