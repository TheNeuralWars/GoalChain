import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n';
import { SimulationBadge } from '../components/SimulationBadge';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as solanaWeb3 from '@solana/web3.js';

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

const FILTERS = ['all', 'mythic', 'legendary', 'epic', 'rare', 'common'] as const;

export function TransferMarketCarousel() {
  const { t } = useTranslation();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [listings, setListings] = useState<PlayerNFT[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [treasuryAddress, setTreasuryAddress] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid' | 'my-listings'>('carousel');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const FILTERS = ['all', 'mythic', 'legendary', 'epic', 'rare', 'common'] as const;

  useEffect(() => {
    const fetchTreasury = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${apiBase}/api/economy/config`);
        if (!res.ok) return;
        const data = await res.json();
        const treasury = data?.onchainConfig?.treasuryTokenAccount;
        setTreasuryAddress(treasury || null);
      } catch {
        setTreasuryAddress(null);
      }
    };
    fetchTreasury();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setViewMode(window.innerWidth < 768 ? 'carousel' : 'grid');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const newPosition = direction === 'left'
        ? carouselRef.current.scrollLeft - 320
        : carouselRef.current.scrollLeft + 320;
      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      setScrollPosition(carouselRef.current.scrollLeft);
    }
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/assets/data/players.json');
        if (response.ok) {
          const players = await response.json() as PlayerNFT[];
          const shuffled = [...players].sort(() => 0.5 - Math.random());
          const initialListings = shuffled.slice(0, 8).map(player => ({
            ...player,
            price: RARITY_PRICES[player.rarity.toLowerCase()] || '1.0 SOL',
            seller: 'GoAL' + Math.random().toString(16).slice(2, 8) + '...' + Math.random().toString(16).slice(2, 6)
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
      alert('Please connect your Solana wallet to buy players.');
      setLoadingId(null);
      return;
    }

    if (mode === 'cash') {
      setTimeout(() => {
        const inventory = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
        inventory.push(player);
        localStorage.setItem('goalchain_inventory', JSON.stringify(inventory));
        setListings(prev => prev.filter(p => p.id !== player.id));
        setLoadingId(null);
        alert('SUCCESS! You acquired ' + player.name + ' via Cash purchase. Check your Collection tab.');
        window.dispatchEvent(new Event('storage'));
      }, 1500);
      return;
    }

    if (!publicKey) {
      alert('Please connect Phantom or compatible wallet via adapter to pay with SOL.');
      setLoadingId(null);
      return;
    }

    try {
      if (!treasuryAddress) {
        alert('Treasury unavailable. SOL purchase disabled.');
        setLoadingId(null);
        return;
      }
      const destination = new solanaWeb3.PublicKey(treasuryAddress);
      const priceStr = player.price.split(' ')[0];
      const priceSol = parseFloat(priceStr) || 0.1;
      const lamports = Math.floor(priceSol * 1_000_000);

      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: destination,
          lamports: lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      console.log('Solana Tx Sent:', signature);

      alert('Confirming transaction on Devnet...');
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Solana Tx Confirmed!');

      const inventory = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
      inventory.push(player);
      localStorage.setItem('goalchain_inventory', JSON.stringify(inventory));

      setListings(prev => prev.filter(p => p.id !== player.id));
      setLoadingId(null);

      alert('PURCHASE CONFIRMED ON SOLANA DEVNET! You acquired ' + player.name + '. Tx: ' + signature.slice(0, 10) + '...');
      window.dispatchEvent(new Event('storage'));
      window.open('https://explorer.solana.com/tx/' + signature + '?cluster=devnet', '_blank');

    } catch (err) {
      console.error('Solana transaction error:', err);
      alert('Transaction failed or was cancelled.');
      setLoadingId(null);
    }
  };

  const filteredListings = activeFilter === 'all'
    ? listings
    : listings.filter(p => p.rarity.toLowerCase() === activeFilter);

  const canScrollLeft = carouselRef.current && carouselRef.current.scrollLeft > 0;
  const canScrollRight = carouselRef.current &&
    carouselRef.current.scrollLeft < carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10;

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const newPosition = direction === 'left'
        ? carouselRef.current.scrollLeft - 320
        : carouselRef.current.scrollLeft + 320;
      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      setScrollPosition(carouselRef.current.scrollLeft);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 className="text-neon-purple" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 Transfer Market
            <SimulationBadge />
            {treasuryAddress === null && (
              <span style={{ fontSize: '0.6rem', color: 'var(--accent-red)', fontWeight: 600 }}>
                ⛔ SOL OFFLINE
              </span>
            )}
          </h2>
          <p style={{ opacity: 0.7, fontSize: '0.8rem', marginTop: '4px' }}>
            Buy and sell Genesis Squad players. Build your ultimate team for World Cup 2026.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setViewMode('carousel')}
            disabled={viewMode === 'carousel'}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: viewMode === 'carousel' ? 'var(--primary-neon)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'carousel' ? '#000' : '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            📱 Carousel
          </button>
          <button
            onClick={() => setViewMode('grid')}
            disabled={viewMode === 'grid'}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: viewMode === 'grid' ? 'var(--primary-neon)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'grid' ? '#000' : '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            🖥️ Grid
          </button>
          <button
            onClick={() => setViewMode('my-listings')}
            disabled={viewMode === 'my-listings'}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: viewMode === 'my-listings' ? 'var(--secondary-neon)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'my-listings' ? '#000' : '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            📋 My Listings
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {FILTERS.map(filter => (
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
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {viewMode === 'carousel' && filteredListings.length > 0 && (
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            style={{
              display: 'flex',
              gap: '1.25rem',
              overflowX: 'auto',
              paddingBottom: '1rem',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
          >
            <style>{`
              .carousel-wrap::-webkit-scrollbar { display: none; }
            `}</style>
            {filteredListings.map(player => (
              <TransferCard
                key={player.id}
                player={player}
                loadingId={loadingId}
                onBuy={handleBuy}
                treasuryAddress={treasuryAddress}
                publicKey={publicKey}
                connection={connection}
                sendTransaction={sendTransaction}
              />
            ))}
          </div>
        )}

        {viewMode === 'grid' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No listings under this category.</p>
                <button onClick={() => setActiveFilter('all')} className="btn-neon-green" style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  View All Market
                </button>
              </div>
            ) : (
              filteredListings.map(player => (
                <TransferCard
                  key={player.id}
                  player={player}
                  loadingId={loadingId}
                  onBuy={handleBuy}
                  treasuryAddress={treasuryAddress}
                  publicKey={publicKey}
                  connection={connection}
                  sendTransaction={sendTransaction}
                />
              )}
            )}
          </div>
        )}

        {viewMode === 'carousel' && filteredListings.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={() => scrollCarousel('left')}
              disabled={!canScrollLeft}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: '#fff',
                cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                opacity: canScrollLeft ? 1 : 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              ←
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              <span>Swipe or use arrows to browse</span>
            </div>
            <button
              onClick={() => scrollCarousel('right')}
              disabled={!canScrollRight}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: '#fff',
                cursor: canScrollRight ? 'pointer' : 'not-allowed',
                opacity: canScrollRight ? 1 : 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              →
            </button>
          </div>
        )}

        {viewMode === 'my-listings' && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              My Listings feature coming soon! Connect your wallet to list players.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TransferCard({
  player,
  loadingId,
  onBuy,
  treasuryAddress,
  publicKey,
  connection,
  sendTransaction,
}: {
  player: PlayerNFT;
  loadingId: number | null;
  onBuy: (player: PlayerNFT, mode: 'cash' | 'solana') => void;
  treasuryAddress: string | null;
  publicKey: any;
  connection: any;
  sendTransaction: any;
}) {
  const rarityCol = RARITY_COLORS[player.rarity.toLowerCase()] || '#fff';

  return (
    <div
      style={{
        flex: '0 0 280px',
        minWidth: '280px',
        scrollSnapAlign: 'start',
        background: 'rgba(10, 10, 20, 0.4)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        height: '140px',
        background: 'linear-gradient(135deg, rgba(13,13,21,0.9), rgba(153,69,255,0.15))',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.15))' }}>⚽</div>

        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.85)', padding: '4px 10px', borderRadius: '20px', fontWeight: 900, color: 'var(--primary-neon)', border: '1px solid var(--primary-neon)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
          {player.price}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            <span>Seller: {player.seller}</span>
            <span style={{ fontWeight: 'bold', color: rarityCol }}>{player.rarity}</span>
          </div>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800 }}>{player.name}</h4>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Club: {player.current_club || 'Free Agent'} · Val: {(player.market_value_eur || 1000000).toLocaleString()} EUR</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.7rem', fontFamily: 'monospace' }}>
          <span style={{ color: 'var(--accent-red)' }}>ATK: {player.stats?.atk || 50}</span>
          <span style={{ color: 'var(--primary-neon)' }}>DEF: {player.stats?.def || 50}</span>
          <span style={{ color: '#ffcc00' }}>HYPE: {player.stats?.hype || 50}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          <button
            onClick={() => onBuy(player, 'cash')}
            className="btn-outline-green"
            style={{ padding: '8px', fontSize: '0.78rem', fontWeight: 900, borderRadius: '8px', cursor: 'pointer' }}
          >
            💵 BUY CASH
          </button>
          <button
            onClick={() => onBuy(player, 'solana')}
            className="btn-neon-green"
            style={{
              padding: '8px',
              fontSize: '0.78rem',
              fontWeight: 900,
              borderRadius: '8px',
              cursor: 'pointer',
              opacity: treasuryAddress ? 1 : 0.4,
            }}
            disabled={loadingId === player.id || !treasuryAddress}
          >
            {loadingId === player.id ? 'PROCESSING...' : '⚡ BUY SOL'}
          </button>
          {!treasuryAddress && (
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-red)', textAlign: 'center' }}>
              Treasury unavailable - cash only
            </span>
          )}
        </div>
      </div>
    </div>
  );
}