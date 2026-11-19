import { test } from "node:test";
import assert from "node:assert/strict";
import { parseChatMarkdown, parseInline } from "../src/lib/chatMarkdown";

test("bold, italic and code inline", () => {
  assert.deepEqual(parseInline("Hit **straight-arm** work, *slowly*, `3×5`."), [
    { t: "text", v: "Hit " },
    { t: "b", v: "straight-arm" },
    { t: "text", v: " work, " },
    { t: "i", v: "slowly" },
    { t: "text", v: ", " },
    { t: "code", v: "3×5" },
    { t: "text", v: "." },
  ]);
});

test("a lone asterisk or multiplication isn't italic", () => {
  assert.deepEqual(parseInline("3 * 5 reps"), [{ t: "text", v: "3 * 5 reps" }]);
});

test("the coach's typical reply: paragraph, bold lead-in, numbered list", () => {
  const blocks = parseChatMarkdown(
    "You're at an elite base — 15 pull-ups.\n\n**Priority order for the next 4–6 weeks**\n1. **Front Lever** – move from One-Leg → Straddle.\n2. **Planche** – Tuck → Advanced Tuck.\n   - add 3-sec lowers\n3. **HSPU** – negatives."
  );
  assert.deepEqual(blocks.map((b) => b.kind), ["p", "p", "ol"]);
  const ol = blocks[2] as Extract<(typeof blocks)[number], { kind: "ol" }>;
  assert.equal(ol.start, 1);
  assert.equal(ol.items.length, 3);
  assert.deepEqual(ol.items[0].line[0], { t: "b", v: "Front Lever" });
  assert.deepEqual(ol.items[1].sub, [[{ t: "text", v: "add 3-sec lowers" }]]);
});

test("bullets, headings and line breaks", () => {
  const blocks = parseChatMarkdown("## Plan\nMonday: pull\nTuesday: rest\n\n- one\n* two\n• three");
  assert.equal(blocks[0].kind, "p");
  assert.deepEqual((blocks[0] as { lines: unknown[] }).lines[0], [{ t: "b", v: "Plan" }]);
  assert.equal((blocks[0] as { lines: unknown[] }).lines.length, 3);
  assert.equal(blocks[1].kind, "ul");
  assert.equal((blocks[1] as { items: unknown[] }).items.length, 3);
});

test("HTML in a reply stays plain text", () => {
  const blocks = parseChatMarkdown("<img src=x onerror=alert(1)> **ok**");
  assert.deepEqual((blocks[0] as { lines: unknown[][] }).lines[0][0], { t: "text", v: "<img src=x onerror=alert(1)> " });
});
