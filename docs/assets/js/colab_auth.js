/**
 * colab_auth.js - Gestión de Acceso por Wallet
 * Aquí definimos quién tiene permiso para ver qué.
 */

// Lista de Wallets Autorizadas (Nivel de Acceso)
const AUTHORIZED_WALLETS = {
    // DEV TEAM
    "D6AabfJnF6sxuAymDz7JMbB4r2i2FaQVzPb7G7nhMMxo": "dev", // Nico (Admin)
    "9j89K...Nico": "dev",
    "Gv7T...Hermano1": "dev",
    "FbDh...Hermano2": "dev",

    // INFLUENCERS
    "HqXS...Influencer1": "influencer",
    "PzNv...Influencer2": "influencer",

    // PARTNERS
    "Cco7...Partner1": "partner"
};

let currentWallet = null;
let currentRole = null;

async function connectWallet() {
    try {
        const { solana } = window;

        if (solana && solana.isPhantom) {
            const response = await solana.connect();
            const pubKey = response.publicKey.toString();
            verifyAccess(pubKey);
        } else {
            alert("Phantom Wallet no detectada.");
            window.open("https://phantom.app/", "_blank");
        }
    } catch (error) {
        console.error("Error Auth:", error);
    }
}

function verifyAccess(pubKey) {
    // Lógica de verificación: En una fase real, esto se consultaría a una DB o Smart Contract.
    // Para el MVP, usamos el mapeo AUTHORIZED_WALLETS.
    
    // MOCK: Si la wallet empieza por una letra común, le damos acceso de prueba
    // (Esto es solo para que puedas probarlo ahora mismo sin configurar todas las claves).
    const role = AUTHORIZED_WALLETS[pubKey] || (pubKey.startsWith('A') || pubKey.startsWith('B') ? 'dev' : null);

    if (role) {
        currentWallet = pubKey;
        currentRole = role;
        grantAccess();
    } else {
        document.getElementById('accessDenied').style.display = 'block';
    }
}

function grantAccess() {
    document.getElementById('loginGateway').style.display = 'none';
    document.getElementById('colabApp').style.display = 'block';
    
    document.getElementById('userAddress').innerText = `${currentWallet.slice(0, 4)}...${currentWallet.slice(-4)}`;
    document.getElementById('userRole').innerText = currentRole;

    // Configurar visibilidad de pestañas según rol
    if (currentRole === 'influencer') {
        switchTab('influencers');
        document.getElementById('tabDev').style.display = 'none';
        document.getElementById('tabPartners').style.display = 'none';
    } else if (currentRole === 'partner') {
        switchTab('partners');
        document.getElementById('tabDev').style.display = 'none';
    }

    // Inicializar datos de la app
    if (window.initColabApp) window.initColabApp();
}

document.getElementById('connectBtn').addEventListener('click', connectWallet);

// Escuchar cambios de cuenta
if (window.solana) {
    window.solana.on("accountChanged", (publicKey) => {
        if (publicKey) {
            verifyAccess(publicKey.toString());
        } else {
            window.location.reload();
        }
    });
}
