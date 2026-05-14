"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
var wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
var wallet_adapter_wallets_1 = require("@solana/wallet-adapter-wallets");
var wallet_adapter_react_ui_1 = require("@solana/wallet-adapter-react-ui");
var web3_js_1 = require("@solana/web3.js");
// Estilos por defecto del adaptador
require("@solana/wallet-adapter-react-ui/styles.css");
function App() {
    var network = wallet_adapter_base_1.WalletAdapterNetwork.Devnet;
    var endpoint = (0, react_1.useMemo)(function () { return (0, web3_js_1.clusterApiUrl)(network); }, [network]);
    var wallets = (0, react_1.useMemo)(function () { return [new wallet_adapter_wallets_1.PhantomWalletAdapter()]; }, [network]);
    return (<wallet_adapter_react_1.ConnectionProvider endpoint={endpoint}>
            <wallet_adapter_react_1.WalletProvider wallets={wallets} autoConnect>
                <wallet_adapter_react_ui_1.WalletModalProvider>
                    <div className="app-container" style={{ padding: '2rem', textAlign: 'center' }}>
                        <header>
                            <h1>GoalChain Alpha Dashboard</h1>
                            <p>Powered by Solana & SportsFi Protocol</p>
                            <wallet_adapter_react_ui_1.WalletMultiButton />
                        </header>
                        <main style={{ marginTop: '2rem' }}>
                            <div className="status-card" style={{ border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
                                <h3>Wallet Status</h3>
                                <p>Conecta tu wallet para gestionar tus jugadores de la Genesis Squad.</p>
                            </div>
                        </main>
                    </div>
                </wallet_adapter_react_ui_1.WalletModalProvider>
            </wallet_adapter_react_1.WalletProvider>
        </wallet_adapter_react_1.ConnectionProvider>);
}
exports.default = App;
