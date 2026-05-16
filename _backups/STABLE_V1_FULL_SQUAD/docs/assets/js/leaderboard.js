/**
 * leaderboard.js - Gestión del Ranking Global GoalChain
 */

const leaderboardState = {
    topPlayers: []
};

async function initLeaderboard() {
    try {
        // En producción, esto sería una llamada a una API o a un Smart Contract de Solana
        // Por ahora, simulamos el fetch de los Top 10
        fetchSimulatedLeaderboard();
        renderLeaderboard();
    } catch (error) {
        console.error("Error al cargar el leaderboard:", error);
    }
}

function fetchSimulatedLeaderboard() {
    // Datos base para el ranking global
    leaderboardState.topPlayers = [
        { rank: 1, name: "SolanaWhale.sol", score: 12450, tier: "MYTHIC", color: "#ffd700" },
        { rank: 2, name: "DegenKing.sol", score: 9820, tier: "LEGENDARY", color: "#c0c0c0" },
        { rank: 3, name: "PhantomPro.sol", score: 8550, tier: "LEGENDARY", color: "#cd7f32" },
        { rank: 4, name: "CryptoStriker", score: 7200, tier: "EPIC", color: "#9945ff" },
        { rank: 5, name: "GoalMaster_99", score: 6800, tier: "EPIC", color: "#00e5ff" }
    ];

    // INTEGRACIÓN REAL: Si el usuario está conectado y tiene puntos, lo inyectamos en el ranking
    const wallet = localStorage.getItem('goalchain_wallet');
    const userPts = parseInt(localStorage.getItem('goalpoints') || '0');
    
    if (wallet && userPts > 0) {
        const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
        const userEntry = {
            rank: "Tú",
            name: shortWallet,
            score: userPts,
            tier: calculateTier(userPts),
            color: "#14f195",
            isUser: true
        };
        
        // Lo agregamos si no está ya en el top (simulado)
        leaderboardState.topPlayers.push(userEntry);
        // Ordenamos por score
        leaderboardState.topPlayers.sort((a, b) => b.score - a.score);
    }
}

function calculateTier(pts) {
    if (pts > 10000) return "MYTHIC";
    if (pts > 5000) return "LEGENDARY";
    if (pts > 2000) return "EPIC";
    return "RARE";
}

function renderLeaderboard() {
    const tbody = document.querySelector('#leaderboardTable tbody');
    if (!tbody) return;

    tbody.innerHTML = leaderboardState.topPlayers.map(p => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${p.isUser ? 'background: rgba(20,241,149,0.05);' : ''}">
            <td style="padding: 15px; font-weight: 900; color: ${p.color};">${p.rank === "Tú" ? '⭐ Tú' : '#' + p.rank}</td>
            <td style="padding: 15px;">${p.name}</td>
            <td style="padding: 15px; color: var(--primary); font-weight: 700;">${p.score.toLocaleString()}</td>
            <td style="padding: 15px;">
                <span class="badge" style="background: ${p.color}; color: black; font-size: 0.7rem; padding: 4px 10px; border-radius: 4px; font-weight: 900;">
                    ${p.tier}
                </span>
            </td>
        </tr>
    `).join('');
}

// Escuchar cambios de puntos para actualizar el leaderboard en tiempo real
window.addEventListener('storage', (e) => {
    if (e.key === 'goalpoints' || e.key === 'goalchain_wallet') {
        fetchSimulatedLeaderboard();
        renderLeaderboard();
    }
});

// También podemos exponer una función para forzar el update
window.updateLiveLeaderboard = () => {
    fetchSimulatedLeaderboard();
    renderLeaderboard();
};

document.addEventListener('DOMContentLoaded', initLeaderboard);
