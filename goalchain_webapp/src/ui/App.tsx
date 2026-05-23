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
import { AICommentator } from './AICommentator';
import { SwarmVaults } from './SwarmVaults';

const ProductScopeBanner = () => (
    <div style={{
        background: 'rgba(20, 241, 149, 0.03)',
        border: '1px solid rgba(20, 241, 149, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(20, 241, 149, 0.05)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        padding: '1.25rem 1.75rem',
        margin: '1.5rem auto 2rem auto',
        maxWidth: '1200px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        textAlign: 'left'
    }}>
        <span style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 0 8px rgba(20, 241, 149, 0.3))' }}>⚠️</span>
        <div>
            <h4 style={{ margin: 0, color: '#14f195', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                Official Transactional Frontend
            </h4>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1', opacity: 0.9, lineHeight: '1.5' }}>
                Esta app es el cliente transaccional oficial de GoalChain. La landing <code>docs</code> queda reservada para contenido informativo y dashboards read-only. Todos los datos mostrados son de prueba (Devnet Mode).
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
                    <div className="app-container">
                        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0 3rem 0' }}>
                            <h1>GoalChain Alpha Dashboard</h1>
                            <p style={{ opacity: 0.8, fontSize: '1.1rem', color: '#94a3b8', margin: '0.5rem 0 1.5rem 0' }}>
                                Protocolo SportsFi v2.0 • World Cup 2026
                            </p>
                            <div>
                                <WalletMultiButton />
                            </div>
                        </header>
                        
                        <ProductScopeBanner />
                        
                        <main className="dashboard-grid">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <FixturesPanel />
                                <SquadGallery />
                                <SwarmVaults />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <TradingTerminal />
                                <AICommentator />
                                <LiveEventFeed />
                            </div>
                        </main>
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;
