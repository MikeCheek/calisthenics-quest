"use client";

import CappedHeight from "@/components/CappedHeight";
import { SPORT_META } from "@/lib/sports";
import { nameFor } from "@/lib/anonymize";
import { useEffect, useState } from "react";
import { Activity, Flame, Trophy, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchFeed, listenFriends, sendKudosPing, setKudos } from "@/lib/store";
import { pushToFriend } from "@/lib/pushClient";
import { FEED_DAYS, firstName, kudosLine, mergeFeed, type FeedItem } from "@/lib/feed";
import { Bone } from "./PageLoading";

const ago = (iso: string, locale: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale === "it" ? "it" : "en", { numeric: "auto" });
  if (mins < 60) return rtf.format(-Math.max(1, mins), "minute");
  if (mins < 24 * 60) return rtf.format(-Math.round(mins / 60), "hour");
  return rtf.format(-Math.round(mins / 1440), "day");
};

// What the crew has been training lately, with kudos.
export default function FriendsFeed() {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const [friendUids, setFriendUids] = useState<string[] | null>(null);
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const uid = userDoc?.uid;

  useEffect(() => {
    if (!uid) return;
    return listenFriends(uid, (f) => setFriendUids(f.map((x) => x.uid)));
  }, [uid]);

  const key = friendUids?.join(",");
  useEffect(() => {
    if (!friendUids) return;
    if (!friendUids.length) return setItems([]);
    let live = true;
    fetchFeed(friendUids, new Date(Date.now() - FEED_DAYS * 86400000).toISOString())
      .then((list) => live && setItems(mergeFeed([list])))
      .catch(() => live && setItems([]));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!userDoc || friendUids === null || friendUids.length === 0) return null;
  const me = userDoc.uid;
  const myName = firstName(userDoc.displayName);

  const toggle = async (item: FeedItem) => {
    const given = !!item.kudos?.[me];
    setItems((list) =>
      (list ?? []).map((i) => {
        if (i.id !== item.id || i.uid !== item.uid) return i;
        const kudos = { ...(i.kudos ?? {}) };
        if (given) delete kudos[me];
        else kudos[me] = myName;
        return { ...i, kudos };
      })
    );
    try {
      await setKudos(item.uid, item.id, me, given ? null : myName);
      if (!given) {
        sendKudosPing(item.uid, me, myName).catch(() => {});
        pushToFriend(item.uid, "kudos");
      }
    } catch {
      // put it back as it was
      setItems((list) => (list ?? []).map((i) => (i.id === item.id && i.uid === item.uid ? item : i)));
    }
  };

  return (
    <section className="panel p-4" aria-labelledby="feed-title">
      <h2 id="feed-title" className="heading text-lg text-zinc-100 flex items-center gap-2">
        <Activity size={18} className="text-orange-400" /> {tx("Crew activity")}
      </h2>
      {items === null ? (
        <div className="space-y-2 mt-3" role="status" aria-label={tx("Loading…")}>
          <Bone className="h-14 w-full" />
          <Bone className="h-14 w-full" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400 mt-2">{tx("No sessions from your crew in the last two weeks. A nudge might help.")}</p>
      ) : (
        <div className="mt-3"><CappedHeight label={tx("Crew activity")}>
        <ul className="space-y-2">
          {items.map((i) => {
            const k = kudosLine(i, me, tx("You"));
            k.names = k.names.map((n) => nameFor(n, tx));
            const given = !!i.kudos?.[me];
            const count = Object.keys(i.kudos ?? {}).length;
            return (
              <li key={`${i.uid}/${i.id}`} className="rounded-xl bg-zinc-950/60 p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-100">
                      <span className="font-medium">{nameFor(i.name, tx)}</span> ·{" "}
                      {i.sport && SPORT_META[i.sport] && (
                        <span role="img" aria-label={tx(SPORT_META[i.sport].name)}>
                          {SPORT_META[i.sport].emoji}{" "}
                        </span>
                      )}
                      {tx(i.focusLabel)}
                      {i.paired && (
                        <span className="text-zinc-400">
                          {" "}
                          · <Users size={12} className="inline -mt-0.5" /> {tx("together")}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {[ago(i.createdAtISO, locale), i.minutes ? tx("{n} min", { n: i.minutes }) : null, tx("{n} exercises", { n: i.exercises }), `+${i.xp} XP`].filter(Boolean).join(" · ")}
                    </p>
                    {i.records.length > 0 && (
                      <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                        <Trophy size={12} /> {tx("New record: {list}", { list: i.records.join(", ") })}
                      </p>
                    )}
                    {i.streak >= 2 && (
                      <p className="text-xs text-orange-300 mt-0.5 flex items-center gap-1">
                        <Flame size={12} /> {tx("{n}-week streak", { n: i.streak })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggle(i)}
                    aria-pressed={given}
                    aria-label={given ? tx("Take back kudos for {name}", { name: i.name }) : tx("Give {name} kudos", { name: i.name })}
                    className={`shrink-0 px-3 py-2 rounded-xl text-sm border flex items-center gap-1.5 ${
                      given ? "border-orange-500 bg-orange-500/15 text-orange-100" : "border-zinc-700 text-zinc-200 hover:border-orange-500"
                    }`}
                  >
                    <span aria-hidden>👏</span> {count > 0 ? count : tx("Kudos")}
                  </button>
                </div>
                {k.names.length > 0 && (
                  <p className="text-xs text-zinc-400 mt-1.5">
                    {k.more ? tx("{names} and {n} more gave kudos", { names: k.names.join(", "), n: k.more }) : tx("{names} gave kudos", { names: k.names.join(", ") })}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        </CappedHeight></div>
      )}
    </section>
  );
}
