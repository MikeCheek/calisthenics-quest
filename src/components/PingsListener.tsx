"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { listenPings, dismissPing } from "@/lib/store";
import { Ping } from "@/lib/types";
import { firePing } from "@/lib/notifications";

// Purely a listener — friend pings now surface through the shared toast
// system (top-center, same as every other notification) instead of their
// own bespoke fixed banner.
export default function PingsListener() {
  const { user } = useAuth();
  const toast = useToast();
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const unsub = listenPings(user.uid, (list: Ping[]) => {
      const fresh = list.filter((p) => !seenIds.has(p.id));
      if (fresh.length > 0) {
        fresh.forEach((p) => {
          firePing(p.fromName, p.message);
          toast.info(`${p.fromName} ${p.message}`);
          dismissPing(user.uid, p.id);
        });
        setSeenIds((prev) => new Set([...prev, ...fresh.map((p) => p.id)]));
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return null;
}
