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
            
            // 35% de probabilidad de disparar una actualización del Oráculo si hay jugadores cargados en la Galería 3D
            const container = document.getElementById('galleryContainer');
            if (Math.random() < 0.35 && container && container._players && container._players.length > 0) {
                const playersList = container._players;
                const player = playersList[Math.floor(Math.random() * playersList.length)];
                
                const stats = ['atk', 'def', 'hype'];
                const stat = stats[Math.floor(Math.random() * stats.length)];
                const delta = Math.random() > 0.4 ? 1 : -1;
                
                const oldVal = player.stats[stat];
                const newVal = Math.max(10, Math.min(99, oldVal + delta));
                player.stats[stat] = newVal;
                
                // Recalcular base yield
                const baseYield = player.stats.hype * 10;
                player.base_yield_rate = baseYield;
                
                const statLabel = stat.toUpperCase();
                const desc = `Oracle: ${player.name} (${statLabel}) ${delta > 0 ? '▲' : '▼'} ${oldVal}➔${newVal}. Yield: +${baseYield} GCH/d.`;
                
                const event = {
                    type: 'ORACLE',
                    icon: '📡',
                    color: '#ffcc00',
                    desc: desc,
                    playerId: player.id,
                    stat: stat,
                    newVal: newVal,
                    newYield: baseYield
                };
                
                this.pushEvent(event);
            } else {
                const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                
                // Localizar mensajes de eventos estándar según el idioma
                const isEn = (typeof currentLang !== 'undefined' && currentLang === 'en');
                if (isEn) {
                    if (event.type === 'GOAL') event.desc = 'GOAL scored by Argentina!';
                    else if (event.type === 'BET') event.desc = 'New wager placed: 250 $GCH';
                    else if (event.type === 'MINT') event.desc = 'New cNFT Minted (Academy Squad)';
                    else if (event.type === 'LIQUIDATION') event.desc = 'Liquidation event captured on Drift Protocol';
                }
                
                this.pushEvent(event);
            }
            
            // Re-agendar el siguiente evento (intervalo aleatorio entre 3 y 8 segundos)
            setTimeout(simulate, Math.random() * 5000 + 3500);
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

        // Efectos dinámicos en las cartas 3D cuando el Oráculo actualiza stats
        if (e.type === 'ORACLE' && e.playerId) {
            const container = document.getElementById('galleryContainer');
            if (container) {
                const cardWrapper = container.querySelector(`[data-card-player-id="${e.playerId}"]`);
                if (cardWrapper) {
                    const cardInner = cardWrapper.querySelector('.nft-card-3d');
                    if (cardInner) {
                        // Resaltar con animación láser dorada
                        cardInner.style.borderColor = '#ffcc00';
                        cardInner.style.boxShadow = '0 0 35px rgba(255, 204, 0, 0.7)';
                        
                        // Efecto zoom temporal en la pill de rendimiento
                        const yieldPill = cardWrapper.querySelector('.yield-pill-badge');
                        if (yieldPill) {
                            yieldPill.style.transform = 'scale(1.2)';
                            yieldPill.style.borderColor = '#ffcc00';
                            yieldPill.style.boxShadow = '0 0 15px #ffcc00';
                        }
                        
                        setTimeout(() => {
                            cardInner.style.borderColor = '';
                            cardInner.style.boxShadow = '';
                            if (yieldPill) {
                                yieldPill.style.transform = '';
                                yieldPill.style.borderColor = '';
                                yieldPill.style.boxShadow = '';
                            }
                        }, 2500);
                    }
                    
                    // Mutar los valores en el DOM de forma reactiva
                    const atkSpan = cardWrapper.querySelector('.stat-atk-val');
                    const defSpan = cardWrapper.querySelector('.stat-def-val');
                    const hypeSpan = cardWrapper.querySelector('.stat-hype-val');
                    const yieldSpan = cardWrapper.querySelector('.yield-val');
                    
                    if (e.stat === 'atk' && atkSpan) {
                        atkSpan.innerText = e.newVal;
                        atkSpan.style.color = '#ffcc00';
                        setTimeout(() => atkSpan.style.color = '', 2500);
                    } else if (e.stat === 'def' && defSpan) {
                        defSpan.innerText = e.newVal;
                        defSpan.style.color = '#ffcc00';
                        setTimeout(() => defSpan.style.color = '', 2500);
                    } else if (e.stat === 'hype' && hypeSpan) {
                        hypeSpan.innerText = e.newVal;
                        hypeSpan.style.color = '#ffcc00';
                        setTimeout(() => hypeSpan.style.color = '', 2500);
                    }
                    
                    if (yieldSpan) {
                        yieldSpan.innerText = e.newYield;
                        yieldSpan.style.color = '#14f195';
                        setTimeout(() => yieldSpan.style.color = '', 2500);
                    }
                }
            }

            // Notificación global en pantalla
            if (window.notifier) {
                const isEn = (typeof currentLang !== 'undefined' && currentLang === 'en');
                window.notifier.show(
                    isEn ? '📡 ORACLE EVENT' : '📡 EVENTO DE ORÁCULO',
                    e.desc,
                    'info'
                );
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
