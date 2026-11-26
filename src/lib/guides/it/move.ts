import type { GuideTable } from "../index";

// Acrobatica, ponti, get-up, riscaldamento e mobilità.
export const MOVE: GuideTable = {
  kipUp: {
    setup: ["Sdraiati sulla schiena su un tappetino; mani accanto alle orecchie, palmi in giù, dita rivolte verso le spalle."],
    steps: [
      "Rotola indietro sulle spalle, portando le ginocchia verso il viso e le anche sopra la testa.",
      "Calcia le gambe in alto e in avanti in modo esplosivo spingendo forte con le mani.",
      "Inarca la schiena in volo e porta i talloni sotto le anche.",
      "Atterra sui piedi in uno squat profondo, poi alzati.",
    ],
    targets: [
      "Il calcio va in alto e in avanti a circa 45°, non dritto davanti.",
      "Le mani spingono il pavimento nello stesso istante in cui le gambe calciano.",
      "I piedi atterrano sotto le anche con le ginocchia piegate a circa 90°.",
    ],
    mistakes: [
      ["Calciare dritto in avanti e ricadere sulla schiena", "Calcia prima verso il soffitto, poi in avanti."],
      ["Nessuna spinta delle mani", "Spingi via il pavimento mentre le gambe calciano."],
      ["Piedi che atterrano troppo avanti", "Inarcati e porta i talloni sotto di te in volo."],
    ],
    breath: "Inspira mentre rotoli indietro, espira con forza nel calcio.",
  },
  backFlip: {
    setup: ["Impara con un allenatore o un assistente, prima su trampolino o materasso morbido. In piedi dritto, piedi alla larghezza delle anche, braccia in alto."],
    steps: [
      "Porta le braccia in basso e indietro piegando le ginocchia in un quarto di squat.",
      "Salta dritto verso l'alto, slanciando le braccia oltre le orecchie.",
      "In alto porta le ginocchia al petto e afferra le tibie: la rotazione viene dal raccoglimento.",
      "Cerca il pavimento con lo sguardo, apri il raccoglimento e atterra a ginocchia piegate.",
    ],
    targets: [
      "Prima salta in alto, non indietro: le anche salgono sopra l'altezza di partenza prima del raccoglimento.",
      "Raccoglimento stretto: ginocchia al petto, mani sulle tibie, mento neutro.",
      "Atterra su entrambi i piedi con le anche sopra i piedi e le ginocchia piegate a circa 90°.",
    ],
    mistakes: [
      ["Buttare la testa indietro troppo presto", "Salta alto prima, poi porta le ginocchia a te."],
      ["Aprire il raccoglimento troppo tardi", "Apri appena vedi il pavimento."],
      ["Provarlo subito su terreno duro", "Superficie morbida e assistente finché non è costante."],
    ],
    breath: "Inspira con lo slancio delle braccia, espira mentre atterri.",
  },
  frontFlip: {
    setup: ["Impara con un allenatore o un assistente, su una superficie morbida. Fai qualche passo di rincorsa o parti in piedi, dritto."],
    steps: [
      "Fai un passo saltato per uno stacco a due piedi con le braccia che si allungano in alto.",
      "Salta in alto, poi porta le braccia in basso e le anche in alto dietro di te per iniziare la rotazione.",
      "Raccogliti stretto, afferrando le tibie.",
      "Apri quando vedi il pavimento e atterra a ginocchia piegate, braccia avanti.",
    ],
    targets: [
      "Stacco verso l'alto: il corpo è verticale nel momento in cui i piedi lasciano il pavimento.",
      "Le anche salgono sopra la testa durante la rotazione — è questo che ti fa girare.",
      "Raccoglimento stretto e rotondo; atterraggio su entrambi i piedi con le ginocchia piegate a circa 90°.",
    ],
    mistakes: [
      ["Tuffarsi in avanti invece di saltare in alto", "Prima salta in alto, poi ruota."],
      ["Raccoglimento largo che ruota lentamente", "Afferra le tibie e porta le ginocchia al petto."],
      ["Atterrare a gambe tese", "Piega le ginocchia per assorbire l'atterraggio."],
    ],
    breath: "Inspira allo stacco, espira mentre atterri.",
  },
  diveRoll: {
    setup: ["Materasso morbido o prato. In piedi con le braccia avanti; impara prima una capovolta in avanti partendo accosciato."],
    steps: [
      "Salta in avanti e leggermente in alto, allungando le mani verso il materasso.",
      "Piega i gomiti quando le mani toccano per assorbire il peso.",
      "Porta il mento al petto e rotola sulla parte posteriore delle spalle, non sulla testa.",
      "Rotola lungo la schiena arrotondata e torna in piedi.",
    ],
    targets: [
      "Toccano prima le mani, alla larghezza delle spalle, e i gomiti si piegano per frenarti.",
      "Toccano la nuca e le spalle — mai la sommità della testa.",
      "Schiena rotonda per tutta la capovolta, ginocchia che arrivano al petto alla fine.",
    ],
    mistakes: [
      ["Atterrare sulla sommità della testa", "Porta il mento al petto prima che le mani tocchino."],
      ["Braccia tese e bloccate all'atterraggio", "Piega i gomiti per ammortizzare."],
      ["Schiena piatta che sbatte sul materasso", "Resta rotondo come una palla."],
    ],
    breath: "Espira durante la capovolta.",
  },
  getUp: {
    setup: ["Sdraiati sulla schiena con il braccio destro teso in alto (con un peso leggero solo se la versione lo chiede), ginocchio destro piegato con il piede a terra, braccio e gamba sinistri aperti a 45°."],
    steps: [
      "Spingi con il piede destro e ruota sul gomito sinistro, poi sulla mano sinistra.",
      "Solleva le anche a ponte, porta la gamba sinistra sotto di te e appoggia il ginocchio sinistro.",
      "Raddrizza il busto in un affondo in ginocchio, poi alzati in piedi (fermati in ginocchio nella half get-up).",
      "Ripercorri lentamente ogni passaggio per tornare giù.",
    ],
    targets: [
      "Il braccio in alto resta teso e verticale, polso dritto, per tutto il tempo.",
      "Sguardo sulla mano in alto finché sei in ginocchio, poi in avanti.",
      "Ogni passaggio separato e stabile — una pausa in ogni posizione.",
    ],
    mistakes: [
      ["Braccio in alto che si piega o si sposta", "Bloccalo e tieni le nocche verso il soffitto."],
      ["Fondere i passaggi in fretta", "Pausa di un secondo a ogni passaggio."],
      ["Troppo peso troppo presto", "Impara tutta la sequenza senza peso o con una scarpa sul pugno."],
    ],
    breath: "Espira a ogni sforzo, inspira a ogni pausa.",
  },
  bridge: {
    setup: ["Sdraiati sulla schiena, piedi alla larghezza delle anche e appoggiati vicino ai glutei; mani accanto alle orecchie, dita verso le spalle, gomiti in alto."],
    steps: [
      "Spingi su mani e piedi per sollevare le anche, poi la testa.",
      "Distendi le braccia e spingi il petto verso il muro dietro le mani.",
      "Mantieni (o cammina con le mani, solleva una gamba o passa seduto, come chiede la versione).",
      "Porta il mento al petto e appoggia lentamente la schiena.",
    ],
    targets: [
      "Braccia tese, spalle che vanno il più possibile sopra i polsi.",
      "Anche alte; la flessione divisa tra parte alta della schiena e spalle.",
      "Piedi appoggiati e paralleli, ginocchia che non si aprono.",
    ],
    mistakes: [
      ["Gomiti piegati", "Spingi via il pavimento; lavora prima al muro."],
      ["Spingere solo con le gambe", "Apri le spalle, petto verso il muro."],
      ["Piedi troppo lontani dalle mani", "Avvicinali gradualmente."],
    ],
    breath: "Respira in modo regolare; non trattenere il fiato nell'arco.",
  },
  shoulderOpening: {
    setup: ["In ginocchio davanti a una panca, un box o un muro; appoggia le mani (o gli avambracci), braccia tese, alla larghezza delle spalle."],
    steps: [
      "Arretra con le ginocchia finché le anche sono sopra le ginocchia.",
      "Lascia scendere il petto verso il pavimento tra le braccia.",
      "Mantieni l'allungamento, poi risali lentamente.",
    ],
    targets: [
      "Braccia tese, bicipiti vicino alle orecchie.",
      "L'allungamento è nelle ascelle e nella parte anteriore delle spalle.",
      "Costole chiuse: scende il petto, non la zona lombare.",
    ],
    mistakes: [
      ["Piegare le braccia", "Tieni i gomiti tesi."],
      ["Cedere solo nella zona lombare", "Chiudi le costole e lascia scendere il petto."],
      ["Forzare con molleggi", "Scendi dolcemente e respira."],
    ],
    breath: "Espira mentre il petto scende, inspira nella tenuta.",
  },
  shoulderDislocates: {
    setup: ["Tieni un elastico o un bastone davanti alle cosce con una presa larga (inizia molto larga)."],
    steps: [
      "Solleva le braccia tese sopra la testa.",
      "Continua dietro il corpo finché l'elastico tocca la zona lombare.",
      "Torna allo stesso modo davanti.",
    ],
    targets: [
      "Gomiti tesi per tutto il cerchio.",
      "Presa abbastanza larga da passare senza dolore e senza piegarsi.",
      "Costole chiuse: la schiena non si inarca quando le braccia passano sopra.",
    ],
    mistakes: [
      ["Piegare i gomiti per passare", "Allarga la presa."],
      ["Inarcare la schiena", "Chiudi le costole e stringi i glutei."],
      ["Cerchi affrettati", "Lenti e fluidi, 2–3 s per direzione."],
    ],
    breath: "Inspira mentre le braccia salgono, espira mentre passano dietro.",
  },
  pullApart: {
    setup: ["In piedi, dritto, con un elastico all'altezza delle spalle, braccia tese davanti, mani alla larghezza delle spalle."],
    steps: [
      "Apri l'elastico portando le braccia di lato.",
      "Stringi le scapole quando l'elastico tocca il petto.",
      "Torna lentamente all'inizio.",
    ],
    targets: [
      "Braccia tese e all'altezza delle spalle per tutto il tempo.",
      "Scapole strette indietro e in basso alla fine.",
      "Costole chiuse: nessun arco per aiutarsi.",
    ],
    mistakes: [
      ["Alzare le spalle", "Spalle basse, collo lungo."],
      ["Piegare i gomiti", "Usa un elastico più leggero e tienili tesi."],
      ["Inarcare la zona lombare", "Costole chiuse, glutei leggermente contratti."],
    ],
    breath: "Espira mentre apri, inspira mentre torni.",
  },
  armCircles: {
    setup: ["In piedi, dritto, piedi alla larghezza delle anche, braccia tese di lato all'altezza delle spalle."],
    steps: [
      "Disegna piccoli cerchi in avanti, ingrandendoli un po' ogni pochi giri.",
      "Dopo 10–15, inverti il senso.",
      "Chiudi con qualche cerchio grande e lento in ogni direzione.",
    ],
    targets: [
      "Braccia tese, dita che si allungano verso l'esterno.",
      "Spalle basse, lontane dalle orecchie.",
      "I cerchi crescono gradualmente fino alla piena ampiezza della spalla.",
    ],
    mistakes: [
      ["Alzare le spalle", "Tieni le spalle basse."],
      ["Cerchi enormi e veloci subito", "Parti piccolo e aumenta."],
      ["Piegare i gomiti", "Tieni le braccia lunghe."],
    ],
    breath: "Respira normalmente e in modo regolare.",
  },
  thoracicRotation: {
    setup: ["In quadrupedia: mani sotto le spalle, ginocchia sotto le anche. Metti una mano dietro la testa."],
    steps: [
      "Ruota il gomito in basso e verso l'interno, verso il polso opposto.",
      "Poi ruota verso l'alto e apri il gomito verso il soffitto.",
      "Fai le ripetizioni, poi cambia lato.",
    ],
    targets: [
      "La rotazione viene dalla parte alta della schiena — le anche non si muovono.",
      "Lo sguardo segue il gomito.",
      "In alto il petto guarda la parete laterale.",
    ],
    mistakes: [
      ["Anche che si spostano con la rotazione", "Tieni le anche sopra le ginocchia."],
      ["Ripetizioni affrettate", "2 s giù, 2 s su."],
      ["Muovere solo il braccio", "Ruota tutto il petto."],
    ],
    breath: "Inspira mentre chiudi, espira mentre apri.",
  },
  catCow: {
    setup: ["In quadrupedia: mani sotto le spalle, ginocchia sotto le anche, schiena piatta."],
    steps: [
      "Inspirando, lascia scendere la pancia e solleva petto e coccige (mucca).",
      "Espirando, arrotonda la schiena verso il soffitto e porta il mento al petto (gatto).",
      "Muoviti lentamente tra le due, vertebra per vertebra.",
    ],
    targets: [
      "Si muove tutta la colonna, partendo dal bacino — non solo il collo.",
      "Mani e ginocchia restano ferme sotto spalle e anche.",
      "Ritmo lento, un respiro per posizione.",
    ],
    mistakes: [
      ["Muovere solo il collo", "Fai partire ogni onda dal bacino."],
      ["Avere fretta", "Respira con ogni posizione."],
      ["Togliere peso dalle mani", "Tieni le spalle sopra i polsi."],
    ],
    breath: "Inspira nella mucca, espira nel gatto.",
  },
  chestOpener: {
    setup: ["In piedi in una porta; appoggia l'avambraccio allo stipite con il gomito all'altezza della spalla."],
    steps: [
      "Fai un passo avanti con il piede dello stesso lato finché il petto si allunga.",
      "Ruota leggermente il petto lontano dal braccio per allungare di più.",
      "Mantieni, poi cambia lato.",
    ],
    targets: [
      "Gomito all'altezza della spalla, piegato a circa 90°.",
      "Busto dritto, costole chiuse.",
      "Un allungamento leggero sul petto e sulla parte anteriore della spalla — nessun formicolio alla mano.",
    ],
    mistakes: [
      ["Gomito molto sopra la spalla", "Abbassalo all'altezza della spalla."],
      ["Inarcare la zona lombare", "Costole chiuse, glutei leggermente contratti."],
      ["Spingere fino a un dolore acuto", "Arretra finché l'allungamento è leggero."],
    ],
    breath: "Respiri lenti e lunghi; rilassati un po' a ogni espirazione.",
  },
  hipCircles: {
    setup: ["In piedi con i piedi alla larghezza delle spalle, ginocchia morbide, mani sui fianchi."],
    steps: [
      "Disegna cerchi lenti con le anche in un senso.",
      "Allarga i cerchi ogni pochi giri.",
      "Inverti il senso.",
    ],
    targets: [
      "Il movimento viene dalle anche; le spalle restano sopra i piedi.",
      "Ginocchia morbide, non bloccate.",
      "Cerchi ampi e fluidi alla fine.",
    ],
    mistakes: [
      ["Muovere le spalle invece delle anche", "Tieni ferma la parte alta del corpo."],
      ["Cerchi minuscoli", "Allargali man mano che ti scaldi."],
      ["Ginocchia bloccate", "Ammorbidiscile."],
    ],
    breath: "Respira normalmente.",
  },
  legSwings: {
    setup: ["In piedi di fianco a un muro o un palo con una mano appoggiata, dritto."],
    steps: [
      "Fai oscillare la gamba esterna avanti e indietro come un pendolo.",
      "Poi girati verso il muro e fai oscillare la gamba da un lato all'altro davanti al corpo.",
      "Aumenta l'ampiezza gradualmente; cambia gamba.",
    ],
    targets: [
      "Busto dritto e fermo.",
      "Gamba d'appoggio tesa, gamba che oscilla rilassata.",
      "L'ampiezza cresce a ogni oscillazione, mai forzata.",
    ],
    mistakes: [
      ["Far oscillare il busto con la gamba", "Tieniti al muro e resta dritto."],
      ["Calci ampi subito", "Parti piccolo."],
      ["Ginocchio d'appoggio piegato", "Distendi la gamba d'appoggio."],
    ],
    breath: "Respira normalmente, a ritmo con l'oscillazione.",
  },
  worldsGreatest: {
    setup: ["Fai un affondo profondo con il piede destro avanti; entrambe le mani a terra all'interno del piede destro."],
    steps: [
      "Porta il gomito destro verso l'interno del piede destro.",
      "Riappoggia la mano destra, poi ruota e porta il braccio destro verso il soffitto.",
      "Riporta giù la mano; fai le ripetizioni, poi cambia lato.",
    ],
    targets: [
      "Gamba dietro tesa, ginocchio staccato da terra.",
      "Ginocchio davanti sopra la caviglia.",
      "La rotazione apre il petto di lato; lo sguardo segue la mano.",
    ],
    mistakes: [
      ["Ginocchio dietro che crolla a terra", "Spingi con il tallone dietro."],
      ["Ruotare solo dalla zona lombare", "Apri il petto e la spalla."],
      ["Farlo di fretta", "Due respiri per posizione."],
    ],
    breath: "Espira mentre ruoti verso l'alto.",
  },
  couchStretch: {
    setup: ["In ginocchio dando le spalle a un muro o un divano: il ginocchio dietro vicino al muro con la tibia appoggiata in verticale; l'altro piede avanti, ginocchio a 90°. Proteggi il ginocchio."],
    steps: [
      "Retroverti il bacino (coccige sotto) finché senti la parte anteriore della coscia dietro.",
      "Raddrizza il busto, mani sul ginocchio davanti.",
      "Mantieni, poi cambia lato.",
    ],
    targets: [
      "Bacino retroverso: l'allungamento è davanti all'anca e alla coscia, non nella zona lombare.",
      "Busto dritto, spalle sopra le anche.",
      "Ginocchio davanti sopra la caviglia.",
    ],
    mistakes: [
      ["Inarcare la zona lombare", "Retroverti il bacino e stringi il gluteo."],
      ["Ginocchio su un pavimento duro", "Metti un asciugamano piegato sotto il ginocchio."],
      ["Piegarsi in avanti per sfuggire all'allungamento", "Allontana invece il ginocchio dal muro."],
    ],
    breath: "Espirazioni lunghe; rilassati nell'allungamento.",
  },
  jumpingJacks: {
    setup: ["In piedi con i piedi uniti e le braccia lungo i fianchi."],
    steps: [
      "Salta aprendo i piedi più larghi delle spalle mentre porti le braccia sopra la testa.",
      "Salta tornando alla posizione iniziale con le braccia giù.",
      "Mantieni un ritmo costante per il tempo indicato.",
    ],
    targets: [
      "Atterra sugli avampiedi, ginocchia leggermente piegate.",
      "Le braccia arrivano fin sopra la testa.",
      "Un ritmo costante e leggero.",
    ],
    mistakes: [
      ["Atterrare pesante sui talloni", "Atterra morbido sugli avampiedi."],
      ["Braccia che si fermano all'altezza delle spalle", "Allungale fino in cima."],
      ["Trattenere il respiro", "Respira a ritmo."],
    ],
    breath: "Respira a ritmo con i salti.",
  },
  burpee: {
    setup: ["In piedi con i piedi alla larghezza delle spalle."],
    steps: [
      "Accosciati e appoggia le mani a terra davanti ai piedi.",
      "Salta o porta indietro i piedi in un plank dritto (aggiungi un push-up se richiesto).",
      "Salta riportando i piedi sotto le anche.",
      "Salta in alto con le braccia sopra la testa e atterra morbido.",
    ],
    targets: [
      "Plank dritto: anche all'altezza delle spalle.",
      "I piedi atterrano sotto le anche quando rientri.",
      "Estensione completa nel salto; atterraggio morbido a ginocchia piegate.",
    ],
    mistakes: [
      ["Anche che cedono nel plank", "Contrai addominali e glutei."],
      ["Atterrare pesante", "Piega le ginocchia all'atterraggio."],
      ["Mezzo salto in alto", "Estenditi completamente, braccia sopra la testa."],
    ],
    breath: "Espira nella spinta e nel salto.",
  },
  mountainClimbers: {
    setup: ["Plank alto: mani sotto le spalle, corpo dritto."],
    steps: [
      "Porta un ginocchio verso il petto.",
      "Cambia gamba rapidamente: un ginocchio entra mentre l'altro torna indietro.",
      "Mantieni il ritmo per il tempo indicato.",
    ],
    targets: [
      "Le spalle restano sopra le mani.",
      "Anche all'altezza delle spalle — senza saltellare verso l'alto.",
      "Il piede della gamba che entra atterra sotto l'anca.",
    ],
    mistakes: [
      ["Anche che saltellano in alto", "Tienile basse e ferme."],
      ["Spalle che finiscono dietro le mani", "Inclinati leggermente in avanti."],
      ["Ginocchia che entrano poco", "Porta il ginocchio fino sotto il petto."],
    ],
    breath: "Respira a ritmo; non trattenere il fiato.",
  },
  highKnees: {
    setup: ["In piedi, dritto, piedi alla larghezza delle anche."],
    steps: [
      "Corri sul posto sollevando le ginocchia all'altezza delle anche.",
      "Muovi le braccia in opposizione alle gambe.",
      "Resta leggero sugli avampiedi.",
    ],
    targets: [
      "Ginocchia all'altezza delle anche: cosce orizzontali.",
      "Busto dritto, non inclinato all'indietro.",
      "Appoggio sugli avampiedi.",
    ],
    mistakes: [
      ["Ginocchia sotto l'altezza delle anche", "Solleva di più, anche se più lentamente."],
      ["Inclinarsi all'indietro", "Resta dritto, leggera inclinazione in avanti."],
      ["Atterrare sui talloni", "Resta sugli avampiedi."],
    ],
    breath: "Respira a ritmo con i passi.",
  },
};
