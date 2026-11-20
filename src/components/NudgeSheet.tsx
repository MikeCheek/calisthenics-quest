"use client";

import { useEffect, useState } from "react";
import { Dices, Send } from "lucide-react";
import Modal from "./Modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { fetchPublicProfile, sendPing } from "@/lib/store";
import { pushToFriend } from "@/lib/pushClient";
import type { Friend, PublicProfile } from "@/lib/types";
import { CUSTOM_NUDGE_MAX, NUDGE_MOODS, cleanCustomNudge, nudgeContext, pickNudge, renderNudge } from "@/lib/nudges";
import type { Nudge, NudgeContext, NudgeMood } from "@/lib/nudges";

// Pick a nudge for a friend: a random line that fits the two of you (by
// mood, rerollable), or a short message of your own.

const RECENT_KEY = "barquests:recent-nudges";
const MOOD_LABEL: Record<NudgeMood, string> = { friendly: "Friendly", cheeky: "Cheeky", challenge: "Challenge" };

function recent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}
function remember(id: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...recent().filter((r) => r !== id)].slice(0, 6)));
  } catch {
    /* not important */
  }
}

export default function NudgeSheet({ friend, onClose, onSent }: { friend: Friend; onClose: () => void; onSent: () => void }) {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const toast = useToast();
  const [ctx, setCtx] = useState<NudgeContext | null>(null);
  const [mood, setMood] = useState<NudgeMood | undefined>(undefined);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [own, setOwn] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!userDoc) return;
    let live = true;
    fetchPublicProfile(friend.uid)
      .catch(() => null)
      .then((p) => {
        if (!live) return;
        const profile: PublicProfile = p ?? { uid: friend.uid, displayName: friend.displayName, level: 1, streak: 0 } as PublicProfile;
        const c = nudgeContext(userDoc, profile);
        setCtx(c);
        setNudge(pickNudge(c, { avoid: recent() }));
      });
    return () => {
      live = false;
    };
  }, [userDoc, friend.uid, friend.displayName]);

  if (!userDoc) return null;

  const reroll = (m: NudgeMood | undefined = mood) => {
    if (!ctx) return;
    setNudge((cur) => pickNudge(ctx, { mood: m, avoid: [...recent(), ...(cur ? [cur.id] : [])] }));
  };

  const custom = cleanCustomNudge(text);
  const canSend = own ? !!custom : !!nudge;

  const send = async () => {
    if (!canSend || sending) return;
    setSending(true);
    try {
      if (own) {
        await sendPing(friend.uid, userDoc.uid, userDoc.displayName, custom!);
        pushToFriend(friend.uid, "nudge", { custom: custom! });
      } else {
        // English copy for older app versions; the id lets theirs translate it
        await sendPing(friend.uid, userDoc.uid, userDoc.displayName, renderNudge("en", nudge!) ?? "", nudge!);
        pushToFriend(friend.uid, "nudge", { nudge: nudge! });
        remember(nudge!.id);
      }
      toast.success(tx("Nudge sent to {name}!", { name: friend.displayName }));
      onSent();
      onClose();
    } catch {
      toast.error("Something went wrong — try again.");
      setSending(false);
    }
  };

  const chip = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-full border ${active ? "border-orange-500 bg-orange-500/15 text-orange-300" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"}`;

  return (
    <Modal open onClose={onClose} title={tx("Nudge {name}", { name: friend.displayName })}>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button className={chip(!own && !mood)} onClick={() => { setOwn(false); setMood(undefined); reroll(undefined); }}>
            {tx("Any")}
          </button>
          {NUDGE_MOODS.map((m) => (
            <button key={m} className={chip(!own && mood === m)} onClick={() => { setOwn(false); setMood(m); reroll(m); }}>
              {tx(MOOD_LABEL[m])}
            </button>
          ))}
          <button className={chip(own)} onClick={() => setOwn(true)}>
            {tx("Write your own")}
          </button>
        </div>

        {own ? (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, CUSTOM_NUDGE_MAX))}
              placeholder={tx("Your message to {name}…", { name: friend.displayName })}
              rows={2}
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 resize-none"
            />
            <div className="text-right text-xs text-muted stat-mono">
              {text.length}/{CUSTOM_NUDGE_MAX}
            </div>
          </div>
        ) : (
          <div className="border border-zinc-700 rounded-lg p-3 min-h-[4.5rem] flex items-start gap-3">
            <p className="flex-1 text-sm text-zinc-100">{nudge ? renderNudge(locale, nudge) : "…"}</p>
            <button
              onClick={() => reroll()}
              disabled={!ctx}
              className="shrink-0 p-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-300 disabled:opacity-50"
              aria-label={tx("Another one")}
              title={tx("Another one")}
            >
              <Dices size={16} />
            </button>
          </div>
        )}
        {!own && <p className="text-xs text-muted">{tx("They'll see it in their own language.")}</p>}

        <button
          onClick={send}
          disabled={!canSend || sending}
          className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={14} /> {tx("Send")}
        </button>
      </div>
    </Modal>
  );
}
