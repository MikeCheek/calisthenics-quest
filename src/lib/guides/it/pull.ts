import type { GuideTable } from "../index";

// Trazioni, sospensioni, leve, anelli e rotazioni alla sbarra.
export const PULL: GuideTable = {
  scapPull: {
    setup: ["Appenditi alla sbarra (o mantieni un appoggio) con le braccia tese, mani alla larghezza delle spalle, corpo fermo."],
    steps: [
      "Senza piegare i gomiti, tira le scapole in basso e verso il centro: il corpo sale di 3–5 cm.",
      "Tieni la posizione alta per 1–2 s e senti lavorare i muscoli sotto le ascelle.",
      "Lascia risalire lentamente le scapole fino alla sospensione iniziale.",
    ],
    targets: [
      "I gomiti restano bloccati a 180° per tutto il tempo — l'altezza viene solo dalle spalle.",
      "In alto le spalle sono lontane dalle orecchie; in basso risalgono, ma la presa non molla mai.",
      "Corpo verticale, gambe unite, nessuna oscillazione.",
    ],
    mistakes: [
      ["Piegare i gomiti per salire di più", "Pensa a spingere la sbarra verso i piedi con le braccia tese."],
      ["Alzare le spalle invece di abbassarle", "Guida con il petto: sollevalo leggermente verso la sbarra."],
      ["Scendere di colpo", "Scendi in 2 s, mantenendo il controllo."],
    ],
    breath: "Espira mentre abbassi le scapole, inspira mentre risalgono.",
  },
  deadHang: {
    setup: ["Afferra la sbarra con presa prona, mani circa alla larghezza delle spalle (più larghe nella versione larga), pollici attorno alla sbarra."],
    steps: [
      "Solleva i piedi e appenditi con le braccia tese.",
      "Tieni le spalle attive: leggermente tirate in basso, non appese ai legamenti (salvo nella versione passiva).",
      "Mantieni il tempo senza oscillare, poi scendi appoggiando i piedi invece di lasciarti cadere.",
    ],
    targets: [
      "Braccia tese (180° al gomito), corpo verticale, gambe unite e leggermente in avanti.",
      "Costole chiuse e glutei leggermente contratti — il corpo non si inarca.",
      "Versione passiva: lascia salire le spalle verso le orecchie e rilassati, purché senza dolore.",
    ],
    mistakes: [
      ["Oscillare", "Parti da fermo e stringi le gambe tra loro."],
      ["Gomiti piegati", "Blocca le braccia; se non ci riesci, accorcia la sospensione."],
      ["Pollici sopra la sbarra con una presa debole", "Avvolgi i pollici attorno alla sbarra per una presa più sicura."],
    ],
    breath: "Respiro lento e regolare dal naso — non trattenere il fiato.",
  },
  barSwing: {
    setup: ["Appenditi alla sbarra con le braccia tese e le spalle attive; gambe unite, punte tese."],
    steps: [
      "Spingi il petto tra le braccia e le gambe dietro: è l'arco (dietro dell'oscillazione).",
      "Poi tira la sbarra verso le anche a braccia tese e porta le gambe avanti: è l'hollow (davanti dell'oscillazione).",
      "Alterna arco e hollow a ritmo, facendo crescere l'oscillazione poco alla volta.",
    ],
    targets: [
      "Braccia sempre tese — il movimento viene dalle spalle e dalle anche.",
      "Nell'hollow il corpo è una C morbida con le gambe circa 30° avanti; nell'arco il petto è davanti alla sbarra.",
      "Gambe unite e tese per tutta l'oscillazione.",
    ],
    mistakes: [
      ["Piegare le ginocchia e scalciare", "Tieni le gambe tese: l'oscillazione nasce dalle spalle."],
      ["Oscillare troppo e troppo presto", "Parti piccolo e aumenta solo finché resti in controllo."],
      ["Presa che si allenta davanti", "Stringi forte la sbarra, soprattutto quando cambi direzione."],
    ],
    breath: "Espira nell'hollow, inspira nell'arco.",
  },
  invertedHang: {
    setup: ["Appenditi agli anelli con le braccia tese; porta le ginocchia al petto e rotola indietro finché le anche sono sopra la testa."],
    steps: [
      "Solleva le gambe in verticale, corpo a testa in giù e dritto, braccia tese lungo il corpo.",
      "Mantieni la posizione con gli anelli vicino alle anche.",
      "Esci raccogliendo le ginocchia e scendendo lentamente alla sospensione.",
    ],
    targets: [
      "Corpo verticale a testa in giù: spalle, anche e caviglie su una linea.",
      "Braccia tese, anelli accanto alle cosce, spalle tirate in basso.",
      "Testa neutra: sguardo verso le punte o in avanti, non a terra.",
    ],
    mistakes: [
      ["Braccia piegate", "Spingi gli anelli verso i piedi a braccia tese."],
      ["Chiudersi alle anche (pike)", "Stringi i glutei e spingi le anche in avanti."],
      ["Uscire di colpo", "Esci sempre raccogliendo le ginocchia, lentamente."],
    ],
    breath: "Respira con calma; a testa in giù è normale sentire la testa pesante — fermati se ti gira la testa.",
  },
  hangingLSit: {
    setup: ["Appenditi alla sbarra con le braccia tese e le spalle attive."],
    steps: [
      "Solleva davanti a te le gambe tese (o piegate, nella versione facile) fino all'orizzontale.",
      "Mantieni la L con le gambe ferme e il corpo che non oscilla.",
      "Abbassa le gambe lentamente fino alla sospensione.",
    ],
    targets: [
      "Angolo all'anca di 90°: gambe orizzontali, parallele al pavimento.",
      "Ginocchia bloccate, punte tese, gambe unite.",
      "Spalle tirate in basso, braccia tese.",
    ],
    mistakes: [
      ["Gambe che scendono sotto l'orizzontale", "Piega le ginocchia se serve e tieni le cosce orizzontali."],
      ["Oscillare per salire con le gambe", "Parti da una sospensione ferma e solleva lentamente."],
      ["Inclinarsi troppo indietro", "Tieni il busto quasi verticale; attiva gli addominali."],
    ],
    breath: "Respiri brevi e regolari durante la tenuta; non smettere di respirare.",
  },
  pullUp: {
    setup: ["Appenditi alla sbarra con presa prona, mani poco più larghe delle spalle, braccia tese, gambe unite e leggermente avanti."],
    steps: [
      "Inizia tirando le scapole in basso e indietro (una piccola scapula pull).",
      "Porta i gomiti verso le costole finché il mento supera la sbarra (nella chest-to-bar la sbarra tocca il petto).",
      "Breve pausa in alto, poi scendi in 2–3 s fino a braccia tese.",
    ],
    targets: [
      "In basso: gomiti completamente tesi (180°), spalle attive — non appeso alle spalle.",
      "In alto: mento chiaramente sopra la sbarra, gomiti verso il basso e leggermente avanti, circa 45° dal corpo.",
      "Il corpo resta una linea con un leggero hollow: niente calci, niente oscillazione.",
    ],
    mistakes: [
      ["Kipping o calci per salire", "Stringi le gambe e rallenta; usa un elastico se serve."],
      ["Mezze ripetizioni che non partono a braccia tese", "Conta ogni ripetizione solo da sospensione completa."],
      ["Mento allungato per arrivare alla sbarra", "Tieni il collo lungo e porta il petto alla sbarra."],
      ["Spalle alle orecchie in basso", "Inizia ogni ripetizione con la scapula pull."],
    ],
    breath: "Espira mentre sali, inspira mentre scendi.",
  },
  archerPullUp: {
    setup: ["Appenditi alla sbarra con una presa larga, circa 1,5–2 volte la larghezza delle spalle, braccia tese."],
    steps: [
      "Tira verso una mano: quel braccio si piega mentre l'altro resta teso, scivolando lungo la sbarra.",
      "Porta il mento sopra la mano che lavora.",
      "Typewriter: in alto, scivola verso l'altra mano restando all'altezza della sbarra, poi scendi.",
      "Scendi con controllo e cambia lato.",
    ],
    targets: [
      "Braccio che lavora: gomito vicino al corpo, che finisce circa 45° sotto la sbarra.",
      "Braccio di aiuto: teso (gomito a 180°), spinge sulla sbarra — fa il meno possibile.",
      "Mento sopra la mano che lavora, spalle all'altezza della sbarra.",
    ],
    mistakes: [
      ["Braccio di aiuto che si piega", "Tienilo bloccato; riduci la profondità se non ci riesci."],
      ["Corpo che ruota verso la mano", "Tieni il petto rivolto alla sbarra."],
      ["Typewriter che cala a metà", "Scivola lentamente tenendo il mento all'altezza della sbarra."],
    ],
    breath: "Espira salendo, inspira scendendo; nella typewriter respira mentre scivoli.",
  },
  oneArmPullUp: {
    setup: ["Appenditi a un braccio con la spalla attiva; l'altra mano sul polso, su un asciugamano o su un elastico, come chiede la versione."],
    steps: [
      "Tira in basso la scapola del braccio che lavora e blocca il core.",
      "Tira con il gomito verso l'anca, ruotando leggermente il palmo verso di te mentre sali.",
      "Porta il mento sopra la sbarra, poi scendi in 3–5 s.",
    ],
    targets: [
      "Gomito che lavora stretto alle costole, che finisce sotto la sbarra.",
      "Corpo dritto e leggermente ruotato verso il braccio che lavora; gambe unite, niente calci.",
      "In basso il braccio è teso, la spalla attiva — nessuna sospensione passiva.",
    ],
    mistakes: [
      ["Ruotare lontano dalla sbarra", "Porta la mano libera al petto e stringi le gambe."],
      ["Tirare con il braccio libero su asciugamano o polso", "Usalo solo per equilibrio, poi alleggeriscilo."],
      ["Negative veloci, lasciate cadere", "Conta 5 s per ogni negativa; fermati quando non le controlli più."],
    ],
    breath: "Espira nella parte più dura della trazione, inspira scendendo.",
  },
  lSitPullUp: {
    setup: ["Appenditi alla sbarra e solleva le gambe tese davanti a te a formare una L (piegate nella versione tuck)."],
    steps: [
      "Tieni le gambe orizzontali per tutta la ripetizione.",
      "Sali finché il mento supera la sbarra, tenendo ferma la L.",
      "Scendi fino a braccia tese senza far cadere le gambe.",
    ],
    targets: [
      "Angolo all'anca di 90°: gambe orizzontali per tutto il tempo.",
      "Ginocchia bloccate e punte tese (tuck: ginocchia al petto).",
      "Mento sopra la sbarra in alto; braccia completamente tese in basso.",
    ],
    mistakes: [
      ["Gambe che scendono mentre tiri", "Usa la versione tuck finché la L resta ferma."],
      ["Slanciare le gambe per salire", "Rallenta: 2 s su, 3 s giù."],
      ["Ampiezza ridotta", "Ogni ripetizione da braccia tese a mento sopra la sbarra."],
    ],
    breath: "Breve espirazione durante la trazione; respiri brevi nella tenuta.",
  },
  flagPullUp: {
    setup: ["In piedi accanto a un palo verticale: mano alta con presa prona all'altezza della testa, mano bassa con presa supina 50–70 cm più sotto."],
    steps: [
      "Inclina il corpo di lato, lontano dal palo, con le braccia tese (piedi a terra per iniziare).",
      "Tira con il braccio alto e spingi con quello basso, portando anche e petto vicino al palo.",
      "Torna lentamente all'inclinazione a braccia tese.",
    ],
    targets: [
      "Il braccio alto tira, quello basso spinge: lavorano in direzioni opposte.",
      "Corpo di lato in linea retta dalla testa ai piedi — le anche non cedono.",
      "In alto la spalla superiore è all'altezza della mano superiore.",
    ],
    mistakes: [
      ["Mani troppo vicine sul palo", "Mani ad almeno una larghezza di spalle di distanza."],
      ["Braccio basso che si piega", "Blocca il gomito basso e spingi forte."],
      ["Anche che cedono verso terra", "Contrai il fianco rivolto verso l'alto."],
    ],
    breath: "Espira tirando, inspira scendendo.",
  },
  muscleUp: {
    setup: ["Appenditi alla sbarra (falsa presa agli anelli) con le mani alla larghezza delle spalle; leggero hollow body."],
    steps: [
      "Tira in modo esplosivo, portando la sbarra alla parte bassa del petto (trazione alta).",
      "Quando la sbarra arriva al petto, porta il petto sopra la sbarra e i gomiti rapidamente dietro e in alto: la transizione.",
      "Spingi dal fondo del dip fino a braccia tese sopra la sbarra.",
      "Scendi allo stesso modo: dip, transizione, sospensione — lentamente.",
    ],
    targets: [
      "Trazione alta: la sbarra arriva allo sterno o all'ombelico, non solo al mento.",
      "Nella transizione i polsi girano sopra la sbarra e le spalle passano davanti alle mani.",
      "Arrivo: braccia tese, spalle spinte in basso, corpo dritto sopra la sbarra.",
    ],
    mistakes: [
      ["Tirare troppo basso e bloccarsi alla transizione", "Allena prima le trazioni alte al petto."],
      ["Un braccio che passa prima dell'altro (chicken wing)", "Gira i polsi insieme; riduci il volume."],
      ["Troppo kip nella versione strict", "Parti ogni ripetizione da una sospensione ferma."],
    ],
    breath: "Inspira in basso, espira forte nella trazione, inspira di nuovo in alto.",
  },
  row: {
    setup: ["Sdraiati sotto una sbarra bassa o anelli all'altezza delle anche; afferra a braccia tese, talloni a terra, corpo dritto."],
    steps: [
      "Contrai glutei e addominali: il corpo è un plank dai talloni alla testa.",
      "Porta il petto alla sbarra, gomiti indietro vicino al corpo.",
      "Pausa di 1 s in alto, poi scendi fino a braccia tese.",
    ],
    targets: [
      "Corpo dritto dai talloni alla testa per tutto il tempo: le anche non cedono.",
      "In alto il petto tocca la sbarra (o gli anelli sono accanto al petto), gomiti a circa 45° dal corpo.",
      "Scapole strette in alto.",
    ],
    mistakes: [
      ["Anche che cedono", "Stringi i glutei; piega le ginocchia per una versione più facile."],
      ["Mento in avanti per arrivare alla sbarra", "Guida con il petto e tieni il collo lungo."],
      ["Fermarsi prima della sbarra", "Metti il corpo più verticale finché riesci a toccare."],
    ],
    breath: "Espira tirando, inspira scendendo.",
  },
  frontLever: {
    setup: ["Appenditi alla sbarra o agli anelli con presa prona alla larghezza delle spalle e le braccia tese."],
    steps: [
      "A braccia bloccate, tira la sbarra verso le anche: il corpo si inclina indietro.",
      "Solleva le anche finché il corpo (o il tuck) è orizzontale, a pancia in su.",
      "Mantieni la linea (o sali e scendi per i raise; tira la sbarra alle anche per i row).",
      "Esci lentamente come sei entrato.",
    ],
    targets: [
      "Braccia tese (180° al gomito) e a circa 90° dal busto alla spalla.",
      "Corpo orizzontale: spalle, anche e fine della leva alla stessa altezza.",
      "Scapole tirate in basso e indietro, leggero hollow nella zona lombare.",
    ],
    mistakes: [
      ["Anche che cedono o si chiudono", "Usa una forma più facile (tuck, advanced tuck) finché la linea è orizzontale."],
      ["Gomiti piegati", "Blocca le braccia e spingi la sbarra verso le anche."],
      ["Trattenere il respiro", "Respira breve e mantieni la tensione."],
    ],
    breath: "Respiri brevi e regolari nella tenuta; espira nella parte più dura di raise e row.",
  },
  germanHang: {
    setup: ["Appenditi ad anelli o sbarra; raccogli le ginocchia e rotola indietro tra le braccia."],
    steps: [
      "Passa a testa in giù con le ginocchia raccolte (skin the cat).",
      "Lascia scendere i piedi dietro di te finché le spalle sono completamente aperte: la German hang.",
      "Pausa, poi ritorna dallo stesso percorso alla sospensione.",
    ],
    targets: [
      "Braccia tese per tutto il tempo; l'allungamento è nella parte anteriore delle spalle.",
      "In basso il corpo pende dietro le mani, punte dei piedi verso terra.",
      "Vai solo fin dove le spalle lo permettono senza dolore acuto.",
    ],
    mistakes: [
      ["Scendere di colpo in basso", "Scendi lentamente, usando le ginocchia raccolte per controllare la velocità."],
      ["Piegare le braccia", "Tieni i gomiti bloccati; vai meno in profondità."],
      ["Andare oltre quanto le spalle permettono", "Aumenta la profondità nelle settimane, all'inizio con i piedi a terra."],
    ],
    breath: "Espira mentre passi a testa in giù, respira con calma nella tenuta.",
  },
  backLever: {
    setup: ["Dalla sospensione, rotola indietro fino alla sospensione rovesciata (skin the cat), braccia tese."],
    steps: [
      "Dalla posizione rovesciata, abbassa il corpo dietro le mani a braccia bloccate.",
      "Fermati quando il corpo (o il tuck) è orizzontale, a pancia in giù.",
      "Mantieni, o risali in verticale per i raise.",
    ],
    targets: [
      "Braccia tese, leggermente dietro al corpo; mani vicine alle anche.",
      "Corpo orizzontale a pancia in giù: spalle, anche e piedi alla stessa altezza.",
      "Glutei contratti, zona lombare non inarcata.",
    ],
    mistakes: [
      ["Inarcare la zona lombare", "Stringi i glutei e retroverti il bacino."],
      ["Piegare i gomiti", "Blocca le braccia; lavora nel tuck."],
      ["Anche sotto la linea delle spalle", "Spingi le anche in alto verso la linea."],
    ],
    breath: "Respira breve nella tenuta; non smettere di respirare.",
  },
  victorian: {
    setup: ["Anelli, falsa presa. Una tenuta molto avanzata: padroneggia prima il back lever completo e la croce."],
    steps: [
      "Dall'appoggio o dal back lever, porta le braccia avanti-basso e il corpo orizzontale a pancia in su.",
      "Mantieni il corpo orizzontale con le braccia tese davanti alle anche.",
      "Esci raccogliendo in tuck o tornando all'appoggio.",
    ],
    targets: [
      "Corpo orizzontale a pancia in su, braccia tese e inclinate in avanti dalle anche.",
      "Spalle fortemente depresse, costole chiuse.",
      "Appoggio dei piedi solo nella versione assistita — il meno possibile.",
    ],
    mistakes: [
      ["Gomiti che si piegano", "Interrompi la serie: la Victorian si fa solo a braccia tese."],
      ["Anche che cedono", "Contrai glutei e addominali."],
      ["Allenarla troppo spesso", "Al massimo 1–2 volte a settimana, con giorni di riposo per i gomiti."],
    ],
    breath: "Respiri brevi, mantieni la tensione; esci prima di perdere la forma.",
  },
  ironCross: {
    setup: ["Anelli all'altezza delle spalle o più in alto, ruotati verso l'esterno; parti da un appoggio solido."],
    steps: [
      "Dall'appoggio, apri lentamente le braccia di lato a gomiti tesi.",
      "Fermati dove controlli ancora (tuck/assistita) o con le braccia orizzontali (croce completa).",
      "Mantieni, poi spingi di nuovo fino all'appoggio.",
    ],
    targets: [
      "Braccia tese e orizzontali, in linea con le spalle, anelli accanto alle spalle.",
      "Corpo verticale (o a testa in giù nella croce rovesciata), gambe unite.",
      "Spalle spinte in basso — non alle orecchie.",
    ],
    mistakes: [
      ["Gomiti piegati", "La croce è una tenuta a braccia tese: abbassa la difficoltà."],
      ["Anelli che scivolano in avanti", "Tieni gli anelli in linea con le spalle, di lato."],
      ["Spalle alzate", "Spingi gli anelli in basso e lontano da te."],
    ],
    breath: "Respiri brevi e regolari; mai trattenere il fiato in una tenuta a braccia tese.",
  },
  ringPullOut: {
    setup: ["Appoggio agli anelli, braccia tese, ruotate verso l'esterno, corpo dritto."],
    steps: [
      "Lascia scivolare lentamente gli anelli di lato mentre il corpo scende un po'.",
      "Vai solo fin dove controlli ancora (per iniziare, una leggera apertura).",
      "Riporta gli anelli all'appoggio a braccia tese.",
    ],
    targets: [
      "Braccia sempre tese: i gomiti non si piegano.",
      "Gli anelli si aprono di lato, non in avanti.",
      "Spalle spinte in basso per tutto il tempo.",
    ],
    mistakes: [
      ["Piegare i gomiti per rientrare", "Riduci l'ampiezza finché riesci a rientrare a braccia tese."],
      ["Anelli che scivolano in avanti", "Tienili in linea con le spalle."],
      ["Aprire troppo e troppo presto", "Aumenta l'ampiezza di pochi centimetri a settimana."],
    ],
    breath: "Inspira mentre gli anelli si aprono, espira mentre li riporti dentro.",
  },
  straightArmPulldown: {
    setup: ["Fissa un elastico sopra l'altezza della testa; mettiti di fronte, braccia tese in avanti e in alto, tenendo l'elastico."],
    steps: [
      "A gomiti bloccati, tira l'elastico in basso con un arco fino alle cosce.",
      "In basso contrai i dorsali e le scapole verso il basso.",
      "Torna lentamente all'inizio.",
    ],
    targets: [
      "Gomiti tesi (180°) per tutto l'arco.",
      "Busto fermo, leggermente in hollow — senza inclinarsi indietro.",
      "In basso le mani arrivano alle cosce, spalle lontane dalle orecchie.",
    ],
    mistakes: [
      ["Piegare i gomiti", "Elastico più leggero, braccia tese."],
      ["Inclinarsi indietro per aiutarsi", "Costole chiuse e anche ferme."],
      ["Ritorno veloce", "2–3 s per risalire."],
    ],
    breath: "Espira tirando in basso, inspira tornando su.",
  },
  ropePull: {
    setup: ["Seduto a terra con le gambe tese, afferra la corda davanti a te a braccia distese."],
    steps: [
      "Tira con un braccio, portando la mano al petto.",
      "Allunga l'altra mano e afferra più in alto.",
      "Continua una mano dopo l'altra, sollevando leggermente il corpo.",
    ],
    targets: [
      "Tira con la schiena: i gomiti vanno in basso e indietro, non in fuori.",
      "Busto dritto, gambe tese a terra.",
      "Le mani afferrano sempre sopra la presa precedente — niente scivolamenti.",
    ],
    mistakes: [
      ["Tirare solo con i bicipiti", "Inizia ogni tirata abbassando la scapola."],
      ["Inclinarsi indietro", "Tieni il busto dritto."],
      ["Lasciar scivolare la corda tra le mani", "Stringi bene prima di ogni tirata."],
    ],
    breath: "Espira a ogni tirata.",
  },
  ropeClimb: {
    setup: ["Afferra la corda alla massima altezza; impara il blocco dei piedi (corda tra i piedi, un piede sopra) prima di salire in alto."],
    steps: [
      "Tira con le braccia e porta su le ginocchia.",
      "Blocca la corda tra i piedi e alzati in piedi su di essa.",
      "Afferra più in alto con le mani e ripeti; legless: solo braccia, una mano dopo l'altra.",
      "Scendi una mano sotto l'altra, senza mai scivolare.",
    ],
    targets: [
      "Blocco dei piedi saldo: la corda è stretta tra le suole.",
      "Le braccia tirano al petto, le gambe spingono: il lavoro è condiviso.",
      "Discesa controllata, una mano sotto l'altra.",
    ],
    mistakes: [
      ["Usare solo le braccia quando le gambe potrebbero aiutare", "Usa il blocco dei piedi in tutte le versioni tranne la legless."],
      ["Perdere il blocco delle gambe in discesa", "Mantienilo finché i piedi sono vicini a terra."],
      ["Scivolare giù velocemente", "Sempre una mano sotto l'altra — scivolare brucia le mani."],
    ],
    breath: "Espira a ogni tirata, inspira mentre riposizioni i piedi.",
  },
  monkeyBars: {
    setup: ["Appenditi al primo piolo con entrambe le mani, braccia tese."],
    steps: [
      "Fai oscillare leggermente il corpo verso il lato della mano libera.",
      "Afferra il piolo successivo al culmine dell'oscillazione.",
      "Continua alternando, usando il ritmo dell'oscillazione.",
    ],
    targets: [
      "Braccia per lo più tese: resti appeso, non fai trazioni.",
      "Spalle attive: non collassano a ogni presa.",
      "Un ritmo fluido e continuo da un piolo all'altro.",
    ],
    mistakes: [
      ["Fermarsi a riposare tra i pioli", "Continua a muoverti con l'oscillazione; riposa alla fine."],
      ["Braccia piegate e stanche", "Resta appeso a braccia lunghe tra una presa e l'altra."],
      ["Allungarsi senza sfruttare l'oscillazione", "Prima oscilla, poi afferra."],
    ],
    breath: "Respira a ritmo con le prese.",
  },
  humanFlag: {
    setup: ["Afferra un palo verticale: mano alta con presa prona all'altezza della testa, mano bassa con presa supina circa una larghezza di spalle più sotto."],
    steps: [
      "Spingi forte con il braccio basso e tira con quello alto.",
      "Solleva il corpo di lato: inizia in tuck, poi estendi le gambe.",
      "Mantieni in orizzontale, poi scendi con controllo.",
    ],
    targets: [
      "Braccio basso bloccato teso, che spinge; braccio alto teso, che tira.",
      "Corpo orizzontale: spalle, anche e piedi su una linea.",
      "Anche sovrapposte: l'anca superiore esattamente sopra quella inferiore.",
    ],
    mistakes: [
      ["Braccio basso che si piega", "Spingi forte; costruisci la forza con i pole lean."],
      ["Anche che cedono", "Contrai il fianco superiore e solleva la gamba di sopra."],
      ["Mani troppo vicine", "Mani ad almeno una larghezza di spalle di distanza."],
    ],
    breath: "Respiri brevi nella tenuta.",
  },
  poleLean: {
    setup: ["Afferra un palo verticale come per la bandiera; piedi a terra, a un passo dal palo."],
    steps: [
      "Inclina il corpo di lato, lontano dal palo, a braccia tese.",
      "Spingi con il braccio basso e tira con quello alto, sentendo lavorare il fianco.",
      "Mantieni, poi torna dritto.",
    ],
    targets: [
      "Braccia tese; il braccio basso spinge, quello alto tira.",
      "Corpo dritto dalla testa ai piedi, inclinato di circa 45°.",
      "Piedi leggeri a terra: prendono solo il peso che ancora non riesci a reggere.",
    ],
    mistakes: [
      ["Anche che cedono verso il palo", "Spingi le anche lontano e tieni il corpo dritto."],
      ["Braccio basso che si piega", "Blocca il gomito e spingi."],
      ["Troppo peso sui piedi", "Inclinati di più man mano che diventi più forte."],
    ],
    breath: "Respira con calma nella tenuta.",
  },
  giantSwing: {
    setup: ["Avanzato: impara su una sbarra bassa con assistenza o una fascia. Presa prona, pollici attorno, magnesite."],
    steps: [
      "Dall'appoggio sulla sbarra, lancia il corpo indietro e in alto verso la verticale.",
      "Scendi con il corpo lungo e dritto, braccia bloccate.",
      "In basso passa velocemente dall'arco all'hollow per portare il corpo su e attorno alla sbarra.",
      "In alto porta le mani sopra la sbarra per completare il giro.",
    ],
    targets: [
      "Braccia tese per tutto il giro.",
      "Corpo lungo e dritto in discesa, leggero hollow in salita.",
      "I polsi passano sopra la sbarra quando il corpo supera la verticale.",
    ],
    mistakes: [
      ["Piegare le braccia", "Blocca i gomiti; è l'oscillazione a farti girare."],
      ["Presa allentata in alto", "Riprendi la presa rapidamente mentre passi sopra la sbarra."],
      ["Allenarla senza assistenza o fascia", "Imparala sempre con un aiuto."],
    ],
    breath: "Inspira in alto, espira mentre passi velocemente dal basso.",
  },
  hipCircleBar: {
    setup: ["Appoggio frontale sulla sbarra: mani in presa prona, braccia tese, sbarra alle anche."],
    steps: [
      "Porta le gambe leggermente indietro, poi lasciale tornare avanti contro la sbarra.",
      "Inclina le spalle indietro e gira attorno alla sbarra, tenendo le anche a contatto.",
      "Torna all'appoggio frontale.",
    ],
    targets: [
      "Le anche restano a contatto con la sbarra per tutto il giro.",
      "Braccia tese nell'appoggio, leggermente piegate durante la rotazione.",
      "Gambe unite e tese.",
    ],
    mistakes: [
      ["Anche che si staccano dalla sbarra", "Tieni la sbarra sotto le anche per tutto il tempo."],
      ["Aprirsi troppo presto", "Resta compatto finché non sei di nuovo in appoggio."],
      ["Presa allentata", "Stringi la sbarra e riprendi la presa mentre risali."],
    ],
    breath: "Espira durante la rotazione.",
  },
  barSpin: {
    setup: ["Trick avanzato alla sbarra. Impara con i piedi assistiti su una sbarra bassa; magnesite e una zona di atterraggio morbida."],
    steps: [
      "Dall'appoggio, fai oscillare il corpo per prendere slancio.",
      "Gira il corpo attorno alla sbarra (windmill: le gambe attorno; around the world: tutto il corpo).",
      "Muovi le mani per riprendere la presa mentre il corpo passa sopra.",
      "Chiudi in appoggio o in una sospensione controllata.",
    ],
    targets: [
      "La rotazione nasce dall'oscillazione e dalle anche, non tirando a braccia piegate.",
      "Mani sempre sulla sbarra o in ripresa nello stesso istante.",
      "Corpo compatto e contratto durante la rotazione.",
    ],
    mistakes: [
      ["Lasciare la presa troppo presto", "Riprendi una mano alla volta, mai entrambe."],
      ["Troppo poco slancio", "Costruisci l'oscillazione prima di provare a girare."],
      ["Provarla in alto senza assistenza", "Parti basso, con i piedi che aiutano."],
    ],
    breath: "Espira durante la rotazione.",
  },
};
