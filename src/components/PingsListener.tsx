"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { listenPings, dismissPing, joinPairing } from "@/lib/store";
import { Ping } from "@/lib/types";
import { firePing } from "@/lib/notifications";
import { Check, X, Users } from "lucide-react";

// Nudges surface through the shared toast system and auto-dismiss, same as
// any other notification. Pairing invites are a genuinely different kind
// of ping — there's a real decision attached, not just an FYI — so they
// render as a persistent Accept/Decline card instead, and stay until
// actually acted on rather than disappearing on a timer.
export default function PingsListener() {
  const { user, userDoc } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [invite, setInvite] = useState<Ping | null>(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = listenPings(user.uid, (list: Ping[]) => {
      const fresh = list.filter((p) => !seenIds.has(p.id));
      if (fresh.length === 0) return;

      fresh.forEach((p) => {
        if (p.kind === "pairing_invite") {
          firePing(p.fromName, "wants to train together");
          setInvite(p); // shown as a persistent card, not dismissed here
        } else {
          firePing(p.fromName, p.message);
          toast.info(`${p.fromName} ${p.message}`);
          dismissPing(user.uid, p.id);
        }
      });
      setSeenIds((prev) => new Set([...prev, ...fresh.map((p) => p.id)]));
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!invite || !userDoc) return null;

  const accept = async () => {
    if (!invite.pairingCode) return;
    setResponding(true);
    try {
      await joinPairing(invite.pairingCode, userDoc.uid, userDoc.displayName, userDoc.body, userDoc.skills);
      await dismissPing(userDoc.uid, invite.id);
      router.push(`/pair?code=${invite.pairingCode}`);
    } catch {
      toast.error("Couldn't join — try again.");
    } finally {
      setInvite(null);
      setResponding(false);
    }
  };

  const decline = async () => {
    setResponding(true);
    await dismissPing(userDoc.uid, invite.id).catch(() => {});
    setInvite(null);
    setResponding(false);
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      <div className="pointer-events-auto panel border border-orange-500 shadow-lg p-4 animate-slide-down-in">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
            <Users size={15} className="text-orange-400" />
          </div>
          <div className="text-sm text-zinc-100">
            <span className="font-medium">{invite.fromName}</span> wants to train together
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={decline}
            disabled={responding}
            className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <X size={14} /> Decline
          </button>
          <button
            onClick={accept}
            disabled={responding}
            className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <Check size={14} /> Accept
          </button>
        </div>
      </div>
    </div>
  );
}
