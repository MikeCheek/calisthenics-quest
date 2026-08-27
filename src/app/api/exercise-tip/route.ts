import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface RequestBody {
  exerciseName: string;
  exerciseDetail: string;
  trackLabel?: string;
  skillStage?: string;
}

const LOG_TAG = "[exercise-tip]";

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

// A short, specific technique tip + a common mistake to avoid for ONE
// exercise. This never touches sets/reps/prescription — that stays fixed,
// exactly as generated. It's purely coaching cues, on demand, cached
// client-side per exercise so repeat views don't re-fetch.
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { configured: false, error: "AI tips aren't configured on this server." },
      { status: 501 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { exerciseName, exerciseDetail, trackLabel, skillStage } = body;
  if (!exerciseName) {
    return NextResponse.json({ error: "Missing exercise name." }, { status: 400 });
  }

  const model = process.env.OPENROUTER_MODEL || "openrouter/free";

  const system = `You are an experienced calisthenics coach giving a quick technique tip for ONE specific exercise.
You are NOT prescribing or changing sets, reps, or duration — that is fixed and given to you only for context, never repeat it back.
Respond with ONLY a single JSON object, no markdown fences, no <think> tags, no commentary. Exact shape:
{"tip":"<one specific, actionable technique cue for this exact exercise, under 160 chars>","mistake":"<the single most common mistake people make on this exercise and how to avoid it, under 160 chars>"}
Be concrete and specific to this exact exercise and skill level — not generic advice that could apply to any exercise. Reference real form cues (body position, breathing, tempo, where to focus tension) where relevant.`;

  const user = `Exercise: ${exerciseName}
Prescription (context only, do not repeat): ${exerciseDetail}
${trackLabel ? `Skill track: ${trackLabel}` : ""}
${skillStage ? `Athlete's current stage in this skill: ${skillStage}` : ""}`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://barquests.vercel.app",
        "X-Title": "BarQuests",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.6,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.log(`${LOG_TAG} request failed`, { status: res.status, model, body: text.slice(0, 1000) });
      return NextResponse.json(
        { error: `OpenRouter request failed (${res.status}).` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    const rawContent = extractContentText(choice?.message);
    const cleaned = stripReasoning(rawContent).replace(/```json|```/g, "").trim();

    console.log(`${LOG_TAG} model response`, {
      exerciseName,
      requestedModel: model,
      actualModel: data?.model,
      finishReason: choice?.finish_reason,
      rawContent,
    });

    let parsed: { tip?: string; mistake?: string } | null = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end > start) {
        try {
          parsed = JSON.parse(cleaned.slice(start, end + 1));
        } catch {
          parsed = null;
        }
      }
    }

    if (!parsed || (!parsed.tip && !parsed.mistake)) {
      console.log(`${LOG_TAG} failed to parse model output`, { cleaned });
      return NextResponse.json({ error: "Couldn't get a usable tip right now." }, { status: 502 });
    }

    return NextResponse.json({
      configured: true,
      tip: (parsed.tip ?? "").slice(0, 220),
      mistake: (parsed.mistake ?? "").slice(0, 220),
    });
  } catch (err) {
    console.log(`${LOG_TAG} unexpected error`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error reaching OpenRouter." },
      { status: 502 }
    );
  }
}
