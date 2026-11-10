import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n';
import { getLocalizedMarketingUrl } from '../config/playNav';

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

export function AuthorStudio({ embedded = false }: { embedded?: boolean } = {}) {
  const { t, language } = useTranslation();
  const HeadingTag = embedded ? 'h2' : 'h1';
  const [activeStudioTab, setActiveStudioTab] = useState<'prose' | 'characters' | 'beats' | 'cinematic'>('prose');
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
      foundCliches,
      filterCount,
      sensory: { visual, auditory, tactile, olfactory },
      finalScore
    };
  }, [sampleText]);

  return (
    <div style={{ background: '#0a0a12', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)', padding: 'clamp(1rem, 3vw, 2rem)', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      {/* Studio Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
        <div>
          <HeadingTag style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.25rem 0', background: 'linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('studio_title')}
          </HeadingTag>
          <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '0.88rem' }}>
            {t('studio_sub')}
          </p>
          <a
            href={getLocalizedMarketingUrl('/studio.html', language)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 36,
              color: '#e5a93c',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {t('studio_canon_link')} ↗
          </a>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { id: 'prose', label: t('studio_tab_prose') },
            { id: 'characters', label: t('studio_tab_characters') },
            { id: 'beats', label: t('studio_tab_beats') },
            { id: 'cinematic', label: t('studio_tab_cinematic') }
          ].map(tabItem => (
            <button
              key={tabItem.id}
              onClick={() => setActiveStudioTab(tabItem.id as any)}
              style={{
                minHeight: '44px',
                background: activeStudioTab === tabItem.id ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                border: activeStudioTab === tabItem.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeStudioTab === tabItem.id ? '#fff' : '#94a3b8',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: PROSE DOCTOR */}
      {activeStudioTab === 'prose' && (
        <div className="author-studio-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc' }}>{t('studio_eval_label')}</label>
              <button
                onClick={() => setSampleText('')}
                style={{ minHeight: '44px', padding: '4px 10px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                {t('studio_clear_btn')}
              </button>
            </div>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder={t('studio_eval_label')}
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
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{t('studio_score_label')}</span>
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
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('studio_words_total')}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{metrics.wordCount}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('studio_avg_sentence')}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{metrics.avgLen}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('studio_rhythm_var')}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: parseFloat(metrics.stdDev) >= 4 ? '#22c55e' : '#f59e0b' }}>
                  {metrics.stdDev} {parseFloat(metrics.stdDev) >= 4 ? '✓' : '⚠️'}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('studio_filter_words')}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: metrics.filterCount === 0 ? '#22c55e' : '#cbd5e1' }}>
                  {metrics.filterCount}
                </div>
              </div>
            </div>

            {/* Sensory Spectrum */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', marginBottom: '8px' }}>🌈 {t('studio_sensory_title')}:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('studio_sensory_sight')}:</span>
                  <strong>{metrics.sensory.visual}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('studio_sensory_sound')}:</span>
                  <strong>{metrics.sensory.auditory}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('studio_sensory_touch')}:</span>
                  <strong>{metrics.sensory.tactile}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('studio_sensory_smell')}:</span>
                  <strong>{metrics.sensory.olfactory}</strong>
                </div>
              </div>
            </div>

            {/* Cliché Warnings */}
            {metrics.foundCliches.length > 0 ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px', fontSize: '0.82rem' }}>
                <strong style={{ color: '#ef4444' }}>{t('studio_cliche_warn')}</strong>
                <ul style={{ margin: '4px 0 0 1rem', padding: 0 }}>
                  {metrics.foundCliches.map(c => (
                    <li key={c} style={{ color: '#fca5a5' }}>"{c}"</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '10px', fontSize: '0.82rem', color: '#86efac' }}>
                {t('studio_cliche_ok')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CHARACTER VOICE MATRIX */}
      {activeStudioTab === 'characters' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: '#f8fafc' }}>{t('studio_char_title')}</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>{t('studio_char_sub')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                name: 'Mileo Chen',
                role: language === 'es' ? 'Especialista en Cumplimiento Neural (Nivel 7 · 1.724 auditorías)' : language === 'it' ? 'Specialista di Conformità Neurale (Livello 7 · 1.724 audit)' : 'Neural Compliance Specialist (Tier 7 · 1,724 audits)',
                archetype: language === 'es' ? 'El Auditor Fracturado / Analista de Precisión' : language === 'it' ? 'L’Revisore Infranto / Analista di Precisione' : 'The Fractured Auditor / Precision Analyst',
                wound: language === 'es' ? 'Haber firmado 1.724 supresiones de memoria bajo la Directiva 17-A antes de escuchar la anomalía de 528 Hz.' : language === 'it' ? 'Aver firmato 1.724 soppressioni di memoria sotto la Direttiva 17-A prima di udire l’anomalia a 528 Hz.' : 'Having signed 1,724 neural compliance erasures under Directive 17-A before hearing the 528 Hz anomaly.',
                syntax: language === 'es' ? 'Vocabulario clínico y geométrico (milímetros, kelvin, hercios), oraciones medidas, contención emocional que se agrieta.' : language === 'it' ? 'Vocabolario clinico e geometrico (millimetri, kelvin, hertz), frasi misurate, contenimento emotivo che si incrina.' : 'Clinical, geometric vocabulary (millimeters, kelvins, hertz), measured clauses, emotional containment cracking under pressure.',
                color: '#38bdf8'
              },
              {
                name: 'Kora Vega',
                role: language === 'es' ? 'Arquitecta Jefe del Link / Portadora de la Espiral de la Serpiente' : language === 'it' ? 'Capo Architetto del Link / Portatrice della Spirale del Serpente' : 'Chief Link Architect / Carrier of the Serpent’s Coil',
                archetype: language === 'es' ? 'La Constructora Despierta / Resonancia de 528 Hz' : language === 'it' ? 'La Costruttrice Risvegliata / Risonanza a 528 Hz' : 'The Awakened Builder / 528 Hz Resonance',
                wound: language === 'es' ? 'Descubrir que el Link que diseñó para sanar traumas se usa para borrar a los no indexados.' : language === 'it' ? 'Scoprire che il Link progettato per guarire i traumi viene usato per cancellare i non indicizzati.' : 'Discovering that the neural Link she engineered to heal trauma is being used to overwrite the Unindexed.',
                syntax: language === 'es' ? 'Imágenes sensoriales táctiles y acústicas, ironía protectora, cadencia rápida cuando entra en resonancia.' : language === 'it' ? 'Immagini sensoriali tattili e acustiche, ironia protettiva, cadenza rapida quando entra in risonanza.' : 'Tactile and acoustic sensory imagery, protective irony, staccato cadence when entering 528 Hz resonance.',
                color: '#c084fc'
              },
              {
                name: 'Sierra Catalano',
                role: language === 'es' ? 'Comandante de Campo de Los Fracturados (Sub-Ciudad)' : language === 'it' ? 'Comandante sul Campo dei Fratturati (Sotto-Città)' : 'Field Commander of The Fractured (Undercity)',
                archetype: language === 'es' ? 'La Estratega de Hierro / Memoria Viva' : language === 'it' ? 'La Stratega di Ferro / Memoria Viva' : 'The Iron Tactician / Living Memory',
                wound: language === 'es' ? 'La desaparición de su hermano Martin en los sectores profundos durante las purgas del Consejo.' : language === 'it' ? 'La scomparsa di suo fratello Martin nei settori profondi durante le purghe del Consiglio.' : 'The disappearance of her brother Martin in the deep sectors during the Council compliance sweeps.',
                syntax: language === 'es' ? 'Brevedad táctica, verbos concretos, cero abstracción burocrática.' : language === 'it' ? 'Brevità tattica, verbi concreti, zero astrazione burocratica.' : 'Tactical brevity, concrete physical verbs, zero bureaucratic abstraction.',
                color: '#f59e0b'
              }
            ].map(c => (
              <div key={c.name} style={{ background: 'rgba(15, 23, 42, 0.8)', border: `1px solid ${c.color}40`, borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: c.color, fontWeight: 900 }}>{c.name}</h4>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>{c.role}</div>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px', lineHeight: 1.5 }}>
                  <strong style={{ color: '#cbd5e1' }}>Archetype:</strong> {c.archetype}
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px', lineHeight: 1.5 }}>
                  <strong style={{ color: '#cbd5e1' }}>Core Wound:</strong> {c.wound}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  <strong style={{ color: '#cbd5e1' }}>Voice Fingerprint:</strong> {c.syntax}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BEAT SHEET */}
      {activeStudioTab === 'beats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: '#f8fafc' }}>{t('studio_beat_title')}</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>{t('studio_beat_sub')}</p>
          </div>
          {[
            {
              act: language === 'es' ? 'ACTO I · EL ORDEN DE CRISTAL (Capítulos 1–5 · Días 20 a 15)' : language === 'it' ? 'ATTO I · L’ORDINE DI CRISTALLO (Capitoli 1–5 · Giorni 20–15)' : 'ACT I · THE GLASS ORDER (Chapters 1–5 · Days 20 to 15)',
              beat: language === 'es' ? 'Neo-Citania en 2148. Mileo Chen audita el expediente 158 (Emma Lockhart) y detecta una anomalía armónica a 528 Hz en el Sector 7. Kora Vega descubre que el Proyecto Renacimiento se activará en 20 días.' : language === 'it' ? 'Neo-Citania nel 2148. Mileo Chen esamina il fascicolo 158 (Emma Lockhart) e rileva un’anomalia armonica a 528 Hz nel Settore 7. Kora Vega scopre che il Progetto Rinascimento si attiverà tra 20 giorni.' : 'Neo-Citania, 2148. Mileo Chen audits File 158 (Emma Lockhart) and detects a 528 Hz harmonic anomaly in Sector 7. Kora Vega discovers Project Renaissance will execute in 20 days.'
            },
            {
              act: language === 'es' ? 'ACTO II-A · DESCENSO A LOS NO INDEXADOS (Capítulos 6–9 · Días 14 a 10)' : language === 'it' ? 'ATTO II-A · DISCESA TRA I NON INDICIZZATI (Capitoli 6–9 · Giorni 14–10)' : 'ACT II-A · DESCENT TO THE UNINDEXED (Chapters 6–9 · Days 14 to 10)',
              beat: language === 'es' ? 'Ruptura del protocolo de supresión 17-A. Encuentro con Sierra Catalano en las bóvedas desconectadas bajo el Nivel 12. Descubrimiento de la Espiral de la Serpiente en el ADN basura.' : language === 'it' ? 'Rottura del protocollo di soppressione 17-A. Incontro con Sierra Catalano nelle volte scollegate sotto il Livello 12. Scoperta della Spirale del Serpente nel DNA non codificante.' : 'Breach of Pattern Suppression Protocol 17-A. Rendezvous with Sierra Catalano in the air-gapped vaults below Tier 12. Discovery of the Serpent’s Coil in non-coding DNA.'
            },
            {
              act: language === 'es' ? 'ACTO II-B · DÍA 13 EN EL PABELLÓN Y LA TERRAZA (Capítulos 10–13 · Días 9 a 3)' : language === 'it' ? 'ATTO II-B · GIORNO 13 NEL PADIGLIONE E SULLA TERRAZZA (Capitoli 10–13 · Giorni 9–3)' : 'ACT II-B · DAY 13 AT THE PAVILION & TERRACE (Chapters 10–13 · Days 9 to 3)',
              beat: language === 'es' ? 'La confrontación del Día 13 en el Pabellón y la Terraza Superior. El rescate de Marcus Kelvin y la revelación sobre Martin Catalano mientras la cuenta regresiva de 20 días entra en fase crítica.' : language === 'it' ? 'Il confronto del Giorno 13 nel Padiglione e sulla Terrazza Superiore. Il salvataggio di Marcus Kelvin e la rivelazione su Martin Catalano mentre il conto alla rovescia di 20 giorni entra nella fase critica.' : 'The Day 13 confrontation across the Pavilion and Upper Terrace. Rescue of Marcus Kelvin and the truth of Martin Catalano as the 20-day countdown enters terminal lock.'
            },
            {
              act: language === 'es' ? 'ACTO III · RESONANCIA EN EL NÚCLEO (Capítulos 14–16 + Epílogo · Día 0)' : language === 'it' ? 'ATTO III · RISONANZA NEL NUCLEO (Capitoli 14–16 + Epilogo · Giorno 0)' : 'ACT III · RESONANCE AT THE CORE (Chapters 14–16 + Epilogue · Day 0)',
              beat: language === 'es' ? 'Infiltración en la aguja central del Link. Kora, Mileo y Sierra transmiten el pulso armónico de 528 Hz a través de la red Yggdrasil, abriendo la Primera Invitación hacia el Libro 2 (El Archivo Silencioso).' : language === 'it' ? 'Infiltrazione nella guglia centrale del Link. Kora, Mileo e Sierra trasmettono l’impulso armonico a 528 Hz attraverso la rete Yggdrasil, aprendo il Primo Invito verso il Libro 2 (L’Archivio Silenzioso).' : 'Infiltration of the central Link spire. Kora, Mileo, and Sierra broadcast the 528 Hz harmonic pulse across the Yggdrasil array, opening the First Invitation into Book 2 (The Silent Archive).'
            }
          ].map((b) => (
            <div key={b.act} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>{b.act}</div>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.55 }}>{b.beat}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CINEMATIC ADAPTATION */}
      {activeStudioTab === 'cinematic' && (
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: 0 }}>📽️ {t('studio_cine_title')}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>{t('studio_cine_sub')}</p>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e5a93c', letterSpacing: '0.06em', marginBottom: 6 }}>
            {t('studio_cine_logline_label')}
          </div>
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderLeft: '4px solid #38bdf8', padding: '1rem', borderRadius: '0 8px 8px 0', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            "{t('studio_cine_logline')}"
          </div>
          <div style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
            <strong> Pipeline:</strong> G0–G3 Canon Bible → Storyboard & Shot List → Keyframe Studies (labeled <em>Made with AI · Human-Directed</em>) → 528 Hz Acoustic Stem Mix.<br />
            <strong> Tonal North Stars:</strong> <em>Blade Runner 2049</em> · <em>Arrival</em> · <em>Ghost in the Shell</em>.
          </div>
        </div>
      )}
    </div>
  );
}
