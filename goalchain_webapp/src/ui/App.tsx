import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Analytics } from '@vercel/analytics/react';

import '@solana/wallet-adapter-react-ui/styles.css';

import { PlayLayout } from './PlayLayout';
import { DashboardHub } from './DashboardHub';
import { FixturesPanel } from './FixturesPanel';
import { TradingTerminal } from './TradingTerminal';
import { SquadGallery } from './SquadGallery';
import { LiveEventFeed } from './LiveEventFeed';
import { CreateUser } from './CreateUser';
import { UserProfile } from './UserProfile';
import { AICommentator } from './AICommentator';
import { SwarmVaults } from './SwarmVaults';
import { OpsStatusPanel } from './OpsStatusPanel';

function PlayPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="play-page">
      <div className="play-page-hero play-page-hero--compact">
        <h1>{title}</h1>
      </div>
      <main className="play-page-main">{children}</main>
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
    <BrowserRouter>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Routes>
              <Route element={<PlayLayout />}>
                <Route path="/" element={<DashboardHub />} />
                <Route
                  path="/ops"
                  element={
                    <PlayPage title="Ops & Protocol Status">
                      <OpsStatusPanel />
                    </PlayPage>
                  }
                />
                <Route
                  path="/fixtures"
                  element={
                    <PlayPage title="Fixtures & Mercados">
                      <FixturesPanel />
                    </PlayPage>
                  }
                />
                <Route
                  path="/trading"
                  element={
                    <PlayPage title="Trading Terminal">
                      <TradingTerminal />
                    </PlayPage>
                  }
                />
                <Route
                  path="/squad"
                  element={
                    <PlayPage title="Squad Gallery">
                      <SquadGallery />
                    </PlayPage>
                  }
                />
                <Route
                  path="/vaults"
                  element={
                    <PlayPage title="Swarm Vaults">
                      <SwarmVaults />
                    </PlayPage>
                  }
                />
                <Route
                  path="/commentator"
                  element={
                    <PlayPage title="AI Commentator">
                      <AICommentator />
                    </PlayPage>
                  }
                />
                <Route
                  path="/feed"
                  element={
                    <PlayPage title="Live Event Feed">
                      <LiveEventFeed />
                    </PlayPage>
                  }
                />
                <Route path="/crear-usuario" element={<CreateUser />} />
                <Route path="/perfil/:username" element={<ProfilePage />} />
              </Route>
            </Routes>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
