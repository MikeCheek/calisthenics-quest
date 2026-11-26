"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, ListOrdered, Target, Wind, Wrench, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { demoFor } from "@/lib/demos/catalog";
import { guideIdFor, loadGuides, variantLines, type GuideText } from "@/lib/guides";

// How to do an exercise properly: setup, the steps, the positions and angles
// to aim for, the common mistakes with their fix, breathing — plus what this
// particular version changes. The text loads on demand, one language at a
// time; until then (or offline before it was ever loaded) the movement's
// short mistakes list is shown.
export default function FormGuide({ exerciseName }: { exerciseName: string }) {
  const { tx, locale } = useLanguage();
  const id = guideIdFor(exerciseName);
  const [guide, setGuide] = useState<GuideText | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setGuide(null);
    setFailed(false);
    if (!id) return;
    loadGuides(locale)
      .then((t) => live && setGuide(t[id] ?? null))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [id, locale]);

  const versions = variantLines(exerciseName, locale);

  if (!guide) {
    // fallback while loading or when the guide can't be loaded
    const mistakes = demoFor(exerciseName)?.mistakes ?? [];
    if (!mistakes.length) return id && !failed ? <p className="text-xs text-zinc-400">{tx("Loading the guide…")}</p> : null;
    return (
      <Section icon={AlertTriangle} title={tx("Common mistakes")} tone="warn">
        <ul className="space-y-1">
          {mistakes.map((m) => (
            <li key={m} className="flex gap-2">
              <span className="text-orange-400" aria-hidden>✕</span>
              {tx(m)}
            </li>
          ))}
        </ul>
      </Section>
    );
  }

  return (
    <div className="space-y-3" data-testid="form-guide">
      <Section icon={Wrench} title={tx("Setup")}>
        {guide.setup.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </Section>
      <Section icon={ListOrdered} title={tx("Step by step")}>
        <ol className="space-y-1.5">
          {guide.steps.map((l, i) => (
            <li key={l} className="flex gap-2">
              <span className="stat-mono text-orange-400 w-4 shrink-0">{i + 1}</span>
              <span>{l}</span>
            </li>
          ))}
        </ol>
      </Section>
      {versions.length > 0 && (
        <Section icon={Sparkles} title={tx("This version")}>
          <ul className="space-y-1.5">
            {versions.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Section>
      )}
      <Section icon={Target} title={tx("What to aim for")} tone="good">
        <ul className="space-y-1.5">
          {guide.targets.map((l) => (
            <li key={l} className="flex gap-2">
              <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section icon={AlertTriangle} title={tx("Common mistakes")} tone="warn">
        <ul className="space-y-2">
          {guide.mistakes.map(([m, fix]) => (
            <li key={m}>
              <div className="flex gap-2 text-zinc-200">
                <span className="text-orange-400" aria-hidden>✕</span>
                {m}
              </div>
              <div className="flex gap-2 text-zinc-400 pl-5">
                <span className="sr-only">{tx("Fix")}: </span>
                <span aria-hidden className="text-emerald-400">→</span>
                {fix}
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section icon={Wind} title={tx("Breathing")}>
        <p>{guide.breath}</p>
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: typeof Target;
  title: string;
  tone?: "good" | "warn";
  children: React.ReactNode;
}) {
  const box =
    tone === "warn"
      ? "border-orange-500/25 bg-orange-500/5"
      : tone === "good"
        ? "border-emerald-500/25 bg-emerald-500/5"
        : "border-zinc-800 bg-zinc-950/40";
  const head = tone === "warn" ? "text-orange-300" : tone === "good" ? "text-emerald-300" : "text-zinc-400";
  return (
    <section className={`rounded-xl border p-3 text-sm text-zinc-300 ${box}`}>
      <h3 className={`text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5 ${head}`}>
        <Icon size={12} aria-hidden /> {title}
      </h3>
      {children}
    </section>
  );
}
