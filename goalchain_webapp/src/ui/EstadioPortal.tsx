import React, { lazy, Suspense, useState } from 'react';
import { LiveEventFeed } from './LiveEventFeed';
import { useTranslation } from '../i18n/index';

const FixturesPanel = lazy(() => import('./FixturesPanel').then(m => ({ default: m.FixturesPanel })));
const AICommentator = lazy(() => import('./AICommentator').then(m => ({ default: m.AICommentator })));
const WorldCupPredictor = lazy(() => import('./WorldCupPredictor').then(m => ({ default: m.WorldCupPredictor })));
const MatchSimulator = lazy(() => import('./MatchSimulator').then(m => ({ default: m.MatchSimulator })));

export function EstadioPortal() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'fixtures' | 'commentator' | 'feed' | 'predictor' | 'simulator'>('fixtures');

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
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal_loading_fixtures')}</div>}>
              <FixturesPanel />
            </Suspense>
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
            <LiveEventFeed />
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