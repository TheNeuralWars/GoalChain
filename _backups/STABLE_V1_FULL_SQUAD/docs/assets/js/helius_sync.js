/**
 * GoalChain Helius Sync Prototype
 * Simulation of Helius Webhooks and real-time on-chain synchronization.
 */

class HeliusSync {
    constructor() {
        this.feedContainer = document.getElementById('heliusEvents');
        this.events = [];
        this.isRunning = true;
        
        this.init();
    }

    init() {
        console.log("Helius Sync: Listening for program transactions...");
        this.startSimulation();
    }

    startSimulation() {
        const eventTypes = [
            { type: 'GOAL', icon: '⚽', color: 'var(--primary)', desc: '¡GOL de Argentina!' },
            { type: 'BET', icon: '💰', color: '#00e0ff', desc: 'Nueva apuesta: 250 $GCH' },
            { type: 'MINT', icon: '💎', color: 'var(--secondary)', desc: 'Nuevo cNFT Minteado (Academy)' },
            { type: 'LIQUIDATION', icon: '💀', color: '#ff4d6a', desc: 'Posición liquidada en Drift' }
        ];

        const simulate = () => {
            if (!this.isRunning) return;
            
            const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            this.pushEvent(event);
            
            // Re-agendar el siguiente evento (intervalo aleatorio entre 3 y 8 segundos)
            setTimeout(simulate, Math.random() * 5000 + 3000);
        };

        setTimeout(simulate, 2000);
    }

    pushEvent(evt) {
        const newEvent = {
            id: Math.random().toString(36).substr(2, 9),
            ...evt,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            signature: `0x${Math.random().toString(16).slice(2, 10)}...`
        };

        this.events.unshift(newEvent);
        if (this.events.length > 15) this.events.pop(); // Mantener solo los últimos 15

        this.renderFeed();
        this.handleEventImpact(newEvent);
    }

    renderFeed() {
        if (!this.feedContainer) return;

        this.feedContainer.innerHTML = this.events.map(e => `
            <div class="event-card" style="background: rgba(255,255,255,0.03); border-left: 3px solid ${e.color}; padding: 10px; border-radius: 4px; animation: slideIn 0.3s ease;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="font-size:0.6rem; color:var(--text-dim);">${e.time}</span>
                    <span style="font-size:0.5rem; color:var(--text-dim); font-family:monospace;">${e.signature}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1rem;">${e.icon}</span>
                    <p style="font-size:0.7rem; margin:0; font-weight:600;">${e.desc}</p>
                </div>
            </div>
        `).join('');
    }

    handleEventImpact(e) {
        // Reacción visual en la App según el evento
        if (e.type === 'GOAL') {
            const matchDisplay = document.getElementById('matchDisplay');
            if (matchDisplay) {
                matchDisplay.style.borderColor = 'var(--primary)';
                matchDisplay.style.boxShadow = '0 0 30px rgba(20, 241, 149, 0.3)';
                setTimeout(() => {
                    matchDisplay.style.borderColor = 'rgba(255,255,255,0.05)';
                    matchDisplay.style.boxShadow = 'none';
                }, 1000);
            }
        }

        // Integración con Dialect
        if (window.gcDialect && (e.type === 'GOAL' || e.type === 'LIQUIDATION')) {
            window.gcDialect.notify(`Helius Alert: ${e.icon}`, e.desc);
        }
    }
}

// Estilos de animación para el feed
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    window.gcHelius = new HeliusSync();
});
