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
        { id: 2, type: 'RESOLVE', message: 'Mercado Resuelto: Brasil (Win)', time: 'hace 5 min' }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newEvent: Event = {
                id: Date.now(),
                type: 'BET',
                message: `Apuesta detectada: ${Math.floor(Math.random() * 100)} $GCH`,
                time: 'Justo ahora'
            };
            setEvents(prev => [newEvent, ...prev.slice(0, 4)]);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="live-feed" style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            background: 'rgba(20, 241, 149, 0.05)', 
            borderLeft: '4px solid #14f195',
            borderRadius: '0 12px 12px 0',
            textAlign: 'left'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="pulse-dot"></span> On-Chain Live Feed (Helius)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.map(event => (
                    <div key={event.id} style={{ 
                        fontSize: '0.85rem', 
                        padding: '8px', 
                        background: '#111', 
                        borderRadius: '4px',
                        border: '1px solid #222'
                    }}>
                        <span style={{ 
                            color: event.type === 'GOAL' ? '#ff4b4b' : '#14f195', 
                            fontWeight: 'bold',
                            marginRight: '8px'
                        }}>
                            [{event.type}]
                        </span>
                        {event.message}
                        <span style={{ float: 'right', opacity: 0.5 }}>{event.time}</span>
                    </div>
                ))}
            </div>

            <style>{`
                .pulse-dot {
                    width: 10px;
                    height: 10px;
                    background: #14f195;
                    border-radius: 50%;
                    box-shadow: 0 0 0 0 rgba(20, 241, 149, 0.7);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(20, 241, 149, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(20, 241, 149, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(20, 241, 149, 0); }
                }
            `}</style>
        </div>
    );
};
