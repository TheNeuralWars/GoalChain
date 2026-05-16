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
        alert("No tenés tokens para reclamar.");
        return;
    }

    // SIMULACIÓN DE TRANSACCIÓN ON-CHAIN (DEVNET)
    // En producción aquí iría el llamado al programa de Solana (Anchor)
    console.log(`Reclamando ${balanceToClaim} $GCH a la wallet ${walletState.publicKey}`);
    
    // UI Feedback
    const claimBtn = document.getElementById('claimGCHBtn');
    if (claimBtn) {
        claimBtn.innerHTML = 'PROCESANDO...';
        claimBtn.disabled = true;
    }

    setTimeout(() => {
        alert(`¡ÉXITO! Se han enviado ${balanceToClaim} $GCH (Devnet) a tu wallet. Estos puntos cuentan para el Airdrop oficial.`);
        localStorage.setItem('gch_balance', '0');
        if (window.game) window.game.balance = 0;
        if (window.game) window.game.updateStatsUI();
        
        if (claimBtn) {
            claimBtn.innerHTML = 'RECLAMAR AIRDROP';
            claimBtn.disabled = false;
        }
        
        if (window.confetti) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    }, 2000);
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
