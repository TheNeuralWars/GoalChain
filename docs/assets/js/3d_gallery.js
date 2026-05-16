/**
 * GoalChain Genesis Squad 3D Gallery
 * Maneja la visualización y renderizado holográfico 3D de los NFTs
 */

const GALLERY_DATA = [
    {
        id: 1,
        name: "Lionel Messi",
        trait: "GOAT Aura",
        rarity: "mythic",
        image: "assets/img/mock/card_messi.jpg", // Placeholder
        lore: "The undisputed GOAT of the GoalChain ledger. 46 trophies encoded."
    },
    {
        id: 2,
        name: "Emiliano Martínez",
        trait: "Penalty Specialist",
        rarity: "legendary",
        image: "assets/img/mock/card_dibu.jpg", 
        lore: "Hero of Lusail. Master of mind games and penalty shootouts."
    },
    {
        id: 12,
        name: "Jude Bellingham",
        trait: "Golden Boy",
        rarity: "epic",
        image: "assets/img/mock/card_jude.jpg", 
        lore: "The Golden Boy. Madrid's dynamic midfield general."
    },
    {
        id: 344,
        name: "Gianluca Lapadula",
        trait: "The Masked Gladiator",
        rarity: "rare",
        image: "assets/img/mock/card_lapa.jpg",
        lore: "Wearing his iconic black mask, an unstoppable force for Peru."
    },
    {
        id: 485,
        name: "Mohamed Salah",
        trait: "Egyptian King",
        rarity: "epic",
        image: "assets/img/mock/card_salah.jpg",
        lore: "The Pharaoh of Liverpool. Golden hieroglyphic speed trails."
    },
    {
        id: 522,
        name: "Hervé Koffi",
        trait: "The Black Cat",
        rarity: "rare",
        image: "assets/img/mock/card_koffi.jpg",
        lore: "Agile feline reflexes with a neon black cat aura."
    }
];

function initGalleryView() {
    const container = document.getElementById('galleryContainer');
    if (!container || container.children.length > 0) return; // Evitar re-renderizado

    // Limpiar contenedor (por si acaso)
    container.innerHTML = '';

    GALLERY_DATA.forEach(player => {
        // Determinar colores según rareza
        let rarityColor = "#fff";
        let glowColor = "rgba(255,255,255,0.2)";
        if (player.rarity === 'mythic') { rarityColor = "#ffcc00"; glowColor = "rgba(255, 204, 0, 0.4)"; }
        if (player.rarity === 'legendary') { rarityColor = "#14f195"; glowColor = "rgba(20, 241, 149, 0.4)"; }
        if (player.rarity === 'epic') { rarityColor = "#9945ff"; glowColor = "rgba(153, 69, 255, 0.4)"; }

        const cardHTML = `
            <div class="nft-card-container" style="perspective: 1000px;">
                <div class="nft-card-3d" style="
                    position: relative;
                    width: 100%;
                    aspect-ratio: 2/3;
                    border-radius: 15px;
                    transition: transform 0.1s;
                    transform-style: preserve-3d;
                    background: linear-gradient(145deg, #1a1a24, #0d0d14);
                    border: 2px solid ${rarityColor};
                    box-shadow: 0 10px 30px ${glowColor};
                    overflow: hidden;
                    cursor: pointer;
                " onmousemove="handleCardMove(event, this)" onmouseleave="handleCardLeave(this)">
                    
                    <!-- Holographic Overlay -->
                    <div class="holo-glare" style="
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.3) 25%, transparent 30%);
                        z-index: 10;
                        pointer-events: none;
                        opacity: 0.5;
                        mix-blend-mode: overlay;
                    "></div>

                    <!-- Card Content -->
                    <div style="padding: 15px; display: flex; flex-direction: column; height: 100%; justify-content: space-between; z-index: 2; position: relative;">
                        <!-- Header -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="font-size: 1.2rem; font-weight: 900; color: #fff;">${player.id}</div>
                            <div style="font-size: 0.6rem; padding: 3px 8px; border-radius: 4px; background: ${rarityColor}; color: #000; font-weight: 800; text-transform: uppercase;">
                                ${player.rarity}
                            </div>
                        </div>

                        <!-- Image Placeholder (Until actual renders are done) -->
                        <div style="flex: 1; display: flex; align-items: center; justify-content: center; margin: 10px 0;">
                            <div style="width: 100%; height: 100%; background: rgba(0,0,0,0.5); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(255,255,255,0.1);">
                                <span style="color: var(--text-dim); font-size: 0.7rem; text-align:center; padding:10px;">AAA Asset<br>Pending Render</span>
                            </div>
                        </div>

                        <!-- Footer / Lore -->
                        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                            <h3 style="margin: 0; font-size: 1rem; color: #fff;">${player.name}</h3>
                            <div style="font-size: 0.65rem; color: ${rarityColor}; margin: 5px 0; font-weight: 800;">${player.trait}</div>
                            <p style="margin: 0; font-size: 0.6rem; color: var(--text-dim); line-height: 1.4;">${player.lore}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// Interacción 3D
function handleCardMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Posición X dentro de la carta
    const y = e.clientY - rect.top;  // Posición Y dentro de la carta

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15; // Invertido para rotar hacia el cursor
    const rotateY = ((x - centerX) / centerX) * 15;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

    // Mover el glare holográfico
    const glare = card.querySelector('.holo-glare');
    if (glare) {
        const percentageX = (x / rect.width) * 100;
        const percentageY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${percentageX}% ${percentageY}%, rgba(255,255,255,0.4) 0%, transparent 50%)`;
    }
}

function handleCardLeave(card) {
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    const glare = card.querySelector('.holo-glare');
    if (glare) {
        glare.style.background = `linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.3) 25%, transparent 30%)`;
    }
}
