/**
 * nft_registry.js - Registro Maestro y Lógica de Galería 4.0 (Contract Panel Update)
 */

let masterPlayers = [];
let favorites = JSON.parse(localStorage.getItem('gch_favorites') || '[]');
let showOnlyFavorites = false;

const PRICE_MAP = {
    "mythic": "10,000 $GCH",
    "legendary": "5,000 $GCH",
    "epic": "1,000 $GCH",
    "rare": "500 $GCH",
    "common": "100 $GCH"
};

// Manual image map for generated NFTs (overrides auto-generated paths)
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
    // Check manual map first
    if (NFT_IMAGE_MAP[player.id]) {
        return `assets/img/nfts/${NFT_IMAGE_MAP[player.id]}`;
    }
    // Auto-generate path (for future players)
    const safeName = player.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_\-]/g, '');
    return `assets/img/nfts/${String(player.id).padStart(3, '0')}_${safeName}.png`;
}

async function initNFTGallery() {
    try {
        // Cache busting con timestamp para asegurar datos frescos
        const response = await fetch(`assets/data/players.json?v=${new Date().getTime()}`);
        masterPlayers = await response.json();
        
        renderPlayers('all');
        setupFilterListeners();
    } catch (error) {
        console.error("Error inicializando la galería:", error);
    }
}

function renderPlayers(filterCountry, searchQuery = '') {
    const track = document.querySelector('.nft-track');
    if (!track) return;

    track.innerHTML = '';
    
    let filtered = masterPlayers.filter(p => {
        const matchesCountry = filterCountry === 'all' || p.country === filterCountry;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (p.realName && p.realName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFav = !showOnlyFavorites || favorites.includes(p.id);
        
        return matchesCountry && matchesSearch && matchesFav;
    });

    if (filtered.length === 0) {
        track.innerHTML = '<div style="color: var(--text-dim); padding: 40px; text-align: center; width: 100%;">No se encontraron cromos.</div>';
        return;
    }

    const displayLimit = 50;

    filtered.slice(0, displayLimit).forEach(player => {
        const isFav = favorites.includes(player.id);
        const card = document.createElement('div');
        card.className = 'nft-card-3d';
        card.setAttribute('data-rarity', player.rarity);
        
        const imgPath = getPlayerImagePath(player);
        const nftPrice = PRICE_MAP[player.rarity] || "100 $GCH";

        card.innerHTML = `
            <div class="favorite-heart ${isFav ? 'is-fav' : ''}" data-id="${player.id}">❤️</div>
            <div class="card-inner">
                <div class="card-front">
                    <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/img/nfts/001_lionel_bitcoin.png'">
                    <div class="nft-overlay">
                        <div class="player-info">
                            <span class="player-num">#${player.number}</span>
                            <span class="player-name">${player.name}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-back">
                    <div class="ficha-header">
                        <span class="ficha-title">CONTRATO PROFESIONAL</span>
                        <h3 class="ficha-name">${player.name}</h3>
                    </div>
                    
                    <div class="ficha-stats-grid">
                        <div class="stat-item"><span class="stat-label">POSICIÓN</span><span class="stat-value">${player.position}</span></div>
                        <div class="stat-item"><span class="stat-label">PAÍS</span><span class="stat-value">${player.country}</span></div>
                    </div>

                    <!-- Panel de Contrato -->
                    <div class="contract-panel">
                        <div class="contract-header">
                            <span>VÍNCULO ACTUAL</span>
                            <span>VERIFICADO 🔒</span>
                        </div>
                        <div class="salary-row">
                            <span class="salary-label">Sueldo Real (Ref):</span>
                            <span class="salary-value">${player.contract.realSalary}</span>
                        </div>
                        <div class="salary-row">
                            <span class="salary-label">Pago por Partido:</span>
                            <span class="salary-value" style="color: #14f195;">${player.contract.matchSalary} $GCH</span>
                        </div>
                        <div class="clause-list">
                            ${player.contract.clauses.map(c => `<div class="clause-item">${c}</div>`).join('')}
                        </div>
                    </div>

                    <!-- Oracle & Metadata Status -->
                    <div class="oracle-badge" style="margin-top: 10px; font-size: 0.7rem; background: rgba(20, 241, 149, 0.1); border: 1px solid #14f195; padding: 5px; border-radius: 4px; color: #14f195;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>ORACLE SYNC: ACTIVE 🌐</span>
                            <span>INDEX: ${player.oracle_sync.performance_index}x</span>
                        </div>
                        <div style="margin-top: 3px; font-family: monospace; color: var(--text-dim);">
                            MINT: ${player.mint_address}
                        </div>
                    </div>

                    <div class="price-tag" style="margin-top: 10px;">
                        <div class="price-info">
                            <span class="price-label">PRECIO NFT</span>
                            <div class="price-value">${nftPrice}</div>
                        </div>
                        <button class="btn-buy" style="margin-top: 0; width: auto; padding: 5px 15px;" onclick="handleBuy(${player.id})">COMPRAR</button>
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-heart') || e.target.closest('.btn-buy')) return;
            card.classList.toggle('is-flipped');
        });

        const heart = card.querySelector('.favorite-heart');
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(player.id, heart);
        });
        
        track.appendChild(card);
    });
}

function toggleFavorite(id, element) {
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
        element.classList.remove('is-fav');
    } else {
        favorites.push(id);
        element.classList.add('is-fav');
    }
    localStorage.setItem('gch_favorites', JSON.stringify(favorites));
    if (showOnlyFavorites) renderPlayers(document.querySelector('.filter-btn.active').getAttribute('data-country'));
}

function handleBuy(playerId) {
    alert(`Iniciando compra Web3 del jugador #${playerId}. Se requiere firma en Phantom Wallet.`);
}

function setupFilterListeners() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPlayers(btn.getAttribute('data-country'));
        });
    });

    const searchInput = document.getElementById('playerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderPlayers(document.querySelector('.filter-btn.active').getAttribute('data-country'), e.target.value);
        });
    }

    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            showOnlyFavorites = !showOnlyFavorites;
            wishlistBtn.classList.toggle('active');
            renderPlayers(document.querySelector('.filter-btn.active').getAttribute('data-country'));
        });
    }
}

document.addEventListener('DOMContentLoaded', initNFTGallery);
