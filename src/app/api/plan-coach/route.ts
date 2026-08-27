import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface DaySkeleton {
  dateISO: string;
  weekday: string;
  isRestDay: boolean;
  focusLabel?: string;
}

interface RequestBody {
  days: DaySkeleton[];
  goals: string[];
  skillsSummary: string;
}

interface ParsedNotes {
  intro?: string;
  notes?: Record<string, string>;
}

const LOG_TAG = "[plan-coach]";

// Some providers return content as a plain string, others as an array of
// { type: "text", text: "..." } parts (newer OpenAI-style multi-part
// content). Normalize to a single string either way.
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

// Reasoning models (e.g. DeepSeek R1-style free variants on OpenRouter)
// sometimes inline a <think>...</think> block ahead of the actual answer.
// Strip it so it doesn't pollute JSON extraction.
function stripReasoning(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// Repairs the handful of JSON mistakes small/free models commonly make:
// smart quotes instead of straight ones, and trailing commas.
function repairJsonish(text: string): string {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, "$1");
}

// Pulls the first balanced-looking {...} block out of a string, for models
// that wrap JSON in prose despite instructions not to.
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function tryParse(raw: string): ParsedNotes | null {
  const stages = [
    raw,
    raw.replace(/```json|```/g, "").trim(),
    repairJsonish(raw.replace(/```json|```/g, "").trim()),
  ];
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

// Coach notes are the ONLY thing the model is allowed to produce — short,
// motivational text. It never invents exercises, sets, reps, or changes
// which days are training/rest days: that stays entirely with the
// deterministic generator in src/lib/planGenerator.ts. This keeps the
// actual training prescription safe and predictable even if the model
// hallucinates or returns something odd.
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log(`${LOG_TAG} not configured — OPENROUTER_API_KEY missing`);
    return NextResponse.json(
      { configured: false, error: "AI coach notes aren't configured on this server." },
      { status: 501 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { days, goals, skillsSummary } = body;
  if (!Array.isArray(days) || days.length === 0) {
    return NextResponse.json({ error: "No plan days provided." }, { status: 400 });
  }

  const model = process.env.OPENROUTER_MODEL || "openrouter/free";

  const planLines = days
    .map((d) =>
      d.isRestDay
        ? `${d.dateISO} (${d.weekday}): rest day`
        : `${d.dateISO} (${d.weekday}): ${d.focusLabel}`
    )
    .join("\n");

  const system = `You are a calisthenics coach writing short, encouraging notes for an already-decided training plan.
You must NOT invent, rename, or suggest any exercise, set, rep count, or equipment — the plan below is fixed and final.
Only write brief motivational/contextual text.
Respond with ONLY a single JSON object and nothing else — no markdown code fences, no <think> tags, no commentary before or after it.
It must match exactly this shape:
{"intro":"<1-2 sentence intro for the whole plan, under 220 chars>","notes":{"<dateISO>":"<one short coaching line, under 110 chars>"}}
Include a "notes" entry for every training day listed (skip rest days). Keep tone warm and concrete, referencing the athlete's stated goals where natural.`;

  const user = `Athlete's current skill levels: ${skillsSummary}
Stated goals: ${goals.length ? goals.join(", ") : "none specified"}
Plan:
${planLines}`;

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
        temperature: 0.6,
        max_tokens: 1600,
        ...(useJsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  }

  try {
    // Prefer strict JSON mode; some free/open-weight models reject the
    // response_format param outright, so fall back to a plain call if so.
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

    // Always logged — this is the point of truth for debugging bad output,
    // rate limits silently swapping the routed model, truncation, etc.
    console.log(`${LOG_TAG} model response`, {
      requestedModel: model,
      actualModel: data?.model,
      usedJsonMode,
      finishReason: choice?.finish_reason,
      hasReasoningField: typeof choice?.message?.reasoning === "string" && choice.message.reasoning.length > 0,
      rawContent,
      fullResponse: JSON.stringify(data).slice(0, 4000),
    });

    if (choice?.finish_reason === "length") {
      console.log(`${LOG_TAG} response was truncated by max_tokens — likely cause of any parse failure`);
    }

    const parsed = tryParse(cleanedContent);

    if (!parsed) {
      console.log(`${LOG_TAG} failed to parse model output as JSON`, { cleanedContent });
      return NextResponse.json(
        { error: "The model's response wasn't usable — showing your plan without notes." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      configured: true,
      intro: typeof parsed.intro === "string" ? parsed.intro.slice(0, 280) : "",
      notes:
        parsed.notes && typeof parsed.notes === "object"
          ? Object.fromEntries(
              Object.entries(parsed.notes)
                .filter(([, v]) => typeof v === "string")
                .map(([k, v]) => [k, (v as string).slice(0, 160)])
            )
          : {},
      model,
    });
  } catch (err) {
    console.log(`${LOG_TAG} unexpected error`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error reaching OpenRouter." },
      { status: 502 }
    );
  }
}
