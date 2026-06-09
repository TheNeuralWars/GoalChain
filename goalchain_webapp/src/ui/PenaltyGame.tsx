import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../i18n';

interface PenaltyState {
  bag: number;
  streak: number;
  dailyProgress: number;
  lastDailyReset: number;
  goals: number;
  saves: number;
}

const GOAL_ZONES = [
  { id: 0, x: 15, y: 65, label: 'TL' },
  { id: 1, x: 50, y: 55, label: 'TC' },
  { id: 2, x: 85, y: 65, label: 'TR' },
  { id: 3, x: 20, y: 85, label: 'ML' },
  { id: 4, x: 50, y: 80, label: 'MC' },
  { id: 5, x: 80, y: 85, label: 'MR' },
  { id: 6, x: 25, y: 95, label: 'BL' },
  { id: 7, x: 50, y: 95, label: 'BC' },
  { id: 8, x: 75, y: 95, label: 'BR' },
];

const BET_OPTIONS = [10, 50, 100];
const DAILY_TARGET = 5;
const DAILY_REWARD = 250;
const REFUEL_AMOUNT = 1000;

const STORAGE_KEY = 'goalchain_penalty_state';

const DEFAULT_STATE: PenaltyState = {
  bag: 1000,
  streak: 0,
  dailyProgress: 0,
  lastDailyReset: Date.now(),
  goals: 0,
  saves: 0,
};

export function PenaltyGame() {
  const { t } = useTranslation();
  const [state, setState] = useState<PenaltyState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('goalchain_penalty_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          const now = Date.now();
          const lastReset = parsed.lastDailyReset || 0;
          const isNewDay = new Date(now).toDateString() !== new Date(lastReset).toDateString();
          if (isNewDay) {
            return { ...DEFAULT_STATE, ...parsed, dailyProgress: 0, lastDailyReset: now };
          }
          return { ...DEFAULT_STATE, ...parsed };
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_STATE;
  });
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [gkZone, setGkZone] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState<'goal' | 'save' | null>(null);
  const [showDailyComplete, setShowDailyComplete] = useState(false);
  const [message, setMessage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('goalchain_penalty_state', JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  useEffect(() => {
    const now = Date.now();
    const lastReset = state.lastDailyReset || 0;
    const isNewDay = new Date(now).toDateString() !== new Date(lastReset).toDateString();
    if (isNewDay && state.dailyProgress > 0) {
      setState(prev => ({
        ...prev,
        dailyProgress: 0,
        lastDailyReset: now,
        streak: 0,
      }));
      setShowDailyComplete(false);
    }
  }, []);

  useEffect(() => {
    if (state.dailyProgress >= 5 && !showDailyComplete) {
      setShowDailyComplete(true);
      setTimeout(() => setShowDailyComplete(false), 5000);
    }
  }, [state.dailyProgress, showDailyComplete]);

  const saveState = useCallback((newState: Partial<PenaltyState>) => {
    setState(prev => {
      const next = { ...prev, ...newState };
      try {
        localStorage.setItem('goalchain_penalty_state', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const handleShoot = useCallback((zoneIndex: number) => {
    if (animating || state.bag < betAmount) return;

    const bet = betAmount;
    const gk = Math.floor(Math.random() * 9);
    const isGoal = zoneIndex !== gk;

    setAnimating(true);
    setSelectedZone(zoneIndex);
    setGkZone(gk);
    setResult(isGoal ? 'goal' : 'save');

    setTimeout(() => {
      saveState({
        bag: state.bag - bet + (isGoal ? bet * 2 : 0),
        streak: isGoal ? state.streak + 1 : 0,
        dailyProgress: isGoal ? state.dailyProgress + 1 : state.dailyProgress,
        goals: isGoal ? state.goals + 1 : state.goals,
        saves: !isGoal ? state.saves + 1 : state.saves,
      });

      if (isGoal) {
        setMessage('GOAL! ⚽ +' + (bet * 2) + ' GCH');
      } else {
        setMessage('SAVED! 🧤 -' + bet + ' GCH');
      }

      setAnimating(false);
      setSelectedZone(null);
      setGkZone(null);
      setResult(null);
    }, 1500);
  }, [state.bag, state.dailyProgress, betAmount, state.streak]);

  const handleRefuel = useCallback(() => {
    saveState({ bag: state.bag + 1000 });
    setMessage('🔋 Refueled! +1000 GCH');
  }, [state.bag]);

  const resetStats = useCallback(() => {
    saveState({
      bag: 1000,
      streak: 0,
      dailyProgress: 0,
      lastDailyReset: Date.now(),
      goals: 0,
      saves: 0,
    });
    setMessage('Stats reset!');
  }, []);

  const shootMessage = t('game_on_field') || 'On the field:';
  const isDailyComplete = state.dailyProgress >= 5;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚽ {t('game_title') || 'Penalty Mini-Game'}
          </h2>
          <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
            {t('game_sub') || 'Test the shooting mechanics designed for PSG1 directly from your browser.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={resetStats}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: 'rgba(255,75,75,0.2)',
              color: '#ff4b4b',
              border: '1px solid rgba(255,75,75,0.3)',
            }}
          >
            🔄 {t('game_reset_btn') || 'Reset Stats'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
      <StatCard label={t('game_bag_label') || 'YOUR BAG'} value={state.bag.toLocaleString() + ' GCH'} color="var(--primary-neon)" icon="💰" />
        <StatCard label={t('stat_goals') || 'GOALS'} value={state.goals} color="var(--accent-red)" icon="⚽" />
        <StatCard label={t('stat_saves') || 'SAVES'} value={state.saves} color="var(--secondary-neon)" icon="🧤" />
        <StatCard label={t('stat_streak') || 'STREAK'} value={state.streak} color="var(--gold)" icon="🔥" />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          {t('game_bet_label') || 'BET PER SHOT:'}
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[10, 50, 100].map(amount => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              disabled={state.bag < amount || animating}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: state.bag < amount || animating ? 'not-allowed' : 'pointer',
                opacity: state.bag < amount || animating ? 0.5 : 1,
                background: betAmount === amount ? 'var(--primary-neon)' : 'rgba(255,255,255,0.05)',
                color: betAmount === amount ? '#000' : '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
              }}
            >
              {amount} GCH
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={handleRefuel}
          disabled={animating}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: animating ? 'not-allowed' : 'pointer',
            opacity: animating ? 0.6 : 1,
            background: 'var(--secondary-neon)',
            color: '#000',
            border: 'none',
          }}
        >
          ⛽ Refuel +1000 GCH
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <canvas
          ref={canvasRef}
          width={360}
          height={480}
          style={{
            width: '100%',
            maxWidth: '360px',
            height: 'auto',
            borderRadius: '12px',
            background: 'linear-gradient(180deg, #1a3a2a 0%, #0d1f1a 100%)',
            border: '2px solid rgba(20, 241, 149, 0.3)',
            boxShadow: '0 0 30px rgba(20, 241, 149, 0.1)',
          }}
        />
        <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          {message && <div style={{ color: 'var(--primary-neon)', fontWeight: 700, fontSize: '0.9rem', textShadow: '0 0 10px var(--primary-neon)' }}>{message}</div>}
          {animating && <div style={{ color: '#fff', fontSize: '0.8rem', marginTop: '0.5rem' }}>On the field...</div>}
        </div>
      </div>

      <div
        style={{
          background: state.dailyProgress >= 5
            ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))'
            : 'rgba(20, 241, 149, 0.05)',
          border: state.dailyProgress >= 5
            ? '1px solid rgba(255,215,0,0.3)'
            : '1px solid rgba(20, 241, 149, 0.2)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 800, color: state.dailyProgress >= 5 ? '#ffd700' : 'var(--primary-neon)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
            {state.dailyProgress >= 5 ? '✅ DAILY COMPLETE!' : '🎯 DAILY CHALLENGE'}
          </span>
          {state.dailyProgress >= 5 && (
            <span style={{ background: '#ffd700', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800 }}>
              +250 GCH
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>
          DAILY CHALLENGE: 5 goals in a row today
        </div>
        <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: Math.min((state.dailyProgress / 5) * 100, 100) + '%',
              height: '100%',
              background: state.dailyProgress >= 5
                ? 'linear-gradient(90deg, #ffd700, #ffaa00)'
                : 'linear-gradient(90deg, var(--primary-neon), var(--secondary-neon))',
              borderRadius: '4px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', opacity: 0.6 }}>
          <span>Progress: {state.dailyProgress} / 5</span>
          <span>Reward: 250 GCH</span>
        </div>
      </div>

      <div style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'center', marginBottom: '1rem' }}>
        Zones: TL TC TR | ML MC MR | BL BC BR &nbsp;|&nbsp; Click a zone to shoot
      </div>

      {isDailyComplete && (
        <div className="modal-overlay" onClick={() => setShowDailyComplete(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div className="modal-content" onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{
            width: '100%', maxWidth: '400px', background: 'linear-gradient(180deg, #0a0a14 0%, #0d0d1a 100%)',
            border: '1px solid rgba(255,215,0,0.3)', borderRadius: '20px', padding: '2rem', textAlign: 'center',
            boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffd700' }}>DAILY CHALLENGE COMPLETE!</h3>
            <p style={{ opacity: 0.8, marginBottom: '1rem' }}>You scored 5 goals in a row!</p>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffd700', marginBottom: '1.5rem' }}>
              +250 GCH
            </div>
            <button
              onClick={() => setShowDailyComplete(false)}
              style={{
                padding: '0.75rem 2rem', borderRadius: '8px', background: 'var(--primary-neon)',
                color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer',
              }}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}30`, borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{icon}</div>
      <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.3rem', fontWeight: 900, color, fontFamily: 'monospace' }}>
        {value}
      </div>
    </div>
  );
}