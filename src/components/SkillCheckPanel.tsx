"use client";

import { CheckSpec } from "@/lib/types";
import { validateCheckValue } from "@/lib/verification";
import { BadgeCheck, Minus, Plus, Timer } from "lucide-react";

// Logs the result of a Skill Check. Holds are filled in from the timer's
// best clean attempt automatically (the athlete can still correct it);
// implausible numbers are flagged rather than silently accepted.
export default function SkillCheckPanel({
  spec,
  value,
  timerBest,
  onChange,
}: {
  spec: CheckSpec;
  value: number | boolean | undefined;
  timerBest: number | null;
  onChange: (v: number | boolean | undefined) => void;
}) {
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
          Verifies your claim: <span className="text-zinc-100">{spec.label}</span>
          {spec.kind === "hold" && <span className="text-zinc-400"> · {spec.target}s hold</span>}
          {spec.kind === "reps" && <span className="text-zinc-400"> · {spec.target} rep{spec.target === 1 ? "" : "s"}</span>}
        </span>
      </div>

      {spec.kind === "pass" ? (
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { v: true, label: "Nailed it" },
            { v: false, label: "Not yet" },
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
            aria-label="Less"
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
            className="w-20 text-center bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 text-sm text-zinc-100"
          />
          <button
            type="button"
            aria-label="More"
            onClick={() => onChange(((effective as number) ?? spec.target - 1) + 1)}
            className="w-8 h-8 rounded-lg border border-zinc-600 text-zinc-300 flex items-center justify-center"
          >
            <Plus size={13} />
          </button>
          <span className="text-xs text-zinc-400">{spec.kind === "hold" ? "seconds (best)" : "clean reps"}</span>
        </div>
      )}

      {spec.kind === "hold" && timerBest !== null && value === undefined && (
        <div className="text-[11px] text-zinc-500 flex items-center gap-1">
          <Timer size={11} /> Filled in from the timer&apos;s best clean attempt
        </div>
      )}
      {error && <div className="text-[11px] text-orange-400">{error} — it won&apos;t be applied as is.</div>}
      {!error && effective !== undefined && (
        <div className={`text-[11px] ${hit ? "text-emerald-400" : "text-zinc-400"}`}>
          {hit ? "Target hit — this will verify your claim." : "Short of the target — logged, and retested on another day."}
        </div>
      )}
    </div>
  );
}
