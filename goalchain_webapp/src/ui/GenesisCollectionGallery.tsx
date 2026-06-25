import React, { useEffect, useMemo, useState, useRef } from 'react';

type PlayerRow = {
  id: number;
  name: string;
  real_name?: string;
  country: string;
  rarity: string;
  bg_type?: string;
  position?: string;
  stats: { atk: number; def: number; hype: number };
  physical?: { h?: string; w?: string };
  traits?: string[];
};

const BG_IMAGE_MAP: Record<string, string> = {
  'BG-MYT': 'bg_mythic_golden.png',
  'BG-LEG': 'bg_legendary_purple.png',
  'BG-EPI': 'bg_epic_cyber.png',
  'BG-RAR': 'bg_rare_solana.png',
  'BG-COM': 'bg_common_street.png',
};

const BG_VIDEO_MAP: Record<string, string> = {
  'BG-MYT': 'neo_olympus_vertical.mp4',
  'BG-LEG': 'titanium_coliseum.mp4',
  'BG-EPI': 'aether_dome.mp4',
  'BG-RAR': 'obsidian_arena.mp4',
  'BG-COM': 'dome_kronos_vertical.mp4',
};

const FLAG_MAP: Record<string, string> = {
  "Argentina": "🇦🇷",
  "Brasil": "🇧🇷",
  "Francia": "🇫🇷",
  "España": "🇪🇸",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Alemania": "🇩🇪",
  "México": "🇲🇽",
  "Uruguay": "🇺🇾",
  "Egipto": "🇪🇬",
  "Polonia": "🇵🇱",
  "Croacia": "🇭🇷",
  "Corea del Sur": "🇰🇷",
  "Portugal": "🇵🇹",
  "Italia": "🇮🇹",
  "Países Bajos": "🇳🇱",
  "Bélgica": "🇧🇪",
  "EEUU": "🇺🇸"
};

function getCountryFlag(country: string) {
  return FLAG_MAP[country] || "🏳️";
}

function getPlayerImagePath(player: PlayerRow): string {
  const formattedName = player.name.replace(/ /g, '_').replace(/'/g, '_').replace(/\.+$/, '');
  return `https://goalchain.fun/assets/img/nfts/composed/${String(player.id).padStart(3, '0')}_${formattedName}.webp`;
}

const LayeredNftCard: React.FC<{
  player: PlayerRow;
  isFav: boolean;
  onToggleFav: (id: number) => void;
}> = ({ player, isFav, onToggleFav }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const videoRef = useRef<HTMLVideoElement>(null);

  const imgPath = getPlayerImagePath(player);
  
  const yieldMap: Record<string, string> = {
    mythic: "25.4 SOL/mo",
    legendary: "12.1 SOL/mo",
    epic: "5.8 SOL/mo",
    rare: "2.1 SOL/mo",
    common: "0.5 SOL/mo"
  };
  const estimatedYield = yieldMap[player.rarity] || "0.1 SOL/mo";
  
  const priceMap: Record<string, string> = {
    mythic: "10,000 $GCH",
    legendary: "5,000 $GCH",
    epic: "1,000 $GCH",
    rare: "500 $GCH",
    common: "100 $GCH"
  };
  const nftPrice = priceMap[player.rarity] || "100 $GCH";

  useEffect(() => {
    if (!videoRef.current) return;
    if (isHovered && !isFlipped) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, isFlipped]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.favorite-heart') || target.closest('.btn-buy')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`nft-card-3d ${isFlipped ? 'is-flipped' : ''}`}
      data-rarity={player.rarity}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 50, y: 50 });
      }}
      onClick={handleCardClick}
      style={{
        '--x': `${coords.x}%`,
        '--y': `${coords.y}%`
      } as React.CSSProperties}
    >
      <div 
        className="favorite-heart is-fav" 
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav(player.id);
        }}
        style={{
          filter: isFav ? 'grayscale(0) opacity(1)' : 'grayscale(1) opacity(0.5)'
        }}
      >
        ❤️
      </div>
      <div className="glare"></div>
      
      <div className="yield-badge-card">
        <span className="y-icon">💎</span>
        <span className="y-val">{estimatedYield}</span>
      </div>

      <div className="card-inner">
        <div className="card-front">
          <div className="layer layer-bg" style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            <img 
              src={`https://goalchain.fun/assets/img/stadiums/${BG_IMAGE_MAP[player.bg_type || ''] || 'bg_common_street.png'}`} 
              alt="Stadium Background" 
              className="bg-img" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <video 
              ref={videoRef}
              className="bg-video-hover" 
              src={`https://goalchain.fun/assets/video/stadiums/${BG_VIDEO_MAP[player.bg_type || ''] || 'dome_kronos_vertical.mp4'}`} 
              muted 
              playsInline 
              preload="none" 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                opacity: 0, 
                transition: 'opacity 0.4s ease', 
                zIndex: 1, 
                pointerEvents: 'none' 
              }}
            />
          </div>
          <div className="layer layer-base">
            <img 
              src={imgPath} 
              alt={player.name} 
              loading="lazy" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const baseEl = (e.target as HTMLImageElement).parentElement;
                if (baseEl) baseEl.classList.add('no-image');
              }}
            />
            <div className="placeholder-icon">⚽</div>
          </div>
          <div className={`layer layer-frame rarity-${player.rarity}`}></div>
          <div className="layer layer-ui">
            <div className="top-row">
              <span className="player-num">#{String(player.id).padStart(3, '0')}</span>
              <span className="player-flag">{getCountryFlag(player.country)}</span>
            </div>
            <div className="bottom-info">
              <h3 className="player-name-text">{player.name}</h3>
              <div className="player-real-identity">{player.real_name || 'Verified Athlete'}</div>
              <div className="biometric-strip">
                <span>📏 {player.physical?.h || '1.80m'}</span>
                <span>⚖️ {player.physical?.w || '75kg'}</span>
              </div>
              <div className="mini-stats">
                <span>ATK {player.stats.atk}</span>
                <span>DEF {player.stats.def}</span>
                <span>HYP {player.stats.hype}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-back">
          <div className="back-content">
            <div className="back-header">GOALCHAIN MASTER CONTRACT</div>
            <div className="back-body">
              <div className="back-id">COLLECTION ID: GC-{String(player.id).padStart(4, '0')}</div>
              <div className="back-salary">
                <span className="label" style={{ display: 'block', fontSize: '0.65rem', opacity: 0.6, letterSpacing: '1px' }}>ESTIMATED YIELD</span>
                <span className="value" style={{ display: 'block', fontSize: '1.4rem', fontWeight: 900, color: '#14f195' }}>{estimatedYield}</span>
              </div>
              <div className="clauses-list">
                <div className="clause-item">✓ Real Salary Linked Yield</div>
                <div className="clause-item">✓ Stadium Attendance Multiplier</div>
                <div className="clause-item">✓ Transfer Fee Revenue Sharing</div>
              </div>
              <div className="back-mint">
                <code>SOL_PENDING...</code>
              </div>
              <button 
                className="btn-buy"
                onClick={() => {
                  alert(`Minteo de ${player.name} simulado.`);
                }}
              >
                COMPRAR: {nftPrice}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GenesisCollectionGallery: React.FC = () => {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('gch_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [rarity, setRarity] = useState<string>('all');
  const [showOnlyFavs, setShowOnlyFavs] = useState<boolean>(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const pRes = await fetch('/assets/data/players.json');
      if (pRes.ok) setPlayers(await pRes.json());
    })();
  }, []);

  const toggleFav = (id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('gch_favorites', JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = [...players];
    if (rarity !== 'all') list = list.filter((p) => p.rarity === rarity);
    if (showOnlyFavs) list = list.filter((p) => favorites.includes(p.id));
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.real_name || '').toLowerCase().includes(s) ||
          p.country.toLowerCase().includes(s),
      );
    }
    return list.sort((a, b) => a.id - b.id);
  }, [players, rarity, showOnlyFavs, favorites, q]);

  return (
    <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Galería Genesis Squad — capas: fondo de rareza vertical, jugador transparente, marco y atributos on-chain.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar jugador o país…"
          style={{
            flex: '1 1 250px',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#fff',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          style={{ 
            padding: '10px 14px', 
            borderRadius: 8, 
            background: '#0f172a', 
            color: '#fff', 
            border: '1px solid #334155',
            outline: 'none',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">Todas las rarezas</option>
          <option value="mythic">Mítico</option>
          <option value="legendary">Legendario</option>
          <option value="epic">Épico</option>
          <option value="rare">Raro</option>
          <option value="common">Común</option>
        </select>
        <button
          onClick={() => setShowOnlyFavs(!showOnlyFavs)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            background: showOnlyFavs ? '#14f195' : '#0f172a',
            color: showOnlyFavs ? '#000' : '#fff',
            border: showOnlyFavs ? '1px solid #14f195' : '1px solid #334155',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          ❤️ {showOnlyFavs ? 'Todos' : 'Favoritos'}
        </button>
        <span style={{ alignSelf: 'center', color: '#14f195', fontWeight: 700, marginLeft: 'auto' }}>
          {filtered.length} / 528
        </span>
      </div>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '40px 20px',
          justifyContent: 'center',
          padding: '20px 0'
        }}
      >
        {filtered.map((p) => (
          <LayeredNftCard 
            key={p.id} 
            player={p} 
            isFav={favorites.includes(p.id)} 
            onToggleFav={toggleFav} 
          />
        ))}
      </div>
    </div>
  );
};