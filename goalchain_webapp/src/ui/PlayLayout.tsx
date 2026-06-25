import React from 'react';
import { Outlet } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PlayNav, PlayBottomTab } from './PlayNav';
import { ModalRoot } from './ModalRoot';
import { Toaster } from './Toaster';
import { MARKETING_BASE } from '../config/playNav';
import { useTranslation } from '../i18n';

export function PlayLayout() {
  const { t } = useTranslation();
  return (
    <div className="play-shell play-shell--grid">
      {/* Sidebar / icon-rail (desktop + tablet) */}
      <PlayNav />

      {/* Columna principal: header + contenido + footer móvil */}
      <div className="play-main">
        <header className="play-header">
          <div className="play-header-brand">
            <span className="play-header-brand-mark" aria-hidden>⚽</span>
            <span className="play-header-brand-text">
              {t('nav_app_title' as never) || 'GoalChain Play'}
            </span>
          </div>
          <div className="play-header-actions">
            <a
              href={MARKETING_BASE}
              className="play-header-marketing-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('nav_full_site' as never) || 'Full site'} ↗
            </a>
            <WalletMultiButton />
          </div>
        </header>

        <div className="play-body">
          <Outlet />
        </div>
      </div>

      {/* Bottom-tab bar (móvil) */}
      <PlayBottomTab />

      {/* Modales de arcade anclados al layout */}
      <ModalRoot />
      {/* Notificaciones de eventos de juego */}
      <Toaster />
      <Analytics />
    </div>
  );
}
