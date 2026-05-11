/**
 * nft_registry.js - Registro Maestro y Lógica de Galería 2.0
 */

let masterPlayers = [];

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
    
    const filtered = masterPlayers.filter(p => {
        const matchesCountry = filterCountry === 'all' || p.country === filterCountry;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.realName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCountry && matchesSearch;
    });

    // Solo mostramos los primeros 50 para rendimiento, el scroll cargaría más si fuera infinito real
    const displayLimit = filtered.length > 50 ? 50 : filtered.length;

    filtered.slice(0, displayLimit).forEach(player => {
        const card = document.createElement('div');
        card.className = 'nft-card-3d';
        card.setAttribute('data-rarity', player.rarity);
        
        const imgPath = `assets/images/nfts/${String(player.id).padStart(3, '0')}_${player.name.toLowerCase().replace(/ /g, '_')}.png`;
        
        card.innerHTML = `
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
                
                <!-- REVERSO: Ficha Técnica -->
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
                        <div class="stat-item"><span class="stat-label">⚽ ATK</span><span class="stat-value">${player.stats.atk}</span></div>
                        <div class="stat-item"><span class="stat-label">🛡️ DEF</span><span class="stat-value">${player.stats.def}</span></div>
                    </div>
                    
                    <div class="ficha-dna">
                        <strong>PROPIEDADES BLOCKCHAIN</strong><br>
                        Edición: ${player.rarity.toUpperCase()}<br>
                        Hype Level: ${player.stats.hype}%<br>
                        Minted on Solana
                    </div>
                </div>
            </div>
        `;
        
        // Listener para el giro (flip)
        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
        
        track.appendChild(card);
    });

    // Reiniciar animación del track si hay pocos elementos
    if (filtered.length < 5) {
        track.style.animation = 'none';
        track.style.justifyContent = 'center';
    } else {
        track.style.animation = 'scrollNFT 40s linear infinite';
        track.style.justifyContent = 'flex-start';
        // Duplicar para el bucle infinito si hay suficientes
        const clones = track.innerHTML;
        track.innerHTML += clones;
    }
}

function setupFilterListeners() {
    // Botones de países
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
}

document.addEventListener('DOMContentLoaded', initNFTGallery);
