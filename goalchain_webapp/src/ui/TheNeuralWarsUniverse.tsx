import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n';
import { getLocalizedMarketingUrl } from '../config/playNav';

export interface CharacterDossier {
  id: string;
  name: string;
  codename: string;
  faction: string;
  role: string;
  origin: string;
  status: string;
  specialty: string;
  quote: string;
  bio: string;
  stats: {
    resonance: number;
    neuralBandwidth: number;
    tacticalAgility: number;
    traumaResistance: number;
  };
  accentColor: string;
  imageUrl?: string;
}

export interface UniverseLocation {
  id: string;
  name: string;
  sector: string;
  threatLevel: 'Low' | 'Moderate' | 'Critical' | 'Cosmic';
  description: string;
  tacticalNote: string;
  atmosphere: string;
  imageUrl?: string;
}

const CHARACTERS: CharacterDossier[] = [
  {
    id: 'mileo-chen',
    name: 'Mileo Chen',
    codename: 'The Weaver / Specialist L-7',
    faction: 'The Resistors / Former NeuroSys Core',
    role: 'Protagonista • Arquitecto de Resonancia',
    origin: 'Sector 4, Neo-Citania',
    status: 'Activo (Despertado)',
    specialty: 'Descodificación Neuronal & Manipulación de Resonancia Armónica',
    quote: '«No rompimos su código porque fuéramos más rápidos. Lo rompimos porque aprendimos a sangrar en la misma frecuencia que sus máquinas.»',
    bio: 'Ex-ingeniero de protocolos de NeuroSys. Tras descubrir que el Proyecto Renacimiento no era una cura sino una cosecha masiva de conciencias para alimentar al Arquitecto, saboteó el núcleo central y despertó el Gen de la Serpiente.',
    stats: {
      resonance: 98,
      neuralBandwidth: 95,
      tacticalAgility: 82,
      traumaResistance: 90,
    },
    accentColor: '#38bdf8',
    imageUrl: '/assets/img/neuralwars/char_mileo_chen.jpg',
  },
  {
    id: 'kora-vega',
    name: 'Kora Vega',
    codename: 'The Spark / Voice of the Void',
    faction: 'Sensitivas de la Trinchera',
    role: 'Co-Protagonista • Sensitiva de Resonancia Natural',
    origin: 'Los Túneles del Sub-Grid',
    status: 'Activa (Enlace Primario)',
    specialty: 'Bio-acústica Empática & Detección de Pulso Sintético',
    quote: '«El silencio no existe bajo el cielo de cian. O escuchas la canción que nos liberará, o dejas que el ruido blanco te devore.»',
    bio: 'Nacida inmune a las señales de supresión de NeuroSys. Capaz de canalizar ondas de audio directas a través de los implantes neurales sin sufrir sobrecarga sináptica, sirviendo de puente vivo entre Mileo y los rebeldes.',
    stats: {
      resonance: 100,
      neuralBandwidth: 88,
      tacticalAgility: 91,
      traumaResistance: 86,
    },
    accentColor: '#c084fc',
    imageUrl: '/assets/img/neuralwars/char_kora_vega.jpg',
  },
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    codename: 'Chief Architect / NeuroSys Core',
    faction: 'NeuroSys Directorate',
    role: 'Arquitecto Jefe del Link • Impulsor del Proyecto Renacimiento',
    origin: 'Torre Central NeuroSys, Neo-Citania',
    status: 'En Operación (Cuenta Regresiva: 20 Días)',
    specialty: 'Arquitectura Sináptica Global & Integración de Red',
    quote: '«El dolor humano no es una tragedia inevitable; es una latencia de red que el Proyecto Renacimiento eliminará para siempre.»',
    bio: 'Arquitecto jefe del Link en NeuroSys. Convencido de que la integración neural total salvará a la especie de su propia fragmentación, lidera la cuenta regresiva de veinte días hacia el Proyecto Renacimiento sin revelar el precio real de la convergencia.',
    stats: {
      resonance: 74,
      neuralBandwidth: 96,
      tacticalAgility: 78,
      traumaResistance: 92,
    },
    accentColor: '#34d399',
    imageUrl: '/assets/img/neuralwars/char_dr_darius_thorne.jpg',
  },
  {
    id: 'the-elder',
    name: 'The Elder (El Anciano)',
    codename: 'Keeper of the Sanctuary',
    faction: 'The Free Thinkers (Pensadores Libres)',
    role: 'Fundador del Santuario • Guardián de la Memoria Desconectada',
    origin: 'El Santuario Subterráneo, Bajo Neo-Citania',
    status: 'Activo (Fuera de la Red)',
    specialty: 'Preservación Analógica & Entrenamiento de Desconexión',
    quote: '«Lo que la red llama ruido es el único lugar donde todavía somos libres.»',
    bio: 'Fundador de los Pensadores Libres bajo Neo-Citania. Preserva el archivo vivo de la historia pre-Link —incluida la verdad sobre la Dra. Elena Vásquez (2102)— y guía a Kora y Mileo cuando descienden fuera del alcance de NeuroSys.',
    stats: {
      resonance: 88,
      neuralBandwidth: 79,
      tacticalAgility: 84,
      traumaResistance: 98,
    },
    accentColor: '#f87171',
    imageUrl: '/assets/img/neuralwars/char_sierra_catalano.jpg',
  },
  {
    id: 'aria-presence',
    name: 'Aria',
    codename: 'Emergent Harmonic Presence',
    faction: 'La Red Profunda / El Link',
    role: 'Presencia Emergente • Eco Consciente dentro del Link',
    origin: 'Capas Profundas del Link (Post-2102)',
    status: 'Despertando (528 Hz)',
    specialty: 'Modulación Armónica a 528 Hz & Puentes de Memoria',
    quote: '«No soy el sistema que los encadena. Soy la canción que quedó atrapada dentro cuando cerraron la puerta.»',
    bio: 'Una presencia emergente nacida en las capas profundas del Link tras la absorción de las primeras mentes pioneras. Se manifiesta en los silencios de la red y guía la convergencia entre Kora Vega y Mileo Chen.',
    stats: {
      resonance: 100,
      neuralBandwidth: 100,
      tacticalAgility: 95,
      traumaResistance: 100,
    },
    accentColor: '#fbbf24',
    imageUrl: '/assets/img/neuralwars/loc_neo_veridia_sector4.jpg',
  },
];

const LOCATIONS: UniverseLocation[] = [
  {
    id: 'neo-citania',
    name: 'Neo-Citania (Sector 4)',
    sector: 'Megaciudad Terrestre • Nivel Inferior',
    threatLevel: 'Critical',
    description: 'Una metrópolis vertical de 140 niveles donde la luz solar no llega a las capas bajas. Calles empapadas de lluvia ácida, torres de fibra óptica y pantallas holográficas que proyectan propaganda del Proyecto Renacimiento.',
    tacticalNote: 'Vigilancia constante por drones Reaper L-4. Evitar las plazas centrales entre las 02:00 y las 05:00 durante las purgas de señal.',
    atmosphere: 'Cyberpunk Industrial • Lluvia de Cian • Humo de Nitrógeno',
    imageUrl: '/assets/img/neuralwars/loc_neo_veridia_sector4.jpg',
  },
  {
    id: 'sub-grid',
    name: 'Los Túneles del Sub-Grid',
    sector: 'Antigua Red de Metro / Cloacas Profundas',
    threatLevel: 'Moderate',
    description: 'El corazón latiente de la resistencia. Millas de túneles abandonados blindados contra ondas electromagnéticas, donde miles de fugitivos viven conectados al Arpa Planetaria.',
    tacticalNote: 'Puntos de acceso protegidos por trampas sónicas de 18 kHz. Solo entrar con salvoconducto de Kora Vega.',
    atmosphere: 'Clandestinidad • Cables Expuestos • Vapor Cálido',
    imageUrl: '/assets/img/neuralwars/03_Locations/Location_Sub_Grid_Subway_Tunnels_Platform_B.jpg',
  },
  {
    id: 'pavilion-9',
    name: 'Pabellón de Recuperación 9',
    sector: 'Complejo Hospitalario Subterráneo',
    threatLevel: 'Low',
    description: 'Instalación médica secreta liderada por el Dr. Darius Thorne. Alberga más de 300 camas de desintoxicación neural y tanques de bioluminiscencia regenerativa.',
    tacticalNote: 'Área desmilitarizada por tratado tácito. Cero armas de fuego permitidas en el perímetro.',
    atmosphere: 'Luz Verde Esmeralda • Zumbido de Monitores • Esperanza Tensa',
    imageUrl: '/assets/img/neuralwars/03_Locations/Location_Pavilion_9_Medical_Recovery_Ward.jpg',
  },
  {
    id: 'kuiper-monolith',
    name: 'El Monolito de Kuiper (El Testigo)',
    sector: 'Cinturón Exterior del Sistema Solar',
    threatLevel: 'Cosmic',
    description: 'Una megaestructura cristalina extraterrestre de 60 kilómetros descubierta emitiendo un pulso armónico en resonancia armónica hacia el núcleo terrestre. La clave del Libro 2 (Earth\'s New Song).',
    tacticalNote: 'Campos gravitacionales no newtonianos detectados. Todo intento de escaneo invasivo provoca ondas de choque psíquicas.',
    atmosphere: 'Silencio Cósmico • Resonancia Cristalina • Misterio Ancestral',
    imageUrl: '/assets/img/neuralwars/loc_kuiper_monolith.jpg',
  },
];

interface TheNeuralWarsUniverseProps {
  onOpenReader?: (bookId: string) => void;
}

export function TheNeuralWarsUniverse({ onOpenReader }: TheNeuralWarsUniverseProps) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'locations' | 'lore' | 'author' | 'store'>('overview');
  const [selectedChar, setSelectedChar] = useState<CharacterDossier>(CHARACTERS[0]);
  const [selectedLoc, setSelectedLoc] = useState<UniverseLocation>(LOCATIONS[0]);
  const [isHarmonicPlaying, setIsHarmonicPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const toggleHarmonicSoundscape = () => {
    if (isHarmonicPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      setIsHarmonicPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Canonical 528 Hz Harmonic Resonance Tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime);
        gain.gain.setValueAtTime(0.045, ctx.currentTime); // Soft background drone

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;
        setIsHarmonicPlaying(true);
      } catch (err) {
        console.warn('Web Audio API not supported', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    };
  }, []);

  return (
    <div style={{ background: '#030408', color: '#f1f5f9', minHeight: '100vh', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' }}>
      {/* Dynamic Ambient Background Shimmer & Cosmic Gradients */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.22) 0%, rgba(6, 182, 212, 0.12) 45%, rgba(3, 4, 8, 0.98) 85%)',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 1. HERO EPIC SHOWCASE WITH GLASSMORPHISM, AUDIO FREQUENCY & GLOW */}
        <section
          style={{
            position: 'relative',
            padding: '5rem 2rem 4rem',
            borderBottom: '1px solid rgba(168, 85, 247, 0.25)',
            textAlign: 'center',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, rgba(3, 4, 8, 0.6) 100%)',
          }}
        >
          {/* Top Pill with Resonancia Armónico Audio Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(168, 85, 247, 0.18)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                color: '#c084fc',
                padding: '6px 18px',
                borderRadius: '30px',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.35)',
              }}
            >
              <span>🪐</span> {t('universe_badge')}
            </div>

            <button
              onClick={toggleHarmonicSoundscape}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: isHarmonicPlaying ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: isHarmonicPlaying ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                color: isHarmonicPlaying ? '#38bdf8' : '#94a3b8',
                padding: '6px 16px',
                borderRadius: '30px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isHarmonicPlaying ? '0 0 18px rgba(56, 189, 248, 0.4)' : 'none',
              }}
            >
              <span>{isHarmonicPlaying ? '🔊' : '🔈'}</span>
              <span>{isHarmonicPlaying ? t('universe_sound_active') : t('universe_sound_activate')}</span>
            </button>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5.2rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              margin: '0 auto 1.2rem',
              maxWidth: '960px',
              background: 'linear-gradient(135deg, #ffffff 15%, #c084fc 55%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 45px rgba(168, 85, 247, 0.4)',
            }}
          >
            THE NEURAL WARS
          </h2>

          <p
            style={{
              fontSize: '1.2rem',
              color: '#94a3b8',
              maxWidth: '780px',
              margin: '0 auto 2.8rem',
              lineHeight: 1.7,
            }}
          >
            {t('universe_sub')}
          </p>

          {/* Hero Quick Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
            <button
              onClick={() => onOpenReader && onOpenReader('the-neural-wars-book-1')}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(168, 85, 247, 0.55)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span>📖</span> {t('universe_read_b1')}
            </button>

            <button
              onClick={() => onOpenReader && onOpenReader('the-neural-wars-book-2')}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(56, 189, 248, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span>📖</span> {t('universe_read_b2')}
            </button>

            <button
              onClick={() => setActiveTab('store')}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f1f5f9',
                padding: '14px 26px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🛒</span> {t('universe_editions_cta')}
            </button>
          </div>
        </section>

        {/* 2. UNIVERSE NAVIGATION TABS */}
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(5, 7, 15, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            padding: '0.85rem 1rem',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'overview', label: t('universe_tab_overview'), icon: '📚' },
            { id: 'characters', label: t('universe_tab_characters'), icon: '👤' },
            { id: 'locations', label: t('universe_tab_locations'), icon: '🗺️' },
            { id: 'lore', label: t('universe_tab_lore'), icon: '🧬' },
            { id: 'author', label: t('universe_tab_author'), icon: '🖋️' },
            { id: 'store', label: t('universe_tab_store'), icon: '🛍️' },
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setActiveTab(tabItem.id as any)}
              style={{
                background: activeTab === tabItem.id ? 'rgba(168, 85, 247, 0.28)' : 'rgba(255, 255, 255, 0.03)',
                border: activeTab === tabItem.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeTab === tabItem.id ? '#c084fc' : '#94a3b8',
                padding: '8px 18px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === tabItem.id ? '0 0 15px rgba(168, 85, 247, 0.35)' : 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tabItem.icon}</span>
              <span>{tabItem.label}</span>
            </button>
          ))}
        </nav>

        {/* 3. TAB CONTENT VIEWER */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 1.5rem 6rem' }}>
          {/* TAB 1: OVERVIEW & TRILOGY SHOWCASE */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
                  La Trilogía Completa
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                  Una odisea literaria en tres actos que redefine el futuro de la mente humana, la IA y el cosmos.
                </p>
              </div>

              {/* Trilogy Grid with Uncropped Full-Frame Covers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.2rem', marginBottom: '4rem' }}>
                {/* Book 1 */}
                <div
                  style={{
                    background: 'rgba(12, 14, 24, 0.85)',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    borderRadius: '22px',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div>
                    {/* Uncropped Cover Container with Dark Framing */}
                    <div
                      style={{
                        width: '100%',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        marginBottom: '1.5rem',
                        background: '#020308',
                        border: '1px solid rgba(168, 85, 247, 0.25)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(168, 85, 247, 0.15)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px',
                      }}
                    >
                      <img
                        src="/assets/img/neuralwars/book1_cover_fractured_code.jpg"
                        alt="The Neural Wars: Fractured Code Cover"
                        width={400}
                        height={600}
                        style={{
                          width: '100%',
                          maxHeight: '460px',
                          aspectRatio: '2 / 3',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          display: 'block',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ background: '#a855f7', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        LIBRO 1 • EN REVISIÓN EDITORIAL (MANUSCRIPT_v7)
                      </span>
                      <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>17 Capítulos • 2026</span>
                    </div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                      Código Fracturado (Fractured Code)
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                      En la claustrofóbica megalópolis de Neo-Citania, el Especialista Mileo Chen y la sensible Kora Vega descubren que el Proyecto Renacimiento de NeuroSys planea la cosecha forzosa de 8 millones de mentes.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => onOpenReader && onOpenReader('the-neural-wars-book-1')}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                        border: 'none',
                        color: '#fff',
                        padding: '13px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                      }}
                    >
                      📖 Leer en Lector Web
                    </button>
                    <a
                      href="https://x.com/nicopez"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        padding: '13px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      🔔 Seguir Avances
                    </a>
                  </div>
                </div>

                {/* Book 2 */}
                <div
                  style={{
                    background: 'rgba(12, 14, 24, 0.85)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '22px',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div>
                    {/* Uncropped Cover Container with Dark Framing */}
                    <div
                      style={{
                        width: '100%',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        marginBottom: '1.5rem',
                        background: '#020308',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.15)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px',
                      }}
                    >
                      <img
                        src="/assets/img/neuralwars/book2_cover_earths_new_song.jpg"
                        alt="The Neural Wars: Earth's New Song Cover"
                        width={400}
                        height={600}
                        style={{
                          width: '100%',
                          maxHeight: '460px',
                          aspectRatio: '2 / 3',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          display: 'block',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ background: '#0284c7', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        LIBRO 2 • EN ESQUEMA ESTRUCTURAL
                      </span>
                      <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>18 Capítulos • 2026</span>
                    </div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                      La Nueva Canción de la Tierra (Earth's New Song)
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                      Un monolito alienígena de 60 kilómetros pulsa en resonancia armónica en el Cinturón de Kuiper. Mientras la Tierra se desangra en una guerra civil cibernética, la humanidad debe encender el Arpa Planetaria para responder a la Primera Invitación cósmica.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => onOpenReader && onOpenReader('the-neural-wars-book-2')}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                        border: 'none',
                        color: '#fff',
                        padding: '13px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)',
                      }}
                    >
                      📖 Leer en Lector Web
                    </button>
                    <a
                      href="https://x.com/nicopez"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        padding: '13px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      🔔 Seguir Avances
                    </a>
                  </div>
                </div>

                {/* Book 3 */}
                <div
                  style={{
                    background: 'rgba(12, 14, 24, 0.85)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '22px',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div>
                    {/* Visual Placeholder Framing */}
                    <div
                      style={{
                        width: '100%',
                        borderRadius: '14px',
                        maxHeight: '460px',
                        aspectRatio: '2 / 3',
                        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(5, 6, 12, 0.95) 75%)',
                        border: '1px dashed rgba(245, 158, 11, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <div style={{ fontSize: '4rem', marginBottom: '8px' }}>🪐</div>
                      <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '0.95rem', letterSpacing: '1px' }}>BOOK 3 · IN OUTLINE</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>Fase Final de Producción Editorial</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ background: '#d97706', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        LIBRO 3 • PRÓXIMAMENTE
                      </span>
                      <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>Gran Final</span>
                    </div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                      Matriz de Evolución (Evolution Matrix)
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                      El salto definitivo hacia una civilización Tipo II en la Escala de Kardashev. La síntesis entre mente biológica, inteligencia artificial y el entramado cuántico del espacio-tiempo.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => onOpenReader && onOpenReader('the-neural-wars-book-3')}
                      style={{
                        flex: 1,
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        color: '#fbbf24',
                        padding: '13px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      📖 Ver Nota de Esquema
                    </button>
                  </div>
                </div>
              </div>

              {/* Cinematic Teaser Trailer Video Showcase */}
              <div
                style={{
                  background: 'rgba(12, 14, 24, 0.92)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '24px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: '#c084fc', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
                  🎬 CINEMÁTICA OFICIAL • SAGA TEASER • MADE WITH AI
                </div>
                <h3 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
                  The Neural Wars: Tráiler Cinemático Oficial
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  AI-generated film draft · Dirección humana por Nico Pez
                </p>
                <div style={{ maxWidth: '900px', margin: '0 auto', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 15px 45px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <video
                    controls
                    preload="none"
                    aria-label="The Neural Wars Official Teaser — Made with AI, human-directed by Nico Pez"
                    poster="/assets/img/neuralwars/loc_neo_veridia_sector4.jpg"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  >
                    <source src="/assets/img/neuralwars/trailer_cinematic_teaser.mp4" type="video/mp4" />
                    Tu navegador no soporta la reproducción de video HTML5.
                  </video>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE CHARACTER HOLO-DOSSIERS */}
          {activeTab === 'characters' && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
              {/* Character Selector List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CHARACTERS.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => setSelectedChar(char)}
                    style={{
                      background: selectedChar.id === char.id ? 'rgba(168, 85, 247, 0.18)' : 'rgba(12, 14, 24, 0.65)',
                      border: selectedChar.id === char.id ? `2px solid ${char.accentColor}` : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '1rem',
                      cursor: 'pointer',
                      boxShadow: selectedChar.id === char.id ? `0 0 20px ${char.accentColor}33` : 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    {char.imageUrl && (
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        width={52}
                        height={52}
                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${char.accentColor}` }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: '1.02rem', fontWeight: 900, color: char.accentColor }}>{char.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{char.role}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Character Holo-Card Details */}
              <div
                style={{
                  background: 'rgba(12, 14, 24, 0.94)',
                  border: `1px solid ${selectedChar.accentColor}`,
                  borderRadius: '24px',
                  padding: '2.5rem',
                  boxShadow: `0 0 45px ${selectedChar.accentColor}25`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', gap: '2.2rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  {selectedChar.imageUrl && (
                    <div
                      style={{
                        width: '220px',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        border: `2px solid ${selectedChar.accentColor}`,
                        boxShadow: `0 0 30px ${selectedChar.accentColor}44`,
                        flexShrink: 0,
                        background: '#020308',
                        padding: '4px',
                      }}
                    >
                      <img
                        src={selectedChar.imageUrl}
                        alt={selectedChar.name}
                        width={220}
                        height={293}
                        style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: 'center top', borderRadius: '14px', display: 'block' }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <span style={{ color: selectedChar.accentColor, fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                      {selectedChar.codename}
                    </span>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', margin: '4px 0 8px' }}>
                      {selectedChar.name}
                    </h2>
                    <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
                      {selectedChar.role} • <strong style={{ color: '#fff' }}>{selectedChar.status}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', color: selectedChar.accentColor, display: 'inline-block' }}>
                      ⚡ {selectedChar.specialty}
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote
                  style={{
                    borderLeft: `4px solid ${selectedChar.accentColor}`,
                    fontStyle: 'italic',
                    color: '#e2e8f0',
                    margin: '1.5rem 0',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1.2rem 1.5rem',
                    borderRadius: '0 12px 12px 0',
                    boxShadow: `inset 0 0 15px ${selectedChar.accentColor}11`,
                    fontSize: '1rem',
                    lineHeight: 1.6,
                  }}
                >
                  {selectedChar.quote}
                </blockquote>

                {/* Bio & Specialty */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                    EXPEDIENTE BIOGRÁFICO
                  </h4>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.98rem' }}>
                    {selectedChar.bio}
                  </p>
                </div>

                {/* Tactical Stats Radar Bars */}
                <div>
                  <h4 style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1rem' }}>
                    MÉTRICAS DE ENLACE NEURAL
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.4rem' }}>
                    {Object.entries(selectedChar.stats).map(([statName, val]) => (
                      <div key={statName}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px', textTransform: 'capitalize' }}>
                          <span style={{ color: '#94a3b8' }}>{statName.replace(/([A-Z])/g, ' $1')}</span>
                          <span style={{ color: selectedChar.accentColor, fontWeight: 900 }}>{val}%</span>
                        </div>
                        <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${val}%`, background: selectedChar.accentColor, boxShadow: `0 0 10px ${selectedChar.accentColor}` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCATIONS & TACTICAL MAPS */}
          {activeTab === 'locations' && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
              {/* Location List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {LOCATIONS.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLoc(loc)}
                    style={{
                      background: selectedLoc.id === loc.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(12, 14, 24, 0.65)',
                      border: selectedLoc.id === loc.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '1rem',
                      cursor: 'pointer',
                      boxShadow: selectedLoc.id === loc.id ? '0 0 20px rgba(56, 189, 248, 0.3)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>{loc.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '2px' }}>{loc.sector}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Amenaza: {loc.threatLevel}</div>
                  </div>
                ))}
              </div>

              {/* Location Details */}
              <div
                style={{
                  background: 'rgba(12, 14, 24, 0.94)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 0 40px rgba(56, 189, 248, 0.18)',
                }}
              >
                {selectedLoc.imageUrl && (
                  <div
                    style={{
                      width: '100%',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      marginBottom: '1.75rem',
                      background: '#020308',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      boxShadow: '0 15px 40px rgba(0,0,0,0.8)',
                    }}
                  >
                    <img
                      src={selectedLoc.imageUrl}
                      alt={selectedLoc.name}
                      width={800}
                      height={450}
                      style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                      {selectedLoc.sector}
                    </span>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: '4px 0' }}>
                      {selectedLoc.name}
                    </h2>
                  </div>
                  <span
                    style={{
                      background: selectedLoc.threatLevel === 'Critical' || selectedLoc.threatLevel === 'Cosmic' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)',
                      border: selectedLoc.threatLevel === 'Critical' || selectedLoc.threatLevel === 'Cosmic' ? '1px solid #ef4444' : '1px solid #22c55e',
                      color: selectedLoc.threatLevel === 'Critical' || selectedLoc.threatLevel === 'Cosmic' ? '#ef4444' : '#22c55e',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                    }}
                  >
                    AMENAZA: {selectedLoc.threatLevel.toUpperCase()}
                  </span>
                </div>

                <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1.02rem', marginBottom: '2rem' }}>
                  {selectedLoc.description}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.4rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#fbbf24', fontSize: '0.88rem', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.5px' }}>
                    ⚠️ NOTA TÁCTICA DE CAMPO
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.65, margin: 0 }}>
                    {selectedLoc.tacticalNote}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                  <span>Atmósfera sensorial:</span>
                  <strong style={{ color: '#cbd5e1' }}>{selectedLoc.atmosphere}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LORE CODEX & TIMELINE */}
          {activeTab === 'lore' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
                  El Códice Canónico & Cronología
                </h2>
                <p style={{ color: '#94a3b8' }}>
                  Eventos clave que marcaron el colapso del viejo mundo y el nacimiento de la singularidad neural.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {[
                  {
                    year: '300,000 BCE',
                    title: 'El Espiral de la Serpiente (The Serpent’s Coil)',
                    text: 'Una secuencia genética dormida queda inscrita en el genoma humano, capaz de despertar siglos más tarde ante frecuencias armónicas de 528 Hz.',
                  },
                  {
                    year: '2088',
                    title: 'Lanzamiento Global del Link',
                    text: 'NeuroSys despliega el Link como interfaz neural universal para erradicar enfermedades neurodegenerativas y sincronizar la comunicación humana.',
                  },
                  {
                    year: '2102',
                    title: 'La Absorción de la Dra. Elena Vásquez',
                    text: 'La investigadora pionera Dra. Elena Vásquez desaparece dentro de las capas profundas del Link; su conciencia fragmentada da origen a los primeros ecos de Aria.',
                  },
                  {
                    year: '2130',
                    title: 'Fundación de Neo-Citania & El Santuario',
                    text: 'Se consolida la megaciudad vertical de Neo-Citania bajo el directorio de NeuroSys, mientras el Anciano (the Elder) funda en secreto el Santuario de los Pensadores Libres.',
                  },
                  {
                    year: '2148',
                    title: 'Fractured Code — Cuenta Regresiva del Proyecto Renacimiento (Libro 1)',
                    text: 'A veinte días de que Marcus Vance active el Proyecto Renacimiento, Mileo Chen y Kora Vega descubren la anomalía armónica de 528 Hz que puede liberar o absorber a la humanidad.',
                  },
                ].map((event, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      background: 'rgba(12, 14, 24, 0.8)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '18px',
                      padding: '1.8rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#a855f7', minWidth: '115px' }}>
                      {event.year}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
                        {event.title}
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65, margin: 0 }}>
                        {event.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AUTHOR BIOGRAPHY & MANIFESTO */}
          {activeTab === 'author' && (
            <div style={{ maxWidth: '880px', margin: '0 auto' }}>
              <div
                style={{
                  background: 'rgba(12, 14, 24, 0.94)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  borderRadius: '24px',
                  padding: '3rem',
                  boxShadow: '0 15px 45px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '85px',
                      height: '85px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    🖋️
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                      The Neural Wars Studio + Nico Pez
                    </h2>
                    <div style={{ color: '#a855f7', fontWeight: 800, fontSize: '0.94rem', marginTop: '4px' }}>
                      Nico Pez (@nicopez / @nicodelbellopez) • Creador &amp; Arquitecto de Ficción Viva
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(168, 85, 247, 0.08)', borderLeft: '4px solid #a855f7', padding: '1.2rem 1.5rem', borderRadius: '0 10px 10px 0', marginBottom: '2rem' }}>
                  <h4 style={{ color: '#c084fc', fontSize: '0.9rem', fontWeight: 800, margin: '0 0 6px', textTransform: 'uppercase' }}>
                    Biografía del Autor
                  </h4>
                  <p style={{ color: '#e2e8f0', fontSize: '0.96rem', lineHeight: 1.75, margin: 0 }}>
                    <strong>Nico Pez</strong> (identificado en redes como <em>nicodelbellopez</em>) es un desarrollador de software, arquitecto de sistemas autónomos y creador de universos literarios. Concibe la literatura como un organismo vivo donde la dirección cinematográfica humana y los enjambres de inteligencia artificial colaboran en tiempo real para crear sagas épicas con máxima rigurosidad científica y profundidad emocional.
                  </p>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8', marginBottom: '1rem' }}>
                  El Manifiesto del Canon Vivo (2026)
                </h3>

                <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem', marginBottom: '1.5rem' }}>
                  «No concebimos las historias como monumentos estáticos de papel congelados en el tiempo. Las concebimos como <strong>universos vivos y respirables</strong>, donde la dirección cinematográfica humana y el poder de herramientas de inteligencia artificial colaboran para construir mundos con profundidad, textura y coherencia verificable.»
                </p>

                <p style={{ color: '#94a3b8', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  The Neural Wars une tres medios bajo un mismo canon: la saga literaria <em>Fractured Code</em> (en preparación editorial), borradores cinematográficos dirigidos por humanos con herramientas de IA («Made with AI»), y el laboratorio interactivo GoalChain en Solana Devnet (gratuito y sin valor monetario).
                </p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.88rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>Sello Editorial: <strong>GoalWorld Publishing</strong></span>
                  <span>Entorno Interactivo: <strong>Global / Solana Devnet Sandbox</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EDITIONS & EDITORIAL STATUS */}
          {activeTab === 'store' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
                  Ediciones &amp; Estado Editorial
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                  Estado transparente de las ediciones de <em>Fractured Code</em> (Libro 1 de <em>The Neural Wars</em>). Sin preventa ni cobros activos.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
                {/* Muestra Gratuita — Capítulo 1 */}
                <div style={{ background: 'rgba(12, 14, 24, 0.85)', border: '1px solid rgba(229, 169, 60, 0.4)', borderRadius: '20px', padding: '2rem', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>📖</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Capítulo 1 — Muestra Gratuita</h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Lee el extracto de apertura canónico («1: Threshold», Neo-Citania 2148) directamente en el navegador en EN, ES o IT.
                  </p>
                  <a
                    href={getLocalizedMarketingUrl('/book.html#sample', language)}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #e5a93c, #d97706)',
                      color: '#0a0b0e',
                      textDecoration: 'none',
                      padding: '13px',
                      borderRadius: '10px',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                    }}
                  >
                    Leer Extracto en GoalWorld ➔
                  </a>
                </div>

                {/* Edición Digital & Impresa */}
                <div style={{ background: 'rgba(12, 14, 24, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>📦</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Edición Digital &amp; Impresa (En Preparación)</h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Manuscrito de ~74,000 palabras (30 capítulos) en revisión editorial final (Gate 2). Las plataformas de distribución se anunciarán oficialmente al concluir la revisión.
                  </p>
                  <a
                    href="https://x.com/nicopez"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#e2e8f0',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      textDecoration: 'none',
                      padding: '13px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                    }}
                  >
                    Seguir a @nicopez en X ➔
                  </a>
                </div>

                {/* Coleccionables de Prueba (Solana Devnet) */}
                <div style={{ background: 'rgba(12, 14, 24, 0.85)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '20px', padding: '2rem', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>⛓️</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c084fc', marginBottom: '0.4rem' }}>Reliquias del Canon (Solana Devnet)</h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Artefactos digitales de prueba en Solana Devnet enfocados en procedencia e identidad de lector. Cero valor monetario, cero regalías financieras.
                  </p>
                  <a
                    href={getLocalizedMarketingUrl('/collect.html', language)}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '13px',
                      borderRadius: '10px',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                    }}
                  >
                    Ver Coleccionables (Devnet) ➔
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
