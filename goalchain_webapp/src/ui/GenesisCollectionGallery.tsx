import React, { useEffect, useMemo, useState } from 'react';
import { LayeredNftCard, PlayerRow } from './LayeredNftCard';


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