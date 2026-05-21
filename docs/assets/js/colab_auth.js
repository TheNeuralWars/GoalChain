/**
 * colab_auth.js - Gestión de Acceso por Wallet
 * Aquí definimos quién tiene permiso para ver qué.
 */

// Lista de Wallets Autorizadas (Nivel de Acceso)
const AUTHORIZED_WALLETS = {
    // DEV TEAM
    "D6AabfJnF6sxuAymDz7JMbB4r2i2FaQVzPb7G7nhMMxo": "dev", // Nico (Admin)
    "GJFz3VmrQGTUqcapRkKZ9RHu11CYUCmRAfEBfxi5DED2": "dev", // Lucas (Team)

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
    if (!pubKey) return;
    const normalizedKey = pubKey.trim();
    console.log("GoalChain Auth: Intentando acceder con...", normalizedKey);

    // Búsqueda exacta en la lista
    let role = AUTHORIZED_WALLETS[normalizedKey];

    // LOG PARA DEBUG (Lucas puede ver esto en la consola F12)
    if (!role) {
        console.warn("DEBUG: La wallet " + normalizedKey + " no está en la lista de autorizados.");
    }

    // Fallback: Si no está en la lista pero es tu wallet (D6Aa...), forzar dev
    if (!role && normalizedKey === "D6AabfJnF6sxuAymDz7JMbB4r2i2FaQVzPb7G7nhMMxo") {
        role = "dev";
    }

    // Doble verificación para Lucas (Hardcoded por si acaso)
    if (!role && normalizedKey === "GJFz3VmrQGTUqcapRkKZ9RHu11CYUCmRAfEBfxi5DED2") {
        role = "dev";
    }

    if (role) {
        console.log("Acceso concedido como:", role);
        currentWallet = normalizedKey;
        currentRole = role;
        grantAccess();
    } else {
        console.warn("Acceso denegado para:", normalizedKey);
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
