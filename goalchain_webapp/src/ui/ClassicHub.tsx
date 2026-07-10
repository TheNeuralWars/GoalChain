import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * ClassicHub — pantalla de migración mientras el hub clásico se porta a React.
 * El iframe a /classic-dashboard.html fue removido: la ruta no existe en Vercel.
 */

export function ClassicHub() {
  const { t } = useTranslation();
  const modules = [
    { to: '/estadio',       icon: '🏟️', label: t('classic_hub.modules.estadio.label'),  desc: t('classic_hub.modules.estadio.desc') },
    { to: '/defi',          icon: '💱', label: t('classic_hub.modules.defi.label'),        desc: t('classic_hub.modules.defi.desc') },
    { to: '/club',          icon: '🛡',  label: t('classic_hub.modules.club.label'),      desc: t('classic_hub.modules.club.desc') },
    { to: '/staking',       icon: '🔥', label: t('classic_hub.modules.staking.label'),       desc: t('classic_hub.modules.staking.desc') },
    { to: '/coleccion',     icon: '🃏', label: t('classic_hub.modules.coleccion.label'),    desc: t('classic_hub.modules.coleccion.desc') },
    { to: '/crear-usuario', icon: '✨', label: t('classic_hub.modules.crear_usuario.label'),         desc: t('classic_hub.modules.crear_usuario.desc') },
  ];

  return (
    <div className="play-page play-page--portal portal-fade-in">
      <div className="portal-header glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <div
          className="portal-badge"
          style={{ background: 'rgba(20,241,149,0.15)', color: '#14f195', marginBottom: '1rem' }}
        >
          {t('classic_hub.migration_badge')}
        </div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{t('classic_hub.title')}</h1>
        <p style={{ color: 'var(--text-dim, #64748b)', maxWidth: '520px', margin: '0 auto 0.75rem' }}>
          {t('classic_hub.description')}
        </p>
        <span className="simulation-badge">{t('classic_hub.recovering_features')}</span>
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
              <span className="launcher-card-btn text-neon-green">{t('classic_hub.go_to_module')} →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}