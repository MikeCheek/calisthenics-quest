"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { NUDGE_XP_PER_DAY, isChallengeNudge, nudgeXpLeft, renderNudge, repliesFor, validNudge, validReply } from "@/lib/nudges";
import { awardXp } from "@/lib/sessionComplete";
import { tuning } from "@/lib/tuning";
import { pushToFriend } from "@/lib/pushClient";
import { useToast } from "@/context/ToastContext";
import { listenPings, dismissPing, joinPairing, sendNudgeReply, updateProgress } from "@/lib/store";
import { Ping } from "@/lib/types";
import { firePing } from "@/lib/notifications";
import { Check, X, Users, Zap } from "lucide-react";

// Friends' pings, shown as cards at the top of the screen:
// - a nudge: the message plus one-tap replies (and "Done!" for a
//   challenge, which earns a little XP a few times a day)
// - a reply to your nudge: a passing toast
// - a train-together invite: Accept / Decline, until acted on
const localDay = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local

export default function PingsListener() {
  const { user, userDoc, refreshUserDoc } = useAuth();
  const toast = useToast();
  const { tx, locale } = useLanguage();
  const router = useRouter();
  const seen = useRef(new Set<string>());
  const [invite, setInvite] = useState<Ping | null>(null);
  const [nudges, setNudges] = useState<{ ping: Ping; text: string }[]>([]);
  const [replying, setReplying] = useState(false);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = listenPings(user.uid, (list: Ping[]) => {
      const fresh = list.filter((p) => !seen.current.has(p.id));
      if (fresh.length === 0) return;
      fresh.forEach((p) => seen.current.add(p.id));

      fresh.forEach((p) => {
        if (p.kind === "pairing_invite") {
          firePing(p.fromName, tx("wants to train together"));
          setInvite(p); // shown as a persistent card, not dismissed here
        } else if (p.kind === "kudos") {
          firePing(p.fromName, tx("gave you kudos 👏"));
          toast.info(tx("{name} gave you kudos 👏", { name: p.fromName }));
          dismissPing(user.uid, p.id);
        } else if (p.kind === "nudge_reply") {
          const r = validReply(p.reply);
          const text = r ? tx(r.text) : String(p.message ?? "").slice(0, 200);
          firePing(p.fromName, text);
          toast.info(`${p.fromName}: ${text}`);
          dismissPing(user.uid, p.id);
        } else {
          // ready-made nudges are shown in our own language; whatever a
          // friend wrote is checked first, it came straight from their app
          const n = validNudge(p.nudge);
          const text = (n && renderNudge(locale, n)) || String(p.message ?? "").slice(0, 200);
          firePing(p.fromName, text);
          setNudges((q) => [...q, { ping: { ...p, nudge: n ?? undefined }, text }].slice(-5));
          dismissPing(user.uid, p.id);
        }
      });
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if ((!invite && nudges.length === 0) || !userDoc) return null;

  const current = nudges[0];
  const closeNudge = () => setNudges((q) => q.slice(1));

  const reply = async (replyId: string) => {
    if (!current || replying) return;
    const r = repliesFor(current.ping.nudge?.id).find((x) => x.id === replyId);
    if (!r) return;
    setReplying(true);
    try {
      await sendNudgeReply(current.ping.fromUid, userDoc.uid, userDoc.displayName, r.id, r.text);
      pushToFriend(current.ping.fromUid, "nudge_reply", { reply: r.id });
      if (r.id === "done" && isChallengeNudge(current.ping.nudge?.id)) {
        const day = localDay();
        const left = nudgeXpLeft(userDoc.nudgeXp, day);
        const amount = tuning().xpNudgeDone;
        if (left > 0 && amount > 0) {
          await awardXp(userDoc, amount);
          const count = NUDGE_XP_PER_DAY - left + 1;
          await updateProgress(userDoc.uid, { nudgeXp: { day, count } });
          await refreshUserDoc();
          toast.success(tx("+{n} XP — challenge done!", { n: amount }));
        } else {
          toast.success(tx("Reply sent to {name}.", { name: current.ping.fromName }));
        }
      } else {
        toast.success(tx("Reply sent to {name}.", { name: current.ping.fromName }));
      }
      closeNudge();
    } catch {
      toast.error("Something went wrong — try again.");
    } finally {
      setReplying(false);
    }
  };

  const accept = async () => {
    if (!invite?.pairingCode) return;
    setResponding(true);
    try {
      await joinPairing(invite.pairingCode, userDoc.uid, userDoc.displayName, userDoc.body, userDoc.skills);
      await dismissPing(userDoc.uid, invite.id);
      router.push(`/friends?code=${invite.pairingCode}`);
    } catch {
      toast.error("Couldn't join — try again.");
    } finally {
      setInvite(null);
      setResponding(false);
    }
  };

  const decline = async () => {
    if (!invite) return;
    setResponding(true);
    await dismissPing(userDoc.uid, invite.id).catch(() => {});
    setInvite(null);
    setResponding(false);
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm pointer-events-none flex flex-col gap-2"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      {current && (
        <section
          aria-label={tx("Nudge from {name}", { name: current.ping.fromName })}
          className="pointer-events-auto panel border border-orange-500/70 shadow-lg p-4 animate-slide-down-in"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
              <Zap size={15} className="text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-orange-300 font-medium">
                {current.ping.fromName}
                {nudges.length > 1 && <span className="text-muted"> · {tx("{n} more", { n: nudges.length - 1 })}</span>}
              </div>
              <p className="text-sm text-zinc-100 mt-0.5">{current.text}</p>
            </div>
            <button onClick={closeNudge} className="p-1.5 -m-1 text-muted hover:text-zinc-200 shrink-0" aria-label={tx("Close")}>
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3" role="group" aria-label={tx("Reply")}>
            {repliesFor(current.ping.nudge?.id).map((r) => (
              <button
                key={r.id}
                onClick={() => reply(r.id)}
                disabled={replying}
                className={`text-xs px-2.5 py-1.5 rounded-full border disabled:opacity-60 ${
                  r.id === "done" ? "border-emerald-500 bg-emerald-500/15 text-emerald-300" : "border-zinc-700 text-zinc-200 hover:border-zinc-500"
                }`}
              >
                {tx(r.text)}
                {r.id === "done" && nudgeXpLeft(userDoc.nudgeXp, localDay()) > 0 && tuning().xpNudgeDone > 0 ? ` +${tuning().xpNudgeDone} XP` : ""}
              </button>
            ))}
          </div>
        </section>
      )}
      {invite && (
        <div className="pointer-events-auto panel border border-orange-500 shadow-lg p-4 animate-slide-down-in">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
              <Users size={15} className="text-orange-400" />
            </div>
            <div className="text-sm text-zinc-100">
              <span className="font-medium">{invite.fromName}</span> {tx("wants to train together")}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={decline}
              disabled={responding}
              className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <X size={14} /> {tx("Decline")}
            </button>
            <button
              onClick={accept}
              disabled={responding}
              className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <Check size={14} /> {tx("Accept")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
