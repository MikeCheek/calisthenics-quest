import type { GuideTable } from "../index";

// Plank, sollevamenti gambe, hollow, compressione e catena posteriore.
export const CORE: GuideTable = {
  plank: {
    setup: ["Avambracci (o mani, nel plank alto) a terra con i gomiti sotto le spalle; piedi uniti, punte puntate a terra."],
    steps: [
      "Solleva le ginocchia in modo che il corpo sia un'unica linea retta.",
      "Contrai glutei e addominali e spingi leggermente il pavimento via con gli avambracci.",
      "Mantieni il tempo senza muoverti, poi appoggia le ginocchia.",
    ],
    targets: [
      "Testa, spalle, anche e talloni su un'unica linea retta.",
      "Gomiti esattamente sotto le spalle (90° al gomito sugli avambracci).",
      "Bacino leggermente retroverso: nessun arco lombare; sguardo a terra.",
    ],
    mistakes: [
      ["Anche che cedono", "Stringi i glutei e retroverti il bacino."],
      ["Anche troppo alte", "Abbassale in linea con le spalle."],
      ["Trattenere il respiro", "Respira breve e regolare."],
    ],
    breath: "Respira in modo regolare per tutta la tenuta.",
  },
  sidePlank: {
    setup: ["Sdraiati su un fianco; avambraccio a terra con il gomito sotto la spalla, gambe tese e sovrapposte (ginocchia piegate nella versione facile)."],
    steps: [
      "Solleva le anche finché il corpo è dritto.",
      "Mantieni — oppure abbassa e risolleva le anche, o alza la gamba di sopra, come chiede la versione.",
      "Scendi e cambia lato.",
    ],
    targets: [
      "Gomito esattamente sotto la spalla, avambraccio rivolto in avanti.",
      "Testa, anche e piedi in linea retta, visti da davanti e di lato.",
      "Anche sovrapposte, senza ruotare in avanti o indietro.",
    ],
    mistakes: [
      ["Anche che cedono", "Spingi l'anca inferiore verso il soffitto."],
      ["Anche che ruotano in avanti", "Allinea l'anca superiore esattamente sopra quella inferiore."],
      ["Spalla che affonda nel collo", "Spingi via il pavimento con l'avambraccio."],
    ],
    breath: "Respiri regolari; espira quando le anche salgono nei dip.",
  },
  reversePlank: {
    setup: ["Seduto con le gambe tese; mani a terra appena dietro le anche, dita rivolte verso i piedi."],
    steps: [
      "Spingi su mani e talloni e solleva le anche.",
      "Porta il corpo in linea retta dalle spalle ai talloni, punte tese.",
      "Mantieni il tempo, poi abbassa le anche.",
    ],
    targets: [
      "Braccia tese, polsi sotto le spalle.",
      "Anche allineate: una linea retta dalle spalle ai talloni.",
      "Petto aperto, spalle lontane dalle orecchie, testa neutra.",
    ],
    mistakes: [
      ["Anche che cedono", "Stringi glutei e femorali."],
      ["Spalle alzate", "Spingi via il pavimento."],
      ["Testa che cade indietro", "Guarda leggermente avanti, verso le punte."],
    ],
    breath: "Respiro regolare per tutto il tempo.",
  },
  copenhagen: {
    setup: ["Side plank con la gamba di sopra appoggiata su una panca — il ginocchio (più facile) o l'interno del piede (completa); la gamba di sotto libera sotto la panca."],
    steps: [
      "Premi la gamba di sopra sulla panca e solleva le anche.",
      "Porta la gamba di sotto su fino alla panca (versione completa) o tienila leggera a terra.",
      "Mantieni (o cammina con le mani, o allungati, come richiesto), poi scendi e cambia lato.",
    ],
    targets: [
      "Corpo dritto dalla testa ai piedi, anche sovrapposte.",
      "Gomito esattamente sotto la spalla.",
      "È l'interno coscia della gamba di sopra a sollevarti.",
    ],
    mistakes: [
      ["Anche che cedono verso terra", "Premi più forte la gamba di sopra sulla panca."],
      ["Leva lunga troppo presto", "Parti con il ginocchio sulla panca."],
      ["Ruotare in avanti", "Allinea le anche e apri il petto."],
    ],
    breath: "Respiri brevi e regolari.",
  },
  hangingLegRaise: {
    setup: ["Appenditi alla sbarra con le braccia tese e le spalle attive, corpo fermo."],
    steps: [
      "Solleva le ginocchia (o le gambe tese) arrotolando il bacino verso l'alto.",
      "Arriva all'altezza richiesta: ginocchia al petto, gambe orizzontali o punte alla sbarra.",
      "Scendi lentamente fino alla sospensione senza oscillare.",
    ],
    targets: [
      "Il bacino si arrotola: la ripetizione finisce con la zona lombare arrotondata, non solo con le gambe sollevate.",
      "Versioni a gambe tese: ginocchia bloccate, gambe unite.",
      "Toes-to-bar: le punte toccano la sbarra tra le mani.",
    ],
    mistakes: [
      ["Oscillare per prendere slancio", "Fermati immobile in basso a ogni ripetizione."],
      ["Lasciar cadere le gambe", "Scendi in 2–3 s."],
      ["Spalle alzate", "Tira le spalle in basso prima di iniziare."],
    ],
    breath: "Espira mentre sollevi, inspira mentre scendi.",
  },
  lyingLegRaise: {
    setup: ["Sdraiati sulla schiena, mani accanto alle anche o sotto la zona lombare, gambe tese e unite."],
    steps: [
      "Premi la zona lombare contro il pavimento.",
      "Solleva le gambe tese fino alla verticale.",
      "Abbassale lentamente fino appena sopra il pavimento, senza inarcare.",
    ],
    targets: [
      "Zona lombare aderente al pavimento per tutto il tempo.",
      "Gambe tese; verticali in alto (90° all'anca).",
      "Fermati in discesa dove la schiena si staccherebbe.",
    ],
    mistakes: [
      ["Zona lombare che si inarca", "Abbassa le gambe solo finché la schiena resta piatta."],
      ["Usare lo slancio", "Rallenta: 2 s su, 3 s giù."],
      ["Ginocchia che si piegano e si stendono", "Scegli gambe tese o leggermente piegate e mantienile così."],
    ],
    breath: "Espira mentre le gambe salgono, inspira mentre scendono.",
  },
  windshieldWipers: {
    setup: ["Appenditi alla sbarra e porta le gambe alla sbarra (oppure sdraiati sulla schiena con le gambe verticali e le braccia aperte a T)."],
    steps: [
      "Con le gambe in alto, ruotale lentamente verso un lato.",
      "Ritorna passando dal centro e ruota verso l'altro lato.",
      "Mantieni il movimento controllato dall'inizio alla fine.",
    ],
    targets: [
      "Gambe unite e tese, a circa 90° dal busto.",
      "La rotazione nasce dalla vita; le spalle restano dritte.",
      "Ampiezza: quanto riesci a controllare senza far scendere le gambe.",
    ],
    mistakes: [
      ["Gambe che scendono mentre ruotano", "Mantieni l'angolo all'anca a 90°."],
      ["Far oscillare il corpo", "Rallenta a ogni lato."],
      ["Troppa ampiezza troppo presto", "Aumenta la rotazione gradualmente."],
    ],
    breath: "Espira mentre ruoti di lato, inspira tornando al centro.",
  },
  sideLyingLift: {
    setup: ["Sdraiati su un fianco, gambe tese e sovrapposte, testa sul braccio di sotto, mano di sopra a terra davanti a te."],
    steps: [
      "Solleva lentamente la gamba di sopra (o entrambe, come richiesto) fino a circa 45°.",
      "Breve pausa in alto.",
      "Scendi lentamente senza appoggiare, poi ripeti; cambia lato.",
    ],
    targets: [
      "Corpo su un'unica linea dalla testa ai piedi; anche sovrapposte.",
      "Punte rivolte in avanti, non verso il soffitto.",
      "Il sollevamento viene dal lato dell'anca, non ruotando indietro.",
    ],
    mistakes: [
      ["Anca che ruota indietro", "Allinea le anche e porta le punte in avanti."],
      ["Slanciare la gamba", "Sollevamento lento e controllato."],
      ["Sollevare troppo in alto", "Fermati a circa 45°."],
    ],
    breath: "Espira mentre sollevi, inspira mentre scendi.",
  },
  adductorSqueeze: {
    setup: ["Sdraiati su un fianco; piega la gamba di sopra e appoggia il piede a terra davanti al ginocchio di sotto. La gamba di sotto è tesa."],
    steps: [
      "Solleva la gamba di sotto contraendo l'interno coscia.",
      "Pausa in alto per 1 s.",
      "Scendi lentamente; fai le ripetizioni, poi cambia lato.",
    ],
    targets: [
      "Gamba di sotto tesa, sollevata di 10–20 cm.",
      "Anche sovrapposte, senza ruotare indietro.",
      "Tempo lento con una pausa chiara in alto.",
    ],
    mistakes: [
      ["Ruotare all'indietro", "Tieni le anche sovrapposte."],
      ["Piegare il ginocchio che lavora", "Tienilo teso."],
      ["Ripetizioni affrettate", "Pausa in alto."],
    ],
    breath: "Espira mentre sollevi.",
  },
  hollow: {
    setup: ["Sdraiati sulla schiena, braccia tese sopra la testa vicino alle orecchie, gambe tese e unite."],
    steps: [
      "Premi con decisione la zona lombare contro il pavimento.",
      "Stacca spalle e gambe da terra.",
      "Mantieni la forma (o dondola piano mantenendo la stessa forma).",
    ],
    targets: [
      "Zona lombare incollata al pavimento — è tutto lì.",
      "Scapole staccate da terra; gambe a circa 15–30 cm d'altezza.",
      "Braccia vicino alle orecchie, gambe unite e tese, punte tese.",
    ],
    mistakes: [
      ["Zona lombare che si stacca", "Alza le gambe, piega le ginocchia o porta le braccia in avanti."],
      ["Mento proteso in avanti", "Guarda le punte, collo lungo."],
      ["Scendere più di quanto controlli", "Abbassati solo finché la schiena resta giù."],
    ],
    breath: "Respiri brevi e regolari nella pancia.",
  },
  deadBug: {
    setup: ["Sdraiati sulla schiena, braccia tese verso il soffitto, anche e ginocchia piegate a 90° (tibie parallele al pavimento)."],
    steps: [
      "Premi la zona lombare contro il pavimento.",
      "Distendi lentamente braccio e gamba opposti finché sono appena sopra il pavimento.",
      "Torna alla posizione iniziale e cambia lato.",
    ],
    targets: [
      "Zona lombare a terra per tutto il tempo.",
      "Anche e ginocchia a 90° nella posizione iniziale.",
      "Braccio e gamba distesi sono lunghi e appena sopra il pavimento.",
    ],
    mistakes: [
      ["Zona lombare che si inarca", "Riduci l'ampiezza di braccio e gamba."],
      ["Avere fretta", "3 s fuori, 3 s dentro."],
      ["Trattenere il respiro", "Espira mentre distendi."],
    ],
    breath: "Espira mentre distendi, inspira mentre torni.",
  },
  dragonFlag: {
    setup: ["Sdraiati su una panca e afferrala dietro la testa (o un palo dietro di te)."],
    steps: [
      "Sali sulla parte alta della schiena, sollevando il corpo dritto come una tavola.",
      "Scendi lentamente, tenendo il corpo dritto dalle spalle ai piedi.",
      "Mantieni in basso appena sopra la panca, o risali per i raise.",
    ],
    targets: [
      "Corpo dritto dalle spalle ai piedi — nessuna piega alle anche.",
      "Peso sulla parte alta della schiena e sulle scapole, mai sul collo.",
      "Discesa in 3–5 s.",
    ],
    mistakes: [
      ["Piegarsi alle anche", "Stringi i glutei; usa tuck o straddle per accorciare la leva."],
      ["Scendere di colpo", "Scendi lentamente."],
      ["Appoggiarsi sul collo", "Peso sulle scapole."],
    ],
    breath: "Espira salendo, inspira scendendo.",
  },
  lSit: {
    setup: ["Su parallettes, parallele o a terra: mani accanto alle anche, braccia tese, dita in avanti."],
    steps: [
      "Spingi forte verso il basso e stacca le anche da terra.",
      "Solleva le gambe davanti: tuck, una gamba tesa o entrambe tese.",
      "Mantieni con le spalle spinte in basso, poi appoggia i piedi.",
    ],
    targets: [
      "Braccia bloccate tese, spalle depresse — collo lungo.",
      "Gambe orizzontali: 90° all'anca.",
      "Versione completa: ginocchia bloccate, punte tese, gambe unite.",
    ],
    mistakes: [
      ["Spalle collassate", "Spingi forte il pavimento o le parallele in basso."],
      ["Gambe che scendono sotto l'orizzontale", "Usa il tuck finché le gambe restano su."],
      ["Ginocchia piegate nella versione completa", "Blocca le ginocchia e tendi le punte."],
    ],
    breath: "Respiri brevi e regolari.",
  },
  vSit: {
    setup: ["Parti da una L-sit (o seduto in pike con le mani accanto alle anche per le tenute in compressione), braccia tese."],
    steps: [
      "Porta le spalle leggermente indietro mentre spingi verso il basso.",
      "Solleva le gambe sopra l'orizzontale, verso il viso.",
      "Mantieni con le gambe tese, poi abbassale.",
    ],
    targets: [
      "Gambe sopra l'orizzontale: l'angolo all'anca è sotto i 90°.",
      "Braccia tese, mani accanto o leggermente dietro le anche.",
      "Gambe tese e compresse verso il busto.",
    ],
    mistakes: [
      ["Piegare le ginocchia", "Tienile bloccate; costruisci la compressione con le pike hold."],
      ["Spalle che si alzano", "Spingi il pavimento in basso, collo lungo."],
      ["Inclinarsi troppo indietro", "Inclinati solo quanto serve per bilanciarti."],
    ],
    breath: "Respiri brevi; la pancia è compressa.",
  },
  manna: {
    setup: ["Estremamente avanzato: padroneggia prima una V-sit solida. Mani dietro le anche con le dita rivolte indietro."],
    steps: [
      "Dalla V-sit, spingi le spalle indietro, dietro le mani.",
      "Solleva le anche più in alto, portando le gambe verso il viso.",
      "Mantieni la compressione estrema, poi torna alla V.",
    ],
    targets: [
      "Spalle fortemente estese dietro le mani.",
      "Gambe tese, ben sopra l'orizzontale.",
      "Braccia bloccate tese.",
    ],
    mistakes: [
      ["Braccia piegate", "Bloccale; torna a lavorare sulla V-sit."],
      ["Troppo volume", "Tenute brevi con lunghi recuperi per le spalle."],
      ["Gambe che scendono", "Lavora separatamente su compressione ed estensione delle spalle."],
    ],
    breath: "Respiri brevi.",
  },
  hipToShoulderRoll: {
    setup: ["Sdraiati sulla schiena, braccia lungo il corpo, palmi in giù."],
    steps: [
      "Solleva le gambe e rotola le anche sopra le spalle.",
      "Mantieni brevemente con le anche sopra le spalle.",
      "Rotola giù una vertebra alla volta.",
    ],
    targets: [
      "Anche sopra le spalle in alto.",
      "Peso su spalle e braccia, mai sul collo; non girare la testa.",
      "Rotolamento lento e controllato in entrambe le direzioni.",
    ],
    mistakes: [
      ["Rotolare sul collo", "Tieni il peso sulle scapole."],
      ["Scendere troppo in fretta", "Controlla la discesa."],
      ["Usare lo slancio per salire", "Solleva con gli addominali."],
    ],
    breath: "Espira mentre sali, inspira mentre scendi.",
  },
  ytw: {
    setup: ["Sdraiati a pancia in giù, fronte su un asciugamano, braccia aperte (con pesi leggeri solo se la versione lo chiede)."],
    steps: [
      "Solleva le braccia a Y, pollici in su; mantieni 2 s, scendi.",
      "Solleva le braccia a T; mantieni 2 s, scendi.",
      "Piega i gomiti a 90° e solleva a W stringendo le scapole; mantieni, scendi.",
    ],
    targets: [
      "Pollici verso l'alto nella Y e nella T.",
      "Scapole strette tra loro e in basso — non alzate.",
      "Collo rilassato, fronte vicina al pavimento.",
    ],
    mistakes: [
      ["Sollevare la testa", "Tieni la fronte giù."],
      ["Alzare le spalle", "Scapole in basso e indietro."],
      ["Slanciare le braccia", "Sollevamenti lenti con una pausa."],
    ],
    breath: "Espira mentre sollevi.",
  },
  superman: {
    setup: ["Sdraiati a pancia in giù, braccia tese sopra la testa, gambe tese (ginocchia a terra nella versione facile)."],
    steps: [
      "Solleva insieme braccia, petto e gambe da terra.",
      "Mantieni, o sali e scendi per i raise.",
      "Scendi lentamente.",
    ],
    targets: [
      "Braccia e gambe tese e lunghe.",
      "Testa in linea con la colonna, sguardo a terra.",
      "Glutei contratti; il sollevamento è distribuito su tutta la schiena.",
    ],
    mistakes: [
      ["Collo piegato all'indietro", "Tienilo neutro."],
      ["Ginocchia piegate", "Distendi le gambe."],
      ["Trattenere il respiro", "Respira in modo regolare."],
    ],
    breath: "Espira mentre sollevi.",
  },
};
