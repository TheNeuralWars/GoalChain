import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

interface Fixture {
    pubkey: string;
    matchId: string;
    teamA: string;
    teamB: string;
    poolA: number;
    poolB: number;
    status: any;
}

export const FixturesPanel: React.FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFixtures = async () => {
            try {
                // Mocking connection to Program for Alpha UI
                const mockFixtures = [
                    { pubkey: '1', matchId: 'WC-01', teamA: 'Argentina', teamB: 'Francia', poolA: 1500, poolB: 1200, status: { upcoming: {} } },
                    { pubkey: '2', matchId: 'WC-02', teamA: 'Brasil', teamB: 'España', poolA: 800, poolB: 950, status: { live: {} } }
                ];
                setFixtures(mockFixtures);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching fixtures:", error);
                setLoading(false);
            }
        };

        fetchFixtures();
    }, [connection]);

    const handleBet = async (fixturePubkey: string, side: 'A' | 'B' | 'Draw') => {
        if (!publicKey) {
            alert("¡Conecta tu wallet primero!");
            return;
        }
        console.log(`Apostando por ${side} en el partido ${fixturePubkey}`);
    };

    if (loading) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ color: '#14f195', fontSize: '1.2rem', fontWeight: 600 }}>Cargando partidos del Mundial...</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 className="text-neon-green">
                <span style={{ fontSize: '1.4rem' }}>🏆</span> Fixtures & Live Pools
            </h2>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
                {fixtures.map((f) => {
                    const isLive = f.status && f.status.live;
                    return (
                        <div key={f.pubkey} className="glass-card" style={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Glow background strip for Live matches */}
                            {isLive && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: 'linear-gradient(90deg, #ff4b4b, #9945ff)'
                                }} />
                            )}
                            
                            {/* Header: ID and Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                <span style={{ fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.5px' }}>
                                    ID: {f.matchId}
                                </span>
                                <span style={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    background: isLive ? 'rgba(255, 75, 75, 0.12)' : 'rgba(20, 241, 149, 0.1)',
                                    color: isLive ? '#ff4b4b' : '#14f195',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    <span style={{ 
                                        width: '6px', 
                                        height: '6px', 
                                        borderRadius: '50%', 
                                        background: isLive ? '#ff4b4b' : '#14f195',
                                        boxShadow: isLive ? '0 0 8px #ff4b4b' : '0 0 8px #14f195',
                                        animation: isLive ? 'pulse-glow 1.5s infinite' : 'none'
                                    }} />
                                    {isLive ? 'LIVE NOW' : 'UPCOMING'}
                                </span>
                            </div>

                            {/* Teams Grid */}
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0.5rem 0' }}>
                                <div style={{ textAlign: 'center', width: '35%' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{f.teamA}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Local</div>
                                </div>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '15%'
                                }}>
                                    <span style={{ 
                                        fontSize: '0.85rem', 
                                        fontWeight: 900, 
                                        color: '#9945ff', 
                                        background: 'rgba(153, 69, 255, 0.1)', 
                                        padding: '4px 10px', 
                                        borderRadius: '8px',
                                        border: '1px solid rgba(153, 69, 255, 0.2)'
                                    }}>VS</span>
                                </div>

                                <div style={{ textAlign: 'center', width: '35%' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{f.teamB}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Visitante</div>
                                </div>
                            </div>
                            
                            {/* Pool Indicator bar */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                                    <span>Pool total apostado</span>
                                    <span style={{ fontWeight: 700, color: '#14f195' }}>{f.poolA + f.poolB} $GCH</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
                                    <div style={{ 
                                        width: `${(f.poolA / (f.poolA + f.poolB)) * 100}%`, 
                                        background: 'linear-gradient(90deg, #14f195, #10b981)' 
                                    }} />
                                    <div style={{ 
                                        width: `${(f.poolB / (f.poolA + f.poolB)) * 100}%`, 
                                        background: 'linear-gradient(90deg, #7c3aed, #9945ff)' 
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                                    <span>{f.poolA} $GCH ({Math.round(f.poolA / (f.poolA + f.poolB) * 100)}%)</span>
                                    <span>{f.poolB} $GCH ({Math.round(f.poolB / (f.poolA + f.poolB) * 100)}%)</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '0.25rem' }}>
                                <button onClick={() => handleBet(f.pubkey, 'A')} className="btn-outline-green" style={{ fontSize: '0.8rem', padding: '0.6rem 0.5rem' }}>
                                    Gana {f.teamA}
                                </button>
                                <button onClick={() => handleBet(f.pubkey, 'Draw')} className="btn-outline-green" style={{ fontSize: '0.8rem', padding: '0.6rem 0.5rem', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}>
                                    Empate
                                </button>
                                <button onClick={() => handleBet(f.pubkey, 'B')} className="btn-outline-green" style={{ fontSize: '0.8rem', padding: '0.6rem 0.5rem', color: '#9945ff', borderColor: 'rgba(153, 69, 255, 0.4)' }}>
                                    Gana {f.teamB}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
