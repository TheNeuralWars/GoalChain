// WALLET CONNECT V2 (Merged & Polished) - GoalChain
let userWalletAddress = localStorage.getItem('goalchain_wallet') || null;

async function connectWallet() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const { solana } = window;

    // Si estamos en un archivo local (file://), la extensión de Phantom no se comunica por seguridad del Sandbox de Chrome.
    // Ofrecemos un fallback automático en "Modo Desarrollo/Simulación" para no bloquear tus pruebas locales.
    if (window.location.protocol === 'file:') {
        console.warn("⚠️ Entorno 'file://' detectado. Conectando en 'Modo Dev/Simulado' para omitir restricciones del Sandbox de Chrome.");
        const mockAddress = "DevGoaL888888888888888888888888888888888888";
        userWalletAddress = mockAddress;
        localStorage.setItem('goalchain_wallet', userWalletAddress);
        
        if (window.notifier) {
            window.notifier.show(
                typeof currentLang !== 'undefined' && currentLang === 'en' ? "DEV MODE CONNECTED" : "MODO DEV CONECTADO",
                typeof currentLang !== 'undefined' && currentLang === 'en' ? "Simulating Solana Wallet on local environment." : "Simulando Wallet Solana en entorno local.",
                'success'
            );
        } else {
            alert("✅ Modo Desarrollador: Conectado con Wallet Simulada.");
        }
        
        updateWalletUI();
        
        // Disparar evento para que el juego de penaltis se actualice
        window.dispatchEvent(new CustomEvent('walletChanged', { detail: { publicKey: mockAddress } }));
        return;
    }

    // Lógica para Móvil (Deep Linking)
    if (isMobile && !solana) {
        const currentUrl = encodeURIComponent(window.location.href);
        const phantomDeepLink = `https://phantom.app/ul/browse/${currentUrl}?ref=${window.location.origin}`;
        window.open(phantomDeepLink, "_blank");
        return;
    }

    try {
        if (!solana || !solana.isPhantom) {
            alert("🛡️ Phantom Wallet no detectada.\n\nTe llevamos a descargarla...");
            window.open("https://phantom.app/", "_blank");
            return;
        }

        const response = await solana.connect();
        const publicKey = response.publicKey.toString();

        // NUEVO: Verificación por Firma de Mensaje
        const message = `Welcome to GoalChain! ⚽\n\nBy signing this message, you verify your ownership of this wallet to start earning GoalPoints and claiming NFTs.\n\nWallet: ${publicKey}\nTimestamp: ${Date.now()}`;
        const encodedMessage = new TextEncoder().encode(message);
        
        try {
            const signedMessage = await solana.signMessage(encodedMessage, "utf8");
            console.log("✅ Firma verificada con éxito:", signedMessage);
            
            userWalletAddress = publicKey;
            // Persistencia en localStorage
            localStorage.setItem('goalchain_wallet', userWalletAddress);
            console.log("✅ Wallet conectada y verificada:", userWalletAddress);
            
            if (window.notifier) window.notifier.show('¡CONECTADO!', 'Wallet verificada con éxito.', 'success');
        } catch (signError) {
            console.error("Firma rechazada:", signError);
            alert("⚠️ Debes firmar el mensaje para verificar tu identidad y acceder a la dApp.");
            return;
        }

        // Confetti de bienvenida Solana
        if (window.confetti) {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#14f195', '#9945ff', '#ffffff']
            });
        }

        updateWalletUI();

    } catch (error) {
        console.error("Error al conectar wallet:", error);
        if (error.code === 4001) {
            alert("Conexión cancelada por el usuario.");
        } else {
            alert("Error al conectar con Phantom. Inténtalo de nuevo.");
        }
    }
}

async function fetchRealGCHBalance(walletAddress) {
    if (!walletAddress || walletAddress.startsWith("DevGoaL")) return;
    
    try {
        console.log("🔍 Fetching real $GCH balance from Solana Devnet for:", walletAddress);
        const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");
        const mintPublicKey = new solanaWeb3.PublicKey("49zjYVf8GYSWWyfxruM9eSVoXzUmbevxUzXn8TTYqbAA");
        const ownerPublicKey = new solanaWeb3.PublicKey(walletAddress);

        const accounts = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, { mint: mintPublicKey });
        
        if (accounts.value.length > 0) {
            const uiAmount = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            console.log("💰 Real $GCH Balance loaded:", uiAmount);
            
            // Sync to local storage
            localStorage.setItem('gch_balance', Math.floor(uiAmount).toString());
            
            // Update UI elements in active game
            if (window.game) {
                window.game.balance = Math.floor(uiAmount);
                window.game.updateStatsUI();
            }
        } else {
            console.log("⚠️ No $GCH token account found on Devnet. Balance: 0");
            localStorage.setItem('gch_balance', '0');
            if (window.game) {
                window.game.balance = 0;
                window.game.updateStatsUI();
            }
        }
    } catch (err) {
        console.error("❌ Error loading $GCH balance:", err);
    }
}

function updateWalletUI() {
    if (!userWalletAddress) return;

    document.body.classList.add('wallet-connected');

    // Fetch and sync the real $GCH balance from Solana Devnet
    fetchRealGCHBalance(userWalletAddress);

    const shortAddress = `${userWalletAddress.slice(0, 4)}...${userWalletAddress.slice(-4)}`;

    // 1. Actualizar botones de wallet (Estilo Circular)
    document.querySelectorAll('.btn-wallet, #connectWalletBtn').forEach(btn => {
        btn.style.background = 'linear-gradient(135deg, #14f195, #9945ff)';
        btn.style.boxShadow = '0 0 20px rgba(20, 241, 149, 0.6)';
        btn.style.border = 'none';
        btn.title = `Connected: ${shortAddress}`;
    });

    // 2. Generar Link de Referidos y actualizar UI Social
    const refLink = `${window.location.origin}/?ref=${userWalletAddress}`;
    const referralDisplay = document.getElementById('referral-link-display');
    if (referralDisplay) {
        referralDisplay.innerText = refLink;
        referralDisplay.style.color = '#14f195';
    }

    // Actualizar link de X (Twitter) si existe el botón de tarea
    const shareBtn = document.getElementById('share-x-task');
    if (shareBtn) {
        const tweetText = encodeURIComponent(`¡Acabo de unirme a la Whitelist de GoalChain! ⚽🚀 Jugando para ganar en @Solana. Únete aquí: ${refLink} #GoalChain #Solana`);
        shareBtn.href = `https://twitter.com/intent/tweet?text=${tweetText}`;
    }

    // Mostrar sección de recompensas si estaba oculta
    const rewardsSection = document.getElementById('rewards');
    if (rewardsSection) rewardsSection.style.display = 'block';

    // Disparar actualización de puntos global si existe
    if (window.updateGoalPoints) window.updateGoalPoints();
}

function disconnectWallet() {
    userWalletAddress = null;
    localStorage.removeItem('goalchain_wallet');
    location.reload();
}

function copyReferralLink() {
    const referralDisplay = document.getElementById('referral-link-display');
    if (referralDisplay && referralDisplay.innerText && referralDisplay.innerText.includes('?ref=')) {
        navigator.clipboard.writeText(referralDisplay.innerText).then(() => {
            const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
            alert(isEn ? "Referral link copied! 🚀" : "¡Enlace de referidos copiado! 🚀");
        });
    } else {
        const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
        alert(isEn ? "Please connect your wallet first!" : "¡Por favor, conecta tu wallet primero!");
    }
}

// Export functions to global scope
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.copyReferralLink = copyReferralLink;

// Inicialización y Listeners de Solana
window.addEventListener('load', async () => {
    if (localStorage.getItem('goalchain_wallet')) {
        document.body.classList.add('wallet-connected');
    }

    // Espera a que Phantom inyecte el objeto
    setTimeout(async () => {
        if (window.solana && window.solana.isPhantom) {
            // Auto-reconexión si el usuario ya confió en el sitio
            const savedWallet = localStorage.getItem('goalchain_wallet');
            if (savedWallet) {
                try {
                    const resp = await window.solana.connect({ onlyIfTrusted: true });
                    userWalletAddress = resp.publicKey.toString();
                    updateWalletUI();
                } catch (err) {
                    console.log("Auto-connect en espera de interacción.");
                }
            }

            // Escuchar cambios de cuenta o desconexión desde la extensión
            window.solana.on("accountChanged", (publicKey) => {
                if (publicKey) {
                    userWalletAddress = publicKey.toString();
                    localStorage.setItem('goalchain_wallet', userWalletAddress);
                    updateWalletUI();
                } else {
                    disconnectWallet();
                }
            });
        }
    }, 500);
});

// Delegación de eventos para botones de wallet
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-wallet') || e.target.closest('#connectWalletBtn');
    if (btn) {
        e.preventDefault();
        if (userWalletAddress) {
            if (confirm("¿Quieres desconectar tu wallet?")) {
                disconnectWallet();
            }
        } else {
            connectWallet();
        }
    }
});

// NUEVO: Reclamar Airdrop Real en Devnet desde el juego de penaltis
async function claimTokens() {
    if (!userWalletAddress) {
        if (window.notifier) {
            window.notifier.show(
                typeof currentLang !== 'undefined' && currentLang === 'en' ? "CONNECT WALLET" : "CONECTAR WALLET",
                typeof currentLang !== 'undefined' && currentLang === 'en' ? "Connect your wallet at the top right first." : "Primero conectá tu wallet en el botón superior."
            );
        } else {
            alert("Primero conectá tu wallet en el botón superior.");
        }
        return;
    }

    const balanceToClaim = parseInt(localStorage.getItem('gch_balance') || '0');
    
    // CASO 1: Si el saldo es 0 o negativo, hacemos una recarga gratis de 1000 tokens para que no se tranque el juego!
    if (balanceToClaim <= 0) {
        localStorage.setItem('gch_balance', '1000');
        if (window.game) {
            window.game.balance = 1000;
            window.game.updateStatsUI();
        }
        
        if (window.notifier) {
            window.notifier.show(
                typeof currentLang !== 'undefined' && currentLang === 'en' ? "REFUEL SUCCESSFUL ⚡" : "RECARGA EXITOSA ⚡",
                typeof currentLang !== 'undefined' && currentLang === 'en' ? "Received 1,000 $GCH to keep playing!" : "¡Recibiste 1,000 $GCH gratis para seguir jugando!"
            );
        } else {
            alert("⚡ ¡Recarga exitosa! Recibiste 1,000 $GCH.");
        }
        return;
    }

    // UI Feedback
    const claimBtn = document.getElementById('claimGCHBtn');
    if (claimBtn) {
        claimBtn.innerHTML = 'PROCESANDO FIRMA...';
        claimBtn.disabled = true;
    }

    // CASO 2: Si estamos en Modo Dev/Simulado con la wallet mock, simulamos la transacción blockchain
    if (userWalletAddress.startsWith("DevGoaL")) {
        console.log("Simulando firma de transacción en Devnet para entorno local...");
        if (claimBtn) {
            claimBtn.innerHTML = 'PROCESANDO FIRMA (MOCK)...';
        }
        
        setTimeout(() => {
            if (window.notifier) {
                window.notifier.show(
                    typeof currentLang !== 'undefined' && currentLang === 'en' ? "AIRDROP CLAIMED 🎉" : "AIRDROP COMPLETADO 🎉",
                    typeof currentLang !== 'undefined' && currentLang === 'en' ? `Validated ${balanceToClaim} $GCH in dev mode.` : `Se validaron tus ${balanceToClaim} $GCH en modo desarrollo.`,
                    'success'
                );
            } else {
                alert(`¡AIRDROP SIMULADO! 🎉\n\nSe han validado tus ${balanceToClaim} $GCH en modo desarrollo.`);
            }
            
            // Resetear balance local
            localStorage.setItem('gch_balance', '0');
            if (window.game) {
                window.game.balance = 0;
                window.game.updateStatsUI();
            }
            
            if (claimBtn) {
                claimBtn.innerHTML = typeof currentLang !== 'undefined' && currentLang === 'en' ? "CLAIM AIRDROP" : "RECLAMAR AIRDROP";
                claimBtn.disabled = false;
            }
        }, 1500);
        return;
    }

    try {
        console.log("Iniciando firma real de transacción en Devnet...");
        
        // 1. Inicializar la conexión
        const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");
        const fromPubkey = new solanaWeb3.PublicKey(userWalletAddress);
        
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
        
        // Buscar el juego de penaltis y resetear si existe
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
