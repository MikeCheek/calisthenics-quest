"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { buildCoachContext } from "@/lib/coachContext";
import { fetchSessionsBetween } from "@/lib/store";
import { SessionRecord } from "@/lib/types";
import { Send, Loader2, Bot } from "lucide-react";
import { authedFetch } from "@/lib/apiClient";
import ChatMarkdown from "@/components/ChatMarkdown";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const STORE_KEY = "barquests:coachChat";
const SUGGESTIONS = [
  "What should I focus on next?",
  "Why do I keep finding some exercises too hard?",
  "How should I structure my week?",
  "How do I progress to my next front lever stage?",
];

// Ask the AI coach about your own training. The conversation stays in this
// browser tab (session storage), not on a server; the coach sees training
// data only (see lib/coachContext.ts).
export default function CoachChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { userDoc } = useAuth();
  const { tx, locale } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<SessionRecord[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      // no stored conversation
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      // storage unavailable — the chat still works for this view
    }
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // recent sessions give the coach something concrete to talk about
  useEffect(() => {
    if (!open || !userDoc) return;
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 86400000);
    fetchSessionsBetween(userDoc.uid, from.toISOString(), to.toISOString())
      .then(setRecent)
      .catch(() => setRecent([]));
  }, [open, userDoc]);

  // An unanswered question goes back into the input instead of staying in
  // the conversation, so retrying doesn't leave the same question twice.
  const giveBack = (q: string) => {
    setMessages((m) => (m.length && m[m.length - 1].role === "user" && m[m.length - 1].content === q ? m.slice(0, -1) : m));
    setInput(q);
  };

  const ask = async (question: string) => {
    const q = question.trim().slice(0, 600);
    if (!q || busy || !userDoc) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await authedFetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12), context: buildCoachContext(userDoc, recent), locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        giveBack(q);
        setError(data.configured === false ? tx("The AI coach isn't set up on this server yet.") : (data.error ? tx(data.error) : tx("The coach couldn't answer — try again.")));
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      giveBack(q);
      setError(tx("Couldn't reach the coach — check your connection and try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={tx("Ask your coach")}>
      <div className="flex flex-col gap-3 min-h-[50vh]">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400 flex items-start gap-2">
              <Bot size={16} className="text-orange-400 shrink-0 mt-0.5" />
              {tx("Ask anything about your training. The coach sees your skills, what you've proven, what's been hard and your recent sessions — not your name or body stats.")}
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(tx(s))}
                  className="text-left text-sm px-3 py-2 rounded-xl border border-zinc-700 text-zinc-200 hover:border-orange-500"
                >
                  {tx(s)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2.5" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.role === "user"
                    ? "max-w-[85%] bg-orange-500 text-zinc-950 rounded-br-md whitespace-pre-wrap"
                    : "max-w-[92%] bg-zinc-800 text-zinc-100 rounded-bl-md"
                }`}
              >
                {m.role === "assistant" ? <ChatMarkdown text={m.content} /> : m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> {tx("Thinking…")}
              </div>
            </div>
          )}
          {error && <div className="text-sm text-orange-300">{error}</div>}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="mt-auto flex gap-2 sticky bottom-0 bg-zinc-900 pt-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={600}
            placeholder={tx("Ask about your training…")}
            aria-label={tx("Ask about your training…")}
            className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-orange-500 outline-none rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label={tx("Send")}
            className="px-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-xs text-muted hover:text-zinc-300 self-center">
            {tx("Start a new conversation")}
          </button>
        )}
      </div>
    </Modal>
  );
}
