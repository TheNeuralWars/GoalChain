import React, { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchFixtures } from '../lib/goalchainClient';

interface Event {
    id: number;
    type: 'GOAL' | 'BET' | 'RESOLVE';
    message: string;
    time: string;
}

export const LiveEventFeed: React.FC = () => {
    const { connection } = useConnection();
    const [events, setEvents] = useState<Event[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const refresh = async () => {
            try {
                const fixtures = await fetchFixtures(connection);
                if (!mounted) return;
                const next = fixtures.slice(0, 5).map((f, idx) => {
                    const total = f.poolA + f.poolB + f.poolDraw;
                    const type: Event['type'] = f.status === 'resolved' ? 'RESOLVE' : (f.status === 'live' ? 'GOAL' : 'BET');
                    return {
                        id: Number(`${Date.now()}${idx}`),
                        type,
                        message: `${f.matchId}: ${f.teamA} vs ${f.teamB} | estado=${f.status} | pool=${total}`,
                        time: 'On-chain snapshot',
                    };
                });
                setEvents(next);
                setError(null);
            } catch (e) {
                if (!mounted) return;
                setError('No se pudo actualizar el feed on-chain.');
                setEvents([]);
            }
        };
        refresh();
        const interval = setInterval(refresh, 15000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [connection]);

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
            {error && (
                <div style={{ color: '#ff9ea8', fontSize: '0.8rem', marginBottom: 10 }}>{error}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.length === 0 && !error && (
                    <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>Sin eventos recientes on-chain para mostrar.</div>
                )}
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
