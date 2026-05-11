/**
 * nft_registry.js - Carga dinámica de la colección GoalChain
 */

async function loadNFTGallery() {
    const track = document.querySelector('.nft-track');
    if (!track) return;

    try {
        const response = await fetch('assets/data/players.json');
        const players = await response.json();

        // Limpiar track si hay algo
        track.innerHTML = '';

        // Renderizar jugadores
        players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'nft-card-3d';
            card.setAttribute('data-rarity', player.rarity);
            
            // Intentar cargar la imagen oficial, si no existe usar un placeholder
            const imgPath = `assets/images/nfts/${String(player.id).padStart(3, '0')}_${player.name.toLowerCase().replace(/ /g, '_')}.png`;
            
            card.innerHTML = `
                <div class="card-inner">
                    <img src="${imgPath}" alt="${player.name}" onerror="this.src='assets/images/nfts/placeholder.png'">
                    <div class="nft-overlay">
                        <div class="player-info">
                            <span class="player-num">#${player.number}</span>
                            <span class="player-name">${player.name}</span>
                        </div>
                        <div class="player-stats-mini">
                            <span>⚽ ${player.stats.atk}</span>
                            <span>🛡️ ${player.stats.def}</span>
                            <span>⚡ ${player.stats.hype}</span>
                        </div>
                    </div>
                </div>
            `;
            
            track.appendChild(card);
        });

        // Duplicar elementos para el scroll infinito suave si es necesario
        const clones = track.innerHTML;
        track.innerHTML += clones;

    } catch (error) {
        console.error("Error cargando la galería de NFTs:", error);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadNFTGallery);
