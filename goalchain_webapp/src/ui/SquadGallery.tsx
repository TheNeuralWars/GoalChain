import React from 'react';

interface PlayerCardProps {
    name: string;
    rarity: 'Gold' | 'Silver' | 'Bronze' | string;
    score: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ name, rarity, score }) => {
    // Map rarity tiers to classes and styling tokens
    const rarityClass = `card-rarity-${rarity.toLowerCase()}`;
    
    const badgeColor = rarity === 'Gold' 
        ? '#ffd700' 
        : rarity === 'Silver' 
            ? '#cbd5e1' 
            : '#b45309';

    const textGlowStyle = rarity === 'Gold'
        ? { color: '#ffd700', textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }
        : rarity === 'Silver'
            ? { color: '#cbd5e1', textShadow: '0 0 10px rgba(203, 213, 225, 0.2)' }
            : { color: '#d97706', textShadow: '0 0 8px rgba(217, 119, 6, 0.15)' };

    return (
        <div className={`glass-card ${rarityClass}`} style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            cursor: 'pointer'
        }}>
            {/* Holographic Badge / Artwork Shield */}
            <div style={{ 
                width: '100%', 
                height: '140px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem',
                position: 'relative'
            }}>
                <svg width="100" height="110" viewBox="0 0 100 110" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id={`shieldGrad-${rarity}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={badgeColor} stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#030307" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                    
                    {/* Card outer shield */}
                    <path 
                        d="M 50 5 L 85 20 L 85 70 L 50 105 L 15 70 L 15 20 Z" 
                        fill={`url(#shieldGrad-${rarity})`}
                        stroke={badgeColor} 
                        strokeWidth="2" 
                        style={{ filter: `drop-shadow(0 4px 12px ${badgeColor}33)` }} 
                    />
                    
                    {/* Inner detail border */}
                    <path 
                        d="M 50 9 L 80 22 L 80 67 L 50 98 L 20 67 L 20 22 Z" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.03)" 
                        strokeWidth="1" 
                    />
                    
                    {/* Center decorative ring */}
                    <circle cx="50" cy="48" r="22" fill="none" stroke={badgeColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                    
                    {/* Icon details (Football lines) */}
                    <g stroke={badgeColor} strokeWidth="1.5" fill="none" opacity="0.75">
                        <circle cx="50" cy="48" r="14" />
                        <path d="M 50 34 Q 45 48 50 62" />
                        <path d="M 50 34 Q 55 48 50 62" />
                        <path d="M 36 48 Q 50 43 64 48" />
                        <path d="M 36 48 Q 50 53 64 48" />
                    </g>
                    
                    {/* Rating label badge */}
                    <rect x="34" y="78" width="32" height="16" rx="4" fill="#030307" stroke={badgeColor} strokeWidth="1" />
                    <text x="50" y="90" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.5px">
                        {score} OVR
                    </text>
                </svg>
            </div>
            
            {/* Player details */}
            <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                {name}
            </h4>
            
            <div style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                ...textGlowStyle
            }}>
                {rarity} TIER
            </div>

            <button 
                className="btn-outline-green" 
                style={{ 
                    marginTop: '1.25rem', 
                    width: '100%', 
                    padding: '0.4rem 0.5rem', 
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                }}
            >
                FUSION 💎
            </button>
        </div>
    );
};

export const SquadGallery: React.FC = () => {
    const myPlayers = [
        { name: "Julian Satoshi", rarity: "Gold", score: 92 },
        { name: "Enzo Bit", rarity: "Silver", score: 84 },
        { name: "Alexis Chain", rarity: "Bronze", score: 78 },
        { name: "Lisandro Ledger", rarity: "Silver", score: 81 }
    ];

    return (
        <div className="squad-gallery" style={{ marginTop: '0.5rem', textAlign: 'left' }}>
            <h2 className="text-neon-green" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🏆</span> Mi Cantera (Youth Academy)
            </h2>
            
            {/* Player Card Responsive Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', 
                gap: '1.5rem', 
                marginTop: '1rem' 
            }}>
                {myPlayers.map((p, i) => <PlayerCard key={i} {...p} />)}
            </div>
            
            {/* Agent Tip Box */}
            <div style={{ 
                marginTop: '1.5rem', 
                padding: '1.25rem', 
                background: 'rgba(20, 241, 149, 0.01)', 
                borderRadius: '16px',
                border: '1px dashed rgba(20, 241, 149, 0.25)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
            }}>
                <span className="pulse-dot" style={{ marginTop: '5px', flexShrink: 0 }}></span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--primary-neon)' }}>Tip de Agente:</strong> Los jugadores de la Cantera (cNFTs) tienen costes de mantenimiento casi nulos. ¡Fusiónalos para crear una Leyenda Genesis!
                </p>
            </div>
        </div>
    );
};
