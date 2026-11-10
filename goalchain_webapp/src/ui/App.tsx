import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Link } from 'react-router-dom';

import { LanguageProvider, useTranslation } from '../i18n/index';
import type { TranslationKeys } from '../i18n/translations';
import { UserProvider } from '../contexts/UserContext';
import { WalletGateProvider, WalletGateBridge, WalletRequired } from '../wallet/gate';

import { PlayLayout } from './PlayLayout';
import { DashboardGrid } from './DashboardGrid';
import { LandingPage } from './LandingPage';
import { ClassicHub } from './ClassicHub';
import { lazyRoute } from './routeChunk';
// Heavy route portals are lazy: each lands in an on-demand chunk so the
// first-paint JS stays small (booksData.ts lore + portal bundles stay out).
// lazyRoute keeps the chunks prefetchable — see the wallet-gated pages below.
const EstadioPortal = lazyRoute(() => import('./EstadioPortal').then(m => ({ default: m.EstadioPortal })));
const DeFiPortal = lazyRoute(() => import('./DeFiPortal').then(m => ({ default: m.DeFiPortal })));
const ClubPortal = lazyRoute(() => import('./ClubPortal').then(m => ({ default: m.ClubPortal })));
const MarketingControlCenter = lazyRoute(() => import('./MarketingControlCenter').then(m => ({ default: m.MarketingControlCenter })));
const PressKit = lazyRoute(() => import('./PressKit').then(m => ({ default: m.PressKit })));
const GenesisCollectionGallery = lazyRoute(() => import('./GenesisCollectionGallery').then(m => ({ default: m.GenesisCollectionGallery })));
const CorporateAutopilot = lazyRoute(() => import('./CorporateAutopilot').then(m => ({ default: m.CorporateAutopilot })));
const TokenizedAgentsDashboard = lazyRoute(() => import('./TokenizedAgentsDashboard').then(m => ({ default: m.TokenizedAgentsDashboard })));
const GoalWorldPortal = lazyRoute(() => import('./GoalWorldPortal').then(m => ({ default: m.GoalWorldPortal })));
const KindleReader = lazyRoute(() => import('./KindleReader').then(m => ({ default: m.KindleReader })));
const AuthorStudio = lazyRoute(() => import('./AuthorStudio').then(m => ({ default: m.AuthorStudio })));
const StakingBurnDashboard = lazyRoute(() => import('./StakingBurnDashboard').then(m => ({ default: m.StakingBurnDashboard })));
// Wallet-gated pages are lazy: their @solana/* imports land in on-demand chunks.
const CreateUser = lazyRoute(() => import('./CreateUser').then(m => ({ default: m.CreateUser })));
const UserProfile = lazyRoute(() => import('./UserProfile').then(m => ({ default: m.UserProfile })));

function PlayPage({
  titleKey,
  children,
  align = 'center',
  hideHero = false,
}: {
  titleKey: keyof TranslationKeys;
  children: React.ReactNode;
  align?: 'center' | 'left';
  hideHero?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="play-page play-page--grid">
      {!hideHero && (
        <div className="play-page-hero play-page-hero--compact">
          <h1>{t(titleKey)}</h1>
        </div>
      )}
      <div className={`play-page-main play-page-main--${align}`}>{children}</div>
    </div>
  );
}

// Wallet-gated lazy pages prefetch their chunk as soon as the page mounts —
// in parallel with the wallet stack chunk that <WalletRequired> kicks off in
// the same commit. Without this, React.lazy only renders (and thus fetches)
// after the wallet stack finishes loading, so the two chunks load strictly
// serially — the direct-entry waterfall behind the slow /perfil/:username LCP.
// Prefetching any earlier (main-chunk eval) would pull the page's @solana/*
// deps into the critical font/locale phase and cost more than it saves.
const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  useEffect(() => {
    UserProfile.prefetch();
  }, []);
  return (
    <WalletRequired>
      <UserProfile username={username} />
    </WalletRequired>
  );
};

const CreateUserPage = () => {
  useEffect(() => {
    CreateUser.prefetch();
  }, []);
  return (
    <WalletRequired>
      <CreateUser />
    </WalletRequired>
  );
};

const ReaderPage = () => {
  const { bookId } = useParams<{ bookId?: string }>();
  return <KindleReader initialBookId={bookId || 'the-neural-wars-book-1'} />;
};

function RouteFallback() {
  const { t } = useTranslation();
  return (
    <div role="status" style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>
      {t('route_loading')}
    </div>
  );
}

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="play-page play-page--grid" style={{ maxWidth: 820, margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '28px 30px', borderRadius: 18, border: '1px solid rgba(229, 169, 60, 0.28)' }}>
        <div style={{ color: '#e5a93c', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
          404 · MATCHDAY LAB
        </div>
        <h1 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: '#f8fafc' }}>
          {t('app_404_title')}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.96rem', lineHeight: 1.55, margin: '0 0 20px 0' }}>
          {t('app_404_sub')}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              padding: '10px 18px',
              borderRadius: 10,
              background: '#e5a93c',
              color: '#0a0b0e',
              fontWeight: 800,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            🏠 {t('route_home')}
          </Link>
          <Link
            to="/estadio?tab=simulator"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              padding: '10px 18px',
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            {t('devnet_cta_first_match')}
          </Link>
          <Link
            to="/goalworld"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              padding: '10px 18px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#f8fafc',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            🌌 {t('route_goalworld')}
          </Link>
        </div>
      </div>
    </div>
  );
}

class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackView onReset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

function ErrorFallbackView({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="glass-card" style={{ maxWidth: 680, margin: '2rem auto', padding: '24px 26px', borderRadius: 16, border: '1px solid rgba(248,113,113,0.35)' }}>
      <h2 style={{ margin: '0 0 8px 0', color: '#fca5a5', fontSize: '1.25rem' }}>
        ⚠️ {t('app_error_title')}
      </h2>
      <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: '0 0 16px 0' }}>
        {t('app_error_sub')}
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            minHeight: 44,
            padding: '8px 16px',
            borderRadius: 10,
            background: '#e5a93c',
            border: 'none',
            color: '#0a0b0e',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          🔄 Reset View
        </button>
        <Link
          to="/dashboard"
          onClick={onReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 44,
            padding: '8px 16px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#f8fafc',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          🏠 {t('route_home')}
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <WalletGateProvider>
          <BrowserRouter>
            <WalletGateBridge>
              <RouteErrorBoundary>
                <React.Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route element={<PlayLayout />}>
                    <Route
                      path="/"
                      element={<LandingPage />}
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <PlayPage titleKey="route_home" align="left" hideHero>
                          <DashboardGrid />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/estadio"
                      element={
                        <PlayPage titleKey="route_estadio" align="left" hideHero>
                          <EstadioPortal />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/defi"
                      element={
                        <PlayPage titleKey="route_defi" align="left" hideHero>
                          <DeFiPortal />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/club"
                      element={
                        <PlayPage titleKey="route_club" align="left" hideHero>
                          <ClubPortal />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/goalworld"
                      element={
                        <PlayPage titleKey="route_goalworld" align="left" hideHero>
                          <GoalWorldPortal />
                        </PlayPage>

                      }
                    />
                    <Route
                      path="/staking"
                      element={
                        <React.Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Loading Lab Dashboard...</div>}>
                          <PlayPage titleKey="route_staking" align="left" hideHero>
                            <StakingBurnDashboard />
                          </PlayPage>
                        </React.Suspense>
                      }
                    />
                    <Route
                      path="/marketing-control"
                      element={
                        <PlayPage titleKey="route_marketing" align="left" hideHero>
                          <MarketingControlCenter />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/autopilot"
                      element={
                        <PlayPage titleKey="route_autopilot" align="left">
                          <CorporateAutopilot />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/agents"
                      element={
                        <PlayPage titleKey="route_agents" align="left">
                          <TokenizedAgentsDashboard />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/presskit"
                      element={
                        <PlayPage titleKey="route_presskit" align="left">
                          <PressKit />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/coleccion"
                      element={
                        <PlayPage titleKey="route_collection" align="left">
                          <GenesisCollectionGallery />
                        </PlayPage>
                      }
                    />
                    <Route path="/hub" element={<ClassicHub />} />
                    <Route path="/crear-usuario" element={<CreateUserPage />} />
                    <Route path="/perfil/:username" element={<ProfilePage />} />
                    <Route path="/reader" element={<ReaderPage />} />
                    <Route path="/reader/:bookId" element={<ReaderPage />} />
                    <Route path="/read" element={<ReaderPage />} />
                    <Route path="/studio" element={<AuthorStudio />} />
                    <Route path="/editorial" element={<AuthorStudio />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </React.Suspense>
            </RouteErrorBoundary>
          </WalletGateBridge>
          </BrowserRouter>
        </WalletGateProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;