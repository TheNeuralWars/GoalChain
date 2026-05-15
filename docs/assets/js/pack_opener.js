/**
 * pack_opener.js - Lógica de Apertura de Sobres GoalChain (v3.0)
 */

const packState = {
    isOpening: false,
    players: [],
    inventory: JSON.parse(localStorage.getItem('goalchain_inventory')) || []
};

async function initPackOpener() {
    try {
        const response = await fetch(`assets/data/players.json?v=${new Date().getTime()}`);
        packState.players = await response.json();
        setupPackEvents();
        renderInventory();
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
            renderInventory(); // Actualizar la vista tras cerrar
        });
    }
}

function triggerPackOpening() {
    packState.isOpening = true;
    const pack = document.getElementById('mysteryPack');
    const openBtn = document.getElementById('openPackBtn');

    if (openBtn) openBtn.disabled = true;
    if (pack) pack.classList.add('is-shaking');
    if (window.notifier) window.notifier.play('click');

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

    if (window.notifier) {
        window.notifier.play('success');
    }

    const rand = Math.random() * 100;
    let rarity = "common";
    if (rand < 1) rarity = "mythic";
    else if (rand < 5) rarity = "legendary";
    else if (rand < 15) rarity = "epic";
    else if (rand < 40) rarity = "rare";

    const pool = packState.players.filter(p => p.rarity === rarity);
    const player = pool[Math.floor(Math.random() * pool.length)];

    // GUARDAR EN INVENTARIO
    packState.inventory.push(player);
    localStorage.setItem('goalchain_inventory', JSON.stringify(packState.inventory));

    modal.classList.add('is-active');
    
    if (window.notifier) {
        const type = (player.rarity === 'mythic' || player.rarity === 'legendary') ? 'info' : 'success';
        window.notifier.show('¡NUEVA LEYENDA!', `Has obtenido a ${player.name} (${player.rarity.toUpperCase()})`, type);
    }
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
                    </div>
                </div>
            </div>
        </div>
    `;

    const card = document.getElementById('revealedCard');
    if (card) {
        card.addEventListener('click', () => card.classList.toggle('is-flipped'));
    }

    triggerExplosion();

    setTimeout(() => {
        if (closeBtn) closeBtn.style.display = 'block';
        if (document.getElementById('openPackBtn')) {
            document.getElementById('openPackBtn').disabled = false;
        }
    }, 1500);
}

function renderInventory(filter = 'all') {
    const grid = document.getElementById('collectionGrid');
    if (!grid) return;

    const filteredItems = filter === 'all' 
        ? packState.inventory 
        : packState.inventory.filter(p => p.rarity === filter);

    if (filteredItems.length === 0) {
        grid.innerHTML = `<div class="empty-inventory"><p>No tenés jugadores en esta categoría.</p></div>`;
        return;
    }

    grid.innerHTML = filteredItems.map(player => {
        const imgPath = `assets/img/nfts/${String(player.id).padStart(3, '0')}_${player.name.toLowerCase().replace(/ /g, '_')}.png`;
        const flag = FLAG_MAP[player.country] || "🏳️";
        return `
            <div class="nft-card-3d in-view" data-rarity="${player.rarity}" style="transform: scale(0.7); margin: -40px;">
                <div class="card-inner">
                    <div class="card-front">
                        <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/img/nfts/001_lionel_satoshi.png'">
                        <div class="nft-overlay">
                            <div class="player-info">
                                <span class="player-name">${player.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.filterCollection = (rarity) => {
    // UI Update
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === rarity) btn.classList.add('active');
        if (rarity === 'all' && btn.innerText.toLowerCase() === 'todos') btn.classList.add('active');
    });
    renderInventory(rarity);
};

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
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: Math.random() * 4 + 1,
            color: Math.random() > 0.5 ? '#14f195' : '#9945ff',
            life: 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.02;
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
