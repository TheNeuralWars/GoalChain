/**
 * pack_opener.js - Lógica de Apertura de Sobres GoalChain (v3.0)
 */

const packState = {
    isOpening: false,
    players: []
};

async function initPackOpener() {
    try {
        const response = await fetch(`assets/data/players.json?v=${new Date().getTime()}`);
        packState.players = await response.json();
        setupPackEvents();
    } catch (error) {
        console.error("Error al cargar jugadores:", error);
    }
}

function setupPackEvents() {
    const pack = document.getElementById('mysteryPack');
    const openBtn = document.getElementById('openPackBtn');
    const closeBtn = document.getElementById('closeRevealBtn');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            if (packState.isOpening) return;
            triggerPackOpening();
        });
    }

    if (pack) {
        pack.addEventListener('click', () => {
            if (packState.isOpening) return;
            triggerPackOpening();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('revealModal');
            modal.classList.remove('is-active');
            document.getElementById('revealedCardContainer').innerHTML = '';
            closeBtn.style.display = 'none';
            packState.isOpening = false;
        });
    }
}

function triggerPackOpening() {
    packState.isOpening = true;
    const pack = document.getElementById('mysteryPack');
    const openBtn = document.getElementById('openPackBtn');

    if (openBtn) openBtn.disabled = true;
    if (pack) pack.classList.add('is-shaking');

    // Efecto de carga (Shake progresivo)
    setTimeout(() => {
        if (pack) pack.style.animationDuration = "0.05s";
    }, 1500);

    setTimeout(() => {
        if (pack) pack.classList.remove('is-shaking');
        executeReveal();
    }, 2500);
}

function executeReveal() {
    const modal = document.getElementById('revealModal');
    const container = document.getElementById('revealedCardContainer');
    const closeBtn = document.getElementById('closeRevealBtn');

    // Seleccionar jugador aleatorio con pesos de rareza
    const rand = Math.random() * 100;
    let rarity = "common";
    if (rand < 1) rarity = "mythic";
    else if (rand < 5) rarity = "legendary";
    else if (rand < 15) rarity = "epic";
    else if (rand < 40) rarity = "rare";

    const pool = packState.players.filter(p => p.rarity === rarity);
    const player = pool[Math.floor(Math.random() * pool.length)];

    // Mostrar Modal
    modal.classList.add('is-active');
    
    // Inyectar HTML de la carta (Sincronizado con nft_registry.js)
    const imgPath = `assets/img/nfts/${String(player.id).padStart(3, '0')}_${player.name.toLowerCase().replace(/ /g, '_')}.png`;
    const flag = FLAG_MAP[player.country] || "🏳️";

    container.innerHTML = `
        <div class="nft-card-3d in-view" data-rarity="${player.rarity}" id="revealedCard">
            <div class="card-inner">
                <div class="card-front">
                    <div class="glare"></div>
                    <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/img/nfts/001_lionel_satoshi.png'">
                    <div class="nft-overlay">
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
                            <span class="ficha-title">GENESIS SQUAD</span>
                            <span style="font-size: 1.2rem;">${flag}</span>
                        </div>
                        <h3 class="ficha-name">${player.name}</h3>
                    </div>
                    <div class="contract-panel">
                        <div class="contract-label">SMART CONTRACT DATA</div>
                        <div class="contract-value">ID: ${player.id}</div>
                        <div class="contract-value">RARITY: ${player.rarity.toUpperCase()}</div>
                        <div class="contract-value">POS: ${player.position}</div>
                    </div>
                    <div class="contract-qr">
                        <span style="font-size: 0.6rem; color: var(--solana-green);">VERIFICADO EN SOLANA</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="reveal-text">
            <h2 style="color: #fff; margin-top: 20px;">¡${player.rarity.toUpperCase()}!</h2>
        </div>
    `;

    // Activar interacción 3D en la carta revelada
    const card = document.getElementById('revealedCard');
    card.addEventListener('click', () => card.classList.toggle('is-flipped'));

    // Explosión de Partículas
    triggerExplosion();

    // Mostrar botón de cierre tras delay
    setTimeout(() => {
        closeBtn.style.display = 'block';
        if (document.getElementById('openPackBtn')) {
            document.getElementById('openPackBtn').disabled = false;
        }
    }, 2000);
}

function triggerExplosion() {
    const canvas = document.getElementById('revealParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: Math.random() * 5 + 2,
            color: Math.random() > 0.5 ? '#14f195' : '#9945ff',
            life: 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) particles.splice(i, 1);
            
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        if (particles.length > 0) requestAnimationFrame(animate);
    }
    animate();
}

const FLAG_MAP = {
    "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Francia": "🇫🇷", "España": "🇪🇸",
    "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Alemania": "🇩🇪", "México": "🇲🇽", "Uruguay": "🇺🇾",
    "Portugal": "🇵🇹", "Italia": "🇮🇹", "Bélgica": "🇧🇪", "EEUU": "🇺🇸"
};

document.addEventListener('DOMContentLoaded', initPackOpener);
