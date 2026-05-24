import React from 'react';
import { Link } from 'react-router-dom';
import { FixturesPanel } from './FixturesPanel';
import { TradingTerminal } from './TradingTerminal';
import { SquadGallery } from './SquadGallery';
import { LiveEventFeed } from './LiveEventFeed';
import { AICommentator } from './AICommentator';
import { SwarmVaults } from './SwarmVaults';
import { OpsStatusPanel } from './OpsStatusPanel';

const ProductScopeBanner = () => (
  <div className="product-scope-banner">
    <span className="product-scope-banner-icon" aria-hidden>
      ⚠️
    </span>
    <div>
      <h4>Official Transactional Frontend</h4>
      <p>
        Cliente transaccional en devnet. Para el hub completo (AI Agent, Minigames, 3D Gallery,
        Manager Office…){' '}
        <Link to="/hub">Classic Hub (9 pestañas) →</Link>
      </p>
    </div>
  </div>
);

/** Dense two-column glass dashboard (Antigravity polish era, pre hub-cards). */
export function DashboardGrid() {
  return (
    <>
      <ProductScopeBanner />
      <OpsStatusPanel />
      <main className="dashboard-grid">
        <div className="dashboard-grid-col">
          <FixturesPanel />
          <SquadGallery />
          <SwarmVaults />
        </div>
        <div className="dashboard-grid-col">
          <TradingTerminal />
          <AICommentator />
          <LiveEventFeed />
        </div>
      </main>
    </>
  );
}
