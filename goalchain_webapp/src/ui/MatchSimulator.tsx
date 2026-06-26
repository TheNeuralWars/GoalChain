import React, { useEffect, useState, useRef } from 'react';
import { useMatchSim, createDemoTeams, type PlayerStats } from '../hooks/useMatchSim';
import type { Team } from '../workers/types';
import { useUser } from '../contexts/UserContext';

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
  const { user, setUser } = useUser();
  const { 
    state, events, commentary, isRunning, isInitialized, speed, 
    init, start, pause, resume, stop, setSpeed, 
    setTactic, energyBoost, substitute 
  } = useMatchSim();

  const [showControls, setShowControls] = useState(true);
  const commentaryEndRef = useRef<HTMLDivElement>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);

  // States for stakes and tactics
  const [gchBalance, setGchBalance] = useState<number>(1000);
  const [isFallbackMock, setIsFallbackMock] = useState<boolean>(true);
  const [activeTactic, setActiveTacticState] = useState<'normal' | 'defense_total' | 'attack_total'>('normal');
  const [reserves, setReserves] = useState<PlayerStats[]>([]);
  const [selectedSubOutId, setSelectedSubOutId] = useState<string | null>(null);
  const [matchFinished, setMatchFinished] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  // Load GCH balance from localStorage helper
  const getGchBalance = (): number => {
    const raw = localStorage.getItem('gch_balance');
    if (!raw) return 1000;
    const parsed = parseInt(raw.replace(/,/g, ''), 10);
    return isNaN(parsed) ? 1000 : parsed;
  };

  const updateGchBalance = (newBalance: number) => {
    localStorage.setItem('gch_balance', newBalance.toString());
    setGchBalance(newBalance);
    window.dispatchEvent(new Event('storage'));
  };

  // Convert real NFT inventory cards to simulation player stats
  const mapNftToPlayer = (nft: any): PlayerStats => {
    const atk = nft.stats?.atk ?? 75;
    const def = nft.stats?.def ?? 75;
    const hype = nft.stats?.hype ?? 75;
    const pos = nft.position || 'MID';
    const rarity = (nft.rarity || 'common').toLowerCase();
    
    let speed = 150;
    let shotPower = 150;
    let stamina = 150;
    
    if (pos === 'GK') {
      speed = 100 + def * 0.8;
      shotPower = 50 + atk * 0.8;
      stamina = 150 + def * 1.0;
    } else if (pos === 'DEF') {
      speed = 120 + def * 0.8;
      shotPower = 60 + atk * 0.8;
      stamina = 130 + def * 1.0;
    } else if (pos === 'MID') {
      speed = 130 + atk * 0.4 + def * 0.4;
      shotPower = 80 + atk * 1.0;
      stamina = 120 + hype * 1.0;
    } else { // FWD
      speed = 140 + atk * 0.8;
      shotPower = 120 + atk * 1.2;
      stamina = 110 + hype * 1.1;
    }
    
    const rarityBonus = rarity === 'mythic' ? 30 : rarity === 'legendary' ? 20 : rarity === 'epic' ? 15 : rarity === 'rare' ? 10 : 5;
    
    speed += rarityBonus;
    shotPower += rarityBonus;
    stamina += rarityBonus;
    
    return {
      playerId: String(nft.id),
      name: nft.name,
      speed: Math.max(50, Math.min(255, Math.round(speed))),
      shotPower: Math.max(50, Math.min(255, Math.round(shotPower))),
      stamina: Math.max(50, Math.min(255, Math.round(stamina))),
      nationId: nft.id % 20 || 1,
      isEliminated: false,
      winStreak: 0,
      hasShieldJersey: rarity === 'mythic' || rarity === 'legendary',
    };
  };

  // Sync squad, reserves and balance
  const syncSquadAndBalance = () => {
    setGchBalance(getGchBalance());
    
    const rawInv = localStorage.getItem('goalchain_inventory');
    const inventory = rawInv ? JSON.parse(rawInv) : [];
    
    let starters: PlayerStats[] = [];
    let reservesList: PlayerStats[] = [];
    
    if (inventory.length === 0) {
      setIsFallbackMock(true);
      const shuffled = [...MOCK_PLAYERS].sort(() => 0.5 - Math.random());
      starters = shuffled.slice(0, 11);
      reservesList = shuffled.slice(11);
    } else {
      setIsFallbackMock(false);
      const mappedInv = inventory.map(mapNftToPlayer);
      if (mappedInv.length < 11) {
        starters = [...mappedInv];
        const usedNames = new Set(starters.map(s => s.name));
        const padPlayers = MOCK_PLAYERS.filter(p => !usedNames.has(p.name));
        starters = [...starters, ...padPlayers.slice(0, 11 - starters.length)];
        reservesList = padPlayers.slice(11 - starters.length);
      } else {
        starters = mappedInv.slice(0, 11);
        reservesList = mappedInv.slice(11);
      }
    }

    const tName = user ? `${user.avatar} ${user.username} FC` : 'GoalChain FC';
    const [, a] = createDemoTeams(MOCK_PLAYERS);
    
    const homeTeamObj: Team = {
      id: 'home',
      name: tName,
      players: starters,
      formation: '4-4-2',
    };

    setHomeTeam(homeTeamObj);
    setAwayTeam(a);
    setReserves(reservesList);
    init(homeTeamObj, a);
  };

  useEffect(() => {
    syncSquadAndBalance();
    
    const handleStorage = () => {
      setGchBalance(getGchBalance());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [init, user]);

  useEffect(() => {
    commentaryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentary]);

  // Handle Match Finish & Stakes distribution
  useEffect(() => {
    if (state && state.minute >= 90 && !matchFinished) {
      const fulltimeEvent = events.some(e => e.type === 'FULLTIME');
      if (fulltimeEvent) {
        setMatchFinished(true);
        setShowResultModal(true);
        
        // Payout rewards
        if (state.homeScore > state.awayScore) {
          // Win: +120 $GCH & +25 EXP
          const current = getGchBalance();
          updateGchBalance(current + 120);
          
          if (user) {
            const currentXp = (user as any).xp || 4210;
            setUser({ ...user, xp: currentXp + 25 } as any);
          }
        } else {
          // Draw/Loss: +5 EXP
          if (user) {
            const currentXp = (user as any).xp || 4210;
            setUser({ ...user, xp: currentXp + 5 } as any);
          }
        }
      }
    }
  }, [state, events, matchFinished]);

  const handleStart = () => {
    if (homeTeam && awayTeam) {
      const current = getGchBalance();
      if (current < 50) {
        alert('⚠️ Saldo de $GCH insuficiente. Jugar un partido táctico cuesta 50 $GCH. Ve a Transfer Market o DeFi Terminal.');
        return;
      }
      
      // Deduct entry fee
      updateGchBalance(current - 50);
      
      // Burn 10% (5 $GCH) - update #liveBurnVal in DOM
      const liveBurnEl = document.getElementById('liveBurnVal');
      if (liveBurnEl) {
        let currentBurn = parseInt(liveBurnEl.innerText.replace(/,/g, ''), 10) || 0;
        currentBurn += 5;
        liveBurnEl.innerText = currentBurn.toLocaleString();
      }
      
      setMatchFinished(false);
      setShowResultModal(false);
      setActiveTacticState('normal');
      setSelectedSubOutId(null);
      
      // Re-initialize and start simulation
      init(homeTeam, awayTeam);
      start();
    }
  };

  const handleTacticChange = (tactic: 'normal' | 'defense_total' | 'attack_total') => {
    if (!isRunning) return;
    setActiveTacticState(tactic);
    setTactic(tactic);
  };

  const handleEnergyBoost = (playerId: string) => {
    if (!isRunning) return;
    const current = getGchBalance();
    if (current < 15) {
      alert('⚠️ Saldo de $GCH insuficiente. El micro-boost de stamina cuesta 15 $GCH.');
      return;
    }
    
    // Deduct micro-transaction cost
    updateGchBalance(current - 15);
    
    // Burn 50% (7.5 -> 8 $GCH)
    const liveBurnEl = document.getElementById('liveBurnVal');
    if (liveBurnEl) {
      let currentBurn = parseInt(liveBurnEl.innerText.replace(/,/g, ''), 10) || 0;
      currentBurn += 8;
      liveBurnEl.innerText = currentBurn.toLocaleString();
    }
    
    energyBoost(playerId);
  };

  const handleSubSelect = (playerIn: PlayerStats) => {
    if (!selectedSubOutId) return;
    substitute(selectedSubOutId, playerIn);
    
    // Remove the incoming player from reserves so they aren't duplicate substituted
    setReserves(prev => prev.filter(p => p.playerId !== playerIn.playerId));
    setSelectedSubOutId(null);
  };

  if (!isInitialized) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div className="pulse-dot" style={{ width: '12px', height: '12px', backgroundColor: 'var(--secondary-neon)', boxShadow: '0 0 15px var(--secondary-neon-glow)', margin: '0 auto 1rem' }}></div>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
          Inicializando Simulador Táctico...
        </h4>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
          Conectando Web Worker, validando stakes de $GCH y cargando plantilla...
        </p>
      </div>
    );
  }

  // Get active home team list (which changes on substitutes/energy boosts)
  const currentHomeTeam = state?.homeTeam || homeTeam;
  const currentAwayTeam = state?.awayTeam || awayTeam;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '650px', position: 'relative' }}>
      
      {/* Fallback mock template banner */}
      {isFallbackMock && (
        <div style={{
          background: 'rgba(234,179,8,0.1)',
          border: '1px solid rgba(234,179,8,0.2)',
          borderRadius: '10px',
          padding: '10px 16px',
          marginBottom: '1rem',
          fontSize: '0.78rem',
          color: '#eab308',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span>
          <span><strong>Jugando con plantilla de entrenamiento (Mock).</strong> Compra NFTs en el mercado para potenciar tus estadísticas de simulación.</span>
        </div>
      )}

      {/* Header & Wallet Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot" style={{ backgroundColor: isRunning ? 'var(--primary-neon)' : 'var(--secondary-neon)', boxShadow: isRunning ? '0 0 10px var(--primary-neon-glow)' : '0 0 10px var(--secondary-neon-glow)' }}></span>
            Arena Táctica Interactiva 🏟️
          </h3>
          <span className="simulation-badge" style={{ fontSize: '0.6rem' }}>WORKER THREAD</span>
        </div>
        
        {/* $GCH balance & micro stakes info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.2)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary-neon)' }}>
            💰 Mi Balance: <span style={{ color: '#fff' }}>{gchBalance.toLocaleString()} $GCH</span>
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
              style={{ width: '80px', accentColor: 'var(--primary-neon)' }}
            />
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary-neon)' }}>{speed.toFixed(1)}x</span>
          </div>
        </div>
      </div>

      {/* Main scoreboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'right', flex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Local</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{currentHomeTeam?.name || 'GoalChain FC'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '120px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 950, color: '#fff', fontFamily: 'monospace', letterSpacing: '2px' }}>
              {state ? `${state.homeScore} - ${state.awayScore}` : '0 - 0'}
            </div>
            <div style={{ background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.3)', padding: '2px 10px', borderRadius: '20px', fontWeight: 700, color: 'var(--primary-neon)', fontSize: '0.7rem' }}>
              {state ? (state.half === 1 ? `1ª Parte ${state.minute}'${state.second.toString().padStart(2, '0')}` : `2ª Parte ${state.minute}'${state.second.toString().padStart(2, '0')}`) : 'No iniciado'}
            </div>
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visitante</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{currentAwayTeam?.name || 'Solana United'}</div>
          </div>
        </div>
      </div>

      {/* Match Control Buttons */}
      {showControls && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleStart}
            disabled={isRunning || gchBalance < 50}
            className={isRunning ? 'btn-outline-green' : 'btn-neon-green'}
            style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px', opacity: (gchBalance < 50 && !isRunning) ? 0.5 : 1 }}
          >
            {isRunning ? '⚽ En Juego...' : `▶️ Iniciar (Costo: 50 $GCH)`}
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
            onClick={() => { stop(); setMatchFinished(false); }}
            disabled={events.length === 0 && !isRunning}
            className="btn-outline-red"
            style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px' }}
          >
            ⏹️ Detener
          </button>
          {gchBalance < 50 && !isRunning && (
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-red)', fontWeight: 600 }}>
              ❌ Saldo insuficiente (50 $GCH).
            </span>
          )}
        </div>
      )}

      {/* Interactive Command Panel */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
          🧠 Panel de Comandos Tácticos (Manager)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          
          <button
            onClick={() => handleTacticChange('defense_total')}
            disabled={!isRunning}
            style={{
              background: activeTactic === 'defense_total' ? 'rgba(59,130,246,0.2)' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${activeTactic === 'defense_total' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.05)'}`,
              color: activeTactic === 'defense_total' ? '#3b82f6' : '#fff',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              textAlign: 'left',
              cursor: isRunning ? 'pointer' : 'not-allowed',
              opacity: isRunning ? 1 : 0.5,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>🛡️ Bus en la Portería (Defensa Total)</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>+40% de defensa, menor probabilidad de recibir gol. Reduce ataques propios. (Gratis)</div>
          </button>

          <button
            onClick={() => handleTacticChange('attack_total')}
            disabled={!isRunning}
            style={{
              background: activeTactic === 'attack_total' ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${activeTactic === 'attack_total' ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.05)'}`,
              color: activeTactic === 'attack_total' ? '#ef4444' : '#fff',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              textAlign: 'left',
              cursor: isRunning ? 'pointer' : 'not-allowed',
              opacity: isRunning ? 1 : 0.5,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>🏹 Ataque Total (Verticalidad)</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>+30% de velocidad y poder de ataque. Duplica el cansancio del equipo. (Gratis)</div>
          </button>

          <button
            onClick={() => handleTacticChange('normal')}
            disabled={!isRunning}
            style={{
              background: activeTactic === 'normal' ? 'rgba(153,69,255,0.2)' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${activeTactic === 'normal' ? 'rgba(153,69,255,0.6)' : 'rgba(255,255,255,0.05)'}`,
              color: activeTactic === 'normal' ? '#9945ff' : '#fff',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              textAlign: 'left',
              cursor: isRunning ? 'pointer' : 'not-allowed',
              opacity: isRunning ? 1 : 0.5,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>⚖️ Táctica Balanceada</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>Restaura el esquema de juego estándar y ritmo de fatiga regular. (Gratis)</div>
          </button>

        </div>
      </div>

      {/* Roster & Commentary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', flex: 1 }}>
        
        {/* Left Column: Home Squad & Micro-actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
            <span>📋 Mi Plantilla Táctica</span>
            <span style={{ color: 'var(--primary-neon)' }}>Formación: {currentHomeTeam?.formation}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
            {currentHomeTeam?.players.slice(0, 11).map((p) => {
              const staminaPct = Math.round((p.stamina / 255) * 100);
              const isTired = staminaPct < 40;
              const barColor = staminaPct > 60 ? 'var(--primary-neon)' : staminaPct > 30 ? '#eab308' : '#ff4d6a';
              
              return (
                <div key={p.playerId} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: p.hasShieldJersey ? 'rgba(234,179,8,0.05)' : 'rgba(255,255,255,0.01)',
                  border: `1px solid ${p.hasShieldJersey ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)'}`,
                  padding: '6px 10px',
                  borderRadius: '10px',
                  fontSize: '0.72rem'
                }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <span style={{ fontWeight: 'bold', color: p.hasShieldJersey ? '#eab308' : '#fff' }}>
                      {p.name.split(' ').pop()}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>OVR: {Math.round((p.speed + p.shotPower + p.stamina) / 3)}</span>
                      <span style={{ fontSize: '0.62rem', color: isTired ? '#ff4d6a' : '#cbd5e1' }}>🔋 {staminaPct}%</span>
                    </div>
                    {/* Stamina progress bar */}
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px', width: '100px' }}>
                      <div style={{ width: `${staminaPct}%`, height: '100%', background: barColor }} />
                    </div>
                  </div>

                  {/* Micro Actions for single players */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleEnergyBoost(p.playerId)}
                      disabled={!isRunning || gchBalance < 15 || staminaPct > 80}
                      title="GCH Energy Boost: Recupera 45% stamina (Costo: 15 $GCH)"
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(20,241,149,0.1)',
                        border: '1px solid rgba(20,241,149,0.3)',
                        color: 'var(--primary-neon)',
                        borderRadius: '6px',
                        fontSize: '0.62rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: (!isRunning || gchBalance < 15 || staminaPct > 80) ? 0.3 : 1
                      }}
                    >
                      ⚡ Boost
                    </button>
                    <button
                      onClick={() => setSelectedSubOutId(p.playerId)}
                      disabled={!isRunning || reserves.length === 0}
                      title="Sustitución de Emergencia: Reemplaza por un suplente fresco (Gratis)"
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(153,69,255,0.1)',
                        border: '1px solid rgba(153,69,255,0.3)',
                        color: '#9945ff',
                        borderRadius: '6px',
                        fontSize: '0.62rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: (!isRunning || reserves.length === 0) ? 0.3 : 1
                      }}
                    >
                      🔄 Cambiar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Commentary Stream */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            🎙️ Narrador IA en Vivo
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', maxHeight: '350px' }}>
            {commentary.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem', fontSize: '0.85rem', margin: 'auto' }}>
                {isRunning ? '⚽ Partido en curso... generando comentarios' : '▶️ Inicia el partido para ver la narración táctica en vivo'}
              </div>
            ) : (
              commentary.map((line) => {
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
                      fontSize: '0.75rem',
                      lineHeight: '1.4',
                      color: style.text,
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
        </div>

      </div>

      {/* Opponent list */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            Rival: {currentAwayTeam?.name} - Formación: {currentAwayTeam?.formation}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {currentAwayTeam?.players.slice(0, 11).map(p => (
              <span key={p.playerId} style={{
                fontSize: '0.6rem',
                padding: '2px 6px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#cbd5e1',
                whiteSpace: 'nowrap'
              }}>
                {p.name.split(' ').pop()} ⚡{p.speed} 💥{p.shotPower}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Substitution Choice Sub-modal / Panel */}
      {selectedSubOutId && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(3, 3, 7, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', background: 'rgba(10,20,38,0.95)', border: '1px solid rgba(20,241,149,0.3)', borderRadius: '20px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '0.95rem' }}>🧠 Elegir suplente de la reserva NFT</h4>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Reemplaza al jugador titular por uno de tus reservas con stamina al 100%.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {reserves.map((p) => (
                <button
                  key={p.playerId}
                  onClick={() => handleSubSelect(p)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                  <span style={{ color: 'var(--primary-neon)' }}>🔋 {Math.round((p.stamina / 255) * 100)}%</span>
                </button>
              ))}
              {reserves.length === 0 && (
                <div style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>
                  No tienes suplentes disponibles.
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-outline-red"
                onClick={() => setSelectedSubOutId(null)}
                style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '6px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Result Overlay Modal */}
      {showResultModal && state && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(3, 3, 7, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 11,
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '450px',
            background: 'rgba(10,20,38,0.95)',
            border: `2px solid ${state.homeScore > state.awayScore ? 'var(--primary-neon)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '24px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: state.homeScore > state.awayScore ? '0 10px 40px rgba(20,241,149,0.2)' : 'none'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {state.homeScore > state.awayScore ? '🏆' : '🏁'}
            </div>
            <h2 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
              {state.homeScore > state.awayScore ? '¡Victoria Táctica!' : 'Fin del Partido'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Marcador Final
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Local</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{state.homeScore}</div>
              </div>
              <div style={{ fontSize: '1.5rem', color: '#64748b' }}>vs</div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Rival</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{state.awayScore}</div>
              </div>
            </div>

            {/* Stakes Result Rewards */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.8rem',
              lineHeight: '1.5'
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>Recompensas Otorgadas:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-neon)' }}>
                <span>💰 Token Rewards:</span>
                <span style={{ fontWeight: 'bold' }}>{state.homeScore > state.awayScore ? '+120 $GCH' : '+0 $GCH'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9945ff' }}>
                <span>🎖️ Reputación de Manager:</span>
                <span style={{ fontWeight: 'bold' }}>{state.homeScore > state.awayScore ? '+25 EXP' : '+5 EXP'}</span>
              </div>
            </div>

            <button
              className="btn-neon-green"
              onClick={() => setShowResultModal(false)}
              style={{ width: '100%', padding: '10px', fontSize: '0.8rem', borderRadius: '10px', fontWeight: 'bold' }}
            >
              Entendido 🎮
            </button>
          </div>
        </div>
      )}

    </div>
  );
}