import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EconomyConfigBanner } from './EconomyConfigBanner';
import { OpsStatusPanel } from './OpsStatusPanel';
import { SimulationBadge } from '../components/SimulationBadge';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';


export function DashboardGrid() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [showOpsConsole, setShowOpsConsole] = useState(false);

  return (
    <div className="inicio-portal">
      <EconomyConfigBanner />
      {/* Welcome Hero Banner */}
      <div className="welcome-hero glass-card portal-fade-in">
        <div className="welcome-hero-content">
          <div className="welcome-hero-badge">🏆 SPORTSFI PROTOCOL V2.0</div>
          <h1>
            {user ? (
              <>
                {t('dashboard.welcome', { avatar: user.avatar, username: user.username })}
              </>
            ) : (
              t('dashboard.welcome_default')
            )}
          </h1>
          <p className="welcome-hero-sub">
            {t('dashboard.description')}
          </p>
          {!user && (
            <Link to="/club" className="btn-neon-green welcome-hero-btn">
              {t('dashboard.setup')}
            </Link>
          )}
        </div>
        <div className="welcome-hero-stats">
          <div className="hero-stat-box">
            <span className="hero-stat-val">1240</span>
            <span className="hero-stat-label">{t('dashboard.players')}</span>
          </div>
          <div className="hero-stat-box">
            <span className="hero-stat-val">1240</span>
            <span className="hero-stat-label">{t('dashboard.clubs')}</span>
          </div>
          <div className="hero-stat-box">
            <span className="hero-stat-val">1240</span>
            <span className="hero-stat-label">{t('dashboard.matches')}</span>
          </div>
        </div>
      </div>

      {/* Ops Console Toggle */}
      <div className="ops-console-toggle">
        <button
          onClick={() => setShowOpsConsole(!showOpsConsole)}
          className="btn-neon-purple"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {showOpsConsole ? t('dashboard.hide_console') : t('dashboard.show_console')}
          <SimulationBadge />
        </button>
      </div>

      {showOpsConsole && (
        <OpsStatusPanel />
      )}

      {/* Quick Access Grid */}
      <div className="quick-access-grid">
        <div className="quick-access-card glass-card" onClick={() => navigate('/club')}>
          <div className="quick-access-icon">🏟️</div>
          <h3>{t('dashboard.club')}</h3>
          <p>{t('dashboard.club_description')}</p>
        </div>
        <div className="quick-access-card glass-card" onClick={() => navigate('/estadio')}>
          <div className="quick-access-icon">⚽</div>
          <h3>{t('dashboard.stadium')}</h3>
          <p>{t('dashboard.stadium_description')}</p>
        </div>
        <div className="quick-access-card glass-card" onClick={() => navigate('/defi')}>
          <div className="quick-access-icon">💰</div>
          <h3>{t('dashboard.defi')}</h3>
          <p>{t('dashboard.defi_description')}</p>
        </div>
        <div className="quick-access-card glass-card" onClick={() => navigate('/staking')}>
          <div className="quick-access-icon">🔄</div>
          <h3>{t('dashboard.staking')}</h3>
          <p>{t('dashboard.staking_description')}</p>
        </div>
      </div>
    </div>
  );
}