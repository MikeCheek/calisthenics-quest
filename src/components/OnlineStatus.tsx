"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { waitForPendingWrites } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { DEMO_MODE } from "@/lib/demoMode/flag";
import { clearQueuedWrites, hadQueuedWrites } from "@/lib/offlineWrites";

// A small note while there's no connection — training keeps working and
// saves on the phone — and, once it's back, word when what was saved
// offline has actually reached the server.
export default function OnlineStatus() {
  const { tx } = useLanguage();
  const toast = useToast();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(navigator.onLine === false);
    update();
    const back = () => {
      update();
      if (DEMO_MODE || !hadQueuedWrites()) return;
      waitForPendingWrites(db)
        .then(() => {
          clearQueuedWrites();
          toast.success("Back online — your training is synced.");
        })
        .catch(() => {});
    };
    window.addEventListener("offline", update);
    window.addEventListener("online", back);
    return () => {
      window.removeEventListener("offline", update);
      window.removeEventListener("online", back);
    };
  }, [toast]);

  if (!offline) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[5.25rem] sm:bottom-4 z-30 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <p role="status" className="mx-auto w-fit max-w-full rounded-full bg-amber-950/95 border border-amber-700/60 text-amber-100 text-sm px-4 py-2 flex items-center gap-2 shadow-lg">
        <WifiOff size={16} className="shrink-0" />
        {tx("Offline — training still works and saves on this phone.")}
      </p>
    </div>
  );
}
