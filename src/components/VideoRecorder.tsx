"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import { useLanguage } from "@/context/LanguageContext";
import { CLIP_MAX_SECONDS, pickRecorderMime } from "@/lib/videoProof";
import { Circle, Square, RefreshCcw, SwitchCamera, Check } from "lucide-react";

type Phase = "starting" | "ready" | "recording" | "review" | "error";

// Records a short clip of a Skill Check attempt. Prop the phone up, tap
// record, do the attempt. The clip goes back to the caller; nothing leaves
// the device here.
export default function VideoRecorder({
  open,
  onClose,
  onClip,
}: {
  open: boolean;
  onClose: () => void;
  onClip: (blob: Blob) => void;
}) {
  const { tx } = useLanguage();
  const [phase, setPhase] = useState<Phase>("starting");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [secondsLeft, setSecondsLeft] = useState(CLIP_MAX_SECONDS);
  const [clip, setClip] = useState<{ blob: Blob; url: string } | null>(null);
  const [camKey, setCamKey] = useState(0);
  const liveRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (!open || phase === "review") return;
    let cancelled = false;
    setPhase("starting");
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 720 }, height: { ideal: 1280 } }, audio: false })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        stopStream();
        streamRef.current = stream;
        if (liveRef.current) {
          liveRef.current.srcObject = stream;
          liveRef.current.play().catch(() => {});
        }
        setPhase("ready");
      })
      .catch(() => !cancelled && setPhase("error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facing, camKey]);

  // release the camera whenever the recorder closes
  useEffect(() => {
    if (!open) {
      recRef.current?.state === "recording" && recRef.current.stop();
      stopStream();
      setClip((c) => {
        if (c) URL.revokeObjectURL(c.url);
        return null;
      });
      setPhase("starting");
    }
  }, [open]);

  useEffect(() => () => stopStream(), []);

  useEffect(() => {
    if (phase !== "recording") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          recRef.current?.stop();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const start = () => {
    const stream = streamRef.current;
    const mime = pickRecorderMime();
    if (!stream || !mime) return setPhase("error");
    chunks.current = [];
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1_500_000 });
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: mime.split(";")[0] });
      setClip({ blob, url: URL.createObjectURL(blob) });
      setPhase("review");
      stopStream();
    };
    recRef.current = rec;
    setSecondsLeft(CLIP_MAX_SECONDS);
    rec.start(250);
    setPhase("recording");
  };

  const retake = () => {
    if (clip) URL.revokeObjectURL(clip.url);
    setClip(null);
    setPhase("starting");
    setCamKey((k) => k + 1); // reopen the camera
  };

  return (
    <Modal open={open} onClose={onClose} title={tx("Record your attempt")}>
      <div className="space-y-3">
        <p className="text-xs text-zinc-400">
          {tx("Prop your phone up so your whole body is in frame, then record. The clip stays on this device.")}
        </p>
        <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-[3/4] flex items-center justify-center">
          {phase === "review" && clip ? (
            <video src={clip.url} controls playsInline loop className="w-full h-full object-contain" />
          ) : (
            <video ref={liveRef} muted playsInline className={`w-full h-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`} />
          )}
          {phase === "error" && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-zinc-300 bg-zinc-950/90">
              {tx("Couldn't open the camera — allow camera access in your browser settings, or log the result without video.")}
            </div>
          )}
          {phase === "recording" && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-red-500/90 text-white text-xs px-2.5 py-1 stat-mono">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> 0:{String(secondsLeft).padStart(2, "0")}
            </div>
          )}
        </div>

        {phase === "review" ? (
          <div className="flex gap-2">
            <button onClick={retake} className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300 flex items-center justify-center gap-2">
              <RefreshCcw size={15} /> {tx("Retake")}
            </button>
            <button
              onClick={() => clip && onClip(clip.blob)}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Check size={15} /> {tx("Use this clip")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
              disabled={phase === "recording"}
              aria-label={tx("Switch camera")}
              className="px-4 rounded-xl border border-zinc-700 text-zinc-300 disabled:opacity-40"
            >
              <SwitchCamera size={16} />
            </button>
            {phase === "recording" ? (
              <button
                onClick={() => recRef.current?.stop()}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Square size={14} /> {tx("Stop")}
              </button>
            ) : (
              <button
                onClick={start}
                disabled={phase !== "ready"}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Circle size={14} className="fill-current" /> {tx("Record (up to {n}s)", { n: CLIP_MAX_SECONDS })}
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
