import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ClassicHub — pantalla de migración mientras el hub clásico se porta a React.
 * El iframe a /classic-dashboard.html fue removido: la ruta no existe en Vercel.
 */
export function ClassicHub() {
  const modules = [
    { to: '/estadio',       icon: '🏟️', label: 'Estadio & Fixtures',  desc: 'Partidos, apuestas on-chain, Cronista IA'   },
    { to: '/defi',          icon: '💱', label: 'DeFi Terminal',        desc: 'Trading, Vibe Bots y Swarm Vaults'          },
    { to: '/club',          icon: '🛡',  label: 'Mi Club & Squad',      desc: 'Manager, plantilla NFT y perfil'            },
    { to: '/staking',       icon: '🔥', label: 'Staking & Burn',       desc: 'Infinity Burn, rendimiento y tokenomía'     },
    { to: '/coleccion',     icon: '🃏', label: 'Colección Genesis',    desc: 'Galería completa de NFTs del Squad'         },
    { to: '/crear-usuario', icon: '✨', label: 'Crear Cuenta',         desc: 'Configura tu perfil de Manager'             },
  ];

  return (
    <div className="play-page play-page--portal portal-fade-in">
      <div className="portal-header glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <div
          className="portal-badge"
          style={{ background: 'rgba(20,241,149,0.15)', color: '#14f195', marginBottom: '1rem' }}
        >
          🔄 HUB EN MIGRACIÓN
        </div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Hub Clásico</h1>
        <p style={{ color: 'var(--text-dim, #64748b)', maxWidth: '520px', margin: '0 auto 0.75rem' }}>
          El panel unificado está siendo portado a React con todas sus funcionalidades mejoradas.
          Mientras tanto, accede directamente a cada módulo activo:
        </p>
        <span className="simulation-badge">RECUPERANDO FEATURES</span>
      </div>

      <div className="launcher-grid" style={{ marginTop: '1.5rem' }}>
        {modules.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="launcher-card glass-card"
            style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
          >
            <div className="launcher-card-header">
              <div className="launcher-card-icon">{m.icon}</div>
            </div>
            <h3>{m.label}</h3>
            <p>{m.desc}</p>
            <div className="launcher-card-footer">
              <span className="launcher-card-btn text-neon-green">Ir al módulo →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
