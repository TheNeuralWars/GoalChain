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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {fixtures.map(f => (
                <div key={f.id} className="bg-gray-700 p-4 rounded border border-gray-600 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">{f.home} vs {f.away}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${f.status === 'LIVE' ? 'bg-red-500' : 'bg-green-500'}`}>
                            {f.status}
                        </span>
                    </div>
                    <button 
                        onClick={() => handlePlaceBet(f.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Place Bet
                    </button>
                </div>
            ))}
        </div>
    );
};
