import type { Locale } from "./types";

// ---------------------------------------------------------------------------
// Everything the landing page says, in both languages side by side. The
// page is rendered on the server in the language of its address (/ or /it),
// so search engines read real English and real Italian.
// ---------------------------------------------------------------------------

type Text = { en: string; it: string };
const T = (en: string, it: string): Text => ({ en, it });

export const pick = (locale: Locale, t: Text) => t[locale] ?? t.en;

export const LANDING = {
  nav: { signIn: T("Sign in", "Accedi") },
  hero: {
    eyebrow: T("Free · No ads · English & Italiano", "Gratis · Senza pubblicità · English & Italiano"),
    tagline: T("Your calisthenics journey", "Il tuo percorso calisthenics"),
    lead: T(
      "Personalised sessions for the outdoor bars that place you per skill, adapt to every set and prove your level — from your first pull-up to the front lever.",
      "Allenamenti su misura per il parco: ti valutano skill per skill, si adattano a ogni serie e dimostrano il tuo livello — dalla prima trazione al front lever."
    ),
    start: T("Start free — no account needed", "Inizia gratis — senza account"),
    starting: T("Starting…", "Avvio…"),
    google: T("Sign in with Google", "Accedi con Google"),
    note: T(
      "About 2 minutes: a quick skill check, then your first session. Save with Google whenever you like.",
      "Circa 2 minuti: una breve valutazione, poi la prima sessione. Salva con Google quando vuoi."
    ),
    shotAlt: T(
      "Today screen: today's front lever session, about 30 minutes, with the week's progress",
      "Schermata Oggi: la sessione di front lever di oggi, circa 30 minuti, con i progressi della settimana"
    ),
  },
  stats: [
    { value: "50", label: T("skills to unlock", "skill da sbloccare") },
    { value: "129", label: T("exercises", "esercizi") },
    { value: "124", label: T("animated demos", "dimostrazioni animate") },
    { value: "15–90", label: T("minute sessions", "minuti a sessione") },
  ],
  why: {
    title: T("Why it's different", "Cosa lo rende diverso"),
    intro: T(
      "Most training apps give everyone the same program, take your word for your level and forget how your last session went. BarQuests doesn't.",
      "La maggior parte delle app dà a tutti lo stesso programma, si fida del livello che dichiari e dimentica com'è andata l'ultima sessione. BarQuests no."
    ),
    items: [
      {
        icon: "target",
        title: T("Placed per area, not one number", "Valutato per area, non con un solo numero"),
        body: T(
          "Pulling, pushing, balance, core, legs and levers are rated separately — strong pullers who are new to pushing get the right work in both.",
          "Tirata, spinta, equilibrio, core, gambe e leve sono valutati separatamente: chi è forte nelle trazioni ma nuovo alle spinte riceve il lavoro giusto per entrambe."
        ),
      },
      {
        icon: "adapt",
        title: T("Adapts to every set", "Si adatta a ogni serie"),
        body: T(
          "Mark each exercise done, skipped or too hard. The next session eases off, adds volume or steps up — exercise by exercise — and learns how long you really rest.",
          "Segna ogni esercizio come fatto, saltato o troppo difficile. La sessione dopo alleggerisce, aggiunge volume o sale di livello — esercizio per esercizio — e impara quanto recuperi davvero."
        ),
      },
      {
        icon: "verified",
        title: T("Proves your level", "Dimostra il tuo livello"),
        body: T(
          "Every skill you claim gets a Skill Check inside a normal session. Your profile shows what's verified, not just what you said.",
          "Ogni skill che dichiari viene messa alla prova con uno Skill Check dentro una normale sessione. Il profilo mostra ciò che hai dimostrato, non solo ciò che hai detto."
        ),
      },
      {
        icon: "park",
        title: T("Made for the bar park", "Pensato per il parco"),
        body: T(
          "Sessions use only the equipment you have, and two friends can train side by side on one bar, each at their own level.",
          "Le sessioni usano solo l'attrezzatura che hai, e due amici possono allenarsi insieme su una sola sbarra, ognuno al proprio livello."
        ),
      },
    ],
  },
  showcase: [
    {
      id: "session",
      eyebrow: T("Today", "Oggi"),
      title: T("Your session, ready in one tap", "La tua sessione, pronta con un tocco"),
      body: T(
        "Warm-up, skill work, accessories and a finisher, sized to the time you have and the gear around you. Been running out of energy lately? It's lighter, and it tells you why.",
        "Riscaldamento, lavoro sulle skill, complementari e chiusura, calibrati sul tempo che hai e sull'attrezzatura intorno a te. Ultimamente arrivi stanco? La sessione è più leggera, e ti dice perché."
      ),
      points: [
        T("15 to 90 minutes, your choice", "Da 15 a 90 minuti, scegli tu"),
        T("Pull-up bar, parallel bars, rings, bands — or just the floor", "Sbarra, parallele, anelli, elastici — o solo il pavimento"),
        T("A week plan around your rest days", "Un piano settimanale intorno ai tuoi giorni di riposo"),
      ],
      alt: T("Today's session in detail: warm-up, Skill Check, XP reward and time", "La sessione di oggi nel dettaglio: riscaldamento, Skill Check, XP e durata"),
    },
    {
      id: "guided",
      eyebrow: T("Guided mode", "Modalità guidata"),
      title: T("A coach in your pocket while you train", "Un coach in tasca mentre ti alleni"),
      body: T(
        "Full screen and hands-free: a timer for every set, rest that matches your real pace, and voice cues so you can keep your eyes on the bar.",
        "A schermo intero e senza mani: un timer per ogni serie, recuperi sul tuo ritmo reale e indicazioni vocali per tenere gli occhi sulla sbarra."
      ),
      points: [
        T("Animated demonstrations and common mistakes", "Dimostrazioni animate ed errori comuni"),
        T("Voice coaching in English or Italian", "Coaching vocale in italiano o inglese"),
        T("Survives reloads; timers keep time with the screen locked", "Sopravvive ai ricaricamenti; i timer continuano a schermo bloccato"),
      ],
      alt: T("Guided mode with an animated exercise demonstration and set timer", "Modalità guidata con dimostrazione animata dell'esercizio e timer della serie"),
    },
    {
      id: "skills",
      eyebrow: T("Skills", "Skill"),
      title: T("50 skills, every stage mapped", "50 skill, ogni livello tracciato"),
      body: T(
        "Front lever, planche, muscle-up, handstand and 46 more, each with its chain of progressions. “Up next” shows the stages you're closest to.",
        "Front lever, planche, muscle-up, handstand e altre 46, ognuna con la sua catena di progressioni. “Prossimi traguardi” mostra i livelli più vicini."
      ),
      points: [
        T("Level from experience only — earned, not declared", "Livello solo dall'esperienza — guadagnato, non dichiarato"),
        T("Bonus XP for proving a skill and new records", "XP bonus per le skill dimostrate e i nuovi record"),
        T("A trophy road of milestones to climb", "Un percorso di traguardi da scalare"),
      ],
      alt: T("Skills screen with level, verified skills and the stages up next", "Schermata Skill con livello, skill verificate e i prossimi traguardi"),
    },
    {
      id: "coach",
      eyebrow: T("Coach", "Coach"),
      title: T("A coach that knows your training", "Un coach che conosce il tuo allenamento"),
      body: T(
        "Ask anything — the AI coach sees your skills, what you've proven and how your recent sessions went. Insights show what's going well and what's being eased off.",
        "Chiedi qualsiasi cosa: il coach AI vede le tue skill, cosa hai dimostrato e com'è andata l'ultima settimana. Gli approfondimenti mostrano cosa va bene e cosa viene alleggerito."
      ),
      points: [
        T("Answers about your own data", "Risposte sui tuoi dati"),
        T("Plan the week or review today's session", "Pianifica la settimana o rivedi la sessione di oggi"),
        T("Your real rest and hold times", "I tuoi veri tempi di recupero e di tenuta"),
      ],
      alt: T("Coach screen with suggested questions and insights", "Schermata Coach con domande suggerite e approfondimenti"),
    },
    {
      id: "crew",
      eyebrow: T("Crew", "Squadra"),
      title: T("Better with friends", "Meglio con gli amici"),
      body: T(
        "A weekly challenge and leaderboard with your friends — or everyone. Send a cheeky nudge when they skip, or train together on one bar.",
        "Una sfida settimanale e una classifica con i tuoi amici — o con tutti. Manda una spronata sfacciata a chi salta l'allenamento, o allenatevi insieme su una sbarra."
      ),
      points: [
        T("Rotating weekly challenge: sessions, minutes, skills, XP", "Sfida settimanale a rotazione: sessioni, minuti, skill, XP"),
        T("Funny, personalised nudges", "Spronate divertenti e personalizzate"),
        T("Train together, each at your own level", "Allenatevi insieme, ognuno al proprio livello"),
      ],
      alt: T("Crew screen with the weekly challenge and friends leaderboard", "Schermata Squadra con la sfida settimanale e la classifica degli amici"),
    },
    {
      id: "me",
      eyebrow: T("Me", "Profilo"),
      title: T("Watch it add up", "Guarda i numeri crescere"),
      body: T(
        "Every rep and second you log adds up: totals per exercise this month, this year or all time, a calendar of sessions and your personal bests.",
        "Ogni ripetizione e ogni secondo si sommano: totali per esercizio del mese, dell'anno o di sempre, un calendario delle sessioni e i tuoi record."
      ),
      points: [
        T("“224 toes-to-bar in November”", "“224 toes-to-bar a novembre”"),
        T("Share cards for sessions, skills and records", "Card da condividere per sessioni, skill e record"),
        T("Export everything — JSON or .tcx for Strava", "Esporta tutto — JSON o .tcx per Strava"),
      ],
      alt: T("Profile with streak, sessions, XP and exercise totals", "Profilo con streak, sessioni, XP e totali per esercizio"),
    },
  ],
  more: {
    title: T("And everything around it", "E tutto il resto"),
    items: [
      { icon: "install", title: T("Installs like an app", "Si installa come un'app"), body: T("Add it to your home screen on Android or iPhone.", "Aggiungila alla schermata Home su Android o iPhone.") },
      { icon: "bell", title: T("Reminders and nudges", "Promemoria e spronate"), body: T("Daily reminders, plus your friends' nudges as notifications.", "Promemoria giornalieri e le spronate degli amici come notifiche.") },
      { icon: "flame", title: T("Weekly streaks", "Streak settimanali"), body: T("One session a week keeps your streak alive — rest days never break it.", "Una sessione a settimana tiene viva la streak: i giorni di riposo non la interrompono mai.") },
      { icon: "lock", title: T("Lock-screen controls", "Controlli dalla schermata di blocco"), body: T("Current exercise, rest and next, without unlocking.", "Esercizio, recupero e successivo, senza sbloccare.") },
      { icon: "undo", title: T("Take back a mistake", "Correggi un errore"), body: T("Undo a “too hard”, or mark something done afterwards.", "Annulla un “troppo difficile”, o segnalo come fatto dopo.") },
      { icon: "shield", title: T("Your data, your call", "I tuoi dati, decidi tu"), body: T("Export it all, or reset step by step up to deleting the account.", "Esporta tutto, o azzera per gradi fino a eliminare l'account.") },
    ],
  },
  honest: {
    title: T("Honest about what it is", "Onesto su ciò che è"),
    body: T(
      "BarQuests is for people who train outdoors and want challenges. It isn't a certified course, and nobody watches your form the way a coach at the gym would. New to training or coming back from an injury? Learn the basics with a qualified coach first.",
      "BarQuests è per chi si allena all'aperto e cerca sfide. Non è un corso certificato, e nessuno controlla la tua tecnica come farebbe un istruttore in palestra. Sei agli inizi o torni da un infortunio? Impara le basi con un istruttore qualificato."
    ),
    link: T("More about BarQuests", "Di più su BarQuests"),
  },
  faq: {
    title: T("Questions", "Domande"),
    items: [
      {
        q: T("Is it free?", "È gratis?"),
        a: T(
          "Yes — no ads and no subscription. Try it as a guest, and sign in with Google when you want to keep your progress.",
          "Sì — niente pubblicità né abbonamenti. Provala come ospite e accedi con Google quando vuoi salvare i progressi."
        ),
      },
      {
        q: T("What equipment do I need?", "Che attrezzatura serve?"),
        a: T(
          "A pull-up bar helps most, but sessions are built from what you have: bar, parallel bars, rings, bands, a wall, weights — or nothing but the floor.",
          "Una sbarra aiuta di più, ma le sessioni si costruiscono con ciò che hai: sbarra, parallele, anelli, elastici, un muro, pesi — o solo il pavimento."
        ),
      },
      {
        q: T("I'm a beginner. Is it for me?", "Sono alle prime armi. Fa per me?"),
        a: T(
          "Yes: the skill check places you per area, starting from your first push-up. If you're completely new or recovering from an injury, a qualified coach is the safer start.",
          "Sì: la valutazione ti colloca area per area, partendo dal primo piegamento. Se sei del tutto nuovo o stai recuperando da un infortunio, un istruttore qualificato è l'inizio più sicuro."
        ),
      },
      {
        q: T("Is there an app to download?", "C'è un'app da scaricare?"),
        a: T(
          "It's a web app: open it in your browser and add it to your home screen. It then opens full screen like any other app.",
          "È una web app: aprila nel browser e aggiungila alla schermata Home. Da lì si apre a schermo intero come qualsiasi altra app."
        ),
      },
      {
        q: T("Which languages?", "In quali lingue?"),
        a: T(
          "English and Italian — including the voice coaching. Exercise and skill names stay in English, as they're used at the bar park.",
          "Italiano e inglese — anche il coaching vocale. I nomi di esercizi e skill restano in inglese, come si usano al parco."
        ),
      },
      {
        q: T("What happens to my data?", "Che fine fanno i miei dati?"),
        a: T(
          "It's stored in your account and used only to build your sessions. You can export it or delete it any time from Me → Account.",
          "Sono salvati nel tuo account e usati solo per costruire le sessioni. Puoi esportarli o cancellarli quando vuoi da Profilo → Account."
        ),
      },
    ],
  },
  final: {
    title: T("Your first session is two minutes away", "La tua prima sessione è a due minuti da qui"),
    body: T("No account needed to start.", "Non serve un account per iniziare."),
  },
  footer: {
    about: T("About & privacy", "Info e privacy"),
    language: T("Language", "Lingua"),
  },
} as const;
