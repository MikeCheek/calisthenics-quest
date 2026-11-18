"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { listenFriends, fetchPublicProfile } from "@/lib/store";
import { BoardEntry, Metric, METRIC_LABEL, rankBoard, weeklyChallenge } from "@/lib/leaderboard";
import { currentWeekKey } from "@/lib/missions";
import { Friend } from "@/lib/types";
import { Trophy, Crown, Swords } from "lucide-react";

// This week's challenge among you and your friends, plus a switchable board.
export default function FriendsLeaderboard() {
  const { userDoc } = useAuth();
  const { tx } = useLanguage();
  const weekKey = currentWeekKey();
  const challenge = weeklyChallenge(weekKey);
  const [metric, setMetric] = useState<Metric>(challenge.metric);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [entries, setEntries] = useState<BoardEntry[] | null>(null);

  useEffect(() => {
    if (!userDoc) return;
    return listenFriends(userDoc.uid, setFriends);
  }, [userDoc?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!userDoc) return;
    let cancelled = false;
    Promise.all(friends.map((f) => fetchPublicProfile(f.uid).catch(() => null))).then((profiles) => {
      if (cancelled) return;
      const others: BoardEntry[] = profiles
        .map((p, i) =>
          p ? { uid: p.uid, name: p.displayName, photoURL: p.photoURL, isMe: false, week: p.week } : { uid: friends[i].uid, name: friends[i].displayName, isMe: false }
        );
      setEntries([{ uid: userDoc.uid, name: tx("You"), photoURL: userDoc.photoURL, isMe: true, week: userDoc.week }, ...others]);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends, userDoc?.week, userDoc?.uid]);

  const ranked = useMemo(() => (entries ? rankBoard(entries, metric, weekKey) : []), [entries, metric, weekKey]);
  const challengeBoard = useMemo(() => (entries ? rankBoard(entries, challenge.metric, weekKey) : []), [entries, challenge.metric, weekKey]);
  const leader = challengeBoard[0];
  const me = challengeBoard.find((e) => e.isMe);

  return (
    <section className="space-y-3">
      <div className="panel p-4 border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-transparent">
        <div className="text-xs uppercase tracking-wide text-amber-300 flex items-center gap-1.5">
          <Swords size={13} /> {tx("This week's challenge")}
        </div>
        <div className="heading text-lg text-zinc-100 mt-0.5">{tx(challenge.title)}</div>
        <div className="text-sm text-zinc-400">{tx(challenge.blurb)}</div>
        {entries && entries.length > 1 && leader && (
          <div className="mt-3 text-sm text-zinc-200 flex items-center gap-2">
            <Crown size={15} className="text-amber-400" />
            {leader.value > 0
              ? leader.isMe
                ? tx("You're leading with {n}.", { n: leader.value })
                : tx("{x} leads with {n}.", { x: leader.name, n: leader.value }) +
                  (me ? ` ${tx("You: {n}.", { n: me.value })}` : "")
              : tx("Nobody's on the board yet — first session takes the lead.")}
          </div>
        )}
        {entries && entries.length <= 1 && (
          <div className="mt-3 text-sm text-zinc-400">{tx("Add a friend below to compete — it's more fun with a crew.")}</div>
        )}
      </div>

      {entries && entries.length > 1 && (
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="heading text-base text-zinc-100 flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" /> {tx("This week")}
            </div>
          </div>
          <div className="flex p-1 rounded-xl bg-zinc-800/60 gap-1 mb-3" role="tablist">
            {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={metric === m}
                onClick={() => setMetric(m)}
                className={`flex-1 py-1.5 rounded-lg text-xs ${metric === m ? "bg-zinc-950 text-zinc-100" : "text-zinc-400"}`}
              >
                {tx(METRIC_LABEL[m])}
              </button>
            ))}
          </div>
          <ol className="space-y-1.5">
            {ranked.map((e) => (
              <li
                key={e.uid}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 ${e.isMe ? "bg-orange-500/10 border border-orange-500/30" : "bg-zinc-950/40"}`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center stat-mono text-sm font-bold shrink-0 ${
                    e.rank === 1 && e.value > 0 ? "bg-amber-400 text-zinc-950" : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {e.rank}
                </span>
                <span className={`flex-1 truncate text-sm ${e.isMe ? "text-zinc-100 font-medium" : "text-zinc-200"}`}>{e.name}</span>
                <span className="stat-mono text-sm text-zinc-100">
                  {e.value}
                  {metric === "minutes" ? "′" : ""}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted mt-2">{tx("Resets every Monday. Counts what each of you logged this week.")}</p>
        </div>
      )}
    </section>
  );
}
