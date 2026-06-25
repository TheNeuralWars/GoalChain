import React, { useState } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';

interface PlayerStatsBreakdown {
  fisico: number;
  defensa: number;
  ofensivo: number;
  creacion: number;
}

interface MatchPerformance {
  opponent: string;
  rating: number;
  minutes: number;
  effectiveMinutes: number;
  stoppageReason: string;
  contribution: string;
}

interface TacticalWeights {
  '4-3-3': number;
  '4-4-2': number;
  '3-5-2': number;
}

interface DetailedPlayer {
  name: string;
  rarity: 'Gold' | 'Silver' | 'Bronze' | string;
  score: number;
  role: 'Delantero' | 'Centrocampista' | 'Defensa';
  breakdown: PlayerStatsBreakdown;
  history: MatchPerformance[];
  tacticalWeights: TacticalWeights;
}

const myPlayers: DetailedPlayer[] = [
  {
    name: "Julian Satoshi",
    rarity: "Gold",
    score: 92,
    role: "Delantero",
    breakdown: { fisico: 94, defensa: 45, ofensivo: 96, creacion: 88 },
    history: [
      { opponent: "Solana FC", rating: 9.2, minutes: 90, effectiveMinutes: 62, stoppageReason: "Faltas tacticas y saques de banda", contribution: "⚽ 1 Gol, 👟 1 Asist" },
      { opponent: "Phantom United", rating: 8.5, minutes: 82, effectiveMinutes: 55, stoppageReason: "Revisiones VAR e hidratacion", contribution: "⚽ 1 Gol" },
      { opponent: "Ledger Athletic", rating: 7.8, minutes: 90, effectiveMinutes: 60, stoppageReason: "Sustituciones y corners", contribution: "👟 1 Asist" },
    ],
    tacticalWeights: { '4-3-3': 1.03, '4-4-2': 1.00, '3-5-2': 0.92 }
  },
  {
    name: "Enzo Bit",
    rarity: "Silver",
    score: 84,
    role: "Centrocampista",
    breakdown: { fisico: 82, defensa: 76, ofensivo: 78, creacion: 89 },
    history: [
      { opponent: "Solana FC", rating: 8.0, minutes: 90, effectiveMinutes: 62, stoppageReason: "Faltas tacticas y saques de banda", contribution: "👟 1 Asist" },
      { opponent: "Phantom United", rating: 8.4, minutes: 90, effectiveMinutes: 59, stoppageReason: "Faltas y corners", contribution: "👟 2 Asist" },
      { opponent: "Ledger Athletic", rating: 7.5, minutes: 74, contribution: "🟨 Tarjeta Amarilla", effectiveMinutes: 48, stoppageReason: "Pausa de hidratacion" },
    ],
    tacticalWeights: { '4-3-3': 1.00, '4-4-2': 1.02, '3-5-2': 1.06 }
  },
  {
    name: "Alexis Chain",
    rarity: "Bronze",
    score: 78,
    role: "Defensa",
    breakdown: { fisico: 85, defensa: 84, ofensivo: 48, creacion: 72 },
    history: [
      { opponent: "Solana FC", rating: 7.2, minutes: 90, effectiveMinutes: 62, stoppageReason: "Faltas tacticas", contribution: "Ninguna" },
      { opponent: "Phantom United", rating: 7.9, minutes: 90, effectiveMinutes: 59, stoppageReason: "Corners y saques de meta", contribution: "🚫 3 Intercepciones" },
      { opponent: "Ledger Athletic", rating: 8.1, minutes: 90, effectiveMinutes: 60, stoppageReason: "Faltas y saques de meta", contribution: "🚫 5 Despejes" },
    ],
    tacticalWeights: { '4-3-3': 0.94, '4-4-2': 1.03, '3-5-2': 1.01 }
  },
  {
    name: "Lisandro Ledger",
    rarity: "Silver",
    score: 81,
    role: "Defensa",
    breakdown: { fisico: 88, defensa: 86, ofensivo: 52, creacion: 75 },
    history: [
      { opponent: "Solana FC", rating: 7.5, minutes: 90, effectiveMinutes: 62, stoppageReason: "Faltas tacticas", contribution: "🚫 2 Intercepciones" },
      { opponent: "Phantom United", rating: 8.2, minutes: 90, effectiveMinutes: 59, stoppageReason: "Corners y saques de meta", contribution: "🚫 4 Despejes" },
      { opponent: "Ledger Athletic", rating: 8.0, minutes: 90, effectiveMinutes: 60, stoppageReason: "🟨 Amarilla por protestar", contribution: "🟨 Tarjeta Amarilla" },
    ],
    tacticalWeights: { '4-3-3': 0.95, '4-4-2': 1.04, '3-5-2': 1.02 }
  }
];

interface PlayerCardProps {
  player: DetailedPlayer;
  onClick: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClick }) => {
  const { name, rarity, score } = player;
  const rarityClass = `card-rarity-${rarity.toLowerCase()}`;
  
  const badgeColor = rarity === 'Gold' 
    ? '#ffd700' 
    : rarity === 'Silver' 
      ? '#cbd5e1' 
      : '#b45309';

  const textGlowStyle = rarity === 'Gold'
    ? { color: '#ffd700', textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }
    : rarity === 'Silver'
      ? { color: '#cbd5e1', textShadow: '0 0 10px rgba(203, 213, 225, 0.2)' }
      : { color: '#d97706', textShadow: '0 0 8px rgba(217, 119, 6, 0.15)' };

  return (
    <div className={`glass-card ${rarityClass}`} onClick={onClick} style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.5rem 1rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 10px 20px ${badgeColor}22`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      {/* Holographic Badge / Artwork Shield */}
      <div style={{ 
        width: '100%', 
        height: '140px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '1rem',
        position: 'relative'
      }}>
        <svg width="100" height="110" viewBox="0 0 100 110" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`shieldGrad-${rarity}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={badgeColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor="#030307" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Outer shield */}
          <path 
            d="M 50 5 L 85 20 L 85 70 L 50 105 L 15 70 L 15 20 Z" 
            fill={`url(#shieldGrad-${rarity})`}
            stroke={badgeColor} 
            strokeWidth="2" 
            style={{ filter: `drop-shadow(0 4px 12px ${badgeColor}33)` }} 
          />
          
          {/* Inner detail border */}
          <path 
            d="M 50 9 L 80 22 L 80 67 L 50 98 L 20 67 L 20 22 Z" 
            fill="none" 
            stroke="rgba(255,255,255,0.03)" 
            strokeWidth="1" 
          />
          
          {/* Center decorative ring */}
          <circle cx="50" cy="48" r="22" fill="none" stroke={badgeColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          
          {/* Icon details (Football lines) */}
          <g stroke={badgeColor} strokeWidth="1.5" fill="none" opacity="0.75">
            <circle cx="50" cy="48" r="14" />
            <path d="M 50 34 Q 45 48 50 62" />
            <path d="M 50 34 Q 55 48 50 62" />
            <path d="M 36 48 Q 50 43 64 48" />
            <path d="M 36 48 Q 50 53 64 48" />
          </g>
          
          {/* Rating label badge */}
          <rect x="34" y="78" width="32" height="16" rx="4" fill="#030307" stroke={badgeColor} strokeWidth="1" />
          <text x="50" y="90" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.5px">
            {score} OVR
          </text>
        </svg>
      </div>
      
      {/* Player details */}
      <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
        {name}
      </h4>
      
      <div style={{ 
        fontSize: '0.75rem', 
        fontWeight: 700, 
        textTransform: 'uppercase', 
        letterSpacing: '1px',
        ...textGlowStyle
      }}>
        {rarity} TIER
      </div>

      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px', fontWeight: 500 }}>
        ⚡ {player.role}
      </div>

      <button 
        className="btn-outline-green" 
        style={{ 
          marginTop: '1.25rem', 
          width: '100%', 
          padding: '0.4rem 0.5rem', 
          fontSize: '0.75rem',
          letterSpacing: '0.5px',
          pointerEvents: 'none'
        }}
      >
        ANALIZAR 📊
      </button>
    </div>
  );
};

export const SquadGallery: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<DetailedPlayer | null>(null);
  const [activeSystem, setActiveSystem] = useState<'4-3-3' | '4-4-2' | '3-5-2'>('4-3-3');

  const closePlayerModal = () => {
    setSelectedPlayer(null);
  };

  const getSystemCoefficient = (player: DetailedPlayer, system: '4-3-3' | '4-4-2' | '3-5-2') => {
    return player.tacticalWeights[system];
  };

  const getAdjustedOvr = (player: DetailedPlayer, system: '4-3-3' | '4-4-2' | '3-5-2') => {
    return Math.round(player.score * getSystemCoefficient(player, system));
  };

  return (
    <div className="squad-gallery" style={{ marginTop: '0.5rem', textAlign: 'left' }}>
      <h2 className="text-neon-green" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.4rem' }}>🏆</span> Mi Cantera (Youth Academy)
        <SimulationBadge />
      </h2>
      
      {/* Player Card Responsive Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', 
        gap: '1.5rem', 
        marginTop: '1rem' 
      }}>
        {myPlayers.map((p, i) => (
          <PlayerCard key={i} player={p} onClick={() => {
            setSelectedPlayer(p);
            setActiveSystem('4-3-3');
          }} />
        ))}
      </div>
      
      {/* Agent Tip Box */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1.25rem', 
        background: 'rgba(20, 241, 149, 0.01)', 
        borderRadius: '16px',
        border: '1px dashed rgba(20, 241, 149, 0.25)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <span className="pulse-dot" style={{ marginTop: '5px', flexShrink: 0 }}></span>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5' }}>
          <strong style={{ color: 'var(--primary-neon)' }}>Tip de Agente (FifaPhy-inspired):</strong> Cada jugador rinde diferente según el sistema táctico activo. Analiza la compatibilidad (OVR dinámico) y el tiempo efectivo de fatiga antes de decidir tu alineación de recompensa on-chain.
        </p>
      </div>

      {/* DETAILED PLAYER REPORT MODAL */}
      {selectedPlayer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(3, 3, 7, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem',
          boxSizing: 'border-box'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closePlayerModal();
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '780px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'rgba(10, 20, 38, 0.95)',
            border: '1px solid rgba(20, 241, 149, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 255, 127, 0.15)',
            borderRadius: '24px',
            padding: '2rem',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={closePlayerModal}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                fontSize: '1.1rem',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(20, 241, 149, 0.1)',
                  color: 'var(--primary-neon)',
                  border: '1px solid rgba(20, 241, 149, 0.2)'
                }}>
                  FifaPhy Live Report
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{selectedPlayer.role}</span>
              </div>
              <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                📊 Informe Táctico: {selectedPlayer.name}
              </h2>
            </div>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              
              {/* Left Column: Card display and Tactical Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                
                {/* Dynamically Recalculated Card */}
                <div className="glass-card" style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '2rem',
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.02)'
                }}>
                  <svg width="120" height="130" viewBox="0 0 100 110" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="modalShieldGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--primary-neon)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#030307" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M 50 5 L 85 20 L 85 70 L 50 105 L 15 70 L 15 20 Z" 
                      fill="url(#modalShieldGrad)"
                      stroke="var(--primary-neon)" 
                      strokeWidth="2.5" 
                      style={{ filter: 'drop-shadow(0 4px 15px rgba(0,255,127,0.25))' }}
                    />
                    <circle cx="50" cy="48" r="22" fill="none" stroke="var(--primary-neon)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                    <g stroke="var(--primary-neon)" strokeWidth="1.5" fill="none" opacity="0.75">
                      <circle cx="50" cy="48" r="14" />
                      <path d="M 50 34 Q 45 48 50 62" />
                      <path d="M 50 34 Q 55 48 50 62" />
                    </g>
                    <rect x="30" y="78" width="40" height="18" rx="4" fill="#030307" stroke="var(--primary-neon)" strokeWidth="1" />
                    <text x="50" y="91" fill="#ffffff" fontSize="9.5" fontWeight="950" textAnchor="middle">
                      {getAdjustedOvr(selectedPlayer, activeSystem)} OVR
                    </text>
                  </svg>
                  
                  <span style={{ color: '#fff', fontWeight: 800, marginTop: '1rem', fontSize: '1.05rem' }}>{selectedPlayer.name}</span>
                  <span style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{selectedPlayer.rarity} Roster Card</span>
                </div>

                {/* Tactical System Selector */}
                <div style={{ width: '100%' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📐 Ajuste por Sistema Táctico
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {(['4-3-3', '4-4-2', '3-5-2'] as const).map((system) => {
                      const coeff = getSystemCoefficient(selectedPlayer, system);
                      const diff = Math.round((coeff - 1) * 100);
                      const diffText = diff >= 0 ? `+${diff}%` : `${diff}%`;
                      const active = activeSystem === system;

                      return (
                        <button
                          key={system}
                          onClick={() => setActiveSystem(system)}
                          style={{
                            background: active ? 'var(--primary-neon)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${active ? 'var(--primary-neon)' : 'rgba(255,255,255,0.08)'}`,
                            color: active ? '#000' : '#fff',
                            borderRadius: '10px',
                            padding: '8px 4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>{system}</span>
                          <span style={{ fontSize: '0.62rem', opacity: 0.85, color: active ? '#000' : diff >= 0 ? 'var(--primary-neon)' : '#ff4d6a' }}>
                            {diffText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: FifaPhy Rating Breakdown & Stoppage Analysis */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                
                {/* 1. Rating Breakdown */}
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📊 Desglose de Atributos Base
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Físico */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#fff', marginBottom: '4px' }}>
                        <span>⚡ Físico (Stamina, Fuerza, Ritmo)</span>
                        <span style={{ fontWeight: 800 }}>{selectedPlayer.breakdown.fisico}</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedPlayer.breakdown.fisico}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Defensa */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#fff', marginBottom: '4px' }}>
                        <span>🛡️ Defensa (Tackles, Bloqueos, Corte)</span>
                        <span style={{ fontWeight: 800 }}>{selectedPlayer.breakdown.defensa}</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedPlayer.breakdown.defensa}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Ofensivo */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#fff', marginBottom: '4px' }}>
                        <span>🎯 Ofensivo (Disparos, Remates, Definición)</span>
                        <span style={{ fontWeight: 800 }}>{selectedPlayer.breakdown.ofensivo}</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedPlayer.breakdown.ofensivo}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #dc2626)', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Creación */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#fff', marginBottom: '4px' }}>
                        <span>🧩 Creación (Pases, Visión, Regates)</span>
                        <span style={{ fontWeight: 800 }}>{selectedPlayer.breakdown.creacion}</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedPlayer.breakdown.creacion}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: '4px' }} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. Effective Time & Performance History */}
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⏱️ Rendimiento & Tiempo Efectivo
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedPlayer.history.map((match, idx) => {
                      const efficiency = Math.round((match.effectiveMinutes / match.minutes) * 100);
                      return (
                        <div key={idx} style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          fontSize: '0.72rem',
                          lineHeight: '1.4'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ color: '#fff', fontWeight: 700 }}>vs {match.opponent}</span>
                            <span style={{
                              color: 'var(--primary-neon)',
                              fontWeight: 'bold',
                              background: 'rgba(20,241,149,0.08)',
                              padding: '2px 6px',
                              borderRadius: '6px'
                            }}>
                              ⭐ {match.rating} Rtg
                            </span>
                          </div>

                          <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginBottom: '4px' }}>
                            {match.contribution !== "Ninguna" ? `⚽ Aporte: ${match.contribution}` : "⚽ Sin goles o asistencias"}
                          </div>

                          {/* Effective Time bar chart */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', marginTop: '6px', fontSize: '0.65rem', color: '#64748b' }}>
                            <span>Tiempo Efectivo: {match.effectiveMinutes}m / {match.minutes}m ({efficiency}%)</span>
                            <span style={{ fontStyle: 'italic', maxWidth: '160px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={match.stoppageReason}>
                              Pérdida por: {match.stoppageReason}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
