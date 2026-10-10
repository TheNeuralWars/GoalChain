import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

import { LanguageProvider, useTranslation } from '../i18n/index';
import type { TranslationKeys } from '../i18n/translations';
import { UserProvider } from '../contexts/UserContext';
import { WalletGateProvider, WalletGateBridge, WalletRequired } from '../wallet/gate';

import { PlayLayout } from './PlayLayout';
import { DashboardGrid } from './DashboardGrid';
import { LandingPage } from './LandingPage';
import { ClassicHub } from './ClassicHub';
// Heavy route portals are lazy: each lands in an on-demand chunk so the
// first-paint JS stays small (booksData.ts lore + portal bundles stay out).
const EstadioPortal = React.lazy(() => import('./EstadioPortal').then(m => ({ default: m.EstadioPortal })));
const DeFiPortal = React.lazy(() => import('./DeFiPortal').then(m => ({ default: m.DeFiPortal })));
const ClubPortal = React.lazy(() => import('./ClubPortal').then(m => ({ default: m.ClubPortal })));
const MarketingControlCenter = React.lazy(() => import('./MarketingControlCenter').then(m => ({ default: m.MarketingControlCenter })));
const PressKit = React.lazy(() => import('./PressKit').then(m => ({ default: m.PressKit })));
const GenesisCollectionGallery = React.lazy(() => import('./GenesisCollectionGallery').then(m => ({ default: m.GenesisCollectionGallery })));
const CorporateAutopilot = React.lazy(() => import('./CorporateAutopilot').then(m => ({ default: m.CorporateAutopilot })));
const TokenizedAgentsDashboard = React.lazy(() => import('./TokenizedAgentsDashboard').then(m => ({ default: m.TokenizedAgentsDashboard })));
const GoalWorldPortal = React.lazy(() => import('./GoalWorldPortal').then(m => ({ default: m.GoalWorldPortal })));
const KindleReader = React.lazy(() => import('./KindleReader').then(m => ({ default: m.KindleReader })));
const AuthorStudio = React.lazy(() => import('./AuthorStudio').then(m => ({ default: m.AuthorStudio })));
const StakingBurnDashboard = React.lazy(() => import('./StakingBurnDashboard').then(m => ({ default: m.StakingBurnDashboard })));
// Wallet-gated pages are lazy: their @solana/* imports land in on-demand chunks.
const CreateUser = React.lazy(() => import('./CreateUser').then(m => ({ default: m.CreateUser })));
const UserProfile = React.lazy(() => import('./UserProfile').then(m => ({ default: m.UserProfile })));

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

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  return (
    <WalletRequired>
      <UserProfile username={username} />
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

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <WalletGateProvider>
          <BrowserRouter>
            <WalletGateBridge>
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
                        <PlayPage titleKey="route_home" align="left">
                          <DashboardGrid />
                        </PlayPage>
                      }
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
                      path="/goalworld"
                      element={
                        <PlayPage titleKey="route_goalworld" align="left">
                          <GoalWorldPortal />
                        </PlayPage>

                      }
                    />
                    <Route
                      path="/staking"
                      element={
                        <React.Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Loading Staking Dashboard...</div>}>
                          <PlayPage titleKey="route_staking" align="left">
                            <StakingBurnDashboard />
                          </PlayPage>
                        </React.Suspense>
                      }
                    />
                    <Route
                      path="/marketing-control"
                      element={
                        <PlayPage titleKey="route_marketing" align="left">
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
                    <Route path="/crear-usuario" element={<WalletRequired><CreateUser /></WalletRequired>} />
                    <Route path="/perfil/:username" element={<ProfilePage />} />
                    <Route path="/reader" element={<ReaderPage />} />
                    <Route path="/reader/:bookId" element={<ReaderPage />} />
                    <Route path="/read" element={<ReaderPage />} />
                    <Route path="/studio" element={<AuthorStudio />} />
                    <Route path="/editorial" element={<AuthorStudio />} />
                  </Route>
                </Routes>
              </React.Suspense>
            </WalletGateBridge>
          </BrowserRouter>
        </WalletGateProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;