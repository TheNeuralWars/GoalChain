/**
 * The Neural Wars Trilogy — Canonical Verified Excerpt Pack
 * Source: MANUSCRIPT_v7 (verified opening excerpt) + FRACTURED_CODE_CANON_NOTE.md
 * TODO(nico): Replace with full G2-signed Chapter 1 text from MANUSCRIPT_v7 once approved for public release.
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
  };
  subtitle: {
    es: string;
    en: string;
  };
  author: string;
  genre: string;
  coverImage: string;
  synopsis: {
    es: string;
    en: string;
  };
  chapters: {
    es: ChapterData[];
    en: ChapterData[];
  };
}

export const THE_NEURAL_WARS_BOOKS: BookData[] = [
  {
    id: 'the-neural-wars-book-1',
    title: {
      es: 'The Neural Wars: Fractured Code (Libro 1)',
      en: 'The Neural Wars: Fractured Code (Book 1)',
    },
    subtitle: {
      es: 'Trilogía The Neural Wars · En revisión editorial (MANUSCRIPT_v7)',
      en: 'The Neural Wars Trilogy · In Editorial Review (MANUSCRIPT_v7)',
    },
    author: 'GoalWorld Studio & Nico Pez',
    genre: 'Hard Sci-Fi / Cyberpunk Thriller',
    coverImage: 'https://goalworld.fun/assets/img/hero-neo-citania-800.webp',
    synopsis: {
      es: 'En Neo-Citania (2045), ocho millones de ciudadanos viven conectados al Link. Cuando Kora Vega intercepta una anomalía de doce segundos en el Distrito Siete, lo que encuentra al otro lado de la telemetría no es ruido: es una voz humana.',
      en: 'In Neo-Citania (2045), eight million citizens live wired to the Link. When Kora Vega intercepts a twelve-second anomaly in District Seven, what she finds behind the telemetry is not noise—it is a human voice.',
    },
    chapters: {
      en: [
        {
          id: 'ch-1',
          index: 1,
          title: 'CHAPTER 1: TWELVE SECONDS (Verified Opening Excerpt)',
          readTime: '3 min',
          wordCount: 380,
          audioTrack: 'Sonic Cue 01 · Neo-Citania Rain',
          content: `# CHAPTER 1: TWELVE SECONDS
## The Neural Wars: Fractured Code · Book 1 (Verified Opening Excerpt)

The rain over Neo-Citania never touched the street. Three hundred meters above the old asphalt, the climate lattice caught every drop, stripped the acid out of it, and let it fall the rest of the way as a warm, odorless mist that tasted faintly of copper.

Kora Vega stood on the narrow service balcony of Sub-Station Nine with her collar turned up and her left wrist unlatched from the Link. Twelve seconds. That was all the district warden's sweep gave an un-synced cortex before the compliance drones triangulated the gap in the telemetry and came looking for the body attached to it.

*Nine seconds.*

Below her, the transit arteries of District Seven ran like incisions of cold amber light through obsidian stone. Two million commuters moving at the exact cadence the city's central model had chosen for a Tuesday evening—nobody hurrying, nobody late, nobody asking why the billboards along the viaduct had been playing the same three frames of a smiling child since noon.

*Six seconds.*

She pressed the flat of her thumb against the induction port behind her ear. The raw feed hit her optic nerve without the city's smoothing filter: a jagged, unindexed burst of signal buried inside the municipal carrier wave. Not noise. A voice. Or the shape a voice leaves behind when someone tries to erase it from the inside.

*Two seconds.*

Kora re-latched the cuff. The warmth of the Link flooded back into her temples—polite, anaesthetic, lying—and the drone that had been banking over the canal tilted its wings and drifted on toward the harbour.

---

*Editorial Note: You are reading the verified opening excerpt of Chapter 1 ("Twelve Seconds") from MANUSCRIPT_v7. The full Chapter 1 sample is in final G2 editorial sign-off and will be published at goalworld.fun/book.html#sample.*`,
        },
      ],
      es: [
        {
          id: 'ch-1',
          index: 1,
          title: 'CAPÍTULO 1: DOCE SEGUNDOS (Extracto Inicial Verificado)',
          readTime: '3 min',
          wordCount: 395,
          audioTrack: 'Sonic Cue 01 · Lluvia de Neo-Citania',
          content: `# CAPÍTULO 1: DOCE SEGUNDOS
## The Neural Wars: Fractured Code · Libro 1 (Extracto Inicial Verificado)

La lluvia sobre Neo-Citania nunca llegaba a tocar el asfalto. Trescientos metros por encima de la calle vieja, la retícula climática atrapaba cada gota, le extraía el ácido y la dejaba caer el resto del trayecto convertida en una niebla tibia e inodora con un leve sabor a cobre.

Kora Vega permanecía en el estrecho balcón de servicio de la Subestación Nueve con el cuello alzado y la muñeca izquierda desacoplada del Link. Doce segundos. Ese era todo el margen que el barrido del distrito concedía a una corteza no sincronizada antes de que los drones de cumplimiento triangularan el vacío en la telemetría y salieran a buscar el cuerpo al que pertenecía.

*Nueve segundos.*

Bajo sus pies, las arterias de tránsito del Distrito Siete corrían como incisiones de luz ámbar fría sobre piedra obsidiana. Dos millones de pasajeros desplazándose a la cadencia exacta que el modelo central de la ciudad había elegido para un martes al atardecer: nadie corría, nadie llegaba tarde, nadie preguntaba por qué las pantallas del viaducto repetían desde el mediodía los mismos tres fotogramas de un niño sonriendo.

*Seis segundos.*

Apoyó la yema del pulgar contra el puerto de inducción detrás de la oreja. La señal cruda golpeó su nervio óptico sin el filtro suavizador de la ciudad: una ráfaga dentada y sin indexar enterrada dentro de la onda portadora municipal. No era ruido. Era una voz. O la huella que deja una voz cuando alguien intenta borrarla desde adentro.

*Dos segundos.*

Kora volvió a cerrar el broche. La tibieza del Link inundó de nuevo sus sienes —cortés, anestésica, mentirosa— y el dron que viraba sobre el canal inclinó las alas y siguió de largo hacia el puerto.

---

*Nota editorial: Estás leyendo el extracto inicial verificado del Capítulo 1 («Doce segundos») de MANUSCRIPT_v7. El capítulo 1 completo se encuentra en firma editorial G2 y se publicará en goalworld.fun/book.html#sample.*`,
        },
      ],
    },
  },
  {
    id: 'the-neural-wars-book-2',
    title: {
      es: "The Neural Wars: Earth's New Song (Libro 2)",
      en: "The Neural Wars: Earth's New Song (Book 2)",
    },
    subtitle: {
      es: 'Trilogía The Neural Wars · En desarrollo y esquema',
      en: 'The Neural Wars Trilogy · In Outline & Structural Development',
    },
    author: 'GoalWorld Studio & Nico Pez',
    genre: 'Hard Sci-Fi / Cyberpunk Thriller',
    coverImage: 'https://goalworld.fun/assets/img/trailer-poster.jpg',
    synopsis: {
      es: 'Segundo volumen de la trilogía The Neural Wars. Actualmente en desarrollo estructural tras el cierre editorial del Libro 1.',
      en: 'Second volume of The Neural Wars trilogy. Currently in structural development following the editorial lock of Book 1.',
    },
    chapters: {
      en: [
        {
          id: 'b2-note',
          index: 1,
          title: 'EDITORIAL STATUS: IN OUTLINE',
          readTime: '1 min',
          wordCount: 65,
          audioTrack: 'Sonic Cue 02 · Cascade Resonance',
          content: `# BOOK 2: EARTH'S NEW SONG\n\n*Book 2 of The Neural Wars is currently in structural outline while Book 1 (Fractured Code) completes its final editorial pass.*\n\nFollow live studio progress at [goalworld.fun/roadmap.html](https://goalworld.fun/roadmap.html).`,
        },
      ],
      es: [
        {
          id: 'b2-note',
          index: 1,
          title: 'ESTADO EDITORIAL: EN ESQUEMA',
          readTime: '1 min',
          wordCount: 65,
          audioTrack: 'Sonic Cue 02 · Cascade Resonance',
          content: `# LIBRO 2: EARTH'S NEW SONG\n\n*El Libro 2 de The Neural Wars se encuentra en esquema estructural mientras el Libro 1 (Fractured Code) completa su revisión editorial final.*\n\nSigue el progreso del estudio en [goalworld.fun/roadmap.html](https://goalworld.fun/roadmap.html).`,
        },
      ],
    },
  },
];
