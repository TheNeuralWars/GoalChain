import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { fetchUserChainStats } from '../lib/goalchainClient';
import { useTranslation } from '../i18n';

interface UserProfileProps {
  username?: string;
}

// Mock data — in production comes from Firestore/on-chain
const getMockProfile = (username: string) => ({
  username,
  avatar: '🦅',
  role: 'Manager',
  wallet: 'GoAL...c4in',
  joinedDate: 'May 2026',
  stats: {
    balance: 2_340.50,
    totalBets: 47,
    winRate: 68.1,
    nftsOwned: 12,
    upgradesDone: 3,
    totalVolume: 18_920.00,
    rank: 'Gold',
    xp: 4_210,
  },
  recentActivity: [
    { type: 'BET',     desc: 'ARG vs FRA — Long x5',   amount: '+320 USDC', date: '23 May',  positive: true },
    { type: 'NFT',     desc: 'Enzo Bit Gold — Acquired', amount: '-180 USDC', date: '22 May', positive: false },
    { type: 'UPGRADE', desc: 'Enzo Bit → Platinum',     amount: '-50 USDC',  date: '21 May',  positive: false },
    { type: 'BET',     desc: 'BRA vs ESP — Short x3',   amount: '+150 USDC', date: '20 May',  positive: true },
    { type: 'BET',     desc: 'GER vs POR — Long x2',    amount: '-80 USDC',  date: '19 May',  positive: false },
  ],
  nfts: [
    { name: 'Enzo Bit', rarity: 'Gold',   emoji: '⚽', level: 3 },
    { name: 'Julian Satoshi', rarity: 'Silver', emoji: '🥈', level: 2 },
    { name: 'Lucas Zero', rarity: 'Bronze', emoji: '🥉', level: 1 },
  ],
  ecosystemStats: {
    totalPlayers: 1_240,
    totalVolume: '2.4M USDC',
    topManager: 'el_toro_sentimental',
    matchesPlayed: 38,
  }
});

const RARITY_COLORS: Record<string, string> = {
  Gold:   '#ffd700',
  Silver: '#c0c0c0',
  Bronze: '#cd7f32',
  Platinum: '#14f195',
};

const ACTIVITY_COLORS: Record<string, string> = {
  BET:     '#9945ff',
  NFT:     '#14f195',
  UPGRADE: '#f7b731',
};

export const UserProfile: React.FC<UserProfileProps> = ({ username: propUsername }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { t } = useTranslation();
  const urlUsername = window.location.pathname.split('/perfil/')[1];
  const username = propUsername || urlUsername || 'demo_user';
  const profile = getMockProfile(username);
  const [chainStats, setChainStats] = useState<null | {
    totalBets: number;
    totalVolumeBaseUnits: number;
    claimedBets: number;
    openBets: number;
    stakedAmountBaseUnits: number;
    unclaimedRewardsBaseUnits: number;
  }>(null);

  // Load from localStorage if username matches
  const storedUserRaw = localStorage.getItem('goalchain_user');
  if (storedUserRaw) {
    try {
      const storedUser = JSON.parse(storedUserRaw);
      if (storedUser.username && storedUser.username.toLowerCase() === username.toLowerCase()) {
        profile.avatar = storedUser.avatar || profile.avatar;
        profile.role = storedUser.role || profile.role;
        if (storedUser.wallet) {
          profile.wallet = `${storedUser.wallet.slice(0, 4)}...${storedUser.wallet.slice(-4)}`;
        }
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!publicKey) {
        if (mounted) setChainStats(null);
        return;
      }
      try {
        const stats = await fetchUserChainStats(connection, publicKey);
        if (mounted) setChainStats(stats);
      } catch (e) {
        if (mounted) setChainStats(null);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [connection, publicKey?.toBase58()]);

  const { stats } = profile;
  const effectiveTotalBets = chainStats?.totalBets ?? stats.totalBets;
  const effectiveVolume = chainStats?.totalVolumeBaseUnits ?? stats.totalVolume;
  const effectiveBalance = chainStats ? chainStats.unclaimedRewardsBaseUnits : stats.balance;
  const effectiveStaked = chainStats ? chainStats.stakedAmountBaseUnits : 0;
  const effectiveOpenBets = chainStats?.openBets ?? Math.round(stats.totalBets * (1 - stats.winRate / 100));
  const effectiveClaimedBets = chainStats?.claimedBets ?? Math.round(stats.totalBets * stats.winRate / 100);

  const [activeTab, setActiveTab] = useState<'overview' | 'nfts' | 'activity' | 'ecosystem'>('overview');

  const rankColor = stats.rank === 'Gold' ? '#ffd700' : stats.rank === 'Silver' ? '#c0c0c0' : '#cd7f32';

  return (
    <div className="profile-page">
      {/* Hero card */}
      <div className="profile-hero">
        <div className="profile-avatar-large">{profile.avatar}</div>
        <div className="profile-hero-info">
          <h1 className="profile-username">@{profile.username}</h1>
          <div className="profile-meta-row">
            <span className="profile-role-badge">{profile.role}</span>
            <span className="profile-rank-badge" style={{ borderColor: rankColor, color: rankColor }}>
              ⭐ {stats.rank}
            </span>
            <span className="profile-joined">{t('profile_joined')} {profile.joinedDate}</span>
          </div>
          <div className="profile-wallet">
            <code>{profile.wallet}</code>
          </div>
        </div>
        <div className="profile-xp-bar-wrap">
          <div className="profile-xp-label">XP: {stats.xp.toLocaleString()}</div>
          <div className="profile-xp-track">
            <div className="profile-xp-fill" style={{ width: `${(stats.xp % 5000) / 50}%` }} />
          </div>
          <div className="profile-xp-next">{t('profile_next_level', { xp: 5000 - (stats.xp % 5000) })}</div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="profile-stats-bar">
        {[
          { label: t('profile_balance'), value: `$${stats.balance.toLocaleString('es', { minimumFractionDigits: 2 })}`, icon: '💰' },
          { label: t('profile_win_rate'), value: `${stats.winRate}%`, icon: '🎯' },
          { label: t('profile_total_bets'), value: effectiveTotalBets, icon: '📊' },
          { label: t('profile_nfts'), value: stats.nftsOwned, icon: '🃏' },
          { label: t('profile_volume'), value: chainStats ? `${effectiveVolume.toLocaleString()} u` : `$${(stats.totalVolume / 1000).toFixed(1)}K`, icon: '📈' },
          { label: t('profile_upgrades'), value: stats.upgradesDone, icon: '⚡' },
        ].map(s => (
          <div key={s.label} className="profile-stat-item">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="profile-tabs">
        {(['overview', 'nfts', 'activity', 'ecosystem'] as const).map(tab => (
          <button
            key={tab}
            id={`tab-${tab}`}
            className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {{ overview: t('tab_overview'), nfts: t('tab_nfts'), activity: t('tab_activity'), ecosystem: t('tab_ecosystem') }}[tab]
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="profile-tab-content">

        {activeTab === 'overview' && (
          <div className="tab-overview">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>{t('overview_balance')}</h3>
                <div className="big-number" style={{ color: '#14f195' }}>
                  {chainStats ? `${effectiveBalance.toLocaleString()} base units` : `$${stats.balance.toLocaleString('es', { minimumFractionDigits: 2 })} USDC`}
                </div>
                {chainStats && (
                  <div style={{ marginTop: 6, fontSize: '0.75rem', opacity: 0.8 }}>
                    {t('overview_stake')}: {effectiveStaked.toLocaleString()} base units
                  </div>
                )}
              </div>
              <div className="overview-card">
                <h3>{t('overview_performance')}</h3>
                <div className="perf-ring-wrap">
                  <svg viewBox="0 0 80 80" className="perf-ring">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke={stats.winRate >= 60 ? '#14f195' : '#f7b731'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(stats.winRate / 100) * 201} 201`}
                      transform="rotate(-90 40 40)"
                    />
                    <text x="40" y="44" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
                      {stats.winRate}%
                    </text>
                  </svg>
                  <span>{t('overview_win_rate')}</span>
                </div>
              </div>
              <div className="overview-card">
                <h3>{t('overview_operations')}</h3>
                <div className="ops-breakdown">
                  <div>{t('overview_total_bets')}: <strong>{effectiveTotalBets}</strong></div>
                  <div>{t('overview_claimed')}: <strong style={{ color: '#14f195' }}>{effectiveClaimedBets}</strong></div>
                  <div>{t('overview_open')}: <strong style={{ color: '#f35d7b' }}>{effectiveOpenBets}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nfts' && (
          <div className="tab-nfts">
            <div className="nfts-grid">
              {profile.nfts.map((nft, i) => (
                <div key={i} className="nft-profile-card" style={{ borderColor: RARITY_COLORS[nft.rarity] }}>
                  <div className="nft-emoji">{nft.emoji}</div>
                  <div className="nft-name">{nft.name}</div>
                  <div className="nft-rarity" style={{ color: RARITY_COLORS[nft.rarity] }}>{nft.rarity}</div>
                  <div className="nft-level">Nivel {nft.level}</div>
                </div>
              ))}
              {/* Placeholder slots */}
              {Array.from({ length: Math.max(0, 6 - profile.nfts.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="nft-profile-card nft-empty">
                  <div className="nft-emoji" style={{ opacity: 0.2 }}>🃏</div>
                  <div style={{ opacity: 0.3, fontSize: '0.75rem' }}>{t('nft_empty')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="tab-activity">
            {profile.recentActivity.map((act, i) => (
              <div key={i} className="activity-row">
                <span className="activity-badge" style={{ background: ACTIVITY_COLORS[act.type] + '22', color: ACTIVITY_COLORS[act.type] }}>
                  {act.type}
                </span>
                <span className="activity-desc">{act.desc}</span>
                <span className="activity-date">{act.date}</span>
                <span className={`activity-amount ${act.positive ? 'positive' : 'negative'}`}>
                  {act.amount}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ecosystem' && (
          <div className="tab-ecosystem">
            <div className="ecosystem-grid">
              {[
                { label: t('ecosystem_players'), value: profile.ecosystemStats.totalPlayers.toLocaleString(), icon: '👥' },
                { label: t('ecosystem_volume'), value: profile.ecosystemStats.totalVolume, icon: '💹' },
                { label: t('ecosystem_matches'), value: profile.ecosystemStats.matchesPlayed, icon: '⚽' },
                { label: t('ecosystem_top_manager'), value: `@${profile.ecosystemStats.topManager}`, icon: '🏆' },
              ].map(e => (
                <div key={e.label} className="ecosystem-card">
                  <div className="ecosystem-icon">{e.icon}</div>
                  <div className="ecosystem-value">{e.value}</div>
                  <div className="ecosystem-label">{e.label}</div>
                </div>
              ))}
            </div>
            <div className="ecosystem-note">
              <p dangerouslySetInnerHTML={{ __html: t('profile_share_link', { username: profile.username }) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
