/**
 * pack_opener.js - Lógica de Apertura de Sobres GoalChain
 */

const packState = {
    isOpening: false,
    players: []
};

// Mapeo de banderas (Sincronizado con nft_registry.js)
const FLAG_MAP = {
    "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Francia": "🇫🇷", "España": "🇪🇸",
    "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Alemania": "🇩🇪", "México": "🇲🇽", "Uruguay": "🇺🇾",
    "Egipto": "🇪🇬", "Polonia": "🇵🇱", "Croacia": "🇭🇷", "Corea del Sur": "🇰🇷",
    "Portugal": "🇵🇹", "Italia": "🇮🇹", "Países Bajos": "🇳🇱", "Bélgica": "🇧🇪", "EEUU": "🇺🇸"
};

function getCountryFlag(country) {
    return FLAG_MAP[country] || "🏳️";
}

function getPlayerImagePath(player) {
    if (NFT_IMAGE_MAP[player.id]) {
        return `assets/img/nfts/${NFT_IMAGE_MAP[player.id]}`;
    }
    const safeName = player.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_\-]/g, '');
    return `assets/img/nfts/${String(player.id).padStart(3, '0')}_${safeName}.png`;
}

async function initPackOpener() {
    try {
        const response = await fetch(`assets/data/players.json?v=${new Date().getTime()}`);
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
    pack.classList.add('shaking');
    
    // Sonido de carga
    const chargeSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    chargeSound.volume = 0.5;
    chargeSound.play();

    // Shake progresivo (más intenso al final)
    setTimeout(() => {
        pack.style.animationDuration = "0.05s"; // Aumentar velocidad
    }, 1500);

    setTimeout(() => {
        pack.classList.remove('shaking');
        pack.style.animationDuration = "";
        pack.classList.add('burst');
        
        const burstSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        burstSound.play();
        
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

    // Lógica de probabilidades (House Edge 2.0)
    const rand = Math.random() * 100;
    let targetRarity = "common";
    if (rand < 0.2) targetRarity = "mythic";
    else if (rand < 1.5) targetRarity = "legendary";
    else if (rand < 10.0) targetRarity = "epic";
    else if (rand < 35.0) targetRarity = "rare";

    const pool = packState.players.filter(p => p.rarity === targetRarity);
    const player = pool[Math.floor(Math.random() * pool.length)];

    modal.classList.add('active');
    const imgPath = getPlayerImagePath(player);
    const flag = getCountryFlag(player.country);
    
    container.innerHTML = `
        <div class="nft-card-3d in-view" data-rarity="${player.rarity}" id="revealedCard" style="transform: scale(1.1);">
            <div class="card-inner">
                <div class="card-front">
                    <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/img/nfts/001_lionel_bitcoin.png'">
                    <div class="nft-overlay" style="opacity:1;">
                        <div class="player-info">
                            <span class="player-num">#${player.number}</span>
                            <span class="player-flag">${flag}</span>
                            <span class="player-name">${player.name}</span>
                        </div>
                    </div>
                </div>
                <div class="card-back">
                    <div class="ficha-header">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="ficha-title">RECUPERADO</span>
                            <span style="font-size: 1.2rem;">${flag}</span>
                        </div>
                        <h3 class="ficha-name">${player.name}</h3>
                    </div>
                    <div class="contract-panel" style="background: rgba(20, 241, 149, 0.1);">
                        <div style="font-size: 0.7rem; color: var(--primary); font-weight: 900; margin-bottom: 5px;">ESTADO DE MINT</div>
                        <div style="font-family: monospace; font-size: 0.65rem; color: #fff;">ID: ${player.id}</div>
                        <div style="font-family: monospace; font-size: 0.65rem; color: #fff;">RARITY: ${player.rarity.toUpperCase()}</div>
                    </div>
                    <div style="margin-top: auto; padding: 10px; text-align: center; border: 1px dashed var(--primary); border-radius: 8px;">
                        <span style="font-size: 0.6rem; color: var(--text-dim);">DUEÑO ACTUAL</span><br>
                        <span style="font-size: 0.7rem; color: #fff; font-weight: 700;">CONECTA WALLET</span>
                    </div>
                </div>
            </div>
        </div>
        <div style="text-align:center; margin-top: 1.5rem;">
            <h2 style="color: #fff; text-transform: uppercase; letter-spacing: 3px; font-size: 1.5rem; text-shadow: 0 0 20px rgba(255,255,255,0.3);">¡${player.rarity.toUpperCase()} REVELADO!</h2>
            <p style="color: var(--primary); font-size: 0.8rem; font-weight: 700; margin-top: 5px;">TOCA LA CARTA PARA VER EL CONTRATO</p>
        </div>
    `;

    // Habilitar giro en la carta revelada
    const revealedCard = document.getElementById('revealedCard');
    revealedCard.addEventListener('click', () => {
        revealedCard.classList.toggle('is-flipped');
    });

    // Confeti y Efectos
    if (player.rarity === "mythic" || player.rarity === "legendary") {
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 },
            colors: player.rarity === "mythic" ? ['#ffd700', '#ffffff', '#ffb800'] : ['#9945ff', '#14f195', '#ffffff']
        });
    } else if (player.rarity === "epic") {
        confetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#9945ff', '#ffffff']
        });
    }

    setTimeout(() => {
        closeBtn.style.display = 'block';
    }, 2000);
}

document.addEventListener('DOMContentLoaded', initPackOpener);
