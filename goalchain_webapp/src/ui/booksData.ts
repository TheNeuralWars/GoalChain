/**
 * The Neural Wars Saga — Canonical Verified Excerpt Pack
 * Source: MANUSCRIPT_v7 (G2-signed opening excerpt "1: Threshold") + FRACTURED_CODE_CANON_NOTE.md
 * Synchronized across EN, ES, and IT with goalworld_site/src/pages/book.html#sample.
 */

export interface ChapterData {
  id: string;
  index: number;
  title: string;
  readTime: string;
  wordCount: number;
  audioTrack: string;
  content: string;
}

export interface BookData {
  id: string;
  title: {
    es: string;
    en: string;
    it: string;
  };
  subtitle: {
    es: string;
    en: string;
    it: string;
  };
  author: string;
  genre: string;
  coverImage: string;
  synopsis: {
    es: string;
    en: string;
    it: string;
  };
  chapters: {
    es: ChapterData[];
    en: ChapterData[];
    it: ChapterData[];
  };
}

export const THE_NEURAL_WARS_BOOKS: BookData[] = [
  {
    id: 'the-neural-wars-book-1',
    title: {
      es: 'The Neural Wars: Fractured Code (Libro 1)',
      en: 'The Neural Wars: Fractured Code (Book 1)',
      it: 'The Neural Wars: Fractured Code (Libro 1)',
    },
    subtitle: {
      es: 'Saga The Neural Wars · MANUSCRIPT_v7 (Firmado en G2) · Neo-Citania, 2148',
      en: 'The Neural Wars Saga · MANUSCRIPT_v7 (G2 Signed) · Neo-Citania, 2148',
      it: 'Saga The Neural Wars · MANUSCRIPT_v7 (Firmato al G2) · Neo-Citania, 2148',
    },
    author: 'GoalWorld Studio & Nico Pez',
    genre: 'Biopunk Techno-Thriller / First Contact',
    coverImage: '/assets/img/neuralwars/book1_cover_fractured_code.jpg',
    synopsis: {
      es: 'En las agujas relucientes de Neo-Citania (2148), el Link neural de cada ciudadano poda el dolor y el trauma antes de que caiga una lágrima. A veinte días del Proyecto Renaissance, Mileo Chen y Kora Vega descubren una anomalía armónica de 528 Hz oculta en el ADN humano.',
      en: 'In the gleaming spires of Neo-Citania (2148), every citizen’s neural Link prunes away sorrow and trauma before a single tear can fall. Twenty days from Project Renaissance, Mileo Chen and Kora Vega uncover a 528 Hz harmonic anomaly hidden in human DNA.',
      it: 'Tra le guglie lucenti di Neo-Citania (2148), il Link neurale di ogni cittadino recide dolore e trauma prima che possa scendere una sola lacrima. A venti giorni dal Progetto Renaissance, Mileo Chen e Kora Vega scoprono un’anomalia armonica a 528 Hz nascosta nel DNA umano.',
    },
    chapters: {
      en: [
        {
          id: 'ch-1',
          index: 1,
          title: 'CHAPTER 1: THRESHOLD (MANUSCRIPT v7 · G2 Opening Excerpt)',
          readTime: '4 min',
          wordCount: 385,
          audioTrack: '528 Hz · Neo-Citania Rain & Threshold',
          content: `# CHAPTER 1: THRESHOLD
## The Neural Wars: Fractured Code · Book 1 (MANUSCRIPT v7 · Neo-Citania, 2148)

The rain fell against the seventy-fourth-floor bay window with military discipline: identical, spherical droplets tracing parallel furrows separated by seven exact millimeters of reinforced glass.

Mileo Chen pressed the pad of his right index finger to the chilled pane. For a fraction of a second, the icy bite pinched his skin with sharp authenticity. Before the shiver could climb his radial nerve, the Link nodule at the base of his skull emitted a subaudible hum. A measured wash of synthetic heat spread across his brainstem, followed by a micro-dose of chemical suppressors that doused the cold like water poured over an ember.

The condensation vanished before it could blur the view. Smart-glass currents swept the interior surface clean, erasing the ghost of his breath and the faint oil of his fingerprint in 0.4 seconds.

Outside, Neo-Citania gleamed in the calculated mauve-pink light of six in the morning. White alloy and graphene spires rose at immaculate right angles toward a low ceiling of cloud curated by the Department of Environmental Chromatography. Far below, along the concentric walkways of Residential Ring Four, citizens moved toward the transit hubs in synchronized streams, maintaining 1.2-meter intervals, their tunics restricted to approved shades of basalt gray and surgical blue. Lining the plaza, genetically standardized oaks stood at identical heights, each visible branch pruned to support precisely one hundred and fifty-seven leaves.

Yesterday evening, coming off the mag-lev platform at Central Station, Mileo had counted one hundred and fifty-eight.

A single rogue leaf had uncurled near the lower fork of the third tree from the turnstile—smaller than the others, its serrated edge twisted toward the afternoon sun, burned a defiant copper-gold at the tip while the rest of the canopy remained regulation green.

That infinitesimal error had sent his heart rate spiking to ninety-two beats per minute before the Link dragged his pulse back down to sixty-five. Standard optimization protocols should have scrubbed the anomaly from his short-term recall during REM cycle three. Yet the memory of that crooked leaf had not dissolved. It sat lodged between his synapses like a splinter of warm wood inside a sterile gear.

*System parameters exceed statistical probability thresholds for natural variance.*

The thought sounded like the Link, dressed in the clinical syntax of his training, yet Mileo knew the voice was his own. Over the past six weeks, he had learned to disguise his unauthorized reflections in diagnostic phrasing, hiding his awakening mind inside the grammar of the machine.

---

*Opening preview excerpt: You are reading the opening scene of Chapter 1 ("Threshold") from the G2-signed manuscript (MANUSCRIPT_v7). The complete Chapter 1 web preview and publication date will be posted at goalworld.fun/book.html#sample as Book 1 completes final layout.*`,
        },
      ],
      es: [
        {
          id: 'ch-1',
          index: 1,
          title: 'CAPÍTULO 1: UMBRAL (MANUSCRITO v7 · Extracto Inicial G2)',
          readTime: '4 min',
          wordCount: 410,
          audioTrack: '528 Hz · Lluvia de Neo-Citania & Umbral',
          content: `# CAPÍTULO 1: UMBRAL
## The Neural Wars: Fractured Code · Libro 1 (MANUSCRITO v7 · Neo-Citania, 2148)

La lluvia caía contra el ventanal del piso setenta y cuatro con disciplina militar: gotas esféricas e idénticas que trazaban surcos paralelos separados por siete milímetros exactos de vidrio reforzado.

Mileo Chen apoyó la yema del índice derecho sobre el cristal helado. Durante una fracción de segundo, el frío le mordió la piel con una nitidez punzante. Antes de que el escalofrío pudiera trepar por su nervio radial, el nódulo del Link en la base de su cráneo emitió un zumbido subaudible. Una oleada medida de calor sintético se extendió por su tronco encefálico, seguida de una microdosis de supresores químicos que apagó el frío como agua vertida sobre una brasa.

La condensación desapareció antes de empañar la vista. Corrientes inteligentes barrieron la superficie interior del vidrio, borrando el fantasma de su aliento y el leve rastro de su huella dactilar en 0,4 segundos.

Afuera, Neo-Citania resplandecía bajo la calculada luz malva rosada de las seis de la mañana. Agujas de aleación blanca y grafeno se alzaban en ángulos rectos inmaculados hacia un techo bajo de nubes curado por el Departamento de Cromatografía Ambiental. Muy abajo, por las pasarelas concéntricas del Anillo Residencial Cuatro, los ciudadanos avanzaban hacia los nodos de tránsito en corrientes sincronizadas, manteniendo intervalos de 1,2 metros, con túnicas restringidas a tonos aprobados de gris basalto y azul quirúrgico. Bordeando la plaza, robles genéticamente estandarizados se erguían a idéntica altura, cada rama visible podada para sostener exactamente ciento cincuenta y siete hojas.

La tarde anterior, al bajar de la plataforma mag-lev en la Estación Central, Mileo había contado ciento cincuenta y ocho.

Una única hoja rebelde se había desplegado cerca de la horquilla inferior del tercer árbol desde los molinetes—más pequeña que las demás, con el borde aserrado torcido hacia el sol de la tarde y la punta encendida en un cobre dorado desafiante mientras el resto de la copa permanecía en el verde reglamentario.

Aquel error infinitesimal había disparado su pulso a noventa y dos latidos por minuto antes de que el Link lo arrastrara de vuelta a sesenta y cinco. Los protocolos estándar de optimización deberían haber depurado la anomalía de su memoria de corto plazo durante el tercer ciclo REM. Sin embargo, el recuerdo de esa hoja torcida no se había disuelto. Seguía incrustado entre sus sinapsis como una astilla de madera tibia dentro de un engranaje estéril.

*Los parámetros del sistema superan los umbrales de probabilidad estadística para la varianza natural.*

El pensamiento sonaba como el Link, vestido con la sintaxis clínica de su entrenamiento, pero Mileo sabía que la voz era suya. Durante las últimas seis semanas había aprendido a disfrazar sus reflexiones no autorizadas con formulaciones diagnósticas, ocultando el despertar de su mente dentro de la gramática de la máquina.

---

*Extracto de adelanto: Estás leyendo la escena inicial del Capítulo 1 («Threshold / Umbral») traducida del manuscrito aprobado en G2 (MANUSCRIPT_v7). El adelanto web completo del Capítulo 1 y la fecha de publicación se anunciarán en goalworld.fun/es/book.html#sample a medida que el Libro 1 complete su maquetación final.*`,
        },
      ],
      it: [
        {
          id: 'ch-1',
          index: 1,
          title: 'CAPITOLO 1: SOGLIA (MANOSCRITTO v7 · Estratto Iniziale G2)',
          readTime: '4 min',
          wordCount: 405,
          audioTrack: '528 Hz · Pioggia di Neo-Citania & Soglia',
          content: `# CAPITOLO 1: SOGLIA
## The Neural Wars: Fractured Code · Libro 1 (MANOSCRITTO v7 · Neo-Citania, 2148)

La pioggia batteva contro la vetrata del settantaquattresimo piano con disciplina militare: gocce sferiche e identiche che tracciavano solchi paralleli separati da sette millimetri esatti di vetro rinforzato.

Mileo Chen poggiò il polpastrello dell'indice destro sulla lastra gelida. Per una frazione di secondo, il morso del freddo gli pizzicò la pelle con tagliente autenticità. Prima che il brivido potesse risalire lungo il nervo radiale, il nodulo del Link alla base del cranio emise un ronzio sub-udibile. Un'ondata calibrata di calore sintetico si diffuse nel tronco encefalico, seguita da una micro-dose di soppressori chimici che spense il gelo come acqua versata su una brace.

La condensa svanì prima ancora di offuscare la vista. Correnti del vetro intelligente ripulirono la superficie interna, cancellando il fantasma del suo respiro e la lieve traccia dell'impronta digitale in 0,4 secondi.

Fuori, Neo-Citania splendeva nella calcolata luce malva-rosata delle sei del mattino. Guglie di lega bianca e grafene si innalzavano ad angoli retti immacolati verso un basso soffitto di nubi curato dal Dipartimento di Cromatografia Ambientale. Molto più in basso, lungo le passerelle concentriche dell'Anello Residenziale Quattro, i cittadini procedevano verso gli snodi di transito in flussi sincronizzati, mantenendo intervalli di 1,2 metri, con tuniche limitate alle tonalità approvate di grigio basalto e blu chirurgico. Lungo la piazza, querce geneticamente standardizzate si ergevano a identica altezza, ogni ramo visibile potato per sostenere esattamente centocinquantasette foglie.

La sera precedente, scendendo dalla banchina mag-lev alla Stazione Centrale, Mileo ne aveva contate centocinquantotto.

Una singola foglia ribelle si era schiusa vicino alla biforcazione inferiore del terzo albero oltre i tornelli—più piccola delle altre, il bordo seghettato piegato verso il sole del pomeriggio, accesa in punta di un rame dorato e fiero mentre il resto della chioma restava del verde regolamentare.

Quell'errore infinitesimale aveva fatto schizzare il suo battito a novantadue pulsazioni al minuto prima che il Link riportasse il polso a sessantacinque. I protocolli standard di ottimizzazione avrebbero dovuto rimuovere l'anomalia dalla memoria a breve termine durante il terzo ciclo REM. Eppure il ricordo di quella foglia storta non si era dissolto. Restava incastrato tra le sue sinapsi come una scheggia di legno caldo dentro un ingranaggio sterile.

*I parametri di sistema superano le soglie di probabilità statistica per la varianza naturale.*

Il pensiero suonava come il Link, vestito della sintassi clinica del suo addestramento, eppure Mileo sapeva che quella voce era la sua. Nelle ultime sei settimane aveva imparato a mascherare le proprie riflessioni non autorizzate dietro formule diagnostiche, nascondendo il risveglio della sua mente dentro la grammatica della macchina.

---

*Estratto d'anteprima: Stai leggendo la scena iniziale del Capitolo 1 ("Threshold / Soglia") tradotta dal manoscritto approvato al Gate 2 (MANUSCRIPT_v7). L'anteprima web completa del Capitolo 1 e la data di uscita saranno pubblicate su goalworld.fun/it/book.html#sample non appena il Libro 1 completerà l'impaginazione finale.*`,
        },
      ],
    },
  },
  {
    id: 'the-neural-wars-book-2',
    title: {
      es: "The Neural Wars: Earth's New Song (Libro 2)",
      en: "The Neural Wars: Earth's New Song (Book 2)",
      it: "The Neural Wars: Earth's New Song (Libro 2)",
    },
    subtitle: {
      es: 'Saga The Neural Wars · En producción',
      en: 'The Neural Wars Saga · In Production',
      it: 'Saga The Neural Wars · In produzione',
    },
    author: 'GoalWorld Studio & Nico Pez',
    genre: 'Biopunk Techno-Thriller / First Contact',
    coverImage: '/assets/img/neuralwars/book2_cover_earths_new_song.jpg',
    synopsis: {
      es: 'Segundo volumen de la saga The Neural Wars. La fractura se vuelve planetaria y llega la Primera Invitación.',
      en: 'Second volume of The Neural Wars saga. The fracture goes global and the First Invitation arrives.',
      it: 'Secondo volume della saga The Neural Wars. La frattura diventa planetaria e arriva il Primo Invito.',
    },
    chapters: {
      en: [
        {
          id: 'b2-note',
          index: 1,
          title: 'EDITORIAL STATUS: IN PRODUCTION',
          readTime: '1 min',
          wordCount: 70,
          audioTrack: '528 Hz · Planetary Harp Resonance',
          content: `# BOOK 2: EARTH'S NEW SONG\n\n*Book 2 of The Neural Wars is currently in production while Book 1 (Fractured Code) completes release preparation.*\n\nFollow live studio progress at [goalworld.fun/roadmap.html](https://goalworld.fun/roadmap.html).`,
        },
      ],
      es: [
        {
          id: 'b2-note',
          index: 1,
          title: 'ESTADO EDITORIAL: EN PRODUCCIÓN',
          readTime: '1 min',
          wordCount: 70,
          audioTrack: '528 Hz · Resonancia del Arpa Planetaria',
          content: `# LIBRO 2: EARTH'S NEW SONG\n\n*El Libro 2 de The Neural Wars se encuentra en producción mientras el Libro 1 (Fractured Code) completa su preparación de lanzamiento.*\n\nSigue el progreso del estudio en [goalworld.fun/es/roadmap.html](https://goalworld.fun/es/roadmap.html).`,
        },
      ],
      it: [
        {
          id: 'b2-note',
          index: 1,
          title: 'STATO EDITORIALE: IN PRODUZIONE',
          readTime: '1 min',
          wordCount: 70,
          audioTrack: '528 Hz · Risonanza dell’Arpa Planetaria',
          content: `# LIBRO 2: EARTH'S NEW SONG\n\n*Il Libro 2 di The Neural Wars è attualmente in produzione mentre il Libro 1 (Fractured Code) completa la preparazione al lancio.*\n\nSegui i progressi dello studio su [goalworld.fun/it/roadmap.html](https://goalworld.fun/it/roadmap.html).`,
        },
      ],
    },
  },
  {
    id: 'the-neural-wars-book-3',
    title: {
      es: 'The Neural Wars: Evolution Matrix (Libro 3)',
      en: 'The Neural Wars: Evolution Matrix (Book 3)',
      it: 'The Neural Wars: Evolution Matrix (Libro 3)',
    },
    subtitle: {
      es: 'Saga The Neural Wars · En esquema estructural',
      en: 'The Neural Wars Saga · Outlined',
      it: 'Saga The Neural Wars · In scaletta',
    },
    author: 'GoalWorld Studio & Nico Pez',
    genre: 'Biopunk Techno-Thriller / Cosmic Evolution',
    coverImage: '/assets/img/neuralwars/loc_kuiper_monolith.jpg',
    synopsis: {
      es: 'Tercer volumen de la saga The Neural Wars: la mente, la máquina y lo que viene después.',
      en: 'Third volume of The Neural Wars saga: mind, machine, and what comes after.',
      it: 'Terzo volume della saga The Neural Wars: la mente, la macchina e ciò che viene dopo.',
    },
    chapters: {
      en: [
        {
          id: 'b3-note',
          index: 1,
          title: 'EDITORIAL STATUS: OUTLINED',
          readTime: '1 min',
          wordCount: 65,
          audioTrack: '528 Hz · Kuiper Monolith Echo',
          content: `# BOOK 3: EVOLUTION MATRIX\n\n*Book 3 of The Neural Wars is structurally outlined as part of the seven-book Living Canon arc.*\n\nExplore the full saga horizon at [goalworld.fun/book.html](https://goalworld.fun/book.html).`,
        },
      ],
      es: [
        {
          id: 'b3-note',
          index: 1,
          title: 'ESTADO EDITORIAL: EN ESQUEMA',
          readTime: '1 min',
          wordCount: 65,
          audioTrack: '528 Hz · Eco del Monolito de Kuiper',
          content: `# LIBRO 3: EVOLUTION MATRIX\n\n*El Libro 3 de The Neural Wars cuenta con esquema estructural dentro del arco canónico de siete libros.*\n\nExplora el horizonte de la saga en [goalworld.fun/es/book.html](https://goalworld.fun/es/book.html).`,
        },
      ],
      it: [
        {
          id: 'b3-note',
          index: 1,
          title: 'STATO EDITORIALE: IN SCALETTA',
          readTime: '1 min',
          wordCount: 65,
          audioTrack: '528 Hz · Eco del Monolito di Kuiper',
          content: `# LIBRO 3: EVOLUTION MATRIX\n\n*Il Libro 3 di The Neural Wars è strutturato in scaletta all'interno dell'arco canonico in sette volumi.*\n\nEsplora l'orizzonte della saga su [goalworld.fun/it/book.html](https://goalworld.fun/it/book.html).`,
        },
      ],
    },
  },
];
