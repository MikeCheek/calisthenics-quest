"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { listenFriends, fetchPublicProfile, fetchGlobalBoard, setGlobalBoardEntry, updateProgress } from "@/lib/store";
import {
  BoardEntry,
  EMPTY_WEEK,
  GLOBAL_BOARD_SIZE,
  Metric,
  METRIC_LABEL,
  plausibleWeek,
  rankBoard,
  weeklyChallenge,
} from "@/lib/leaderboard";
import { useToast } from "@/context/ToastContext";
import { effectiveXpProgress } from "@/lib/levelPath";
import { currentWeekKey } from "@/lib/missions";
import { Friend } from "@/lib/types";
import { Trophy, Crown, Swords, Globe2, Users } from "lucide-react";

type Scope = "friends" | "everyone";

// This week's challenge among you and your friends, plus a board you can
// switch between your friends and everyone who joined the global board.
export default function FriendsLeaderboard() {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx } = useLanguage();
  const toast = useToast();
  const [scope, setScope] = useState<Scope>("friends");
  const [global, setGlobal] = useState<BoardEntry[] | null>(null);
  const [joining, setJoining] = useState(false);
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

  // the global board is fetched per metric (it's the top N for that metric)
  useEffect(() => {
    if (scope !== "everyone" || !userDoc) return;
    let cancelled = false;
    setGlobal(null);
    fetchGlobalBoard(weekKey, metric, GLOBAL_BOARD_SIZE)
      .then((rows) => {
        if (cancelled) return;
        setGlobal(
          rows
            .filter((r) => plausibleWeek(r.week))
            .map((r) => ({
              uid: r.uid,
              name: r.uid === userDoc.uid ? tx("You") : r.displayName,
              isMe: r.uid === userDoc.uid,
              week: r.week,
            }))
        );
      })
      .catch(() => !cancelled && setGlobal([]));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, metric, weekKey, userDoc?.uid, userDoc?.week, userDoc?.globalBoard]);

  const canJoin = !!userDoc?.friendCode; // guests have no public profile
  const joined = !!userDoc?.globalBoard;
  const setJoined = async (join: boolean) => {
    if (!userDoc) return;
    setJoining(true);
    try {
      const thisWeek = userDoc.week?.key === weekKey ? userDoc.week : EMPTY_WEEK(weekKey);
      const level = effectiveXpProgress(userDoc.xp, userDoc.skills, userDoc.skillMastery).level;
      await setGlobalBoardEntry(
        userDoc.uid,
        join ? { displayName: userDoc.displayName, level, week: thisWeek } : null,
        join ? [] : [weekKey, ...(userDoc.week ? [userDoc.week.key] : [])]
      );
      await updateProgress(userDoc.uid, { globalBoard: join });
      await refreshUserDoc();
      toast.success(join ? "You're on the global board." : "You've left the global board.");
    } catch {
      toast.error("Couldn't save that — try again.");
    } finally {
      setJoining(false);
    }
  };

  const boardEntries = scope === "friends" ? entries : global;
  const ranked = useMemo(() => (boardEntries ? rankBoard(boardEntries, metric, weekKey) : []), [boardEntries, metric, weekKey]);
  const meMissing = scope === "everyone" && joined && global !== null && !global.some((e) => e.isMe);
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

      <div className="panel p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="heading text-base text-zinc-100 flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" /> {tx("This week")}
          </div>
          <div className="flex p-0.5 rounded-lg bg-zinc-800/60 gap-0.5" role="tablist" aria-label={tx("Leaderboard")}>
            {(
              [
                ["friends", tx("Friends"), Users],
                ["everyone", tx("Everyone"), Globe2],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={scope === id}
                onClick={() => setScope(id)}
                className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1 ${scope === id ? "bg-zinc-950 text-zinc-100" : "text-zinc-400"}`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
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

        {scope === "everyone" && !joined && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 mb-3">
            <div className="text-sm text-zinc-100">{tx("Join the global board")}</div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {canJoin
                ? tx("Everyone using BarQuests will see your first name, last initial, photo and this week's totals. You can leave any time.")
                : tx("Save your progress with Google to join — guests can't appear on public boards.")}
            </p>
            {canJoin && (
              <button
                onClick={() => setJoined(true)}
                disabled={joining}
                className="mt-2.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-sky-500 hover:bg-sky-400 text-zinc-950 disabled:opacity-60"
              >
                {tx("Join")}
              </button>
            )}
          </div>
        )}

        {boardEntries === null ? (
          <p className="text-sm text-muted py-2">{tx("Loading…")}</p>
        ) : scope === "friends" && boardEntries.length <= 1 ? (
          <p className="text-sm text-zinc-400">{tx("Add a friend below to compete — or switch to Everyone.")}</p>
        ) : ranked.length === 0 ? (
          <p className="text-sm text-zinc-400">{tx("Nobody's on the global board this week yet.")}</p>
        ) : (
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
        )}
        {meMissing && <p className="text-xs text-zinc-400 mt-2">{tx("You're not in the top {n} for this yet.", { n: GLOBAL_BOARD_SIZE })}</p>}

        <p className="text-xs text-muted mt-2">
          {scope === "friends"
            ? tx("Resets every Monday. Counts what each of you logged this week.")
            : tx("Resets every Monday. Shows the top {n} of everyone who joined.", { n: GLOBAL_BOARD_SIZE })}
          {scope === "everyone" && joined && (
            <>
              {" "}
              <button onClick={() => setJoined(false)} disabled={joining} className="underline hover:text-zinc-300">
                {tx("Leave the global board")}
              </button>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
