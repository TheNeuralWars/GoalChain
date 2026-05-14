import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Estilos por defecto del adaptador
import '@solana/wallet-adapter-react-ui/styles.css';

import { FixturesPanel } from './FixturesPanel';
import { TradingTerminal } from './TradingTerminal';
import { SquadGallery } from './SquadGallery';
import { LiveEventFeed } from './LiveEventFeed';

function App() {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <div className="app-container" style={{ padding: '2rem', textAlign: 'center' }}>
                        <header>
                            <h1>GoalChain Alpha Dashboard</h1>
                            <p style={{ opacity: 0.8 }}>Protocolo SportsFi v2.0 - World Cup 2026</p>
                            <div style={{ margin: '1rem 0' }}>
                                <WalletMultiButton />
                            </div>
                        </header>
                        
                        <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            <FixturesPanel />
                            <TradingTerminal />
                            <SquadGallery />
                            <LiveEventFeed />
                        </main>
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;
