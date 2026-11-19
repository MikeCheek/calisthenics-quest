// Canned AI answers for demo mode (see flag.ts), so the AI screens can be
// tried and screenshotted without a login or an OpenRouter key. Only ever
// loaded on the development server; each reply says it's a demo.

type Body = Record<string, unknown>;
const json = (data: unknown) => new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
const it = (b: Body) => b.locale === "it";

const CHAT = {
  en: `*(Demo reply — a real coach answer uses your own data.)*

You're closest to a new stage on **back lever** and **L-sit** — both are trending up, so they're the quickest wins.

**This week**
1. **Back lever** – 4 × 8–10s one-leg holds, then 2 slow negatives.
2. **L-sit** – 4 × 10s advanced tuck; stop the set when your knees drop.
3. **Planche** – keep it light: your last Skill Check missed, so 3 × 5s tuck holds with a forward lean.
   - film one set to check your hips stay level

Prove the back lever in a Skill Check before moving on.`,
  it: `*(Risposta demo — una vera risposta del coach usa i tuoi dati.)*

Sei più vicino a un nuovo stadio su **back lever** e **L-sit** — sono entrambi in crescita, quindi sono le vittorie più rapide.

**Questa settimana**
1. **Back lever** – 4 × tenute di 8–10s a una gamba, poi 2 negative lente.
2. **L-sit** – 4 × 10s in tuck avanzato; chiudi la serie quando le ginocchia scendono.
3. **Planche** – leggera: l'ultimo Skill Check non è andato, quindi 3 × tenute di 5s in tuck con inclinazione in avanti.
   - filma una serie per controllare che le anche restino in linea

Dimostra il back lever in uno Skill Check prima di andare avanti.`,
};

export function demoAiResponse(url: string, body: Body): Response {
  if (url.endsWith("/coach-chat")) return json({ configured: true, reply: CHAT[it(body) ? "it" : "en"] });

  if (url.endsWith("/exercise-tip")) {
    return json({
      configured: true,
      tip: "Demo tip: brace your core and squeeze your glutes before each rep, so your body moves as one piece.",
      mistake: "Demo: letting the hips sag or pike as you tire — end the set there.",
    });
  }

  if (url.endsWith("/plan-review")) {
    const exercises = (body.exercises as { key: string; name: string; detail: string; setTitle: string }[]) ?? [];
    const target = exercises.find((e) => !/warm|final|finisher/i.test(e.setTitle)) ?? exercises[0];
    return json({
      configured: true,
      score: 8,
      summary: "Demo review: a well-balanced session for your level — skill work first while you're fresh, then accessory volume.",
      suggestions: target
        ? [{ key: target.key, suggestedName: target.name, suggestedDetail: "3 x 4-6 reps, slow descent", reason: "Demo: slower negatives build the strength this stage needs." }]
        : [],
    });
  }

  if (url.endsWith("/plan-coach")) {
    const days = (body.days as { dateISO: string }[]) ?? [];
    return json({
      configured: true,
      intro: "Demo notes: three skill days with a rest day between the hardest ones.",
      notes: Object.fromEntries(days.map((d, i) => [d.dateISO, i % 2 ? "Demo: keep it crisp — stop sets before form breaks." : "Demo: hardest skill first, while you're fresh."])),
    });
  }

  return new Response(JSON.stringify({ error: "Not available in demo mode." }), { status: 404 });
}
