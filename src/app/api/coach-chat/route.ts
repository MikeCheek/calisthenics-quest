import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const LOG_TAG = "[coach-chat]";
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 600;
const MAX_CONTEXT_CHARS = 3000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function extractContentText(message: unknown): string {
  const content = (message as { content?: unknown } | undefined)?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p) => (typeof p === "string" ? p : (p as { text?: string })?.text ?? "")).join("\n");
  }
  return "";
}

// A conversation with the athlete's AI coach, grounded in their own
// training data (built client-side by lib/coachContext.ts: training data
// only — no name, email or body stats). Message contents are not logged.
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ configured: false, error: "The AI coach isn't configured on this server." }, { status: 501 });
  }

  let body: { messages?: ChatMessage[]; context?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  }
  const context = typeof body.context === "string" ? body.context.slice(0, MAX_CONTEXT_CHARS) : "";
  const language = body.locale === "it" ? "Italian" : "English";

  const system = `You are the athlete's calisthenics coach inside the BarQuests app. Answer in ${language}.
Be specific to THIS athlete, using their data below: their skill stages, what they've proven in training, what they struggle with, their equipment and recent sessions. Prefer concrete, actionable advice (progressions, sets/reps, cues, weekly structure) over generic encouragement.
Keep answers short for a phone: usually 2-5 short paragraphs or a brief list, under 160 words unless they ask for detail. No markdown headings.
Stay within training, technique, programming, recovery and motivation. You are not a doctor: for pain, injury or medical questions, say plainly to stop the painful movement and see a qualified professional, and don't diagnose.
If their data doesn't answer something, say so rather than inventing numbers. The app adapts sessions automatically from what they complete, skip or mark too hard; you can suggest using those buttons, the Skill Checks, or the stage-change suggestions.

Athlete data:
${context || "(no data available)"}`;

  const model = process.env.OPENROUTER_MODEL || "openrouter/free";
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://barquests.vercel.app",
        "X-Title": "BarQuests",
      },
      body: JSON.stringify({ model, messages: [{ role: "system", content: system }, ...messages], temperature: 0.5, max_tokens: 700 }),
    });
    if (!res.ok) {
      console.log(`${LOG_TAG} request failed`, { status: res.status, model });
      return NextResponse.json({ error: `The coach couldn't answer right now (${res.status}).` }, { status: 502 });
    }
    const data = await res.json();
    const reply = extractContentText(data?.choices?.[0]?.message)
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim()
      .slice(0, 2500);
    if (!reply) {
      console.log(`${LOG_TAG} empty reply`, { model, finishReason: data?.choices?.[0]?.finish_reason });
      return NextResponse.json({ error: "The coach didn't answer — try again." }, { status: 502 });
    }
    return NextResponse.json({ configured: true, reply });
  } catch (err) {
    console.log(`${LOG_TAG} unexpected error`, err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Couldn't reach the coach — check your connection and try again." }, { status: 502 });
  }
}
