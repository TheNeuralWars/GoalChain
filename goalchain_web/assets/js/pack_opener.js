/**
 * pack_opener.js - Lógica de Apertura de Sobres GoalChain
 */

const packState = {
    isOpening: false,
    players: []
};

async function initPackOpener() {
    try {
        const response = await fetch('assets/data/players.json');
        packState.players = await response.json();
        
        setupPackListeners();
    } catch (error) {
        console.error("Error al cargar jugadores para el opener:", error);
    }
}

function setupPackListeners() {
    const openBtn = document.getElementById('openPackBtn');
    const pack = document.getElementById('mysteryPack');
    const modal = document.getElementById('revealModal');
    const closeBtn = document.getElementById('closeRevealBtn');

    if (!openBtn || !pack) return;

    openBtn.addEventListener('click', () => {
        if (packState.isOpening) return;
        startOpeningSequence();
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.getElementById('revealedCardContainer').innerHTML = '';
        closeBtn.style.display = 'none';
        pack.classList.remove('burst');
        packState.isOpening = false;
    });
}

function startOpeningSequence() {
    packState.isOpening = true;
    const pack = document.getElementById('mysteryPack');
    const openBtn = document.getElementById('openPackBtn');

    openBtn.disabled = true;
    openBtn.innerText = "MINTEANDO EN SOLANA...";

    // 1. Shaking
    pack.classList.add('shaking');

    // 2. Simular delay de red (2.5s)
    setTimeout(() => {
        pack.classList.remove('shaking');
        pack.classList.add('burst');
        
        // 3. Reveal
        setTimeout(() => {
            revealPlayer();
            openBtn.disabled = false;
            openBtn.innerText = "ABRIR SOBRE (100 $GCH)";
        }, 600);
    }, 2500);
}

function revealPlayer() {
    const modal = document.getElementById('revealModal');
    const container = document.getElementById('revealedCardContainer');
    const closeBtn = document.getElementById('closeRevealBtn');

    // Lógica de probabilidades
    const rand = Math.random() * 100;
    let targetRarity = "common";
    if (rand < 0.1) targetRarity = "mythic";
    else if (rand < 1.0) targetRarity = "legendary";
    else if (rand < 10.0) targetRarity = "epic";
    else if (rand < 40.0) targetRarity = "rare";

    const pool = packState.players.filter(p => p.rarity === targetRarity);
    const player = pool[Math.floor(Math.random() * pool.length)];

    modal.classList.add('active');
    
    // Crear el cromo revelado
    const imgPath = typeof window.getPlayerImagePath === 'function'
        ? window.getPlayerImagePath(player)
        : `assets/images/nfts/${String(player.id).padStart(3, '0')}_${player.name.toLowerCase().replace(/ /g, '_')}.png`;
    
    container.innerHTML = `
        <div class="nft-card-3d" data-rarity="${player.rarity}" style="transform: scale(1.2);">
            <div class="card-inner">
                <div class="card-front">
                    <img src="${imgPath}" alt="${player.name}" onerror="handlePlayerImageError(this)">
                    <div class="nft-overlay" style="opacity:1;">
                        <div class="player-info">
                            <span class="player-num">#${player.number}</span>
                            <span class="player-name">${player.name}</span>
                        </div>
                    </div>
                </div>
            </div>
            <h2 style="color: #fff; margin-top: 2rem; text-transform: uppercase; letter-spacing: 2px;">¡TE TOCÓ UN ${player.rarity.toUpperCase()}!</h2>
        </div>
    `;

    setTimeout(() => {
        closeBtn.style.display = 'block';
    }, 1500);
}

document.addEventListener('DOMContentLoaded', initPackOpener);
