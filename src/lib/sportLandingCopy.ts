import type { ExtraSport } from "./sports/types";

// ---------------------------------------------------------------------------
// What the landing pages say about the sports beyond calisthenics: a short
// section on the main page, and a small page for each (/yoga, /pilates and
// their Italian versions). Skill and pose names stay English, as in the app.
// ---------------------------------------------------------------------------

type Text = { en: string; it: string };
const T = (en: string, it: string): Text => ({ en, it });

export const SPORTS_SECTION = {
  eyebrow: T("Not only calisthenics", "Non solo calisthenics"),
  title: T(
    "Rainy day? Train yoga or Pilates",
    "Giornata di pioggia? Allenati con yoga o Pilates",
  ),
  body: T(
    "Calisthenics is the heart of BarQuests. For the days indoors there are two more tracks, yoga and Pilates: each with its own skills and level, and the same streak. Switch whenever you like — nothing is lost.",
    "Il calisthenics è il cuore di BarQuests. Per i giorni al chiuso ci sono altri due percorsi, yoga e Pilates: ognuno con le sue skill e il suo livello, e la stessa streak. Cambi quando vuoi, senza perdere nulla.",
  ),
  more: T("Discover {sport}", "Scopri {sport}"),
};

export interface SportCopy {
  name: string;
  path: string; // English page; Italian is /it + path
  demo: string; // the exercise animated on the cards and the hero
  card: Text; // one line for the main landing page
  title: Text; // <title>
  description: Text; // meta description
  tagline: Text;
  lead: Text;
  points: Text[]; // how it works
  skills: Record<string, Text>; // one line per skill, by key
  showcase: string[]; // exercises shown as animations
  faq: { q: Text; a: Text }[];
}

const SHARED_POINTS: Text[] = [
  T(
    "Three quick questions — how much you've done, what you want most, how long you have — and every skill starts at the right stage.",
    "Tre domande veloci — quanto l'hai praticato, cosa vuoi di più, quanto tempo hai — e ogni skill parte dal livello giusto.",
  ),
  T(
    "Each session has a warm-up, a focus that rotates and leans on your goals, supporting work and a cool-down, fitted to your time.",
    "Ogni sessione ha riscaldamento, un focus che ruota e insiste sui tuoi obiettivi, lavoro di supporto e defaticamento, adattati al tuo tempo.",
  ),
  T(
    "Tell it what was easy or too hard: the next session adapts, and when a stage is mastered the next one unlocks.",
    "Dici cosa è stato facile o troppo duro: la sessione dopo si adatta, e quando un livello è padroneggiato si sblocca il successivo.",
  ),
  T(
    "Its own skills, level and records — and the same weekly streak and XP as calisthenics. Switch back anytime.",
    "Skill, livello e record suoi — e la stessa streak settimanale e gli stessi XP del calisthenics. Torni indietro quando vuoi.",
  ),
];

const SHARED_FAQ = [
  {
    q: T("Do I need to do calisthenics too?", "Devo fare anche calisthenics?"),
    a: T(
      "No. When you start, you pick the sport you want — this one, if you like. Calisthenics is the main track and is there whenever you want to add it, from the sport button at the top.",
      "No. Quando inizi scegli lo sport che vuoi — anche solo questo. Il calisthenics è il percorso principale ed è lì quando vuoi aggiungerlo, dal pulsante dello sport in alto."
    ),
  },
  {
    q: T("What do I need?", "Cosa mi serve?"),
    a: T(
      "A mat and a little floor space. Every exercise has an animated demo, a how-to and the common mistakes.",
      "Un tappetino e un po' di spazio. Ogni esercizio ha una demo animata, la spiegazione e gli errori più comuni.",
    ),
  },
  {
    q: T("Is it free?", "È gratis?"),
    a: T(
      "Yes, like the rest of BarQuests: no ads, no subscription.",
      "Sì, come tutto BarQuests: niente pubblicità, niente abbonamento.",
    ),
  },
];

export const SPORT_COPY: Record<ExtraSport, SportCopy> = {
  yoga: {
    name: "Yoga",
    path: "/yoga",
    demo: "Crow pose",
    card: T(
      "From sun salutations and tree pose to crow, headstand, wheel and the splits.",
      "Dai saluti al sole e dall'albero fino a crow, headstand, wheel e spaccate.",
    ),
    title: T(
      "Yoga on BarQuests — skills, stage by stage",
      "Yoga su BarQuests — skill, livello dopo livello",
    ),
    description: T(
      "Free yoga sessions that adapt to you: balances, arm balances, inversions, backbends and flexibility, each a ladder of stages from the basics to crow, headstand and the splits.",
      "Sessioni di yoga gratuite che si adattano a te: equilibri, arm balance, inversioni, backbend e flessibilità, ognuno una scala di livelli dalle basi a crow, headstand e spaccate.",
    ),
    tagline: T(
      "Yoga, learned like a skill",
      "Lo yoga, imparato come una skill",
    ),
    lead: T(
      "Eight skills, each a ladder of stages — from your first sun salutation to crow, headstand and the full splits. Sessions adapt to what you find easy or hard, and every pose is animated so you know what it looks like.",
      "Otto skill, ognuna una scala di livelli — dal primo saluto al sole a crow, headstand e spaccata completa. Le sessioni si adattano a ciò che trovi facile o difficile, e ogni posizione è animata, così sai com'è fatta.",
    ),
    points: SHARED_POINTS,
    skills: {
      sunSalutation: T(
        "From the half salutation to a full vinyasa flow.",
        "Dal mezzo saluto a un vinyasa flow completo.",
      ),
      standingBalance: T(
        "Tree, warrior III, half moon, standing split.",
        "Albero, warrior III, half moon, standing split.",
      ),
      crow: T(
        "Crow, then side crow and firefly.",
        "Crow, poi side crow e firefly.",
      ),
      headstand: T(
        "From dolphin to the wall, then free-standing.",
        "Dal delfino al muro, poi senza appoggio.",
      ),
      wheel: T(
        "Bridge, camel, then the full wheel.",
        "Ponte, cammello, poi la wheel completa.",
      ),
      splits: T(
        "Lunges and half splits to the front split.",
        "Affondi e mezze spaccate fino alla spaccata frontale.",
      ),
      forwardFold: T(
        "Bent knees, straight legs, then full compression.",
        "Ginocchia piegate, gambe tese, poi compressione completa.",
      ),
      hips: T(
        "Figure four, pigeon, then lotus.",
        "Figura quattro, piccione, poi loto.",
      ),
    },
    showcase: [
      "Sun salutation A",
      "Tree pose",
      "Warrior II",
      "Supported headstand at the wall",
      "Camel pose",
      "Pigeon pose",
    ],
    faq: [
      {
        q: T(
          "I've never done yoga. Is it for me?",
          "Non ho mai fatto yoga. Fa per me?",
        ),
        a: T(
          "Yes: say you're new and every skill starts from its first stage, with step-back versions whenever a pose is too much.",
          "Sì: dici che sei agli inizi e ogni skill parte dal primo livello, con versioni più facili quando una posizione è troppo.",
        ),
      },
      ...SHARED_FAQ,
    ],
  },
  pilates: {
    name: "Pilates",
    path: "/pilates",
    demo: "Teaser",
    card: T(
      "Mat Pilates for a strong core and spine: the hundred, roll-up, teaser, swan and more.",
      "Pilates a corpo libero per core e colonna forti: hundred, roll-up, teaser, swan e altro.",
    ),
    title: T(
      "Pilates on BarQuests — mat work, stage by stage",
      "Pilates su BarQuests — a corpo libero, livello per livello",
    ),
    description: T(
      "Free mat Pilates sessions that adapt to you: core control, spine mobility, hips and full-body work, from the hundred and the roll-up to the teaser.",
      "Sessioni gratuite di Pilates a corpo libero che si adattano a te: controllo del core, mobilità della colonna, anche e lavoro total body, dall'hundred e dal roll-up fino al teaser.",
    ),
    tagline: T(
      "Core control, one stage at a time",
      "Controllo del core, un livello alla volta",
    ),
    lead: T(
      "The classic mat repertoire as eight skills with clear stages — the hundred, roll-up, teaser, swan, side kicks, shoulder bridge, plank series and rolling. Sessions adapt to you, and every exercise is animated.",
      "Il repertorio classico a corpo libero in otto skill con livelli chiari — hundred, roll-up, teaser, swan, side kick, shoulder bridge, serie di plank e rolling. Le sessioni si adattano a te, e ogni esercizio è animato.",
    ),
    points: SHARED_POINTS,
    skills: {
      hundred: T(
        "From chest lifts to the hundred with low legs.",
        "Dal chest lift all'hundred a gambe basse.",
      ),
      rollUp: T(
        "Half roll-back, roll-up, then roll-over and jackknife.",
        "Half roll-back, roll-up, poi roll-over e jackknife.",
      ),
      teaser: T(
        "Single-leg teaser to the full teaser hold.",
        "Dal teaser a una gamba al teaser completo.",
      ),
      swan: T(
        "Swan prep and swimming to the swan dive.",
        "Swan prep e swimming fino allo swan dive.",
      ),
      sideKick: T(
        "Side-lying lifts, clamshells, kneeling side kicks.",
        "Sollevamenti sul fianco, clamshell, side kick in ginocchio.",
      ),
      shoulderBridge: T(
        "Pelvic curls to single-leg bridges with kicks.",
        "Dal pelvic curl al ponte a una gamba con calci.",
      ),
      plankSeries: T(
        "Planks, side planks and the leg pulls.",
        "Plank, plank laterali e leg pull.",
      ),
      rolling: T(
        "Rolling like a ball, open-leg rocker, boomerang.",
        "Rolling like a ball, open-leg rocker, boomerang.",
      ),
    },
    showcase: [
      "Hundred",
      "Roll-up",
      "Single-leg stretch",
      "Swan",
      "Side-lying leg lifts",
      "Leg pull front",
    ],
    faq: [
      {
        q: T("Mat or reformer?", "Tappetino o reformer?"),
        a: T(
          "Mat only — everything works at home with no machines.",
          "Solo tappetino: tutto si fa a casa, senza macchinari.",
        ),
      },
      ...SHARED_FAQ,
    ],
  },
};

export const SPORT_PAGE = {
  back: T(
    "Calisthenics, the main track",
    "Calisthenics, il percorso principale",
  ),
  how: T("How it works", "Come funziona"),
  skills: T("What you'll learn", "Cosa imparerai"),
  moves: T("Every move, animated", "Ogni movimento, animato"),
  faq: T("Questions", "Domande"),
  start: T("Start {sport} free", "Inizia {sport} gratis"),
  stages: T("{n} stages", "{n} livelli"),
  also: T("Also on BarQuests", "Anche su BarQuests"),
};
