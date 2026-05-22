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

const DevModeBanner = () => (
    <div style={{
        background: 'rgba(255, 179, 0, 0.05)',
        border: '1px solid rgba(255, 179, 0, 0.3)',
        boxShadow: '0 0 15px rgba(255, 179, 0, 0.1)',
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
            <h4 style={{ margin: 0, color: '#ffb300', fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Devnet Alpha Mode Active
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#e0e0e0', opacity: 0.9, lineHeight: '1.4' }}>
                Todos los parámetros mostrados (pools, rendimientos, feeds y saldos de $GCH) son <strong>simulados y con fines de prueba</strong>. No se utiliza valor real en estas transacciones.
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
                        
                        <DevModeBanner />
                        
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
