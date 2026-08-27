"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function ExerciseTipButton({
  exerciseName,
  exerciseDetail,
  trackLabel,
  skillStage,
}: {
  exerciseName: string;
  exerciseDetail: string;
  trackLabel?: string;
  skillStage?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "unconfigured">("idle");
  const [tip, setTip] = useState<{ tip: string; mistake: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTip = async () => {
    if (status === "loading" || status === "done") return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/exercise-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseName, exerciseDetail, trackLabel, skillStage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(res.status === 501 ? "unconfigured" : "error");
        setError(data.error ?? "Couldn't get a tip right now.");
        return;
      }
      setTip({ tip: data.tip, mistake: data.mistake });
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Couldn't reach the AI coach.");
    }
  };

  return (
    <div>
      <button
        onClick={fetchTip}
        disabled={status === "loading" || status === "done"}
        className="text-xs px-2 py-1 rounded-lg border border-zinc-600 text-zinc-300 hover:border-orange-500 hover:text-zinc-100 flex items-center gap-1 disabled:opacity-70"
      >
        {status === "loading" ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} className="text-orange-400" />}
        {status === "done" ? "AI tip" : status === "loading" ? "Thinking..." : "AI tip"}
      </button>

      {status === "unconfigured" && (
        <p className="text-xs text-zinc-500 mt-1">AI tips aren&apos;t set up on this server.</p>
      )}
      {status === "error" && <p className="text-xs text-zinc-500 mt-1">{error}</p>}
      {status === "done" && tip && (
        <div className="mt-1.5 text-xs text-zinc-400 space-y-1 bg-zinc-800/50 rounded-lg p-2 border border-zinc-700">
          {tip.tip && (
            <div>
              <span className="text-orange-400">Tip: </span>
              {tip.tip}
            </div>
          )}
          {tip.mistake && (
            <div>
              <span className="text-orange-400">Watch out: </span>
              {tip.mistake}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
