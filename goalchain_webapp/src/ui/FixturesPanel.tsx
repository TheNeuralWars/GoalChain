import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { idl, PROGRAM_ID } from '@goalchain/sdk';

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
    const { publicKey, sendTransaction } = useWallet();
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFixtures = async () => {
            try {
                // Mocking connection to Program for Alpha UI
                // En producción usaremos el AnchorProvider real aquí
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
        // Aquí integraremos la llamada al programa vía SDK
    };

    if (loading) return <div>Cargando partidos del Mundial...</div>;

    return (
        <div className="fixtures-container" style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
            <h2 style={{ color: '#14f195' }}>Próximos Partidos</h2>
            {fixtures.map((f) => (
                <div key={f.pubkey} style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '1.5rem', 
                    borderRadius: '12px',
                    border: '1px solid #333',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <span>{f.teamA}</span>
                        <span style={{ color: '#9945ff' }}>VS</span>
                        <span>{f.teamB}</span>
                    </div>
                    
                    <div style={{ margin: '1rem 0', fontSize: '0.9rem', opacity: 0.7 }}>
                        ID: {f.matchId} | Pool Total: {f.poolA + f.poolB} $GCH
                    </div>

                    <div className="bet-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleBet(f.pubkey, 'A')} style={btnStyle}>Gana {f.teamA}</button>
                        <button onClick={() => handleBet(f.pubkey, 'Draw')} style={btnStyle}>Empate</button>
                        <button onClick={() => handleBet(f.pubkey, 'B')} style={btnStyle}>Gana {f.teamB}</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const btnStyle: React.CSSProperties = {
    background: '#14f195',
    color: '#000',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer'
};
