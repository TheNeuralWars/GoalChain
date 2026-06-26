import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

import { LanguageProvider, useTranslation } from '../i18n/index';
import type { TranslationKeys } from '../i18n/translations';
import { UserProvider } from '../contexts/UserContext';

import { PlayLayout } from './PlayLayout';
import { DashboardGrid } from './DashboardGrid';
import { EstadioPortal } from './EstadioPortal';
import { DeFiPortal } from './DeFiPortal';
import { ClubPortal } from './ClubPortal';
import { CreateUser } from './CreateUser';
import { UserProfile } from './UserProfile';
import { ClassicHub } from './ClassicHub';
import { MarketingControlCenter } from './MarketingControlCenter';
import { PressKit } from './PressKit';
import { GenesisCollectionGallery } from './GenesisCollectionGallery';
import { CorporateAutopilot } from './CorporateAutopilot';
const StakingBurnDashboard = React.lazy(() => import('./StakingBurnDashboard').then(m => ({ default: m.StakingBurnDashboard })));


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
  return <UserProfile username={username} />;
};

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  return (
    <LanguageProvider initialLanguage="en">
      <UserProvider>
        <BrowserRouter>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <Routes>
                  <Route element={<PlayLayout />}>
                    <Route
                      path="/"
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
                    <Route path="/crear-usuario" element={<CreateUser />} />
                    <Route path="/perfil/:username" element={<ProfilePage />} />
                  </Route>
                </Routes>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </BrowserRouter>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;