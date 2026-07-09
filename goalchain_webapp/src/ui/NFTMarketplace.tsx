import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as solanaWeb3 from '@solana/web3.js';
import { SimulationBadge } from '../components/SimulationBadge';
import { LayeredNftCard, PlayerRow } from './LayeredNftCard';
import { explorerTxUrl } from '../lib/explorerLinks';

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

export function NFTMarketplace() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [listings, setListings] = useState<PlayerRow[]>([]);
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
        const treasury = data?.onchainConfig?.treasuryTokenAccount;
        // Use on-chain treasury when the validator is live.
        // When on-chain config is missing (no local validator), leave
        // treasury as null so the SOL button is disabled — never send
        // to the hardcoded program ID fallback.
        setTreasuryAddress(treasury || null);
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
          const players = await response.json() as PlayerRow[];
          
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

  const handleBuy = async (player: PlayerRow, mode: 'cash' | 'solana') => {
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
      const priceStr = player.price ? player.price.split(' ')[0] : '1.0';
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
      window.open(explorerTxUrl(signature, connection.rpcEndpoint), '_blank');

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
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '40px 20px', 
          justifyContent: 'center',
          padding: '20px 0' 
        }}>
          {filteredListings.map(player => (
            <LayeredNftCard 
              key={player.id} 
              player={player}
              isMarketplace={true}
              onBuyCash={() => handleBuy(player, 'cash')}
              onBuySol={() => handleBuy(player, 'solana')}
              isSolOffline={!treasuryAddress}
            />
          ))}
        </div>
      )}
    </div>
  );
}
