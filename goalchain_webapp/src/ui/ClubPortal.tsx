import React, { useState } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';
import { SquadGallery } from './SquadGallery';
import { UserProfile } from './UserProfile';
import { CreateUser } from './CreateUser';
import { NFTMarketplace } from './NFTMarketplace';
import { AICoach } from './AICoach';
import { useUser } from '../contexts/UserContext';
import { MatchSimulator } from './MatchSimulator';

export function ClubPortal() {
  const [activeSubTab, setActiveSubTab] = useState<'squad' | 'market' | 'coach' | 'profile' | 'arena'>('squad');
  const { user, isLoggedIn } = useUser();

  const tabs = [
    { id: 'squad', label: '👕 My Squad (NFTs)', desc: 'Collection of players and stamina' },
    { id: 'arena', label: '🏟️ Tactical Arena', desc: 'Play simulation matches with 50 $GCH stakes' },
    { id: 'market', label: '🛒 Transfer Market', desc: 'Buy cards in SOL or Cash' },
    { id: 'coach', label: '🤖 AI Assistant (Eliza)', desc: 'Tactical advice and intelligence' },
    { id: 'profile', label: '👤 Manager Profile', desc: 'Your reputation and identity' },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge portal-badge--club">CLUB PORTAL</div>
        <SimulationBadge />
        <h1>Mi Club &amp; Manager</h1>
        <p className="portal-honesty-note">
          Demo squad — on-chain NFTs and yield activate post-World Cup.
        </p>
        <p className="portal-subtitle">
          Manage your digital player squad, improve their stats, and monitor your manager reputation.
        </p>

        {/* Glassmorphic Tabs Navigation */}
        <div className="portal-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
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
        {activeSubTab === 'arena' && (
          <div className="portal-fade-in">
            <MatchSimulator />
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
            {isLoggedIn ? (
              <UserProfile username={user?.username} />
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
