import type { GuideTable } from "../index";

// Pilates a corpo libero.
export const PILATES: GuideTable = {
  pelvicTilts: {
    setup: ["Sdraiati sulla schiena, ginocchia piegate, piedi alla larghezza delle anche e appoggiati; braccia lungo i fianchi."],
    steps: [
      "Inspira nella parte posteriore e laterale delle costole, bacino neutro (un piccolo spazio sotto la zona lombare).",
      "Espira e inclina il bacino in modo che la zona lombare prema dolcemente sul tappetino.",
      "Inspira e torna in neutro; tieni il movimento piccolo e lento.",
    ],
    targets: [
      "Si muove solo il bacino; costole e spalle restano rilassate sul tappetino.",
      "Neutro: creste iliache e pube allo stesso livello, come un tavolo piatto.",
      "Gli addominali profondi rientrano sull'espirazione — senza spingere con le gambe.",
    ],
    mistakes: [
      ["Spingere con i piedi o stringere i glutei", "Lascia che siano solo gli addominali a inclinare il bacino."],
      ["Respirare solo nella pancia", "Respira ampio nei lati e nella parte posteriore delle costole."],
      ["Muoversi troppo in fretta", "Un respiro completo per ogni inclinazione."],
    ],
    breath: "Inspira in neutro, espira per inclinare.",
  },
  chestLift: {
    setup: ["Sdraiati sulla schiena, ginocchia piegate, piedi appoggiati; mani dietro la testa, gomiti larghi."],
    steps: [
      "Inspira per prepararti.",
      "Espira: abbassa leggermente il mento e arrotola testa e spalle via dal tappetino, costole che scivolano verso le anche.",
      "Inspira in alto; espira e scendi lentamente.",
    ],
    targets: [
      "Sali fino alla punta inferiore delle scapole — la zona lombare resta sul tappetino.",
      "Lo spazio di un pugno tra mento e petto.",
      "I gomiti restano larghi; le mani sostengono la testa, non la tirano.",
    ],
    mistakes: [
      ["Tirare la testa con le mani", "Lascia la testa pesante nelle mani."],
      ["Pancia che si gonfia", "Porta l'ombelico verso la colonna sull'espirazione."],
      ["Mento schiacciato sul petto", "Mantieni lo spazio di un pugno."],
    ],
    breath: "Espira per salire, inspira in alto, espira per scendere.",
  },
  hundred: {
    setup: ["Sdraiati sulla schiena; porta le gambe in tabletop (ginocchia sopra le anche, tibie parallele al pavimento) o distendile, come chiede la versione."],
    steps: [
      "Arrotola testa e spalle fino alla punta inferiore delle scapole; braccia tese lungo i fianchi, pochi centimetri sopra il tappetino.",
      "Muovi le braccia su e giù con battiti piccoli e rapidi.",
      "Inspira per 5 battiti ed espira per 5, per 10 cicli (100 battiti).",
    ],
    targets: [
      "Tabletop: anche e ginocchia a 90°; gambe distese a circa 45°, più basse nella versione a gambe basse.",
      "La zona lombare resta sul tappetino per tutto il tempo.",
      "Battiti delle braccia piccoli (10–15 cm), dalle spalle, braccia tese.",
    ],
    mistakes: [
      ["Zona lombare che si stacca dal tappetino", "Alza le gambe o torna in tabletop."],
      ["Collo in tensione", "Appoggia la testa per qualche ciclo, poi risali."],
      ["Battiti ampi e molli", "Battiti piccoli e decisi dalle spalle."],
    ],
    breath: "Inspira per 5 battiti, espira per 5 battiti.",
  },
  singleLegStretch: {
    setup: ["Sdraiati sulla schiena, testa e spalle arrotolate in alto; entrambe le ginocchia al petto."],
    steps: [
      "Distendi la gamba sinistra a circa 45° tenendo la tibia destra (mano destra sulla caviglia, sinistra sul ginocchio).",
      "Cambia gamba, cambiando anche le mani.",
      "Continua ad alternare a ritmo, con il busto fermo.",
    ],
    targets: [
      "Gamba distesa a circa 45° (più in alto se la schiena si stacca), in linea con l'anca.",
      "Zona lombare sul tappetino, spalle arrotolate in alto.",
      "Ginocchio piegato tirato verso il petto, in linea con l'anca.",
    ],
    mistakes: [
      ["Busto che dondola da un lato all'altro", "Tieni ferme le spalle; rallenta."],
      ["Zona lombare che si inarca", "Alza la gamba distesa."],
      ["Ginocchio che cade verso l'esterno", "Tienilo in linea con l'anca."],
    ],
    breath: "Inspira per due cambi di gamba, espira per due.",
  },
  doubleLegStretch: {
    setup: ["Sdraiati sulla schiena, testa e spalle arrotolate in alto, ginocchia al petto, mani sulle tibie."],
    steps: [
      "Inspira: allunga insieme le braccia indietro vicino alle orecchie e le gambe a circa 45°.",
      "Espira: porta le braccia in cerchio di lato e riabbraccia le ginocchia.",
      "Ripeti, tenendo testa e spalle arrotolate.",
    ],
    targets: [
      "Braccia e gambe si distendono insieme, gambe a circa 45°.",
      "La zona lombare resta giù.",
      "La testa resta sollevata mentre le braccia vanno indietro.",
    ],
    mistakes: [
      ["Testa che cade quando le braccia vanno indietro", "Porta le braccia meno indietro."],
      ["Schiena che si inarca", "Gambe più in alto."],
      ["Avere fretta", "Allungati bene, poi riabbraccia."],
    ],
    breath: "Inspira per distendere, espira per riabbracciare.",
  },
  crissCross: {
    setup: ["Sdraiati sulla schiena, mani dietro la testa, testa e spalle arrotolate in alto, gambe in tabletop."],
    steps: [
      "Distendi la gamba destra e ruota il busto, portando la spalla destra verso il ginocchio sinistro.",
      "Cambia: distendi la gamba sinistra e ruota verso il ginocchio destro.",
      "Continua lentamente, mantenendo ogni torsione per un istante.",
    ],
    targets: [
      "La rotazione viene dalle costole: la spalla va verso il ginocchio, non il gomito.",
      "I gomiti restano larghi.",
      "Gamba distesa a circa 45°; anche ferme.",
    ],
    mistakes: [
      ["Tirare la testa", "Le mani sostengono soltanto."],
      ["Muovere solo i gomiti", "Ruota il petto."],
      ["Anche che dondolano", "Tieni fermo il bacino."],
    ],
    breath: "Espira mentre ruoti; inspira passando dal centro.",
  },
  legCircles: {
    setup: ["Sdraiati sulla schiena, una gamba tesa verso l'alto (piegata al ginocchio se il femorale è rigido), l'altra tesa sul tappetino; braccia lungo i fianchi."],
    steps: [
      "Disegna un cerchio con la gamba sollevata: attraverso il corpo, in basso, attorno e di nuovo su.",
      "Fai 5 cerchi in un senso, poi 5 nell'altro.",
      "Cambia gamba.",
    ],
    targets: [
      "Cerchi non più larghi delle spalle.",
      "Bacino fermo: entrambe le creste iliache restano sul tappetino.",
      "Gamba sollevata lunga, punte che si allungano.",
    ],
    mistakes: [
      ["Bacino che dondola", "Fai cerchi più piccoli."],
      ["Gamba di sotto piegata che si solleva", "Premila giù o piegala con il piede appoggiato."],
      ["Avere fretta", "Cerchi lenti e fluidi."],
    ],
    breath: "Inspira nella prima metà del cerchio, espira per completarlo.",
  },
  teaser: {
    setup: ["Sdraiati sulla schiena con le gambe a 45° (o in tabletop, o con una gamba piegata nella versione a una gamba), braccia sopra la testa."],
    steps: [
      "Inspira: porta le braccia in avanti.",
      "Espira: arrotolati su vertebra per vertebra fino a bilanciarti in una V sugli ischi.",
      "Mantieni (teaser hold) o srotolati giù lentamente con controllo.",
    ],
    targets: [
      "Nella V: busto e gambe a circa 45° ciascuno, braccia parallele alle gambe.",
      "Equilibrio appena dietro gli ischi; colonna lunga, petto alto.",
      "Gambe unite e tese (una gamba tesa nella versione a una gamba).",
    ],
    mistakes: [
      ["Salire di scatto con lo slancio", "Arrotolati su una vertebra alla volta."],
      ["Schiena arrotondata e collassata in alto", "Solleva il petto e allungati."],
      ["Gambe che cadono mentre scendi", "Scendi prima con il busto, le gambe per ultime."],
    ],
    breath: "Inspira per prepararti, espira per salire, inspira in alto, espira per scendere.",
  },
  spineStretch: {
    setup: ["Seduto dritto con le gambe tese e poco più larghe delle anche, piedi a martello; braccia allungate in avanti all'altezza delle spalle."],
    steps: [
      "Inspira e allungati verso l'alto con la sommità della testa.",
      "Espira: abbassa il mento e arrotondati in avanti una vertebra alla volta, come sopra una grande palla, allungando le mani in avanti.",
      "Inspira e risali impilando la colonna dal basso fino a sederti dritto.",
    ],
    targets: [
      "Una curva a C: l'allungamento è lungo tutta la schiena, le anche restano allineate e ferme.",
      "Ischi pesanti sul tappetino; gambe tese, rotule in su.",
      "Braccia parallele al pavimento, spalle rilassate.",
    ],
    mistakes: [
      ["Piegarsi in avanti a schiena piatta", "Arrotonda la colonna come sopra una palla."],
      ["Cadere indietro dagli ischi", "Siediti su un cuscino se il bacino va indietro."],
      ["Spalle che salgono", "Allungati in avanti, spalle basse."],
    ],
    breath: "Espira mentre ti arrotondi in avanti, inspira mentre risali.",
  },
  mermaid: {
    setup: ["Seduto con entrambe le gambe piegate verso destra (z-sit); mano sinistra sulla tibia sinistra, mano destra a terra accanto a te."],
    steps: [
      "Inspira: solleva il braccio sinistro vicino all'orecchio.",
      "Espira: fletti lateralmente verso destra, allungandoti in alto e oltre.",
      "Inspira per tornare su; allungati dall'altra parte con la mano destra a terra; poi cambia il lato delle gambe.",
    ],
    targets: [
      "Una flessione laterale pura: il petto guarda avanti, non in basso.",
      "Entrambi gli ischi pesanti sul tappetino.",
      "Un arco lungo dall'anca alla punta delle dita.",
    ],
    mistakes: [
      ["Crollare in avanti", "Tieni il petto aperto in avanti."],
      ["Sollevare l'anca opposta", "Ancora entrambi gli ischi."],
      ["Alzare la spalla che si allunga", "Allungati lungo, spalla bassa."],
    ],
    breath: "Espira nella flessione laterale, inspira tornando al centro.",
  },
  spineTwist: {
    setup: ["Seduto dritto con le gambe tese e unite, piedi a martello; braccia aperte di lato all'altezza delle spalle."],
    steps: [
      "Inspira e allungati verso l'alto.",
      "Espira: ruota il busto da un lato in due impulsi, crescendo in altezza.",
      "Inspira tornando al centro; ripeti dall'altra parte.",
    ],
    targets: [
      "Il bacino resta fermo e frontale; i piedi restano allineati.",
      "Rotazione dalle costole in su, braccia in linea con le spalle.",
      "Colonna alta — senza inclinarsi indietro.",
    ],
    mistakes: [
      ["Anche che si spostano", "Premi gli ischi in modo uniforme."],
      ["Inclinarsi indietro", "Siediti su un cuscino; allungati."],
      ["Braccia che si muovono per conto loro", "Le braccia seguono il petto."],
    ],
    breath: "Espira per ruotare, inspira tornando al centro.",
  },
  saw: {
    setup: ["Seduto dritto con le gambe tese e più larghe delle anche, piedi a martello; braccia aperte di lato."],
    steps: [
      "Inspira: ruota il busto verso destra.",
      "Espira: piegati in avanti sopra la gamba destra, portando il mignolo sinistro oltre il mignolo del piede destro, come per segarlo.",
      "Inspira e risali, torna al centro e ripeti verso sinistra.",
    ],
    targets: [
      "Entrambi gli ischi restano giù mentre ti allunghi.",
      "Il braccio dietro si allunga indietro, palmo rivolto in basso.",
      "La piegatura arriva dopo la rotazione, non al suo posto.",
    ],
    mistakes: [
      ["Sollevare l'anca per arrivare più lontano", "Allungati solo finché entrambi gli ischi restano giù."],
      ["Perdere la rotazione quando ti pieghi", "Prima ruota, poi piegati."],
      ["Ginocchia piegate", "Distendile, o siediti su un cuscino."],
    ],
    breath: "Espira mentre ti allunghi e 'seghi'; inspira per risalire.",
  },
  swanPrep: {
    setup: ["Sdraiati a pancia in giù, mani sotto le spalle, gomiti vicini al corpo, gambe tese e alla larghezza delle anche."],
    steps: [
      "Allunga il corpo dalla testa alle punte, pancia leggermente sollevata.",
      "Inspira: solleva la testa, poi il petto, premendo leggermente le mani.",
      "Espira: scendi con controllo.",
    ],
    targets: [
      "Sali fino alla base dello sterno; costole basse e anche restano giù.",
      "Collo lungo, in linea con la colonna.",
      "Spalle basse, lontane dalle orecchie.",
    ],
    mistakes: [
      ["Spingersi su con le braccia", "Solleva con i muscoli della schiena."],
      ["Piegare il collo indietro", "Guarda leggermente in avanti."],
      ["Schiacciare la zona lombare", "Allunga le gambe lontano da te."],
    ],
    breath: "Inspira per salire, espira per scendere.",
  },
  swan: {
    setup: ["Sdraiati a pancia in giù, mani sotto le spalle, gomiti vicini al corpo."],
    steps: [
      "Inspira: premi le mani e solleva testa, petto e parte alta della pancia.",
      "Distendi le braccia quanto la schiena permette, le anche restano giù.",
      "Espira: scendi con controllo, una vertebra alla volta.",
    ],
    targets: [
      "Un arco uniforme lungo tutta la colonna, anche sul tappetino.",
      "Spalle basse, gomiti vicini al corpo.",
      "Gambe lunghe e leggermente attive.",
    ],
    mistakes: [
      ["Anche che si staccano dal tappetino", "Sali meno in alto."],
      ["Spalle alle orecchie", "Portale in basso."],
      ["Schiacciarsi nella zona lombare", "Prima allungati, poi sali."],
    ],
    breath: "Inspira per salire, espira per scendere.",
  },
  swanDive: {
    setup: ["Avanzato. Parti dallo swan, braccia tese."],
    steps: [
      "Lascia le mani e allunga le braccia in avanti.",
      "Dondola in avanti sul petto mentre le gambe si sollevano.",
      "Dondola indietro mentre il petto si solleva, mantenendo l'arco.",
    ],
    targets: [
      "Il corpo mantiene un arco costante, come una sedia a dondolo.",
      "Gambe tese e unite.",
      "Braccia allungate in avanti in linea con le orecchie.",
    ],
    mistakes: [
      ["Perdere l'arco", "Tieni attivi i muscoli della schiena."],
      ["Piegare le ginocchia", "Stringi le gambe tese."],
      ["Atterrare con la faccia", "Tieni il petto sollevato mentre dondoli in avanti."],
    ],
    breath: "Inspira dondolando su, espira dondolando in avanti.",
  },
  halfRollBack: {
    setup: ["Seduto dritto con le ginocchia piegate e i piedi appoggiati, alla larghezza delle anche; mani leggere dietro le cosce."],
    steps: [
      "Espira: retroverti il bacino e rotola indietro a metà, formando una C con la colonna.",
      "Fermati dove gli addominali lavorano di più, braccia lunghe.",
      "Inspira, poi espira e risali seduto, impilando la colonna in altezza.",
    ],
    targets: [
      "Una curva a C arrotondata: la zona lombare tocca per prima il tappetino.",
      "I piedi restano appoggiati a terra per tutto il tempo.",
      "Spalle rilassate; le mani guidano soltanto, non tirano.",
    ],
    mistakes: [
      ["Tirare con le braccia", "Alleggerisci le mani; lascia lavorare gli addominali."],
      ["Piedi che si staccano da terra", "Rotola indietro meno lontano."],
      ["Inclinarsi indietro a schiena piatta", "Retroverti prima il bacino per creare la curva."],
    ],
    breath: "Espira per rotolare indietro, inspira in basso, espira per risalire.",
  },
  rollUp: {
    setup: ["Sdraiati sulla schiena, gambe tese e unite, piedi a martello; braccia sopra la testa."],
    steps: [
      "Inspira: solleva le braccia verso il soffitto, abbassa leggermente il mento.",
      "Espira: stacca la colonna dal tappetino una vertebra alla volta, allungandoti in avanti sopra le gambe.",
      "Inspira, poi espira e srotolati giù allo stesso modo.",
    ],
    targets: [
      "Una vertebra alla volta — nessuno strappo.",
      "Le gambe restano sul tappetino; talloni che si allungano.",
      "In alto una curva a C sopra le gambe, pancia rientrata.",
    ],
    mistakes: [
      ["Salire di scatto con lo slancio", "Piega le ginocchia o usa un elastico."],
      ["Gambe che si sollevano", "Premi i talloni a terra."],
      ["Spalle in tensione", "Lascia scendere e rilassare le spalle."],
    ],
    breath: "Espira per arrotolarti su, espira per srotolarti giù.",
  },
  rollOver: {
    setup: ["Sdraiati sulla schiena, braccia lungo i fianchi, palmi in giù, gambe unite e tese verso il soffitto."],
    steps: [
      "Espira: premi le braccia giù, solleva le anche e porta le gambe oltre la testa finché sono parallele al pavimento.",
      "Apri le gambe alla larghezza delle anche e fletti i piedi.",
      "Inspira, poi espira e srotolati giù una vertebra alla volta, chiudendo le gambe in basso (90°).",
    ],
    targets: [
      "Peso su spalle e parte alta delle braccia, mai sul collo; la testa resta ferma.",
      "In alto le gambe sono parallele al pavimento, senza toccarlo.",
      "Srotolati lentamente, tenendo le gambe vicine a te.",
    ],
    mistakes: [
      ["Usare lo slancio per passare", "Solleva le anche con gli addominali; piega le ginocchia se serve."],
      ["Peso che scivola sul collo", "Premi le braccia giù; vai meno lontano."],
      ["Lasciar cadere la colonna velocemente", "Una vertebra alla volta."],
    ],
    breath: "Espira per passare oltre, inspira in alto, espira per srotolarti.",
  },
  jackknife: {
    setup: ["Sdraiati sulla schiena, braccia lungo i fianchi, gambe unite e tese verso l'alto."],
    steps: [
      "Porta le gambe oltre la testa fino a parallele al pavimento (come nel roll-over).",
      "Premi le braccia giù e spara le gambe dritte verso il soffitto, sollevando alte le anche.",
      "Srotolati lentamente lungo la colonna, tenendo le gambe verticali il più a lungo possibile.",
    ],
    targets: [
      "In alto il corpo è verticale: anche sopra le spalle, gambe dritte in su.",
      "Peso su spalle e braccia, mai sul collo.",
      "Gambe unite e tese per tutto il tempo.",
    ],
    mistakes: [
      ["Gambe che salgono inclinate", "Punta i piedi dritti verso il soffitto."],
      ["Peso sul collo", "Premi più forte le braccia giù."],
      ["Ricadere di colpo", "Controlla lo srotolamento vertebra per vertebra."],
    ],
    breath: "Espira per passare oltre, inspira per salire, espira per srotolarti.",
  },
  corkscrew: {
    setup: ["Sdraiati sulla schiena, braccia lungo i fianchi, gambe unite e tese verso il soffitto."],
    steps: [
      "Abbassa un po' le gambe da un lato, portale in cerchio in basso, attraverso e su dall'altro lato.",
      "Chiudi di nuovo in alto, gambe unite.",
      "Inverti il senso; alterna per le ripetizioni.",
    ],
    targets: [
      "Gambe incollate tra loro per tutto il cerchio.",
      "Spalle e braccia restano sul tappetino.",
      "Cerchio grande solo quanto riesci a evitare che la zona lombare si inarchi.",
    ],
    mistakes: [
      ["Gambe che si separano", "Stringi l'interno coscia."],
      ["Zona lombare che si inarca in fondo al cerchio", "Fai il cerchio più piccolo."],
      ["Spalle che si sollevano", "Premi le braccia sul tappetino."],
    ],
    breath: "Inspira mentre le gambe scendono e girano, espira mentre risalgono.",
  },
  rollingBall: {
    setup: ["Seduto all'inizio del tappetino; afferra le tibie con le ginocchia al petto e i piedi appena staccati da terra, in una palla stretta."],
    steps: [
      "Inspira e rotola indietro fino alle scapole.",
      "Espira e torna su in equilibrio sugli ischi.",
      "Mantieni la forma della palla esattamente uguale per tutto il tempo.",
    ],
    targets: [
      "La distanza tra talloni e glutei e tra ginocchia e petto non cambia mai.",
      "Rotola fino alle scapole, mai sul collo.",
      "In alto, bilanciati un istante con i piedi staccati.",
    ],
    mistakes: [
      ["Aprire la forma per tornare su", "Usa gli addominali, non un calcio."],
      ["Rotolare sul collo", "Fermati alle scapole."],
      ["Piedi che toccano terra in alto", "Bilanciati con la pancia rientrata."],
    ],
    breath: "Inspira per rotolare indietro, espira per tornare su.",
  },
  seal: {
    setup: ["Seduto con le piante unite e le ginocchia aperte; passa le mani tra le gambe e afferra l'esterno delle caviglie. Solleva i piedi per bilanciarti."],
    steps: [
      "Batti i piedi tra loro 3 volte in alto.",
      "Inspira e rotola indietro fino alle scapole; batti i piedi 3 volte.",
      "Espira e torna su in equilibrio; batti di nuovo 3 volte.",
    ],
    targets: [
      "La forma arrotondata resta uguale mentre rotoli.",
      "Rotola fino alle scapole, mai sul collo.",
      "Equilibrio in alto senza che i piedi tocchino.",
    ],
    mistakes: [
      ["Perdere la forma e salire con un calcio", "Usa gli addominali per tornare su."],
      ["Rotolare su testa e collo", "Fermati alle scapole."],
      ["Piedi che atterrano a terra", "Bilanciati sugli ischi."],
    ],
    breath: "Inspira per rotolare indietro, espira per tornare su.",
  },
  openLegRocker: {
    setup: ["Seduto in equilibrio con le gambe tese e aperte alla larghezza delle spalle, a V, tenendo le caviglie (o i polpacci)."],
    steps: [
      "Retroverti il bacino per curvare la zona lombare.",
      "Inspira e rotola indietro fino alle scapole, mantenendo la V.",
      "Espira e torna su in equilibrio; mantieni per un respiro.",
    ],
    targets: [
      "Gambe tese e alla larghezza delle spalle per tutto il tempo.",
      "Schiena rotonda mentre rotoli, colonna lunga in alto.",
      "Equilibrio appena dietro gli ischi in alto.",
    ],
    mistakes: [
      ["Piegare le gambe per rotolare", "Tienile tese; afferra i polpacci se serve."],
      ["Rotolare sul collo", "Fermati alle scapole."],
      ["Lanciare la testa per tornare su", "Solleva con gli addominali."],
    ],
    breath: "Inspira per rotolare indietro, espira per tornare su.",
  },
  controlBalance: {
    setup: ["Avanzato. Dal roll-over: gambe oltre la testa, parallele al pavimento, braccia sopra la testa."],
    steps: [
      "Afferra una caviglia con entrambe le mani, con quella punta che tocca il pavimento dietro di te.",
      "Solleva l'altra gamba tesa verso il soffitto.",
      "Cambia gamba con una forbice lenta, cambiando le mani ogni volta.",
    ],
    targets: [
      "Peso su spalle e parte alta della schiena, mai sul collo.",
      "La gamba sollevata verticale, entrambe le gambe tese.",
      "Anche sopra le spalle.",
    ],
    mistakes: [
      ["Peso sul collo", "Porta le spalle sotto di te."],
      ["Forbice affrettata", "Cambio lento, un respiro per lato."],
      ["Gambe piegate", "Tieni entrambe le ginocchia tese."],
    ],
    breath: "Espira mentre cambi gamba.",
  },
  boomerang: {
    setup: ["Avanzato. Seduto con le gambe tese, caviglie incrociate, mani accanto alle anche."],
    steps: [
      "Rotola oltre, gambe parallele al pavimento; inverti l'incrocio delle caviglie.",
      "Risali in teaser, in equilibrio con le braccia allungate in avanti.",
      "Intreccia le mani dietro la schiena, abbassa le gambe e piegati in avanti allungando le braccia in alto dietro di te.",
    ],
    targets: [
      "Un unico flusso continuo; gambe tese per tutto il tempo.",
      "Peso sulle spalle nel roll-over, mai sul collo.",
      "Nel teaser, una V in equilibrio sugli ischi.",
    ],
    mistakes: [
      ["Usare lo slancio per tornare su", "Arrotolati su una vertebra alla volta."],
      ["Peso sul collo in alto", "Premi le braccia giù."],
      ["Piegare le gambe", "Tienile tese e strette."],
    ],
    breath: "Espira mentre rotoli oltre, inspira verso il teaser, espira mentre ti pieghi.",
  },
  pelvicCurl: {
    setup: ["Sdraiati sulla schiena, ginocchia piegate, piedi alla larghezza delle anche e appoggiati; braccia lungo i fianchi."],
    steps: [
      "Espira: inclina il bacino e stacca la colonna dal tappetino dal coccige in su.",
      "Fermati alle scapole (e mantieni lì nella versione con tenuta).",
      "Inspira in alto; espira e srotolati giù vertebra per vertebra.",
    ],
    targets: [
      "Una vertebra alla volta, in salita e in discesa.",
      "In alto, una linea retta dalle ginocchia alle spalle.",
      "Ginocchia parallele e alla larghezza delle anche; costole chiuse.",
    ],
    mistakes: [
      ["Sollevare la schiena tutta in un pezzo", "Staccati partendo dal coccige."],
      ["Inarcarsi in alto", "Costole chiuse; fermati alla linea retta."],
      ["Ginocchia che si aprono", "Stringi un cuscino tra le ginocchia."],
    ],
    breath: "Espira per salire, inspira in alto, espira per scendere.",
  },
  bridgeMarches: {
    setup: ["Sdraiati sulla schiena e sali in un pelvic curl, anche allo stesso livello."],
    steps: [
      "Solleva un piede finché il ginocchio è sopra l'anca (tabletop).",
      "Riappoggialo lentamente e solleva l'altro.",
      "Alterna, tenendo le anche alla stessa altezza.",
    ],
    targets: [
      "Anche allo stesso livello: non cedono dal lato del piede sollevato.",
      "Il ginocchio sollevato a 90°, sopra l'anca.",
      "Linea retta dalle ginocchia alle spalle per tutto il tempo.",
    ],
    mistakes: [
      ["Anca che cede dal lato sollevato", "Stringi il gluteo della gamba d'appoggio."],
      ["Marciare veloce", "Sollevamenti lenti e controllati."],
      ["Inarcare la schiena", "Porta le costole verso le anche."],
    ],
    breath: "Espira per sollevare un piede, inspira per riappoggiarlo.",
  },
  shoulderBridgeKicks: {
    setup: ["Dalla posizione alta del pelvic curl, solleva una gamba tesa verso il soffitto."],
    steps: [
      "Fletti il piede e abbassa la gamba tesa all'altezza del ginocchio.",
      "Punta il piede e calcia di nuovo la gamba verso il soffitto.",
      "Fai le ripetizioni, appoggia il piede e cambia.",
    ],
    targets: [
      "Anche allo stesso livello e sollevate — non cedono mentre la gamba scende.",
      "La gamba che si muove è tesa e calcia dall'anca.",
      "Bacino fermo; il piede d'appoggio preme a terra.",
    ],
    mistakes: [
      ["Anche che cedono", "Stringi il gluteo della gamba d'appoggio."],
      ["Piegare la gamba che calcia", "Tienila lunga."],
      ["Calci affrettati", "Rallenta: piede a martello, poi in punta."],
    ],
    breath: "Inspira mentre la gamba scende, espira mentre calcia su.",
  },
  swimming: {
    setup: ["Sdraiati a pancia in giù, braccia tese sopra la testa, gambe tese; solleva leggermente braccia, petto e gambe dal tappetino."],
    steps: [
      "Muovi su e giù braccio e gamba opposti con battiti piccoli e rapidi.",
      "Tieni petto e gambe sollevati per tutto il tempo.",
      "Continua per il conteggio, poi scendi e riposa.",
    ],
    targets: [
      "Movimenti piccoli e rapidi da spalle e anche.",
      "Collo lungo, sguardo sul pavimento poco più avanti.",
      "Pancia leggermente rientrata; braccia e gambe tese.",
    ],
    mistakes: [
      ["Movimenti ampi e scomposti", "Battiti più piccoli e rapidi."],
      ["Sollevare la testa", "Sguardo sul pavimento."],
      ["Piegare le ginocchia", "Allunga le gambe."],
    ],
    breath: "Inspira per 5 battiti, espira per 5 battiti.",
  },
  singleLegKick: {
    setup: ["Sdraiati a pancia in giù, appoggiato sugli avambracci con i gomiti sotto le spalle, pugni uniti; gambe tese."],
    steps: [
      "Stacca la pancia dal tappetino e allunga le gambe.",
      "Calcia un tallone verso il gluteo due volte (doppio impulso).",
      "Cambia gamba a ritmo.",
    ],
    targets: [
      "Petto sollevato, spalle basse, gomiti sotto le spalle.",
      "Le cosce restano sul tappetino, ginocchia alla larghezza delle anche.",
      "Pancia sollevata per proteggere la zona lombare.",
    ],
    mistakes: [
      ["Affondare nelle spalle", "Spingi gli avambracci nel tappetino."],
      ["Zona lombare compressa", "Porta la pancia dentro e su."],
      ["Ginocchia che si aprono", "Tienile parallele."],
    ],
    breath: "Espira a ogni doppio calcio.",
  },
  doubleLegKick: {
    setup: ["Sdraiati a pancia in giù, testa girata da un lato, mani intrecciate in alto sulla zona lombare, gomiti sul tappetino."],
    steps: [
      "Calcia entrambi i talloni verso i glutei tre volte.",
      "Distendi le gambe, allunga le mani intrecciate verso i piedi e solleva il petto.",
      "Scendi, gira la testa dall'altro lato e ripeti.",
    ],
    targets: [
      "Gambe unite durante i calci.",
      "Il petto si solleva con la parte alta della schiena.",
      "Braccia allungate, spalle portate indietro.",
    ],
    mistakes: [
      ["Gambe che si separano", "Stringi le ginocchia tra loro."],
      ["Sollevarsi dal collo", "Guida con il petto."],
      ["Avere fretta", "Calcio, calcio, calcio — poi distenditi lentamente."],
    ],
    breath: "Espira sui calci, inspira mentre ti distendi.",
  },
  clamshell: {
    setup: ["Sdraiati su un fianco, anche e ginocchia piegate a circa 45°, piedi in linea con i glutei; testa sul braccio di sotto."],
    steps: [
      "Tieni i piedi uniti.",
      "Solleva il ginocchio di sopra, aprendoti come una conchiglia.",
      "Scendi lentamente; fai le ripetizioni, poi cambia lato.",
    ],
    targets: [
      "Anche sovrapposte: il bacino non ruota indietro mentre il ginocchio si apre.",
      "I piedi restano uniti.",
      "Il sollevamento viene dal lato dell'anca.",
    ],
    mistakes: [
      ["Bacino che ruota indietro", "Apri meno, tieni le anche sovrapposte."],
      ["Piedi che si separano", "Tieni i talloni uniti."],
      ["Avere fretta", "Lento e controllato."],
    ],
    breath: "Espira mentre il ginocchio si apre, inspira mentre si chiude.",
  },
  sideKick: {
    setup: ["Sdraiati su un fianco, gambe tese e leggermente avanti rispetto alle anche; testa sulla mano o sul braccio di sotto, mano di sopra a terra davanti."],
    steps: [
      "Solleva la gamba di sopra all'altezza dell'anca.",
      "Calciala in avanti due volte (doppio impulso), poi portala indietro dietro di te.",
      "Tieni il busto fermo; fai le ripetizioni, poi cambia lato.",
    ],
    targets: [
      "Busto fermo e lungo — si muove solo la gamba.",
      "Gamba che calcia all'altezza dell'anca, tesa.",
      "Anche sovrapposte.",
    ],
    mistakes: [
      ["Busto che dondola con la gamba", "Fai calci più piccoli."],
      ["Gamba che scende", "Tienila all'altezza dell'anca."],
      ["Inarcare la schiena nel calcio indietro", "Porta la pancia dentro."],
    ],
    breath: "Inspira mentre calci in avanti, espira mentre porti indietro.",
  },
  kneelingSideKick: {
    setup: ["In ginocchio, dritto, inclinati di lato e appoggia una mano a terra sotto la spalla; distendi di lato la gamba di sopra."],
    steps: [
      "Solleva la gamba di sopra all'altezza dell'anca.",
      "Calciala in avanti, poi portala indietro.",
      "Fai le ripetizioni, poi cambia lato.",
    ],
    targets: [
      "Mano d'appoggio sotto la spalla, braccio teso.",
      "Gamba che calcia all'altezza dell'anca.",
      "Busto lungo, senza affondare nella spalla.",
    ],
    mistakes: [
      ["Affondare nella spalla d'appoggio", "Spingi via il pavimento."],
      ["Gamba che scende sotto l'anca", "Tienila all'altezza dell'anca."],
      ["Busto che dondola", "Fai calci più piccoli."],
    ],
    breath: "Inspira in avanti, espira indietro.",
  },
  legPullFront: {
    setup: ["Plank alto: mani sotto le spalle, corpo dritto dalla testa ai talloni."],
    steps: [
      "Solleva una gamba tesa dietro di te, di pochi centimetri fino all'altezza dell'anca.",
      "Riabbassala e solleva l'altra.",
      "Tieni fermo il corpo mentre le gambe si alternano.",
    ],
    targets: [
      "Corpo dritto: anche all'altezza delle spalle.",
      "Le anche restano frontali mentre la gamba sale.",
      "La gamba sollevata tesa, punte tese.",
    ],
    mistakes: [
      ["Anche che si spostano da un lato all'altro", "Attiva il core; solleva la gamba meno in alto."],
      ["Cedere nella zona lombare", "Stringi i glutei."],
      ["Gamba sollevata piegata", "Allungala tesa, punte tese."],
    ],
    breath: "Espira mentre la gamba sale, inspira mentre scende.",
  },
  legPullBack: {
    setup: ["Plank inverso: seduto, mani dietro le anche, dita in avanti; solleva le anche in modo che il corpo sia dritto."],
    steps: [
      "Calcia una gamba verso il soffitto, tenendola tesa.",
      "Riabbassala con controllo.",
      "Cambia gamba, tenendo le anche sollevate.",
    ],
    targets: [
      "Anche sollevate: una linea retta dalle spalle ai talloni.",
      "Braccia tese, spalle lontane dalle orecchie.",
      "La gamba che calcia è tesa.",
    ],
    mistakes: [
      ["Anche che cedono mentre la gamba calcia", "Stringi i glutei della gamba d'appoggio."],
      ["Alzare le spalle", "Spingi via il pavimento."],
      ["Piegare la gamba che calcia", "Tienila tesa."],
    ],
    breath: "Espira nel calcio, inspira mentre scende.",
  },
  pilatesPushUp: {
    setup: ["In piedi in fondo al tappetino, piedi uniti, braccia lungo i fianchi."],
    steps: [
      "Srotolati giù lungo la colonna finché le mani toccano il pavimento.",
      "Cammina con le mani fino a un plank alto.",
      "Fai i push-up con i gomiti vicini alle costole.",
      "Riporta indietro le mani camminando e srotolati su in piedi una vertebra alla volta.",
    ],
    targets: [
      "Gomiti vicini alle costole, rivolti indietro.",
      "Corpo dritto nel plank, anche allo stesso livello.",
      "Srotolati giù e su vertebra per vertebra.",
    ],
    mistakes: [
      ["Gomiti che si aprono", "Tienili vicini alle costole."],
      ["Anche che cedono nel plank", "Stringi glutei e addominali."],
      ["Rialzarsi a schiena piatta", "Srotolati su lungo la colonna."],
    ],
    breath: "Inspira per scendere, espira per spingere.",
  },
};
