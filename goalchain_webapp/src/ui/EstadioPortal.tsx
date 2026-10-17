import React, { Suspense, useEffect, useState } from 'react';
import { useTranslation } from '../i18n/index';
import { WalletRequired } from '../wallet/gate';
import { lazyRoute, prefetchOnIdle } from './routeChunk';

// Sub-panels are lazy: each lands in an on-demand chunk. lazyRoute keeps them
// prefetchable (auto-improve 2026-10-17) — see the mount effect below.
const FixturesPanel = lazyRoute(() => import('./FixturesPanel').then(m => ({ default: m.FixturesPanel })));
const AICommentator = lazyRoute(() => import('./AICommentator').then(m => ({ default: m.AICommentator })));
const WorldCupPredictor = lazyRoute(() => import('./WorldCupPredictor').then(m => ({ default: m.WorldCupPredictor })));
const MatchSimulator = lazyRoute(() => import('./MatchSimulator').then(m => ({ default: m.MatchSimulator })));
const LiveEventFeed = lazyRoute(() => import('./LiveEventFeed').then(m => ({ default: m.LiveEventFeed })));

export function EstadioPortal() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'fixtures' | 'commentator' | 'feed' | 'predictor' | 'simulator'>('fixtures');

  useEffect(() => {
    // Default panel: prefetch at mount, in parallel with the wallet stack that
    // <WalletRequired> kicks off in the same commit — otherwise FixturesPanel
    // only starts fetching after the wallet chunk is done (serial waterfall,
    // the same one fixed for /perfil/:username on 2026-10-15).
    FixturesPanel.prefetch();
    // Sibling panels: warm on idle so tab switches are instant without
    // contending with the portal's first render or the default panel's fetch.
    prefetchOnIdle([MatchSimulator, WorldCupPredictor, AICommentator, LiveEventFeed]);
  }, []);

  const tabs = [
    { id: 'fixtures',   label: t('estadio_portal_tabs_fixtures_label'),    desc: t('estadio_portal_tabs_fixtures_desc') },
    { id: 'simulator', label: t('estadio_portal_tabs_simulator_label'),    desc: t('estadio_portal_tabs_simulator_desc') },
    { id: 'predictor', label: t('estadio_portal_tabs_predictor_label'),   desc: t('estadio_portal_tabs_predictor_desc') },
    { id: 'commentator', label: t('estadio_portal_tabs_commentator_label'),            desc: t('estadio_portal_tabs_commentator_desc') },
    { id: 'feed',      label: t('estadio_portal_tabs_feed_label'),          desc: t('estadio_portal_tabs_feed_desc') },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge">{t('estadio_portal_badge')}</div>
        <h1>{t('estadio_portal_title')}</h1>
        <p className="portal-subtitle">
          {t('estadio_portal_subtitle')}
        </p>

        {/* Glassmorphic Tabs Navigation */}
        <div className="portal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`portal-tab-btn ${activeSubTab === tab.id ? 'portal-tab-btn--active' : ''}`}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-desc">{tab.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="portal-content-wrapper">
        {activeSubTab === 'fixtures' && (
          <div className="portal-fade-in">
            <WalletRequired fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal_loading_fixtures')}</div>}>
              <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal_loading_fixtures')}</div>}>
                <FixturesPanel />
              </Suspense>
            </WalletRequired>
          </div>
        )}
        {activeSubTab === 'commentator' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal_loading_commentator')}</div>}>
              <AICommentator />
            </Suspense>
          </div>
        )}
        {activeSubTab === 'feed' && (
          <div className="portal-fade-in">
            <WalletRequired>
              <Suspense fallback={<div className="wallet-gate-loading">Loading live feed…</div>}>
                <LiveEventFeed />
              </Suspense>
            </WalletRequired>
          </div>
        )}
        {activeSubTab === 'predictor' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal_loading_predictor')}</div>}>
              <WorldCupPredictor />
            </Suspense>
          </div>
        )}
        {activeSubTab === 'simulator' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal_loading_simulator')}</div>}>
              <MatchSimulator />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}