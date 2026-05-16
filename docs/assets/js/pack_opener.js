/**
 * pack_opener.js - Lógica de Apertura de Sobres GoalChain (v3.1 - Epic Reveal)
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
            renderInventory(); 
        });
    }
}

function triggerPackOpening() {
    packState.isOpening = true;
    const pack = document.getElementById('mysteryPack');
    const openBtn = document.getElementById('openPackBtn');

    if (openBtn) {
        openBtn.disabled = true;
        const messages = ["CONNECTING TO VAULT...", "FETCHING BIOMETRICS...", "SYNCING SOLANA...", "MINTING NFT...", "REVEALING..."];
        let msgIdx = 0;
        const msgInterval = setInterval(() => {
            openBtn.innerText = messages[msgIdx++];
            if(msgIdx >= messages.length) clearInterval(msgInterval);
        }, 400);
    }
    
    if (pack) {
        pack.classList.add('is-shaking');
        pack.style.filter = "brightness(1.5) drop-shadow(0 0 30px var(--primary))";
    }

    if (window.notifier) window.notifier.play('click');

    setTimeout(() => {
        if (pack) {
            pack.style.animationDuration = "0.05s";
            pack.style.transform = "scale(1.2)";
        }
    }, 1500);

    setTimeout(() => {
        if (pack) {
            pack.classList.remove('is-shaking');
            pack.style.filter = "";
            pack.style.transform = "";
        }
        executeReveal();
        if (openBtn) openBtn.innerText = "ABRIR SOBRE MYSTERY PACK";
    }, 2500);
}

function executeReveal() {
    const modal = document.getElementById('revealModal');
    const container = document.getElementById('revealedCardContainer');
    const closeBtn = document.getElementById('closeRevealBtn');

    // Create a Flash Effect
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0'; flash.style.left = '0';
    flash.style.width = '100vw'; flash.style.height = '100vh';
    flash.style.background = 'white';
    flash.style.zIndex = '9999';
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 0.8s ease-out';
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 800); }, 50);

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

    packState.inventory.push(player);
    localStorage.setItem('goalchain_inventory', JSON.stringify(packState.inventory));

    modal.classList.add('is-active');
    
    const imgPath = `assets/img/nfts/${String(player.id).padStart(3, '0')}_${player.name.toLowerCase().replace(/ /g, '_')}.png`;
    const flag = FLAG_MAP[player.country] || "🏳️";

    container.innerHTML = `
        <div class="nft-card-3d in-view active reveal-animation" data-rarity="${player.rarity}" id="revealedCard">
            <div class="card-inner">
                <div class="card-front">
                    <div class="glare"></div>
                    <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/img/nfts/001_lionel_satoshi.png'">
                    <div class="nft-overlay">
                        <div class="player-info">
                            <span class="player-name">${player.name}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px; animation: fadeIn 1s ease 1s both;">
            <h2 style="color:var(--gold); font-size: 1.5rem; text-shadow: 0 0 20px var(--gold);">${player.rarity.toUpperCase()} FOUND!</h2>
            <p style="color:white; opacity: 0.8;">${player.name} has joined your squad.</p>
        </div>
    `;

    const card = document.getElementById('revealedCard');
    if (card) {
        card.addEventListener('click', () => card.classList.toggle('is-flipped'));
    }

    triggerExplosion(player.rarity);

    setTimeout(() => {
        if (closeBtn) closeBtn.style.display = 'block';
        if (document.getElementById('openPackBtn')) {
            document.getElementById('openPackBtn').disabled = false;
        }
    }, 2000);
}

function renderInventory(filter = 'all') {
    const grid = document.getElementById('collectionGrid');
    if (!grid) return;

    const filteredItems = filter === 'all' 
        ? packState.inventory 
        : packState.inventory.filter(p => p.rarity === filter);

    if (filteredItems.length === 0) {
        grid.innerHTML = `<div class="empty-inventory" style="grid-column: 1/-1; text-align: center; padding: 40px;"><p>No tenés jugadores en esta categoría.</p></div>`;
        return;
    }

    grid.innerHTML = filteredItems.map(player => {
        const imgPath = `assets/img/nfts/${String(player.id).padStart(3, '0')}_${player.name.toLowerCase().replace(/ /g, '_')}.png`;
        return `
            <div class="nft-card-3d in-view" data-rarity="${player.rarity}" style="transform: scale(0.6); margin: -50px;">
                <div class="card-inner">
                    <div class="card-front">
                        <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/img/nfts/001_lionel_satoshi.png'">
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function triggerExplosion(rarity) {
    const canvas = document.getElementById('revealParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particleColor = '#14f195';
    if(rarity === 'mythic') particleColor = '#ffffff';
    if(rarity === 'legendary') particleColor = '#ffd700';
    if(rarity === 'epic') particleColor = '#9945ff';

    const particles = [];
    for (let i = 0; i < 200; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: Math.random() * 5 + 2,
            color: Math.random() > 0.2 ? particleColor : '#fff',
            life: 1,
            gravity: 0.15
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.vx *= 0.98;
            p.vy += p.gravity;
            p.x += p.vx; p.y += p.vy; p.life -= 0.015;
            if (p.life <= 0) particles.splice(i, 1);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
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
