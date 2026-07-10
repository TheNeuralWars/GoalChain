import React, { lazy, Suspense, useState } from 'react';
import { LiveEventFeed } from './LiveEventFeed';
import { useTranslation } from 'react-i18next';

const FixturesPanel = lazy(() => import('./FixturesPanel').then(m => ({ default: m.FixturesPanel })));
const AICommentator = lazy(() => import('./AICommentator').then(m => ({ default: m.AICommentator })));
const WorldCupPredictor = lazy(() => import('./WorldCupPredictor').then(m => ({ default: m.WorldCupPredictor })));
const MatchSimulator = lazy(() => import('./MatchSimulator').then(m => ({ default: m.MatchSimulator })));

export function EstadioPortal() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'fixtures' | 'commentator' | 'feed' | 'predictor' | 'simulator'>('fixtures');

  const tabs = [
    { id: 'fixtures',   label: t('estadio_portal.tabs.fixtures.label'),    desc: t('estadio_portal.tabs.fixtures.desc') },
    { id: 'simulator', label: t('estadio_portal.tabs.simulator.label'),    desc: t('estadio_portal.tabs.simulator.desc') },
    { id: 'predictor', label: t('estadio_portal.tabs.predictor.label'),   desc: t('estadio_portal.tabs.predictor.desc') },
    { id: 'commentator', label: t('estadio_portal.tabs.commentator.label'),            desc: t('estadio_portal.tabs.commentator.desc') },
    { id: 'feed',      label: t('estadio_portal.tabs.feed.label'),          desc: t('estadio_portal.tabs.feed.desc') },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge">{t('estadio_portal.badge')}</div>
        <h1>{t('estadio_portal.title')}</h1>
        <p className="portal-subtitle">
          {t('estadio_portal.subtitle')}
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
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal.loading.fixtures')}</div>}>
              <FixturesPanel />
            </Suspense>
          </div>
        )}
        {activeSubTab === 'commentator' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal.loading.commentator')}</div>}>
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
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal.loading.predictor')}</div>}>
              <WorldCupPredictor />
            </Suspense>
          </div>
        )}
        {activeSubTab === 'simulator' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>{t('estadio_portal.loading.simulator')}</div>}>
              <MatchSimulator />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}