import type { SportDef, SportExercise } from "./types";

// ---------------------------------------------------------------------------
// Pilates (mat): the classical repertoire as ladders, from the foundations
// to the advanced versions. Same prescription words as everywhere else.
// ---------------------------------------------------------------------------

const ex = (
  name: string,
  detail: string,
  restSeconds: number,
  description: string,
  it: string,
  cue?: string,
  cueIt?: string,
): SportExercise => ({
  name,
  detail,
  restSeconds,
  description,
  ...(cue ? { cue } : {}),
  it: { description: it, ...(cueIt ? { cue: cueIt } : {}) },
});

export const PILATES: SportDef = {
  id: "pilates",
  name: "Pilates",
  emoji: "🌀",
  tagline: "Core control, posture and precise movement",
  indoor: true,
  groups: [
    { key: "core", label: "Core" },
    { key: "spine", label: "Spine" },
    { key: "legs", label: "Legs & hips" },
    { key: "fullBody", label: "Full body" },
  ],
  skills: [
    {
      key: "hundred",
      name: "The Hundred",
      group: "core",
      stages: [
        {
          id: "tabletop",
          label: "Tabletop",
          exercises: [
            ex(
              "Chest lift",
              "3 x 10 reps",
              20,
              "On the back, knees bent, curl the head and shoulders up with the abs and lower slowly.",
              "Sulla schiena, ginocchia piegate, arrotola testa e spalle con gli addominali e scendi lentamente.",
              "Ribs toward the hips",
              "Costole verso il bacino",
            ),
            ex(
              "Hundred (tabletop legs)",
              "2 x 50 reps",
              30,
              "Head and shoulders curled up, legs in tabletop, pump the straight arms by the hips, breathing in for 5 and out for 5.",
              "Testa e spalle sollevate, gambe a tavolino, muovi le braccia tese accanto ai fianchi, inspira per 5 ed espira per 5.",
            ),
          ],
        },
        {
          id: "legs45",
          label: "Legs at 45°",
          exercises: [
            ex(
              "Hundred",
              "2 x 100 reps",
              40,
              "The classic: curl up, legs straight at about 45°, pump the arms for 100 counts with the breath.",
              "Il classico: sollevati, gambe tese a circa 45°, muovi le braccia per 100 tempi con il respiro.",
              "Keep the lower back down",
              "Tieni la zona lombare a terra",
            ),
            ex(
              "Single-leg stretch",
              "3 x 10 reps per side",
              30,
              "Curled up, pull one knee in while the other leg extends, switching with control.",
              "Sollevato, porta un ginocchio al petto mentre l'altra gamba si distende, alternando con controllo.",
            ),
          ],
        },
        {
          id: "low",
          label: "Low legs",
          exercises: [
            ex(
              "Hundred (low legs)",
              "2 x 100 reps",
              45,
              "The Hundred with the legs just above the floor, the back still pressed down.",
              "Il Cento con le gambe appena sopra il pavimento, la schiena sempre a terra.",
            ),
            ex(
              "Double-leg stretch",
              "3 x 10 reps",
              40,
              "Curled up, reach the arms and legs long away from each other, then circle back into a tuck.",
              "Sollevato, allunga braccia e gambe lontane tra loro, poi richiudi in raccolta con un cerchio delle braccia.",
            ),
          ],
        },
      ],
    },
    {
      key: "rollUp",
      name: "Roll-Up",
      group: "spine",
      stages: [
        {
          id: "rollBack",
          label: "Half roll-back",
          exercises: [
            ex(
              "Half roll-back",
              "3 x 8 reps",
              20,
              "Seated with knees bent, round back halfway, hold, and roll up again bone by bone.",
              "Seduto con le ginocchia piegate, arrotonda all'indietro a metà, tieni e risali vertebra per vertebra.",
            ),
            ex(
              "Pelvic curl",
              "3 x 10 reps",
              20,
              "On the back, peel the spine off the floor from the tailbone into a bridge and roll back down.",
              "Sulla schiena, stacca la colonna dal pavimento partendo dal coccige fino al ponte e srotola giù.",
            ),
          ],
        },
        {
          id: "rollUp",
          label: "Roll-up",
          exercises: [
            ex(
              "Roll-up",
              "3 x 8 reps",
              30,
              "Lying long, arms overhead, roll up one vertebra at a time to a forward stretch, and roll back down.",
              "Disteso, braccia sopra la testa, arrotolati una vertebra alla volta fino all'allungamento in avanti e srotola giù.",
              "No jerking: slow and even",
              "Niente strappi: lento e regolare",
            ),
            ex(
              "Spine stretch forward",
              "3 x 8 reps",
              20,
              "Sitting tall, legs wide, round forward from the head down and restack.",
              "Seduto alto, gambe larghe, arrotonda in avanti partendo dalla testa e risali.",
            ),
          ],
        },
        {
          id: "rollOver",
          label: "Roll-over",
          exercises: [
            ex(
              "Roll-over",
              "3 x 6 reps",
              45,
              "From the back, lift the legs over the head until the toes touch behind, then roll down with control.",
              "Dalla schiena, porta le gambe oltre la testa finché le punte toccano dietro, poi srotola con controllo.",
            ),
            ex(
              "Jackknife",
              "3 x 5 reps",
              45,
              "From the roll-over, shoot the legs up to the ceiling, then roll down slowly.",
              "Dal roll-over, spingi le gambe verso il soffitto, poi srotola lentamente.",
            ),
          ],
        },
      ],
    },
    {
      key: "teaser",
      name: "Teaser",
      group: "core",
      stages: [
        {
          id: "oneLeg",
          label: "Single-leg teaser",
          exercises: [
            ex(
              "Single-leg teaser",
              "3 x 6 reps per side",
              30,
              "One knee bent with the foot down, the other leg long and lifted, roll up to reach the toes.",
              "Un ginocchio piegato con il piede a terra, l'altra gamba lunga e sollevata, arrotolati fino a raggiungere le punte.",
            ),
            ex(
              "Boat hold",
              "3 x 20s hold",
              30,
              "Balance on the sit bones, legs lifted, arms long, spine tall.",
              "In equilibrio sugli ischi, gambe sollevate, braccia lunghe, colonna alta.",
            ),
          ],
        },
        {
          id: "prep",
          label: "Teaser prep",
          exercises: [
            ex(
              "Teaser prep",
              "3 x 6 reps",
              40,
              "Legs held in a V, roll the upper body down and up again.",
              "Gambe tenute a V, srotola la parte alta del corpo e risali.",
            ),
            ex(
              "Criss-cross",
              "3 x 10 reps per side",
              30,
              "Curled up, twist one shoulder toward the opposite knee as the other leg extends.",
              "Sollevato, ruota una spalla verso il ginocchio opposto mentre l'altra gamba si distende.",
            ),
          ],
        },
        {
          id: "full",
          label: "Full teaser",
          exercises: [
            ex(
              "Teaser",
              "3 x 5 reps",
              45,
              "From lying long, roll up and lift the legs together into a V, hold, and roll down as one.",
              "Da disteso, arrotolati e solleva le gambe insieme a V, tieni e srotola tutto insieme.",
              "Lift from the core, not momentum",
              "Sali con il core, non con lo slancio",
            ),
            ex(
              "Teaser hold",
              "3 x 15s hold",
              40,
              "Hold the top of the Teaser, arms reaching to the toes.",
              "Tieni la posizione alta del Teaser, braccia verso le punte.",
            ),
          ],
        },
      ],
    },
    {
      key: "swan",
      name: "Swan",
      group: "spine",
      stages: [
        {
          id: "prep",
          label: "Swan prep",
          exercises: [
            ex(
              "Swan prep",
              "3 x 8 reps",
              20,
              "Face down, hands by the shoulders, lift the head and chest a little with the back, hips down.",
              "A pancia in giù, mani accanto alle spalle, solleva un po' testa e petto con la schiena, bacino a terra.",
            ),
            ex(
              "Swimming",
              "3 x 20 reps",
              30,
              "Face down, arms and legs long and lifted, flutter opposite arm and leg quickly.",
              "A pancia in giù, braccia e gambe lunghe e sollevate, muovi rapidamente braccio e gamba opposti.",
            ),
          ],
        },
        {
          id: "swan",
          label: "Swan",
          exercises: [
            ex(
              "Swan",
              "3 x 6 reps",
              30,
              "Press into the hands and lift into a long backbend, then lower with control.",
              "Spingi con le mani e sali in un'estensione lunga, poi scendi con controllo.",
            ),
            ex(
              "Single-leg kick",
              "3 x 8 reps per side",
              25,
              "On the forearms, chest lifted, kick one heel toward the glute twice and switch.",
              "Sugli avambracci, petto alto, porta un tallone verso il gluteo due volte e cambia.",
            ),
          ],
        },
        {
          id: "dive",
          label: "Swan dive",
          exercises: [
            ex(
              "Swan dive",
              "3 x 5 reps",
              45,
              "From the swan, release the hands and rock forward and back on the front of the body.",
              "Dal cigno, lascia le mani e dondola avanti e indietro sulla parte frontale del corpo.",
            ),
            ex(
              "Double-leg kick",
              "3 x 6 reps",
              40,
              "Hands clasped behind, kick both heels in, then reach back and lift the chest.",
              "Mani intrecciate dietro, porta entrambi i talloni indietro, poi allunga e solleva il petto.",
            ),
          ],
        },
      ],
    },
    {
      key: "sideKick",
      name: "Side Kick",
      group: "legs",
      stages: [
        {
          id: "lifts",
          label: "Leg lifts",
          exercises: [
            ex(
              "Side-lying leg lifts",
              "3 x 12 reps per side",
              20,
              "On your side in a line, lift and lower the top leg without the hips rolling.",
              "Sul fianco, in linea, solleva e abbassa la gamba sopra senza far ruotare il bacino.",
            ),
            ex(
              "Clamshell",
              "3 x 15 reps per side",
              20,
              "On your side, knees bent, open the top knee like a shell, feet together.",
              "Sul fianco, ginocchia piegate, apri il ginocchio sopra come una conchiglia, piedi uniti.",
            ),
          ],
        },
        {
          id: "kick",
          label: "Front & back",
          exercises: [
            ex(
              "Side kick front and back",
              "3 x 10 reps per side",
              25,
              "Top leg at hip height, kick forward twice and sweep back, torso still.",
              "Gamba sopra all'altezza del bacino, calcia avanti due volte e porta indietro, busto fermo.",
            ),
            ex(
              "Single-leg circles",
              "3 x 8 reps per side",
              25,
              "On the back, one leg to the ceiling, draw circles each direction, hips still.",
              "Sulla schiena, una gamba verso il soffitto, disegna cerchi in ogni direzione, bacino fermo.",
            ),
          ],
        },
        {
          id: "kneeling",
          label: "Kneeling side kick",
          exercises: [
            ex(
              "Kneeling side kick",
              "3 x 8 reps per side",
              40,
              "Kneeling on one knee, one hand down, top leg long, kick it forward and back.",
              "In ginocchio su un ginocchio, una mano a terra, gamba sopra lunga, calciala avanti e indietro.",
            ),
            ex(
              "Side bend (mermaid)",
              "3 x 6 reps per side",
              30,
              "Sitting on one hip, press up into a side plank arc and lower.",
              "Seduto su un fianco, sali in un arco di plank laterale e scendi.",
            ),
          ],
        },
      ],
    },
    {
      key: "shoulderBridge",
      name: "Shoulder Bridge",
      group: "legs",
      stages: [
        {
          id: "curl",
          label: "Pelvic curl",
          exercises: [
            ex(
              "Pelvic curl holds",
              "3 x 20s hold",
              20,
              "Peel up into a bridge from the tailbone and hold, knees over the ankles.",
              "Sali nel ponte partendo dal coccige e tieni, ginocchia sopra le caviglie.",
            ),
            ex(
              "Bridge marches",
              "3 x 10 reps per side",
              25,
              "In the bridge, lift one foot then the other without the hips dropping.",
              "Nel ponte, solleva un piede poi l'altro senza far scendere il bacino.",
            ),
          ],
        },
        {
          id: "kicks",
          label: "Leg kicks",
          exercises: [
            ex(
              "Shoulder bridge with leg kicks",
              "3 x 6 reps per side",
              40,
              "In a high bridge, extend one leg to the ceiling, lower it long and kick it back up.",
              "In un ponte alto, distendi una gamba verso il soffitto, abbassala lunga e riportala su.",
            ),
            ex(
              "Single-leg bridge",
              "3 x 8 reps per side",
              30,
              "One leg extended, lift and lower the hips on the other foot.",
              "Una gamba distesa, solleva e abbassa il bacino sull'altro piede.",
            ),
          ],
        },
      ],
    },
    {
      key: "plankSeries",
      name: "Plank Series",
      group: "fullBody",
      stages: [
        {
          id: "forearm",
          label: "Forearm plank",
          exercises: [
            ex(
              "Forearm plank",
              "3 x 30s hold",
              25,
              "On the forearms and toes, one long line from head to heels.",
              "Su avambracci e punte, una linea lunga dalla testa ai talloni.",
            ),
            ex(
              "Side plank (knees down)",
              "3 x 20s hold per side",
              25,
              "On one forearm with the knees bent and down, lift the hips into a line.",
              "Su un avambraccio con le ginocchia piegate a terra, solleva il bacino in linea.",
            ),
          ],
        },
        {
          id: "legPull",
          label: "Leg pull",
          exercises: [
            ex(
              "Leg pull front",
              "3 x 6 reps per side",
              40,
              "In a high plank, lift one leg long and lower it, the body still.",
              "In plank alto, solleva una gamba lunga e abbassala, il corpo fermo.",
            ),
            ex(
              "Side plank",
              "3 x 20s hold per side",
              30,
              "On one hand with the legs straight and stacked, hips lifted.",
              "Su una mano con le gambe tese e sovrapposte, bacino sollevato.",
            ),
          ],
        },
        {
          id: "pushUp",
          label: "Pilates push-up",
          exercises: [
            ex(
              "Pilates push-up",
              "3 x 5 reps",
              45,
              "Roll down to the floor, walk the hands out to plank, do three push-ups and walk back.",
              "Srotolati fino a terra, cammina con le mani fino al plank, fai tre piegamenti e torna indietro.",
            ),
            ex(
              "Leg pull back",
              "3 x 6 reps per side",
              40,
              "Reverse plank on the hands, kick one leg up and lower it, hips high.",
              "Plank inverso sulle mani, calcia una gamba in alto e abbassala, bacino alto.",
            ),
          ],
        },
      ],
    },
    {
      key: "rolling",
      name: "Rolling & Control",
      group: "fullBody",
      stages: [
        {
          id: "ball",
          label: "Rolling like a ball",
          exercises: [
            ex(
              "Rolling like a ball",
              "3 x 8 reps",
              20,
              "Balanced in a tight tuck, roll back to the shoulder blades and back up without touching the feet down.",
              "In equilibrio raccolto, rotola indietro fino alle scapole e risali senza appoggiare i piedi.",
            ),
            ex(
              "Seal",
              "3 x 8 reps",
              25,
              "Hands through the legs holding the ankles, roll back, clap the feet and roll up.",
              "Mani tra le gambe a tenere le caviglie, rotola indietro, batti i piedi e risali.",
            ),
          ],
        },
        {
          id: "rocker",
          label: "Open-leg rocker",
          exercises: [
            ex(
              "Open-leg rocker",
              "3 x 6 reps",
              35,
              "Holding the ankles with the legs in a wide V, roll back and up to balance again.",
              "Tenendo le caviglie con le gambe a V larga, rotola indietro e risali in equilibrio.",
            ),
            ex(
              "Corkscrew",
              "3 x 5 reps per direction",
              35,
              "On the back, legs up together, circle them side to side with control.",
              "Sulla schiena, gambe unite in alto, disegna cerchi da un lato all'altro con controllo.",
            ),
          ],
        },
        {
          id: "control",
          label: "Control balance",
          exercises: [
            ex(
              "Control balance",
              "3 x 4 reps per side",
              45,
              "From the roll-over, hold one ankle and lift the other leg to the ceiling, switching.",
              "Dal roll-over, tieni una caviglia e solleva l'altra gamba verso il soffitto, alternando.",
            ),
            ex(
              "Boomerang",
              "3 x 4 reps",
              45,
              "A flowing roll-over into a teaser with the legs crossing, finishing in a forward stretch.",
              "Un roll-over fluido che passa al teaser con le gambe incrociate, chiudendo in allungamento in avanti.",
            ),
          ],
        },
      ],
    },
  ],
  warmup: [
    ex(
      "Breathing with pelvic tilts",
      "2 x 8 reps",
      10,
      "On the back, knees bent, tilt the pelvis to flatten and soften the lower back with the breath.",
      "Sulla schiena, ginocchia piegate, inclina il bacino per appiattire e rilasciare la zona lombare con il respiro.",
    ),
    ex(
      "Cat-cow spinal rocks",
      "2 x 8 reps",
      10,
      "On hands and knees, arch the back looking up, then round it looking down, with the breath.",
      "In quadrupedia, inarca la schiena guardando in alto, poi arrotondala guardando in basso, con il respiro.",
    ),
    ex(
      "Spine twist",
      "2 x 6 reps per side",
      10,
      "Sitting tall, legs long, arms out, twist the upper body from the waist.",
      "Seduto alto, gambe lunghe, braccia aperte, ruota la parte alta del corpo dalla vita.",
    ),
  ],
  cooldown: [
    ex(
      "Saw",
      "1 x 6 reps per side",
      10,
      "Sitting with the legs wide, twist and reach one hand past the opposite little toe.",
      "Seduto con le gambe larghe, ruota e porta una mano oltre il mignolo del piede opposto.",
    ),
    ex(
      "Child's pose",
      "1 x 40s hold",
      10,
      "Kneel, sit back to the heels and rest the chest down, arms long.",
      "In ginocchio, siediti sui talloni e appoggia il petto, braccia lunghe.",
    ),
  ],
};
