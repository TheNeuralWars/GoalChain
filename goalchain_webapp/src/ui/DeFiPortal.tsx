import React, { lazy, Suspense, useState } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';

const TradingTerminal = lazy(() => import('./TradingTerminal').then(m => ({ default: m.TradingTerminal })));
const SwarmVaults = lazy(() => import('./SwarmVaults').then(m => ({ default: m.SwarmVaults })));

export function DeFiPortal() {
  const [activeSubTab, setActiveSubTab] = useState<'trading' | 'vaults'>('trading');

  const tabs = [
    { id: 'trading', label: '💱 Vibe Swap & Trading', desc: 'Negocia tokens y activa vibe bots' },
    { id: 'vaults', label: '🏦 Swarm Yield Vaults', desc: 'Estrategias de liquidez con agentes autónomos' },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge portal-badge--defi">DEFI PORTAL</div>
        <SimulationBadge />
        <h1>Terminal Financiera</h1>
        <p className="portal-honesty-note">
          Demostración visual — sin transacciones on-chain hasta post-Mundial 2026.
        </p>
        <p className="portal-subtitle">
          Maximiza el rendimiento de tu club con arbitraje inteligente, vaults autónomas y liquidez automatizada.
        </p>

        {/* Glassmorphic Tabs Navigation */}
        <div className="portal-tabs portal-tabs--two-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`portal-tab-btn portal-tab-btn--defi ${activeSubTab === tab.id ? 'portal-tab-btn--active' : ''}`}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-desc">{tab.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="portal-content-wrapper">
        {activeSubTab === 'trading' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Cargando terminal...</div>}>
              <TradingTerminal />
            </Suspense>
          </div>
        )}
        {activeSubTab === 'vaults' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Cargando vaults...</div>}>
              <SwarmVaults />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
