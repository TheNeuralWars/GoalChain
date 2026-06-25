/**
 * marketplace.js - Lógica del Mercado de Transferencias GoalChain 4.0 (3D NFT Update)
 */

const marketState = {
    listings: [],
    players: []
};

const RARITY_PRICES = {
    mythic: "25.0 SOL",
    legendary: "12.5 SOL",
    epic: "5.0 SOL",
    rare: "1.5 SOL",
    common: "0.2 SOL"
};

var BG_IMAGE_MAP = window.BG_IMAGE_MAP || {
    "BG-MYT": "bg_mythic_golden.png",
    "BG-LEG": "bg_legendary_purple.png",
    "BG-EPI": "bg_epic_cyber.png",
    "BG-RAR": "bg_rare_solana.png",
    "BG-COM": "bg_common_street.png"
};

var BG_VIDEO_MAP = window.BG_VIDEO_MAP || {
    "BG-MYT": "neo_olympus_vertical.mp4",
    "BG-LEG": "titanium_coliseum.mp4",
    "BG-EPI": "aether_dome.mp4",
    "BG-RAR": "obsidian_arena.mp4",
    "BG-COM": "dome_kronos_vertical.mp4"
};

var FLAG_MAP = window.FLAG_MAP || {
    "Argentina": "🇦🇷",
    "Brasil": "🇧🇷",
    "Francia": "🇫🇷",
    "España": "🇪🇸",
    "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Alemania": "🇩🇪",
    "México": "🇲🇽",
    "Uruguay": "🇺🇾",
    "Egipto": "🇪🇬",
    "Polonia": "🇵🇱",
    "Croacia": "🇭🇷",
    "Corea del Sur": "🇰🇷",
    "Portugal": "🇵🇹",
    "Italia": "🇮🇹",
    "Países Bajos": "🇳🇱",
    "Bélgica": "🇧🇪",
    "EEUU": "🇺🇸"
};

function getCountryFlag(country) {
    return FLAG_MAP[country] || "🏳️";
}

function getPlayerImagePath(player) {
    const formattedName = player.name.replace(/ /g, '_').replace(/'/g, '_').replace(/\.+$/, '');
    return `assets/img/nfts/composed/${String(player.id).padStart(3, '0')}_${formattedName}.webp`;
}

async function initMarketplace() {
    try {
        const response = await fetch('assets/data/players.json');
        marketState.players = await response.json();
        
        generateSimulatedListings();
        renderMarket();
    } catch (error) {
        console.error("Error al cargar el mercado:", error);
    }
}

function generateSimulatedListings() {
    // Tomamos 8 jugadores aleatorios para el mercado
    const shuffled = [...marketState.players].sort(() => 0.5 - Math.random());
    marketState.listings = shuffled.slice(0, 8).map(player => ({
        ...player,
        price: RARITY_PRICES[player.rarity],
        seller: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`
    }));
}

function renderMarket(filter = 'all') {
    const grid = document.getElementById('marketGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = filter === 'all' 
        ? marketState.listings 
        : marketState.listings.filter(p => p.rarity === filter);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <p style="color: var(--text-dim);">No hay jugadores de esta categoría a la venta actualmente.</p>
                <button class="btn-solana mt-3" onclick="filterMarket('all')">VER TODO EL MERCADO</button>
            </div>
        `;
        return;
    }

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('in-view');
            else entry.target.classList.remove('in-view');
        });
    }, { threshold: 0.1 });

    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-active');
            else entry.target.classList.remove('is-active');
        });
    }, { 
        threshold: 0.8,
        root: grid.parentElement
    });

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'nft-card-3d';
        card.setAttribute('data-rarity', item.rarity);

        const imgPath = getPlayerImagePath(item);
        const flag = getCountryFlag(item.country);

        card.innerHTML = `
            <div class="glare"></div>
            
            <!-- Price badge on top right -->
            <div class="yield-badge-card" style="border-color: #00e0ff; box-shadow: 0 4px 15px rgba(0, 224, 255, 0.2);">
                <span class="y-icon">🏷️</span>
                <span class="y-val">${item.price}</span>
            </div>

            <div class="card-inner">
                <div class="card-front">
                    <div class="layer layer-bg" style="position: relative; overflow: hidden; width: 100%; height: 100%;">
                        <img src="assets/img/stadiums/${BG_IMAGE_MAP[item.bg_type] || 'dome_kronos.jpg'}" alt="Stadium Background" class="bg-img" style="width: 100%; height: 100%; object-fit: cover;">
                        <video class="bg-video-hover" src="assets/video/stadiums/${BG_VIDEO_MAP[item.bg_type] || 'dome_kronos.mp4'}" muted playsinline preload="none" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.4s ease; z-index: 1; pointer-events: none;"></video>
                    </div>
                    <div class="layer layer-base">
                        <img src="${imgPath}" alt="${item.name}" loading="lazy" onerror="this.parentElement.classList.add('no-image'); this.style.display='none';">
                        <div class="placeholder-icon">⚽</div>
                    </div>
                    <div class="layer layer-frame rarity-${item.rarity}"></div>
                    <div class="layer layer-ui">
                        <div class="top-row">
                            <span class="player-num">#${String(item.id).padStart(3, '0')}</span>
                            <span class="player-flag">${flag}</span>
                        </div>
                        <div class="bottom-info">
                            <h3 class="player-name-text">${item.name}</h3>
                            <div class="player-real-identity">${item.real_name || 'Verified Athlete'}</div>
                            <div class="biometric-strip">
                                <span>📏 ${item.physical?.h || '1.80m'}</span>
                                <span>⚖️ ${item.physical?.w || '75kg'}</span>
                            </div>
                            <div class="mini-stats">
                                <span>ATK ${item.stats.atk}</span>
                                <span>DEF ${item.stats.def}</span>
                                <span>HYP ${item.stats.hype}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-back">
                    <div class="back-content">
                        <div class="back-header">GOALCHAIN TRANSFER OFFER</div>
                        <div class="back-body">
                            <div class="back-id">SELLER: <code>${item.seller}</code></div>
                            <div class="back-salary">
                                <span class="label">PRICE</span>
                                <span class="value" style="color:#00e0ff;">${item.price}</span>
                            </div>
                            <div class="clauses-list" style="margin-bottom: 12px;">
                                <div class="clause-item">✓ Instantly transfer to inventory</div>
                                <div class="clause-item">✓ Yield begins emitting immediately</div>
                            </div>
                            
                            <!-- Action buttons -->
                            <button class="btn-buy" style="margin-bottom: 8px; font-size: 0.8rem; background: linear-gradient(90deg, #14f195, #9945ff); color: #000;" onclick="buyPlayer(${item.id})">⚡ BUY NOW</button>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <button class="btn-buy" style="font-size: 0.65rem; background: #0b0e11; color: #00e676; border: 1px solid #00e676; box-shadow: none;" onclick="openMarketSimulator(marketState.listings.find(p => p.id === ${item.id}), 'tensor')">📈 TENSOR</button>
                                <button class="btn-buy" style="font-size: 0.65rem; background: #120c1f; color: #e91e63; border: 1px solid #e91e63; box-shadow: none;" onclick="openMarketSimulator(marketState.listings.find(p => p.id === ${item.id}), 'magic_eden')">🪄 M. EDEN</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Glare tilt effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--x', `${x}%`);
            card.style.setProperty('--y', `${y}%`);
        });

        // Click-to-flip handler
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-buy')) return;
            card.classList.toggle('is-flipped');
        });

        // Hover video player logic for card backgrounds
        const video = card.querySelector('.bg-video-hover');
        if (video) {
            if (window.makeVideoYoyo) {
                window.makeVideoYoyo(video);
            }
            card.addEventListener('mouseenter', () => {
                video.style.opacity = '1';
                video.play().catch(() => {});
            });
            card.addEventListener('mouseleave', () => {
                video.style.opacity = '0';
                video.pause();
                video.currentTime = 0;
            });
        }

        grid.appendChild(card);
        cardObserver.observe(card);
        activeObserver.observe(card);
    });
}

window.filterMarket = (rarity) => {
    document.querySelectorAll('#marketplace .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === rarity.toLowerCase()) btn.classList.add('active');
    });
    renderMarket(rarity);
};

window.buyPlayer = async (id) => {
    const player = marketState.listings.find(p => p.id === id);
    if (!player) return;

    const walletAddress = localStorage.getItem('goalchain_wallet');
    if (!walletAddress) {
        if (window.notifier) window.notifier.show('ERROR', 'Debes conectar tu wallet para comprar.', 'error');
        else alert('Debes conectar tu wallet para comprar.');
        return;
    }

    if (window.notifier) {
        window.notifier.show('PROCESANDO', `Iniciando transacción para ${player.name}...`, 'info');
    }

    // Si es una wallet mock, simulamos
    if (walletAddress.startsWith("DevGoaL")) {
        setTimeout(() => {
            if (window.notifier) window.notifier.show('ÉXITO', `¡${player.name} ahora es parte de tu equipo!`, 'success');
            
            const inventory = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
            inventory.push(player);
            localStorage.setItem('goalchain_inventory', JSON.stringify(inventory));
            
            marketState.listings = marketState.listings.filter(p => p.id !== id);
            renderMarket();
            
            if (window.renderInventory) window.renderInventory();
        }, 2000);
        return;
    }

    // Transacción real en Devnet
    try {
        const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");
        const fromPubkey = new solanaWeb3.PublicKey(walletAddress);
        const toPubkey = new solanaWeb3.PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg"); // Tesorería de GoalChain

        const priceStr = player.price.split(' ')[0];
        const priceSol = parseFloat(priceStr) || 0.1;
        const lamports = Math.floor(priceSol * 1000000); // 1,000,000 lamports = 0.001 SOL por cada 1 SOL de precio listado

        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromPubkey,
                toPubkey: toPubkey,
                lamports: lamports,
            })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        const provider = window.solana;
        if (!provider) throw new Error("Phantom Wallet no encontrada.");

        const { signature } = await provider.signAndSendTransaction(transaction);
        console.log("Transacción enviada:", signature);

        if (window.notifier) window.notifier.show('CONFIRMANDO', 'Esperando confirmación en Devnet...', 'info');
        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transacción confirmada!");

        if (window.notifier) window.notifier.show('ÉXITO', `¡${player.name} ahora es parte de tu equipo!`, 'success');

        const inventory = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
        inventory.push(player);
        localStorage.setItem('goalchain_inventory', JSON.stringify(inventory));
        
        marketState.listings = marketState.listings.filter(p => p.id !== id);
        renderMarket();
        
        if (window.renderInventory) window.renderInventory();

        setTimeout(() => {
            alert(`¡COMPRA CONFIRMADA EN SOLANA! 🎉\n\nEl jugador ${player.name} ha sido transferido.\n\nTx ID: ${signature.substring(0, 10)}...\n\nPuedes ver tu transacción en Solana Explorer.`);
            window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
        }, 500);

    } catch (error) {
        console.error("Error en la transacción real de Solana:", error);
        if (window.notifier) window.notifier.show('ERROR', 'La transacción fue cancelada o falló.', 'error');
    }
};

document.addEventListener('DOMContentLoaded', initMarketplace);
