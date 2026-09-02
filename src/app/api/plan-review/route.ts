import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ReviewExercise {
  key: string;
  setTitle: string;
  name: string;
  detail: string;
}

interface RequestBody {
  focusLabel: string;
  skillsSummary: string;
  equipmentSummary: string;
  exercises: ReviewExercise[];
}

interface Suggestion {
  key: string;
  suggestedName: string;
  suggestedDetail: string;
  reason: string;
}

interface ParsedReview {
  score?: number;
  summary?: string;
  suggestions?: Suggestion[];
}

const LOG_TAG = "[plan-review]";

// Same normalization helpers as plan-coach — providers vary in whether
// content comes back as a plain string or multi-part blocks, and
// reasoning-style free models sometimes inline a <think> block.
function extractContentText(message: unknown): string {
  const content = (message as { content?: unknown } | undefined)?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : (part as { text?: string })?.text ?? ""))
      .join("\n");
  }
  return "";
}

function stripReasoning(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function repairJsonish(text: string): string {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, "$1");
}

function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function tryParse(raw: string): ParsedReview | null {
  const stages = [raw, raw.replace(/```json|```/g, "").trim(), repairJsonish(raw.replace(/```json|```/g, "").trim())];
  for (const candidate of stages) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try next stage
    }
  }
  const extracted = extractJsonObject(repairJsonish(raw));
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch {
      // fall through
    }
  }
  return null;
}

// The model reviews and may SUGGEST exercise substitutions (unlike
// plan-coach, which is explicitly forbidden from touching the prescription
// at all) — but a suggestion is only ever proposed to the athlete for them
// to approve or reject; nothing here writes to their actual session on its
// own. Every suggestion must reference an existing exercise's exact `key`
// from the list provided, so the app can precisely show a before/after
// rather than trying to fuzzy-match a name back to a slot.
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log(`${LOG_TAG} not configured — OPENROUTER_API_KEY missing`);
    return NextResponse.json(
      { configured: false, error: "AI plan review isn't configured on this server." },
      { status: 501 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { focusLabel, skillsSummary, equipmentSummary, exercises } = body;
  if (!focusLabel || !Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json({ error: "No session to review." }, { status: 400 });
  }

  const model = process.env.OPENROUTER_MODEL || "openrouter/free";

  const exerciseLines = exercises
    .map((e) => `- key="${e.key}" | ${e.setTitle} | ${e.name} — ${e.detail}`)
    .join("\n");

  const system = `You are an experienced calisthenics coach reviewing an already-generated training session, not writing one from scratch.
Score the session from 1-10 for how well it fits the athlete described, considering: appropriateness of exercise difficulty for their stated skill level, whether exercises actually train today's focus, sensible variety/balance across the session, and whether anything looks unsafe or redundant.
You may suggest replacing specific exercises if — and only if — a genuinely better fit exists; do not suggest a change just to have something to say. Every suggestion must reference one of the exact "key" values given, and its replacement must still be a real, well-known bodyweight calisthenics exercise appropriate to the athlete's stage and equipment.
Respond with ONLY a single JSON object and nothing else — no markdown fences, no <think> tags, no commentary before or after it. It must match exactly this shape:
{"score": <integer 1-10>, "summary": "<2-3 sentence overall assessment, under 320 chars>", "suggestions": [{"key": "<exact key from the list>", "suggestedName": "<exercise name>", "suggestedDetail": "<sets x reps or time, e.g. '4 x max hold'>", "reason": "<one short sentence, under 140 chars>"}]}
If the session is already well-built and nothing meaningfully improves it, return an empty "suggestions" array — that is a completely valid and expected outcome.`;

  const user = `Today's focus: ${focusLabel}
Athlete's relevant skill level: ${skillsSummary}
Available equipment: ${equipmentSummary}
Session exercises:
${exerciseLines}`;

  const messages = [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];

  async function callOpenRouter(useJsonMode: boolean) {
    return fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://barquests.vercel.app",
        "X-Title": "BarQuests",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 1600,
        ...(useJsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  }

  try {
    let res = await callOpenRouter(true);
    let usedJsonMode = true;
    if (!res.ok && (res.status === 400 || res.status === 422)) {
      console.log(`${LOG_TAG} response_format rejected (status ${res.status}), retrying without it`);
      res = await callOpenRouter(false);
      usedJsonMode = false;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.log(`${LOG_TAG} request failed`, { status: res.status, model, usedJsonMode, body: text.slice(0, 2000) });
      return NextResponse.json(
        { error: `OpenRouter request failed (${res.status}). ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    const rawContent = extractContentText(choice?.message);
    const cleanedContent = stripReasoning(rawContent);

    console.log(`${LOG_TAG} model response`, {
      requestedModel: model,
      actualModel: data?.model,
      usedJsonMode,
      finishReason: choice?.finish_reason,
      rawContent,
      fullResponse: JSON.stringify(data).slice(0, 4000),
    });

    if (choice?.finish_reason === "length") {
      console.log(`${LOG_TAG} response was truncated by max_tokens — likely cause of any parse failure`);
    }

    const parsed = tryParse(cleanedContent);
    if (!parsed) {
      console.log(`${LOG_TAG} failed to parse model output as JSON`, { cleanedContent });
      return NextResponse.json({ error: "The model's response wasn't usable — try again." }, { status: 502 });
    }

    const validKeys = new Set(exercises.map((e) => e.key));
    const score = typeof parsed.score === "number" ? Math.max(1, Math.min(10, Math.round(parsed.score))) : 5;
    const summary = typeof parsed.summary === "string" ? parsed.summary.slice(0, 400) : "";
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter(
            (s): s is Suggestion =>
              !!s &&
              typeof s.key === "string" &&
              validKeys.has(s.key) &&
              typeof s.suggestedName === "string" &&
              typeof s.suggestedDetail === "string"
          )
          .map((s) => ({
            key: s.key,
            suggestedName: s.suggestedName.slice(0, 100),
            suggestedDetail: s.suggestedDetail.slice(0, 60),
            reason: typeof s.reason === "string" ? s.reason.slice(0, 200) : "",
          }))
      : [];

    return NextResponse.json({ configured: true, score, summary, suggestions, model });
  } catch (err) {
    console.log(`${LOG_TAG} unexpected error`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error reaching OpenRouter." },
      { status: 502 }
    );
  }
}
