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

// Mapeo de banderas para reconocimiento rápido
const FLAG_MAP = {
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

let currentCountry = 'all';
let currentPosition = 'all';
let currentSort = 'id-asc';
let currentSearch = '';

async function initNFTGallery() {
    try {
        // Cache busting con timestamp para asegurar datos frescos
        const response = await fetch(`assets/data/players.json?v=${new Date().getTime()}`);
        masterPlayers = await response.json();
        
        renderPlayers();
        setupFilterListeners();
    } catch (error) {
        console.error("Error inicializando la galería:", error);
    }
}

function renderPlayers() {
    const track = document.querySelector('.nft-track');
    if (!track) return;

    track.innerHTML = '';
    
    let filtered = masterPlayers.filter(p => {
        const matchesCountry = currentCountry === 'all' || p.country === currentCountry;
        const matchesPosition = currentPosition === 'all' || p.position === currentPosition;
        const matchesSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                              (p.realName && p.realName.toLowerCase().includes(currentSearch.toLowerCase()));
        const matchesFav = !showOnlyFavorites || favorites.includes(p.id);
        
        return matchesCountry && matchesPosition && matchesSearch && matchesFav;
    });

    // Lógica de Ordenamiento
    filtered.sort((a, b) => {
        if (currentSort === 'id-asc') return a.id - b.id;
        if (currentSort === 'id-desc') return b.id - a.id;
        if (currentSort === 'atk-desc') return b.stats.atk - a.stats.atk;
        if (currentSort === 'def-desc') return b.stats.def - a.stats.def;
        if (currentSort === 'rarity-desc') {
            const rarityWeight = { "mythic": 4, "legendary": 3, "epic": 2, "rare": 1, "common": 0 };
            return rarityWeight[b.rarity] - rarityWeight[a.rarity];
        }
        return 0;
    });

    if (filtered.length === 0) {
        track.innerHTML = '<div style="color: var(--text-dim); padding: 40px; text-align: center; width: 100%;">No se encontraron cromos con estos filtros.</div>';
        return;
    }

    const displayLimit = 100;

    // Observer para rendimiento
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('in-view');
            else entry.target.classList.remove('in-view');
        });
    }, { threshold: 0.1 });

    filtered.slice(0, displayLimit).forEach(player => {
        const isFav = favorites.includes(player.id);
        const card = document.createElement('div');
        card.className = 'nft-card-3d';
        card.setAttribute('data-rarity', player.rarity);
        
        const imgPath = getPlayerImagePath(player);
        const nftPrice = PRICE_MAP[player.rarity] || "100 $GCH";
        const flag = getCountryFlag(player.country);

        card.innerHTML = `
            <div class="favorite-heart ${isFav ? 'is-fav' : ''}" data-id="${player.id}">❤️</div>
            <div class="card-inner">
                <div class="card-front">
                    <!-- Capa 1: Foto del Jugador (IA) -->
                    <div class="layer layer-base">
                        <img src="${imgPath}" alt="${player.name}" loading="lazy" 
                             onerror="this.parentElement.classList.add('no-image'); this.style.display='none';">
                        <div class="placeholder-icon">⚽</div>
                    </div>
                    
                    <!-- Capa 2: Marco Maestro (Fijo) -->
                    <div class="layer layer-frame rarity-${player.rarity}"></div>

                    <!-- Capa 3: UI y Metadata -->
                    <div class="layer layer-ui">
                        <div class="top-row">
                            <span class="player-num">#${String(player.id).padStart(3, '0')}</span>
                            <span class="player-flag">${flag}</span>
                        </div>
                        <div class="bottom-info">
                            <h3 class="player-name-text">${player.name}</h3>
                            <div class="mini-stats">
                                <span>ATK ${player.stats.atk}</span>
                                <span>DEF ${player.stats.def}</span>
                                <span>HYP ${player.stats.hype}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card-back">
                    <div class="back-content">
                        <div class="back-header">${t('nft_contract_title')}</div>
                        <div class="back-body">
                            <div class="back-id">ID: ${player.id}</div>
                            <div class="back-salary">MATCH PAY: ${player.contract.matchSalary} $GCH</div>
                            <div class="back-mint"><code>${player.mint_address || 'SOL_PENDING...'}</code></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
                            ${player.contract.clauses.map(c => `<div class="clause-item">${c}</div>`).join('')}
                        </div>
                    </div>

                    <div class="oracle-badge" style="margin-top: 10px; font-size: 0.7rem; background: rgba(20, 241, 149, 0.1); border: 1px solid #14f195; padding: 5px; border-radius: 4px; color: #14f195;">
                        <span>ORACLE INDEX: ${player.oracle_sync.performance_index}x</span>
                    </div>

                    <div class="price-tag" style="margin-top: 10px;">
                        <div class="price-info">
                            <span class="price-label">${t('nft_price_label')}</span>
                            <div class="price-value">${nftPrice}</div>
                        </div>
                        <button class="btn-buy" style="margin-top: 0; width: auto; padding: 5px 15px;" onclick="handleBuy(${player.id})">${t('nft_buy_btn')}</button>
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
        cardObserver.observe(card);
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
    if (showOnlyFavorites) renderPlayers();
}

function handleBuy(playerId) {
    alert(`Iniciando compra Web3 del jugador #${playerId}. Se requiere firma en Phantom Wallet.`);
}

function setupFilterListeners() {
    // Países
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCountry = btn.getAttribute('data-country');
            renderPlayers();
        });
    });

    // Posiciones
    document.querySelectorAll('.filter-btn-sm').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn-sm').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPosition = btn.getAttribute('data-pos');
            renderPlayers();
        });
    });

    // Ordenamiento
    const sortSelect = document.getElementById('nftSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderPlayers();
        });
    }

    // Buscador
    const searchInput = document.getElementById('playerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderPlayers();
        });
    }

    // Favoritos
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            showOnlyFavorites = !showOnlyFavorites;
            wishlistBtn.classList.toggle('active');
            renderPlayers();
        });
    }
}

document.addEventListener('DOMContentLoaded', initNFTGallery);
