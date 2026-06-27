import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PlayNav, PlayBottomTab } from './PlayNav';
import { ModalRoot } from './ModalRoot';
import { Toaster } from './Toaster';
import { MARKETING_BASE } from '../config/playNav';
import { useTranslation } from '../i18n';
import { AICoach } from './AICoach';

export function PlayLayout() {
  const { t } = useTranslation();
  const [ugcMode, setUgcMode] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('gc_nav_collapsed');
    return saved === null ? window.innerWidth < 1280 : saved === '1';
  });
  // drawerOpen sólo activa el overlay flotante (scrim + drawer fijo) en tablet.
  // NO controla el modo de rejilla — eso queda en CSS vía --gc-shell-cols (D1).
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('gc_nav_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  // Listener de resize con debounce: mantiene `collapsed` coherente al cambiar
  // de breakpoint (hoy sólo se inicializa desde innerWidth y nunca se actualiza).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.innerWidth < 1280) {
          setCollapsed(true);
          setDrawerOpen(false);
        } else {
          setDrawerOpen(false);
        }
      }, 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, []);

  // Wrapper: al expandir el rail por debajo de 1280px, abrir también el overlay.
  const handleToggleCollapse = (next: boolean | ((prev: boolean) => boolean)) => {
    setCollapsed((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      if (!resolved && window.innerWidth < 1280) {
        setDrawerOpen(true); // rail abierto en tablet → mostrar scrim + drawer
      } else if (resolved) {
        setDrawerOpen(false); // rail colapsado → cerrar overlay
      }
      return resolved;
    });
  };

  return (
    <div className={`play-shell play-shell--grid ${collapsed ? 'play-shell--collapsed' : 'play-shell--expanded'} ${drawerOpen ? 'play-shell--drawer-open' : ''} ${ugcMode ? 'ugc-active' : ''}`}>
      {/* Sidebar / icon-rail (desktop + tablet) */}
      <PlayNav collapsed={collapsed} setCollapsed={handleToggleCollapse} />

      {/* Scrim: cortina bajo el cajón flotante (click para cerrar) */}
      {drawerOpen && (
        <div
          className="gc-rail-scrim"
          onClick={() => {
            setDrawerOpen(false);
            setCollapsed(true);
          }}
          aria-hidden
        />
      )}

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
            <button 
              className="play-header-ugc-btn"
              onClick={() => setUgcMode(true)}
              style={{
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
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(20, 241, 149, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(20, 241, 149, 0.1)'}
            >
              📱 Modo UGC (9:16)
            </button>
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

      {/* Floating Exit Button for UGC Mode */}
      {ugcMode && (
        <button
          onClick={() => setUgcMode(false)}
          style={{
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
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ❌ Salir Modo UGC
        </button>
      )}

      {/* Modales de arcade anclados al layout */}
      <ModalRoot />
      {/* Notificaciones de eventos de juego */}
      <Toaster />
      <Analytics />

      {/* Floating Eliza chatbot button & drawer */}
      <button
        onClick={() => setCoachOpen(!coachOpen)}
        className="gc-floating-coach-btn"
        title="Consultar Eliza AI Coach"
      >
        🤖
      </button>

      <div className={`gc-coach-drawer ${coachOpen ? 'open' : ''}`}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(153, 69, 255, 0.1)'
        }}>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>🤖 Asistente Táctico AI Eliza</span>
          <button
            onClick={() => setCoachOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: 0
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <AICoach />
        </div>
      </div>
    </div>
  );
}
