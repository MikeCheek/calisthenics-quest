import type { SportDef, SportExercise } from "./types";

// ---------------------------------------------------------------------------
// Yoga: eight skills from foundations to advanced, each a ladder of stages.
// Prescriptions use the app's words (holds in seconds, reps, per side) so the
// timer, the logger and the translator all understand them.
// ---------------------------------------------------------------------------

const ex = (name: string, detail: string, restSeconds: number, description: string, it: string, cue?: string, cueIt?: string): SportExercise => ({
  name,
  detail,
  restSeconds,
  description,
  ...(cue ? { cue } : {}),
  it: { description: it, ...(cueIt ? { cue: cueIt } : {}) },
});

export const YOGA: SportDef = {
  id: "yoga",
  name: "Yoga",
  emoji: "🧘",
  tagline: "Flexibility, balance and calm strength",
  indoor: true,
  groups: [
    { key: "flow", label: "Flow" },
    { key: "balance", label: "Balance" },
    { key: "strength", label: "Arm balances & inversions" },
    { key: "backbend", label: "Backbends" },
    { key: "flexibility", label: "Flexibility" },
  ],
  skills: [
    {
      key: "sunSalutation",
      name: "Sun Salutation",
      group: "flow",
      stages: [
        { id: "half", label: "Half salute", exercises: [
          ex("Half sun salutation", "3 x 1 rep", 20, "Reach the arms up, fold forward, lift halfway with a long back, fold again and rise back up, moving with the breath.", "Porta le braccia in alto, piegati in avanti, sali a metà con la schiena lunga, ripiegati e torna su, muovendoti con il respiro.", "One breath, one movement", "Un respiro, un movimento"),
          ex("Downward dog", "3 x 30s hold", 20, "Hands and feet on the floor, hips high: press the floor away, lengthen the spine, heels reaching down.", "Mani e piedi a terra, bacino in alto: spingi via il pavimento, allunga la colonna, talloni verso terra.", "Long spine before straight legs", "Prima la schiena lunga, poi le gambe tese"),
        ] },
        { id: "sunA", label: "Sun A", exercises: [
          ex("Sun salutation A", "3 x 1 rep", 30, "Mountain, arms up, fold, half lift, step back to plank, lower, cobra, downward dog for a few breaths, step forward and rise.", "Montagna, braccia in alto, piegamento, mezza salita, indietro in plank, scendi, cobra, cane a testa in giù per qualche respiro, avanti e risali.", "Lower slowly from plank", "Scendi lentamente dal plank"),
          ex("Cobra pose", "3 x 20s hold", 20, "Lying face down, hands under the shoulders, lift the chest with the back muscles, elbows close, hips on the floor.", "A pancia in giù, mani sotto le spalle, solleva il petto con i muscoli della schiena, gomiti vicini, bacino a terra."),
        ] },
        { id: "sunB", label: "Sun B", exercises: [
          ex("Sun salutation B", "3 x 1 rep", 40, "Sun A with chair pose at the start and warrior I on each side, linked by vinyasas.", "Saluto al sole A con la sedia all'inizio e il guerriero I su ogni lato, collegati da vinyasa.", "Keep the breath steady", "Mantieni il respiro regolare"),
          ex("Chaturanga", "3 x 5 reps", 40, "From plank, lower as one piece until the elbows are at 90°, elbows hugging the ribs, then push back up.", "Dal plank scendi tutto in blocco finché i gomiti sono a 90°, gomiti vicini alle costole, poi risali."),
        ] },
        { id: "vinyasa", label: "Vinyasa flow", exercises: [
          ex("Vinyasa flow", "2 x 1 rep", 60, "A continuous flow of sun salutations, warriors and a balance, one breath per movement for about five minutes.", "Un flusso continuo di saluti al sole, guerrieri e un equilibrio, un respiro per movimento per circa cinque minuti."),
          ex("Jump back to chaturanga", "3 x 5 reps", 45, "From the forward fold, hands down, float the feet back and land softly straight into chaturanga.", "Dal piegamento, mani a terra, salta indietro con i piedi e atterra morbido direttamente in chaturanga."),
        ] },
      ],
    },
    {
      key: "standingBalance",
      name: "Standing Balance",
      group: "balance",
      stages: [
        { id: "tree", label: "Tree", exercises: [
          ex("Tree pose", "3 x 30s hold per side", 15, "Stand on one leg, the other foot on the inner calf or thigh (never the knee), hands at the chest or overhead.", "In piedi su una gamba, l'altro piede sul polpaccio o sulla coscia interna (mai sul ginocchio), mani al petto o in alto.", "Fix your gaze on one point", "Fissa lo sguardo su un punto"),
          ex("Warrior II", "3 x 30s hold per side", 15, "Wide stance, front knee bent over the ankle, arms long to the sides, gaze over the front hand.", "Gambe larghe, ginocchio davanti piegato sopra la caviglia, braccia lunghe ai lati, sguardo oltre la mano davanti."),
        ] },
        { id: "warrior3", label: "Warrior III", exercises: [
          ex("Warrior III", "3 x 20s hold per side", 20, "Hinge forward on one leg until the body and the back leg are one line, parallel to the floor, hips square.", "Piegati in avanti su una gamba finché corpo e gamba dietro formano una linea parallela al pavimento, bacino dritto."),
          ex("Eagle pose", "3 x 20s hold per side", 20, "Sit back on one leg, wrap the other leg around it and the arms around each other, hips low.", "Siediti indietro su una gamba, avvolgi l'altra gamba attorno ad essa e le braccia una nell'altra, bacino basso."),
        ] },
        { id: "halfMoon", label: "Half moon", exercises: [
          ex("Half moon pose", "3 x 20s hold per side", 25, "From triangle, shift onto the front leg and one hand, lift the back leg level, open the chest to the side.", "Dal triangolo, porta il peso sulla gamba davanti e su una mano, solleva la gamba dietro in linea, apri il petto di lato."),
          ex("Dancer pose", "3 x 20s hold per side", 25, "Hold one foot behind you, kick it into the hand and tip forward, the free arm reaching ahead.", "Tieni un piede dietro di te, spingilo nella mano e inclinati in avanti, il braccio libero teso davanti."),
        ] },
        { id: "standingSplit", label: "Standing split", exercises: [
          ex("Standing split", "3 x 20s hold per side", 30, "Fold over one leg, hands to the floor, and lift the other leg as high as the hips allow, both legs straight.", "Piegati su una gamba, mani a terra, e solleva l'altra gamba quanto il bacino permette, entrambe tese."),
          ex("Extended hand-to-big-toe", "3 x 15s hold per side", 30, "Standing tall, hold one big toe and extend the leg forward, then out to the side.", "In piedi, afferra l'alluce e distendi la gamba in avanti, poi di lato."),
        ] },
      ],
    },
    {
      key: "crow",
      name: "Crow",
      group: "strength",
      stages: [
        { id: "prep", label: "Prep", exercises: [
          ex("Garland squat", "3 x 30s hold", 20, "A deep squat with the feet wide, elbows pressing the knees open, chest lifted.", "Uno squat profondo con i piedi larghi, gomiti che aprono le ginocchia, petto alto."),
          ex("Crow prep lean", "3 x 15s hold", 30, "Hands down, knees on the backs of the upper arms, lean forward until the weight is on the hands, toes still down.", "Mani a terra, ginocchia sulla parte alta delle braccia, inclinati finché il peso è sulle mani, punte ancora a terra.", "Look forward, not down", "Guarda avanti, non in basso"),
        ] },
        { id: "crow", label: "Crow", exercises: [
          ex("Crow pose", "4 x 10s hold", 40, "From the prep, lean a little more and lift one foot then the other, knees resting on the arms.", "Dalla preparazione, inclinati ancora un po' e solleva un piede poi l'altro, ginocchia appoggiate sulle braccia.", "Round the upper back", "Arrotonda la parte alta della schiena"),
          ex("Boat pose", "3 x 20s hold", 30, "Balance on the sit bones, chest lifted, legs raised with the knees bent or straight.", "In equilibrio sugli ischi, petto alto, gambe sollevate con ginocchia piegate o tese."),
        ] },
        { id: "sideCrow", label: "Side crow", exercises: [
          ex("Side crow", "4 x 10s hold per side", 45, "Twist in a squat, both hands to one side, stack the knees on one arm and tip forward until the feet float.", "Ruota in squat, entrambe le mani da un lato, appoggia le ginocchia su un braccio e inclinati finché i piedi si staccano."),
          ex("Crow to plank jump back", "3 x 3 reps", 60, "From crow, shoot the legs back and land in chaturanga.", "Dal corvo, lancia le gambe indietro e atterra in chaturanga."),
        ] },
        { id: "firefly", label: "Firefly", exercises: [
          ex("Firefly pose", "4 x 8s hold", 60, "Hands between the feet, legs over the arms, press the floor and straighten the legs forward.", "Mani tra i piedi, gambe sopra le braccia, spingi il pavimento e distendi le gambe in avanti."),
          ex("Eight-angle pose", "3 x 8s hold per side", 60, "One leg over the arm, ankles crossed, lean forward and extend the legs to the side.", "Una gamba sopra il braccio, caviglie incrociate, inclinati e distendi le gambe di lato."),
        ] },
      ],
    },
    {
      key: "headstand",
      name: "Headstand",
      group: "strength",
      stages: [
        { id: "dolphin", label: "Dolphin", exercises: [
          ex("Dolphin pose", "3 x 30s hold", 30, "Downward dog on the forearms: shoulders over the elbows, hips high, walk the feet in.", "Cane a testa in giù sugli avambracci: spalle sopra i gomiti, bacino alto, avvicina i piedi."),
          ex("Forearm plank", "3 x 30s hold", 30, "On the forearms and toes, body in one line, pushing the floor away.", "Su avambracci e punte, corpo in linea, spingendo via il pavimento."),
        ] },
        { id: "wall", label: "Wall headstand", exercises: [
          ex("Supported headstand at the wall", "3 x 30s hold", 45, "Forearms down with the hands clasped, crown of the head lightly down, walk in and lift the legs up the wall.", "Avambracci a terra con le mani intrecciate, sommità del capo appoggiata leggera, cammina verso dentro e sali con le gambe al muro.", "Weight in the forearms, not the neck", "Il peso sugli avambracci, non sul collo"),
          ex("Headstand tuck holds", "3 x 15s hold", 45, "In the headstand set-up, lift both knees to the chest and hold, hips over the shoulders.", "Nella posizione della verticale sulla testa, porta entrambe le ginocchia al petto e tieni, bacino sopra le spalle."),
        ] },
        { id: "free", label: "Freestanding", exercises: [
          ex("Freestanding headstand", "3 x 30s hold", 60, "Away from the wall, tuck then extend the legs to vertical with control.", "Lontano dal muro, raccogli le gambe e poi distendile in verticale con controllo."),
          ex("Headstand leg lowers", "3 x 5 reps", 60, "From headstand, lower straight legs halfway and lift back up.", "Dalla verticale sulla testa, abbassa le gambe tese a metà e risali."),
        ] },
      ],
    },
    {
      key: "wheel",
      name: "Wheel",
      group: "backbend",
      stages: [
        { id: "bridge", label: "Bridge", exercises: [
          ex("Bridge pose", "3 x 30s hold", 20, "On the back, feet under the knees, press through the feet and lift the hips, chest toward the chin.", "Sulla schiena, piedi sotto le ginocchia, spingi con i piedi e solleva il bacino, petto verso il mento."),
          ex("Locust pose", "3 x 20s hold", 20, "Face down, lift the chest, arms and legs off the floor together.", "A pancia in giù, solleva insieme petto, braccia e gambe."),
        ] },
        { id: "camel", label: "Camel", exercises: [
          ex("Camel pose", "3 x 20s hold", 30, "Kneeling, hips over the knees, lift the chest and reach back for the heels.", "In ginocchio, bacino sopra le ginocchia, solleva il petto e porta le mani ai talloni."),
          ex("Wheel prep (head on the floor)", "3 x 10s hold", 40, "Hands by the ears, lift the hips and rest the crown of the head down, elbows hugging in.", "Mani accanto alle orecchie, solleva il bacino e appoggia la sommità del capo, gomiti stretti."),
        ] },
        { id: "wheel", label: "Wheel", exercises: [
          ex("Wheel pose", "3 x 15s hold", 60, "From the prep, press the arms straight and lift into a full backbend.", "Dalla preparazione, distendi le braccia e sali in un ponte completo.", "Push the chest toward the wall behind", "Spingi il petto verso il muro dietro"),
          ex("Bow pose", "3 x 20s hold", 30, "Face down, hold the ankles and kick into the hands to lift chest and thighs.", "A pancia in giù, afferra le caviglie e spingile nelle mani per sollevare petto e cosce."),
        ] },
      ],
    },
    {
      key: "splits",
      name: "Splits",
      group: "flexibility",
      stages: [
        { id: "lunge", label: "Low lunge", exercises: [
          ex("Low lunge", "2 x 40s hold per side", 15, "Back knee down, front knee over the ankle, sink the hips forward with the chest lifted.", "Ginocchio dietro a terra, ginocchio davanti sopra la caviglia, abbassa il bacino in avanti con il petto alto."),
          ex("Half split", "2 x 40s hold per side", 15, "From the low lunge, shift back and straighten the front leg, folding over it.", "Dall'affondo basso, sposta il peso indietro e distendi la gamba davanti, piegandoti su di essa."),
        ] },
        { id: "supported", label: "Supported split", exercises: [
          ex("Lizard pose", "2 x 40s hold per side", 15, "Low lunge with both hands inside the front foot, sinking the hips.", "Affondo basso con entrambe le mani all'interno del piede davanti, abbassando il bacino."),
          ex("Supported front split", "2 x 45s hold per side", 20, "Slide into the split with blocks under the hands, hips square, as low as stays comfortable.", "Scivola nella spaccata con i blocchi sotto le mani, bacino dritto, finché resta comodo."),
        ] },
        { id: "full", label: "Full split", exercises: [
          ex("Front split", "2 x 45s hold per side", 25, "Both legs straight on the floor, front and back, hips square and down.", "Entrambe le gambe tese a terra, avanti e indietro, bacino dritto e a terra."),
          ex("Middle split stretch", "2 x 45s hold", 20, "Legs wide to the sides, fold forward with a long back.", "Gambe larghe ai lati, piegati in avanti con la schiena lunga."),
        ] },
      ],
    },
    {
      key: "forwardFold",
      name: "Forward Fold",
      group: "flexibility",
      stages: [
        { id: "bent", label: "Soft knees", exercises: [
          ex("Seated forward fold", "2 x 40s hold", 15, "Sit with the legs long, knees soft, and fold from the hips with a long back.", "Seduto con le gambe lunghe, ginocchia morbide, piegati dal bacino con la schiena lunga."),
          ex("Head-to-knee pose", "2 x 30s hold per side", 15, "One leg long, the other foot at the inner thigh, fold over the long leg.", "Una gamba lunga, l'altro piede all'interno della coscia, piegati sulla gamba lunga."),
        ] },
        { id: "straight", label: "Straight legs", exercises: [
          ex("Standing forward fold", "2 x 40s hold", 15, "Feet together, fold from the hips, palms to the floor or shins, legs straight.", "Piedi uniti, piegati dal bacino, palmi a terra o sugli stinchi, gambe tese."),
          ex("Wide-legged forward fold", "2 x 40s hold", 15, "Feet wide, fold forward, crown of the head toward the floor.", "Piedi larghi, piegati in avanti, sommità del capo verso il pavimento."),
        ] },
        { id: "compression", label: "Full compression", exercises: [
          ex("Seated forward fold (chest to legs)", "2 x 45s hold", 20, "Legs straight and together, chest resting on the thighs, hands past the feet.", "Gambe tese e unite, petto appoggiato alle cosce, mani oltre i piedi."),
          ex("Plow pose", "2 x 30s hold", 25, "From the back, roll the legs overhead until the toes touch the floor behind you.", "Dalla schiena, porta le gambe oltre la testa finché le punte toccano il pavimento dietro."),
        ] },
      ],
    },
    {
      key: "hips",
      name: "Hip Opening",
      group: "flexibility",
      stages: [
        { id: "figure4", label: "Figure four", exercises: [
          ex("Figure-four stretch", "2 x 40s hold per side", 15, "On the back, cross one ankle over the other knee and draw the legs toward the chest.", "Sulla schiena, incrocia una caviglia sull'altro ginocchio e porta le gambe verso il petto."),
          ex("Butterfly pose", "2 x 40s hold", 15, "Sit with the soles of the feet together and let the knees fall open, folding forward gently.", "Seduto con le piante dei piedi unite, lascia aprire le ginocchia e piegati dolcemente in avanti."),
        ] },
        { id: "pigeon", label: "Pigeon", exercises: [
          ex("Pigeon pose", "2 x 45s hold per side", 15, "Front shin across the mat, back leg long behind, hips square, folding over the front leg.", "Stinco davanti di traverso, gamba dietro lunga, bacino dritto, piegandoti sulla gamba davanti."),
          ex("Happy baby", "2 x 30s hold", 15, "On the back, hold the outer feet with the knees wide toward the armpits.", "Sulla schiena, afferra il bordo esterno dei piedi con le ginocchia larghe verso le ascelle."),
        ] },
        { id: "lotus", label: "Lotus", exercises: [
          ex("Half lotus", "2 x 40s hold per side", 15, "Seated, place one foot on top of the opposite thigh, knee relaxed down.", "Seduto, appoggia un piede sopra la coscia opposta, ginocchio rilassato verso il basso."),
          ex("Full lotus", "2 x 40s hold", 20, "Both feet on top of the opposite thighs, spine tall. Never force the knees.", "Entrambi i piedi sopra le cosce opposte, colonna alta. Non forzare mai le ginocchia."),
        ] },
      ],
    },
  ],
  warmup: [
    ex("Cat-cow spinal rocks", "2 x 8 reps", 10, "On hands and knees, arch the back looking up, then round it looking down, with the breath.", "In quadrupedia, inarca la schiena guardando in alto, poi arrotondala guardando in basso, con il respiro."),
    ex("Child's pose", "1 x 40s hold", 10, "Kneel, sit back to the heels and rest the chest down, arms long.", "In ginocchio, siediti sui talloni e appoggia il petto, braccia lunghe."),
    ex("Downward dog pedal", "2 x 10 reps", 15, "In downward dog, bend one knee and press the other heel down, alternating.", "Nel cane a testa in giù, piega un ginocchio e spingi l'altro tallone a terra, alternando."),
  ],
  cooldown: [
    ex("Supine twist", "1 x 40s hold per side", 10, "On the back, knees together, let them fall to one side with the arms wide.", "Sulla schiena, ginocchia unite, lasciale cadere da un lato con le braccia larghe."),
    ex("Savasana", "1 x 120s hold", 0, "Lie still on the back, arms by the sides, and let the breath settle.", "Sdraiati immobile sulla schiena, braccia lungo i fianchi, e lascia calmare il respiro."),
  ],
};
