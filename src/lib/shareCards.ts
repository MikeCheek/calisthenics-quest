import { PersonalRecord, SessionRecord, StagedSkillKey } from "./types";
import { demoFor } from "./demos/catalog";
import { keyPose } from "./demos/figure";
import { figureShapes, fittedViewBox, Shape } from "./demos/shapes";
import { exercisesForSkillStage } from "./exerciseHierarchy";
import { formatSets } from "./timingLearning";

// ---------------------------------------------------------------------------
// Shareable cards (story 1080x1920 or square 1080x1080), built as plain SVG
// so they're testable without a browser; shareImage.ts rasterizes them.
// Text is passed through the caller's translator. Nothing personal goes on
// a card unless the athlete opts in (their first name).
// ---------------------------------------------------------------------------

export type CardFormat = "story" | "square";

export type ShareCard =
  | { kind: "session"; record: SessionRecord }
  | { kind: "verified"; label: string; result?: string; dateISO: string; skill?: StagedSkillKey; stage?: string; videoKey?: string }
  | { kind: "record"; record: PersonalRecord; dateISO: string }
  // Then vs now (compare.ts): texts arrive already translated
  | {
      kind: "progress";
      fromISO: string; // the start of "then"
      dateISO: string; // the end of "now"
      strength: number | null; // %
      stages: number;
      levels: [number, number];
      skills: { name: string; from: string; to: string; skill?: StagedSkillKey; stage?: string }[];
      exercises: { name: string; from: string; to: string; change: number }[];
      areas?: { name: string; change: number }[]; // muscle groups, to fill in when there's little else
      figure?: string; // an exercise to draw when no skill stage-up has one
    };

export interface CardContext {
  format: CardFormat;
  level: number;
  verified: number;
  verifiedTotal: number;
  streak: number;
  name?: string; // only when the athlete chooses to show it
  locale: "en" | "it";
  tx: (english: string, vars?: Record<string, string | number>) => string;
}

export const CARD_SIZE: Record<CardFormat, [number, number]> = { story: [1080, 1920], square: [1080, 1080] };

const ORANGE = "#f97316";
const AMBER = "#fbbf24";
const EMERALD = "#34d399";
const TEXT = "#f4f4f5";
const SUB = "#a1a1aa";
const FONT = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Greedy word wrap by an approximate character budget.
export function wrap(text: string, maxChars: number, maxLines = 3): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if (!line) line = w;
    else if ((line + " " + w).length <= maxChars) line += " " + w;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    const last = kept[maxLines - 1];
    // keep the whole last line when the ellipsis still fits
    kept[maxLines - 1] = (last.length + 1 <= maxChars ? last : last.replace(/\s*\S*$/, "")) + "…";
    return kept;
  }
  return lines;
}

const text = (x: number, y: number, s: string, size: number, fill: string, opts: { weight?: number; anchor?: string; spacing?: number } = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${opts.weight ?? 400}" fill="${fill}"` +
  `${opts.anchor ? ` text-anchor="${opts.anchor}"` : ""}${opts.spacing ? ` letter-spacing="${opts.spacing}"` : ""}>${esc(s)}</text>`;

function shapeToSvg(s: Shape, scale: number): string {
  if (s.t === "line")
    return `<line x1="${s.x1.toFixed(1)}" y1="${s.y1.toFixed(1)}" x2="${s.x2.toFixed(1)}" y2="${s.y2.toFixed(1)}" stroke="${s.stroke}" stroke-width="${(s.w * scale).toFixed(2)}" stroke-linecap="round"/>`;
  if (s.t === "circle") return `<circle cx="${s.cx.toFixed(1)}" cy="${s.cy.toFixed(1)}" r="${s.r}" fill="${s.fill}"/>`;
  return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx ?? 0}" fill="${s.fill}"/>`;
}

// The exercise's key position, drawn into the box (x, y, w, h).
function figure(exerciseName: string | undefined, x: number, y: number, w: number, h: number): string {
  const entry = exerciseName ? demoFor(exerciseName) : null;
  if (!entry) return "";
  const vb = fittedViewBox(entry.demo, 10);
  // strokes are drawn in viewBox units; thicken them a touch for a poster
  const shapes = figureShapes(entry.demo.props, keyPose(entry.demo)).map((s) => shapeToSvg(s, 1.25)).join("");
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb.map((n) => n.toFixed(1)).join(" ")}" preserveAspectRatio="xMidYMid meet">${shapes}</svg>`;
}

function illustrationFor(card: ShareCard): string | undefined {
  if (card.kind === "record") return card.record.name;
  if (card.kind === "progress") {
    const top = card.skills.find((s) => s.skill && s.stage);
    const fromSkill = top ? exercisesForSkillStage(top.skill!, top.stage!).find((n) => demoFor(n)) : undefined;
    return fromSkill ?? (card.figure && demoFor(card.figure) ? card.figure : undefined);
  }
  if (card.kind === "session") {
    const main = card.record.exercises.find(
      (e) => e.outcome === "done" && e.setTitle !== "Warm-Up" && e.setTitle !== "Final Hits" && demoFor(e.name)
    );
    return main?.name;
  }
  if (card.skill && card.stage) return exercisesForSkillStage(card.skill, card.stage).find((n) => demoFor(n) && /hold/i.test(n)) ??
    exercisesForSkillStage(card.skill, card.stage).find((n) => demoFor(n));
  return undefined;
}

function dateLabel(iso: string, locale: "en" | "it"): string {
  return new Date(iso).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function buildCardSvg(card: ShareCard, ctx: CardContext): string {
  const [W, H] = CARD_SIZE[ctx.format];
  const story = ctx.format === "story";
  const { tx } = ctx;
  const pad = 80;
  const parts: string[] = [];

  // background + glow
  parts.push(
    `<defs>` +
      `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18181b"/><stop offset="1" stop-color="#09090b"/></linearGradient>` +
      `<radialGradient id="glow" cx="0.85" cy="0.1" r="0.7"><stop offset="0" stop-color="${ORANGE}" stop-opacity="0.28"/><stop offset="1" stop-color="${ORANGE}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="glow2" cx="0.1" cy="0.95" r="0.6"><stop offset="0" stop-color="${card.kind === "session" ? ORANGE : card.kind === "verified" || card.kind === "progress" ? EMERALD : AMBER}" stop-opacity="0.16"/><stop offset="1" stop-opacity="0"/></radialGradient>` +
      `</defs>` +
      `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#glow)"/><rect width="${W}" height="${H}" fill="url(#glow2)"/>`
  );

  // brand + date
  const dateISO = card.kind === "session" ? card.record.finishedAt : card.dateISO;
  parts.push(`<path d="M${pad} ${pad + 44} L${pad + 22} ${pad + 6} L${pad + 44} ${pad + 44} Z" fill="${ORANGE}"/>`);
  parts.push(text(pad + 60, pad + 42, "BarQuests", 44, TEXT, { weight: 700 }));
  parts.push(text(W - pad, pad + 40, dateLabel(dateISO, ctx.locale), 32, SUB, { anchor: "end" }));

  let y = story ? 330 : 250;
  const kicker = (label: string, color: string) => {
    parts.push(`<rect x="${pad}" y="${y - 44}" width="${label.length * 24 + 60}" height="64" rx="32" fill="${color}" fill-opacity="0.15"/>`);
    parts.push(text(pad + 28, y, label.toUpperCase(), 30, color, { weight: 700, spacing: 3 }));
    y += story ? 110 : 90;
  };
  const headline = (s: string, size: number, maxChars: number, maxLines: number) => {
    for (const line of wrap(s, maxChars, maxLines)) {
      parts.push(text(pad, y, line, size, TEXT, { weight: 800 }));
      y += size * 1.08;
    }
  };

  if (card.kind === "progress") {
    kicker(tx("Then vs now"), EMERALD);
    y += 20;
    const big = card.strength !== null && card.strength > 0 ? tx("+{n}% stronger", { n: card.strength }) : card.stages > 0 ? tx("+{n} skill stages", { n: card.stages }) : tx("Level {a} → {b}", { a: card.levels[0], b: card.levels[1] });
    headline(big, story ? 120 : 96, story ? 14 : 17, 2);
    parts.push(text(pad, y + 4, `${dateLabel(card.fromISO, ctx.locale)} → ${dateLabel(card.dateISO, ctx.locale)}`, 34, SUB));
    y += story ? 90 : 70;
    const row = (label: string, value: string, color: string) => {
      parts.push(`<rect x="${pad}" y="${y - 50}" width="${W - pad * 2}" height="76" rx="22" fill="#ffffff" fill-opacity="0.05"/>`);
      parts.push(text(pad + 28, y, label, 34, TEXT, { weight: 600 }));
      parts.push(text(W - pad - 28, y, value, 34, color, { weight: 700, anchor: "end" }));
      y += 92;
    };
    for (const sk of card.skills.slice(0, story ? 3 : 2)) row(sk.name, `${sk.from} → ${sk.to}`, EMERALD);
    const max = story ? 7 : 4;
    let shown = Math.min(card.skills.length, story ? 3 : 2);
    for (const ex of card.exercises.slice(0, story ? 4 : 2)) {
      row(ex.name, `${ex.from} → ${ex.to}`, AMBER);
      shown++;
    }
    for (const a of (card.areas ?? []).filter((x) => x.change > 0).slice(0, Math.max(0, max - shown))) row(a.name, `+${a.change}%`, EMERALD);
  } else if (card.kind === "verified") {
    kicker(tx("Verified in training"), EMERALD);
    headline(tx(card.label), story ? 108 : 92, story ? 16 : 18, 2);
    if (card.result) {
      y += story ? 40 : 20;
      const r = /^\d+ reps$/.test(card.result) ? tx("{n} reps", { n: card.result.split(" ")[0] }) : tx(card.result);
      parts.push(text(pad, y + 40, r, story ? 150 : 120, EMERALD, { weight: 800 }));
      y += story ? 120 : 90;
    }
    if (card.videoKey) {
      const label = tx("On video");
      parts.push(`<rect x="${pad}" y="${y + 10}" width="${label.length * 22 + 90}" height="58" rx="29" fill="#ef4444" fill-opacity="0.18"/>`);
      parts.push(`<circle cx="${pad + 32}" cy="${y + 39}" r="10" fill="#ef4444"/>`);
      parts.push(text(pad + 56, y + 50, label.toUpperCase(), 28, "#fca5a5", { weight: 700, spacing: 2 }));
      y += 90;
    }
    // badge
    const bx = W - pad - 120, by = story ? 640 : 520;
    parts.push(`<circle cx="${bx}" cy="${by}" r="${story ? 110 : 90}" fill="${EMERALD}" fill-opacity="0.15" stroke="${EMERALD}" stroke-width="6"/>`);
    parts.push(`<path d="M${bx - 44} ${by + 4} L${bx - 10} ${by + 38} L${bx + 50} ${by - 34}" stroke="${EMERALD}" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  } else if (card.kind === "record") {
    kicker(tx("New personal best"), AMBER);
    headline(card.record.name, story ? 96 : 84, story ? 18 : 20, 2);
    y += story ? 50 : 20;
    const value = card.record.kind === "hold" ? `${card.record.previous}s → ${card.record.value}s` : tx("{a} → {b} reps", { a: card.record.previous, b: card.record.value });
    parts.push(text(pad, y + 40, value, story ? 120 : 100, AMBER, { weight: 800 }));
    y += story ? 110 : 80;
  } else {
    const r = card.record;
    kicker(tx("Session complete"), ORANGE);
    headline(tx(r.focusLabel), story ? 120 : 100, story ? 14 : 16, 2);
    y += story ? 30 : 10;
    const main = r.exercises.filter((e) => e.setTitle !== "Warm-Up" && e.setTitle !== "Final Hits");
    const done = main.filter((e) => e.outcome === "done").length;
    const stats: [string, string][] = [
      ...(r.durationMin ? ([[`${r.durationMin}′`, tx("minutes")]] as [string, string][]) : []),
      [`${done}/${main.length}`, tx("exercises")],
      [`+${r.xp}`, "XP"],
    ];
    const colW = (W - pad * 2) / stats.length;
    stats.forEach(([v, l], i) => {
      const cx = pad + colW * i;
      parts.push(`<rect x="${cx}" y="${y - 10}" width="${colW - 20}" height="${story ? 170 : 150}" rx="28" fill="#ffffff" fill-opacity="0.05"/>`);
      parts.push(text(cx + 30, y + (story ? 85 : 75), v, story ? 76 : 64, TEXT, { weight: 800 }));
      parts.push(text(cx + 30, y + (story ? 135 : 120), l, 30, SUB));
    });
    y += story ? 230 : 190;
    for (const pr of (r.records ?? []).slice(0, story ? 3 : 1)) {
      const v = pr.kind === "hold" ? `${pr.previous}s → ${pr.value}s` : tx("{a} → {b} reps", { a: pr.previous, b: pr.value });
      parts.push(`<circle cx="${pad + 18}" cy="${y - 14}" r="14" fill="${AMBER}"/>`);
      parts.push(text(pad + 50, y, `${tx("New personal best")}: ${pr.name} · ${v}`, 34, AMBER, { weight: 600 }));
      y += 60;
    }
    {
      y += 20;
      for (const e of main.filter((x) => x.outcome === "done").slice(0, story ? 6 : 3 - Math.min(1, (r.records ?? []).length))) {
        const sets = formatSets(e.sets);
        parts.push(text(pad, y, `✓  ${e.name}`, 36, TEXT));
        if (sets) parts.push(text(W - pad, y, sets, 32, SUB, { anchor: "end" }));
        y += 58;
      }
    }
  }

  // illustration fills the space left above the footer
  const footerTop = H - (story ? 260 : 190);
  const figTop = Math.max(y + 20, story ? 0 : 0);
  const figH = footerTop - figTop - 30;
  const ill = illustrationFor(card);
  if (ill && figH > 160) {
    parts.push(`<rect x="${pad}" y="${figTop}" width="${W - pad * 2}" height="${figH}" rx="40" fill="#ffffff" fill-opacity="0.03"/>`);
    parts.push(figure(ill, pad + 30, figTop + 20, W - pad * 2 - 60, figH - 40));
  }

  // footer: the headline numbers, and the name only if chosen
  parts.push(`<line x1="${pad}" y1="${footerTop}" x2="${W - pad}" y2="${footerTop}" stroke="#ffffff" stroke-opacity="0.1" stroke-width="2"/>`);
  const fy = footerTop + (story ? 90 : 80);
  parts.push(text(pad, fy, tx("Level {n}", { n: ctx.level }), story ? 54 : 46, TEXT, { weight: 800 }));
  const right = [
    ctx.verifiedTotal ? tx("{a}/{b} verified", { a: ctx.verified, b: ctx.verifiedTotal }) : null,
    ctx.streak > 1 ? tx("{n}-day streak", { n: ctx.streak }) : null,
  ].filter(Boolean).join(" · ");
  if (right) parts.push(text(W - pad, fy, right, 32, SUB, { anchor: "end" }));
  if (ctx.name) parts.push(text(pad, fy + 56, ctx.name, 34, SUB));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("")}</svg>`;
}

export function cardFileName(card: ShareCard): string {
  const base =
    card.kind === "session"
      ? `session-${card.record.focusLabel}`
      : card.kind === "record"
      ? `record-${card.record.name}`
      : card.kind === "progress"
      ? `then-vs-now-${card.dateISO.slice(0, 10)}`
      : `verified-${card.label}`;
  return `barquests-${base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.png`;
}
