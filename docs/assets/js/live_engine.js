/**
 * ⚡ GOALCHAIN LIVE ENGINE v2
 * Simulates real-time economic activity and visual effects.
 * Handles DAO proposals and interactive discovery.
 */

class LiveEngine {
    constructor() {
        this.burnVal = 148920;
        this.tickerElement = document.getElementById('globalTicker');
        this.burnElement = document.getElementById('liveBurnVal');
        this.detailText = document.getElementById('gameDetailText');
        this.detailBox = document.getElementById('gameDetailBox');
        
        // Stats Elements
        this.statStaked = document.getElementById('statStaked');
        this.statMarketCap = document.getElementById('statMarketCap');
        this.statHolders = document.getElementById('statHolders');
        
        this.stakedVal = 48290.4;
        this.marketCapVal = 14.8;
        this.holdersVal = 18294;
        
        this.defaultDAOText = "SÉ PARTE DE LA DAO Y PROPONE UN NUEVO JUEGO 🏛️";
        
        this.init();
    }

    init() {
        // Start economic simulations
        this.startBurnSimulation();
        this.applyHolographicEffects();
        this.initGameHover();
        this.startStatsSimulation();
        
        console.log("🚀 GoalChain Live Engine Initialized");
    }

    /**
     * 🎮 Handles hover effects for future games list with full bilingual support
     */
    initGameHover() {
        const items = document.querySelectorAll('.future-game-item');
        if (!items.length || !this.detailText) return;

        const detailBtn = this.detailBox ? this.detailBox.querySelector('.btn') : null;

        items.forEach(item => {
            item.style.transition = 'all 0.25s ease';
            item.style.cursor = 'pointer';

            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateX(8px)';
                
                // Detect active language
                const isEn = (typeof currentLang !== 'undefined' && currentLang === 'en');
                const desc = isEn ? item.getAttribute('data-desc-en') : item.getAttribute('data-desc-es');
                const color = window.getComputedStyle(item).color;
                
                this.detailText.innerHTML = desc || '';
                this.detailBox.style.borderStyle = 'solid';
                this.detailBox.style.borderColor = color || 'var(--secondary)';
                this.detailBox.style.boxShadow = '0 10px 25px rgba(255, 255, 255, 0.05)';
                
                if (detailBtn) detailBtn.style.display = 'none';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateX(0)';
                
                // Restore localized default DAO text
                if (typeof t === 'function') {
                    this.detailText.textContent = t('dao_title');
                    if (detailBtn) {
                        detailBtn.textContent = t('dao_btn');
                        detailBtn.style.display = 'inline-block';
                    }
                } else {
                    this.detailText.textContent = this.defaultDAOText;
                    if (detailBtn) detailBtn.style.display = 'inline-block';
                }
                
                this.detailBox.style.borderStyle = 'dashed';
                this.detailBox.style.borderColor = 'var(--secondary)';
                this.detailBox.style.boxShadow = 'none';
            });
        });
    }

    /**
     * 🔥 Simulates real-time burn updates from the Vault
     */
    startBurnSimulation() {
        setInterval(() => {
            const increment = Math.floor(Math.random() * 5) + 1;
            this.burnVal += increment;
            if(this.burnElement) {
                this.burnElement.innerText = this.burnVal.toLocaleString();
                this.burnElement.style.textShadow = "0 0 30px rgba(255, 77, 106, 0.8)";
                setTimeout(() => {
                    this.burnElement.style.textShadow = "0 0 15px rgba(255, 77, 106, 0.4)";
                }, 200);
            }
        }, 3000);
    }

    /**
     * 💎 Adds holographic mouse-tracking to cards
     */
    applyHolographicEffects() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.nft-card-3d');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (x > -50 && x < rect.width + 50 && y > -50 && y < rect.height + 50) {
                    const xPct = (x / rect.width) * 100;
                    const yPct = (y / rect.height) * 100;
                    card.style.setProperty('--x', `${xPct}%`);
                    card.style.setProperty('--y', `${yPct}%`);
                }
            });
        });
    }

    /**
     * 📊 Simulates real-time growth for ecosystem metrics
     */
    startStatsSimulation() {
        setInterval(() => {
            // Staked SOL growth
            this.stakedVal += (Math.random() * 0.5);
            if (this.statStaked) this.statStaked.innerText = `◎ ${this.stakedVal.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}`;

            // Market Cap growth
            this.marketCapVal += (Math.random() * 0.01);
            if (this.statMarketCap) this.statMarketCap.innerText = `$${this.marketCapVal.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}M`;

            // Active Managers growth
            if (Math.random() > 0.7) {
                this.holdersVal += Math.floor(Math.random() * 2) + 1;
                if (this.statHolders) this.statHolders.innerText = this.holdersVal.toLocaleString();
            }
        }, 5000);
    }
}

// DAO Global Functions
function toggleDAOForm() {
    const form = document.getElementById('daoProposalForm');
    const box = document.getElementById('gameDetailBox');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        box.style.display = 'none';
    } else {
        form.style.display = 'none';
        box.style.display = 'flex';
    }
}

function submitDAOProposal() {
    const name = document.getElementById('daoGameName').value;
    const desc = document.getElementById('daoGameDesc').value;
    
    if (!name || !desc) {
        alert("Por favor completa los campos de la propuesta.");
        return;
    }

    alert(`✅ Propuesta enviada a la DAO: ${name}\nGracias por contribuir al ecosistema GoalChain.`);
    
    // Clear and close
    document.getElementById('daoGameName').value = "";
    document.getElementById('daoGameDesc').value = "";
    toggleDAOForm();
}

// Start Engine
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LiveEngine());
} else {
    new LiveEngine();
}
