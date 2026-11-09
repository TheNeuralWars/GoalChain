import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ConnectButton } from '../wallet/ConnectButton';
import { PlayNav, PlayBottomTab } from './PlayNav';
import { LanguageToggle } from '../components/LanguageToggle';
import { ModalRoot } from './ModalRoot';
import { Toaster } from './Toaster';
import { MARKETING_BASE, getLocalizedMarketingUrl } from '../config/playNav';
import { useTranslation } from '../i18n';
import { AICoach } from './AICoach';

export function PlayLayout() {
  const { t, language } = useTranslation();
  const location = useLocation();
  const [ugcMode, setUgcMode] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      return true;
    }
    const saved = localStorage.getItem('gc_nav_collapsed');
    return saved === null ? window.innerWidth < 1280 : saved === '1';
  });
  // drawerOpen sólo activa el overlay flotante (scrim + drawer fijo) en tablet.
  // NO controla el modo de rejilla — eso queda en CSS vía --gc-shell-cols (D1).
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('gc_nav_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    if (window.innerWidth < 1280) {
      setCollapsed(true);
      setDrawerOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (window.innerWidth < 1280) {
          setCollapsed(true);
        }
        setDrawerOpen(false);
        setCoachOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
      <a className="skip-link" href="#main">{t('layout_skip_content')}</a>

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

      {/* Columna principal: header + contenido + footer */}
      <div className="play-main">
        <header className="play-header">
          <div className="play-header-brand">
            <Link to="/" className="play-header-brand-link">
              <img src="/favicon.png" alt="" className="play-header-brand-logo" width="22" height="22" aria-hidden />
              <span className="play-header-brand-text">
                Goal<span className="play-header-brand-accent">World</span>
                <span className="play-header-brand-sub"> · Matchday Lab</span>
              </span>
            </Link>
            <span className="play-header-devnet-pill" title={t('layout_devnet_title')}>
              <span className="play-header-devnet-dot" aria-hidden />
              {t('layout_devnet_pill')}
            </span>
          </div>
          <div className="play-header-actions">
            <button
              type="button"
              className="play-header-ugc-btn"
              onClick={() => setUgcMode(true)}
            >
              {t('play_ugc_mode') || '📱 UGC Mode (9:16)'}
            </button>
            <a
              href={getLocalizedMarketingUrl('/', language)}
              className="play-header-marketing-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('nav_full_site') || 'GoalWorld.fun'} ↗
            </a>
            <LanguageToggle />
            <ConnectButton />
          </div>
        </header>

        <main id="main" className="play-body">
          <Outlet />
        </main>

        <footer className="play-footer" aria-label="GoalWorld Matchday Lab footer">
          <div className="play-footer-inner">
            <div className="play-footer-brand">
              <strong>{t('layout_footer_brand')}</strong>
              <span>{t('layout_footer_note')}</span>
            </div>
            <nav className="play-footer-links" aria-label="GoalWorld universe links">
              <a href={getLocalizedMarketingUrl('/', language)} target="_blank" rel="noopener noreferrer">{t('layout_footer_hub')} ↗</a>
              <a href={getLocalizedMarketingUrl('/book.html', language)} target="_blank" rel="noopener noreferrer">{t('layout_footer_book')} ↗</a>
              <a href={getLocalizedMarketingUrl('/cinema.html', language)} target="_blank" rel="noopener noreferrer">{t('layout_footer_cinema')} ↗</a>
              <a href={getLocalizedMarketingUrl('/privacy.html', language)} target="_blank" rel="noopener noreferrer">{t('layout_footer_privacy')} ↗</a>
              <a href={getLocalizedMarketingUrl('/terms.html', language)} target="_blank" rel="noopener noreferrer">{t('layout_footer_terms')} ↗</a>
            </nav>
          </div>
        </footer>
      </div>

      {/* Bottom-tab bar (móvil) */}
      <PlayBottomTab />

      {/* Floating Exit Button for UGC Mode */}
      {ugcMode && (
        <button
          type="button"
          className="play-ugc-exit-btn"
          onClick={() => setUgcMode(false)}
        >
          {t('play_ugc_exit' as never) || '❌ Exit UGC Mode'}
        </button>
      )}

      {/* Modales de arcade anclados al layout */}
      <ModalRoot />
      {/* Notificaciones de eventos de juego */}
      <Toaster />
      <Analytics />

      {/* Floating Eliza chatbot button & drawer */}
      <button
        type="button"
        onClick={() => setCoachOpen(!coachOpen)}
        className="gc-floating-coach-btn"
        aria-label={t('play_coach_open' as never) || 'Ask Eliza AI Coach'}
        title={t('play_coach_open' as never) || 'Ask Eliza AI Coach'}
      >
        🤖
      </button>

      <div className={`gc-coach-drawer ${coachOpen ? 'open' : ''}`}>
        <div className="gc-coach-drawer-head">
          <span className="gc-coach-drawer-title">{t('play_coach_title' as never) || '🤖 Eliza AI Tactical Assistant'}</span>
          <button
            type="button"
            className="gc-coach-drawer-close"
            onClick={() => setCoachOpen(false)}
            aria-label="Close AI Coach"
          >
            ×
          </button>
        </div>
        <div className="gc-coach-drawer-body">
          <AICoach />
        </div>
      </div>
    </div>
  );
}
