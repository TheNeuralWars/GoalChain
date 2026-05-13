import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { FixturesList } from './components/FixturesList';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

const App: FC = () => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <div className="min-h-screen pb-20">
                        {/* Hero Header */}
                        <header className="relative py-12 px-8 flex flex-col items-center justify-center overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-solana-purple/20 blur-[120px] rounded-full -z-10"></div>
                            
                            <nav className="absolute top-8 left-8 right-8 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#14f195] to-[#9945ff] rounded-lg rotate-12 flex items-center justify-center">
                                        <span className="text-white font-black text-xl -rotate-12">G</span>
                                    </div>
                                    <span className="text-2xl font-black tracking-tighter text-white">GOALCHAIN</span>
                                </div>
                                <WalletMultiButton className="!bg-white/10 !backdrop-blur-md !border !border-white/10 hover:!bg-white/20 !transition-all !rounded-xl" />
                            </nav>

                            <h1 className="text-6xl md:text-8xl font-black mt-16 text-center leading-none tracking-tight">
                                LIVE <br/>
                                <span className="solana-gradient-text">MARKETS</span>
                            </h1>
                            <p className="text-gray-400 mt-6 text-xl max-w-2xl text-center font-light">
                                Apuesta en tiempo real sobre los partidos del mundial. <br/>
                                <span className="text-white/80 font-medium">Parimutuel, justo y on-chain.</span>
                            </p>
                        </header>

                        {/* Main Content */}
                        <main className="max-w-6xl mx-auto px-8 mt-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold">Fixtures Activos</h2>
                                    <p className="text-gray-500">Selecciona un partido para ver los mercados disponibles.</p>
                                </div>
                                <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                                    <button className="px-4 py-2 bg-white/10 rounded-lg text-sm font-bold shadow-md">Todos</button>
                                    <button className="px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-bold text-gray-400 transition-colors">Fase de Grupos</button>
                                    <button className="px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-bold text-gray-400 transition-colors">Playoffs</button>
                                </div>
                                <div className="flex gap-3">
                                    <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold animate-pulse">LIVE NOW</span>
                                    <span className="px-3 py-1 bg-white/5 text-gray-400 border border-white/10 rounded-full text-xs font-bold">PRÓXIMOS</span>
                                </div>
                            </div>
                            
                            <FixturesList />
                        </main>

                        {/* Footer decorative */}
                        <footer className="mt-40 border-t border-white/5 py-20 px-8 text-center opacity-30">
                            <p>&copy; 2026 GoalChain Ecosystem. Built for PlaySolana PSG1.</p>
                        </footer>
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App;
