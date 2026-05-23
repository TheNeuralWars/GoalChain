import React, { useState, useEffect } from 'react';

interface Event {
    id: number;
    type: 'GOAL' | 'BET' | 'RESOLVE';
    message: string;
    time: string;
}

export const LiveEventFeed: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([
        { id: 1, type: 'BET', message: 'Nueva apuesta: 5.5 $GCH en ARG vs FRA', time: 'hace 2 min' },
        { id: 2, type: 'RESOLVE', message: 'Mercado Resuelto: Brasil (Win)', time: 'hace 5 min' },
        { id: 3, type: 'GOAL', message: '¡GOL! España toma la delantera (Dani Olmo 23\')', time: 'hace 8 min' }
    ]);

    useEffect(() => {
        const mockMessages = {
            BET: [
                "Apuesta detectada: 45 $GCH en ARG vs FRA",
                "Nuevo pool: 120 $GCH por Empate en ESP vs BRA",
                "Stake alto: 350 $GCH por Francia vs Argentina",
                "Apuesta relámpago: 85 $GCH en Argentina (Local)"
            ],
            GOAL: [
                "¡GOL! Argentina anota (Messi 64')",
                "¡GOL! Francia empata (Mbappé 80')",
                "Tarjeta Roja: Defensor expulsado en el minuto 41",
                "¡GOL! España anota un golazo (Lamine Yamal 54')"
            ],
            RESOLVE: [
                "Mercado Resuelto: ARG vs FRA (Argentina gana)",
                "Oráculo Actualizado: Rendimiento ARG-PERP +14.5%",
                "Mercado Resuelto: BRA vs ESP (Empate)",
                "Oráculo Actualizado: Rendimiento FRA-PERP -5.2%"
            ]
        };

        const interval = setInterval(() => {
            const types: ('GOAL' | 'BET' | 'RESOLVE')[] = ['BET', 'GOAL', 'RESOLVE'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const pool = mockMessages[randomType];
            const randomMsg = pool[Math.floor(Math.random() * pool.length)];

            const newEvent: Event = {
                id: Date.now(),
                type: randomType,
                message: randomMsg,
                time: 'Justo ahora'
            };

            // Dispatch global event for the AI Commentator to listen to
            window.dispatchEvent(new CustomEvent('goalchain-event', { detail: newEvent }));

            setEvents(prev => {
                const updatedList = [newEvent, ...prev.slice(0, 4)];
                return updatedList.map((evt, idx) => ({
                    ...evt,
                    // Update relative times dynamically
                    time: idx === 0 
                        ? 'Justo ahora' 
                        : idx === 1 
                            ? 'hace 1 min' 
                            : `hace ${idx * 3} min`
                }));
            });
        }, 7000);

        return () => clearInterval(interval);
    }, []);

    // Get badge based on type
    const renderBadge = (type: 'GOAL' | 'BET' | 'RESOLVE') => {
        switch (type) {
            case 'GOAL':
                return <span className="feed-badge feed-badge-goal">🥅 Goal</span>;
            case 'BET':
                return <span className="feed-badge feed-badge-bet">💸 Bet</span>;
            case 'RESOLVE':
                return <span className="feed-badge feed-badge-resolve">⚖️ Oracle</span>;
            default:
                return <span className="feed-badge">{type}</span>;
        }
    };

    return (
        <div className="glass-card live-feed" style={{ 
            textAlign: 'left',
            borderLeft: '4px solid var(--primary-neon)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
        }}>
            <h3 style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.3px'
            }}>
                <span className="pulse-dot"></span> On-Chain Live Feed (Helius)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.map(event => (
                    <div key={event.id} className="feed-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                            {renderBadge(event.type)}
                            <span style={{ 
                                color: '#f1f5f9', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                fontSize: '0.82rem',
                                fontWeight: 500
                            }}>
                                {event.message}
                            </span>
                        </div>
                        <span style={{ 
                            fontSize: '0.72rem', 
                            color: '#64748b', 
                            fontFamily: 'monospace',
                            flexShrink: 0
                        }}>
                            {event.time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
