import React from 'react';
import { Outlet } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PlayNav } from './PlayNav';
import { MARKETING_BASE } from '../config/playNav';

export function PlayLayout() {
  return (
    <div className="play-shell">
      <header className="play-header">
        <PlayNav />
        <div className="play-header-actions">
          <a
            href={MARKETING_BASE}
            className="play-header-marketing-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sitio completo ↗
          </a>
          <WalletMultiButton />
        </div>
      </header>
      <div className="play-body">
        <Outlet />
      </div>
      <Analytics />
    </div>
  );
}
