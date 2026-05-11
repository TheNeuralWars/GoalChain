/**
 * nft_registry.js - Registro Maestro y Lógica de Galería 3.0 (Web3 + Wishlist)
 */

let masterPlayers = [];
let favorites = JSON.parse(localStorage.getItem('gch_favorites') || '[]');
let showOnlyFavorites = false;

// Precios por rareza
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
        track.innerHTML = '<div style="color: var(--text-dim); padding: 40px; text-align: center; width: 100%;">No se encontraron cromos en esta categoría.</div>';
        return;
    }

    const displayLimit = 40; // Rendimiento

    filtered.slice(0, displayLimit).forEach(player => {
        const isFav = favorites.includes(player.id);
        const card = document.createElement('div');
        card.className = 'nft-card-3d';
        card.setAttribute('data-rarity', player.rarity);
        
        const imgPath = `assets/images/nfts/${String(player.id).padStart(3, '0')}_${player.name.toLowerCase().replace(/ /g, '_')}.png`;
        const price = PRICE_MAP[player.rarity] || "50 $GCH";

        card.innerHTML = `
            <div class="favorite-heart ${isFav ? 'is-fav' : ''}" data-id="${player.id}">❤️</div>
            <div class="card-inner">
                <!-- FRENTE: Arte y Nombre -->
                <div class="card-front">
                    <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/images/nfts/placeholder.png'">
                    <div class="nft-overlay">
                        <div class="player-info">
                            <span class="player-num">#${player.number}</span>
                            <span class="player-name">${player.name}</span>
                        </div>
                    </div>
                </div>
                
                <!-- REVERSO: Ficha Técnica + Precio -->
                <div class="card-back">
                    <div class="ficha-header">
                        <span class="ficha-title">GOALCHAIN ADN</span>
                        <h3 class="ficha-name">${player.name}</h3>
                    </div>
                    
                    <div class="ficha-stats-grid">
                        <div class="stat-item"><span class="stat-label">ALTURA</span><span class="stat-value">${player.height}</span></div>
                        <div class="stat-item"><span class="stat-label">PESO</span><span class="stat-value">${player.weight}</span></div>
                        <div class="stat-item"><span class="stat-label">POSICIÓN</span><span class="stat-value">${player.position}</span></div>
                        <div class="stat-item"><span class="stat-label">PAÍS</span><span class="stat-value">${player.country}</span></div>
                    </div>
                    
                    <div class="price-tag">
                        <div class="price-info">
                            <span class="price-label">PRECIO DE MERCADO</span>
                            <div class="price-value">${price}</div>
                        </div>
                        <img src="assets/images/logo_token.png" style="width: 24px; height: 24px;" onerror="this.style.display='none'">
                    </div>

                    <button class="btn-buy" onclick="handleBuy(${player.id})">Comprar Ahora</button>
                </div>
            </div>
        `;
        
        // Listener Giro
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-heart') || e.target.classList.contains('btn-buy')) return;
            card.classList.toggle('is-flipped');
        });

        // Listener Favoritos
        const heart = card.querySelector('.favorite-heart');
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(player.id, heart);
        });
        
        track.appendChild(card);
    });

    // Animación
    if (filtered.length > 5 && !showOnlyFavorites) {
        track.style.animation = 'scrollNFT 40s linear infinite';
        const clones = track.innerHTML;
        track.innerHTML += clones;
    } else {
        track.style.animation = 'none';
    }
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
    
    if (showOnlyFavorites) {
        renderPlayers(document.querySelector('.filter-btn.active').getAttribute('data-country'));
    }
}

function handleBuy(playerId) {
    alert(`Iniciando transacción en Solana para el jugador #${playerId}. Asegúrate de tener suficientes $GCH en tu Phantom Wallet.`);
}

function setupFilterListeners() {
    // Botones Países
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPlayers(btn.getAttribute('data-country'));
        });
    });

    // Buscador
    const searchInput = document.getElementById('playerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activeCountryBtn = document.querySelector('.filter-btn.active');
            renderPlayers(activeCountryBtn.getAttribute('data-country'), e.target.value);
        });
    }

    // Toggle Wishlist
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            showOnlyFavorites = !showOnlyFavorites;
            wishlistBtn.classList.toggle('active');
            const activeCountryBtn = document.querySelector('.filter-btn.active');
            renderPlayers(activeCountryBtn.getAttribute('data-country'));
        });
    }
}

document.addEventListener('DOMContentLoaded', initNFTGallery);
