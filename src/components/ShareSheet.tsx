"use client";

import { shownStreak } from "@/lib/weekStreak";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { buildCardSvg, cardFileName, CardFormat, CARD_SIZE, ShareCard } from "@/lib/shareCards";
import { svgToPngBlob, shareOrDownload, downloadBlob } from "@/lib/shareImage";
import { levelFromXp } from "@/lib/xp";
import { claimCounts, syncClaims } from "@/lib/verification";
import { Share2, Download, Loader2, Video } from "lucide-react";
import { loadClip } from "@/lib/videoProof";

// Preview + share for a card. The athlete's name is opt-in; the card
// otherwise carries only training numbers.
export default function ShareSheet({ card, onClose }: { card: ShareCard | null; onClose: () => void }) {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const toast = useToast();
  const [format, setFormat] = useState<CardFormat>("story");
  const [showName, setShowName] = useState(false);
  const [png, setPng] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [clip, setClip] = useState<Blob | null>(null);
  const videoKey = card?.kind === "verified" ? card.videoKey : undefined;
  useEffect(() => {
    setClip(null);
    if (videoKey) loadClip(videoKey).then((b) => setClip(b ?? null));
  }, [videoKey]);

  const svg = useMemo(() => {
    if (!card || !userDoc) return null;
    const claims = claimCounts(syncClaims(userDoc.claims, userDoc.skills));
    return buildCardSvg(card, {
      format,
      level: levelFromXp(userDoc.xp),
      verified: claims.verified,
      verifiedTotal: claims.total,
      streak: shownStreak(userDoc),
      name: showName ? userDoc.displayName?.split(" ")[0] : undefined,
      locale,
      tx,
    });
  }, [card, userDoc, format, showName, locale, tx]);

  useEffect(() => {
    if (!svg) return;
    let cancelled = false;
    let url: string | null = null;
    const [w, h] = CARD_SIZE[format];
    setPng(null);
    svgToPngBlob(svg, w, h)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPng({ blob, url });
      })
      .catch(() => !cancelled && toast.error("Couldn't create the image — try again."));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svg]);

  if (!card) return null;

  const share = async () => {
    if (!png) return;
    setBusy(true);
    const outcome = await shareOrDownload(png.blob, cardFileName(card), "BarQuests");
    setBusy(false);
    if (outcome === "downloaded") toast.success("Saved — add it to your story from your photos.");
  };

  return (
    <Modal open onClose={onClose} title={tx("Share card")}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <div
            className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center"
            style={{ width: format === "story" ? 207 : 300, height: format === "story" ? 368 : 300 }}
          >
            {png ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={png.url} alt={tx("Share card")} className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs text-muted flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> {tx("Preparing your card…")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-zinc-800/60 gap-1 flex-1">
            {(["story", "square"] as CardFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                aria-pressed={format === f}
                className={`flex-1 py-1.5 rounded-lg text-sm ${format === f ? "bg-zinc-950 text-zinc-100" : "text-zinc-400"}`}
              >
                {tx(f === "story" ? "Story" : "Square")}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300 shrink-0">
            <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} className="accent-orange-500 w-4 h-4" />
            {tx("Show my name")}
          </label>
        </div>

        {clip && videoKey && (
          <button
            onClick={() => shareOrDownload(clip, `barquests-${videoKey}`, "BarQuests")}
            className="w-full py-2.5 rounded-xl border border-red-400/50 text-red-200 hover:bg-red-500/10 text-sm flex items-center justify-center gap-2"
          >
            <Video size={15} /> {tx("Share the video too")}
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={share}
            disabled={!png || busy}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />} {tx("Share")}
          </button>
          <button
            onClick={() => png && downloadBlob(png.blob, cardFileName(card))}
            disabled={!png}
            className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm flex items-center gap-2 disabled:opacity-50"
            aria-label={tx("Download")}
          >
            <Download size={15} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
