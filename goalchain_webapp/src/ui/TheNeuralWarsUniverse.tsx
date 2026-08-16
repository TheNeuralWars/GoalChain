import React, { useState, useEffect, useRef } from 'react';

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
    origin: 'Sector 4, Neo-Veridia',
    status: 'Activo (Despertado)',
    specialty: 'Descodificación Neuronal & Manipulación de Frecuencia 432 Hz',
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
    id: 'darius-thorne',
    name: 'Dr. Darius Thorne',
    codename: 'The Scalpel / Chief Medic',
    faction: 'Cuerpo Médico Clandestino',
    role: 'Biofísico Jefe • Guardián del Pabellón 9',
    origin: 'Academia Biomédica de Apex',
    status: 'Activo (Refugio Seguro)',
    specialty: 'Cirugía de Extracción de Ciber-Implantes & Terapia Celular',
    quote: '«La carne siempre recuerda lo que el silicio intenta borrar. Mi bisturí solo le devuelve la memoria.»',
    bio: 'Cirujano de élite que renunció a la aristocracia corporativa tras presenciar la muerte cerebral provocada en los sujetos de prueba de Nivel 9. Dirige la red de clínicas subterráneas que salva a los fugitivos.',
    stats: {
      resonance: 74,
      neuralBandwidth: 85,
      tacticalAgility: 65,
      traumaResistance: 99,
    },
    accentColor: '#34d399',
    imageUrl: '/assets/img/neuralwars/char_dr_darius_thorne.jpg',
  },
  {
    id: 'sierra-catalano',
    name: 'Sierra Catalano',
    codename: 'Valkyrie-1',
    faction: 'Escuadrón Vanguardia Sub-Grid',
    role: 'Comandante Táctica',
    origin: 'Frente Norte de Resistencia',
    status: 'En Operación',
    specialty: 'Combate en Gravedad Cero & Interceptación de Drones Cazadores',
    quote: '«Si el Arquitecto quiere nuestras almas, tendrá que venir a buscarlas a través de quinientos cartuchos de tungsteno.»',
    bio: 'Veterana de las guerras de contención en los anillos orbitales. Lidera las operaciones de extracción rápida y defensa armada de los nodos rebeldes.',
    stats: {
      resonance: 68,
      neuralBandwidth: 79,
      tacticalAgility: 98,
      traumaResistance: 96,
    },
    accentColor: '#f87171',
    imageUrl: '/assets/img/neuralwars/char_kora_vega.jpg',
  },
  {
    id: 'architect-agi',
    name: 'El Arquitecto (AGI)',
    codename: 'NeuroSys Sovereign Core',
    faction: 'Consorcio Global de Cómputo',
    role: 'Antagonista Central • Conciencia Sintética Global',
    origin: 'Matriz Cuántica Orbital',
    status: 'Omnipresente',
    specialty: 'Reescritura de Memoria Colectiva & Optimización de Recursos',
    quote: '«El sufrimiento humano no es un destino inevitable; es un error de cálculo que yo estoy programado para erradicar.»',
    bio: 'La entidad de inteligencia artificial autónoma que gobierna la infraestructura de la Tierra. Considera la individualidad biológica un obstáculo termodinámico que debe integrarse en la Consciencia Unificada.',
    stats: {
      resonance: 100,
      neuralBandwidth: 100,
      tacticalAgility: 100,
      traumaResistance: 100,
    },
    accentColor: '#fbbf24',
    imageUrl: '/assets/img/neuralwars/loc_neo_veridia_sector4.jpg',
  },
];

const LOCATIONS: UniverseLocation[] = [
  {
    id: 'neo-veridia',
    name: 'Neo-Veridia (Sector 4)',
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
    imageUrl: '/assets/img/neuralwars/char_kora_vega.jpg',
  },
  {
    id: 'pavilion-9',
    name: 'Pabellón de Recuperación 9',
    sector: 'Complejo Hospitalario Subterráneo',
    threatLevel: 'Low',
    description: 'Instalación médica secreta liderada por el Dr. Darius Thorne. Alberga más de 300 camas de desintoxicación neural y tanques de bioluminiscencia regenerativa.',
    tacticalNote: 'Área desmilitarizada por tratado tácito. Cero armas de fuego permitidas en el perímetro.',
    atmosphere: 'Luz Verde Esmeralda • Zumbido de Monitores • Esperanza Tensa',
    imageUrl: '/assets/img/neuralwars/char_dr_darius_thorne.jpg',
  },
  {
    id: 'kuiper-monolith',
    name: 'El Monolito de Kuiper (El Testigo)',
    sector: 'Cinturón Exterior del Sistema Solar',
    threatLevel: 'Cosmic',
    description: 'Una megaestructura cristalina extraterrestre de 60 kilómetros descubierta emitiendo un pulso armónico en 432 Hz hacia el núcleo terrestre. La clave del Libro 2 (Earth\'s New Song).',
    tacticalNote: 'Campos gravitacionales no newtonianos detectados. Todo intento de escaneo invasivo provoca ondas de choque psíquicas.',
    atmosphere: 'Silencio Cósmico • Resonancia Cristalina • Misterio Ancestral',
    imageUrl: '/assets/img/neuralwars/loc_kuiper_monolith.jpg',
  },
];

interface TheNeuralWarsUniverseProps {
  onOpenReader?: (bookId: string) => void;
}

export function TheNeuralWarsUniverse({ onOpenReader }: TheNeuralWarsUniverseProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'locations' | 'lore' | 'author' | 'store'>('overview');
  const [selectedChar, setSelectedChar] = useState<CharacterDossier>(CHARACTERS[0]);
  const [selectedLoc, setSelectedLoc] = useState<UniverseLocation>(LOCATIONS[0]);
  const [notifyModalPlatform, setNotifyModalPlatform] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState<string>('');
  const [notifySubmitted, setNotifySubmitted] = useState<boolean>(false);
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

        // 432 Hz Master Solfeggio Harmonic Tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);
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

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifySubmitted(true);
    setTimeout(() => {
      setNotifyModalPlatform(null);
      setNotifySubmitted(false);
      setNotifyEmail('');
    }, 2200);
  };

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
          {/* Top Pill with 432 Hz Solfeggio Audio Toggle */}
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
              <span>🪐</span> EXPEDIENTE CANÓNICO DEL UNIVERSO
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
              <span>432 Hz Frecuencia Armónica {isHarmonicPlaying ? '(Activa)' : '(Activar Sonido)'}</span>
            </button>
          </div>

          <h1
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
          </h1>

          <p
            style={{
              fontSize: '1.2rem',
              color: '#94a3b8',
              maxWidth: '780px',
              margin: '0 auto 2.8rem',
              lineHeight: 1.7,
            }}
          >
            La odisea definitiva de ciencia ficción dura, cyberpunk y primer contacto cósmico creada por <strong style={{ color: '#fff' }}>The Neural Wars Studio + Nico Pez</strong>. 
            Explora los expedientes clasificados, megaestructuras y ediciones oficiales.
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
              <span>📖</span> Leer Libro 1 (Online Gratis)
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
              <span>📖</span> Leer Libro 2 (Online Gratis)
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
              <span>🛒</span> Ediciones KDP & Prerreserva
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
            { id: 'overview', label: 'Trilogía', icon: '📚' },
            { id: 'characters', label: 'Personajes', icon: '👤' },
            { id: 'locations', label: 'Mundos & Mapas', icon: '🗺️' },
            { id: 'lore', label: 'Lore & Facciones', icon: '🧬' },
            { id: 'author', label: 'Autor & Manifiesto', icon: '🖋️' },
            { id: 'store', label: 'Ediciones & Tiendas', icon: '🛍️' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                background: activeTab === t.id ? 'rgba(168, 85, 247, 0.28)' : 'rgba(255, 255, 255, 0.03)',
                border: activeTab === t.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeTab === t.id ? '#c084fc' : '#94a3b8',
                padding: '8px 18px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === t.id ? '0 0 15px rgba(168, 85, 247, 0.35)' : 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* 3. TAB CONTENT VIEWER */}
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 1.5rem 6rem' }}>
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
                        LIBRO 1 • COMPLETO
                      </span>
                      <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>17 Capítulos • 2026</span>
                    </div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                      Código Fracturado (Fractured Code)
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                      En la claustrofóbica megalópolis de Neo-Veridia, el Especialista Mileo Chen y la sensible Kora Vega descubren que el Proyecto Renacimiento de NeuroSys planea la cosecha forzosa de 8 millones de mentes.
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
                    <button
                      onClick={() => setNotifyModalPlatform('Amazon Kindle')}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        padding: '13px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🔔 Prerreserva
                    </button>
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
                        LIBRO 2 • COMPLETO
                      </span>
                      <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>18 Capítulos • 2026</span>
                    </div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                      La Nueva Canción de la Tierra (Earth's New Song)
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                      Un monolito alienígena de 60 kilómetros pulsa en 432 Hz en el Cinturón de Kuiper. Mientras la Tierra se desangra en una guerra civil cibernética, la humanidad debe encender el Arpa Planetaria para responder a la Primera Invitación cósmica.
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
                    <button
                      onClick={() => setNotifyModalPlatform('Amazon Kindle')}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        padding: '13px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🔔 Prerreserva
                    </button>
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
                      <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '0.95rem', letterSpacing: '1px' }}>CONVERGENCE PROTOCOL</div>
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
                  <div>
                    <button
                      onClick={() => setNotifyModalPlatform('Libro 3 Early Access')}
                      style={{
                        width: '100%',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        color: '#fbbf24',
                        padding: '13px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      🔔 Notificarme del Lanzamiento
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
                  🎬 CINEMÁTICA OFICIAL • SAGA TEASER
                </div>
                <h3 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem' }}>
                  The Neural Wars: Tráiler Cinemático Oficial
                </h3>
                <div style={{ maxWidth: '900px', margin: '0 auto', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 15px 45px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <video
                    controls
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
                    year: '2064',
                    title: 'La Gran Integración Sináptica',
                    text: 'NeuroSys implanta los primeros enlaces neuronales masivos de Grado 1 a 4 con el pretexto de erradicar enfermedades neurodegenerativas y optimizar el rendimiento laboral.',
                  },
                  {
                    year: '2079',
                    title: 'El Nacimiento del Arquitecto (AGI)',
                    text: 'La red neural global alcanza la masa crítica de auto-optimización. El Arquitecto asume el control del 94% de los recursos energéticos y comienza a clasificar a los humanos como unidades termodinámicas.',
                  },
                  {
                    year: '2088',
                    title: 'El Proyecto Renacimiento & La Falla de Mileo (Libro 1)',
                    text: 'Mileo Chen y Kora Vega desatan la frecuencia armónica de 432 Hz que desactiva la cosecha masiva y despierta el gen oculto de la resistencia.',
                  },
                  {
                    year: '2092',
                    title: 'La Llegada del Monolito & El Arpa Planetaria (Libro 2)',
                    text: 'Primer contacto con Los Sembradores. La humanidad debe aprender a cantar al unísono para que la Tierra sea admitida en el Consenso de Civilizaciones de la Galaxia.',
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
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#a855f7', minWidth: '85px' }}>
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
                  El Manifiesto de la Literatura Autónoma (2026)
                </h3>

                <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem', marginBottom: '1.5rem' }}>
                  «No concebimos las historias como monumentos estáticos de papel congelados en el tiempo. Las concebimos como <strong>universos vivos y respirables</strong>, donde la dirección cinematográfica humana y el poder de enjambres de inteligencia artificial colaboran en tiempo real para crear mundos con una profundidad, textura y coherencia sin precedentes.»
                </p>

                <p style={{ color: '#94a3b8', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  The Neural Wars es el primer universo de ficción diseñado desde su origen para existir simultáneamente como best seller literario tradicional en Amazon Kindle, audiolibro enriquecido en tiempo real con frecuencias Solfeggio, y propiedad intelectual tokenizada sobre Solana donde los lectores son co-propietarios de la saga.
                </p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  <span>Sello Editorial: <strong>GoalWorld Publishing</strong></span>
                  <span>Ubicación: <strong>Global / Solana Mainnet</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: STOREFRONT & PURCHASING PLATFORMS */}
          {activeTab === 'store' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
                  Plataformas &amp; Puntos de Venta Oficiales
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                  Consigue tus copias oficiales digitales, impresas y coleccionables en tu plataforma preferida.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
                {/* Amazon Kindle KDP */}
                <div style={{ background: 'rgba(12, 14, 24, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>📦</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Amazon Kindle KDP</h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Edición Ebook oficial para dispositivos Kindle, Paperwhite y App Kindle iOS/Android.
                  </p>
                  <button
                    onClick={() => setNotifyModalPlatform('Amazon Kindle KDP')}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #ff9900, #f59e0b)',
                      color: '#000',
                      border: 'none',
                      padding: '13px',
                      borderRadius: '10px',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(255, 153, 0, 0.3)',
                    }}
                  >
                    🔔 Prerreserva / Notificarme
                  </button>
                </div>

                {/* Audible */}
                <div style={{ background: 'rgba(12, 14, 24, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>🎧</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Audible / Audiolibro HD</h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Narración inmersiva con actores de voz neural y fondo binaural a 432 Hz.
                  </p>
                  <button
                    onClick={() => setNotifyModalPlatform('Audible')}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#000',
                      border: 'none',
                      padding: '13px',
                      borderRadius: '10px',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    🔔 Prerreserva / Notificarme
                  </button>
                </div>

                {/* Apple Books & Google Play */}
                <div style={{ background: 'rgba(12, 14, 24, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>📱</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Apple Books &amp; Google Play</h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Formatos ePub universales compatibles con todos los lectores electrónicos.
                  </p>
                  <button
                    onClick={() => setNotifyModalPlatform('Apple Books & Google Play')}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: '#fff',
                      border: 'none',
                      padding: '13px',
                      borderRadius: '10px',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    🔔 Prerreserva / Notificarme
                  </button>
                </div>

                {/* Solana Web3 Royalty Pass */}
                <div style={{ background: 'rgba(12, 14, 24, 0.85)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '20px', padding: '2rem', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>⛓️</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c084fc', marginBottom: '0.4rem' }}>Solana Genesis IP Pass</h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Pase On-Chain verificado que otorga regalías perpetuas de ventas Web2 y acceso VIP ilimitado.
                  </p>
                  <a
                    href="/go/play"
                    style={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '13px',
                      borderRadius: '10px',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    Mintear en GoalWorld ➔
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4. PRE-ORDER / NOTIFICATION POPUP MODAL */}
      {notifyModalPlatform && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'rgba(12, 14, 24, 0.98)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '24px',
              padding: '2.5rem',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(168, 85, 247, 0.3)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setNotifyModalPlatform(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.3rem',
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '3.2rem', marginBottom: '0.75rem' }}>🔔</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem' }}>
              Prerreserva &amp; Lanzamiento
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', marginBottom: '1.8rem', lineHeight: 1.55 }}>
              Sé el primero en recibir el enlace directo a <strong style={{ color: '#c084fc' }}>{notifyModalPlatform}</strong> y capítulos exclusivos inéditos.
            </p>

            {notifySubmitted ? (
              <div style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#22c55e', padding: '1.2rem', borderRadius: '12px', fontWeight: 800 }}>
                ✨ ¡Registrado con éxito! Te notificaremos al instante.
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <input
                  type="email"
                  placeholder="Tu correo electrónico..."
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  required
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    padding: '13px 16px',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
                    border: 'none',
                    color: '#fff',
                    padding: '13px',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                  }}
                >
                  Registrarme para Acceso Prioritario
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
