"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listenPings, dismissPing } from "@/lib/store";
import { Ping } from "@/lib/types";
import { firePing } from "@/lib/notifications";
import { Zap, X } from "lucide-react";

export default function PingsListener() {
  const { user } = useAuth();
  const [pings, setPings] = useState<Ping[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const unsub = listenPings(user.uid, (list) => {
      setPings(list);
      const fresh = list.filter((p) => !seenIds.has(p.id));
      if (fresh.length > 0) {
        fresh.forEach((p) => firePing(p.fromName, p.message));
        setSeenIds((prev) => new Set([...prev, ...fresh.map((p) => p.id)]));
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user || pings.length === 0) return null;

  const latest = pings[0];

  return (
    <div className="fixed top-2 left-2 right-2 z-30 max-w-md mx-auto">
      <div className="panel p-3 flex items-center gap-3 border-orange-500/40 shadow-lg">
        <Zap size={18} className="text-orange-400 shrink-0" />
        <div className="flex-1 text-sm text-zinc-100">
          <span className="font-medium">{latest.fromName}</span>{" "}
          <span className="text-zinc-400">{latest.message}</span>
        </div>
        <button
          onClick={() => user && dismissPing(user.uid, latest.id)}
          className="text-zinc-500 hover:text-zinc-200 p-1 shrink-0"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
