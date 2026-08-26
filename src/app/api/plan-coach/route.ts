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

// Pulls the first balanced-looking {...} block out of a string, for models
// that wrap JSON in prose or code fences despite instructions not to.
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function tryParse(raw: string): ParsedNotes | null {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const extracted = extractJsonObject(cleaned);
    if (!extracted) return null;
    try {
      return JSON.parse(extracted);
    } catch {
      return null;
    }
  }
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
Respond with ONLY a single JSON object and nothing else — no markdown code fences, no commentary before or after it.
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
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://barquest.app",
        "X-Title": "BarQuest",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_tokens: 900,
        ...(useJsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  }

  try {
    // Prefer strict JSON mode; some free/open-weight models reject the
    // response_format param outright, so fall back to a plain call if so.
    let res = await callOpenRouter(true);
    if (!res.ok && (res.status === 400 || res.status === 422)) {
      res = await callOpenRouter(false);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `OpenRouter request failed (${res.status}). ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const parsed = tryParse(raw);

    if (!parsed) {
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error reaching OpenRouter." },
      { status: 502 }
    );
  }
}
