import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Fixture {
    id: number;
    home: string;
    away: string;
    status: string;
}

export const FixturesList: React.FC = () => {
    const { connected } = useWallet();
    const [fixtures, setFixtures] = useState<Fixture[]>([]);

    useEffect(() => {
        // Mock fetch, to be replaced by actual goalchain_api call
        fetch('http://localhost:3001/api/fixtures')
            .then(res => res.json())
            .then(data => setFixtures(data))
            .catch(err => {
                console.error("Failed to fetch fixtures:", err);
                // Fallback dummy data if API is not running
                setFixtures([
                    { id: 1, home: 'ARG', away: 'FRA', status: 'LIVE' },
                    { id: 2, home: 'ENG', away: 'ESP', status: 'SCHEDULED' }
                ]);
            });
    }, []);

    const handlePlaceBet = (fixtureId: number) => {
        if (!connected) {
            alert('Please connect your wallet first!');
            return;
        }
        // TODO: Anchor integration here
        console.log(`Placing bet on fixture ${fixtureId} via Anchor...`);
        alert(`Bet placed successfully! (Mock)`);
    };

    const getStatusString = (status: any) => {
        if (!status) return 'UNKNOWN';
        return Object.keys(status)[0].toUpperCase();
    };

    const getTeamInitials = (team: string) => {
        return team.substring(0, 3).toUpperCase();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {fixtures.map((f: any) => (
                <div key={f.pubkey} className="glass-card card-holographic p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 group">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-solana-green/50 transition-colors">
                                    <span className="text-3xl font-bold">{getTeamInitials(f.teamA)}</span>
                                </div>
                                <span className="text-white/20 font-black italic">VS</span>
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-solana-purple/50 transition-colors">
                                    <span className="text-3xl font-bold">{getTeamInitials(f.teamB)}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">{f.teamA} vs {f.teamB}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${getStatusString(f.status) === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                    <span className="text-sm font-bold uppercase tracking-widest opacity-60">
                                        {getStatusString(f.status)}
                                    </span>
                                    {getStatusString(f.status) !== 'LIVE' && (
                                        <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-white/70 ml-2">
                                            ⏳ INICIA EN: 02:45:00
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-right flex flex-col items-end">
                            <span className="block text-xs font-bold text-white/40 mb-1 uppercase">Stake Pool</span>
                            <span className="text-2xl font-black text-white">42,000 <span className="text-solana-green">GCH</span></span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-8">
                        {['1', 'X', '2'].map((opt) => (
                            <button 
                                key={opt}
                                onClick={() => handlePlaceBet(f.pubkey)}
                                className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 py-4 rounded-2xl transition-all font-bold text-lg"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => handlePlaceBet(f.pubkey)}
                        className="solana-btn w-full mt-4 py-4 rounded-2xl text-black font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(153,69,255,0.4)]"
                    >
                        Place Live Bet
                    </button>
                </div>
            ))}
        </div>
    );
};
