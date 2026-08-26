"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addFriend,
  fetchPublicProfile,
  listenFriends,
  lookupUidByFriendCode,
  sendPing,
} from "@/lib/store";
import { Friend } from "@/lib/types";
import { pickReminderLine } from "@/lib/reminderMessages";
import { Copy, UserPlus, Zap, Users2 } from "lucide-react";

export default function FriendsPanel({ onTrainTogether }: { onTrainTogether: (friend: Friend) => void }) {
  const { userDoc } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [nudged, setNudged] = useState<string | null>(null);

  useEffect(() => {
    if (!userDoc) return;
    return listenFriends(userDoc.uid, setFriends);
  }, [userDoc]);

  if (!userDoc) return null;

  const handleAddFriend = async () => {
    setStatus(null);
    const code = codeInput.trim().toUpperCase();
    if (code.length !== 6) {
      setStatus({ type: "error", text: "Enter the 6-character friend code." });
      return;
    }
    if (code === userDoc.friendCode) {
      setStatus({ type: "error", text: "That's your own code!" });
      return;
    }
    setAdding(true);
    try {
      const theirUid = await lookupUidByFriendCode(code);
      if (!theirUid) {
        setStatus({ type: "error", text: "No one has that code." });
        return;
      }
      if (friends.some((f) => f.uid === theirUid)) {
        setStatus({ type: "error", text: "You're already friends." });
        return;
      }
      const theirProfile = await fetchPublicProfile(theirUid);
      if (!theirProfile) {
        setStatus({ type: "error", text: "Couldn't find that athlete's profile." });
        return;
      }
      await addFriend(
        { uid: userDoc.uid, displayName: userDoc.displayName, photoURL: userDoc.photoURL },
        { uid: theirUid, displayName: theirProfile.displayName, photoURL: theirProfile.photoURL }
      );
      setStatus({ type: "success", text: `Added ${theirProfile.displayName}!` });
      setCodeInput("");
    } catch {
      setStatus({ type: "error", text: "Something went wrong — try again." });
    } finally {
      setAdding(false);
    }
  };

  const handleNudge = async (friend: Friend) => {
    await sendPing(friend.uid, userDoc.uid, userDoc.displayName, pickReminderLine());
    setNudged(friend.uid);
    setTimeout(() => setNudged(null), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <div className="heading text-base text-zinc-100 mb-1">Your friend code</div>
        <p className="text-xs text-zinc-500 mb-3">Share this so friends can add you.</p>
        <div className="flex items-center gap-2">
          <div className="stat-mono text-2xl tracking-[0.25em] text-orange-400 flex-1 text-center py-2 border border-zinc-700 rounded-lg">
            {userDoc.friendCode || "······"}
          </div>
          <button
            onClick={() => userDoc.friendCode && navigator.clipboard.writeText(userDoc.friendCode)}
            className="p-2.5 border border-zinc-600 rounded-lg text-zinc-300 hover:text-zinc-100"
            aria-label="Copy your code"
            disabled={!userDoc.friendCode}
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="panel p-4">
        <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
          <UserPlus size={16} className="text-orange-400" /> Add a friend
        </div>
        <div className="flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="Their code"
            maxLength={6}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 stat-mono tracking-widest text-center"
          />
          <button
            onClick={handleAddFriend}
            disabled={adding}
            className="px-4 py-2 rounded-lg text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-60"
          >
            Add
          </button>
        </div>
        {status && (
          <p className={`text-xs mt-2 ${status.type === "error" ? "text-orange-400" : "text-emerald-400"}`}>
            {status.text}
          </p>
        )}
      </div>

      <div className="panel p-4">
        <div className="heading text-base text-zinc-100 mb-2 flex items-center gap-2">
          <Users2 size={16} className="text-orange-400" /> Your friends
        </div>
        {friends.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No friends added yet — share your code or add one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {friends.map((f) => (
              <li
                key={f.uid}
                className="flex items-center justify-between border border-zinc-700 rounded-lg px-3 py-2.5"
              >
                <div className="text-sm text-zinc-100">{f.displayName}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNudge(f)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center gap-1"
                  >
                    <Zap size={12} className={nudged === f.uid ? "text-orange-400" : ""} />
                    {nudged === f.uid ? "Sent!" : "Nudge"}
                  </button>
                  <button
                    onClick={() => onTrainTogether(f)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950"
                  >
                    Train together
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
