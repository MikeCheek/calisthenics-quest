import { Demo, Pose, Prop, skeleton, SEG, poseAt, demoDuration } from "./figure";

// Plain drawing primitives for a pose + its props, shared by the React
// component and any static rendering, so both draw exactly the same thing.
export type Shape =
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; w: number }
  | { t: "circle"; cx: number; cy: number; r: number; fill: string }
  | { t: "rect"; x: number; y: number; w: number; h: number; fill: string; rx?: number };

const BODY = "#e4e4e7";
const FAR = "#9a9aa3"; // far-side limbs, slightly dimmer for depth
const KIT = "#f97316";
const KIT_DIM = "#52525b";

function propShapes(p: Prop): Shape[] {
  switch (p.kind) {
    case "bar":
      return [{ t: "line", x1: p.x1, y1: p.y, x2: p.x2, y2: p.y, stroke: KIT, w: 3.5 }];
    case "floor":
      return [{ t: "line", x1: -200, y1: p.y + 2, x2: 400, y2: p.y + 2, stroke: KIT_DIM, w: 2 }];
    case "wall":
      return [{ t: "rect", x: p.x - 4, y: p.y1 - 200, w: 4, h: p.y2 - p.y1 + 202, fill: KIT_DIM }];
    case "pole":
      return [{ t: "line", x1: p.x, y1: p.y1 - 200, x2: p.x, y2: p.y2, stroke: KIT, w: 3.5 }];
    case "pbars":
      return [
        { t: "line", x1: p.x1, y1: p.y, x2: p.x2, y2: p.y, stroke: KIT, w: 3.5 },
        { t: "line", x1: p.x1 + 4, y1: p.y, x2: p.x1 + 4, y2: 110, stroke: KIT_DIM, w: 2 },
        { t: "line", x1: p.x2 - 4, y1: p.y, x2: p.x2 - 4, y2: 110, stroke: KIT_DIM, w: 2 },
      ];
    case "rings":
      return [
        { t: "line", x1: p.x, y1: p.ropeTop, x2: p.x, y2: p.y - 4, stroke: KIT_DIM, w: 1.5 },
        { t: "circle", cx: p.x, cy: p.y, r: 4, fill: KIT },
      ];
    case "box":
      return [{ t: "rect", x: p.x, y: p.y, w: p.w, h: p.h, fill: KIT_DIM, rx: 2 }];
  }
}

const seg = (a: [number, number], b: [number, number], stroke: string, w: number): Shape => ({
  t: "line", x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke, w,
});

export function figureShapes(props: Prop[], pose: Pose): Shape[] {
  const s = skeleton(pose);
  const out: Shape[] = props.flatMap(propShapes);
  // far limbs first so the near side draws on top
  const [arm, arm2] = s.arms;
  const [leg, leg2] = s.legs;
  if (pose.leg2) out.push(seg(s.hip, leg2.joint, FAR, 3.2), seg(leg2.joint, leg2.end, FAR, 3));
  if (pose.arm2) out.push(seg(s.shoulder, arm2.joint, FAR, 3), seg(arm2.joint, arm2.end, FAR, 2.8));
  out.push(seg(s.hip, s.shoulder, BODY, 4.2));
  out.push(seg(s.hip, leg.joint, BODY, 3.6), seg(leg.joint, leg.end, BODY, 3.4));
  out.push(seg(s.shoulder, arm.joint, BODY, 3.4), seg(arm.joint, arm.end, BODY, 3.2));
  out.push({ t: "circle", cx: s.head[0], cy: s.head[1], r: SEG.head, fill: BODY });
  out.push({ t: "circle", cx: s.face[0], cy: s.face[1], r: 1.4, fill: KIT });
  return out;
}

export function shapesToSvg(shapes: Shape[], viewBox: [number, number, number, number]): string {
  const body = shapes
    .map((s) =>
      s.t === "line"
        ? `<line x1="${s.x1.toFixed(1)}" y1="${s.y1.toFixed(1)}" x2="${s.x2.toFixed(1)}" y2="${s.y2.toFixed(1)}" stroke="${s.stroke}" stroke-width="${s.w}" stroke-linecap="round"/>`
        : s.t === "circle"
        ? `<circle cx="${s.cx.toFixed(1)}" cy="${s.cy.toFixed(1)}" r="${s.r}" fill="${s.fill}"/>`
        : `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx ?? 0}" fill="${s.fill}"/>`
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.join(" ")}">${body}</svg>`;
}

// A frame fitted to where the figure actually goes over the whole loop
// (sampled), plus the equipment it touches — so floor exercises don't sit
// in the bottom third of an empty box. Floors and poles are clipped to it.
export function fittedViewBox(demo: Demo, pad = 8): [number, number, number, number] {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const take = (x: number, y: number) => {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  };
  const total = demoDuration(demo);
  for (let ms = 0; ms <= total; ms += Math.max(40, total / 60)) {
    const sk = skeleton(poseAt(demo, ms));
    for (const p of [sk.hip, sk.shoulder, ...sk.arms.flatMap((a) => [a.joint, a.end]), ...sk.legs.flatMap((l) => [l.joint, l.end])]) take(p[0], p[1]);
    take(sk.head[0] - SEG.head, sk.head[1] - SEG.head);
    take(sk.head[0] + SEG.head, sk.head[1] + SEG.head);
  }
  for (const p of demo.props) {
    if (p.kind === "bar" || p.kind === "pbars") take(Math.max(p.x1, x0 - 14), p.y), take(Math.min(p.x2, x1 + 14), p.y);
    else if (p.kind === "floor") take(x0, p.y + 3);
    else if (p.kind === "rings") take(p.x, p.y + 4);
    else if (p.kind === "box") take(p.x, p.y), take(p.x + p.w, p.y + p.h);
    else if (p.kind === "wall") take(p.x - 4, y0);
  }
  // keep a sensible minimum size and a not-too-skinny shape
  let w = x1 - x0 + pad * 2, h = y1 - y0 + pad * 2;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  w = Math.max(w, 70, h * 0.9);
  h = Math.max(h, 52, w * 0.55);
  return [cx - w / 2, cy - h / 2, w, h];
}
