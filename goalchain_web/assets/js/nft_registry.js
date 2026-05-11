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

async function initNFTGallery() {
    try {
        const response = await fetch('assets/data/players.json');
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

    const displayLimit = 30;

    filtered.slice(0, displayLimit).forEach(player => {
        const isFav = favorites.includes(player.id);
        const card = document.createElement('div');
        card.className = 'nft-card-3d';
        card.setAttribute('data-rarity', player.rarity);
        
        const imgPath = `assets/images/nfts/${String(player.id).padStart(3, '0')}_${player.name.toLowerCase().replace(/ /g, '_')}.png`;
        const nftPrice = PRICE_MAP[player.rarity] || "100 $GCH";

        card.innerHTML = `
            <div class="favorite-heart ${isFav ? 'is-fav' : ''}" data-id="${player.id}">❤️</div>
            <div class="card-inner">
                <div class="card-front">
                    <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/images/nfts/placeholder.png'">
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

                    <div class="price-tag" style="margin-top: 15px;">
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
