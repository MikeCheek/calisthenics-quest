"use client";

import { useEffect, useRef } from "react";
import type { SegmentValue } from "@/lib/bonusWheel";
import { playBeep } from "@/lib/sound";

// The prize wheel: segments with big numbers, pegs between them, a flapper
// at the top that kicks back as each peg passes, and a ring of lights that
// chase while it spins and flash on the result.
//
// The parent decides where it lands (`spin`); the wheel animates there with
// a long ease-out and calls onLanded. Rotation is written straight to the
// DOM each frame, so a spin doesn't re-render React 60 times a second.

export const SEGMENT_STYLE: Record<string, { fill: string; text: string; label: string }> = {
  "1": { fill: "#0f766e", text: "#f0fdfa", label: "1" },
  "2": { fill: "#0369a1", text: "#f0f9ff", label: "2" },
  "5": { fill: "#c2410c", text: "#fff7ed", label: "5" },
  "10": { fill: "#be123c", text: "#fff1f2", label: "10" },
  bonus: { fill: "#d97706", text: "#fffbeb", label: "★" },
};

const LIGHTS = 36;
const SPIN_MS = 5600;
const SPIN_MS_REDUCED = 900;

// strong ease-out: fast start, a long slow crawl past the last few pegs
const ease = (t: number) => 1 - Math.pow(1 - t, 4);

export default function PrizeWheel({
  segments,
  spin,
  onLanded,
  sound = true,
  highlight = null,
  label,
}: {
  segments: SegmentValue[];
  spin: { index: number; id: number } | null; // where to land; a new id starts a spin
  onLanded: (index: number) => void;
  sound?: boolean;
  highlight?: number | null; // the landed segment, lit up
  label: string;
}) {
  const n = segments.length;
  const a = 360 / n;
  const wheelRef = useRef<SVGGElement>(null);
  const flapRef = useRef<SVGGElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const rotation = useRef(0);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const landedRef = useRef(onLanded);
  landedRef.current = onLanded;

  useEffect(() => {
    if (!spin) return;
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? SPIN_MS_REDUCED : SPIN_MS;
    const start = rotation.current;
    // land inside the segment, not always dead centre
    const jitter = (Math.random() - 0.5) * a * 0.6;
    const targetAngle = spin.index * a + a / 2 + jitter; // clockwise from the top
    const base = Math.ceil(start / 360) * 360;
    const end = base + (reduced ? 360 : 360 * 6) + (360 - targetAngle);
    let lastPeg = Math.floor((start % 360) / a);
    let lastTick = 0;
    let frame = 0;
    const t0 = performance.now();
    ringRef.current?.classList.add("wheel-lights-chase");
    ringRef.current?.classList.remove("wheel-lights-win");

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const r = start + (end - start) * ease(t);
      rotation.current = r;
      wheelRef.current?.setAttribute("transform", `rotate(${r} 160 160)`);
      // a peg passes the flapper: kick it back, and tick
      const peg = Math.floor((((r % 360) + 360) % 360) / a);
      if (peg !== lastPeg) {
        lastPeg = peg;
        const flap = flapRef.current;
        if (flap) {
          flap.style.transition = "none";
          flap.style.transform = "rotate(-24deg)";
          requestAnimationFrame(() => {
            flap.style.transition = "transform 120ms ease-out";
            flap.style.transform = "rotate(0deg)";
          });
        }
        if (soundRef.current && now - lastTick > 45) {
          lastTick = now;
          playBeep(1400, 18);
        }
      }
      if (t < 1) frame = requestAnimationFrame(step);
      else {
        ringRef.current?.classList.remove("wheel-lights-chase");
        ringRef.current?.classList.add("wheel-lights-win");
        landedRef.current(spin.index);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // a new spin id is the only trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin?.id]);

  const R = 140; // segment radius inside the rim
  const arc = (i: number) => {
    const s = ((i * a - 90) * Math.PI) / 180;
    const e = (((i + 1) * a - 90) * Math.PI) / 180;
    return `M160 160 L${160 + R * Math.cos(s)} ${160 + R * Math.sin(s)} A${R} ${R} 0 0 1 ${160 + R * Math.cos(e)} ${160 + R * Math.sin(e)} Z`;
  };

  return (
    <svg viewBox="0 0 320 340" className="w-full h-auto select-none" role="img" aria-label={label}>
      <defs>
        <radialGradient id="wheel-shade" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
        <linearGradient id="wheel-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="50%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#52525b" />
        </linearGradient>
        <linearGradient id="wheel-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* rim and its lights (they stay still; the wheel turns inside) */}
      <circle cx="160" cy="160" r="158" fill="url(#wheel-rim)" />
      <g ref={ringRef} className="wheel-lights">
        {Array.from({ length: LIGHTS }, (_, i) => {
          const ang = ((i * 360) / LIGHTS - 90) * (Math.PI / 180);
          return <circle key={i} cx={160 + 151 * Math.cos(ang)} cy={160 + 151 * Math.sin(ang)} r="3.2" className={i % 2 ? "wheel-light-b" : "wheel-light-a"} />;
        })}
      </g>

      <g ref={wheelRef} transform="rotate(0 160 160)">
        {segments.map((v, i) => {
          const st = SEGMENT_STYLE[String(v)];
          const lit = highlight === i;
          return (
            <g key={i}>
              <path d={arc(i)} fill={v === "bonus" ? "url(#wheel-gold)" : st.fill} stroke="#09090b" strokeWidth="1.5" opacity={highlight === null || lit ? 1 : 0.45} />
              <text
                x="160"
                y={160 - R * 0.8}
                transform={`rotate(${i * a + a / 2} 160 160)`}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={v === 10 ? 19 : 22}
                fontWeight="800"
                fill={st.text}
                style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.35)", strokeWidth: 2 }}
              >
                {st.label}
              </text>
            </g>
          );
        })}
        <circle cx="160" cy="160" r={R} fill="url(#wheel-shade)" pointerEvents="none" />
        {/* pegs between segments */}
        {segments.map((_, i) => {
          const ang = ((i * a - 90) * Math.PI) / 180;
          return <circle key={i} cx={160 + (R - 4) * Math.cos(ang)} cy={160 + (R - 4) * Math.sin(ang)} r="3" fill="#e4e4e7" stroke="#71717a" strokeWidth="1" />;
        })}
      </g>

      {/* hub */}
      <circle cx="160" cy="160" r="30" fill="#09090b" stroke="#f97316" strokeWidth="3" />
      <path d="M160 145 L173 168 L147 168 Z" fill="#fb923c" />

      {/* flapper: pivots at its top as pegs hit it */}
      <g transform="translate(160 6)">
        <g ref={flapRef} style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}>
          <path d="M-11 0 L11 0 L0 34 Z" fill="#fafafa" stroke="#09090b" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="0" cy="4" r="3" fill="#f97316" />
        </g>
      </g>
    </svg>
  );
}
