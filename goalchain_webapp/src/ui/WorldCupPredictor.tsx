import React, { useState, useEffect } from 'react';

interface TeamStats {
  name: string;
  emoji: string;
  overall: number;
  group: string;
  winProb: number;
}

const WC_TEAMS: TeamStats[] = [
  { name: "Argentina", emoji: "🇦🇷", overall: 91, group: "A", winProb: 18.5 },
  { name: "Francia", emoji: "🇫🇷", overall: 90, group: "B", winProb: 15.2 },
  { name: "Brasil", emoji: "🇧🇷", overall: 89, group: "C", winProb: 13.9 },
  { name: "España", emoji: "🇪🇸", overall: 88, group: "D", winProb: 11.4 },
  { name: "Inglaterra", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 87, group: "B", winProb: 9.8 },
  { name: "Alemania", emoji: "🇩🇪", overall: 86, group: "A", winProb: 7.5 },
  { name: "Portugal", emoji: "🇵🇹", overall: 86, group: "D", winProb: 6.2 },
  { name: "Uruguay", emoji: "🇺🇾", overall: 84, group: "C", winProb: 4.8 },
  { name: "Países Bajos", emoji: "🇳🇱", overall: 83, group: "A", winProb: 3.5 },
  { name: "Italia", emoji: "🇮🇹", overall: 82, group: "B", winProb: 2.1 },
  { name: "EE.UU.", emoji: "🇺🇸", overall: 81, group: "C", winProb: 1.8 },
  { name: "México", emoji: "🇲🇽", overall: 80, group: "D", winProb: 1.5 },
  { name: "Marruecos", emoji: "🇲🇦", overall: 82, group: "A", winProb: 1.2 },
  { name: "Japón", emoji: "🇯🇵", overall: 80, group: "C", winProb: 1.0 },
  { name: "Croacia", emoji: "🇭🇷", overall: 81, group: "D", winProb: 0.8 },
  { name: "Canadá", emoji: "🇨🇦", overall: 79, group: "B", winProb: 0.5 },
];

export function WorldCupPredictor() {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'h2h' | 'standings' | 'pickem'>('simulator');
  
  // H2H Predictor states
  const [teamA, setTeamA] = useState<string>('Argentina');
  const [teamB, setTeamB] = useState<string>('Francia');
  const [h2hResult, setH2hResult] = useState<{ winA: number; draw: number; winB: number } | null>(null);

  // Pick'em State
  const [championPick, setChampionPick] = useState<string>('');
  const [darkHorsePick, setDarkHorsePick] = useState<string>('');
  const [topScorerPick, setTopScorerPick] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Knockout Simulator State
  const [r16, setR16] = useState<Record<string, string>>({
    m1_w: '', m2_w: '', m3_w: '', m4_w: '', m5_w: '', m6_w: '', m7_w: '', m8_w: ''
  });
  const [qf, setQf] = useState<Record<string, string>>({
    q1_w: '', q2_w: '', q3_w: '', q4_w: ''
  });
  const [sf, setSf] = useState<Record<string, string>>({
    s1_w: '', s2_w: ''
  });
  const [champion, setChampion] = useState<string>('');

  useEffect(() => {
    // Load saved predictions on mount
    const savedPickem = localStorage.getItem('goalchain_pickem');
    if (savedPickem) {
      try {
        const parsed = JSON.parse(savedPickem);
        if (parsed.champion) setChampionPick(parsed.champion);
        if (parsed.darkHorse) setDarkHorsePick(parsed.darkHorse);
        if (parsed.topScorer) setTopScorerPick(parsed.topScorer);
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Calculate H2H Predictions
  const handleCalculateH2H = () => {
    const tA = WC_TEAMS.find(t => t.name === teamA);
    const tB = WC_TEAMS.find(t => t.name === teamB);
    if (!tA || !tB) return;

    const diff = tA.overall - tB.overall;
    const baseWinA = 38 + (diff * 4.5);
    const baseWinB = 38 - (diff * 4.5);
    const baseDraw = 24;

    const total = baseWinA + baseWinB + baseDraw;
    
    setH2hResult({
      winA: Math.round((baseWinA / total) * 100),
      draw: Math.round((baseDraw / total) * 100),
      winB: Math.round((baseWinB / total) * 100)
    });
  };

  useEffect(() => {
    handleCalculateH2H();
  }, [teamA, teamB]);

  // Save Pick'Em
  const handleSavePickem = () => {
    const data = {
      champion: championPick,
      darkHorse: darkHorsePick,
      topScorer: topScorerPick,
      timestamp: Date.now()
    };
    localStorage.setItem('goalchain_pickem', JSON.stringify(data));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getEmoji = (name: string) => {
    return WC_TEAMS.find(t => t.name === name)?.emoji || '🏳️';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
      
      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', overflowX: 'auto' }}>
        {(['simulator', 'h2h', 'standings', 'pickem'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            style={{
              background: activeSubTab === tab ? 'rgba(20,241,149,0.1)' : 'transparent',
              border: `1px solid ${activeSubTab === tab ? 'var(--primary-neon)' : 'transparent'}`,
              color: activeSubTab === tab ? 'var(--primary-neon)' : '#94a3b8',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'simulator' && '🌳 Simulador Eliminatorias'}
            {tab === 'h2h' && '📊 Comparador H2H'}
            {tab === 'standings' && '🏆 Fase de Grupos'}
            {tab === 'pickem' && '📝 Mis Predicciones'}
          </button>
        ))}
      </div>

      {/* 1. SIMULATOR VIEW */}
      {activeSubTab === 'simulator' && (
        <div className="portal-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800 }}>🌳 Simulador de Fases Eliminatorias</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Haz clic en un equipo para avanzar al ganador de cada ronda hasta coronar al Campeón.</span>
          </div>

          {/* Interactive Bracket Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.03)',
            padding: '1.5rem',
            overflowX: 'auto'
          }}>
            {/* Round of 16 Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'space-around' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>1/8 Final</span>
              
              {/* Match 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}>
                <button onClick={() => setR16(p => ({ ...p, m1_w: 'Argentina' }))} style={{ border: 'none', background: r16.m1_w === 'Argentina' ? 'rgba(20,241,149,0.15)' : 'transparent', color: r16.m1_w === 'Argentina' ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: r16.m1_w === 'Argentina' ? 'bold' : 'normal' }}>
                  <span>🇦🇷</span> Argentina
                </button>
                <button onClick={() => setR16(p => ({ ...p, m1_w: 'EE.UU.' }))} style={{ border: 'none', background: r16.m1_w === 'EE.UU.' ? 'rgba(20,241,149,0.15)' : 'transparent', color: r16.m1_w === 'EE.UU.' ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: r16.m1_w === 'EE.UU.' ? 'bold' : 'normal' }}>
                  <span>🇺🇸</span> EE.UU.
                </button>
              </div>

              {/* Match 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}>
                <button onClick={() => setR16(p => ({ ...p, m2_w: 'España' }))} style={{ border: 'none', background: r16.m2_w === 'España' ? 'rgba(20,241,149,0.15)' : 'transparent', color: r16.m2_w === 'España' ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: r16.m2_w === 'España' ? 'bold' : 'normal' }}>
                  <span>🇪🇸</span> España
                </button>
                <button onClick={() => setR16(p => ({ ...p, m2_w: 'Croacia' }))} style={{ border: 'none', background: r16.m2_w === 'Croacia' ? 'rgba(20,241,149,0.15)' : 'transparent', color: r16.m2_w === 'Croacia' ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: r16.m2_w === 'Croacia' ? 'bold' : 'normal' }}>
                  <span>🇭🇷</span> Croacia
                </button>
              </div>

              {/* Match 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}>
                <button onClick={() => setR16(p => ({ ...p, m3_w: 'Francia' }))} style={{ border: 'none', background: r16.m3_w === 'Francia' ? 'rgba(20,241,149,0.15)' : 'transparent', color: r16.m3_w === 'Francia' ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: r16.m3_w === 'Francia' ? 'bold' : 'normal' }}>
                  <span>🇫🇷</span> Francia
                </button>
                <button onClick={() => setR16(p => ({ ...p, m3_w: 'Alemania' }))} style={{ border: 'none', background: r16.m3_w === 'Alemania' ? 'rgba(20,241,149,0.15)' : 'transparent', color: r16.m3_w === 'Alemania' ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: r16.m3_w === 'Alemania' ? 'bold' : 'normal' }}>
                  <span>🇩🇪</span> Alemania
                </button>
              </div>

              {/* Match 4 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}>
                <button onClick={() => setR16(p => ({ ...p, m4_w: 'Brasil' }))} style={{ border: 'none', background: r16.m4_w === 'Brasil' ? 'rgba(20,241,149,0.15)' : 'transparent', color: r16.m4_w === 'Brasil' ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: r16.m4_w === 'Brasil' ? 'bold' : 'normal' }}>
                  <span>🇧🇷</span> Brasil
                </button>
                <button onClick={() => setR16(p => ({ ...p, m4_w: 'Países Bajos' }))} style={{ border: 'none', background: r16.m4_w === 'Países Bajos' ? 'rgba(20,241,149,0.15)' : 'transparent', color: r16.m4_w === 'Países Bajos' ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: r16.m4_w === 'Países Bajos' ? 'bold' : 'normal' }}>
                  <span>🇳🇱</span> Países Bajos
                </button>
              </div>
            </div>

            {/* Quarterfinals Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', justifyContent: 'space-around' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>1/4 Final</span>
              
              {/* QF Match 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px', minHeight: '68px', justifyContent: 'center' }}>
                {r16.m1_w ? (
                  <button onClick={() => setQf(p => ({ ...p, q1_w: r16.m1_w }))} style={{ border: 'none', background: qf.q1_w === r16.m1_w ? 'rgba(20,241,149,0.15)' : 'transparent', color: qf.q1_w === r16.m1_w ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: qf.q1_w === r16.m1_w ? 'bold' : 'normal' }}>
                    <span>{getEmoji(r16.m1_w)}</span> {r16.m1_w}
                  </button>
                ) : <span style={{ fontSize: '0.7rem', color: '#475569', padding: '6px' }}>Esperando 1/8...</span>}
                
                {r16.m2_w ? (
                  <button onClick={() => setQf(p => ({ ...p, q1_w: r16.m2_w }))} style={{ border: 'none', background: qf.q1_w === r16.m2_w ? 'rgba(20,241,149,0.15)' : 'transparent', color: qf.q1_w === r16.m2_w ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: qf.q1_w === r16.m2_w ? 'bold' : 'normal' }}>
                    <span>{getEmoji(r16.m2_w)}</span> {r16.m2_w}
                  </button>
                ) : <span style={{ fontSize: '0.7rem', color: '#475569', padding: '6px' }}>Esperando 1/8...</span>}
              </div>

              {/* QF Match 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px', minHeight: '68px', justifyContent: 'center' }}>
                {r16.m3_w ? (
                  <button onClick={() => setQf(p => ({ ...p, q2_w: r16.m3_w }))} style={{ border: 'none', background: qf.q2_w === r16.m3_w ? 'rgba(20,241,149,0.15)' : 'transparent', color: qf.q2_w === r16.m3_w ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: qf.q2_w === r16.m3_w ? 'bold' : 'normal' }}>
                    <span>{getEmoji(r16.m3_w)}</span> {r16.m3_w}
                  </button>
                ) : <span style={{ fontSize: '0.7rem', color: '#475569', padding: '6px' }}>Esperando 1/8...</span>}
                
                {r16.m4_w ? (
                  <button onClick={() => setQf(p => ({ ...p, q2_w: r16.m4_w }))} style={{ border: 'none', background: qf.q2_w === r16.m4_w ? 'rgba(20,241,149,0.15)' : 'transparent', color: qf.q2_w === r16.m4_w ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: qf.q2_w === r16.m4_w ? 'bold' : 'normal' }}>
                    <span>{getEmoji(r16.m4_w)}</span> {r16.m4_w}
                  </button>
                ) : <span style={{ fontSize: '0.7rem', color: '#475569', padding: '6px' }}>Esperando 1/8...</span>}
              </div>
            </div>

            {/* Semifinals Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', justifyContent: 'space-around' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Semifinal</span>
              
              {/* SF Match 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px', minHeight: '68px', justifyContent: 'center' }}>
                {qf.q1_w ? (
                  <button onClick={() => setSf(p => ({ ...p, s1_w: qf.q1_w }))} style={{ border: 'none', background: sf.s1_w === qf.q1_w ? 'rgba(20,241,149,0.15)' : 'transparent', color: sf.s1_w === qf.q1_w ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: sf.s1_w === qf.q1_w ? 'bold' : 'normal' }}>
                    <span>{getEmoji(qf.q1_w)}</span> {qf.q1_w}
                  </button>
                ) : <span style={{ fontSize: '0.7rem', color: '#475569', padding: '6px' }}>Esperando QF...</span>}
                
                {qf.q2_w ? (
                  <button onClick={() => setSf(p => ({ ...p, s1_w: qf.q2_w }))} style={{ border: 'none', background: sf.s1_w === qf.q2_w ? 'rgba(20,241,149,0.15)' : 'transparent', color: sf.s1_w === qf.q2_w ? 'var(--primary-neon)' : '#fff', cursor: 'pointer', display: 'flex', gap: '8px', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', fontWeight: sf.s1_w === qf.q2_w ? 'bold' : 'normal' }}>
                    <span>{getEmoji(qf.q2_w)}</span> {qf.q2_w}
                  </button>
                ) : <span style={{ fontSize: '0.7rem', color: '#475569', padding: '6px' }}>Esperando QF...</span>}
              </div>
            </div>

            {/* Champion Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Final & Campeón</span>
              
              {sf.s1_w ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                  <button
                    onClick={() => setChampion(sf.s1_w)}
                    style={{
                      border: '1px solid var(--primary-neon)',
                      background: 'rgba(20,241,149,0.08)',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      color: 'var(--primary-neon)',
                      fontWeight: 'bold',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      width: '100%',
                      boxShadow: champion === sf.s1_w ? '0 0 20px rgba(0, 255, 127, 0.25)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🏆</span>
                    <span>{sf.s1_w}</span>
                  </button>
                  {champion === sf.s1_w && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary-neon)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      👑 Campeón Elegido
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ border: '1px dashed rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', color: '#475569', fontSize: '0.75rem', textAlign: 'center' }}>
                  Elige los semifinalistas
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 2. H2H COMPARISON VIEW */}
      {activeSubTab === 'h2h' && (
        <div className="portal-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            
            {/* Predictor Widget */}
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '0.92rem', fontWeight: 800 }}>⚔️ Comparador Head-to-Head</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Equipo A</label>
                  <select 
                    value={teamA} 
                    onChange={(e) => setTeamA(e.target.value)}
                    style={{ width: '100%', background: '#070f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '0.75rem', outline: 'none' }}
                  >
                    {WC_TEAMS.map(t => (
                      <option key={t.name} value={t.name} disabled={t.name === teamB}>{t.emoji} {t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Equipo B</label>
                  <select 
                    value={teamB} 
                    onChange={(e) => setTeamB(e.target.value)}
                    style={{ width: '100%', background: '#070f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '0.75rem', outline: 'none' }}
                  >
                    {WC_TEAMS.map(t => (
                      <option key={t.name} value={t.name} disabled={t.name === teamA}>{t.emoji} {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {h2hResult && (
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px', textAlign: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>PANDAS / DRIFT SIMULATOR WIN RATE</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                    <span>{teamA} {getEmoji(teamA)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>vs</span>
                    <span>{getEmoji(teamB)} {teamB}</span>
                  </div>

                  {/* Stacked Progress Bar */}
                  <div className="stacked-bar-container" style={{ height: '14px', borderRadius: '7px', marginBottom: '10px', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: `${h2hResult.winA}%`, backgroundColor: 'var(--primary-neon)', height: '100%' }} />
                    <div style={{ width: `${h2hResult.draw}%`, backgroundColor: '#ffcc00', height: '100%' }} />
                    <div style={{ width: `${h2hResult.winB}%`, backgroundColor: '#f97316', height: '100%' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                    <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{teamA}: {h2hResult.winA}%</span>
                    <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>EMPATE: {h2hResult.draw}%</span>
                    <span style={{ color: '#f97316', fontWeight: 'bold' }}>{teamB}: {h2hResult.winB}%</span>
                  </div>
                </div>
              )}

              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.68rem', color: '#94a3b8', lineHeight: '1.4' }}>
                ℹ️ <strong>Hechos Históricos & Insights:</strong> Historial parejo. Francia llega con mayor poder de definición (OVR {WC_TEAMS.find(t => t.name === 'Francia')?.overall}) pero Argentina destaca en creación y química de vestuario. Lesión reportada: Ninguna grave.
              </div>
            </div>

            {/* Champion Probabilities List */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '0.92rem', fontWeight: 800 }}>🏆 Top 10 Probabilidades de Campeón</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {WC_TEAMS.slice(0, 10).map((t, idx) => (
                  <div key={t.name} style={{ fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: '2px' }}>
                      <span>{idx + 1}. {t.emoji} {t.name}</span>
                      <span style={{ fontWeight: 'bold', color: idx === 0 ? 'var(--primary-neon)' : '#cbd5e1' }}>{t.winProb}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${t.winProb * 4}%`, height: '100%', background: idx === 0 ? 'linear-gradient(90deg, var(--primary-neon), #059669)' : 'rgba(255,255,255,0.3)', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. GROUP STANDINGS VIEW */}
      {activeSubTab === 'standings' && (
        <div className="portal-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          {/* Group A */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-neon)', fontSize: '0.85rem', fontWeight: 800 }}>GRUPO A</h4>
            <table style={{ width: '100%', fontSize: '0.72rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0' }}>Selección</th>
                  <th style={{ padding: '6px 4px' }}>PJ</th>
                  <th style={{ padding: '6px 4px' }}>GD</th>
                  <th style={{ padding: '6px 4px', textAlign: 'right' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#fff' }}>🇦🇷 Argentina</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>3</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>+5</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-neon)' }}>9</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '6px 0' }}>🇩🇪 Alemania</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>3</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>+2</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>6</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '6px 0' }}>🇲🇦 Marruecos</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>3</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>-2</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>3</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0' }}>🇨🇦 Canadá</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>3</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>-5</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>0</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Group B */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-neon)', fontSize: '0.85rem', fontWeight: 800 }}>GRUPO B</h4>
            <table style={{ width: '100%', fontSize: '0.72rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0' }}>Selección</th>
                  <th style={{ padding: '6px 4px' }}>PJ</th>
                  <th style={{ padding: '6px 4px' }}>GD</th>
                  <th style={{ padding: '6px 4px', textAlign: 'right' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#fff' }}>🇫🇷 Francia</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>3</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>+4</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-neon)' }}>7</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '6px 0' }}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>3</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>+3</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>7</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '6px 0' }}>🇮🇹 Italia</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>3</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>-1</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>3</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0' }}>🏳️ Camerún</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>3</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>-6</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>0</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 4. PICK'EM VIEW */}
      {activeSubTab === 'pickem' && (
        <div className="portal-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800 }}>📝 Mis Predicciones de Roster (Pick'Em)</h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '-4px' }}>
              Guarda tus predicciones personales del torneo. Una vez que se resuelva la Copa del Mundo GoalChain 2026, recibirás reputación y multiplicadores de staking en base a tus aciertos.
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '6px' }}>🏆 Campeón del Mundial</label>
                <select 
                  value={championPick} 
                  onChange={(e) => setChampionPick(e.target.value)}
                  style={{ width: '100%', maxWidth: '300px', background: '#070f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.78rem', outline: 'none' }}
                >
                  <option value="">Selecciona Campeón...</option>
                  {WC_TEAMS.map(t => (
                    <option key={t.name} value={t.name}>{t.emoji} {t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '6px' }}>🐎 Caballo Negro / Revelación</label>
                <select 
                  value={darkHorsePick} 
                  onChange={(e) => setDarkHorsePick(e.target.value)}
                  style={{ width: '100%', maxWidth: '300px', background: '#070f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.78rem', outline: 'none' }}
                >
                  <option value="">Selecciona Revelación...</option>
                  {WC_TEAMS.map(t => (
                    <option key={t.name} value={t.name}>{t.emoji} {t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: '6px' }}>⚽ Bota de Oro / Goleador</label>
                <input 
                  type="text" 
                  value={topScorerPick} 
                  onChange={(e) => setTopScorerPick(e.target.value)}
                  placeholder="Ej: Lionel Satoshi o Kylian Vitalik"
                  style={{ width: '100%', maxWidth: '300px', background: '#070f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.78rem', outline: 'none' }}
                />
              </div>

            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <button 
                onClick={handleSavePickem}
                className="btn-neon-green"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                💾 Guardar Predicciones
              </button>
              
              {savedSuccess && (
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-neon)', fontWeight: 'bold', animation: 'fadeIn 0.3s ease-out' }}>
                  ✓ ¡Predicciones guardadas localmente en localStorage!
                </span>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
