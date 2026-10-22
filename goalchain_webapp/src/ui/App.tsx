import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

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
}: {
  titleKey: keyof TranslationKeys;
  children: React.ReactNode;
  align?: 'center' | 'left';
}) {
  const { t } = useTranslation();
  return (
    <div className="play-page play-page--grid">
      <div className="play-page-hero play-page-hero--compact">
        <h1>{t(titleKey)}</h1>
      </div>
      <main className={`play-page-main play-page-main--${align}`}>{children}</main>
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

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <WalletGateProvider>
          <BrowserRouter>
            <WalletGateBridge>
                <Routes>
                  <Route element={<PlayLayout />}>
                    <Route
                      path="/"
                      element={<LandingPage />}
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <PlayPage titleKey="route_home" align="left">
                          <DashboardGrid />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/crear-usuario"
                      element={<CreateUserPage />}
                    />
                    <Route
                      path="/perfil/:username"
                      element={<ProfilePage />}
                    />
                    <Route
                      path="/estadio"
                      element={
                        <PlayPage titleKey="route_estadio" align="left">
                          <EstadioPortal />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/defi"
                      element={
                        <PlayPage titleKey="route_defi" align="left">
                          <DeFiPortal />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/club"
                      element={
                        <PlayPage titleKey="route_club" align="left">
                          <ClubPortal />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/classic"
                      element={
                        <PlayPage titleKey="classic_hub_title" align="left">
                          <ClassicHub />
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
                      path="/marketing"
                      element={
                        <PlayPage titleKey="route_marketing" align="left">
                          <MarketingControlCenter />
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
                      path="/genesis"
                      element={
                        <PlayPage titleKey="genesis_title" align="left">
                          <GenesisCollectionGallery />
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
                      path="/goalworld"
                      element={
                        <PlayPage titleKey="route_goalworld" align="left">
                          <GoalWorldPortal />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/reader/:bookId?"
                      element={<ReaderPage />}
                    />
                    <Route
                      path="/author"
                      element={
                        <PlayPage titleKey="author_title" align="left">
                          <AuthorStudio />
                        </PlayPage>
                      }
                    />
                    <Route
                      path="/staking"
                      element={
                        <PlayPage titleKey="route_staking" align="left">
                          <StakingBurnDashboard />
                        </PlayPage>
                      }
                    />
                  </Route>
                </Routes>
            </WalletGateBridge>
          </BrowserRouter>
        </WalletGateProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;