import React, { useState } from 'react';
import { FixturesPanel } from './FixturesPanel';
import { AICommentator } from './AICommentator';
import { LiveEventFeed } from './LiveEventFeed';

export function EstadioPortal() {
  const [activeSubTab, setActiveSubTab] = useState<'fixtures' | 'commentator' | 'feed'>('fixtures');

  const tabs = [
    { id: 'fixtures', label: '🏟️ Partidos y Apuestas', desc: 'Mercados on-chain de la Copa del Mundo' },
    { id: 'commentator', label: '📻 Cronista IA', desc: 'Narración inteligente en vivo generada por IA' },
    { id: 'feed', label: '⚡ Eventos en Vivo', desc: 'Feed de actividades y transacciones en tiempo real' },
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
            <FixturesPanel />
          </div>
        )}
        {activeSubTab === 'commentator' && (
          <div className="portal-fade-in">
            <AICommentator />
          </div>
        )}
        {activeSubTab === 'feed' && (
          <div className="portal-fade-in">
            <LiveEventFeed />
          </div>
        )}
      </div>
    </div>
  );
}
