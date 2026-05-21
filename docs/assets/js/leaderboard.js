/**
 * leaderboard.js - Ranking Global Real GoalChain
 * Carga el Top 50 desde el backend de Google Sheets.
 */

const TIER_MAP = [
    { min: 10000, label: 'MYTHIC',    color: '#ffd700' },
    { min: 5000,  label: 'LEGENDARY', color: '#a855f7' },
    { min: 2000,  label: 'EPIC',      color: '#00e5ff' },
    { min: 500,   label: 'RARE',      color: '#14f195' },
    { min: 0,     label: 'COMMON',    color: '#8a8a9a' },
];

function getTier(pts) {
    return TIER_MAP.find(t => pts >= t.min) || TIER_MAP[TIER_MAP.length - 1];
}

async function initLeaderboard() {
    renderLeaderboardSkeleton();
    
    // Intentar cargar datos reales del servidor
    const realData = window.GoalPointsAPI
        ? await window.GoalPointsAPI.getLeaderboard()
        : null;
    
    if (realData && realData.length > 0) {
        renderLeaderboard(realData);
    } else {
        // Fallback: datos simulados si el servidor no responde
        renderLeaderboard(getSimulatedData());
    }
}

function getSimulatedData() {
    return [
        { display: 'SolanaWhale...7f2a', points: 12450 },
        { display: 'DegenKing...3bc1',   points: 9820  },
        { display: 'PhantomPro...a44e',  points: 8550  },
        { display: 'CryptoStrike...99f', points: 7200  },
        { display: 'GoalMaster...12d',   points: 6800  },
    ];
}

function renderLeaderboardSkeleton() {
    const tbody = document.querySelector('#leaderboardTable tbody');
    if (!tbody) return;
    tbody.innerHTML = Array(5).fill(0).map(() => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding:15px;"><div class="skeleton" style="width:30px;height:18px;border-radius:4px;background:rgba(255,255,255,0.08);animation:pulse 1.5s infinite;"></div></td>
            <td style="padding:15px;"><div class="skeleton" style="width:120px;height:18px;border-radius:4px;background:rgba(255,255,255,0.08);animation:pulse 1.5s infinite;"></div></td>
            <td style="padding:15px;"><div class="skeleton" style="width:60px;height:18px;border-radius:4px;background:rgba(255,255,255,0.08);animation:pulse 1.5s infinite;"></div></td>
            <td style="padding:15px;"><div class="skeleton" style="width:70px;height:18px;border-radius:4px;background:rgba(255,255,255,0.08);animation:pulse 1.5s infinite;"></div></td>
        </tr>
    `).join('');
}

function renderLeaderboard(players) {
    const tbody = document.querySelector('#leaderboardTable tbody');
    if (!tbody) return;

    // Inyectar al usuario actual si tiene wallet y puntos
    const wallet   = localStorage.getItem('goalchain_wallet');
    const userPts  = parseInt(localStorage.getItem('goalpoints') || '0');
    let userRank   = null;

    let combined = [...players];

    if (wallet && userPts > 0) {
        const shortWallet = wallet.slice(0, 6) + '...' + wallet.slice(-4);
        // Verificar si ya está en la lista
        const existingIndex = combined.findIndex(p => p.display === shortWallet || p.wallet === wallet);
        
        if (existingIndex === -1) {
            // No está, agregarlo
            combined.push({ display: shortWallet, points: userPts, wallet, isUser: true });
        } else {
            combined[existingIndex].isUser = true;
            // Actualizar puntos si los locales son mayores
            if (userPts > combined[existingIndex].points) {
                combined[existingIndex].points = userPts;
            }
        }
        
        combined.sort((a, b) => b.points - a.points);
        userRank = combined.findIndex(p => p.isUser) + 1;
    }

    tbody.innerHTML = combined.slice(0, 10).map((p, i) => {
        const rank  = i + 1;
        const tier  = getTier(p.points);
        const isUser = p.isUser;
        const rankDisplay = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        
        return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${isUser ? 'background: rgba(20,241,149,0.06); box-shadow: inset 0 0 20px rgba(20,241,149,0.05);' : ''}">
            <td style="padding: 14px 10px; font-weight: 900; color: ${tier.color}; font-size: ${rank <= 3 ? '1.2rem' : '1rem'};">
                ${rankDisplay}${isUser ? ' ⭐' : ''}
            </td>
            <td style="padding: 14px 10px; color: ${isUser ? 'var(--primary)' : 'var(--text)'} ; font-weight: ${isUser ? '700' : '400'};">
                ${p.display}${isUser ? ' <span style="font-size:0.65rem;color:var(--primary);border:1px solid var(--primary);padding:1px 5px;border-radius:3px;margin-left:4px;">TÚ</span>' : ''}
            </td>
            <td style="padding: 14px 10px; color: var(--primary); font-weight: 700; font-size: 1.05rem;">
                ${p.points.toLocaleString()} <span style="font-size:0.65rem;color:var(--text-dim);font-weight:400;">pts</span>
            </td>
            <td style="padding: 14px 10px;">
                <span style="background: ${tier.color}20; color: ${tier.color}; border: 1px solid ${tier.color}60; font-size: 0.65rem; padding: 3px 8px; border-radius: 4px; font-weight: 900; letter-spacing: 0.5px;">
                    ${tier.label}
                </span>
            </td>
        </tr>`;
    }).join('');
    
    // Mostrar posición del usuario si está fuera del Top 10
    const userPositionEl = document.getElementById('userPosition');
    if (userPositionEl && userRank && userRank > 10) {
        userPositionEl.innerHTML = `Tu posición actual: <strong style="color:var(--primary);">#${userRank}</strong> con ${userPts.toLocaleString()} pts`;
        userPositionEl.style.display = 'block';
    } else if (userPositionEl) {
        userPositionEl.style.display = 'none';
    }
}

// Escuchar cambios locales de puntos para actualizar el ranking en tiempo real
window.addEventListener('storage', (e) => {
    if (e.key === 'goalpoints' || e.key === 'goalchain_wallet') {
        initLeaderboard();
    }
});

window.updateLiveLeaderboard = () => initLeaderboard();

document.addEventListener('DOMContentLoaded', () => {
    // Cargar puntos del servidor si hay wallet conectada
    const wallet = localStorage.getItem('goalchain_wallet');
    if (wallet && window.GoalPointsAPI) {
        window.GoalPointsAPI.load(wallet);
    }
    initLeaderboard();
});
