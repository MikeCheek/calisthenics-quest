import type { GuideTable } from "../index";

// Squat, affondi, lavoro su una gamba, femorali e salti.
export const LEGS: GuideTable = {
  squat: {
    setup: ["Piedi alla larghezza delle spalle, punte ruotate in fuori di 10–30°; braccia avanti per l'equilibrio."],
    steps: [
      "Piega anche e ginocchia insieme, sedendoti in basso e leggermente indietro.",
      "Spingi le ginocchia in fuori sopra le punte mentre scendi, finché le cosce sono almeno parallele.",
      "Risali spingendo con tutto il piede, stringendo i glutei in alto.",
    ],
    targets: [
      "Profondità: piega dell'anca all'altezza del ginocchio o più in basso (cosce parallele o sotto).",
      "Ginocchia in linea con le punte — possono superarle, non devono cedere verso l'interno.",
      "Talloni a terra, petto alto, schiena neutra; tibie e busto con un'inclinazione simile.",
    ],
    mistakes: [
      ["Ginocchia che cedono verso l'interno", "Spingi le ginocchia in fuori sopra le punte."],
      ["Talloni che si alzano", "Sposta il peso a metà piede; allarga un po' la posizione."],
      ["Zona lombare che si arrotonda in basso", "Scendi solo finché la schiena resta neutra."],
    ],
    breath: "Inspira scendendo, espira salendo.",
  },
  jumpSquat: {
    setup: ["Piedi alla larghezza delle spalle, punte leggermente in fuori, braccia lungo i fianchi."],
    steps: [
      "Scendi in squat fino a circa parallelo, portando le braccia indietro.",
      "Spingi in modo esplosivo, slanciando le braccia in alto, e stacca da terra.",
      "Atterra sugli avampiedi, rulla sui talloni e scendi subito nello squat successivo.",
    ],
    targets: [
      "Estensione completa in aria: anche, ginocchia e caviglie tese.",
      "Atterraggio con le ginocchia piegate di almeno 45° e allineate alle punte.",
      "Atterraggio silenzioso — un atterraggio rumoroso vuol dire gambe rigide.",
    ],
    mistakes: [
      ["Atterrare a ginocchia tese", "Atterra morbido, già piegando."],
      ["Ginocchia che cedono all'atterraggio", "Spingi le ginocchia in fuori mentre atterri."],
      ["Nessuno slancio delle braccia", "Porta le braccia indietro, poi slanciale forte in alto."],
    ],
    breath: "Inspira scendendo, espira con forza mentre salti.",
  },
  sissySquat: {
    setup: ["In piedi, dritto, piedi alla larghezza delle anche; tieni leggermente un appoggio nelle versioni assistite."],
    steps: [
      "Sali sugli avampiedi e spingi le ginocchia in avanti.",
      "Inclina il corpo indietro mentre le ginocchia vanno avanti, mantenendo una linea retta dalle ginocchia alla testa.",
      "Scendi finché le ginocchia sono vicine al pavimento, poi risali spingendo con le cosce.",
    ],
    targets: [
      "Linea retta dalle ginocchia alle spalle: le anche non si piegano.",
      "Talloni sollevati, ginocchia che vanno ben oltre le punte.",
      "Discesa lenta e controllata (3 s); lavorano solo le cosce.",
    ],
    mistakes: [
      ["Piegarsi alle anche come in uno squat normale", "Stringi i glutei e mantieni la linea."],
      ["Scendere troppo presto troppo in basso", "Usa l'appoggio e un'ampiezza parziale."],
      ["Scendere di colpo", "Conta 3 s in discesa."],
    ],
    breath: "Inspira scendendo, espira salendo.",
  },
  splitSquat: {
    setup: ["Posizione divaricata lunga, circa una gamba di distanza tra i piedi; per la bulgarian, il piede dietro su una panca."],
    steps: [
      "Scendi dritto verso il basso, piegando entrambe le ginocchia.",
      "Fermati appena prima che il ginocchio dietro tocchi terra.",
      "Spingi con il piede davanti per risalire; finisci le ripetizioni, poi cambia gamba.",
    ],
    targets: [
      "Ginocchio davanti a circa 90° in basso, sopra il centro del piede.",
      "Ginocchio davanti in linea con il secondo dito.",
      "Busto dritto o leggermente in avanti; anche frontali.",
    ],
    mistakes: [
      ["Ginocchio davanti che cede verso l'interno", "Spingilo in fuori sopra le punte."],
      ["Busto che crolla in avanti", "Petto alto, spalle sopra le anche."],
      ["Posizione troppo corta (tallone che si alza)", "Allunga la posizione."],
    ],
    breath: "Inspira scendendo, espira salendo.",
  },
  cossack: {
    setup: ["Posizione molto larga, circa il doppio delle spalle, punte leggermente in fuori."],
    steps: [
      "Sposta il peso su un lato, piegando molto quel ginocchio.",
      "Lascia distendere l'altra gamba, ruotando sul tallone con le punte verso l'alto.",
      "Torna al centro e vai dall'altra parte.",
    ],
    targets: [
      "Gamba piegata: tallone a terra, ginocchio sopra le punte, anca all'altezza del ginocchio o più in basso.",
      "Gamba tesa: ginocchio bloccato, punte verso il soffitto.",
      "Petto alto e schiena neutra; braccia avanti per l'equilibrio.",
    ],
    mistakes: [
      ["Tallone della gamba piegata che si alza", "Rialza i talloni su un disco o scendi meno."],
      ["Ginocchio che cede verso l'interno", "Spingilo in fuori sopra le punte."],
      ["Schiena che si arrotonda", "Petto alto; tieni le braccia avanti."],
    ],
    breath: "Inspira scendendo, espira salendo.",
  },
  pistol: {
    setup: ["In piedi su una gamba; l'altra gamba tesa davanti, braccia avanti per l'equilibrio."],
    steps: [
      "Siediti sulla gamba d'appoggio, allungando le braccia avanti e sollevando la gamba libera.",
      "Scendi quanto controlli: fino a un box, al parallelo, o fino in fondo.",
      "Risali senza rimbalzare dal fondo.",
    ],
    targets: [
      "Tallone della gamba d'appoggio a terra per tutto il tempo.",
      "Ginocchio allineato sopra le punte; anche frontali.",
      "Gamba libera tesa e staccata da terra, davanti a te.",
    ],
    mistakes: [
      ["Tallone che si alza", "Rialza leggermente il tallone o lavora sulla mobilità della caviglia."],
      ["Ginocchio che cede verso l'interno", "Spingilo in fuori sopra le punte."],
      ["Crollare in basso", "Scendi lentamente su un box che limita la profondità."],
    ],
    breath: "Inspira scendendo, espira salendo.",
  },
  shrimpSquat: {
    setup: ["In piedi su una gamba; piega l'altro ginocchio e tieni quel piede dietro di te (o no, nelle versioni più difficili)."],
    steps: [
      "Inclina il busto in avanti e piega il ginocchio d'appoggio.",
      "Scendi finché il ginocchio dietro tocca leggermente il pavimento.",
      "Risali spingendo con il piede davanti.",
    ],
    targets: [
      "Il ginocchio dietro tocca leggero — mai sbattendo.",
      "Ginocchio davanti sopra le punte, tallone a terra.",
      "Busto inclinato in avanti di circa 45° per l'equilibrio.",
    ],
    mistakes: [
      ["Sbattere il ginocchio dietro a terra", "Metti un cuscinetto e controlla la discesa."],
      ["Tallone davanti che si alza", "Tieni il peso a metà piede."],
      ["Perdere l'equilibrio all'indietro", "Allunga in avanti il braccio libero."],
    ],
    breath: "Inspira scendendo, espira salendo.",
  },
  jumpPistol: {
    setup: ["Molto avanzato: padroneggia prima pistol pulite. In piedi su una gamba su una superficie morbida e antiscivolo."],
    steps: [
      "Scendi in pistol, la gamba libera davanti.",
      "Spingi in modo esplosivo e stacca da terra, slanciando le braccia in alto.",
      "Atterra morbido sulla stessa gamba e scendi nella ripetizione successiva (o sul box).",
    ],
    targets: [
      "Atterraggio sull'avampiede, poi sul tallone, con il ginocchio che si piega.",
      "Ginocchio sopra le punte allo stacco e all'atterraggio.",
      "Gamba libera davanti, staccata da terra.",
    ],
    mistakes: [
      ["Atterrare a gamba rigida", "Piega il ginocchio mentre atterri."],
      ["Ginocchio che cede verso l'interno", "Spingilo in fuori sopra le punte."],
      ["Troppe ripetizioni", "Serie brevi con recupero completo; fermati quando l'altezza cala."],
    ],
    breath: "Espira mentre salti.",
  },
  calfRaise: {
    setup: ["In piedi sul bordo di un gradino con gli avampiedi appoggiati (o a terra), una mano al muro per l'equilibrio."],
    steps: [
      "Sali sulle punte il più in alto possibile.",
      "Pausa di 1–2 s in alto.",
      "Scendi lentamente, lasciando i talloni sotto il livello del gradino.",
    ],
    targets: [
      "Altezza massima in alto, caviglia completamente estesa.",
      "Peso su alluce e secondo dito.",
      "Allungamento completo in basso, ginocchia tese.",
    ],
    mistakes: [
      ["Rimbalzare dal basso", "Pausa in alto e in basso."],
      ["Ampiezza parziale", "Fino in cima e fino in fondo."],
      ["Rullare sul bordo esterno del piede", "Spingi con l'alluce."],
    ],
    breath: "Espira salendo, inspira scendendo.",
  },
  nordic: {
    setup: ["In ginocchio su un cuscinetto con i talloni bloccati sotto una sbarra, dalle mani di un compagno o da un elastico; braccia pronte davanti."],
    steps: [
      "Stringi i glutei: il corpo è dritto dalle ginocchia alla testa.",
      "Scendi in avanti il più lentamente possibile, resistendo con i femorali.",
      "Frena con le mani (push-up catch), poi spingi o risali tirando con i femorali.",
    ],
    targets: [
      "Anche dritte — nessuna piega in vita.",
      "Discesa in 3–5 s; la velocità resta costante fino alla fine.",
      "Talloni ben bloccati, ginocchia su un cuscinetto.",
    ],
    mistakes: [
      ["Piegarsi alle anche per accorciare la leva", "Stringi i glutei e mantieni la linea."],
      ["Cadere di colpo alla fine", "Frena prima con le mani."],
      ["Talloni che scivolano fuori", "Sistema bene il blocco prima di iniziare."],
    ],
    breath: "Inspira scendendo, espira salendo.",
  },
  gluteBridge: {
    setup: ["Sdraiati sulla schiena, ginocchia piegate, piedi alla larghezza delle anche e appoggiati vicino ai glutei; braccia lungo i fianchi."],
    steps: [
      "Spingi con i talloni e solleva le anche (una gamba tesa in alto nella versione a una gamba).",
      "Stringi forte i glutei in alto per 1–2 s.",
      "Scendi lentamente fino appena sopra il pavimento.",
    ],
    targets: [
      "In alto, una linea retta dalle ginocchia alle spalle.",
      "Ginocchia piegate a circa 90° in alto, sopra le caviglie.",
      "Costole chiuse — la spinta viene dalle anche, non dall'inarcarsi.",
    ],
    mistakes: [
      ["Spingere con le punte", "Spingi con i talloni; solleva le punte se serve."],
      ["Inarcare la zona lombare in alto", "Stringi i glutei e chiudi le costole verso le anche."],
      ["Anche che si inclinano (una gamba)", "Tieni entrambe le creste iliache allo stesso livello."],
    ],
    breath: "Espira mentre sollevi, inspira mentre scendi.",
  },
  hamstringBridge: {
    setup: ["Sdraiati sulla schiena con i talloni su una panca (o a terra), gambe quasi tese; braccia lungo i fianchi."],
    steps: [
      "Spingi i talloni in basso e solleva le anche.",
      "Mantieni in alto o scendi lentamente, come chiede la versione.",
      "Scendi fino appena sopra il pavimento e ripeti.",
    ],
    targets: [
      "Ginocchia quasi tese (piegate di circa 10–20°): lavorano i femorali.",
      "Anche sollevate in linea retta dalle spalle ai talloni.",
      "Costole chiuse, nessun arco.",
    ],
    mistakes: [
      ["Inarcare la zona lombare", "Stringi i glutei e chiudi le costole verso le anche."],
      ["Ginocchia troppo piegate", "Allontana i talloni."],
      ["Crampi ai femorali", "Serie più brevi; aumenta gradualmente."],
    ],
    breath: "Espira mentre sollevi.",
  },
  singleLegRdl: {
    setup: ["In piedi su una gamba con il ginocchio leggermente piegato; braccia lungo i fianchi o avanti."],
    steps: [
      "Piegati in avanti dalle anche, con la gamba libera che sale tesa dietro di te.",
      "Scendi finché il busto è quasi orizzontale o il femorale è completamente in allungamento.",
      "Risali contraendo il gluteo della gamba d'appoggio.",
    ],
    targets: [
      "Schiena piatta: testa, schiena e gamba libera su un'unica linea.",
      "Anche parallele al pavimento: le punte del piede libero guardano in basso.",
      "Ginocchio d'appoggio leggermente piegato (circa 15°) e fermo.",
    ],
    mistakes: [
      ["Schiena che si arrotonda", "Petto avanti, schiena piatta."],
      ["Anca della gamba libera che si apre", "Punta le dita del piede dietro verso il pavimento."],
      ["Bloccare o piegare molto il ginocchio", "Mantieni la stessa leggera flessione."],
    ],
    breath: "Inspira scendendo, espira risalendo.",
  },
  broadJump: {
    setup: ["Piedi alla larghezza delle anche, braccia pronte a slanciare; spazio libero davanti."],
    steps: [
      "Porta le braccia indietro piegando anche e ginocchia.",
      "Salta in avanti in modo esplosivo, slanciando le braccia avanti.",
      "Porta le ginocchia avanti in volo e atterra a ginocchia piegate; mantieni l'atterraggio.",
    ],
    targets: [
      "Stacco a circa 45°, estensione completa di anche, ginocchia e caviglie.",
      "Atterraggio con le ginocchia sopra le punte e le anche indietro.",
      "Mantieni l'atterraggio per 2 s senza fare passi.",
    ],
    mistakes: [
      ["Atterrare rigido", "Piega anche e ginocchia per assorbire."],
      ["Ginocchia che cedono all'atterraggio", "Spingile in fuori."],
      ["Nessuno slancio delle braccia", "Slancia forte le braccia."],
    ],
    breath: "Inspira mentre porti le braccia indietro, espira mentre salti.",
  },
  boxJumpBack: {
    setup: ["In piedi su un box basso o un gradino con il pavimento libero e morbido dietro di te."],
    steps: [
      "Piega leggermente le ginocchia e slancia le braccia.",
      "Salta all'indietro giù dal box.",
      "Atterra morbido a ginocchia piegate; risali sul box e ripeti.",
    ],
    targets: [
      "Atterra sugli avampiedi, poi sui talloni, ginocchia piegate.",
      "Sguardo in avanti, non sui piedi.",
      "Anche e ginocchia assorbono l'atterraggio in silenzio.",
    ],
    mistakes: [
      ["Atterrare rigido", "Piega le ginocchia all'atterraggio."],
      ["Partire da un box troppo alto", "Parti basso e progredisci."],
      ["Sbilanciarsi in avanti all'atterraggio", "Resta dritto, petto alto."],
    ],
    breath: "Espira mentre atterri.",
  },
  singleLegHop: {
    setup: ["In piedi su una gamba con il ginocchio leggermente piegato, braccia pronte."],
    steps: [
      "Saltella in avanti (o sul posto) su una gamba.",
      "Atterra morbido sulla stessa gamba e resta immobile per 2 s.",
      "Fai le ripetizioni, poi cambia gamba.",
    ],
    targets: [
      "Atterra con il ginocchio piegato e allineato sopra le punte.",
      "Anche allo stesso livello, senza cedere dal lato della gamba libera.",
      "Atterraggio silenzioso, equilibrio mantenuto senza oscillare.",
    ],
    mistakes: [
      ["Ginocchio che cede verso l'interno all'atterraggio", "Spingilo in fuori sopra le punte."],
      ["Atterrare rigido", "Piega il ginocchio mentre atterri."],
      ["Perdere l'equilibrio", "Fai salti più piccoli."],
    ],
    breath: "Espira mentre salti.",
  },
};
