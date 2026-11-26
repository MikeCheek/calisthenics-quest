import type { GuideTable } from "../index";

// Spinta, appoggi, planche, verticali ed equilibri sulle braccia.
export const PUSH: GuideTable = {
  pushUp: {
    setup: ["Mani a terra poco più larghe delle spalle, dita in avanti; piedi uniti; corpo dritto dalla testa ai talloni."],
    steps: [
      "Contrai glutei e addominali: il corpo è un unico plank rigido.",
      "Piega i gomiti e scendi con il petto a 2–3 cm dal pavimento (o dall'appoggio).",
      "Spingi via il pavimento fino a braccia tese, chiudendo con le scapole leggermente aperte.",
    ],
    targets: [
      "Gomiti a circa 45° dal corpo — né aperti a 90°, né incollati alle costole.",
      "In basso: gomiti a 90° o meno, petto vicino a terra; in alto: braccia completamente tese.",
      "Testa, spalle, anche e talloni su un'unica linea retta per tutto il tempo.",
    ],
    mistakes: [
      ["Anche che cedono", "Stringi i glutei e retroverti leggermente il bacino."],
      ["Anche troppo alte", "Abbassale in linea con spalle e talloni."],
      ["Gomiti aperti a 90°", "Ruota l'incavo dei gomiti leggermente in avanti; punta a 45°."],
      ["Ampiezza parziale", "Scendi finché il petto quasi tocca; usa un rialzo se serve."],
    ],
    breath: "Inspira scendendo, espira mentre spingi.",
  },
  diamondPushUp: {
    setup: ["Posizione da push-up con le mani unite sotto il petto, pollici e indici a formare un diamante."],
    steps: [
      "Corpo dritto, glutei e addominali contratti.",
      "Scendi con il petto verso le mani, i gomiti che vanno indietro lungo il corpo.",
      "Spingi di nuovo fino a braccia tese.",
    ],
    targets: [
      "Gomiti vicini alle costole, rivolti indietro (circa 20–30° dal corpo).",
      "Il petto arriva appena sopra le mani.",
      "Corpo su un'unica linea retta dalla testa ai talloni.",
    ],
    mistakes: [
      ["Gomiti che si aprono", "Stringi i gomiti verso il corpo."],
      ["Fastidio ai polsi", "Ruota leggermente le mani verso l'esterno o spostale un po' in avanti."],
      ["Anche che cedono", "Contrai addominali e glutei."],
    ],
    breath: "Inspira scendendo, espira nella spinta.",
  },
  archerPushUp: {
    setup: ["Mani molto larghe (circa il doppio delle spalle), dita leggermente ruotate in fuori; piedi divaricati per l'equilibrio."],
    steps: [
      "Sposta il peso verso una mano e piega quel braccio.",
      "L'altro braccio si distende di lato, scivolando a terra.",
      "Spingi di nuovo al centro e ripeti dall'altra parte.",
    ],
    targets: [
      "Braccio che lavora: gomito a circa 45°, petto che scende accanto alla mano.",
      "Braccio di aiuto: teso (180°), fa solo da appoggio.",
      "Corpo dritto e parallelo al pavimento — le anche non ruotano.",
    ],
    mistakes: [
      ["Braccio di aiuto che si piega", "Tienilo teso; è questo che lo rende un archer push-up."],
      ["Anche che ruotano", "Piedi più larghi e addominali contratti."],
      ["Ripetizioni poco profonde", "Scendi finché il petto è vicino alla mano che lavora."],
    ],
    breath: "Inspira scendendo, espira nella spinta.",
  },
  oneArmPushUp: {
    setup: ["Mano che lavora sotto la spalla, piedi larghi (più delle spalle), mano libera sulla schiena o sul fianco."],
    steps: [
      "Ruota leggermente il corpo in modo che la spalla che lavora sia sopra la mano.",
      "Scendi con controllo, gomito vicino al corpo.",
      "Spingi di nuovo su senza ruotare.",
    ],
    targets: [
      "Gomito che lavora vicino alle costole, circa 30° dal corpo.",
      "Anche e spalle allo stesso livello: il busto non si apre verso il soffitto.",
      "Petto che scende fino all'altezza di un pugno dal pavimento.",
    ],
    mistakes: [
      ["Busto che si apre in salita", "Stringi il gluteo del lato che lavora; allarga i piedi."],
      ["Gomito che si apre", "Tienilo stretto e rivolto indietro."],
      ["Troppo difficile troppo presto", "Usa la versione inclinata o con elastico finché 3×5 sono pulite."],
    ],
    breath: "Inspira scendendo, espira forte nella spinta.",
  },
  ninetyPushUp: {
    setup: ["Avanzato: dalla verticale (o in pike con i piedi rialzati), il corpo scende fino all'orizzontale su braccia piegate."],
    steps: [
      "Porta le spalle in avanti sopra le mani.",
      "Abbassa il corpo finché è orizzontale, sostenuto da braccia piegate a 90°.",
      "Spingi di nuovo fino alla verticale (o al pike di partenza).",
    ],
    targets: [
      "Gomiti a 90°, stretti al corpo; il corpo poggia sui gomiti come su una mensola.",
      "Corpo dritto e orizzontale in basso.",
      "Spalle davanti alle mani nella posizione bassa.",
    ],
    mistakes: [
      ["Gomiti che si aprono", "Tienili stretti alle costole."],
      ["Corpo che si piega alle anche", "Stringi i glutei e mantieni la linea."],
      ["Cadere in avanti", "Inclinati solo quanto riesci a spingere di nuovo su."],
    ],
    breath: "Inspira scendendo, espira spingendo su.",
  },
  explosivePushUp: {
    setup: ["Posizione da push-up, corpo dritto; una superficie morbida per le versioni con battuta."],
    steps: [
      "Scendi velocemente ma con controllo fino in basso.",
      "Spingi più forte che puoi in modo che le mani si stacchino da terra.",
      "Batti le mani (una volta, due o dietro la schiena) e riatterra con le braccia piegate.",
    ],
    targets: [
      "Le mani atterrano sotto le spalle con i gomiti leggermente piegati per assorbire.",
      "Il corpo resta un plank in aria — le anche non cedono.",
      "Ogni ripetizione è veloce come la prima; fermati quando la velocità cala.",
    ],
    mistakes: [
      ["Atterrare a gomiti bloccati", "Atterra morbido e lascia piegare le braccia."],
      ["Anche che cedono in aria", "Contrai glutei e addominali prima di ogni spinta."],
      ["Ripetizioni di fila senza ricomporsi", "Pausa in alto, poi riparti."],
    ],
    breath: "Inspira scendendo, espira con forza nella spinta.",
  },
  pikePushUp: {
    setup: ["Mani a terra alla larghezza delle spalle; avvicina i piedi e solleva le anche: una V rovesciata."],
    steps: [
      "Porta le spalle sopra le mani.",
      "Piega i gomiti e porta la testa a terra davanti alle mani.",
      "Spingi di nuovo a braccia tese, anche sempre alte.",
    ],
    targets: [
      "Testa e mani formano un triangolo: la testa arriva 10–15 cm davanti alle mani.",
      "Anche alte, quasi sopra le spalle; busto il più verticale possibile.",
      "Gomiti a circa 45° dal corpo, rivolti indietro.",
    ],
    mistakes: [
      ["Anche che scendono verso un push-up", "Avvicina i piedi e tieni le anche alte."],
      ["Testa che arriva tra le mani", "Portala più avanti a formare un triangolo."],
      ["Gomiti che si aprono", "Tienili rivolti indietro."],
    ],
    breath: "Inspira scendendo, espira nella spinta.",
  },
  hspu: {
    setup: ["Verticale al muro (o sulle parallettes); mani alla larghezza delle spalle, a circa 15–20 cm dal muro."],
    steps: [
      "Blocca il corpo: glutei e addominali contratti, costole chiuse.",
      "Piega i gomiti e porta la testa a terra (o sotto il livello delle mani sulle parallettes).",
      "Spingi di nuovo fino a braccia tese.",
    ],
    targets: [
      "La testa arriva davanti alle mani, formando un triangolo.",
      "Gomiti a circa 45°, rivolti in avanti-fuori, non aperti di lato.",
      "In alto: braccia bloccate tese, spalle spinte verso le orecchie.",
    ],
    mistakes: [
      ["Testa che arriva troppo avanti", "Avvicina un po' le mani al muro."],
      ["Gomiti molto aperti", "Tienili a 45°."],
      ["Calciare contro il muro", "Solo ripetizioni strict — usa le negative per costruire la forza."],
    ],
    breath: "Inspira in alto, espira nella spinta.",
  },
  wallHandstand: {
    setup: ["Mani alla larghezza delle spalle, a 10–20 cm dal muro; sali con un calcio (schiena al muro) o camminando (petto al muro)."],
    steps: [
      "Spingi via il pavimento a braccia tese.",
      "Stringi le gambe tra loro, glutei contratti, costole chiuse.",
      "Mantieni la linea (o tocca una spalla / sposta il peso, come richiesto), poi scendi con controllo.",
    ],
    targets: [
      "Polsi, spalle, anche e caviglie allineati su una linea verticale.",
      "Spalle completamente aperte (braccia in linea con il busto) e spinte verso le orecchie.",
      "Testa neutra: sguardo tra le mani.",
    ],
    mistakes: [
      ["Schiena a banana", "Petto al muro, costole chiuse e glutei contratti."],
      ["Braccia piegate o spalle che affondano", "Spingi attivamente via il pavimento."],
      ["Guardare troppo avanti", "Guarda tra le mani."],
    ],
    breath: "Respiri lenti e regolari; scendi prima di perdere la linea.",
  },
  wallWalk: {
    setup: ["Parti in posizione da push-up con i piedi contro il muro."],
    steps: [
      "Cammina con i piedi su per il muro mentre le mani camminano indietro verso di esso.",
      "Sali finché il petto è vicino al muro (o all'altezza richiesta).",
      "Scendi allo stesso modo, lentamente.",
    ],
    targets: [
      "Braccia tese e spalle che spingono in alto per tutto il tempo.",
      "In alto: mani a 10–20 cm dal muro, corpo dritto.",
      "Piccoli passi con le mani — mai saltare.",
    ],
    mistakes: [
      ["Inarcare la schiena in alto", "Glutei contratti, costole chiuse."],
      ["Scendere troppo in fretta", "Stessa velocità in discesa e in salita."],
      ["Mani troppo lontane dal muro", "Avvicinati passo dopo passo."],
    ],
    breath: "Respira normalmente mentre cammini; non trattenere il fiato.",
  },
  kickUp: {
    setup: ["In piedi davanti a uno spazio libero; braccia in alto, una gamba avanti."],
    steps: [
      "Fai un affondo in avanti e appoggia le mani a terra, alla larghezza delle spalle.",
      "Calcia in alto con la gamba dietro e spingi con quella davanti.",
      "Unisci le gambe in alto e trova l'equilibrio.",
      "Scendi come sei salito, o esci di lato con un passo.",
    ],
    targets: [
      "Braccia tese dal momento in cui le mani toccano terra.",
      "Le anche arrivano sopra le spalle prima che le gambe si uniscano.",
      "Calcio appena sufficiente: dovresti arrivare in alto lentamente.",
    ],
    mistakes: [
      ["Calciare troppo forte e cadere oltre", "Calcia più piano; impara a uscire con un passo laterale (ruota)."],
      ["Braccia piegate", "Blocca i gomiti prima del calcio."],
      ["Guardarsi i piedi", "Guarda tra le mani."],
    ],
    breath: "Inspira prima del calcio, espira mentre trovi l'equilibrio.",
  },
  handstand: {
    setup: ["Sali in verticale libera con un calcio; mani alla larghezza delle spalle, dita aperte."],
    steps: [
      "Bilanciati con le dita: premile a terra se cadi in avanti, rilasciale se cadi indietro.",
      "Tieni il corpo su una linea, gambe unite e punte tese.",
      "Mantieni (o sposta il peso, tocca una spalla, solleva le dita come richiesto), poi scendi con controllo.",
    ],
    targets: [
      "Polsi, spalle, anche e caviglie su un'unica linea verticale.",
      "Spalle aperte e spinte verso le orecchie.",
      "Le correzioni vengono da dita e polsi — non piegandosi alle anche.",
    ],
    mistakes: [
      ["Schiena a banana", "Costole chiuse, glutei contratti."],
      ["Braccia piegate o spalle rilassate", "Spingi via il pavimento."],
      ["Testa troppo avanti o indietro", "Testa neutra, sguardo tra le mani."],
    ],
    breath: "Respiri piccoli e calmi — la tensione è nel corpo, non nel respiro.",
  },
  handstandWalk: {
    setup: ["Sali in verticale con una leggera inclinazione in avanti; spazio libero davanti a te."],
    steps: [
      "Lascia che il corpo si inclini leggermente in avanti.",
      "Fai piccoli passi con le mani per restare sotto le spalle.",
      "Tieni le gambe unite e il corpo contratto; per girare, sposta una mano attorno all'altra.",
    ],
    targets: [
      "Passi con le mani piccoli e rapidi (10–15 cm).",
      "Corpo dritto e leggermente inclinato nella direzione di marcia.",
      "Spalle aperte, braccia tese.",
    ],
    mistakes: [
      ["Passi grandi", "Passi piccoli e frequenti ti tengono in equilibrio."],
      ["Gambe che si aprono", "Stringi le gambe tra loro."],
      ["Braccia piegate", "Blocca i gomiti a ogni passo."],
    ],
    breath: "Respira in modo regolare — senza trattenere il fiato.",
  },
  oneArmHandstand: {
    setup: ["Molto avanzato: padroneggia prima una verticale libera di 60 s. Inizia al muro con le gambe in straddle."],
    steps: [
      "Sposta il peso lateralmente sopra una mano.",
      "Alleggerisci l'altra mano fino ai polpastrelli, poi sollevala.",
      "Bilanciati con le dita e le anche, poi riappoggia la mano.",
    ],
    targets: [
      "Mano che lavora esattamente sotto la spalla, spalla sopra il polso.",
      "Anche spostate leggermente sopra il lato che lavora.",
      "Braccio bloccato teso, spalla spinta in alto.",
    ],
    mistakes: [
      ["Piegare il braccio d'appoggio", "Bloccalo prima di sollevare l'altra mano."],
      ["Spostarsi troppo poco", "Porta prima tutto il peso sopra la mano."],
      ["Troppo volume", "Tenute brevi, molti tentativi, buon recupero."],
    ],
    breath: "Respiro calmo; ricomponiti quando la forma si rompe.",
  },
  pressHandstand: {
    setup: ["In piedi in pike o straddle, mani a terra alla larghezza delle spalle davanti ai piedi (o partendo da una L-sit)."],
    steps: [
      "Porta le spalle molto avanti sopra le mani.",
      "Solleva le anche sopra le spalle, tenendo le gambe tese (pike o straddle).",
      "Quando le anche sono allineate, porta su le gambe fino alla verticale; scendi allo stesso modo.",
    ],
    targets: [
      "Spalle ben davanti alle mani all'inizio della salita.",
      "Braccia tese per tutto il tempo.",
      "Anche sopra le spalle prima che le gambe salgano.",
    ],
    mistakes: [
      ["Saltare invece di premere", "Costruisci la press con pike walk-up al muro e negative."],
      ["Non inclinarsi abbastanza", "Inclinati finché i piedi diventano leggeri."],
      ["Braccia piegate", "Blocca i gomiti."],
    ],
    breath: "Espira durante la salita.",
  },
  plancheLean: {
    setup: ["Posizione da push-up, mani ruotate in fuori o indietro, braccia tese; piedi a terra."],
    steps: [
      "Arrotonda leggermente la parte alta della schiena (scapole aperte).",
      "Porta le spalle in avanti oltre le mani.",
      "Mantieni l'inclinazione (o piega le braccia per i pseudo planche push-up), poi torna indietro.",
    ],
    targets: [
      "Spalle 10–20 cm davanti alle mani.",
      "Braccia tese (180° al gomito) — bloccate nell'inclinazione.",
      "Corpo dritto, anche all'altezza delle spalle.",
    ],
    mistakes: [
      ["Non inclinarsi abbastanza", "Inclinati finché senti i polsi caricati."],
      ["Gomiti piegati", "Bloccali prima di inclinarti."],
      ["Anche che cedono", "Contrai glutei e addominali."],
    ],
    breath: "Respiri brevi e regolari nella tenuta.",
  },
  planche: {
    setup: ["Mani a terra o sulle parallettes, alla larghezza delle spalle, dita in fuori; riscalda bene i polsi."],
    steps: [
      "Porta le spalle in avanti oltre le mani e arrotonda la parte alta della schiena.",
      "Stacca i piedi da terra in tuck (o nella forma più difficile).",
      "Mantieni il corpo orizzontale (o scendi e risali per push-up/press).",
    ],
    targets: [
      "Braccia bloccate tese; spalle ben davanti alle mani.",
      "Parte alta della schiena arrotondata e protratta (scapole aperte).",
      "Corpo orizzontale: anche all'altezza delle spalle.",
    ],
    mistakes: [
      ["Braccia piegate", "Blocca i gomiti; costruisci prima con i lean."],
      ["Spalle non abbastanza avanti", "Inclinati di più finché i piedi si staccano da soli."],
      ["Perdere la schiena arrotondata", "Spingi via il pavimento e apri le scapole."],
    ],
    breath: "Respiri brevi nella tenuta.",
  },
  maltese: {
    setup: ["Estremamente avanzato: padroneggia prima la full planche. Mani larghe (o anelli ruotati in fuori), dita verso l'esterno."],
    steps: [
      "Porta le mani larghe, in linea con le anche.",
      "Inclinati in avanti e abbassa il corpo verso terra, tenendolo orizzontale.",
      "Mantieni appena sopra il pavimento, poi spingi di nuovo su.",
    ],
    targets: [
      "Braccia tese e larghe, mani vicino alle anche.",
      "Corpo orizzontale e molto basso, appena sopra il pavimento o gli anelli.",
      "Spalle protratte e depresse.",
    ],
    mistakes: [
      ["Piegare i gomiti", "Solo a braccia tese."],
      ["Anche che cedono", "Contrai glutei e addominali."],
      ["Troppo volume troppo presto", "Tenute brevi, molto recupero per gomiti e polsi."],
    ],
    breath: "Respiri brevi, mantieni la tensione.",
  },
  crowStand: {
    setup: ["Accosciato con le mani a terra alla larghezza delle spalle, dita aperte; ginocchia contro il retro delle braccia."],
    steps: [
      "Inclinati in avanti finché il peso è sulle mani.",
      "Stacca i piedi uno alla volta, poi insieme.",
      "Mantieni, guardando un po' in avanti.",
    ],
    targets: [
      "Gomiti piegati a circa 90° nel crow (tesi nella frog stand a braccia tese).",
      "Spalle davanti alle mani, anche alte.",
      "Ginocchia premute contro le braccia.",
    ],
    mistakes: [
      ["Guardare dritto in basso", "Guarda 30 cm davanti alle mani."],
      ["Gomiti che si aprono", "Stringili verso l'interno."],
      ["Saltarci dentro", "Inclinati lentamente finché i piedi si staccano."],
    ],
    breath: "Respiri calmi — non trattenere il fiato.",
  },
  elbowLever: {
    setup: ["In ginocchio con le mani a terra, dita rivolte indietro o in fuori; gomiti uniti contro le anche."],
    steps: [
      "Inclinati in avanti sui gomiti, appoggiandoci sopra le anche.",
      "Solleva le gambe (prima in tuck) finché il corpo si bilancia in orizzontale.",
      "Mantieni, poi riappoggia i piedi.",
    ],
    targets: [
      "Gomiti vicini tra loro e infilati sotto anche/pancia.",
      "Corpo orizzontale: testa, anche e piedi alla stessa altezza.",
      "Avambracci verticali.",
    ],
    mistakes: [
      ["Gomiti troppo larghi", "Stringili verso l'ombelico."],
      ["Anche che si chiudono o gambe che scendono", "Stringi i glutei e solleva le gambe."],
      ["Inclinarsi troppo in avanti", "Inclinati solo quanto basta per bilanciarti."],
    ],
    breath: "Respiro calmo; la pancia preme sui gomiti, quindi respiri brevi.",
  },
  wrists: {
    setup: ["In quadrupedia o in piedi; togli orologi e anelli."],
    steps: [
      "Ruota lentamente i polsi nei due sensi.",
      "Con i palmi a terra, dondola delicatamente avanti e indietro (dita in avanti, poi indietro).",
      "Ripeti con il dorso delle mani a terra.",
    ],
    targets: [
      "Movimento lento e controllato — mai forzato.",
      "Allungamento leggero su palmo e avambraccio, nessun dolore acuto.",
      "Tutta l'ampiezza: flessione, estensione e lateralmente.",
    ],
    mistakes: [
      ["Avere fretta", "Dedica 1–2 minuti prima di ogni equilibrio sulle mani."],
      ["Caricare tutto il peso subito", "Carica gradualmente."],
      ["Ignorare il dolore", "Allenta se senti un dolore acuto."],
    ],
    breath: "Respiro lento insieme al movimento.",
  },
  dip: {
    setup: ["Appoggio sulle parallele o sugli anelli, braccia tese, spalle basse, corpo dritto."],
    steps: [
      "Inclina leggermente il busto in avanti e piega i gomiti.",
      "Scendi finché le spalle sono appena sotto i gomiti.",
      "Spingi di nuovo fino a braccia tese.",
    ],
    targets: [
      "In basso: gomiti a circa 90° (spalle leggermente sotto i gomiti).",
      "Gomiti rivolti indietro, vicini al corpo.",
      "In alto: braccia bloccate, spalle spinte lontano dalle orecchie.",
    ],
    mistakes: [
      ["Spalle che si alzano in alto", "In alto spingi le parallele verso il basso."],
      ["Scendere così tanto da sentire dolore alla spalla", "Fermati a 90° e aumenta la profondità piano."],
      ["Slanciare le gambe", "Gambe unite, leggermente in avanti."],
    ],
    breath: "Inspira scendendo, espira nella spinta.",
  },
  straightBarDip: {
    setup: ["Sali in appoggio su una sbarra dritta: mani alla larghezza delle spalle, presa prona, sbarra alle anche, braccia tese."],
    steps: [
      "Porta il petto in avanti sopra la sbarra e lascia le gambe leggermente avanti per equilibrio.",
      "Piega i gomiti e scendi finché la sbarra è vicina al petto.",
      "Spingi di nuovo fino a braccia tese, tenendo le spalle davanti alla sbarra.",
    ],
    targets: [
      "Spalle davanti alla sbarra per tutta la ripetizione.",
      "Gomiti rivolti indietro, vicini al corpo; circa 90° o meno in basso.",
      "In basso: sbarra all'altezza del petto; in alto: braccia bloccate, spalle basse.",
    ],
    mistakes: [
      ["Restare dritti e cadere all'indietro", "Porta il petto in avanti sopra la sbarra."],
      ["Ampiezza parziale", "Scendi finché la sbarra tocca il petto o la pancia."],
      ["Scalciare con le gambe", "Gambe unite, leggermente avanti, ferme."],
    ],
    breath: "Inspira scendendo, espira nella spinta.",
  },
  impossibleDip: {
    setup: ["Molto difficile: appoggio sulle parallele o su una sbarra dritta, corpo dritto."],
    steps: [
      "Scendi sugli avambracci mantenendo il corpo dritto: i gomiti vanno dietro di te.",
      "Appoggia brevemente gli avambracci sulle parallele.",
      "Spingi di nuovo fino a braccia tese senza inclinarti in avanti.",
    ],
    targets: [
      "Busto dritto per tutto il tempo.",
      "Gomiti dietro al corpo; avambracci sulle parallele in basso.",
      "In alto: braccia tese.",
    ],
    mistakes: [
      ["Inclinarsi in avanti per facilitarla", "Resta dritto; usa piuttosto un'assistenza."],
      ["Scendere di colpo", "Scendi lentamente, soprattutto vicino al fondo."],
      ["Troppo volume", "Poche ripetizioni, lungo recupero per i gomiti."],
    ],
    breath: "Inspira scendendo, espira nella spinta.",
  },
  support: {
    setup: ["Su anelli, parallettes o parallele: sali in appoggio con un salto o una spinta, braccia tese, mani accanto alle anche."],
    steps: [
      "Spingi forte parallele o anelli verso il basso in modo che le spalle si allontanino dalle orecchie.",
      "Agli anelli, ruota leggermente le mani in fuori (turnout) e tieni gli anelli a contatto con i fianchi.",
      "Mantieni il tempo con il corpo fermo, poi scendi appoggiando i piedi invece di lasciarti cadere.",
    ],
    targets: [
      "Braccia bloccate tese (180° al gomito), mani accanto alle anche.",
      "Spalle depresse: collo lungo, clavicole larghe.",
      "Corpo verticale, costole chiuse, gambe unite e leggermente avanti.",
    ],
    mistakes: [
      ["Spalle alzate", "Spingi le parallele in basso e allunga il collo."],
      ["Gomiti piegati", "Blocca le braccia; accorcia la tenuta se serve."],
      ["Anelli che oscillano o si allontanano", "Stringili contro le anche e unisci le gambe."],
    ],
    breath: "Respiro regolare; non irrigidirti trattenendo il fiato.",
  },
};
