import React from 'react';

interface PlayerCardProps {
    name: string;
    rarity: string;
    score: number;
    image: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ name, rarity, score, image }) => (
    <div style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)', 
        border: `2px solid ${rarity === 'Gold' ? '#ffd700' : '#444'}`,
        borderRadius: '12px',
        padding: '1rem',
        textAlign: 'center',
        transition: 'transform 0.2s',
        cursor: 'pointer'
    }}>
        <div style={{ width: '100%', height: '150px', background: '#222', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '3rem' }}>⚽</span>
        </div>
        <h4 style={{ margin: '0.5rem 0' }}>{name}</h4>
        <div style={{ fontSize: '0.8rem', color: rarity === 'Gold' ? '#ffd700' : '#aaa' }}>{rarity} Tier</div>
        <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#14f195' }}>SCORE: {score}</div>
        <button style={{ 
            marginTop: '1rem', 
            background: 'transparent', 
            border: '1px solid #14f195', 
            color: '#14f195',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '0.7rem'
        }}>FUSION 💎</button>
    </div>
);

export const SquadGallery: React.FC = () => {
    const myPlayers = [
        { name: "Julian Satoshi", rarity: "Gold", score: 92, image: "" },
        { name: "Enzo Bit", rarity: "Silver", score: 84, image: "" },
        { name: "Alexis Chain", rarity: "Bronze", score: 78, image: "" },
        { name: "Lisandro Ledger", rarity: "Silver", score: 81, image: "" }
    ];

    return (
        <div className="squad-gallery" style={{ marginTop: '2rem', textAlign: 'left' }}>
            <h2 style={{ color: '#14f195', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                Mi Cantera (Youth Academy)
            </h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '1.5rem', 
                marginTop: '1.5rem' 
            }}>
                {myPlayers.map((p, i) => <PlayerCard key={i} {...p} />)}
            </div>
            
            <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: 'rgba(20, 241, 149, 0.05)', 
                borderRadius: '8px',
                border: '1px dashed #14f195'
            }}>
                <strong>Tip de Agente:</strong> Los jugadores de la Cantera (cNFTs) tienen costes de mantenimiento casi nulos. ¡Fusiónalos para crear una Leyenda Genesis!
            </div>
        </div>
    );
};
