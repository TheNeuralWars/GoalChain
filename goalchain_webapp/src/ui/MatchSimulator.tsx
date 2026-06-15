import React, { useEffect, useState, useRef } from 'react';
import { useMatchSim, createDemoTeams, type PlayerStats } from '../hooks/useMatchSim';
import type { Team } from '../workers/types';

const MOCK_PLAYERS: PlayerStats[] = [
  { playerId: '1', name: 'Lionel Satoshi', speed: 220, shotPower: 240, stamina: 200, nationId: 1, isEliminated: false, winStreak: 3, hasShieldJersey: true },
  { playerId: '2', name: 'Cristiano Nakamoto', speed: 210, shotPower: 235, stamina: 190, nationId: 2, isEliminated: false, winStreak: 2, hasShieldJersey: false },
  { playerId: '3', name: 'Kylian Vitalik', speed: 230, shotPower: 210, stamina: 210, nationId: 3, isEliminated: false, winStreak: 1, hasShieldJersey: true },
  { playerId: '4', name: 'Erling Buterin', speed: 190, shotPower: 250, stamina: 180, nationId: 4, isEliminated: false, winStreak: 4, hasShieldJersey: false },
  { playerId: '5', name: 'Kevin De Bruyne', speed: 180, shotPower: 200, stamina: 220, nationId: 5, isEliminated: false, winStreak: 0, hasShieldJersey: false },
  { playerId: '6', name: 'Luka Modric', speed: 170, shotPower: 180, stamina: 230, nationId: 6, isEliminated: false, winStreak: 1, hasShieldJersey: true },
  { playerId: '7', name: 'Virgil van Dijk', speed: 160, shotPower: 160, stamina: 240, nationId: 7, isEliminated: false, winStreak: 2, hasShieldJersey: false },
  { playerId: '8', name: 'Alisson Becker', speed: 150, shotPower: 100, stamina: 250, nationId: 8, isEliminated: false, winStreak: 0, hasShieldJersey: false },
  { playerId: '9', name: 'Trent Alexander-Arnold', speed: 200, shotPower: 190, stamina: 200, nationId: 9, isEliminated: false, winStreak: 1, hasShieldJersey: true },
  { playerId: '10', name: 'Mohamed Salah', speed: 225, shotPower: 220, stamina: 195, nationId: 10, isEliminated: false, winStreak: 3, hasShieldJersey: false },
  { playerId: '11', name: 'Jude Bellingham', speed: 215, shotPower: 205, stamina: 215, nationId: 11, isEliminated: false, winStreak: 2, hasShieldJersey: true },
  { playerId: '12', name: 'Robert Lewandowski', speed: 185, shotPower: 245, stamina: 185, nationId: 12, isEliminated: false, winStreak: 1, hasShieldJersey: false },
  { playerId: '13', name: 'Harry Kane', speed: 175, shotPower: 250, stamina: 190, nationId: 13, isEliminated: false, winStreak: 2, hasShieldJersey: true },
  { playerId: '14', name: 'Son Heung-min', speed: 235, shotPower: 215, stamina: 205, nationId: 14, isEliminated: false, winStreak: 3, hasShieldJersey: false },
  { playerId: '15', name: 'Vinicius Jr', speed: 240, shotPower: 200, stamina: 195, nationId: 15, isEliminated: false, winStreak: 4, hasShieldJersey: true },
  { playerId: '16', name: 'Rodri', speed: 170, shotPower: 170, stamina: 235, nationId: 16, isEliminated: false, winStreak: 1, hasShieldJersey: false },
  { playerId: '17', name: 'Ruben Dias', speed: 165, shotPower: 155, stamina: 245, nationId: 17, isEliminated: false, winStreak: 0, hasShieldJersey: false },
  { playerId: '18', name: 'Thibaut Courtois', speed: 140, shotPower: 90, stamina: 255, nationId: 18, isEliminated: false, winStreak: 0, hasShieldJersey: true },
  { playerId: '19', name: 'Joao Cancelo', speed: 205, shotPower: 185, stamina: 200, nationId: 19, isEliminated: false, winStreak: 2, hasShieldJersey: false },
  { playerId: '20', name: 'Bernardo Silva', speed: 195, shotPower: 195, stamina: 210, nationId: 20, isEliminated: false, winStreak: 1, hasShieldJersey: true },
  { playerId: '21', name: 'Phil Foden', speed: 210, shotPower: 205, stamina: 200, nationId: 21, isEliminated: false, winStreak: 3, hasShieldJersey: false },
  { playerId: '22', name: 'Declan Rice', speed: 180, shotPower: 165, stamina: 230, nationId: 22, isEliminated: false, winStreak: 1, hasShieldJersey: false },
];

const EMOTION_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  neutral: { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.05)', text: '#e2e8f0', icon: '💬' },
  excited: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', text: '#eab308', icon: '⚡' },
  tense: { bg: 'rgba(255,77,106,0.1)', border: 'rgba(255,77,106,0.3)', text: '#ff4d6a', icon: '😰' },
  celebration: { bg: 'rgba(20,241,149,0.1)', border: 'rgba(20,241,149,0.3)', text: '#14f195', icon: '🎉' },
  disappointment: { bg: 'rgba(255,77,106,0.1)', border: 'rgba(255,77,106,0.2)', text: '#ff4d6a', icon: '😞' },
  analytical: { bg: 'rgba(153,69,255,0.1)', border: 'rgba(153,69,255,0.3)', text: '#9945ff', icon: '📊' },
};

export function MatchSimulator() {
  const { state, events, commentary, isRunning, isInitialized, speed, init, start, pause, resume, stop, setSpeed } = useMatchSim();
  const [showControls, setShowControls] = useState(true);
  const commentaryEndRef = useRef<HTMLDivElement>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);

  useEffect(() => {
    const [h, a] = createDemoTeams(MOCK_PLAYERS);
    setHomeTeam(h);
    setAwayTeam(a);
    init(h, a);
  }, [init]);

  useEffect(() => {
    commentaryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentary]);

  const handleStart = () => {
    if (homeTeam && awayTeam) {
      init(homeTeam, awayTeam);
      start();
    }
  };

  if (!isInitialized) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div className="pulse-dot" style={{ width: '12px', height: '12px', backgroundColor: 'var(--secondary-neon)', boxShadow: '0 0 15px var(--secondary-neon-glow)', margin: '0 auto 1rem' }}></div>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
          Inicializando Simulador de Partidos...
        </h4>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
          Preparando Web Worker y motor de comentario
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot" style={{ backgroundColor: isRunning ? 'var(--primary-neon)' : 'var(--secondary-neon)', boxShadow: isRunning ? '0 0 10px var(--primary-neon-glow)' : '0 0 10px var(--secondary-neon-glow)' }}></span>
            Simulador de Partidos ⚽
          </h3>
          <span className="simulation-badge" style={{ fontSize: '0.6rem' }}>WEB WORKER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Velocidad:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.25"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--primary-neon)' }}
          />
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary-neon)' }}>{speed.toFixed(1)}x</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right', minWidth: '100px' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Local</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{homeTeam?.name || 'GoalChain FC'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace', minWidth: '100px', textAlign: 'center' }}>
              {state ? `${state.homeScore} - ${state.awayScore}` : '0 - 0'}
            </div>
          </div>
          <div style={{ textAlign: 'left', minWidth: '100px' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visitante</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{awayTeam?.name || 'Solana United'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <div style={{ background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.3)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, color: 'var(--primary-neon)' }}>
            {state ? (state.half === 1 ? `1ª Parte ${state.minute}'${state.second.toString().padStart(2, '0')}` : `2ª Parte ${state.minute}'${state.second.toString().padStart(2, '0')}`) : 'No iniciado'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Eventos: {events.length} | Comentarios: {commentary.length}
          </div>
        </div>
      </div>

      {showControls && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleStart}
            disabled={isRunning}
            className={isRunning ? 'btn-outline-green' : 'btn-neon-green'}
            style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px' }}
          >
            {isRunning ? '⏸️ En juego...' : '▶️ Iniciar Partido'}
          </button>
          <button
            onClick={isRunning ? pause : resume}
            disabled={!isRunning && events.length === 0}
            className={isRunning ? 'btn-neon-orange' : 'btn-outline-green'}
            style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px' }}
          >
            {isRunning ? '⏸️ Pausar' : '▶️ Continuar'}
          </button>
          <button
            onClick={stop}
            disabled={events.length === 0 && !isRunning}
            className="btn-outline-red"
            style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px' }}
          >
            ⏹️ Detener
          </button>
          <button
            onClick={() => setShowControls(false)}
            style={{ padding: '8px 12px', fontSize: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          >
            Ocultar controles
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
        {commentary.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem', fontSize: '0.85rem' }}>
            {isRunning ? '⚽ Partido en curso... generando comentarios' : '▶️ Inicia el partido para ver la narración en vivo'}
          </div>
        ) : (
          commentary.map((line, idx) => {
            const style = EMOTION_STYLES[line.emotion] || EMOTION_STYLES.neutral;
            const time = new Date(line.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return (
              <div
                key={line.id}
                style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  lineHeight: '1.4',
                  color: style.text,
                  animation: 'slideIn 0.3s ease-out',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{style.icon}</span>
                <span style={{ flex: 1 }}>{line.text}</span>
                <span style={{ fontSize: '0.6rem', color: '#64748b', fontFamily: 'monospace', flexShrink: 0, marginTop: '2px' }}>{time}</span>
              </div>
            );
          })
        )}
        <div ref={commentaryEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            {homeTeam?.name} - Formación: {homeTeam?.formation}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {homeTeam?.players.slice(0, 11).map(p => (
              <span key={p.playerId} style={{
                fontSize: '0.6rem',
                padding: '2px 6px',
                background: p.hasShieldJersey ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)',
                border: p.hasShieldJersey ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: p.hasShieldJersey ? '#eab308' : '#cbd5e1',
                whiteSpace: 'nowrap'
              }}>
                {p.name.split(' ').pop()} ⚡{p.speed} 💥{p.shotPower} 🔋{p.stamina}
              </span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            {awayTeam?.name} - Formación: {awayTeam?.formation}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {awayTeam?.players.slice(0, 11).map(p => (
              <span key={p.playerId} style={{
                fontSize: '0.6rem',
                padding: '2px 6px',
                background: p.hasShieldJersey ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)',
                border: p.hasShieldJersey ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: p.hasShieldJersey ? '#eab308' : '#cbd5e1',
                whiteSpace: 'nowrap'
              }}>
                {p.name.split(' ').pop()} ⚡{p.speed} 💥{p.shotPower} 🔋{p.stamina}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}