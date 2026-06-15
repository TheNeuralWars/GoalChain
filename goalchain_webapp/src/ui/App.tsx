import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

import { LanguageProvider } from '../i18n/index';
import { PlayLayout } from './PlayLayout';
import { DashboardGrid } from './DashboardGrid';
import { EstadioPortal } from './EstadioPortal';
import { DeFiPortal } from './DeFiPortal';
import { ClubPortal } from './ClubPortal';
import { CreateUser } from './CreateUser';
import { UserProfile } from './UserProfile';
import { ClassicHub } from './ClassicHub';
const StakingBurnDashboard = React.lazy(() => import('./StakingBurnDashboard').then(m => ({ default: m.StakingBurnDashboard })));

function PlayPage({
  title,
  children,
  align = 'center',
}: {
  title: string;
  children: React.ReactNode;
  align?: 'center' | 'left';
}) {
  return (
    <div className="play-page play-page--grid">
      <div className="play-page-hero play-page-hero--compact">
        <h1>{title}</h1>
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
      <BrowserRouter>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Routes>
                <Route element={<PlayLayout />}>
                  <Route
                    path="/"
                    element={
                      <PlayPage title="Panel de Inicio" align="left">
                        <DashboardGrid />
                      </PlayPage>
                    }
                  />
                  <Route
                    path="/estadio"
                    element={
                      <PlayPage title="Portal del Estadio" align="left">
                        <EstadioPortal />
                      </PlayPage>
                    }
                  />
                  <Route
                    path="/defi"
                    element={
                      <PlayPage title="DeFi Terminal" align="left">
                        <DeFiPortal />
                      </PlayPage>
                    }
                  />
                  <Route
                    path="/club"
                    element={
                      <PlayPage title="Mi Club &amp; Manager" align="left">
                        <ClubPortal />
                      </PlayPage>
                    }
                  />
                  <Route
                    path="/staking"
                    element={
                      <React.Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Loading Staking Dashboard...</div>}>
                        <PlayPage title="Infinity Burn & Staking" align="left">
                          <StakingBurnDashboard />
                        </PlayPage>
                      </React.Suspense>
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
    </LanguageProvider>
  );
}

export default App;