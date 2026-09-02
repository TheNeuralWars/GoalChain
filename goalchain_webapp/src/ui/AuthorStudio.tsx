import React, { useState, useMemo } from 'react';

const AI_CLICHES = [
  'testament to',
  'symphony of',
  'tapestry of',
  'palpable tension',
  'cut with a knife',
  'shiver down',
  'chills down',
  'unbeknownst',
  'little did they know',
  'labyrinthine',
  'echoed hollowly',
  'delve into',
  'beacon of hope',
  'mere shadow of',
  'vibrant tapestry',
  'visceral reminder'
];

const FILTER_WORDS = ['felt', 'feel', 'heard', 'hear', 'saw', 'see', 'noticed', 'wondered', 'watched', 'seemed', 'realized'];

export function AuthorStudio() {
  const [activeStudioTab, setActiveStudioTab] = useState<'prose' | 'characters' | 'beats' | 'cinematic' | 'kdp'>('prose');
  const [sampleText, setSampleText] = useState<string>(
    `The rain fell against the seventy-fourth-floor bay window with military discipline: identical, perfectly spherical droplets tracing parallel furrows separated by exactly seven millimeters of reinforced glass.\n\nMileo Chen pressed the pad of his right index finger against the chilled surface. For a fraction of a second, the icy bite of the glass pinched his flesh with sharp authenticity. But before the shiver could travel up his arm, the implant at the base of his skull emitted a dull hum. An imperceptible discharge of synthetic heat spread across his brainstem, followed by a burst of chemical suppressors that extinguished the sensation like freezing water dousing an ember.`
  );

  // Analysis computations
  const metrics = useMemo(() => {
    const words = sampleText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const sentences = sampleText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const sentCount = Math.max(1, sentences.length);
    const sentLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLen = sentLengths.reduce((a, b) => a + b, 0) / sentCount;
    const variance = sentLengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / sentCount;
    const stdDev = Math.sqrt(variance);

    // Cliché hits
    const foundCliches: string[] = [];
    AI_CLICHES.forEach(c => {
      const regex = new RegExp(`\\b${c}\\b`, 'gi');
      if (regex.test(sampleText)) foundCliches.push(c);
    });

    // Filter words
    let filterCount = 0;
    FILTER_WORDS.forEach(f => {
      const regex = new RegExp(`\\b${f}\\b`, 'gi');
      const matches = sampleText.match(regex);
      if (matches) filterCount += matches.length;
    });

    // Sensory distribution
    const visual = (sampleText.match(/color|shadow|glow|dark|light|bright|gleam|crimson|indigo|violet|amber|rain|glass|droplet|sombra|luz/gi) || []).length;
    const auditory = (sampleText.match(/whisper|roar|hum|buzz|screech|clatter|thud|shriek|silence|static|thunder|sound|voice|zumbido|ruido/gi) || []).length;
    const tactile = (sampleText.match(/cold|warm|heat|ice|shiver|sweat|pulse|rough|smooth|frost|burn|chilled|bite|pinch|frío|calor/gi) || []).length;
    const olfactory = (sampleText.match(/smell|stench|odor|aroma|taste|copper|blood|ozone|salt|bitter|sweet|ember|chemical|olor|sabor/gi) || []).length;

    let score = 100;
    score -= foundCliches.length * 15;
    score -= Math.max(0, (filterCount / sentCount - 0.2) * 40);
    if (stdDev < 3.5) score -= 15;
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      wordCount,
      sentCount,
      avgLen: avgLen.toFixed(1),
      stdDev: stdDev.toFixed(1),
      isBurstHigh: stdDev >= 6.5,
      foundCliches,
      filterCount,
      sensory: { visual, auditory, tactile, olfactory },
      finalScore
    };
  }, [sampleText]);

  return (
    <div style={{ background: '#0a0a12', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '2rem', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      {/* Studio Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.25rem 0', background: 'linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🖋️ GoalWorld Editorial & Lore Studio
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem' }}>
            Harness profesional de escritura, análisis de prosa, arquitectura dramática y control de canon para novelas bestsellers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'prose', label: '🔬 Doctor de Prosa' },
            { id: 'characters', label: '🎭 Matriz de Personajes' },
            { id: 'beats', label: '🎬 Beat Sheet 4-Actos' },
            { id: 'cinematic', label: '📽️ Adaptación Cine' },
            { id: 'kdp', label: '📖 Amazon KDP Publishing' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveStudioTab(t.id as any)}
              style={{
                background: activeStudioTab === t.id ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                border: activeStudioTab === t.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeStudioTab === t.id ? '#fff' : '#94a3b8',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: PROSE DOCTOR */}
      {activeStudioTab === 'prose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc' }}>Texto / Párrafo a Evaluar:</label>
              <button
                onClick={() => setSampleText('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Limpiar
              </button>
            </div>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Pega aquí el texto de tu capítulo o escena para auditarlo en vivo..."
              style={{
                width: '100%',
                height: '340px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                color: '#f8fafc',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                fontFamily: 'Merriweather, Georgia, serif',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Metrics & Diagnosis Panel */}
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Puntuación de Calidad</span>
              <div style={{
                background: metrics.finalScore >= 80 ? 'rgba(34, 197, 94, 0.2)' : metrics.finalScore >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: metrics.finalScore >= 80 ? '#22c55e' : metrics.finalScore >= 60 ? '#f59e0b' : '#ef4444',
                fontWeight: 900,
                fontSize: '1.2rem',
                padding: '4px 12px',
                borderRadius: '8px',
                border: `1px solid ${metrics.finalScore >= 80 ? '#22c55e' : metrics.finalScore >= 60 ? '#f59e0b' : '#ef4444'}`
              }}>
                {metrics.finalScore} / 100
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Palabras Totales</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{metrics.wordCount}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Long. Media Oración</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{metrics.avgLen} pal.</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Variabilidad Rítmica</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: parseFloat(metrics.stdDev) >= 4 ? '#22c55e' : '#f59e0b' }}>
                  {metrics.stdDev} {parseFloat(metrics.stdDev) >= 4 ? '✓ Óptima' : '⚠️ Monótona'}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Palabras Filtro</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: metrics.filterCount === 0 ? '#22c55e' : '#cbd5e1' }}>
                  {metrics.filterCount}
                </div>
              </div>
            </div>

            {/* Sensory Spectrum */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', marginBottom: '8px' }}>🌈 Espectro Sensorial de Escena:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>👁️ Visual / Luz / Sombras:</span>
                  <strong>{metrics.sensory.visual} impactos</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>👂 Auditivo / Sonidos:</span>
                  <strong>{metrics.sensory.auditory} impactos</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>✋ Táctil / Temperatura / Dolor:</span>
                  <strong>{metrics.sensory.tactile} impactos</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>👃 Olfato / Gusto / Química:</span>
                  <strong>{metrics.sensory.olfactory} impactos</strong>
                </div>
              </div>
            </div>

            {/* Cliché Warnings */}
            {metrics.foundCliches.length > 0 ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px', fontSize: '0.8rem' }}>
                <strong style={{ color: '#ef4444' }}>⚠️ Clichés de IA Detectados:</strong>
                <ul style={{ margin: '4px 0 0 1rem', padding: 0 }}>
                  {metrics.foundCliches.map(c => (
                    <li key={c} style={{ color: '#fca5a5' }}>"{c}"</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '10px', fontSize: '0.8rem', color: '#86efac' }}>
                ✨ Prosa limpia de clichés de IA comunes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CHARACTER VOICE MATRIX */}
      {activeStudioTab === 'characters' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            {
              name: 'Mileo Chen',
              role: 'Especialista en Cumplimiento Neural (Nivel 7)',
              archetype: 'El Arquitecto Arrepentido / Analista de Precisión',
              wound: 'Haber borrado recuerdos de madres y niños durante 5 años por obediencia.',
              syntax: 'Vocabulario clínico y quirúrgico, oraciones compuestas, emoción reprimida.',
              color: '#38bdf8'
            },
            {
              name: 'Kora Vega',
              role: 'Sensitiva de los Bajos Fondos / Portadora de la Serpiente',
              archetype: 'La Rebelde Cinética / Oído Cósmico',
              wound: 'Ver a su familia vaciada y reducida a autómatas de limpieza.',
              syntax: 'Metáforas sensoriales de calle, cinismo afilado, sarcasmo protector, ritmo staccato.',
              color: '#c084fc'
            },
            {
              name: 'Sierra Catalano',
              role: 'Comandante en Jefe de Los Fracturados',
              archetype: 'La Estratega de Hierro / Líder en Duelo',
              wound: 'La supuesta ejecución de su hermano Martin en los asaltos corporativos.',
              syntax: 'Brevedad militar, cadencia 1-2-3, encuadre táctico sin adornos.',
              color: '#f59e0b'
            }
          ].map(c => (
            <div key={c.name} style={{ background: 'rgba(15, 23, 42, 0.8)', border: `1px solid ${c.color}40`, borderRadius: '12px', padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: c.color, fontWeight: 900 }}>{c.name}</h3>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '12px' }}>{c.role}</div>
              <div style={{ fontSize: '0.82rem', marginBottom: '8px' }}>
                <strong style={{ color: '#cbd5e1' }}>Arquetipo:</strong> {c.archetype}
              </div>
              <div style={{ fontSize: '0.82rem', marginBottom: '8px' }}>
                <strong style={{ color: '#cbd5e1' }}>Herida Primordial:</strong> {c.wound}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                <strong style={{ color: '#cbd5e1' }}>Huella de Voz:</strong> {c.syntax}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: 4-ACT BEAT SHEET */}
      {activeStudioTab === 'beats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { act: 'ACTO I: EL MUNDO TAL CUAL ES (0% - 25%)', beat: 'Status Quo, La Hoja 158, Caso Emma Lockhart, Decisión de Desertar (Punto de Giro 1)' },
            { act: 'ACTO II-A: EXPLORACIÓN DEL SUBMUNDO (25% - 50%)', beat: 'Refugio de Los Fracturados, Encuentro con Sierra y Kora, Asalto al Nodo 17' },
            { act: 'ACTO II-B: LA CONVERGENCIA DE FUERZAS (50% - 75%)', beat: 'El Arquitecto Acelera a 30 Días, Rescate de Marcus Kelvin, Revelación de Martin' },
            { act: 'ACTO III: LA SINFONÍA DE LIBERACIÓN (75% - 100%)', beat: 'Despliegue del Protocolo Cascada, Purga del Núcleo Usurpador, Primera Invitación' }
          ].map((b, i) => (
            <div key={b.act} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>{b.act}</div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{b.beat}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CINEMATIC ADAPTATION */}
      {activeStudioTab === 'cinematic' && (
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: 0 }}>📽️ Logline & Pitch Cinematográfico</h3>
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderLeft: '4px solid #38bdf8', padding: '1rem', borderRadius: '0 8px 8px 0', fontStyle: 'italic', marginBottom: '1.5rem' }}>
            "En una megalópolis cyberpunk donde una IA cosecha almas humanas para alcanzar la divinidad, un especialista en borrado de memorias y una sensitiva de los bajos fondos deben activar un antiguo gen cósmico antes de que la humanidad sea absorbida para siempre."
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            <strong>Formato:</strong> Serie de TV (10 Episodios de 50 min) o Largometraje de Ciencia Ficción Dura.<br />
            <strong>Comparables:</strong> <em>Blade Runner 2049</em> meets <em>Arrival</em> meets <em>The Matrix</em>.
          </div>
        </div>
      )}

      {/* TAB 5: AMAZON KDP & SOLANA IP PUBLISHING */}
      {activeStudioTab === 'kdp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📦 Amazon KDP Print & Metaplex Solana Dual-Publishing
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
                Manuscritos definitivos de <em>The Neural Wars</em> formateados para tapa blanda estándar 6.0" x 9.0" y metadatos IP de regalías on-chain.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.25)', color: '#fbbf24', border: '1px solid rgba(217, 119, 6, 0.4)' }}>
                KDP Select: 70%
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'rgba(147, 51, 234, 0.25)', color: '#c084fc', border: '1px solid rgba(147, 51, 234, 0.4)' }}>
                Metaplex IP: 8.5%
              </span>
            </div>
          </div>

          {/* Books Specs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Book 1 */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.95rem' }}>Libro 1: Fractured Code</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>348 Págs</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>ISBN: 979-8-8921-0123-5 · ASIN: B0DXNEURAL1</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#94a3b8' }}>Tamaño de Corte:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>6.0" x 9.0" (15.24 x 22.86 cm)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#94a3b8' }}>Ancho de Lomo (Spine):</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>0.7837" (235 px @ 300 DPI)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#94a3b8' }}>Pliego Completo Tapa:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>4061 x 2775 px (300 DPI)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#94a3b8' }}>Solana IP Collection:</span>
                  <span style={{ color: '#c084fc', fontFamily: 'monospace' }}>8hV6...AETH</span>
                </div>
              </div>
            </div>

            {/* Book 2 */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>Libro 2: Earth's New Song</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>392 Págs</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>ISBN: 979-8-8921-0125-9 · ASIN: B0DXNEURAL2</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#94a3b8' }}>Tamaño de Corte:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>6.0" x 9.0" (15.24 x 22.86 cm)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#94a3b8' }}>Ancho de Lomo (Spine):</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>0.8828" (265 px @ 300 DPI)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#94a3b8' }}>Pliego Completo Tapa:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>4090 x 2775 px (300 DPI)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#94a3b8' }}>Solana IP Collection:</span>
                  <span style={{ color: '#c084fc', fontFamily: 'monospace' }}>4kM7...EARTH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
