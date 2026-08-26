"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import SessionView from "@/components/SessionView";
import FriendsPanel from "@/components/FriendsPanel";
import { createPairing, joinPairing, sendPing, PairingDoc } from "@/lib/store";
import { generatePairedSession } from "@/lib/trainingGenerator";
import { completeSession } from "@/lib/sessionComplete";
import { Friend } from "@/lib/types";
import { Copy, Users } from "lucide-react";

type Mode = "choose" | "create" | "join";

export default function PairPage() {
  const { user, userDoc, loading, refreshUserDoc } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [code, setCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [pairing, setPairing] = useState<PairingDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [invitedName, setInvitedName] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  useEffect(() => {
    if (!code) return;
    const unsub = onSnapshot(doc(db, "pairings", code), (snap) => {
      if (snap.exists()) setPairing(snap.data() as PairingDoc);
    });
    return () => unsub();
  }, [code]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const handleCreate = async () => {
    const newCode = await createPairing(
      userDoc.uid,
      userDoc.displayName,
      userDoc.body,
      userDoc.skills,
      userDoc.equipment
    );
    setCode(newCode);
    setMode("create");
  };

  const handleTrainTogether = async (friend: Friend) => {
    const newCode = await createPairing(
      userDoc.uid,
      userDoc.displayName,
      userDoc.body,
      userDoc.skills,
      userDoc.equipment
    );
    await sendPing(
      friend.uid,
      userDoc.uid,
      userDoc.displayName,
      `wants to train together — join with code ${newCode}`
    );
    setInvitedName(friend.displayName);
    setCode(newCode);
    setMode("create");
  };

  const handleJoin = async () => {
    setError(null);
    const c = joinInput.trim().toUpperCase();
    if (c.length !== 6) {
      setError("Enter the 6-character code your friend shared.");
      return;
    }
    const existing = await import("@/lib/store").then((m) => m.fetchPairing(c));
    if (!existing) {
      setError("No pairing found for that code.");
      return;
    }
    if (existing.hostUid === userDoc.uid) {
      setError("That's your own code — share it with your friend instead.");
      return;
    }
    await joinPairing(c, userDoc.uid, userDoc.displayName, userDoc.body, userDoc.skills);
    setCode(c);
  };

  const isHost = pairing?.hostUid === userDoc.uid;
  const bothReady = !!pairing?.guestUid;

  const paired =
    pairing && bothReady
      ? generatePairedSession(pairing.hostSkills, pairing.guestSkills!, pairing.hostEquipment)
      : null;

  const mySession = paired ? (isHost ? paired.hostSession : paired.guestSession) : null;
  const theirSession = paired ? (isHost ? paired.guestSession : paired.hostSession) : null;
  const partnerName = isHost ? pairing?.guestName : pairing?.hostName;

  const handleComplete = async () => {
    if (!mySession) return;
    await completeSession(userDoc, mySession, { isPaired: true });
    setCompleted(true);
    await refreshUserDoc();
  };

  const resetToChoose = () => {
    setMode("choose");
    setCode("");
    setPairing(null);
    setInvitedName(null);
    setCompleted(false);
    setError(null);
  };

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-4">
        <h1 className="heading text-2xl text-zinc-100 flex items-center gap-2">
          <Users size={26} className="text-orange-400" /> Pair training
        </h1>

        {!code && mode === "choose" && <FriendsPanel onTrainTogether={handleTrainTogether} />}

        {!code && mode === "choose" && (
          <div>
            <div className="text-xs text-zinc-500 mb-2">Or link up with anyone using a one-off code</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={handleCreate}
                className="panel p-5 text-left hover:border-orange-500 border border-transparent"
              >
                <div className="heading text-lg text-zinc-100 mb-1">Create a code</div>
                <div className="text-sm text-zinc-400">
                  Generate a code from your profile and send it to anyone.
                </div>
              </button>
              <button
                onClick={() => setMode("join")}
                className="panel p-5 text-left hover:border-orange-500 border border-transparent"
              >
                <div className="heading text-lg text-zinc-100 mb-1">Join a code</div>
                <div className="text-sm text-zinc-400">
                  Enter a code someone shared to link up your session.
                </div>
              </button>
            </div>
          </div>
        )}

        {!code && mode === "join" && (
          <div className="panel p-5 space-y-3">
            <div className="heading text-lg text-zinc-100">Enter code</div>
            <input
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 stat-mono text-xl tracking-widest text-center"
            />
            {error && <div className="text-xs text-orange-400">{error}</div>}
            <button
              onClick={handleJoin}
              className="w-full py-2.5 rounded-lg heading tracking-wide text-sm bg-orange-500 hover:bg-orange-400 text-zinc-950"
            >
              Link up
            </button>
            <button onClick={resetToChoose} className="w-full text-xs text-zinc-500">
              Back
            </button>
          </div>
        )}

        {code && !bothReady && (
          <div className="panel p-6 text-center space-y-3">
            <div className="text-sm text-zinc-400">
              {isHost === false
                ? "Waiting for the host..."
                : invitedName
                ? `Nudge sent to ${invitedName} — waiting for them to join`
                : "Share this code with whoever you're training with"}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="stat-mono text-4xl tracking-[0.3em] text-orange-400">{code}</div>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="p-2 border border-zinc-600 rounded-lg text-zinc-300 hover:text-zinc-100"
                aria-label="Copy code"
              >
                <Copy size={16} />
              </button>
            </div>
            <div className="text-xs text-zinc-500">
              Waiting for them to enter this code on their device...
            </div>
            <button onClick={resetToChoose} className="text-xs text-zinc-500">
              Cancel
            </button>
          </div>
        )}

        {paired && mySession && theirSession && (
          <div className="space-y-4">
            <div className="panel p-3 text-sm text-zinc-400">
              Linked with <span className="text-zinc-100">{partnerName}</span> — today&apos;s
              shared focus: <span className="text-orange-400">{paired.focusLabel}</span>. You
              each get exercises matched to your own skill stage, based on the equipment at{" "}
              {isHost ? "your" : `${pairing?.hostName ?? "the host"}'s`} spot.
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <SessionView session={mySession} onComplete={handleComplete} completed={completed} />
              <SessionView session={theirSession} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
