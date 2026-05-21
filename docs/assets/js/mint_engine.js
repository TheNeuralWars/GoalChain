/**
 * GoalChain Mint Engine v1.0 (Devnet Demo)
 * Handles real Solana transactions for the NFT Minting experience.
 */

const DEVNET_RPC = "https://api.devnet.solana.com";
const TREASURY_WALLET = "6v6yVpWp5Z6T8f7Qz4J6x6m5Y6x6Y6x6Y6x6Y6x6Y6x6"; // Placeholder Treasury

const MintEngine = {
    async processMint(player) {
        if (!window.solana || !window.solana.isConnected) {
            if (window.notifier) window.notifier.show('ERROR', 'Conecta tu wallet para mintear.', 'error');
            return null;
        }

        try {
            const provider = window.solana;
            const connection = new solanaWeb3.Connection(DEVNET_RPC, "confirmed");
            const fromPubkey = provider.publicKey;
            
            // 1. Simulación de Costo (0.01 SOL en Devnet para la prueba)
            const lamports = 10000000; // 0.01 SOL
            
            if (window.notifier) window.notifier.show('PROCESANDO', `Preparando contrato para ${player.name}...`, 'info');

            // 2. Crear Transacción Real
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: fromPubkey,
                    toPubkey: fromPubkey, // Auto-envío para la demo (no gasta SOL real, solo fee de prueba)
                    lamports: lamports,
                })
            );

            transaction.feePayer = fromPubkey;
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;

            // 3. Firma y Envío
            const { signature } = await provider.signAndSendTransaction(transaction);
            
            if (window.notifier) window.notifier.show('BLOCKCHAIN', 'Esperando confirmación de la red...', 'info');

            // 4. Esperar Confirmación
            await connection.confirmTransaction(signature);
            
            console.log("🔥 NFT Minted Successfully! TX:", signature);
            return signature;

        } catch (error) {
            console.error("Mint Error:", error);
            if (window.notifier) window.notifier.show('MINT CANCELADO', 'La transacción no se completó.', 'error');
            return null;
        }
    }
};

window.MintEngine = MintEngine;
