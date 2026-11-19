"use client";

import { Fragment } from "react";
import { Line, parseChatMarkdown } from "@/lib/chatMarkdown";

function InlineLine({ line }: { line: Line }) {
  return (
    <>
      {line.map((n, i) =>
        n.t === "b" ? (
          <strong key={i} className="font-semibold text-zinc-50">
            {n.v}
          </strong>
        ) : n.t === "i" ? (
          <em key={i}>{n.v}</em>
        ) : n.t === "code" ? (
          <code key={i} className={`stat-mono text-[0.85em] px-1 py-0.5 rounded bg-zinc-950/60 text-orange-300 ${n.v.length <= 24 ? "whitespace-nowrap" : "break-words"}`}>
            {n.v}
          </code>
        ) : (
          <Fragment key={i}>{n.v}</Fragment>
        )
      )}
    </>
  );
}

// Renders a coach reply (see lib/chatMarkdown.ts) as React elements only.
export default function ChatMarkdown({ text }: { text: string }) {
  const blocks = parseChatMarkdown(text);
  return (
    <div className="space-y-2.5 leading-relaxed">
      {blocks.map((b, i) =>
        b.kind === "p" ? (
          <p key={i}>
            {b.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <InlineLine line={l} />
              </Fragment>
            ))}
          </p>
        ) : (
          (() => {
            const ListTag = b.kind === "ol" ? "ol" : "ul";
            return (
              <ListTag
                key={i}
                start={b.kind === "ol" ? b.start : undefined}
                className={`space-y-1.5 pl-5 ${b.kind === "ol" ? "list-decimal marker:text-orange-400 marker:font-semibold" : "list-disc marker:text-orange-400"}`}
              >
                {b.items.map((it, j) => (
                  <li key={j} className="pl-0.5">
                    <InlineLine line={it.line} />
                    {it.sub.length > 0 && (
                      <ul className="list-[circle] pl-4 mt-1 space-y-1 text-zinc-300 marker:text-zinc-400">
                        {it.sub.map((s, k) => (
                          <li key={k}>
                            <InlineLine line={s} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ListTag>
            );
          })()
        )
      )}
    </div>
  );
}
