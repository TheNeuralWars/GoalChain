import React, { useEffect, useMemo, useState } from 'react';

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

type ManifestPlayer = {
  id: number;
  urls?: { grok_jpg?: string; player_cutout?: string; composed_card?: string };
};

const BG_IMG: Record<string, string> = {
  'BG-MYT': '/assets/img/stadiums/bg_mythic_golden.png',
  'BG-LEG': '/assets/img/stadiums/bg_legendary_purple.png',
  'BG-EPI': '/assets/img/stadiums/bg_epic_cyber.png',
  'BG-RAR': '/assets/img/stadiums/bg_rare_solana.png',
  'BG-COM': '/assets/img/stadiums/bg_common_street.png',
};

const RARITY_BORDER: Record<string, string> = {
  mythic: '#ffcc00',
  legendary: '#14f195',
  epic: '#9945ff',
  rare: '#00c8ff',
  common: '#c8c8c8',
};

function playerArtUrl(player: PlayerRow, manifest: Map<number, ManifestPlayer>): string {
  const m = manifest.get(player.id);
  if (m?.urls?.player_cutout) return m.urls.player_cutout;
  if (m?.urls?.grok_jpg) return m.urls.grok_jpg;
  const safe = player.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_-]/g, '');
  return `https://api.goalchain.fun/pilot/v71_grok/${String(player.id).padStart(3, '0')}_${safe}.jpg`;
}

const LayeredNftCard: React.FC<{ player: PlayerRow; manifest: Map<number, ManifestPlayer> }> = ({
  player,
  manifest,
}) => {
  const border = RARITY_BORDER[player.rarity] || '#fff';
  const bg = BG_IMG[player.bg_type || 'BG-RAR'] || BG_IMG['BG-RAR'];
  const art = playerArtUrl(player, manifest);
  const composed = manifest.get(player.id)?.urls?.composed_card;

  return (
    <article
      className="genesis-nft-card"
      style={{
        position: 'relative',
        aspectRatio: '2/3',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `0 12px 40px rgba(0,0,0,0.45), 0 0 0 2px ${border}55`,
        background: '#06060a',
      }}
    >
      {/* Layer 0: fondo rareza */}
      <img
        src={bg}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Layer 1: jugador (cutout o grok) */}
      <img
        src={art}
        alt={player.name}
        loading="lazy"
        style={{
          position: 'absolute',
          inset: '8% 5% 22% 5%',
          width: '90%',
          height: '70%',
          objectFit: 'contain',
          zIndex: 2,
          filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.55))',
        }}
      />
      {/* Layer 2: marco */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `3px solid ${border}`,
          borderRadius: 16,
          boxShadow: `inset 0 0 24px ${border}33`,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />
      {/* Layer 3: atributos */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '10px 12px',
          background: 'linear-gradient(transparent, rgba(6,8,14,0.92))',
          zIndex: 4,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 900, color: '#fff', fontSize: '0.75rem' }}>#{String(player.id).padStart(3, '0')}</span>
          <span
            style={{
              fontSize: '0.55rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#000',
              background: border,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {player.rarity}
          </span>
        </div>
        <h3 style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#fff', fontWeight: 900 }}>{player.name}</h3>
        <p style={{ margin: 0, fontSize: '0.6rem', color: border, fontWeight: 700 }}>{player.real_name}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: '0.65rem', color: '#cbd5e1' }}>
          <span>ATK {player.stats.atk}</span>
          <span>DEF {player.stats.def}</span>
          <span>HYP {player.stats.hype}</span>
        </div>
      </div>
      {composed && (
        <a
          href={composed}
          target="_blank"
          rel="noreferrer"
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 5, fontSize: '0.55rem', color: '#14f195' }}
        >
          HD
        </a>
      )}
    </article>
  );
};

export const GenesisCollectionGallery: React.FC = () => {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [manifest, setManifest] = useState<Map<number, ManifestPlayer>>(new Map());
  const [rarity, setRarity] = useState<string>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const [pRes, mRes] = await Promise.all([
        fetch('/assets/data/players.json'),
        fetch('/assets/data/nft_gallery_manifest.json'),
      ]);
      if (pRes.ok) setPlayers(await pRes.json());
      if (mRes.ok) {
        const data = await mRes.json();
        const map = new Map<number, ManifestPlayer>();
        for (const row of data.players || []) map.set(row.id, row);
        setManifest(map);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...players];
    if (rarity !== 'all') list = list.filter((p) => p.rarity === rarity);
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
  }, [players, rarity, q]);

  return (
    <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Galería Genesis Squad — capas: fondo de rareza, jugador V7.1, marco y atributos on-chain.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar jugador o país…"
          style={{
            flex: '1 1 200px',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#fff',
          }}
        />
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
        >
          <option value="all">Todas las rarezas</option>
          <option value="mythic">Mítico</option>
          <option value="legendary">Legendario</option>
          <option value="epic">Épico</option>
          <option value="rare">Raro</option>
        </select>
        <span style={{ alignSelf: 'center', color: '#14f195', fontWeight: 700 }}>{filtered.length} / 528</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((p) => (
          <LayeredNftCard key={p.id} player={p} manifest={manifest} />
        ))}
      </div>
    </div>
  );
};