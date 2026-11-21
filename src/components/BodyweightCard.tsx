"use client";

import { useMemo, useState } from "react";
import { Scale } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { updateProgress } from "@/lib/store";
import { localDate, logWeight, validKg, weightChange } from "@/lib/bodyweight";

// Bodyweight in Me: log today's weight, see the last three months. Logging
// also updates the weight on your profile.
export default function BodyweightCard() {
  const { userDoc, refreshUserDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const toast = useToast();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const log = useMemo(() => userDoc?.weightLog ?? [], [userDoc]);
  const recent = useMemo(() => {
    const since = localDate(new Date(Date.now() - 90 * 86400000));
    return log.filter((e) => e.date >= since);
  }, [log]);
  if (!userDoc) return null;

  const current = log[log.length - 1]?.kg ?? userDoc.body?.weightKg;
  const change = weightChange(log, 30);
  const num = (n: number) => n.toLocaleString(locale === "it" ? "it-IT" : "en-GB", { maximumFractionDigits: 1 });

  const save = async () => {
    const kg = parseFloat(value.replace(",", "."));
    if (!validKg(kg)) return toast.error(tx("Enter your weight in kg, between 30 and 250."));
    setSaving(true);
    try {
      await updateProgress(userDoc.uid, { weightLog: logWeight(log, kg), body: { ...userDoc.body, weightKg: Math.round(kg) } });
      await refreshUserDoc();
      setValue("");
      toast.success(tx("Logged {kg} kg.", { kg: num(kg) }));
    } catch {
      toast.error("Something went wrong — try again.");
    } finally {
      setSaving(false);
    }
  };

  // the chart: last 90 days
  const W = 300, H = 90, P = 6;
  const pts = recent.map((e) => ({ t: new Date(e.date).getTime(), kg: e.kg }));
  const minKg = Math.min(...pts.map((p) => p.kg)), maxKg = Math.max(...pts.map((p) => p.kg));
  const t0 = pts[0]?.t ?? 0, t1 = pts[pts.length - 1]?.t ?? 1;
  const x = (t: number) => P + ((t - t0) / Math.max(1, t1 - t0)) * (W - 2 * P);
  const y = (kg: number) => H - P - ((kg - minKg) / Math.max(0.5, maxKg - minKg)) * (H - 2 * P);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");

  return (
    <section className="panel p-4" aria-labelledby="bw-title">
      <h2 id="bw-title" className="heading text-base text-zinc-100 flex items-center gap-2">
        <Scale size={16} className="text-sky-300" /> {tx("Bodyweight")}
      </h2>
      <div className="flex items-baseline gap-3 mt-2">
        <span className="stat-mono text-3xl text-zinc-100">{current ? `${num(current)} kg` : "—"}</span>
        {change !== null && change !== 0 && (
          <span className="text-sm text-zinc-400">{tx("{d} kg in 30 days", { d: (change > 0 ? "+" : "") + num(change) })}</span>
        )}
      </div>
      {pts.length >= 2 ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24 mt-2" role="img" aria-label={tx("Bodyweight over the last 90 days: {a} to {b} kg", { a: num(pts[0].kg), b: num(pts[pts.length - 1].kg) })}>
          <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={x(p.t)} cy={y(p.kg)} r="2.5" fill="#38bdf8" />
          ))}
        </svg>
      ) : (
        <p className="text-sm text-zinc-400 mt-2">{tx("Log your weight now and then to see it over time. It helps “Then vs now” show your strength for your bodyweight.")}</p>
      )}
      <form
        className="flex gap-2 mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="flex-1">
          <span className="sr-only">{tx("Today's weight in kg")}</span>
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={tx("Today's weight (kg)")}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-zinc-100"
          />
        </label>
        <button type="submit" disabled={saving || !value} className="px-5 rounded-xl bg-sky-500 text-zinc-950 font-semibold disabled:opacity-40">
          {tx("Log")}
        </button>
      </form>
    </section>
  );
}
