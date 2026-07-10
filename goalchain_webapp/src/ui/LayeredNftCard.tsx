import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from '../i18n/index';

export interface PlayerRow {
  id: number;
  name: string;
  real_name?: string;
  country: string;
  rarity: string;
  bg_type?: string;
  position?: string;
  stats: { atk: number; def: number; hype: number };
  physical?: { h?: string; w?: string; dob?: string; t?: string };
  traits?: string[];
  meta?: { parody_club?: string; visual_effect?: string; narrative?: string };
  match_salary_gch?: number;
  market_value_eur?: number;
  jersey_number?: number;
  price?: string;
  seller?: string;
}

export interface LayeredNftCardProps {
  player: PlayerRow;
  isFav?: boolean;
  onToggleFav?: (id: number) => void;
  isMarketplace?: boolean;
  onBuyCash?: () => void;
  onBuySol?: () => void;
  onAnalyze?: () => void;
  isSolOffline?: boolean;
}

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

export const LayeredNftCard: React.FC<LayeredNftCardProps> = ({
  player,
  isFav = false,
  onToggleFav,
  isMarketplace = false,
  onBuyCash,
  onBuySol,
  onAnalyze,
  isSolOffline = false,
}) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const videoRefFront = useRef<HTMLVideoElement>(null);
  const videoRefBack = useRef<HTMLVideoElement>(null);

  const imgPath = getPlayerImagePath(player);

  const yieldMap: Record<string, string> = {
    mythic: "25.4 SOL/mo",
    legendary: "12.1 SOL/mo",
    epic: "5.8 SOL/mo",
    rare: "2.1 SOL/mo",
    common: "0.5 SOL/mo"
  };
  const estimatedYield = yieldMap[player.rarity.toLowerCase()] || "0.1 SOL/mo";

  const priceMap: Record<string, string> = {
    mythic: "10,000 $GCH",
    legendary: "5,000 $GCH",
    epic: "1,000 $GCH",
    rare: "500 $GCH",
    common: "100 $GCH"
  };
  const nftPriceGch = priceMap[player.rarity.toLowerCase()] || "100 $GCH";

  // Manage video playing on hover
  useEffect(() => {
    const playOrPause = (video: HTMLVideoElement | null) => {
      if (!video) return;
      if (isHovered && !isFlipped) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    };

    if (isFlipped) {
      if (videoRefFront.current) {
        videoRefFront.current.pause();
        videoRefFront.current.currentTime = 0;
      }
      if (videoRefBack.current) {
        if (isHovered) {
          videoRefBack.current.play().catch(() => {});
        } else {
          videoRefBack.current.pause();
          videoRefBack.current.currentTime = 0;
        }
      }
    } else {
      if (videoRefBack.current) {
        videoRefBack.current.pause();
        videoRefBack.current.currentTime = 0;
      }
      if (videoRefFront.current) {
        if (isHovered) {
          videoRefFront.current.play().catch(() => {});
        } else {
          videoRefFront.current.pause();
          videoRefFront.current.currentTime = 0;
        }
      }
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
    if (target.closest('.favorite-heart') || target.closest('.btn-buy') || target.closest('.btn-buy-sol') || target.closest('.btn-analyze')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  // Resolve backgrounds
  const stadiumBgImg = `https://goalchain.fun/assets/img/stadiums/${BG_IMAGE_MAP[player.bg_type || ''] || 'bg_common_street.png'}`;
  const stadiumBgVideo = `https://goalchain.fun/assets/video/stadiums/${BG_VIDEO_MAP[player.bg_type || ''] || 'dome_kronos_vertical.mp4'}`;

  return (
    <div 
      className={`nft-card-3d ${isFlipped ? 'is-flipped' : ''}`}
      data-rarity={player.rarity.toLowerCase()}
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
      {/* Favorite Heart (Genesis Gallery specific) */}
      {onToggleFav && (
        <div 
          className="favorite-heart is-fav" 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(player.id);
          }}
          style={{
            filter: isFav ? 'grayscale(0) opacity(1)' : 'grayscale(1) opacity(0.5)',
            zIndex: 30
          }}
        >
          ❤️
        </div>
      )}

      {/* Yield Badge Overlay */}
      <div className="yield-badge-card" style={{ zIndex: 25 }}>
        <span className="y-icon">💎</span>
        <span className="y-val">{estimatedYield}</span>
      </div>

      <div className="glare"></div>

      <div className="card-inner">
        
        {/* CARD FRONT */}
        <div className="card-front">
          <div className="layer layer-bg" style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            <img 
              src={stadiumBgImg} 
              alt="Stadium Background" 
              className="bg-img" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <video 
              ref={videoRefFront}
              className="bg-video-hover" 
              src={stadiumBgVideo} 
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
          
          <div className={`layer layer-frame rarity-${player.rarity.toLowerCase()}`}></div>
          
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

        {/* CARD BACK */}
        <div className="card-back" style={{ padding: 0, position: 'relative' }}>
          
          {/* Stadium Background */}
          <div className="layer layer-bg" style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '18px' }}>
            <img 
              src={stadiumBgImg} 
              alt="Stadium Background Back" 
              className="bg-img" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) contrast(1.1)' }}
            />
            <video 
              ref={videoRefBack}
              className="bg-video-hover" 
              src={stadiumBgVideo} 
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
                pointerEvents: 'none',
                filter: 'brightness(0.35) contrast(1.1)'
              }}
            />
          </div>

          {/* Premium Glassmorphic dark overlay */}
          <div className="back-glass-overlay" style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 7, 12, 0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 2,
            borderRadius: '18px'
          }}></div>

          {/* Back Content */}
          <div className="back-content" style={{ 
            position: 'relative', 
            zIndex: 3, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            padding: '16px',
            boxSizing: 'border-box'
          }}>
            
            {/* Header & Bio Info */}
            <div>
              <div className="back-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid rgba(20, 241, 149, 0.25)', 
                paddingBottom: '4px', 
                marginBottom: '10px' 
              }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#14f195' }}>
                  Master Contract GC
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  ID-{String(player.id).padStart(3, '0')}
                </span>
              </div>

              {/* Bio Attributes Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', fontSize: '0.72rem', marginBottom: '10px' }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre Real</span>
                  <strong style={{ color: '#ffffff' }}>{player.real_name || 'Verified Athlete'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Club Parodia</span>
                  <strong style={{ color: '#14f195' }}>{player.meta?.parody_club || 'Agente Libre'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dorsal &amp; Posición</span>
                  <strong style={{ color: '#ffffff' }}>#{player.jersey_number || player.id} · {player.position || 'MID'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valor Est.</span>
                  <strong style={{ color: '#ffd700' }}>
                    {player.market_value_eur ? `€${(player.market_value_eur / 1_000_000).toFixed(1)}M` : '€1.5M'}
                  </strong>
                </div>
              </div>

              {/* Traits & Visual Effect */}
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Visual FX &amp; Rasgos
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {player.meta?.visual_effect && (
                    <span style={{ 
                      background: 'rgba(153, 69, 255, 0.25)', 
                      border: '1px solid rgba(153, 69, 255, 0.45)', 
                      color: '#d3b0ff', 
                      fontSize: '0.58rem', 
                      padding: '1px 6px', 
                      borderRadius: '4px', 
                      fontWeight: 700 
                    }}>
                      ✨ {player.meta.visual_effect}
                    </span>
                  )}
                  {player.traits && player.traits.length > 0 ? (
                    player.traits.map((t, idx) => (
                      <span key={idx} style={{ 
                        background: 'rgba(20, 241, 149, 0.15)', 
                        border: '1px solid rgba(20, 241, 149, 0.3)', 
                        color: '#a3ffd6', 
                        fontSize: '0.58rem', 
                        padding: '1px 6px', 
                        borderRadius: '4px', 
                        fontWeight: 700 
                      }}>
                        ⚡ {t}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.58rem', fontStyle: 'italic' }}>Sin rasgos especiales</span>
                  )}
                </div>
              </div>
            </div>

            {/* Gossip & Narrative Box */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.05)', 
              borderRadius: '8px', 
              padding: '8px 10px', 
              margin: '2px 0',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{ 
                color: '#14f195', 
                display: 'block', 
                fontSize: '0.58rem', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                marginBottom: '4px' 
              }}>
                📖 LORE &amp; CHISMES (GOSSIPS)
              </span>
              <p style={{ 
                margin: 0, 
                fontSize: '0.65rem', 
                color: '#cbd5e1', 
                lineHeight: '1.35', 
                fontStyle: 'italic',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
                {player.meta?.narrative || `Fichado en el draft digital de GoalChain. Se rumorea que prefiere entrenar en simuladores Web3 que pisar el césped real.`}
              </p>
            </div>

            {/* Yield Details & Actions */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '8px',
                marginBottom: '8px' 
              }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.55rem', textTransform: 'uppercase' }}>Ficha / Partido</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.72rem' }}>
                    💰 {player.match_salary_gch || 100} $GCH
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.55rem', textTransform: 'uppercase' }}>Rendimiento Est.</span>
                  <strong style={{ color: '#14f195', fontSize: '0.72rem' }}>
                    💎 {estimatedYield}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              {isMarketplace ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button 
                    className="btn-buy"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onBuyCash) onBuyCash();
                    }}
                    style={{ padding: '8px 0', fontSize: '0.7rem' }}
                  >
                    💵 {t('marketplace_buy_cash')}: {player.price || nftPriceGch}
                  </button>
                  <button 
                    className="btn-buy btn-buy-sol"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onBuySol) onBuySol();
                    }}
                    style={{ 
                      padding: '8px 0', 
                      fontSize: '0.7rem', 
                      background: 'var(--secondary)', 
                      boxShadow: '0 4px 15px rgba(153, 69, 255, 0.3)', 
                      opacity: isSolOffline ? 0.4 : 1 
                    }}
                    disabled={isSolOffline}
                    title={isSolOffline ? t('marketplace_treasury_offline') : undefined}
                  >
                    ⚡ {t('marketplace_buy_sol')}: {player.price || '0.5 SOL'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {onAnalyze && (
                    <button 
                      className="btn-buy btn-analyze"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalyze();
                      }}
                      style={{ 
                        flex: 1, 
                        background: 'rgba(20, 241, 149, 0.1)', 
                        border: '1px solid #14f195', 
                        color: '#14f195',
                        fontSize: '0.68rem', 
                        padding: '6px 0', 
                        fontWeight: 900
                      }}
                    >
                      {t('marketplace_analyze')} 📊
                    </button>
                  )}
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: 'rgba(20, 241, 149, 0.08)', 
                    borderRadius: '8px', 
                    fontSize: '0.58rem', 
                    fontWeight: 700,
                    color: '#14f195',
                    border: '1px dashed rgba(20, 241, 149, 0.3)',
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }}>
                    🟢 En Roster
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
