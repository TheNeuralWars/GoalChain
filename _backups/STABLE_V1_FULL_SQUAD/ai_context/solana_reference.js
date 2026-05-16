// WALLET CONNECT V2 (Merged & Polished) - GoalChain
let userWalletAddress = localStorage.getItem('goalchain_wallet') || null;

async function connectWallet() {
    try {
        const { solana } = window;

        if (!solana || !solana.isPhantom) {
            alert("🛡️ Phantom Wallet no detectada.\n\nTe llevamos a descargarla...");
            window.open("https://phantom.app/", "_blank");
            return;
        }

        const response = await solana.connect();
        userWalletAddress = response.publicKey.toString();

        // Persistencia en localStorage
        localStorage.setItem('goalchain_wallet', userWalletAddress);

        console.log("✅ Wallet conectada:", userWalletAddress);

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

function updateWalletUI() {
    if (!userWalletAddress) return;

    const shortAddress = `${userWalletAddress.slice(0, 4)}...${userWalletAddress.slice(-4)}`;

    // 1. Actualizar TODOS los botones .btn-wallet con estilo Solana Gradient
    document.querySelectorAll('.btn-wallet').forEach(btn => {
        btn.innerHTML = `👛 ${shortAddress}`;
        btn.style.background = 'linear-gradient(90deg, #14f195, #9945ff)';
        btn.style.color = '#000';
        btn.style.fontWeight = '900';
        btn.style.boxShadow = '0 0 20px rgba(20, 241, 149, 0.6)';
        btn.style.border = 'none';
    });

    // 2. Habilitar y configurar Whitelist
    const emailInput = document.getElementById('whitelistEmail');
    if (emailInput) {
        emailInput.placeholder = "Escribe tu email para registrarte...";
        emailInput.disabled = false;
    }

    const whitelistForm = document.getElementById('whitelistForm');
    if (whitelistForm && !whitelistForm.dataset.handled) {
        whitelistForm.dataset.handled = "true";
        whitelistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('whitelistEmail').value;
            const wallet = userWalletAddress;

            try {
                const response = await fetch('http://localhost:3001/api/whitelist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wallet, email })
                });

                const result = await response.json();
                if (result.success) {
                    alert("¡Éxito! Te has unido a la Whitelist de GoalChain. ⚽🔥");
                    whitelistForm.innerHTML = `<h3 style='color:var(--primary); margin: 20px 0;'>✅ ¡Ya estás dentro!</h3><p style='font-size:0.8rem; color:var(--text-dim);'>Wallet: ${wallet.slice(0,6)}...${wallet.slice(-4)}</p>`;
                } else {
                    alert("Hubo un problema al registrarte.");
                }
            } catch (err) {
                console.error("Whitelist Error:", err);
                alert("Error de conexión con la API (Asegúrate de que el servidor esté corriendo).");
            }
        });
    }

    // 3. Generar Link de Referidos y actualizar UI Social
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
}

function disconnectWallet() {
    userWalletAddress = null;
    localStorage.removeItem('goalchain_wallet');
    location.reload();
}

function copyReferralLink() {
    const referralDisplay = document.getElementById('referral-link-display');
    if (referralDisplay && referralDisplay.innerText !== "Conecta tu wallet para generar...") {
        navigator.clipboard.writeText(referralDisplay.innerText).then(() => {
            alert("¡Enlace de referidos copiado! 🚀");
        });
    }
}

// Inicialización y Listeners de Solana
window.addEventListener('load', async () => {
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
    if (e.target.classList.contains('btn-wallet') || e.target.closest('.btn-wallet')) {
        e.preventDefault();
        connectWallet();
    }
});
