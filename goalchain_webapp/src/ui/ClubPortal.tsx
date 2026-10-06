import React, { lazy, Suspense, useState } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';
import { SquadGallery } from './SquadGallery';
import { AICoach } from './AICoach';
import { useUser } from '../contexts/UserContext';
import { MatchSimulator } from './MatchSimulator';
import { useTranslation } from '../i18n/index';
import { WalletRequired } from '../wallet/gate';

// Wallet-gated panels are lazy: their @solana/* imports load on demand.
const UserProfile = lazy(() => import('./UserProfile').then(m => ({ default: m.UserProfile })));
const CreateUser = lazy(() => import('./CreateUser').then(m => ({ default: m.CreateUser })));
const NFTMarketplace = lazy(() => import('./NFTMarketplace').then(m => ({ default: m.NFTMarketplace })));


export function ClubPortal() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'squad' | 'market' | 'coach' | 'profile' | 'arena'>('squad');
  const { user, isLoggedIn } = useUser();

  const tabs = [
    { id: 'squad', label: t('club_portal_tabs.squad.label'), desc: t('club_portal_tabs.squad.desc') },
    { id: 'arena', label: t('club_portal_tabs.arena.label'), desc: t('club_portal_tabs.arena.desc') },
    { id: 'market', label: t('club_portal_tabs.market.label'), desc: t('club_portal_tabs.market.desc') },
    { id: 'coach', label: t('club_portal_tabs.coach.label'), desc: t('club_portal_tabs.coach.desc') },
    { id: 'profile', label: t('club_portal_tabs.profile.label'), desc: t('club_portal_tabs.profile.desc') },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge portal-badge--club">{t('club_portal_badge')}</div>
        <SimulationBadge />
        <h1>{t('club_portal_title')}</h1>
        <p className="portal-honesty-note">
          {t('club_portal_demo_note')}
        </p>
        <p className="portal-subtitle">
          {t('club_portal_subtitle')}
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
            <WalletRequired>
              <Suspense fallback={<div className="wallet-gate-loading">Loading marketplace…</div>}>
                <NFTMarketplace />
              </Suspense>
            </WalletRequired>
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
              <WalletRequired>
                <Suspense fallback={<div className="wallet-gate-loading">Loading profile…</div>}>
                  <UserProfile username={user?.username} />
                </Suspense>
              </WalletRequired>
            ) : (
              <div className="registration-wrapper glass-card">
                <div className="registration-promo">
                  <h2>{t('club_portal_registration.title')}</h2>
                  <p>
                    {t('club_portal_registration.description')}
                  </p>
                </div>
                <WalletRequired>
                  <Suspense fallback={<div className="wallet-gate-loading">Loading registration…</div>}>
                    <CreateUser onUserCreated={() => {
                      setActiveSubTab('profile');
                    }} />
                  </Suspense>
                </WalletRequired>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}