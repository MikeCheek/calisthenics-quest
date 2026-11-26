import type { GuideTable } from "../index";

// Yoga: saluti al sole, backbend, equilibri in piedi, anche.
export const YOGA: GuideTable = {
  halfSun: {
    setup: ["In piedi all'inizio del tappetino, piedi alla larghezza delle anche, braccia lungo i fianchi (posizione della montagna)."],
    steps: [
      "Inspira: porta le braccia in alto sopra la testa.",
      "Espira: piegati dalle anche e scendi in avanti.",
      "Inspira: risali a metà, schiena piatta, mani sulle tibie.",
      "Espira: piegati; inspira: risali fino in piedi con le braccia in alto; espira: mani al petto.",
    ],
    targets: [
      "Piegati dalle anche, non dalla vita; piega le ginocchia quanto serve.",
      "A metà: schiena piatta, busto circa parallelo al pavimento.",
      "Un movimento per ogni respiro.",
    ],
    mistakes: [
      ["Schiena arrotondata a metà salita", "Mani più in alto sulle tibie, petto in avanti."],
      ["Ginocchia bloccate nella piegatura", "Ammorbidiscile."],
      ["Muoversi più veloce del respiro", "Lascia che sia il respiro a guidare."],
    ],
    breath: "Un movimento per ogni respiro: inspira per salire, espira per piegarti.",
  },
  sunA: {
    setup: ["In piedi all'inizio del tappetino nella posizione della montagna."],
    steps: [
      "Inspira braccia in alto; espira piegati; inspira risali a metà.",
      "Espira, fai un passo o salta indietro e scendi in chaturanga.",
      "Inspira cane a testa in su (o cobra); espira cane a testa in giù per 5 respiri.",
      "Passo o salto in avanti, risalita a metà, piegatura, sali in piedi e torna alla montagna.",
    ],
    targets: [
      "Chaturanga: gomiti a 90°, stretti alle costole, corpo dritto.",
      "Cane a testa in su: braccia tese, cosce staccate da terra, spalle basse.",
      "Cane a testa in giù: anche alte, una linea retta dalle mani alle anche.",
    ],
    mistakes: [
      ["Anche che crollano nella chaturanga", "Appoggia le ginocchia se serve."],
      ["Spalle alle orecchie nel cane a testa in su", "Spingi in basso e porta le spalle indietro."],
      ["Andare di fretta", "Un movimento per ogni respiro."],
    ],
    breath: "Un movimento per ogni respiro; cinque respiri nel cane a testa in giù.",
  },
  sunB: {
    setup: ["In piedi all'inizio del tappetino nella posizione della montagna."],
    steps: [
      "Inspira: posizione della sedia con le braccia in alto; espira: piegati in avanti.",
      "Risalita a metà, poi indietro e giù in chaturanga, poi cane a testa in su, poi cane a testa in giù.",
      "Porta avanti il piede destro in warrior I; passa per il vinyasa; ripeti a sinistra.",
      "Cane a testa in giù per 5 respiri, poi avanti fino alla sedia e in piedi.",
    ],
    targets: [
      "Sedia: ginocchia piegate a circa 90–120°, peso sui talloni, braccia vicino alle orecchie.",
      "Warrior I: ginocchio davanti sopra la caviglia, tallone dietro a terra a 45°, anche in avanti.",
      "Il vinyasa come nel saluto al sole A.",
    ],
    mistakes: [
      ["Ginocchia oltre le punte nella sedia", "Siediti più indietro."],
      ["Tallone dietro sollevato nel warrior I", "Accorcia la posizione."],
      ["Andare di fretta", "È il respiro a guidare il movimento."],
    ],
    breath: "Un movimento per ogni respiro.",
  },
  camel: {
    setup: ["In ginocchio con le ginocchia alla larghezza delle anche, tibie e dorso dei piedi sul tappetino; mani sulla zona lombare, dita verso il basso."],
    steps: [
      "Premi le tibie a terra e spingi le anche in avanti finché sono sopra le ginocchia.",
      "Solleva prima il petto, poi inarcati indietro tenendo il mento leggermente raccolto.",
      "Se è comodo, porta le mani una alla volta ai talloni (punte dei piedi puntate per alzare i talloni).",
      "Risali lentamente: mani di nuovo sulla zona lombare, guida con il petto, la testa sale per ultima.",
    ],
    targets: [
      "Anche sopra le ginocchia: le cosce restano verticali.",
      "La flessione è distribuita nella parte alta della schiena, non schiacciata nella zona lombare.",
      "Collo lungo — lascia andare la testa indietro solo se è facile.",
    ],
    mistakes: [
      ["Anche che arretrano verso i talloni", "Stringi i glutei e spingi le anche in avanti."],
      ["Piegarsi solo nella zona lombare", "Solleva lo sterno prima di andare indietro."],
      ["Uscire di colpo con la testa per prima", "Mani alla schiena, guida il petto, testa per ultima."],
    ],
    breath: "Inspira per sollevare il petto, respira in modo regolare nella posizione; espira mentre risali.",
  },
  wheelPrep: {
    setup: ["Sdraiati sulla schiena, piedi alla larghezza delle anche e appoggiati vicino ai glutei; mani accanto alle orecchie, dita verso le spalle, gomiti in alto."],
    steps: [
      "Spingi sui piedi per sollevare le anche.",
      "Spingi sulle mani e solleva le spalle, poi appoggia leggermente la sommità della testa sul tappetino.",
      "Mantieni con i gomiti paralleli, poi abbassa la testa, poi la schiena, lentamente.",
    ],
    targets: [
      "Gomiti alla larghezza delle spalle e paralleli, rivolti al soffitto — non aperti.",
      "La maggior parte del peso su mani e piedi; la testa tocca appena.",
      "Piedi e ginocchia paralleli, alla larghezza delle anche.",
    ],
    mistakes: [
      ["Gomiti molto aperti", "Avvicinali l'uno all'altro."],
      ["Troppo peso su testa e collo", "Spingi le mani a terra per alleggerire la testa."],
      ["Ginocchia e piedi ruotati in fuori", "Tieni i piedi paralleli, ginocchia sopra le caviglie."],
    ],
    breath: "Respira in modo regolare; inspira per salire, espira per scendere.",
  },
  bow: {
    setup: ["Sdraiati a pancia in giù; piega le ginocchia e afferra l'esterno delle caviglie, ginocchia alla larghezza delle anche."],
    steps: [
      "Spingi i piedi indietro dentro le mani.",
      "Lascia che questa spinta sollevi petto e cosce dal tappetino.",
      "Mantieni, poi rilascia lentamente le caviglie e scendi.",
    ],
    targets: [
      "Braccia tese: il sollevamento viene dalle gambe che spingono, non dalle braccia che tirano.",
      "Ginocchia non più larghe delle anche.",
      "Petto aperto, spalle indietro, sguardo avanti.",
    ],
    mistakes: [
      ["Ginocchia molto aperte", "Tienile alla larghezza delle anche; usa una cinghia se serve."],
      ["Tirare a braccia piegate", "Distendi le braccia e spingi i piedi nelle mani."],
      ["Trattenere il respiro", "Respira nella parte posteriore delle costole — il corpo dondolerà leggermente."],
    ],
    breath: "Inspira per sollevare, respira in modo regolare nella posizione.",
  },
  tree: {
    setup: ["In piedi sulla gamba sinistra, peso distribuito su tutto il piede, un punto fisso davanti a te per lo sguardo."],
    steps: [
      "Appoggia il piede destro all'interno del polpaccio o della coscia sinistra, dita verso il basso.",
      "Premi piede e gamba l'uno contro l'altra e apri il ginocchio destro di lato.",
      "Porta le mani al petto o sopra la testa; mantieni, poi cambia gamba.",
    ],
    targets: [
      "Il piede sta sopra o sotto il ginocchio — mai premuto sull'articolazione.",
      "Anche allo stesso livello e rivolte in avanti; la gamba d'appoggio tesa ma non bloccata.",
      "Il ginocchio piegato si apre di circa 90° dalla gamba d'appoggio, quanto l'anca permette.",
    ],
    mistakes: [
      ["Piede premuto sul ginocchio", "Spostalo sul polpaccio o sulla coscia."],
      ["Anca della gamba d'appoggio che sporge", "Allungati e riporta l'anca dentro."],
      ["Guardarsi attorno", "Tieni lo sguardo su un punto fermo."],
    ],
    breath: "Respiri lenti dal naso; un respiro calmo mantiene l'equilibrio.",
  },
  warrior2: {
    setup: ["In piedi con i piedi a circa 1–1,2 m di distanza; piede davanti rivolto in avanti, piede dietro parallelo al fondo del tappetino."],
    steps: [
      "Piega il ginocchio davanti finché è sopra la caviglia.",
      "Solleva le braccia di lato all'altezza delle spalle, palmi in giù.",
      "Gira la testa e guarda oltre le dita della mano davanti; mantieni, poi cambia lato.",
    ],
    targets: [
      "Ginocchio davanti a circa 90°, esattamente sopra la caviglia, rivolto verso il secondo dito.",
      "Tallone davanti allineato con l'arco del piede dietro; gamba dietro tesa.",
      "Busto dritto e centrato tra le gambe, braccia su una linea parallela al pavimento.",
    ],
    mistakes: [
      ["Ginocchio davanti che cede verso l'interno", "Spingilo verso il mignolo del piede."],
      ["Busto che si sporge sulla gamba davanti", "Allinea le spalle sopra le anche."],
      ["Spalle che salgono verso le orecchie", "Rilassale; allungati con le dita."],
    ],
    breath: "Respiri regolari; senti lavorare le gambe a ogni espirazione.",
  },
  warrior3: {
    setup: ["In piedi su una gamba con il ginocchio morbido; braccia avanti o lungo i fianchi."],
    steps: [
      "Piegati in avanti dalle anche, sollevando l'altra gamba tesa dietro di te.",
      "Continua finché busto e gamba sollevata sono paralleli al pavimento.",
      "Mantieni la forma a T, poi risali lentamente e cambia lato.",
    ],
    targets: [
      "Mani, busto e gamba sollevata su un'unica linea orizzontale.",
      "Anche parallele al pavimento: le dita della gamba sollevata guardano in basso.",
      "Ginocchio d'appoggio leggermente piegato (circa 10°) invece che bloccato.",
    ],
    mistakes: [
      ["Anca della gamba sollevata che si apre", "Punta quelle dita verso il pavimento."],
      ["Schiena arrotondata", "Allunga il petto in avanti, schiena piatta."],
      ["Ginocchio d'appoggio bloccato", "Mantieni una leggera flessione."],
    ],
    breath: "Respiri regolari; allungati avanti e indietro a ogni espirazione.",
  },
  eagle: {
    setup: ["In piedi con i piedi uniti e piega le ginocchia come in un piccolo squat."],
    steps: [
      "Incrocia la coscia destra sopra la sinistra; aggancia il piede destro dietro il polpaccio sinistro se ci arriva.",
      "Incrocia il braccio sinistro sopra il destro all'altezza dei gomiti e unisci i palmi.",
      "Scendi di più e solleva i gomiti; mantieni, poi cambia lato.",
    ],
    targets: [
      "Ginocchia piegate di circa 45° e allineate sopra il piede d'appoggio.",
      "Gomiti sollevati all'altezza delle spalle, avambracci verticali.",
      "Anche frontali e busto dritto.",
    ],
    mistakes: [
      ["Stare troppo dritti", "Scendi di più — l'equilibrio diventa più facile."],
      ["Spalle incurvate verso l'alto", "Solleva i gomiti, abbassa le spalle."],
      ["Perdere l'equilibrio", "Fissa lo sguardo; le dita del piede di sopra possono appoggiare a terra."],
    ],
    breath: "Respira nella parte posteriore delle costole, che in questa posizione si allunga.",
  },
  halfMoon: {
    setup: ["Dal warrior II a destra, porta la mano sinistra sul fianco; un blocco sotto la mano destra aiuta."],
    steps: [
      "Piega il ginocchio davanti e porta la mano destra 30 cm davanti al piede davanti (a terra o sul blocco).",
      "Distendi la gamba davanti mentre sollevi la gamba dietro all'altezza dell'anca.",
      "Sovrapponi le anche e apri il braccio sinistro verso il soffitto; mantieni, poi cambia lato.",
    ],
    targets: [
      "Gamba sollevata parallela al pavimento, piede a martello, dita rivolte in avanti.",
      "Anca superiore sopra quella inferiore, petto aperto di lato.",
      "Braccia su un'unica linea verticale, mano inferiore sotto la spalla.",
    ],
    mistakes: [
      ["Anche e petto che si girano verso il pavimento", "Apri anca superiore e petto verso il soffitto."],
      ["Appoggiarsi pesantemente sulla mano di sotto", "Usa un blocco e tieni il peso sulla gamba d'appoggio."],
      ["Gamba sollevata che scende", "Portala all'altezza dell'anca e allungati attraverso il tallone."],
    ],
    breath: "Respiri regolari, all'inizio con lo sguardo a terra.",
  },
  dancer: {
    setup: ["In piedi sulla gamba sinistra; piega il ginocchio destro e afferra l'interno del piede destro con la mano destra."],
    steps: [
      "Allunga il braccio sinistro avanti e in alto.",
      "Spingi il piede destro indietro dentro la mano e lascia inclinare il busto in avanti.",
      "Mantieni, poi risali e cambia lato.",
    ],
    targets: [
      "Il sollevamento viene dalla gamba che spinge indietro nella mano.",
      "Anche il più possibile frontali; il ginocchio della gamba sollevata non si apre.",
      "Gamba d'appoggio tesa, petto alto e aperto.",
    ],
    mistakes: [
      ["Anca della gamba sollevata che si apre", "Riporta il ginocchio verso la linea centrale."],
      ["Petto che crolla verso il pavimento", "Prima spingi indietro, poi inclinati."],
      ["Ginocchio d'appoggio irrigidito", "Teso, non bloccato."],
    ],
    breath: "Respiri regolari; a ogni espirazione spingi un po' di più.",
  },
  standingSplit: {
    setup: ["In piedi all'inizio del tappetino e piegati in avanti, mani a terra o sui blocchi."],
    steps: [
      "Sposta il peso su una gamba.",
      "Solleva l'altra gamba tesa dietro di te il più in alto possibile.",
      "Avvicina le mani al piede e lascia scendere il busto verso la gamba d'appoggio; mantieni, poi cambia.",
    ],
    targets: [
      "Anche frontali: le dita della gamba sollevata guardano in basso, non di lato.",
      "Entrambe le gambe tese, il ginocchio d'appoggio non bloccato.",
      "Busto che si piega verso la gamba d'appoggio.",
    ],
    mistakes: [
      ["Aprire l'anca per salire di più", "Tieni le anche frontali anche se la gamba è più bassa."],
      ["Piegare molto la gamba d'appoggio", "Distendila, usando i blocchi sotto le mani."],
      ["Forzare l'altezza", "L'altezza arriva con il tempo, insieme ai femorali."],
    ],
    breath: "Espira per piegarti più a fondo.",
  },
  handToToe: {
    setup: ["In piedi sulla gamba sinistra; aggancia l'alluce destro con le prime due dita della mano destra (o usa una cinghia)."],
    steps: [
      "Stai dritto con la mano sinistra sul fianco.",
      "Distendi la gamba destra in avanti, il più tesa possibile.",
      "Mantieni, eventualmente apri la gamba di lato; poi cambia.",
    ],
    targets: [
      "Gamba d'appoggio tesa e busto dritto.",
      "Gamba distesa tesa, se possibile all'altezza dell'anca.",
      "Anche allo stesso livello: l'anca della gamba sollevata non sale.",
    ],
    mistakes: [
      ["Arrotondare la schiena per arrivare all'alluce", "Piega il ginocchio o usa una cinghia."],
      ["Anca della gamba sollevata che sale", "Abbassala, allo stesso livello dell'altra."],
      ["Perdere l'equilibrio", "Fissa lo sguardo su un punto."],
    ],
    breath: "Respiri lenti mantengono l'equilibrio.",
  },
  garland: {
    setup: ["Piedi poco più larghi delle anche, punte ruotate in fuori di circa 45°."],
    steps: [
      "Accosciati fino in fondo con i talloni a terra (su un asciugamano arrotolato se si alzano).",
      "Unisci i palmi al petto, gomiti all'interno delle ginocchia.",
      "Premi i gomiti contro le ginocchia e solleva il petto; mantieni.",
    ],
    targets: [
      "Anche sotto le ginocchia, talloni a terra.",
      "Ginocchia in linea con le punte, aperte verso l'esterno.",
      "Colonna lunga e petto alto.",
    ],
    mistakes: [
      ["Talloni che si alzano", "Arrotola un asciugamano sotto i talloni."],
      ["Schiena arrotondata", "Premi i gomiti in fuori e solleva il petto."],
      ["Ginocchia che cedono verso l'interno", "Spingile in fuori con i gomiti."],
    ],
    breath: "Respira nella pancia e nella zona lombare.",
  },
  figureFour: {
    setup: ["Sdraiati sulla schiena con le ginocchia piegate e i piedi a terra."],
    steps: [
      "Incrocia la caviglia destra sopra il ginocchio sinistro.",
      "Solleva il piede sinistro e afferra il retro della coscia sinistra.",
      "Tira la coscia sinistra verso di te finché l'anca destra si allunga; mantieni, poi cambia.",
    ],
    targets: [
      "Caviglia destra a martello per proteggere il ginocchio.",
      "Ginocchio destro che si apre di lato.",
      "Testa e spalle a terra.",
    ],
    mistakes: [
      ["Piede incrociato in punta", "Fletti il piede per proteggere il ginocchio."],
      ["Sollevare testa e spalle", "Usa una cinghia attorno alla coscia."],
      ["Tirare troppo", "Un allungamento leggero in cui riesci a respirare."],
    ],
    breath: "Espirazioni lunghe per lasciar rilassare l'anca.",
  },
  happyBaby: {
    setup: ["Sdraiati sulla schiena e porta le ginocchia verso le ascelle."],
    steps: [
      "Afferra l'esterno dei piedi (o le tibie).",
      "Allinea le caviglie sopra le ginocchia, piante verso il soffitto.",
      "Tira dolcemente le ginocchia verso il pavimento; mantieni, dondolando leggermente se ti piace.",
    ],
    targets: [
      "Tibie verticali, piante rivolte al soffitto.",
      "Ginocchia più larghe del busto.",
      "Zona lombare e testa rilassate a terra.",
    ],
    mistakes: [
      ["Coccige che si stacca", "Tira meno; tieni l'osso sacro giù."],
      ["Testa che si solleva", "Afferra le tibie invece dei piedi."],
      ["Tensione nelle spalle", "Rilassale a terra."],
    ],
    breath: "Respirazione lenta nella pancia.",
  },
  supineTwist: {
    setup: ["Sdraiati sulla schiena con le braccia aperte a T."],
    steps: [
      "Piega le ginocchia e portale verso il petto.",
      "Abbassa entrambe le ginocchia da un lato.",
      "Gira la testa dall'altra parte se è comodo; mantieni, poi cambia.",
    ],
    targets: [
      "Entrambe le spalle restano a terra.",
      "Ginocchia sovrapposte all'incirca all'altezza delle anche.",
      "Torsione distribuita su tutta la colonna.",
    ],
    mistakes: [
      ["Spalla opposta che si stacca", "Porta le ginocchia meno lontano o mettici sotto un cuscino."],
      ["Forzare le ginocchia a terra", "Lascia fare alla gravità."],
      ["Trattenere il respiro", "Respira lentamente."],
    ],
    breath: "Espirazioni lunghe per entrare nella torsione.",
  },
  crowPrep: {
    setup: ["Accosciato sugli avampiedi, ginocchia larghe; mani a terra alla larghezza delle spalle davanti a te, dita aperte."],
    steps: [
      "Piega i gomiti all'indietro e appoggia le ginocchia sul retro delle braccia.",
      "Inclinati in avanti finché il peso passa sulle mani.",
      "Tieni le punte dei piedi a terra; dondola avanti e indietro per sentire l'equilibrio.",
    ],
    targets: [
      "Gomiti piegati a circa 90°, stretti, sopra i polsi.",
      "Spalle che si portano davanti alle mani.",
      "Sguardo 30 cm davanti alle mani.",
    ],
    mistakes: [
      ["Guardarsi le mani", "Guarda in avanti."],
      ["Gomiti che si aprono", "Stringili verso l'interno."],
      ["Inclinarsi troppo poco", "Porta le spalle oltre la punta delle dita."],
    ],
    breath: "Respiri regolari.",
  },
  headstandWall: {
    setup: ["In ginocchio di fronte a un muro; avambracci a terra, mani intrecciate a circa 10 cm dal muro, gomiti alla larghezza delle spalle."],
    steps: [
      "Appoggia la sommità della testa a terra, la nuca contro le mani.",
      "Solleva le anche e avvicina i piedi camminando finché le anche sono sopra le spalle.",
      "Solleva una gamba, poi l'altra, appoggiando i talloni al muro; mantieni, poi scendi lentamente.",
    ],
    targets: [
      "La maggior parte del peso sugli avambracci, non sulla testa.",
      "Spalle sollevate, lontane dalle orecchie.",
      "Corpo verticale, una linea retta dalla testa ai piedi.",
    ],
    mistakes: [
      ["Peso sul collo", "Premi gli avambracci a terra."],
      ["Gomiti che si aprono", "Tienili alla larghezza delle spalle."],
      ["Salire con un calcio", "Avvicina i piedi camminando e solleva."],
    ],
    breath: "Respiri lenti; scendi al primo segno di fastidio al collo.",
  },
};
