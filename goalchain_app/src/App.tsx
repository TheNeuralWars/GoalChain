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
                    <div className="min-h-screen bg-gray-900 text-white p-8">
                        <header className="flex justify-between items-center border-b border-gray-700 pb-4 mb-8">
                            <h1 className="text-3xl font-bold text-green-400">GoalChain Live Markets</h1>
                            <WalletMultiButton />
                        </header>
                        <main>
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                                <h2 className="text-xl font-semibold mb-4">Catálogo de Fixtures</h2>
                                <p className="text-gray-400">Conecta tu wallet para apostar en los mercados en vivo.</p>
                                <FixturesList />
                            </div>
                        </main>
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App;
