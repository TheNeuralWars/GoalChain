import React, { useState } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';
import { SquadGallery } from './SquadGallery';
import { UserProfile } from './UserProfile';
import { CreateUser } from './CreateUser';
import { NFTMarketplace } from './NFTMarketplace';
import { AICoach } from './AICoach';
import { useUser } from '../contexts/UserContext';
import { MatchSimulator } from './MatchSimulator';
import { useTranslation } from 'react-i18next';


export function ClubPortal() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'squad' | 'market' | 'coach' | 'profile' | 'arena'>('squad');
  const { user, isLoggedIn } = useUser();

  const tabs = [
    { id: 'squad', label: t('club_portal.tabs.squad.label'), desc: t('club_portal.tabs.squad.desc') },
    { id: 'arena', label: t('club_portal.tabs.arena.label'), desc: t('club_portal.tabs.arena.desc') },
    { id: 'market', label: t('club_portal.tabs.market.label'), desc: t('club_portal.tabs.market.desc') },
    { id: 'coach', label: t('club_portal.tabs.coach.label'), desc: t('club_portal.tabs.coach.desc') },
    { id: 'profile', label: t('club_portal.tabs.profile.label'), desc: t('club_portal.tabs.profile.desc') },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge portal-badge--club">{t('club_portal.badge')}</div>
        <SimulationBadge />
        <h1>{t('club_portal.title')}</h1>
        <p className="portal-honesty-note">
          {t('club_portal.demo_note')}
        </p>
        <p className="portal-subtitle">
          {t('club_portal.subtitle')}
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
                  <h2>{t('club_portal.registration.title')}</h2>
                  <p>
                    {t('club_portal.registration.description')}
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