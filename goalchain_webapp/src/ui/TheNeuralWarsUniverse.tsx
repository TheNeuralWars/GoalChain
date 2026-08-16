import React, { useState } from 'react';

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
}

export interface UniverseLocation {
  id: string;
  name: string;
  sector: string;
  threatLevel: 'Low' | 'Moderate' | 'Critical' | 'Cosmic';
  description: string;
  tacticalNote: string;
  atmosphere: string;
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
  },
  {
    id: 'sub-grid',
    name: 'Los Túneles del Sub-Grid',
    sector: 'Antigua Red de Metro / Cloacas Profundas',
    threatLevel: 'Moderate',
    description: 'El corazón latiente de la resistencia. Millas de túneles abandonados blindados contra ondas electromagnéticas, donde miles de fugitivos viven conectados al Arpa Planetaria.',
    tacticalNote: 'Puntos de acceso protegidos por trampas sónicas de 18 kHz. Solo entrar con salvoconducto de Kora Vega.',
    atmosphere: 'Clandestinidad • Cables Expuestos • Vapor Cálido',
  },
  {
    id: 'pavilion-9',
    name: 'Pabellón de Recuperación 9',
    sector: 'Complejo Hospitalario Subterráneo',
    threatLevel: 'Low',
    description: 'Instalación médica secreta liderada por el Dr. Darius Thorne. Alberga más de 300 camas de desintoxicación neural y tanques de bioluminiscencia regenerativa.',
    tacticalNote: 'Área desmilitarizada por tratado tácito. Cero armas de fuego permitidas en el perímetro.',
    atmosphere: 'Luz Verde Esmeralda • Zumbido de Monitores • Esperanza Tensa',
  },
  {
    id: 'kuiper-monolith',
    name: 'El Monolito de Kuiper (El Testigo)',
    sector: 'Cinturón Exterior del Sistema Solar',
    threatLevel: 'Cosmic',
    description: 'Una megaestructura cristalina extraterrestre de 60 kilómetros descubierta emitiendo un pulso armónico en 432 Hz hacia el núcleo terrestre. La clave del Libro 2 (Earth\'s New Song).',
    tacticalNote: 'Campos gravitacionales no newtonianos detectados. Todo intento de escaneo invasivo provoca ondas de choque psíquicas.',
    atmosphere: 'Silencio Cósmico • Resonancia Cristalina • Misterio Ancestral',
  },
];

interface TheNeuralWarsUniverseProps {
  onOpenReader?: (bookId: string) => void;
}

export function TheNeuralWarsUniverse({ onOpenReader }: TheNeuralWarsUniverseProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'locations' | 'lore' | 'author' | 'store'>('overview');
  const [selectedChar, setSelectedChar] = useState<CharacterDossier>(CHARACTERS[0]);
  const [selectedLoc, setSelectedLoc] = useState<UniverseLocation>(LOCATIONS[0]);

  return (
    <div style={{ background: '#05060b', color: '#f1f5f9', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      {/* 1. HERO EPIC SHOWCASE */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 2rem 4rem',
          background: 'radial-gradient(ellipse at 50% 20%, rgba(168, 85, 247, 0.25) 0%, rgba(5, 6, 11, 0.98) 75%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#c084fc',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          <span>🪐</span> EXPLORADOR CANÓNICO DEL UNIVERSO
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: '0 auto 1.2rem',
            maxWidth: '900px',
            background: 'linear-gradient(135deg, #ffffff 30%, #c084fc 70%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          THE NEURAL WARS
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: '#94a3b8',
            maxWidth: '720px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Sumérgete en la saga de ciencia ficción dura, cyberpunk y primer contacto cósmico. 
          Descubre el lore clasificado, los personajes rebeldes, las megaestructuras y las ediciones oficiales antes de comenzar tu lectura.
        </p>

        {/* Hero Quick Action CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            onClick={() => onOpenReader && onOpenReader('the-neural-wars-book-1')}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(168, 85, 247, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s',
            }}
          >
            <span>📖</span> Leer Libro 1 (Online Gratis)
          </button>

          <button
            onClick={() => setActiveTab('store')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f1f5f9',
              padding: '14px 24px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🛒</span> Tiendas Oficiales & Kindle
          </button>
        </div>
      </section>

      {/* 2. UNIVERSE NAVIGATION TABS */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(10, 11, 22, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '0.75rem 1rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'overview', label: 'Trilogía', icon: '📚' },
          { id: 'characters', label: 'Personajes', icon: '👤' },
          { id: 'locations', label: 'Mundos & Mapas', icon: '🗺️' },
          { id: 'lore', label: 'Lore & Facciones', icon: '🧬' },
          { id: 'author', label: 'Autor & Manifiesto', icon: '🖋️' },
          { id: 'store', label: 'Comprar / Tiendas', icon: '🛍️' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              background: activeTab === t.id ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              border: activeTab === t.id ? '1px solid #a855f7' : '1px solid transparent',
              color: activeTab === t.id ? '#c084fc' : '#94a3b8',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        {/* TAB 1: OVERVIEW & TRILOGY SHOWCASE */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
                La Trilogía Completa
              </h2>
              <p style={{ color: '#94a3b8' }}>
                Una odisea literaria en tres actos que redefine el futuro de la mente humana, la IA y el cosmos.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {/* Book 1 */}
              <div
                style={{
                  background: 'rgba(15, 17, 26, 0.8)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '20px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ background: '#a855f7', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      LIBRO 1 • COMPLETO
                    </span>
                    <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>17 Capítulos</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                    Código Fracturado (Fractured Code)
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    En la claustrofóbica megalópolis de Neo-Veridia, el Especialista Mileo Chen y la sensible Kora Vega descubren que el Proyecto Renacimiento de NeuroSys planea la cosecha forzosa de 8 millones de mentes. La primera batalla por el alma de la especie.
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
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    📖 Leer en Lector Web
                  </button>
                  <button
                    onClick={() => setActiveTab('store')}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Kindle / Comprar
                  </button>
                </div>
              </div>

              {/* Book 2 */}
              <div
                style={{
                  background: 'rgba(15, 17, 26, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '20px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ background: '#0284c7', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      LIBRO 2 • COMPLETO
                    </span>
                    <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>18 Capítulos</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                    La Nueva Canción de la Tierra (Earth's New Song)
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
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
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    📖 Leer en Lector Web
                  </button>
                  <button
                    onClick={() => setActiveTab('store')}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Kindle / Comprar
                  </button>
                </div>
              </div>

              {/* Book 3 */}
              <div
                style={{
                  background: 'rgba(15, 17, 26, 0.8)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '20px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ background: '#d97706', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      LIBRO 3 • PRÓXIMAMENTE
                    </span>
                    <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>Gran Final</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                    Matriz de Evolución (Evolution Matrix)
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    El salto definitivo hacia una civilización Tipo II en la Escala de Kardashev. La síntesis entre mente biológica, inteligencia artificial y el entramado cuántico del espacio-tiempo.
                  </p>
                </div>
                <div>
                  <button
                    disabled
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                      color: '#94a3b8',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'not-allowed',
                    }}
                  >
                    🔒 En Fase Editorial 2026
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE CHARACTER HOLO-DOSSIERS */}
        {activeTab === 'characters' && (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
            {/* Character Selector List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CHARACTERS.map((char) => (
                <div
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  style={{
                    background: selectedChar.id === char.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(15, 17, 26, 0.6)',
                    border: selectedChar.id === char.id ? `2px solid ${char.accentColor}` : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: char.accentColor }}>{char.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{char.role}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>{char.faction}</div>
                </div>
              ))}
            </div>

            {/* Selected Character Holo-Card Details */}
            <div
              style={{
                background: 'rgba(15, 17, 26, 0.9)',
                border: `1px solid ${selectedChar.accentColor}`,
                borderRadius: '20px',
                padding: '2.5rem',
                boxShadow: `0 0 30px ${selectedChar.accentColor}22`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ color: selectedChar.accentColor, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {selectedChar.codename}
                  </span>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: '4px 0' }}>
                    {selectedChar.name}
                  </h2>
                  <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{selectedChar.role} • <strong style={{ color: '#fff' }}>{selectedChar.status}</strong></div>
                </div>
              </div>

              {/* Quote */}
              <blockquote
                style={{
                  borderLeft: `4px solid ${selectedChar.accentColor}`,
                  paddingLeft: '1.2rem',
                  fontStyle: 'italic',
                  color: '#e2e8f0',
                  margin: '1.5rem 0',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '1rem 1.4rem',
                  borderRadius: '0 10px 10px 0',
                }}
              >
                {selectedChar.quote}
              </blockquote>

              {/* Bio & Specialty */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  EXPEDIENTE BIOGRÁFICO
                </h4>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {selectedChar.bio}
                </p>
              </div>

              {/* Tactical Stats Radar Bars */}
              <div>
                <h4 style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
                  MÉTRICAS DE ENLACE NEURAL
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {Object.entries(selectedChar.stats).map(([statName, val]) => (
                    <div key={statName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px', textTransform: 'capitalize' }}>
                        <span style={{ color: '#94a3b8' }}>{statName.replace(/([A-Z])/g, ' $1')}</span>
                        <span style={{ color: selectedChar.accentColor, fontWeight: 800 }}>{val}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${val}%`, background: selectedChar.accentColor }} />
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
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
            {/* Location List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLoc(loc)}
                  style={{
                    background: selectedLoc.id === loc.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 17, 26, 0.6)',
                    border: selectedLoc.id === loc.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{loc.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '2px' }}>{loc.sector}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Amenaza: {loc.threatLevel}</div>
                </div>
              ))}
            </div>

            {/* Location Details */}
            <div
              style={{
                background: 'rgba(15, 17, 26, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '20px',
                padding: '2.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {selectedLoc.sector}
                  </span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '4px 0' }}>
                    {selectedLoc.name}
                  </h2>
                </div>
                <span
                  style={{
                    background: selectedLoc.threatLevel === 'Critical' || selectedLoc.threatLevel === 'Cosmic' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    border: selectedLoc.threatLevel === 'Critical' || selectedLoc.threatLevel === 'Cosmic' ? '1px solid #ef4444' : '1px solid #22c55e',
                    color: selectedLoc.threatLevel === 'Critical' || selectedLoc.threatLevel === 'Cosmic' ? '#ef4444' : '#22c55e',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  NIVEL: {selectedLoc.threatLevel.toUpperCase()}
                </span>
              </div>

              <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '1rem', marginBottom: '2rem' }}>
                {selectedLoc.description}
              </p>

              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>
                  ⚠️ NOTA TÁCTICA DE CAMPO
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                  {selectedLoc.tacticalNote}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                <span>Atmósfera sensorial:</span>
                <strong style={{ color: '#cbd5e1' }}>{selectedLoc.atmosphere}</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LORE CODEX & TIMELINE */}
        {activeTab === 'lore' && (
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
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
                    background: 'rgba(15, 17, 26, 0.7)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a855f7', minWidth: '80px' }}>
                    {event.year}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
                      {event.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
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
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div
              style={{
                background: 'rgba(15, 17, 26, 0.9)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '24px',
                padding: '3rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                  }}
                >
                  🖋️
                </div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                    The Neural Wars Studio &amp; Nico Pez
                  </h2>
                  <div style={{ color: '#a855f7', fontWeight: 700, fontSize: '0.9rem', marginTop: '4px' }}>
                    Creador de Mundos Autónomos • Arquitecto de Ficción Viva
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginBottom: '1rem' }}>
                El Manifiesto de la Literatura Autónoma (2026)
              </h3>

              <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.98rem', marginBottom: '1.5rem' }}>
                «No concebimos las historias como monumentos estáticos de papel congelados en el tiempo. Las concebimos como <strong>universos vivos y respirables</strong>, donde la dirección cinematográfica humana y el poder de enjambres de inteligencia artificial colaboran en tiempo real para crear mundos con una profundidad, textura y coherencia sin precedentes.»
              </p>

              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                The Neural Wars es el primer universo de ficción diseñado desde su origen para existir simultáneamente como best seller literario tradicional en Amazon Kindle, audiolibro enriquecido en tiempo real con frecuencias Solfeggio, y propiedad intelectual tokenizada sobre Solana donde los lectores son co-propietarios de la saga.
              </p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
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
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
                Plataformas &amp; Puntos de Venta Oficiales
              </h2>
              <p style={{ color: '#94a3b8' }}>
                Consigue tus copias oficiales digitales, impresas y coleccionables en tu plataforma preferida.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Amazon Kindle KDP */}
              <div style={{ background: 'rgba(15, 17, 26, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Amazon Kindle KDP</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.2rem' }}>
                  Edición Ebook oficial para dispositivos Kindle, Paperwhite y App Kindle iOS/Android.
                </p>
                <a
                  href="https://amazon.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    background: '#ff9900',
                    color: '#000',
                    textDecoration: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                  }}
                >
                  Comprar en Amazon ➔
                </a>
              </div>

              {/* Audible */}
              <div style={{ background: 'rgba(15, 17, 26, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎧</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Audible / Audiolibro HD</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.2rem' }}>
                  Narración inmersiva con actores de voz neural y fondo binaural a 432 Hz.
                </p>
                <a
                  href="https://audible.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    background: '#f59e0b',
                    color: '#000',
                    textDecoration: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                  }}
                >
                  Escuchar en Audible ➔
                </a>
              </div>

              {/* Apple Books & Google Play */}
              <div style={{ background: 'rgba(15, 17, 26, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📱</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Apple Books &amp; Google Play</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.2rem' }}>
                  Formatos ePub universales compatibles con todos los lectores electrónicos.
                </p>
                <a
                  href="https://books.apple.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    background: '#6366f1',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                  }}
                >
                  Ver en Apple Books ➔
                </a>
              </div>

              {/* Solana Web3 Royalty Pass */}
              <div style={{ background: 'rgba(15, 17, 26, 0.8)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⛓️</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c084fc', marginBottom: '0.4rem' }}>Solana Genesis IP Pass</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.2rem' }}>
                  Pase On-Chain verificado que otorga regalías perpetuas de ventas Web2 y acceso VIP ilimitado.
                </p>
                <a
                  href="/go/play"
                  style={{
                    display: 'block',
                    background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
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
  );
}
