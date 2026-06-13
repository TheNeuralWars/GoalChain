import React, { lazy, Suspense, useState } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';
import { useTranslation } from '../i18n';

const TradingTerminal = lazy(() => import('./TradingTerminal').then(m => ({ default: m.TradingTerminal })));
const SwarmVaults = lazy(() => import('./SwarmVaults').then(m => ({ default: m.SwarmVaults })));

export function DeFiPortal() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'trading' | 'vaults'>('trading');

  const tabs = [
    { id: 'trading', labelKey: 'portal_defi', descKey: 'defi_vaults_desc' },
    { id: 'vaults', labelKey: 'defi_vaults_label', descKey: 'defi_vaults_desc' },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge portal-badge--defi">DEFI PORTAL</div>
        <SimulationBadge />
        <h1>Terminal Financiera</h1>
        <p className="portal-honesty-note">
          {t('defi_simulation_note')}
        </p>
        <p className="portal-subtitle">
          {t('defi_maximize_yield')}
        </p>

        {/* Glassmorphic Tabs Navigation */}
        <div className="portal-tabs portal-tabs--two-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`portal-tab-btn portal-tab-btn--defi ${activeSubTab === tab.id ? 'portal-tab-btn--active' : ''}`}
            >
              <span className="tab-label">{t(tab.labelKey as any)}</span>
              <span className="tab-desc">{t(tab.descKey as any)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="portal-content-wrapper">
        {activeSubTab === 'trading' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('defi_loading_trading')}</div>}>
              <TradingTerminal />
            </Suspense>
          </div>
        )}
        {activeSubTab === 'vaults' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('defi_loading_vaults')}</div>}>
              <SwarmVaults />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
