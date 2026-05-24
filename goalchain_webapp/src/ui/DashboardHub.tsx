import React from 'react';
import { Link } from 'react-router-dom';
import { PLAY_SECTIONS } from '../config/playNav';
import { OpsStatusPanel } from './OpsStatusPanel';

const SECTION_BLURBS: Record<string, string> = {
  dashboard: 'Paneles glass en dos columnas (fixtures, trading, squad…).',
  hub: 'Hub completo pre-Vercel: 9 pestañas, sidebar, AI Agent, minigames, 3D gallery.',
  ops: 'Mint gate, vault crank y estado del protocolo.',
  fixtures: 'Partidos, mercados y apuestas on-chain.',
  trading: 'Terminal de trading y cotizaciones.',
  squad: 'Tu plantilla y colección de jugadores.',
  vaults: 'Swarm vaults y yield del protocolo.',
  commentator: 'Comentarista IA en vivo.',
  feed: 'Eventos en vivo del protocolo.',
};

export function DashboardHub() {
  const cards = PLAY_SECTIONS.filter((s) => s.to && s.to !== '/');

  return (
    <div className="play-page">
      <div className="play-page-hero">
        <h1>GoalChain Alpha Dashboard</h1>
        <p className="play-page-sub">
          Protocolo SportsFi v2.0 — World Cup 2026. Cliente transaccional en devnet.
        </p>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <OpsStatusPanel />
      </div>
      <div className="play-hub-grid">
        {cards.map((section) => (
          <Link key={section.id} to={section.to!} className="play-hub-card">
            <h3>{section.label}</h3>
            <p>{SECTION_BLURBS[section.id] ?? ''}</p>
            <span className="play-hub-card-cta">Abrir →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
