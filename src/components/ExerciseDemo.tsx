"use client";

import { useEffect, useMemo, useState } from "react";
import { demoFor } from "@/lib/demos/catalog";
import { poseAt, keyPose } from "@/lib/demos/figure";
import { figureShapes, fittedViewBox } from "@/lib/demos/shapes";
import { useLanguage } from "@/context/LanguageContext";

// Looping stick-figure demonstration of an exercise (see lib/demos). Renders
// nothing for exercises without a demo. Honors prefers-reduced-motion by
// showing the key position instead, and stops animating in background tabs.
export default function ExerciseDemo({
  exerciseName,
  width = 200,
  className = "",
}: {
  exerciseName: string;
  width?: number;
  className?: string;
}) {
  const { tx } = useLanguage();
  const entry = useMemo(() => demoFor(exerciseName), [exerciseName]);
  const viewBox = useMemo(() => (entry ? fittedViewBox(entry.demo) : null), [entry]);
  const [ms, setMs] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(!!mq?.matches);
    const onChange = () => setReduced(!!mq?.matches);
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!entry || reduced) return;
    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      if (!document.hidden) setMs(now - start);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [entry, reduced]);

  if (!entry || !viewBox) return null;
  const { demo } = entry;
  const pose = reduced ? keyPose(demo) : poseAt(demo, ms);
  const shapes = figureShapes(demo.props, pose);
  const [, , vw, vh] = viewBox;
  const height = Math.min((width * vh) / vw, width * 1.1);

  return (
    <figure className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox={viewBox.join(" ")}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${tx("Demonstration")}: ${exerciseName}`}
        className="rounded-xl bg-zinc-950/60 border border-zinc-800"
      >
        {shapes.map((s, i) =>
          s.t === "line" ? (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.stroke} strokeWidth={s.w} strokeLinecap="round" />
          ) : s.t === "circle" ? (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />
          ) : (
            <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx ?? 0} fill={s.fill} />
          )
        )}
      </svg>
      {reduced && <figcaption className="text-xs text-muted mt-1">{tx("Animation paused (reduced motion)")}</figcaption>}
    </figure>
  );
}
