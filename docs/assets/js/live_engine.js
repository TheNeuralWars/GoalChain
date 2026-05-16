/**
 * ⚡ GOALCHAIN LIVE ENGINE
 * Simulates real-time economic activity and visual effects.
 */

class LiveEngine {
    constructor() {
        this.burnVal = 148920;
        this.tickerElement = document.getElementById('globalTicker');
        this.burnElement = document.getElementById('liveBurnVal');
        this.detailBox = document.getElementById('gameDetailBox');
        
        this.init();
    }

    init() {
        // Start economic simulations
        this.startBurnSimulation();
        this.applyHolographicEffects();
        this.initGameHover();
        
        console.log("🚀 GoalChain Live Engine Initialized");
    }

    /**
     * 🎮 Handles hover effects for future games list
     */
    initGameHover() {
        const items = document.querySelectorAll('.future-game-item');
        if (!items.length || !this.detailBox) return;

        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const desc = item.getAttribute('data-desc');
                const color = window.getComputedStyle(item).color;
                
                this.detailBox.innerText = desc;
                this.detailBox.style.borderColor = color;
                this.detailBox.classList.add('active');
            });

            item.addEventListener('mouseleave', () => {
                this.detailBox.classList.remove('active');
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
                // Brief glow effect on update
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
                
                // Only if mouse is over or near
                if (x > -50 && x < rect.width + 50 && y > -50 && y < rect.height + 50) {
                    const xPct = (x / rect.width) * 100;
                    const yPct = (y / rect.height) * 100;
                    card.style.setProperty('--x', `${xPct}%`);
                    card.style.setProperty('--y', `${yPct}%`);
                }
            });
        });
    }
}

// Start Engine
window.addEventListener('load', () => {
    window.gcLiveEngine = new LiveEngine();
});
