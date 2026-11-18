"use client";

import { CheckSpec } from "@/lib/types";
import { validateCheckValue } from "@/lib/verification";
import { BadgeCheck, Minus, Plus, Timer, Video } from "lucide-react";
import { useEffect, useState } from "react";
import VideoRecorder from "@/components/VideoRecorder";
import { canRecordVideo, clipExtension, saveClip } from "@/lib/videoProof";
import { useLanguage } from "@/context/LanguageContext";

// Logs the result of a Skill Check. Holds are filled in from the timer's
// best clean attempt automatically (the athlete can still correct it);
// implausible numbers are flagged rather than silently accepted.
export default function SkillCheckPanel({
  spec,
  value,
  timerBest,
  onChange,
  videoKey,
  onVideo,
}: {
  spec: CheckSpec;
  value: number | boolean | undefined;
  timerBest: number | null;
  onChange: (v: number | boolean | undefined) => void;
  videoKey?: string;
  onVideo?: (key: string | undefined) => void;
}) {
  const { tx } = useLanguage();
  const [recording, setRecording] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  useEffect(() => setCanRecord(canRecordVideo()), []);
  const keepClip = async (blob: Blob) => {
    const key = `${spec.key}-${Date.now()}.${clipExtension(blob.type)}`;
    try {
      await saveClip(key, blob);
      onVideo?.(key);
    } catch {
      // storage full / unavailable: the check still counts without video
    }
    setRecording(false);
  };
  const effective = value ?? (spec.kind === "hold" && timerBest !== null ? timerBest : undefined);
  const error = effective === undefined ? null : validateCheckValue(spec, effective);
  const hit =
    effective !== undefined &&
    !error &&
    (spec.kind === "pass" ? effective === true : (effective as number) >= (spec.kind === "hold" ? spec.target * 0.95 : spec.target));

  return (
    <div className="mt-2 p-3 rounded-lg border border-sky-500/40 bg-sky-500/5 space-y-2">
      <div className="text-xs text-sky-300 flex items-start gap-1.5">
        <BadgeCheck size={13} className="shrink-0 mt-px" />
        <span>
          {tx("Verifies your claim:")} <span className="text-zinc-100">{tx(spec.label)}</span>
          {spec.kind === "hold" && <span className="text-zinc-400"> · {tx("{n}s hold", { n: spec.target })}</span>}
          {spec.kind === "reps" && <span className="text-zinc-400"> · {tx("{n} reps", { n: spec.target })}</span>}
        </span>
      </div>

      {spec.kind === "pass" ? (
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { v: true, label: tx("Nailed it") },
            { v: false, label: tx("Not yet") },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => onChange(value === o.v ? undefined : o.v)}
              className={`py-1.5 rounded-lg border text-xs ${
                value === o.v ? "border-sky-400 bg-sky-500/15 text-zinc-100" : "border-zinc-700 text-zinc-400"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={tx("Less")}
            onClick={() => onChange(Math.max(0, ((effective as number) ?? spec.target) - 1))}
            className="w-8 h-8 rounded-lg border border-zinc-600 text-zinc-300 flex items-center justify-center"
          >
            <Minus size={13} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={effective === undefined ? "" : String(effective)}
            placeholder={String(spec.target)}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Math.max(0, Math.round(Number(e.target.value))))}
            className="w-20 text-center bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 text-sm text-zinc-100 placeholder:text-muted"
          />
          <button
            type="button"
            aria-label={tx("More")}
            onClick={() => onChange(((effective as number) ?? spec.target - 1) + 1)}
            className="w-8 h-8 rounded-lg border border-zinc-600 text-zinc-300 flex items-center justify-center"
          >
            <Plus size={13} />
          </button>
          <span className="text-xs text-zinc-400">{spec.kind === "hold" ? tx("seconds (best)") : tx("clean reps")}</span>
        </div>
      )}

      {spec.kind === "hold" && timerBest !== null && value === undefined && (
        <div className="text-xs text-muted flex items-center gap-1">
          <Timer size={11} /> {tx("Filled in from the timer's best clean attempt")}
        </div>
      )}
      {onVideo && canRecord && (
        <div className="flex items-center gap-2 pt-1">
          {videoKey ? (
            <>
              <span className="text-xs text-emerald-300 flex items-center gap-1.5">
                <Video size={13} /> {tx("Clip attached — saved on this device")}
              </span>
              <button onClick={() => onVideo(undefined)} className="text-xs text-muted hover:text-zinc-300 ml-auto">
                {tx("Remove")}
              </button>
            </>
          ) : (
            <button
              onClick={() => setRecording(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-red-400 hover:text-red-300 flex items-center gap-1.5"
            >
              <Video size={13} /> {tx("Record your attempt (optional)")}
            </button>
          )}
        </div>
      )}
      <VideoRecorder open={recording} onClose={() => setRecording(false)} onClip={keepClip} />
      {error && <div className="text-xs text-orange-400">{tx(error)} — {tx("it won't be applied as is.")}</div>}
      {!error && effective !== undefined && (
        <div className={`text-xs ${hit ? "text-emerald-400" : "text-zinc-400"}`}>
          {hit ? tx("Target hit — this will verify your claim.") : tx("Short of the target — logged, and retested on another day.")}
        </div>
      )}
    </div>
  );
}
