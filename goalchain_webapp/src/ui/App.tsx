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

const ProductScopeBanner = () => (
    <div style={{
        background: 'rgba(20, 241, 149, 0.06)',
        border: '1px solid rgba(20, 241, 149, 0.35)',
        boxShadow: '0 0 15px rgba(20, 241, 149, 0.12)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        margin: '1.5rem auto 2rem auto',
        maxWidth: '1000px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        textAlign: 'left'
    }}>
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <div>
            <h4 style={{ margin: 0, color: '#14f195', fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Official Transactional Frontend
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#e0e0e0', opacity: 0.9, lineHeight: '1.4' }}>
                Esta app es el cliente transaccional oficial de GoalChain. La landing <code>docs</code> queda reservada para contenido informativo y dashboards read-only.
            </p>
        </div>
    </div>
);

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
                        
                        <ProductScopeBanner />
                        
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
