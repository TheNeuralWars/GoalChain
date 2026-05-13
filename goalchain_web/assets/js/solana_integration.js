let userWalletAddress = null;

async function connectWallet() {
    try {
        const { solana } = window;

        if (solana && solana.isPhantom) {
            const response = await solana.connect();
            userWalletAddress = response.publicKey.toString();
            console.log("Wallet conectada:", userWalletAddress);
            updateWalletUI();
        } else {
            alert("¡Phantom Wallet no detectada! Por favor, instálala para continuar.");
            window.open("https://phantom.app/", "_blank");
        }
    } catch (error) {
        console.error("Error al conectar wallet:", error);
    }
}

function updateWalletUI() {
    if (userWalletAddress) {
        const connectBtns = document.querySelectorAll('.btn-wallet');
        const shortAddress = `${userWalletAddress.slice(0, 4)}...${userWalletAddress.slice(-4)}`;
        
        connectBtns.forEach(btn => {
            btn.innerText = shortAddress;
            btn.style.background = 'var(--secondary)'; // Cambiar a púrpura de Solana
        });

        // Ocultar campo de email en la whitelist si ya tenemos la wallet
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.placeholder = "¡Wallet Conectada con éxito!";
            emailInput.disabled = true;
            emailInput.value = userWalletAddress;
        }

        // Mostrar sección de recompensas
        const rewardsSection = document.getElementById('rewards');
        if (rewardsSection) {
            rewardsSection.style.display = 'block';
            
            // Generar Link de Referidos
            const refLink = `${window.location.origin}/?ref=${userWalletAddress}`;
            document.getElementById('referral-link-display').innerText = refLink;
            
            // Actualizar link de X (Twitter)
            const shareBtn = document.getElementById('share-x-task');
            if (shareBtn) {
                const tweetText = encodeURIComponent(`¡Acabo de unirme a la Whitelist de GoalChain! ⚽🚀 Jugando para ganar en @Solana. Únete aquí: ${refLink} #GoalChain #Solana`);
                shareBtn.href = `https://twitter.com/intent/tweet?text=${tweetText}`;
            }
        }
    }
}

function copyReferralLink() {
    const link = document.getElementById('referral-link-display').innerText;
    navigator.clipboard.writeText(link).then(() => {
        alert("¡Enlace de referidos copiado al portapapeles! 🚀");
    });
}

// Escuchar clics en el documento para manejar botones dinámicos (Delegación de Eventos)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-wallet') || e.target.closest('.btn-wallet')) {
        e.preventDefault();
        console.log("Intentando conectar wallet...");
        connectWallet();
    }
});

// Comprobar si ya estaba conectado (Auto-connect si el usuario ya dio permiso)
window.addEventListener('load', async () => {
    // Pequeña espera para asegurar que Phantom haya inyectado el objeto solana
    setTimeout(async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                // intentamos reconectar silenciosamente
                const resp = await window.solana.connect({ onlyIfTrusted: true });
                userWalletAddress = resp.publicKey.toString();
                console.log("Auto-reconexión exitosa:", userWalletAddress);
                updateWalletUI();
            } catch (err) {
                // El usuario no ha confiado en el sitio aún, está bien.
                console.log("Esperando interacción del usuario para conectar wallet.");
            }

            window.solana.on("accountChanged", (publicKey) => {
                if (publicKey) {
                    userWalletAddress = publicKey.toString();
                    updateWalletUI();
                } else {
                    window.location.reload();
                }
            });
        }
    }, 500);
});

