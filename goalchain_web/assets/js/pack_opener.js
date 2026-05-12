/**
 * pack_opener.js - Lógica de Apertura de Sobres GoalChain
 */

const packState = {
    isOpening: false,
    players: []
};

// Manual image map for generated NFTs (Sync with nft_registry.js)
const NFT_IMAGE_MAP = {
    1: "001_lionel_bitcoin.png",
    2: "002_dibu_block.png",
    3: "020_julian_alvaswap.png",
    14: "014_mo_solana.png",
    15: "015_pedri_protocol.png",
    16: "016_fede_valweb3.png",
    17: "017_darwin_nunft.png",
    18: "018_bukayo_stock.png",
    19: "019_phil_fod_ether.png",
    20: "020_enzo_ledger.png",
    21: "021_luis_swaswap.png",
    22: "022_bernardo_solana.png",
    24: "024_rodri_protocol.png",
    26: "026_joshua_bit_mmi.png",
    27: "027_vini_burner_jr.png",
    28: "028_endrick_chain.png",
    30: "030_kai_havests.png",
    32: "032_casemiro_chain.png",
    33: "033_allison_block.png",
    53: "053_kylian_m-bag-pé.png",
    79: "079_jude_whale-ingham.png",
    80: "080_harry_chain.png",
    105: "105_lamine_ya-hype.png",
    106: "106_pedri_p2p.png",
    131: "131_jamal_moon-siala.png",
    157: "157_cristiano_holdaldo.png"
};

function getPlayerImagePath(player) {
    if (NFT_IMAGE_MAP[player.id]) {
        return `assets/img/nfts/${NFT_IMAGE_MAP[player.id]}`;
    }
    const safeName = player.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_\-]/g, '');
    return `assets/img/nfts/${String(player.id).padStart(3, '0')}_${safeName}.png`;
}

async function initPackOpener() {
    try {
        // Cache busting con timestamp para asegurar datos frescos
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

    // 1. Shaking
    pack.classList.add('shaking');
    
    // Sonido de carga/tensión
    const chargeSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    chargeSound.volume = 0.5;
    chargeSound.play();

    // 2. Simular delay de red (2.5s)
    setTimeout(() => {
        pack.classList.remove('shaking');
        pack.classList.add('burst');
        
        // Sonido de explosión/revelación
        const burstSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        burstSound.play();
        
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
    
    // Crear el cromo revelado usando la lógica centralizada
    const imgPath = getPlayerImagePath(player);
    
    container.innerHTML = `
        <div class="nft-card-3d" data-rarity="${player.rarity}" style="transform: scale(1.2);">
            <div class="card-inner">
                <div class="card-front">
                    <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/img/nfts/001_lionel_bitcoin.png'">
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

    // Disparar Confeti para rarezas altas
    if (player.rarity === "mythic" || player.rarity === "legendary") {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: player.rarity === "mythic" ? ['#ffd700', '#ffffff'] : ['#9945ff', '#14f195']
        });
    }

    setTimeout(() => {
        closeBtn.style.display = 'block';
    }, 1500);
}

document.addEventListener('DOMContentLoaded', initPackOpener);
