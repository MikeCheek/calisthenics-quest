import type { GuideTable } from "../index";

// Yoga: posizioni di base, famiglia del crow, verticale sulla testa, piegamenti, spaccate e riposo.
export const YOGA2: GuideTable = {
  firefly: {
    setup: ["In piedi con i piedi poco più larghi delle anche; piegati in avanti e porta le spalle dietro le ginocchia, mani a terra dietro i talloni, dita in avanti."],
    steps: [
      "Piega le ginocchia e siediti sul retro delle braccia, come su una mensola.",
      "Porta il peso indietro sulle mani finché i piedi si staccano da terra.",
      "Stringi le braccia con le cosce e distendi le gambe di lato; mantieni, poi piega le ginocchia e riappoggia i piedi.",
    ],
    targets: [
      "Braccia tese o leggermente piegate, mani sotto le spalle.",
      "Cosce alte sulle braccia, che stringono verso l'interno.",
      "Gambe tese e sollevate circa all'orizzontale, punte tese o a martello.",
    ],
    mistakes: [
      ["Spalle non abbastanza dietro le ginocchia", "Piegati di più prima; piega di più le ginocchia per entrarci sotto."],
      ["Gambe piegate che scendono", "Stringi le braccia con le cosce e allungati attraverso i talloni."],
      ["Forzare con femorali rigidi", "Costruisci prima la compressione con piegamenti in avanti e pike da seduto."],
    ],
    breath: "Respiri brevi e regolari — la pancia è compressa, quindi tienili piccoli.",
  },
  eightAngle: {
    setup: ["Seduto con le gambe tese; porta la gamba destra sopra il braccio destro, in alto vicino alla spalla. Mani a terra accanto alle anche."],
    steps: [
      "Spingi sulle mani e stacca le anche da terra.",
      "Incrocia la caviglia sinistra sopra la destra e stringi il braccio destro tra le cosce.",
      "Piega i gomiti, porta il petto in avanti e distendi le gambe verso destra; mantieni, poi cambia lato.",
    ],
    targets: [
      "Gomiti piegati a circa 90°, sopra i polsi, come in una chaturanga.",
      "Gambe tese, sovrapposte, che stringono il braccio.",
      "Busto circa parallelo al pavimento, gambe di lato.",
    ],
    mistakes: [
      ["Gamba bassa sul braccio", "Portala il più in alto possibile, vicino alla spalla."],
      ["Non inclinarsi abbastanza in avanti", "Porta il petto avanti mentre le gambe si allungano indietro."],
      ["Gambe piegate e molli", "Stringi le caviglie tra loro e distendi le ginocchia."],
    ],
    breath: "Respiri brevi; espira mentre ti inclini in avanti.",
  },
  headstandLegLowers: {
    setup: ["Parti da una verticale sulla testa stabile (al muro o libera), gambe unite e verticali."],
    steps: [
      "Tenendo le anche sopra le spalle, abbassa lentamente in avanti le gambe tese.",
      "Fermati quando le gambe sono orizzontali (o prima, se la schiena si inarca o le anche si spostano).",
      "Riporta le gambe in verticale con gli addominali, alla stessa velocità lenta.",
    ],
    targets: [
      "Gambe tese e unite, che scendono al massimo fino a 90° all'anca.",
      "Le anche restano sopra le spalle — il busto rimane verticale.",
      "Avambracci che premono, spalle lontane dalle orecchie.",
    ],
    mistakes: [
      ["Anche che arretrano mentre le gambe scendono", "Scendi meno; porta le anche leggermente avanti per compensare."],
      ["Piegare le ginocchia per facilitarla", "Tienile tese; riduci invece l'ampiezza."],
      ["Lasciar cadere le gambe", "Conta 3 s in discesa e 3 s in salita."],
    ],
    breath: "Inspira mentre le gambe scendono, espira mentre salgono.",
  },
  plow: {
    setup: ["Sdraiati sulla schiena, braccia lungo i fianchi, palmi in giù; una coperta piegata sotto le spalle protegge il collo."],
    steps: [
      "Solleva le gambe sopra la testa, rotolando sulle spalle.",
      "Abbassa le punte verso il pavimento dietro di te, mani a sostenere la schiena o braccia a terra.",
      "Mantieni, poi rotola giù lentamente vertebra per vertebra.",
    ],
    targets: [
      "Anche sopra le spalle.",
      "Peso su spalle e parte alta delle braccia, mai sul collo; non girare la testa.",
      "Gambe tese; le punte arrivano a terra solo se viene facile.",
    ],
    mistakes: [
      ["Peso che scivola sul collo", "Porta le spalle sotto di te; usa una coperta."],
      ["Girare la testa", "Tieni lo sguardo dritto verso l'alto."],
      ["Forzare i piedi a terra", "Sostieni la schiena con le mani, piedi in aria."],
    ],
    breath: "Il petto è compresso: respira piano e in modo superficiale verso la schiena.",
  },
  bridgePose: {
    setup: ["Sdraiati sulla schiena, ginocchia piegate, piedi alla larghezza delle anche e appoggiati, talloni sotto le ginocchia; braccia lungo i fianchi."],
    steps: [
      "Spingi sui piedi e solleva le anche.",
      "Intreccia le mani sotto la schiena e porta le spalle sotto di te.",
      "Mantieni, poi rotola giù lentamente dalla parte alta della schiena fino alle anche.",
    ],
    targets: [
      "Ginocchia sopra le caviglie, rivolte in avanti (non aperte).",
      "Anche alte: una linea retta dalle ginocchia alle spalle.",
      "Peso su spalle e piedi, collo libero — non girare la testa.",
    ],
    mistakes: [
      ["Ginocchia che si aprono", "Tieni un blocco tra le cosce."],
      ["Spingere con le punte", "Spingi con i talloni."],
      ["Girare la testa", "Tieni lo sguardo verso l'alto."],
    ],
    breath: "Inspira per salire, respiri regolari nella posizione, espira per scendere.",
  },
  wheel: {
    setup: ["Sdraiati sulla schiena, piedi alla larghezza delle anche vicino ai glutei; mani accanto alle orecchie, dita verso le spalle, gomiti in alto."],
    steps: [
      "Spingi sui piedi e solleva le anche.",
      "Spingi sulle mani e sali sulla sommità della testa (wheel prep).",
      "Distendi le braccia per sollevare la testa e spingi il petto in avanti; mantieni, poi porta il mento al petto e scendi lentamente.",
    ],
    targets: [
      "Braccia tese, spalle sopra i polsi (o il più vicino possibile).",
      "Piedi paralleli, ginocchia alla larghezza delle anche.",
      "La flessione distribuita su parte alta della schiena e spalle, non solo nella zona lombare.",
    ],
    mistakes: [
      ["Gomiti che si piegano o si aprono", "Spingi sulle mani e stringi i gomiti verso l'interno."],
      ["Ginocchia e piedi ruotati in fuori", "Tieni i piedi paralleli."],
      ["Tutta la flessione nella zona lombare", "Spingi il petto verso il muro dietro le mani."],
    ],
    breath: "Respira in modo regolare; mai trattenere il fiato in un backbend profondo.",
  },
  lowLunge: {
    setup: ["Da un affondo, appoggia il ginocchio dietro sul tappetino (protetto); ginocchio davanti sopra la caviglia."],
    steps: [
      "Retroverti leggermente il bacino per sentire la parte anteriore dell'anca dietro.",
      "Raddrizza il busto, mani sulla coscia davanti o in alto.",
      "Porta dolcemente le anche in avanti; mantieni, poi cambia lato.",
    ],
    targets: [
      "Ginocchio davanti a circa 90°, sopra la caviglia.",
      "Bacino retroverso: l'allungamento è davanti all'anca dietro, non nella zona lombare.",
      "Busto dritto, spalle sopra le anche.",
    ],
    mistakes: [
      ["Inarcare la zona lombare", "Retroverti prima il bacino."],
      ["Ginocchio davanti oltre le punte", "Porta il piede davanti più avanti."],
      ["Ginocchio dietro sul pavimento duro", "Proteggilo con una coperta piegata."],
    ],
    breath: "Espirazioni lunghe per scendere un po' di più.",
  },
  frontSplit: {
    setup: ["Da una mezza spaccata, blocchi sotto le mani; nella versione supportata un cuscino o un blocco sotto la coscia davanti."],
    steps: [
      "Fai scivolare il tallone davanti in avanti e il ginocchio dietro indietro, poco alla volta.",
      "Tieni le anche rivolte in avanti.",
      "Scendi solo finché riesci a respirare con calma; mantieni, poi esci lentamente.",
    ],
    targets: [
      "Anche frontali: entrambe le creste iliache guardano avanti.",
      "Gamba davanti tesa con la rotula in su; gamba dietro tesa con la rotula verso il pavimento.",
      "Busto dritto o piegato in avanti, sostenuto dalle mani.",
    ],
    mistakes: [
      ["Anche che si aprono di lato", "Allineale, anche se resti più in alto."],
      ["Forzare gli ultimi centimetri", "Sostieniti con i blocchi."],
      ["Ginocchio dietro che ruota in fuori", "Punta le dita del piede dietro verso il basso."],
    ],
    breath: "Espirazioni lunghe e calme.",
  },
  pigeon: {
    setup: ["Dalla quadrupedia, porta il ginocchio destro dietro il polso destro e la tibia destra di traverso sul tappetino; la gamba sinistra si distende dritta indietro."],
    steps: [
      "Allinea le anche in avanti; metti un cuscino sotto l'anca destra se si solleva.",
      "Solleva il petto con le mani a terra.",
      "Piegati in avanti sopra la tibia davanti se viene facile; mantieni, poi cambia lato.",
    ],
    targets: [
      "Tibia davanti di traverso sul tappetino (più è parallela al bordo, più è profonda), piede a martello.",
      "Anche allo stesso livello e frontali — l'anca destra non si inclina verso terra.",
      "Gamba dietro tesa, dorso del piede a terra, rotula verso il pavimento.",
    ],
    mistakes: [
      ["Anca che si inclina a terra", "Sostienila con un cuscino."],
      ["Dolore al ginocchio davanti", "Avvicina il piede all'anca; fletti il piede."],
      ["Gamba dietro che ruota in fuori", "Punta le dita del piede dietro dritte indietro."],
    ],
    breath: "Espirazioni lunghe verso l'anca davanti.",
  },
  seatedFold: {
    setup: ["Seduto con le gambe tese davanti, piedi a martello; siediti su un cuscino se la zona lombare si arrotonda."],
    steps: [
      "Inspira e allunga la colonna.",
      "Espira e piegati in avanti dalle anche.",
      "Afferra tibie, caviglie o piedi; lascia rilassare la testa per ultima.",
    ],
    targets: [
      "La piegatura viene dalle anche; la pancia va verso le cosce.",
      "Ginocchia morbide se serve — tese ma non bloccate.",
      "Petto sulle gambe solo nella versione più profonda.",
    ],
    mistakes: [
      ["Arrotondarsi solo dalla parte alta della schiena", "Siediti su un cuscino e guida con il petto."],
      ["Molleggiare", "Resta fermo e respira."],
      ["Bloccare forte le ginocchia", "Ammorbidiscile."],
    ],
    breath: "Inspira per allungarti, espira per piegarti un po' di più.",
  },
  standingFold: {
    setup: ["In piedi con i piedi alla larghezza delle anche, ginocchia morbide."],
    steps: [
      "Piegati in avanti dalle anche con la colonna lunga.",
      "Lascia pendere il busto, le mani verso il pavimento o a tenere i gomiti.",
      "Rilassa testa e collo; risali lentamente, srotolandoti.",
    ],
    targets: [
      "Anche sopra i talloni — senza sbilanciarti indietro.",
      "Pancia verso le cosce; le ginocchia si piegano quanto serve.",
      "Collo rilassato.",
    ],
    mistakes: [
      ["Arrotondarsi solo dalla parte alta della schiena", "Piega le ginocchia e guida con le anche."],
      ["Molleggiare", "Resta fermo e respira."],
      ["Bloccare le ginocchia", "Ammorbidiscile."],
    ],
    breath: "Espirazioni lunghe.",
  },
  lotus: {
    setup: ["Seduto a gambe incrociate con le anche già scaldate (fai prima piccione o figura quattro)."],
    steps: [
      "Porta il piede destro sulla coscia sinistra, pianta in su (mezzo loto).",
      "Loto completo: porta anche il piede sinistro sulla coscia destra.",
      "Siediti dritto con le mani sulle ginocchia; la volta successiva inverti le gambe.",
    ],
    targets: [
      "La rotazione viene dall'anca; il ginocchio si piega soltanto.",
      "Piedi appoggiati in alto sulle cosce.",
      "Colonna dritta, seduto sugli ischi.",
    ],
    mistakes: [
      ["Dolore al ginocchio", "Fermati: l'anca non è ancora abbastanza aperta; resta in mezzo loto o a gambe incrociate."],
      ["Forzare il piede in su con le mani", "Solleva la tibia da sotto, ruotando dall'anca."],
      ["Ingobbirsi", "Siediti su un cuscino."],
    ],
    breath: "Respiri lenti e profondi.",
  },
  savasana: {
    setup: ["Sdraiati sulla schiena con le gambe leggermente divaricate e le braccia un po' lontane dal corpo, palmi in su."],
    steps: [
      "Chiudi gli occhi e lascia cadere i piedi verso l'esterno.",
      "Rilassa il corpo una parte alla volta, dai piedi alla testa.",
      "Resta immobile per tutto il tempo; esci lentamente, ruotando su un fianco.",
    ],
    targets: [
      "Il corpo completamente fermo e rilassato.",
      "Spalle e mandibola sciolte.",
      "Il respiro naturale, non controllato.",
    ],
    mistakes: [
      ["Agitarsi", "Trova prima una posizione comoda, poi resta fermo."],
      ["Avere freddo", "Copriti con una coperta."],
      ["Alzarsi di scatto", "Ruota su un fianco e siediti lentamente."],
    ],
    breath: "Lascia andare il respiro da solo.",
  },
  chaturanga: {
    setup: ["Parti in plank alto: mani sotto le spalle, dita aperte, corpo dritto dalla testa ai talloni."],
    steps: [
      "Spostati in avanti sulle punte dei piedi in modo che le spalle superino i polsi.",
      "Piega i gomiti dritti all'indietro, stringendoli alle costole, e scendi tutto in un pezzo.",
      "Fermati quando i gomiti sono a 90° e le spalle all'altezza dei gomiti; mantieni, poi spingi su o passa al cane a testa in su.",
    ],
    targets: [
      "Gomiti a 90°, sopra i polsi, stretti alle costole e rivolti indietro.",
      "Spalle all'altezza dei gomiti — non più in basso, e non ruotate in avanti.",
      "Corpo dritto dalla testa ai talloni, come in un plank.",
    ],
    mistakes: [
      ["Scendere sotto l'altezza dei gomiti", "Fermati più in alto; a 90° le spalle si proteggono."],
      ["Gomiti che si aprono", "Stringili lungo le costole."],
      ["Anche che cedono o si alzano", "Appoggia le ginocchia finché il corpo resta dritto."],
    ],
    breath: "Espira mentre scendi.",
  },
  vinyasa: {
    setup: ["Parti in plank alto (o arrivaci da un piegamento in avanti), mani sotto le spalle."],
    steps: [
      "Espira: scendi in chaturanga, gomiti vicino alle costole.",
      "Inspira: rulla sulle punte nel cane a testa in su — braccia tese, petto avanti e in alto, cosce staccate da terra.",
      "Espira: porta le anche in alto e indietro nel cane a testa in giù.",
    ],
    targets: [
      "Chaturanga: gomiti a 90°, spalle all'altezza dei gomiti.",
      "Cane a testa in su: spalle sopra i polsi, solo mani e dorso dei piedi a terra.",
      "Cane a testa in giù: anche alte, una linea retta dalle mani alle anche.",
    ],
    mistakes: [
      ["Crollare a terra nella chaturanga", "Appoggia le ginocchia, o passa al cobra invece del cane a testa in su."],
      ["Spalle alle orecchie nel cane a testa in su", "Spingi in basso e porta le spalle indietro."],
      ["Correre", "Un movimento per ogni respiro."],
    ],
    breath: "Espira in chaturanga, inspira nel cane a testa in su, espira nel cane a testa in giù.",
  },
  jumpBack: {
    setup: ["Da un piegamento in avanti o da accosciato, appoggia le mani a terra alla larghezza delle spalle, dita aperte."],
    steps: [
      "Piega le ginocchia e porta le spalle in avanti sopra le mani.",
      "Salta indietro con i piedi, piegando i gomiti mentre i piedi atterrano.",
      "Atterra in chaturanga, poi continua nel cane a testa in su.",
    ],
    targets: [
      "Spalle sopra o oltre i polsi prima del salto.",
      "Atterra sugli avampiedi, gambe tese, gomiti già piegati a 90°.",
      "Corpo dritto all'atterraggio — niente pancia a terra.",
    ],
    mistakes: [
      ["Atterrare a braccia bloccate", "Piega i gomiti mentre i piedi atterrano."],
      ["Atterrare pesante", "Inclinati di più in avanti prima di saltare; salta più leggero."],
      ["Anche che cedono all'atterraggio", "Attiva il core prima di saltare."],
    ],
    breath: "Espira mentre salti indietro.",
  },
  downDog: {
    setup: ["Dalla quadrupedia: mani alla larghezza delle spalle, dita aperte con il medio in avanti; ginocchia sotto le anche."],
    steps: [
      "Punta le dita dei piedi e solleva le anche in alto e indietro.",
      "Distendi le braccia e allunga la colonna dalle mani al coccige, all'inizio con le ginocchia piegate.",
      "Distendi le gambe quanto la schiena resta lunga, talloni verso il pavimento; mantieni.",
    ],
    targets: [
      "Una V rovesciata: una linea retta dalle mani alle anche.",
      "Braccia tese, orecchie tra le braccia, spalle ruotate lontano dalle orecchie.",
      "Talloni verso il pavimento — non devono toccare; le ginocchia si piegano se la schiena si arrotonda.",
    ],
    mistakes: [
      ["Arrotondare la schiena per distendere le gambe", "Piega le ginocchia e spingi le anche indietro."],
      ["Spalle incurvate alle orecchie", "Ruotale verso l'esterno e allontanale."],
      ["Peso che crolla sui polsi", "Spingi con i polpastrelli e le nocche."],
    ],
    breath: "Respiri lenti e profondi dal naso.",
  },
  dogPedal: {
    setup: ["Parti nel cane a testa in giù, anche alte, braccia tese."],
    steps: [
      "Piega un ginocchio e spingi l'altro tallone verso il pavimento.",
      "Alterna lentamente, come camminando sul posto, sentendo ogni polpaccio e femorale.",
      "Continua per il tempo indicato, poi mantieni la posizione ferma.",
    ],
    targets: [
      "Le anche restano alte e ferme — non ondeggiano da un lato all'altro.",
      "Ogni tallone a turno va verso il pavimento, con la gamba tesa.",
      "Braccia tese e spalle aperte per tutto il tempo.",
    ],
    mistakes: [
      ["Anche che ondeggiano", "Tieni le anche frontali e alte."],
      ["Pedalare veloce", "Pedalata lenta: un respiro per lato."],
      ["Braccia che si piegano mentre ti sposti", "Continua a spingere via il pavimento."],
    ],
    breath: "Respira in modo regolare; un respiro per ogni cambio di gamba.",
  },
  dolphin: {
    setup: ["Avambracci a terra, gomiti sotto le spalle e alla larghezza delle spalle; mani intrecciate o avambracci paralleli."],
    steps: [
      "Punta le dita dei piedi e solleva le anche in una V rovesciata.",
      "Avvicina i piedi ai gomiti camminando, finché la schiena resta lunga.",
      "Spingi gli avambracci a terra per sollevare le spalle; mantieni.",
    ],
    targets: [
      "Gomiti alla larghezza delle spalle — non scivolano in fuori.",
      "Spalle sollevate dal pavimento, testa staccata da terra.",
      "Schiena lunga; le ginocchia si piegano se serve.",
    ],
    mistakes: [
      ["Gomiti che scivolano in fuori", "Tieni una cinghia sopra i gomiti o stringili."],
      ["Spalle che crollano a terra", "Spingi attivamente gli avambracci in basso."],
      ["Schiena arrotondata", "Piega le ginocchia e spingi le anche in alto."],
    ],
    breath: "Respirazione lenta e regolare.",
  },
  cobra: {
    setup: ["Sdraiati a pancia in giù, mani sotto le spalle, gomiti vicini al corpo, gambe unite con il dorso dei piedi a terra."],
    steps: [
      "Premi il dorso dei piedi e il pube sul tappetino.",
      "Inspira: solleva il petto con i muscoli della schiena; le mani aiutano solo un po'.",
      "Mantieni con i gomiti piegati, poi espira e scendi.",
    ],
    targets: [
      "Gomiti piegati e stretti al corpo; le costole basse sul tappetino o vicine.",
      "Spalle basse e indietro, petto in avanti.",
      "Collo lungo — sguardo avanti e leggermente in basso.",
    ],
    mistakes: [
      ["Spingersi in alto a braccia tese", "Solleva con la schiena, tieni i gomiti piegati."],
      ["Spalle alle orecchie", "Portale in basso e indietro."],
      ["Piegare il collo indietro", "Tieni lo sguardo in avanti."],
    ],
    breath: "Inspira per salire, espira per scendere.",
  },
  locust: {
    setup: ["Sdraiati a pancia in giù, braccia lungo il corpo con i palmi in giù, gambe unite, fronte sul tappetino."],
    steps: [
      "Inspira: solleva testa, petto e braccia dal tappetino.",
      "Solleva nello stesso momento le gambe tese, allungandoti indietro con le punte.",
      "Mantieni per qualche respiro, poi espira e scendi.",
    ],
    targets: [
      "Gambe tese e sollevate dalle anche, unite o alla larghezza delle anche.",
      "Braccia che si allungano indietro lungo i fianchi, scapole avvicinate.",
      "Collo lungo: sguardo sul pavimento poco più avanti.",
    ],
    mistakes: [
      ["Piegare le ginocchia per sollevare i piedi", "Solleva meno, a gambe tese."],
      ["Piegare il collo all'indietro", "Guarda il pavimento."],
      ["Trattenere il respiro", "Respira in modo regolare nella tenuta."],
    ],
    breath: "Inspira per sollevare, respira in modo regolare nella tenuta.",
  },
  crow: {
    setup: ["Accosciato con i piedi uniti e le ginocchia larghe; mani a terra alla larghezza delle spalle, dita aperte."],
    steps: [
      "Piega i gomiti all'indietro e appoggia le ginocchia in alto sul retro delle braccia.",
      "Inclinati in avanti finché il peso è sulle mani e i piedi diventano leggeri.",
      "Stacca un piede, poi l'altro, talloni verso i glutei; mantieni, poi riappoggia piano.",
    ],
    targets: [
      "Gomiti piegati a circa 90°, sopra i polsi e stretti verso l'interno.",
      "Ginocchia che premono sulle braccia, piedi uniti.",
      "Sguardo 30 cm davanti alle mani; un cuscino davanti al viso aiuta.",
    ],
    mistakes: [
      ["Saltarci dentro", "Inclinati finché i piedi si staccano da soli."],
      ["Gomiti che si aprono", "Stringili verso l'interno."],
      ["Guardarsi le mani", "Guarda in avanti."],
    ],
    breath: "Respiri brevi e calmi.",
  },
  sideCrow: {
    setup: ["Accosciato con le ginocchia unite; ruota a destra e appoggia entrambe le mani a terra accanto all'esterno della coscia destra, alla larghezza delle spalle."],
    steps: [
      "Piega i gomiti e appoggia l'esterno della coscia sinistra sul retro del braccio sinistro.",
      "Inclinati in avanti finché i piedi si staccano.",
      "Solleva entrambi i piedi insieme, gambe sovrapposte; mantieni, poi cambia lato.",
    ],
    targets: [
      "Gomiti a 90°, sopra i polsi, come in una chaturanga.",
      "Ginocchia unite, anche appoggiate sulla mensola delle braccia.",
      "Sguardo in avanti, non in basso.",
    ],
    mistakes: [
      ["Non ruotare abbastanza", "Ruota finché la coscia è ben sopra il braccio."],
      ["Gomiti che si aprono", "Stringili verso l'interno."],
      ["Saltare con i piedi", "Inclinati finché i piedi si staccano."],
    ],
    breath: "Respiri brevi; espira mentre ti inclini.",
  },
  crowJumpBack: {
    setup: ["Parti da un crow stabile."],
    steps: [
      "Inclinati ancora un po' in avanti per alleggerire le gambe.",
      "Spara entrambe le gambe dritte indietro insieme.",
      "Atterra in chaturanga con i gomiti piegati a 90°, poi continua nel cane a testa in su.",
    ],
    targets: [
      "Atterra sugli avampiedi, gambe tese e unite.",
      "I gomiti restano piegati a 90° — le braccia non si distendono all'atterraggio.",
      "Corpo dritto in chaturanga dopo l'atterraggio.",
    ],
    mistakes: [
      ["Distendere le braccia all'atterraggio", "Tieni i gomiti piegati."],
      ["Atterrare pesante", "Inclinati di più in avanti prima."],
      ["Anche che cedono all'atterraggio", "Attiva il core prima di spararti indietro."],
    ],
    breath: "Espira mentre salti indietro.",
  },
  headstandTuck: {
    setup: ["Preparati come per la verticale sulla testa: avambracci a terra, mani intrecciate, gomiti alla larghezza delle spalle, sommità della testa a terra contro le mani."],
    steps: [
      "Solleva le anche e avvicina i piedi camminando finché le anche sono sopra le spalle.",
      "Porta le ginocchia al petto e stacca i piedi da terra.",
      "Mantieni il raccolto con la schiena verticale, poi riappoggia i piedi.",
    ],
    targets: [
      "Anche sopra le spalle prima che i piedi si stacchino.",
      "Ginocchia raccolte strette al petto.",
      "Peso soprattutto sugli avambracci, spalle sollevate da terra.",
    ],
    mistakes: [
      ["Anche dietro le spalle", "Avvicina di più i piedi."],
      ["Saltare con i piedi", "Solleva lentamente quando le anche sono allineate."],
      ["Peso che scende sul collo", "Premi gli avambracci a terra."],
    ],
    breath: "Respiri regolari.",
  },
  headstand: {
    setup: ["In uno spazio libero, con una superficie morbida attorno. Avambracci a terra, mani intrecciate, sommità della testa a terra contro le mani."],
    steps: [
      "Porta le anche sopra le spalle avvicinando i piedi.",
      "Raccogli le ginocchia al petto, poi distendi le gambe verso il soffitto.",
      "Mantieni, poi scendi allo stesso modo: raccolto, poi piedi a terra.",
    ],
    targets: [
      "Corpo verticale: caviglie, anche e spalle allineate.",
      "Avambracci che premono, spalle sollevate dal pavimento.",
      "Gambe unite, glutei e addominali attivi, costole chiuse.",
    ],
    mistakes: [
      ["Inarcare la schiena", "Attiva gli addominali e chiudi le costole."],
      ["Peso sul collo", "Premi gli avambracci a terra."],
      ["Salire con un calcio", "Sali passando dal raccolto."],
    ],
    breath: "Respiri regolari; scendi a qualsiasi fastidio al collo.",
  },
  boatPose: {
    setup: ["Seduto con le ginocchia piegate e i piedi sul tappetino; mani dietro le cosce."],
    steps: [
      "Inclinati leggermente indietro, sollevando il petto e allungando la colonna.",
      "Solleva i piedi in modo che le tibie siano parallele al pavimento (o distendi le gambe).",
      "Lascia le mani e allunga le braccia in avanti; mantieni.",
    ],
    targets: [
      "Una V tra busto e gambe; colonna lunga, petto alto.",
      "Tibie parallele al pavimento (versione piegata) o gambe a circa 45° (tese).",
      "Equilibrio sugli ischi, non sul coccige.",
    ],
    mistakes: [
      ["Schiena arrotondata", "Piega le ginocchia e solleva il petto."],
      ["Spalle incurvate", "Allontanale dalle orecchie."],
      ["Trattenere il respiro", "Respira in modo regolare."],
    ],
    breath: "Respirazione regolare.",
  },
  halfSplit: {
    setup: ["Da un affondo basso con il piede destro avanti, porta le anche indietro sopra il ginocchio sinistro; mani a terra o su blocchi accanto alla gamba davanti."],
    steps: [
      "Distendi la gamba davanti, flettendo il piede in modo che le dita guardino in alto.",
      "Tieni la schiena lunga e piegati in avanti dalle anche.",
      "Mantieni, poi cambia lato.",
    ],
    targets: [
      "Anche sopra il ginocchio dietro.",
      "Gamba davanti tesa, dita verso l'alto.",
      "Schiena piatta — la piegatura viene dalle anche.",
    ],
    mistakes: [
      ["Arrotondare la schiena", "Usa i blocchi e guida con il petto."],
      ["Anche non sopra il ginocchio dietro", "Portale indietro."],
      ["Bloccare il ginocchio davanti", "Mantieni una leggera flessione."],
    ],
    breath: "Espira per piegarti in avanti.",
  },
  lizard: {
    setup: ["Da un affondo basso con il piede destro avanti, appoggia entrambe le mani all'interno del piede destro."],
    steps: [
      "Sposta leggermente il piede destro verso destra, punte un po' in fuori.",
      "Porta le anche in avanti e in basso; scendi sugli avambracci se viene facile.",
      "Mantieni, poi cambia lato.",
    ],
    targets: [
      "Ginocchio davanti sopra la caviglia.",
      "Anche che scendono verso il pavimento; gamba dietro lunga (ginocchio su o giù).",
      "Spalle spinte lontano dal pavimento.",
    ],
    mistakes: [
      ["Ginocchio davanti che cede verso l'interno", "Lascialo aprire leggermente in fuori."],
      ["Spalle che crollano", "Spingi via il pavimento."],
      ["Forzare la profondità", "Resta sulle mani finché gli avambracci arrivano facilmente."],
    ],
    breath: "Espirazioni lunghe.",
  },
  middleSplit: {
    setup: ["In piedi con i piedi larghi, punte in avanti; mani a terra o su blocchi sotto le spalle."],
    steps: [
      "Fai scivolare i piedi in fuori pochi centimetri alla volta, tenendo il peso sulle mani.",
      "Tieni le anche in linea con i piedi e le punte rivolte in avanti o in alto.",
      "Scendi sugli avambracci solo se le anche restano in linea; mantieni, poi avvicina i piedi per uscire.",
    ],
    targets: [
      "Ginocchia e punte rivolte in alto o in avanti — mai ruotate verso l'interno.",
      "Anche in linea con i talloni, non sedute dietro di essi.",
      "Schiena lunga, l'allungamento lungo l'interno coscia, non nelle ginocchia.",
    ],
    mistakes: [
      ["Ginocchia che ruotano verso l'interno", "Porta le punte in alto e attiva le cosce."],
      ["Anche che arretrano per scendere di più", "Spingile in avanti anche se resti più in alto."],
      ["Lasciar cadere il peso nell'allungamento", "Tieni le mani a reggere parte del peso."],
    ],
    breath: "Espirazioni lunghe; rilassa l'interno coscia a ognuna.",
  },
  wideFold: {
    setup: ["In piedi con i piedi a circa 1–1,2 m di distanza, bordi esterni paralleli; mani sui fianchi."],
    steps: [
      "Inspira e solleva il petto; espira e piegati in avanti dalle anche con la schiena lunga.",
      "Porta le mani a terra sotto le spalle, dita in linea con le punte dei piedi.",
      "Piega i gomiti all'indietro e scendi di più, sommità della testa verso il pavimento; mantieni.",
    ],
    targets: [
      "Piedi paralleli, bordi esterni in linea, peso sugli avampiedi quanto sui talloni.",
      "Anche sopra le caviglie — senza sbilanciarti indietro.",
      "La piegatura viene dalle anche; la schiena resta lunga, gomiti sopra i polsi.",
    ],
    mistakes: [
      ["Piedi ruotati in fuori", "Rendi paralleli i bordi esterni."],
      ["Arrotondare la schiena per portare giù la testa", "Mani sui blocchi, guida con il petto."],
      ["Peso che affonda nei talloni", "Porta le anche leggermente in avanti."],
    ],
    breath: "Inspira per allungarti, espira per piegarti di più.",
  },
  headToKnee: {
    setup: ["Seduto con la gamba sinistra tesa; piega il ginocchio destro e appoggia la pianta destra all'interno della coscia sinistra. Siediti su un cuscino se la schiena si arrotonda."],
    steps: [
      "Ruota il petto verso la gamba tesa, la pancia sopra la coscia.",
      "Inspira e allungati; espira e piegati in avanti sopra la gamba dalle anche.",
      "Afferra tibia, caviglia o piede; mantieni, poi cambia lato.",
    ],
    targets: [
      "Petto centrato sopra la gamba tesa, la pancia che va prima verso la coscia.",
      "Gamba tesa attiva: rotula in su, piede a martello.",
      "Ginocchio piegato appoggiato di lato a circa 90° dalla gamba tesa.",
    ],
    mistakes: [
      ["Arrotondare la parte alta della schiena per arrivare al piede", "Afferra la tibia; guida con il petto."],
      ["Petto che ruota lontano dalla gamba", "Porta il busto sopra la gamba tesa."],
      ["Forzare la piegatura", "Respira e lascia che arrivi."],
    ],
    breath: "Inspira per allungarti, espira per piegarti un po' di più.",
  },
  butterfly: {
    setup: ["Seduto con le piante dei piedi unite e le ginocchia aperte; siediti su un cuscino se la zona lombare si arrotonda."],
    steps: [
      "Afferra piedi o caviglie e siediti dritto.",
      "Lascia scendere le ginocchia verso il pavimento con il loro peso.",
      "Per allungare di più, piegati in avanti dalle anche con la colonna lunga; mantieni.",
    ],
    targets: [
      "Colonna dritta, peso sulla parte anteriore degli ischi.",
      "Ginocchia rilassate di lato — le porta giù la gravità, non la pressione.",
      "Piedi più vicini alle anche per l'interno coscia, più lontani per anche e schiena.",
    ],
    mistakes: [
      ["Schiena ingobbita", "Siediti su un cuscino e allungati."],
      ["Spingere le ginocchia giù con le mani", "Lasciale scendere da sole."],
      ["Far molleggiare le ginocchia", "Resta fermo e respira."],
    ],
    breath: "Respiri lenti e profondi nella pancia.",
  },
  childsPose: {
    setup: ["In ginocchio con gli alluci uniti; ginocchia unite (allungamento della schiena) o larghe (anche e spalle)."],
    steps: [
      "Porta le anche indietro verso i talloni.",
      "Piegati in avanti e appoggia la fronte sul tappetino (o su un cuscino).",
      "Allunga le braccia in avanti o appoggiale lungo il corpo; rilassati e mantieni.",
    ],
    targets: [
      "Anche che scendono verso i talloni.",
      "Fronte appoggiata, collo rilassato.",
      "Spalle morbide; la schiena si allarga a ogni respiro.",
    ],
    mistakes: [
      ["Forzare le anche verso il basso", "Metti un cuscino tra talloni e anche."],
      ["Spalle tese alle orecchie", "Appoggia invece le braccia lungo i fianchi."],
      ["Trattenere il respiro", "Respira nella parte posteriore delle costole."],
    ],
    breath: "Respiri lunghi e lenti nella parte posteriore delle costole.",
  },
};
