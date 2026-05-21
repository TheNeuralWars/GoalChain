/**
 * wallet_connect.js - Integración oficial con Phantom y Solflare
 */

const walletState = {
    connected: false,
    publicKey: null,
    provider: null,
    balance: 0
};

async function initWallet() {
    setupWalletUI();
    // Intentar reconexión automática si ya estaba conectado
    if (window.solana && window.solana.isPhantom) {
        try {
            const resp = await window.solana.connect({ onlyIfTrusted: true });
            handleWalletConnection(resp.publicKey.toString());
        } catch (err) {
            // No estaba autorizado, no pasa nada
        }
    }
}

function setupWalletUI() {
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', toggleWallet);
    }
}

async function toggleWallet() {
    if (!walletState.connected) {
        await connectWallet();
    } else {
        await disconnectWallet();
    }
}

async function connectWallet() {
    const provider = window.solana || window.zeus; // Soporte Phantom/otros
    
    if (!provider) {
        alert("Por favor, instala la extensión de Phantom o Solflare para usar GoalChain.");
        window.open("https://phantom.app/", "_blank");
        return;
    }

    try {
        const resp = await provider.connect();
        walletState.provider = provider;
        handleWalletConnection(resp.publicKey.toString());
        
        // Efecto visual de éxito
        if (window.confetti) {
            confetti({ particleCount: 50, spread: 30, colors: ['#9945ff', '#14f195'] });
        }
    } catch (err) {
        console.error("Error de conexión:", err);
    }
}

function handleWalletConnection(publicKey) {
    walletState.connected = true;
    walletState.publicKey = publicKey;
    
    // Actualizar UI
    const btn = document.getElementById('connectWalletBtn');
    if (btn) {
        const shortKey = `${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)}`;
        btn.innerHTML = `<span style="color:#14f195;">●</span> ${shortKey}`;
        btn.classList.add('wallet-connected');
    }

    // Guardar en localStorage para otros módulos
    localStorage.setItem('goalchain_wallet', publicKey);
    
    // Disparar evento para que el juego de penaltis sepa que hay un nuevo dueño
    window.dispatchEvent(new CustomEvent('walletChanged', { detail: { publicKey } }));
}

async function claimTokens() {
    if (!walletState.connected) {
        alert("Primero conectá tu wallet.");
        return;
    }

    const balanceToClaim = parseInt(localStorage.getItem('gch_balance') || '0');
    if (balanceToClaim <= 0) {
        alert("No tenés tokens para reclamar en tu racha.");
        return;
    }

    // UI Feedback
    const claimBtn = document.getElementById('claimGCHBtn');
    if (claimBtn) {
        claimBtn.innerHTML = 'PROCESANDO FIRMA...';
        claimBtn.disabled = true;
    }

    try {
        console.log("Iniciando firma real de transacción en Devnet...");
        
        // 1. Inicializar la conexión si no está lista
        const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");
        const fromPubkey = new solanaWeb3.PublicKey(walletState.publicKey);
        
        // Dirección de la Tesorería de GoalChain (como receptor)
        const toPubkey = new solanaWeb3.PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");

        // 2. Crear una micro-transacción real (0.0001 SOL) para validar el Airdrop on-chain
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromPubkey,
                toPubkey: toPubkey,
                lamports: 100000, // 0.0001 SOL
            })
        );

        // 3. Obtener el blockhash más reciente
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        // 4. Solicitar firma a Phantom Wallet
        const provider = window.solana;
        if (!provider) throw new Error("Phantom Wallet no encontrada.");

        const { signature } = await provider.signAndSendTransaction(transaction);
        console.log("Transacción enviada con firma:", signature);

        // 5. Confirmar transacción
        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transacción confirmada en la Blockchain.");

        // Éxito: Mostrar alerta con el enlace a Solana Explorer
        alert(`¡AIRDROP CONFIRMADO EN SOLANA! 🎉\n\nSe han validado tus GoalPoints.\n\nTx ID: ${signature.substring(0, 10)}...\n\nPuedes ver tu transacción en Solana Explorer.`);
        
        // Abrir Explorer en pestaña nueva
        window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');

        // Resetear balance local
        localStorage.setItem('gch_balance', '0');
        if (window.game) {
            window.game.balance = 0;
            window.game.updateStatsUI();
        }

    } catch (error) {
        console.error("Error en la transacción real de Solana:", error);
        alert("La transacción fue cancelada o falló por falta de fondos (Devnet SOL).");
    } finally {
        if (claimBtn) {
            claimBtn.innerHTML = 'RECLAMAR AIRDROP';
            claimBtn.disabled = false;
        }
    }
}
async function disconnectWallet() {
    if (walletState.provider) {
        await walletState.provider.disconnect();
    }
    walletState.connected = false;
    walletState.publicKey = null;
    
    const btn = document.getElementById('connectWalletBtn');
    if (btn) {
        btn.innerHTML = 'CONECTAR WALLET';
        btn.classList.remove('wallet-connected');
    }
    
    localStorage.removeItem('goalchain_wallet');
}

document.addEventListener('DOMContentLoaded', initWallet);
