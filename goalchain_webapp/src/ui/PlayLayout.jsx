import React, { useEffect, useState } from 'react';
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
    const [ugcMode, setUgcMode] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('gc_nav_collapsed');
        return saved === null ? window.innerWidth < 1280 : saved === '1';
    });
    useEffect(() => {
        localStorage.setItem('gc_nav_collapsed', collapsed ? '1' : '0');
    }, [collapsed]);
    return (<div className={`play-shell play-shell--grid ${collapsed ? 'play-shell--collapsed' : 'play-shell--expanded'} ${ugcMode ? 'ugc-active' : ''}`}>
      {/* Sidebar / icon-rail (desktop + tablet) */}
      <PlayNav collapsed={collapsed} setCollapsed={setCollapsed}/>

      {/* Columna principal: header + contenido + footer móvil */}
      <div className="play-main">
        <header className="play-header">
          <div className="play-header-brand">
            <span className="play-header-brand-mark" aria-hidden>⚽</span>
            <span className="play-header-brand-text">
              {t('nav_app_title') || 'GoalChain Play'}
            </span>
          </div>
          <div className="play-header-actions">
            <button className="play-header-ugc-btn" onClick={() => setUgcMode(true)} style={{
            background: 'rgba(20, 241, 149, 0.1)',
            border: '1px solid var(--primary-neon)',
            color: 'var(--primary-neon)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            marginRight: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.2s, transform 0.1s'
        }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(20, 241, 149, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(20, 241, 149, 0.1)'}>
              📱 Modo UGC (9:16)
            </button>
            <a href={MARKETING_BASE} className="play-header-marketing-link" target="_blank" rel="noopener noreferrer">
              {t('nav_full_site') || 'Full site'} ↗
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

      {/* Floating Exit Button for UGC Mode */}
      {ugcMode && (<button onClick={() => setUgcMode(false)} style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 999999,
                background: 'var(--primary-neon)',
                border: 'none',
                color: '#000',
                padding: '10px 18px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(20, 241, 149, 0.4)',
                transition: 'transform 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          ❌ Salir Modo UGC
        </button>)}

      {/* Modales de arcade anclados al layout */}
      <ModalRoot />
      {/* Notificaciones de eventos de juego */}
      <Toaster />
      <Analytics />
    </div>);
}
