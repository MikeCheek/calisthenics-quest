"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  addFriend,
  fetchPublicProfile,
  listenFriends,
  lookupUidByFriendCode,
  removeFriend,
} from "@/lib/store";
import { Friend } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { Copy, UserPlus, Zap, Users2, UserMinus } from "lucide-react";
import NudgeSheet from "./NudgeSheet";

export default function FriendsPanel({ onTrainTogether }: { onTrainTogether: (friend: Friend) => void }) {
  const { userDoc } = useAuth();
  const toast = useToast();
  const { tx } = useLanguage();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [nudged, setNudged] = useState<string | null>(null);
  const [nudging, setNudging] = useState<Friend | null>(null);

  useEffect(() => {
    if (!userDoc) return;
    return listenFriends(userDoc.uid, setFriends);
  }, [userDoc]);

  if (!userDoc) return null;

  const handleAddFriend = async () => {
    const code = codeInput.trim().toUpperCase();
    if (code.length !== 6) {
      toast.error("Enter the 6-character friend code.");
      return;
    }
    if (code === userDoc.friendCode) {
      toast.error("That's your own code!");
      return;
    }
    setAdding(true);
    try {
      const theirUid = await lookupUidByFriendCode(code);
      if (!theirUid) {
        toast.error("No one has that code.");
        return;
      }
      if (friends.some((f) => f.uid === theirUid)) {
        toast.error("You're already friends.");
        return;
      }
      const theirProfile = await fetchPublicProfile(theirUid);
      if (!theirProfile) {
        toast.error("Couldn't find that athlete's profile.");
        return;
      }
      await addFriend(
        { uid: userDoc.uid, displayName: userDoc.displayName, photoURL: userDoc.photoURL },
        { uid: theirUid, displayName: theirProfile.displayName, photoURL: theirProfile.photoURL }
      );
      toast.success(`Added ${theirProfile.displayName}!`);
      setCodeInput("");
    } catch {
      toast.error("Something went wrong — try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleNudged = (friend: Friend) => {
    setNudged(friend.uid);
    setTimeout(() => setNudged(null), 2500);
  };

  const handleRemove = async (friend: Friend) => {
    if (!window.confirm(tx("Remove {name} from your friends?", { name: friend.displayName }))) return;
    try {
      await removeFriend(userDoc.uid, friend.uid);
      toast.success(`Removed ${friend.displayName}.`);
    } catch {
      toast.error("Couldn't remove them — try again.");
    }
  };

  return (
    <div className="space-y-4">
      {nudging && <NudgeSheet friend={nudging} onClose={() => setNudging(null)} onSent={() => handleNudged(nudging)} />}
      <div className="panel p-4">
        <h2 className="heading text-base text-zinc-100 mb-1">{tx("Your friend code")}</h2>
        <p className="text-xs text-muted mb-3">{tx("Share this so friends can add you.")}</p>
        <div className="flex items-center gap-2">
          <div className="stat-mono text-2xl tracking-[0.25em] text-orange-400 flex-1 text-center py-2 border border-zinc-700 rounded-lg">
            {userDoc.friendCode || "······"}
          </div>
          <button
            onClick={() => {
              if (!userDoc.friendCode) return;
              navigator.clipboard.writeText(userDoc.friendCode);
              toast.success("Friend code copied!");
            }}
            className="p-2.5 border border-zinc-600 rounded-lg text-zinc-300 hover:text-zinc-100"
            aria-label={tx("Copy your code")}
            disabled={!userDoc.friendCode}
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
          <UserPlus size={16} className="text-orange-400" /> {tx("Add a friend")}
        </h2>
        <div className="flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder={tx("Their code")}
            maxLength={6}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 stat-mono tracking-widest text-center"
          />
          <button
            onClick={handleAddFriend}
            disabled={adding}
            className="px-4 py-2 rounded-lg text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-60"
          >
            {tx("Add")}
          </button>
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
          <Users2 size={16} className="text-orange-400" /> {tx("Your friends")}
        </h2>
        {friends.length === 0 ? (
          <p className="text-sm text-muted">
            {tx("No friends added yet — share your code or add one above.")}
          </p>
        ) : (
          <ul className="space-y-2">
            {friends.map((f) => (
              // the whole name on its own line, the actions under it at full size
              <li key={f.uid} className="border border-zinc-700 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/friend/${f.uid}`} className="min-h-11 flex items-center text-sm font-medium text-zinc-100 hover:text-orange-400 min-w-0 break-words">
                    {f.displayName}
                  </Link>
                  <button
                    onClick={() => handleRemove(f)}
                    className="w-11 h-11 -mr-2 shrink-0 rounded-lg text-muted hover:text-red-400 flex items-center justify-center"
                    aria-label={tx("Remove {name}", { name: f.displayName })}
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1 mb-1">
                  <button
                    onClick={() => setNudging(f)}
                    className="min-h-11 text-sm px-3 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center justify-center gap-1.5"
                  >
                    <Zap size={14} className={nudged === f.uid ? "text-orange-400" : ""} />
                    {nudged === f.uid ? tx("Sent!") : tx("Nudge")}
                  </button>
                  <button
                    onClick={() => onTrainTogether(f)}
                    className="min-h-11 text-sm px-3 rounded-lg bg-orange-500/15 border border-orange-500/50 text-orange-200 hover:bg-orange-500/25 flex items-center justify-center gap-1.5"
                  >
                    {tx("Train together")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
