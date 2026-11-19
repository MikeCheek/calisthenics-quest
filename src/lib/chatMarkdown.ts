// A small Markdown subset for the coach's chat replies, parsed into plain
// data that the chat renders as React elements. Nothing is ever injected as
// HTML, so a reply can't add markup, links or scripts to the page.
//
// Supported: paragraphs (blank line between), line breaks, **bold**,
// __bold__, *italic*, `code`, numbered lists ("1." or "1)"), bullet lists
// ("-", "*", "•"), and one level of indented sub-bullets. Headings ("# …")
// are shown as a bold line. Anything else is shown as typed.

export type Inline = { t: "text" | "b" | "i" | "code"; v: string };
export type Line = Inline[];
export interface ListItem {
  line: Line;
  sub: Line[]; // indented bullets under this item
}
export type Block =
  | { kind: "p"; lines: Line[] }
  | { kind: "ol"; start: number; items: ListItem[] }
  | { kind: "ul"; items: ListItem[] };

const INLINE = /\*\*(.+?)\*\*|__(.+?)__|`([^`]+?)`|\*([^*\s](?:[^*]*?[^*\s])?)\*/g;

export function parseInline(text: string): Line {
  const out: Line = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: "text", v: text.slice(last, i) });
    if (m[1] !== undefined || m[2] !== undefined) out.push({ t: "b", v: m[1] ?? m[2] });
    else if (m[3] !== undefined) out.push({ t: "code", v: m[3] });
    else out.push({ t: "i", v: m[4] });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

const OL = /^(\d{1,3})[.)]\s+(.*)$/;
const UL = /^[-*•]\s+(.*)$/;
const HEADING = /^#{1,6}\s+(.*)$/;

export function parseChatMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  let para: Line[] | null = null;
  let list: Extract<Block, { kind: "ol" | "ul" }> | null = null;

  const closePara = () => {
    if (para?.length) blocks.push({ kind: "p", lines: para });
    para = null;
  };
  const closeList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of src.replace(/\r\n?/g, "\n").split("\n")) {
    const indented = /^\s{2,}\S/.test(raw);
    const line = raw.trim();
    if (!line) {
      closePara();
      closeList();
      continue;
    }
    const ol = line.match(OL);
    const ul = line.match(UL);
    // an indented bullet (or number) under a list item is a sub-item
    if (list && indented && (ol || ul) && list.items.length > 0) {
      list.items[list.items.length - 1].sub.push(parseInline((ol ? ol[2] : ul![1]).trim()));
      continue;
    }
    if (ol || ul) {
      closePara();
      const kind = ol ? "ol" : "ul";
      if (!list || list.kind !== kind) {
        closeList();
        list = kind === "ol" ? { kind: "ol", start: Number(ol![1]), items: [] } : { kind: "ul", items: [] };
      }
      list.items.push({ line: parseInline((ol ? ol[2] : ul![1]).trim()), sub: [] });
      continue;
    }
    // a plain line straight after a list item continues that item
    if (list && indented && list.items.length > 0) {
      list.items[list.items.length - 1].line.push({ t: "text", v: " " }, ...parseInline(line));
      continue;
    }
    closeList();
    const h = line.match(HEADING);
    para = para ?? [];
    para.push(h ? [{ t: "b", v: h[1].replace(/\*\*/g, "") }] : parseInline(line));
  }
  closePara();
  closeList();
  return blocks;
}
