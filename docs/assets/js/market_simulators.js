/**
 * market_simulators.js - High-fidelity Tensor and Magic Eden Simulator Modals for GoalChain
 */

const SIMULATOR_STYLES = `
/* Simulator backdrop container */
.market-sim-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(4, 4, 6, 0.85);
    backdrop-filter: blur(12px);
    opacity: 0;
    transition: opacity 0.3s ease;
    padding: 20px;
    box-sizing: border-box;
}

.market-sim-overlay.active {
    opacity: 1;
}

/* Modal window styling */
.market-sim-container {
    width: 100%;
    max-width: 900px;
    height: auto;
    max-height: 90vh;
    border-radius: 24px;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    overflow: hidden;
    position: relative;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8);
    transform: scale(0.9) translateY(20px);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15);
    box-sizing: border-box;
}

.market-sim-overlay.active .market-sim-container {
    transform: scale(1) translateY(0);
}

@media (max-width: 768px) {
    .market-sim-container {
        grid-template-columns: 1fr;
        max-height: 95vh;
        overflow-y: auto;
    }
}

/* Close button */
.market-sim-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    cursor: pointer;
    z-index: 100;
    transition: all 0.3s;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* --- TENSOR SIMULATOR --- */
.sim-tensor {
    background: #0b0e11;
    border: 2px solid #00e676;
    color: #fff;
    font-family: 'Consolas', 'Courier New', monospace;
}

.sim-tensor .market-sim-close {
    background: #141a1f;
    color: #00e676;
}
.sim-tensor .market-sim-close:hover {
    background: #00e676;
    color: #0b0e11;
}

.sim-tensor-sidebar {
    background: #0f141c;
    border-right: 1px solid #1c2630;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
}

.sim-tensor-main {
    padding: 35px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.tensor-logo {
    color: #00e676;
    font-weight: 900;
    font-size: 1.3rem;
    letter-spacing: 2px;
    margin-bottom: 25px;
    border-bottom: 1px solid #1c2630;
    padding-bottom: 10px;
}

.tensor-rarity-badge {
    background: rgba(0, 230, 118, 0.1);
    border: 1px solid #00e676;
    color: #00e676;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    text-transform: uppercase;
    display: inline-block;
    margin-bottom: 10px;
}

.tensor-price {
    font-size: 2.2rem;
    font-weight: 900;
    color: #00e676;
    margin: 15px 0 25px;
}

.tensor-price span {
    font-size: 1rem;
    color: #8899a6;
    font-weight: normal;
}

.tensor-attributes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 25px;
}

.tensor-attr-box {
    background: #141a1f;
    border: 1px solid #232d38;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.7rem;
}

.tensor-attr-box .label {
    color: #8899a6;
    margin-bottom: 4px;
}

.tensor-attr-box .value {
    color: #fff;
    font-weight: bold;
}

.tensor-attr-box .pct {
    color: #00e676;
    margin-left: 5px;
}

.btn-tensor-buy {
    background: #00e676;
    color: #0b0e11;
    border: none;
    width: 100%;
    padding: 14px;
    font-weight: 900;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    letter-spacing: 1px;
    transition: all 0.3s;
}

.btn-tensor-buy:hover {
    background: #00b050;
    box-shadow: 0 0 20px rgba(0, 230, 118, 0.3);
}

/* --- MAGIC EDEN SIMULATOR --- */
.sim-magic-eden {
    background: #120c1f;
    border: 2px solid #e91e63;
    color: #fff;
    font-family: 'Inter', sans-serif;
}

.sim-magic-eden .market-sim-close {
    background: #1d1430;
    color: #e91e63;
}
.sim-magic-eden .market-sim-close:hover {
    background: #e91e63;
    color: #fff;
}

.sim-eden-sidebar {
    background: #190f2b;
    border-right: 1px solid #291942;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
}

.sim-eden-main {
    padding: 35px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.eden-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 900;
    font-size: 1.3rem;
    color: #e91e63;
    margin-bottom: 25px;
    border-bottom: 1px solid #291942;
    padding-bottom: 10px;
}

.eden-logo span {
    color: #fff;
}

.eden-rarity-badge {
    background: rgba(233, 30, 99, 0.1);
    border: 1px solid #e91e63;
    color: #e91e63;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    text-transform: uppercase;
    display: inline-block;
    margin-bottom: 10px;
}

.eden-price {
    font-size: 2.2rem;
    font-weight: 900;
    color: #fff;
    margin: 15px 0 25px;
}

.eden-price span {
    font-size: 1rem;
    color: #b3a5cf;
    font-weight: normal;
}

.eden-attributes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 25px;
}

.eden-attr-box {
    background: #1e1333;
    border: 1px solid #372458;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.7rem;
}

.eden-attr-box .label {
    color: #b3a5cf;
    margin-bottom: 4px;
}

.eden-attr-box .value {
    color: #fff;
    font-weight: bold;
}

.eden-attr-box .floor {
    color: #b3a5cf;
    margin-top: 2px;
    font-size: 0.6rem;
}

.btn-eden-buy {
    background: #e91e63;
    color: #fff;
    border: none;
    width: 100%;
    padding: 14px;
    font-weight: 900;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.3s;
}

.btn-eden-buy:hover {
    background: #c2185b;
    box-shadow: 0 0 20px rgba(233, 30, 99, 0.4);
}
`;

// Append styles to document head
const styleSheet = document.createElement("style");
styleSheet.innerText = SIMULATOR_STYLES;
document.head.appendChild(styleSheet);

const BG_IMAGE_MAP = {
    "BG-MYT": "bg_mythic_golden.png",
    "BG-LEG": "bg_legendary_purple.png",
    "BG-EPI": "bg_epic_cyber.png",
    "BG-RAR": "bg_rare_solana.png",
    "BG-COM": "bg_common_street.png"
};

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

function getPlayerImagePath(player) {
    const formattedName = player.name.replace(/ /g, '_').replace(/'/g, '_').replace(/\.+$/, '');
    return `assets/img/nfts/composed/${String(player.id).padStart(3, '0')}_${formattedName}.webp`;
}

window.openMarketSimulator = (player, marketType) => {
    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    const overlay = document.createElement("div");
    overlay.className = "market-sim-overlay";
    
    const imgPath = getPlayerImagePath(player);
    const flag = getCountryFlag(player.country);

    const yieldMap = { "mythic": "25.4 SOL/mo", "legendary": "12.1 SOL/mo", "epic": "5.8 SOL/mo", "rare": "2.1 SOL/mo", "common": "0.5 SOL/mo" };
    const estimatedYield = yieldMap[player.rarity] || "0.1 SOL/mo";

    // Set prices for simulator
    const prices = {
        mythic: "25.0 SOL",
        legendary: "12.5 SOL",
        epic: "5.0 SOL",
        rare: "1.5 SOL",
        common: "0.2 SOL"
    };
    const simPrice = prices[player.rarity] || "0.1 SOL";

    if (marketType === 'tensor') {
        overlay.innerHTML = `
            <div class="market-sim-container sim-tensor">
                <div class="market-sim-close">✕</div>
                <div class="sim-tensor-sidebar">
                    <!-- Standard front representation of card -->
                    <div class="nft-card-3d" data-rarity="${player.rarity}" style="pointer-events: none; margin: 0 auto; box-shadow: none;">
                        <div class="card-inner">
                            <div class="card-front" style="border-radius: 12px; border-width: 1px;">
                                <div class="layer layer-bg">
                                    <img src="assets/img/stadiums/${BG_IMAGE_MAP[player.bg_type] || 'dome_kronos.jpg'}" alt="" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <div class="layer layer-base">
                                    <img src="${imgPath}" alt="">
                                </div>
                                <div class="layer layer-frame rarity-${player.rarity}"></div>
                                <div class="layer layer-ui">
                                    <div class="top-row">
                                        <span class="player-num">#${String(player.id).padStart(3, '0')}</span>
                                        <span class="player-flag">${flag}</span>
                                    </div>
                                    <div class="bottom-info">
                                        <h3 class="player-name-text" style="font-size: 1.1rem; line-height: 1.2;">${player.name}</h3>
                                        <div class="player-real-identity" style="font-size: 0.55rem; margin-bottom: 2px;">${player.real_name || 'Verified Athlete'}</div>
                                        <div class="mini-stats" style="font-size: 0.65rem; gap: 8px;">
                                            <span>ATK ${player.stats.atk}</span>
                                            <span>DEF ${player.stats.def}</span>
                                            <span>HYP ${player.stats.hype}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sim-tensor-main">
                    <div>
                        <div class="tensor-logo">TENSOR.TRADE</div>
                        <div class="tensor-rarity-badge">${player.rarity}</div>
                        <h2 style="margin: 0; font-weight: 900; font-size: 1.6rem; color: #fff;">${player.name} #${String(player.id).padStart(3, '0')}</h2>
                        <p style="color: #8899a6; font-size: 0.75rem; margin: 5px 0 20px;">Identity: ${player.real_name || 'Verified'}</p>
                        
                        <div class="tensor-attributes">
                            <div class="tensor-attr-box">
                                <div class="label">Rarity Class</div>
                                <div class="value">${player.rarity.toUpperCase()}<span class="pct">[top 2%]</span></div>
                            </div>
                            <div class="tensor-attr-box">
                                <div class="label">Yield Tier</div>
                                <div class="value">${estimatedYield}</div>
                            </div>
                            <div class="tensor-attr-box">
                                <div class="label">Country Flag</div>
                                <div class="value">${player.country} ${flag}</div>
                            </div>
                            <div class="tensor-attr-box">
                                <div class="label">Role</div>
                                <div class="value">${player.position || 'MID'}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: #8899a6;">CURRENT PRICE</div>
                        <div class="tensor-price">${simPrice} <span>(~ $${(parseFloat(simPrice)*140).toLocaleString(undefined, {maximumFractionDigits:0})} USD)</span></div>
                        <button class="btn-tensor-buy">BUY NFT (SIMULATED TENSOR)</button>
                    </div>
                </div>
            </div>
        `;
    } else {
        // MAGIC EDEN
        overlay.innerHTML = `
            <div class="market-sim-container sim-magic-eden">
                <div class="market-sim-close">✕</div>
                <div class="sim-eden-sidebar">
                    <div class="nft-card-3d" data-rarity="${player.rarity}" style="pointer-events: none; margin: 0 auto; box-shadow: none;">
                        <div class="card-inner">
                            <div class="card-front" style="border-radius: 12px; border-width: 1px;">
                                <div class="layer layer-bg">
                                    <img src="assets/img/stadiums/${BG_IMAGE_MAP[player.bg_type] || 'dome_kronos.jpg'}" alt="" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <div class="layer layer-base">
                                    <img src="${imgPath}" alt="">
                                </div>
                                <div class="layer layer-frame rarity-${player.rarity}"></div>
                                <div class="layer layer-ui">
                                    <div class="top-row">
                                        <span class="player-num">#${String(player.id).padStart(3, '0')}</span>
                                        <span class="player-flag">${flag}</span>
                                    </div>
                                    <div class="bottom-info">
                                        <h3 class="player-name-text" style="font-size: 1.1rem; line-height: 1.2;">${player.name}</h3>
                                        <div class="player-real-identity" style="font-size: 0.55rem; margin-bottom: 2px;">${player.real_name || 'Verified Athlete'}</div>
                                        <div class="mini-stats" style="font-size: 0.65rem; gap: 8px;">
                                            <span>ATK ${player.stats.atk}</span>
                                            <span>DEF ${player.stats.def}</span>
                                            <span>HYP ${player.stats.hype}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sim-eden-main">
                    <div>
                        <div class="eden-logo">🪄 MAGIC <span>EDEN</span></div>
                        <div class="eden-rarity-badge">${player.rarity}</div>
                        <h2 style="margin: 0; font-weight: 900; font-size: 1.6rem; color: #fff;">${player.name} #${String(player.id).padStart(3, '0')}</h2>
                        <p style="color: #b3a5cf; font-size: 0.75rem; margin: 5px 0 20px;">Verification: On-Chain Athlete Node</p>
                        
                        <div class="eden-attributes">
                            <div class="eden-attr-box">
                                <div class="label">Rarity Tier</div>
                                <div class="value">${player.rarity.toUpperCase()}</div>
                            </div>
                            <div class="eden-attr-box">
                                <div class="label">Estimated Yield</div>
                                <div class="value">${estimatedYield}</div>
                            </div>
                            <div class="eden-attr-box">
                                <div class="label">Country Flag</div>
                                <div class="value">${flag} ${player.country}</div>
                            </div>
                            <div class="eden-attr-box">
                                <div class="label">Role</div>
                                <div class="value">${player.position || 'MID'}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: #b3a5cf;">LIST PRICE</div>
                        <div class="eden-price">${simPrice} <span>( Floor: ${player.rarity === 'mythic' ? '20' : player.rarity === 'legendary' ? '10' : '1.2'} SOL )</span></div>
                        <button class="btn-eden-buy">BUY NOW (SIMULATED MAGIC EDEN)</button>
                    </div>
                </div>
            </div>
        `;
    }

    document.body.appendChild(overlay);

    // Fade in
    setTimeout(() => {
        overlay.classList.add("active");
    }, 10);

    const closeOverlay = () => {
        overlay.classList.remove("active");
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = "";
        }, 300);
    };

    // Close on click close button or overlay backdrop
    overlay.querySelector(".market-sim-close").addEventListener("click", closeOverlay);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeOverlay();
        }
    });

    // Mock Buy Action
    const buyButton = overlay.querySelector(marketType === 'tensor' ? '.btn-tensor-buy' : '.btn-eden-buy');
    buyButton.addEventListener("click", () => {
        const originalText = buyButton.innerText;
        buyButton.innerText = "SIGNING WALLET TRANSACTION...";
        buyButton.disabled = true;
        buyButton.style.opacity = "0.7";

        setTimeout(() => {
            buyButton.innerText = "CONFIRMING ON SOLANA BLOCKCHAIN...";
            
            setTimeout(() => {
                closeOverlay();
                if (window.notifier) {
                    window.notifier.show('SUCCESS', `Successfully purchased ${player.name} via ${marketType.toUpperCase()}! 🎉`, 'success');
                } else {
                    alert(`¡Compra confirmada! ${player.name} ya es parte de tu inventario.`);
                }
            }, 1500);
        }, 1500);
    });
};
