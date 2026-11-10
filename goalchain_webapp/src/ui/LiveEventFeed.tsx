import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchFixtures } from '../lib/goalchainClient';
import { useTranslation } from '../i18n';

interface Event {
    id: number;
    type: 'GOAL' | 'BET' | 'RESOLVE';
    message: string;
    time: string;
}

export const LiveEventFeed: React.FC = () => {
    const { connection } = useConnection();
    const { t } = useTranslation();
    const [events, setEvents] = useState<Event[]>([]);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            const fixtures = await fetchFixtures(connection);
            const next = fixtures.slice(0, 5).map((f, idx) => {
                const total = f.poolA + f.poolB + f.poolDraw;
                const type: Event['type'] = f.status === 'completed' ? 'RESOLVE' : (f.status === 'live' ? 'GOAL' : 'BET');
                return {
                    id: Number(`${Date.now()}${idx}`),
                    type,
                    message: `${f.matchId}: ${f.teamA} vs ${f.teamB} | status=${f.status} | pool=${total}`,
                    time: 'On-chain snapshot',
                };
            });
            setEvents(next);
            setError(null);
        } catch (e) {
            setError('rpc_error');
            setEvents([]);
        }
    }, [connection]);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 15000);
        return () => clearInterval(interval);
    }, [refresh]);

    return (
        <div className="live-feed" style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            background: 'rgba(20, 241, 149, 0.05)', 
            borderLeft: '4px solid #14f195',
            borderRadius: '0 12px 12px 0',
            textAlign: 'left'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="pulse-dot"></span> On-Chain Live Feed (Solana Devnet)
                </h3>
                <button
                    type="button"
                    onClick={refresh}
                    style={{
                        minHeight: 44,
                        padding: '6px 14px',
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: '#cbd5e1',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    {t('fixtures_retry_btn')}
                </button>
            </div>
            {error && (
                <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: 12, padding: '10px 12px', background: 'rgba(127, 29, 29, 0.2)', borderRadius: 8 }}>
                    ⚠️ {t('feed_rpc_error')}
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.length === 0 && !error && (
                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1', padding: '12px 14px', background: 'rgba(15, 23, 42, 0.65)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ margin: '0 0 10px 0' }}>{t('feed_empty_state')}</p>
                        <Link
                            to="/estadio?tab=simulator"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                minHeight: 44,
                                padding: '8px 14px',
                                borderRadius: 8,
                                background: '#e5a93c',
                                color: '#0a0b0e',
                                fontWeight: 800,
                                fontSize: '0.88rem',
                                textDecoration: 'none'
                            }}
                        >
                            {t('fixtures_open_sim_btn')}
                        </Link>
                    </div>
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
