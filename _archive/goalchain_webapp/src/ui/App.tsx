import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { FixturesPanel } from './components/FixturesPanel';

function getDefaultEndpoint() {
  // For local development you can set VITE_RPC_ENDPOINT=http://127.0.0.1:8899
  return import.meta.env.VITE_RPC_ENDPOINT ?? clusterApiUrl('devnet');
}

export function App() {
  const endpoint = getDefaultEndpoint();

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24, fontFamily: 'system-ui' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h1 style={{ margin: 0 }}>GoalChain Bets</h1>
              <WalletMultiButton />
            </header>
            <p style={{ opacity: 0.8 }}>
              RPC: <code>{endpoint}</code>
            </p>

            <FixturesPanel />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
