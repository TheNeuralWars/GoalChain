import React, { useState, useEffect } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';
import { SquadGallery } from './SquadGallery';
import { UserProfile } from './UserProfile';
import { CreateUser } from './CreateUser';
import { NFTMarketplace } from './NFTMarketplace';
import { AICoach } from './AICoach';

export function ClubPortal() {
  const [activeSubTab, setActiveSubTab] = useState<'squad' | 'market' | 'coach' | 'profile'>('squad');
  const [hasAccount, setHasAccount] = useState(false);
  const [username, setUsername] = useState('demo_user');

  const checkAccount = () => {
    const raw = localStorage.getItem('goalchain_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user.username) {
          setHasAccount(true);
          setUsername(user.username);
          return;
        }
      } catch {
        /* ignore */
      }
    }
    setHasAccount(false);
  };

  useEffect(() => {
    checkAccount();
    // Escuchar cambios de cuenta (por ejemplo si se crea una en la pestaña)
    window.addEventListener('storage', checkAccount);
    return () => window.removeEventListener('storage', checkAccount);
  }, []);

  const tabs = [
    { id: 'squad', label: '👕 Mi Plantilla (NFTs)', desc: 'Colección de jugadores y estamina' },
    { id: 'market', label: '🛒 Mercado Fichajes', desc: 'Compra cartas en SOL o en Cash' },
    { id: 'coach', label: '🤖 Asistente IA (Eliza)', desc: 'Asesoría táctica e inteligencia' },
    { id: 'profile', label: '👤 Perfil de Manager', desc: 'Tu reputación e identidad' },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge portal-badge--club">CLUB PORTAL</div>
        <SimulationBadge />
        <h1>Mi Club &amp; Manager</h1>
        <p className="portal-honesty-note">
          Plantilla demo — NFTs on-chain y rent se activan post-Mundial.
        </p>
        <p className="portal-subtitle">
          Gestiona tu plantilla de jugadores digitales, mejora sus estadísticas y monitorea tu reputación de manager.
        </p>

        {/* Glassmorphic Tabs Navigation */}
        <div className="portal-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`portal-tab-btn portal-tab-btn--club ${activeSubTab === tab.id ? 'portal-tab-btn--active' : ''}`}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-desc">{tab.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="portal-content-wrapper">
        {activeSubTab === 'squad' && (
          <div className="portal-fade-in">
            <SquadGallery />
          </div>
        )}
        {activeSubTab === 'market' && (
          <div className="portal-fade-in">
            <NFTMarketplace />
          </div>
        )}
        {activeSubTab === 'coach' && (
          <div className="portal-fade-in">
            <AICoach />
          </div>
        )}
        {activeSubTab === 'profile' && (
          <div className="portal-fade-in">
            {hasAccount ? (
              <UserProfile username={username} />
            ) : (
              <div className="registration-wrapper glass-card">
                <div className="registration-promo">
                  <h2>🚀 Únete a la Copa GoalChain 2026</h2>
                  <p>
                    Aún no has creado tu identidad de Manager. Configura tu avatar y apodo para empezar a
                    recibir recompensas, coleccionar jugadores estrella y competir por la gloria global.
                  </p>
                </div>
                <CreateUser onUserCreated={() => {
                  checkAccount();
                  setActiveSubTab('profile');
                }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
