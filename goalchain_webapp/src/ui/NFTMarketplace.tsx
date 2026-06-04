import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as solanaWeb3 from '@solana/web3.js';
import { SimulationBadge } from '../components/SimulationBadge';

interface PlayerNFT {
  id: number;
  name: string;
  country: string;
  rarity: string;
  position: string;
  price: string;
  seller: string;
  filename?: string;
  stats?: {
    atk: number;
    def: number;
    hype: number;
  };
  market_value_eur?: number;
  current_club?: string;
}

const RARITY_PRICES: Record<string, string> = {
  mythic: '25.0 SOL',
  legendary: '12.5 SOL',
  epic: '5.0 SOL',
  rare: '1.5 SOL',
  common: '0.2 SOL',
};

const RARITY_COLORS: Record<string, string> = {
  mythic: 'var(--gold)',
  legendary: 'var(--secondary-neon)',
  epic: '#9945ff',
  rare: 'var(--primary-neon)',
  common: '#cbd5e1',
};

const FALLBACK_TREASURY = 'FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg';

export function NFTMarketplace() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [listings, setListings] = useState<PlayerNFT[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [treasuryAddress, setTreasuryAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchTreasury = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${apiBase}/api/economy/config`);
        if (!res.ok) return;
        const data = await res.json();
        const addr = data?.onchainConfig?.treasuryTokenAccount || FALLBACK_TREASURY;
        setTreasuryAddress(addr || null);
      } catch {
        setTreasuryAddress(null);
      }
    };
    fetchTreasury();
  }, []);

  // Load players and simulate listings on mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/assets/data/players.json');
        if (response.ok) {
          const players = await response.json() as PlayerNFT[];
          
          // Pick 8 random players to display as listings
          const shuffled = [...players].sort(() => 0.5 - Math.random());
          const initialListings = shuffled.slice(0, 8).map(player => ({
            ...player,
            price: RARITY_PRICES[player.rarity.toLowerCase()] || '1.0 SOL',
            seller: `GoAL${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`
          }));
          setListings(initialListings);
        }
      } catch (error) {
        console.error('Error loading marketplace:', error);
      }
    };
    fetchPlayers();
  }, []);

  const handleBuy = async (player: PlayerNFT, mode: 'cash' | 'solana') => {
    setLoadingId(player.id);
    const walletAddress = publicKey ? publicKey.toBase58() : localStorage.getItem('goalchain_wallet');

    if (!walletAddress) {
      alert('⚠️ Por favor conecta tu wallet Solana para comprar jugadores.');
      setLoadingId(null);
      return;
    }

    if (mode === 'cash') {
      // Mock Cash/Fiat Purchase Flow
      setTimeout(() => {
        const inventory = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
        inventory.push(player);
        localStorage.setItem('goalchain_inventory', JSON.stringify(inventory));
        
        setListings(prev => prev.filter(p => p.id !== player.id));
        setLoadingId(null);
        alert(`🎉 ¡ÉXITO! Has adquirido a ${player.name} mediante "Compra en Cash" con éxito. Ya puedes ver este cromo en la pestaña "Mi Plantilla".`);
        
        // Trigger local event to notify other sections
        window.dispatchEvent(new Event('storage'));
      }, 1500);
      return;
    }

    // Solana Devnet purchase flow
    if (!publicKey) {
      alert('⚠️ Para pagar con SOL, conecta tu billetera Phantom u otra compatible mediante el adaptador.');
      setLoadingId(null);
      return;
    }

    try {
      if (!treasuryAddress) {
        alert('⚠️ Tesorería no disponible en este momento. La compra en SOL está deshabilitada.');
        setLoadingId(null);
        return;
      }
      const destination = new solanaWeb3.PublicKey(treasuryAddress);
      const priceStr = player.price.split(' ')[0];
      const priceSol = parseFloat(priceStr) || 0.1;
      const lamports = Math.floor(priceSol * 1_000_000); // Scaled for devnet testing (0.001 SOL per listed SOL)

      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: destination,
          lamports: lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      console.log('Solana Tx Sent:', signature);

      alert('⏳ Confirmando transacción en Devnet...');
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Solana Tx Confirmed!');

      const inventory = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
      inventory.push(player);
      localStorage.setItem('goalchain_inventory', JSON.stringify(inventory));
      
      setListings(prev => prev.filter(p => p.id !== player.id));
      setLoadingId(null);
      
      alert(`🎉 ¡COMPRA CONFIRMADA EN SOLANA DEVNET! \n\nHas adquirido a ${player.name}.\n\nTx ID: ${signature.slice(0, 10)}...`);
      window.dispatchEvent(new Event('storage'));
      window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');

    } catch (err) {
      console.error('Solana transaction error:', err);
      alert('❌ La transacción fue cancelada o falló.');
      setLoadingId(null);
    }
  };

  const filteredListings = activeFilter === 'all'
    ? listings
    : listings.filter(p => p.rarity.toLowerCase() === activeFilter);

  const filters = ['all', 'mythic', 'legendary', 'epic', 'rare', 'common'] as const;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 className="text-neon-purple" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 Mercado de Transferencias
            <SimulationBadge />
            {treasuryAddress === null && (
              <span style={{ fontSize: '0.6rem', color: 'var(--accent-red)', fontWeight: 600 }}>
                ⛔ SOL OFFLINE
              </span>
            )}
          </h2>
          <p style={{ opacity: 0.7, fontSize: '0.8rem', marginTop: '4px' }}>
            Ficha jugadores de otros managers en tiempo real. Soporta compra on-chain en SOL o compra simulada en Cash.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              background: activeFilter === filter ? 'var(--primary-neon)' : 'rgba(255,255,255,0.03)',
              color: activeFilter === filter ? '#000' : '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid of Listings */}
      {filteredListings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No hay cartas listadas bajo esta categoría en este momento.</p>
          <button onClick={() => setActiveFilter('all')} className="btn-neon-green" style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            Ver Todo el Mercado
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {filteredListings.map(player => {
            const rarityCol = RARITY_COLORS[player.rarity.toLowerCase()] || '#fff';
            return (
              <div 
                key={player.id} 
                className="glass-card" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: 'rgba(10, 10, 20, 0.4)'
                }}
              >
                {/* Visual Header / Avatar Banner */}
                <div style={{ 
                  height: '140px', 
                  background: `linear-gradient(135deg, rgba(13,13,21,0.9), rgba(153,69,255,0.15))`,
                  position: 'relative', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <div style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.15))' }}>⚽</div>
                  
                  {/* Price Tag */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.85)', padding: '4px 10px', borderRadius: '20px', fontWeight: 900, color: 'var(--primary-neon)', border: '1px solid var(--primary-neon)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {player.price}
                  </div>
                </div>

                {/* Details Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      <span>Seller: {player.seller}</span>
                      <span style={{ fontWeight: 'bold', color: rarityCol }}>{player.rarity}</span>
                    </div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800 }}>{player.name}</h4>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>📍 Club: {player.current_club || 'Agente Libre'} · Val: {(player.market_value_eur || 1000000).toLocaleString()} EUR</span>
                  </div>

                  {/* Player Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                    <span style={{ color: 'var(--accent-red)' }}>ATK: {player.stats?.atk || 50}</span>
                    <span style={{ color: 'var(--primary-neon)' }}>DEF: {player.stats?.def || 50}</span>
                    <span style={{ color: '#ffcc00' }}>HYPE: {player.stats?.hype || 50}</span>
                  </div>

                  {/* Buy Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                    <button 
                      onClick={() => handleBuy(player, 'cash')} 
                      className="btn-outline-green"
                      style={{ padding: '8px', fontSize: '0.78rem', fontWeight: 900, borderRadius: '8px', cursor: 'pointer' }}
                      disabled={loadingId === player.id}
                    >
                      {loadingId === player.id ? 'PROCESANDO...' : '💵 COMPRAR EN CASH'}
                    </button>
                    <button 
                      onClick={() => handleBuy(player, 'solana')} 
                      className="btn-neon-green"
                      style={{ padding: '8px', fontSize: '0.78rem', fontWeight: 900, borderRadius: '8px', cursor: 'pointer', opacity: treasuryAddress ? 1 : 0.4 }}
                      disabled={loadingId === player.id || !treasuryAddress}
                      title={treasuryAddress ? undefined : 'Tesorería no disponible — compra en SOL deshabilitada'}
                    >
                      {loadingId === player.id ? 'PROCESANDO...' : '⚡ COMPRAR CON SOL'}
                    </button>
                    {!treasuryAddress && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-red)', textAlign: 'center' }}>
                        ⚠️ Tesorería no disponible — solo compra en Cash
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
