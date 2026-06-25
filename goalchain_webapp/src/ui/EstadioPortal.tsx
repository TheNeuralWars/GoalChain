import React, { lazy, Suspense, useState } from 'react';
import { LiveEventFeed } from './LiveEventFeed';

const FixturesPanel = lazy(() => import('./FixturesPanel').then(m => ({ default: m.FixturesPanel })));
const AICommentator = lazy(() => import('./AICommentator').then(m => ({ default: m.AICommentator })));
const WorldCupPredictor = lazy(() => import('./WorldCupPredictor').then(m => ({ default: m.WorldCupPredictor })));

export function EstadioPortal() {
  const [activeSubTab, setActiveSubTab] = useState<'fixtures' | 'commentator' | 'feed' | 'predictor'>('fixtures');

  const tabs = [
    { id: 'fixtures', label: '🏟️ Partidos y Apuestas', desc: 'Mercados on-chain de la Copa del Mundo' },
    { id: 'commentator', label: '📻 Cronista IA', desc: 'Narración inteligente en vivo generada por IA' },
    { id: 'feed', label: '⚡ Eventos en Vivo', desc: 'Feed de actividades y transacciones en tiempo real' },
    { id: 'predictor', label: '🔮 Centro de Predicciones', desc: 'Simulaciones, H2H y Pick\'em del Mundial 2026' },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge">ESTADIO PORTAL</div>
        <h1>El Corazón del Juego</h1>
        <p className="portal-subtitle">
          Sigue los partidos de la Copa del Mundo GoalChain 2026, interactúa con el Cronista IA y haz tus jugadas.
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
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Cargando partidos...</div>}>
              <FixturesPanel />
            </Suspense>
          </div>
        )}
        {activeSubTab === 'commentator' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Cargando comentarista...</div>}>
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
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Cargando predicciones...</div>}>
              <WorldCupPredictor />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
