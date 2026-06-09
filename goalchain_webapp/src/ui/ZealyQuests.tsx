import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SimulationBadge } from '../components/SimulationBadge';
import { useTranslation } from '../i18n';
import { fetchUserXP, fetchLeaderboard, generateReferralLink, ZealyUser, getTierColor, getTierLabel } from '../lib/zealyClient';

const TIER_ORDER = ['MYTHIC', 'LEGENDARY', 'EPIC', 'RARE', 'COMMON'];

export function ZealyQuests() {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  const [userXP, setUserXP] = useState<number>(0);
  const [userTier, setUserTier] = useState<'MYTHIC' | 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON'>('COMMON');
  const [leaderboard, setLeaderboard] = useState<ZealyUser[]>([]);
  const [referralLink, setReferralLink] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58() || '';

  const loadData = useCallback(async () => {
    if (!walletAddress) {
      // Load mock data for non-connected users
      setUserXP(1650);
      setUserTier('RARE');
      const mockLb = await import('../lib/zealyClient').then(m => m.fetchLeaderboard(10));
      setLeaderboard(mockLb);
      setReferralLink('Connect wallet to generate...');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [xpData, lbData] = await Promise.all([
        import('../lib/zealyClient').then(m => m.fetchUserXP(walletAddress)),
        import('../lib/zealyClient').then(m => m.fetchLeaderboard(10)),
      ]);

      setUserXP(xpData.xp);
      setUserTier(xpData.tier);
      setLeaderboard(lbData);
      setReferralLink(import.meta.env.VITE_ZEALY_REFERRAL_BASE
        ? `${import.meta.env.VITE_ZEALY_REFERRAL_BASE}?ref=${walletAddress.slice(0, 8)}`
        : 'Configure referral in .env');
    } catch (err) {
      console.error('Zealy data load error:', err);
      setError('Failed to load Zealy data. Using demo mode.');
      // Fallback to mock
      setUserXP(1650);
      setUserTier('RARE');
      const mockLb = await import('../lib/zealyClient').then(m => m.fetchLeaderboard(10));
      setLeaderboard(mockLb);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      // In real implementation, this would trigger a backend sync
      await new Promise(r => setTimeout(r, 1500));
      await loadData();
    } catch (err) {
      setError('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      alert('Referral link copied!');
    } catch {
      alert('Failed to copy. Please copy manually.');
    }
  };

  const formatXP = (xp: number) => xp.toLocaleString();

  const sortLeaderboard = (users: ZealyUser[]) => {
    return [...users].sort((a, b) => {
      const tierA = TIER_ORDER.indexOf(a.tier || 'COMMON');
      const tierB = TIER_ORDER.indexOf(b.tier || 'COMMON');
      if (tierA !== tierB) return tierA - tierB;
      return b.xp - a.xp;
    });
  };

  const sortedLeaderboard = sortLeaderboard(leaderboard);

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {t('soc_title') || 'Join Zealy Quests'}
            <SimulationBadge />
          </h2>
          <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {t('soc_sub') || 'Complete tasks and quests to earn XP. XP converts to $GCH in airdrop!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: syncing || loading ? 'not-allowed' : 'pointer',
              opacity: syncing || loading ? 0.6 : 1,
              background: 'var(--primary-neon)',
              color: '#000',
              border: 'none',
            }}
          >
            {syncing ? '🔄 Syncing...' : '🔄 Sync Now'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.3)', color: '#ff9ea8', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* User Stats Card */}
      <div style={{ background: 'rgba(20, 241, 149, 0.05)', border: '1px solid rgba(20, 241, 149, 0.2)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-neon)', fontFamily: 'monospace' }}>
              {formatXP(userXP)}
            </div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {t('soc_your_pts') || 'YOUR ZEALY XP'}
            </div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: getTierColor(userTier), textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {getTierLabel(userTier)}
            </div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem', marginTop: '0.25rem' }}>
              AIRDROP TIER
            </div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dim)' }}>
              #{sortedLeaderboard.findIndex(u => u.xp <= userXP && (u.walletAddress === (typeof window !== 'undefined' ? localStorage.getItem('goalchain_wallet') : ''))) + 1 || '—'}
            </div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem', marginTop: '0.25rem' }}>
              LEADERBOARD RANK
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('soc_ref_label') || 'Your referral link:'}
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={referralLink}
            readOnly
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
            }}
          />
          <button
            onClick={copyReferral}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              background: 'var(--secondary-neon)',
              color: '#000',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            📋 Copiar
          </button>
        </div>
        <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.5rem' }}>
          {t('soc_connect_info') || 'Share to earn 100 XP per referral'}
        </p>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🏆 {t('soc_title')?.replace('Join ', '').replace('Únete a ', '') || 'Leaderboard'}
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase' }}>RANK</th>
                <th style={{ padding: '0.75rem', opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase' }}>USER</th>
                <th style={{ padding: '0.75rem', opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase' }}>XP</th>
                <th style={{ padding: '0.75rem', opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase' }}>TIER</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.slice(0, 10).map((user, index) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 900, color: index < 3 ? 'var(--gold)' : 'var(--primary-neon)' }}>
                    {index + 1}
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                  </td>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {user.username}
                  </td>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: 'var(--primary-neon)' }}>
                    {formatXP(user.xp)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: getTierColor(user.tier || 'COMMON') + '20',
                        color: getTierColor(user.tier || 'COMMON'),
                        border: `1px solid ${getTierColor(user.tier || 'COMMON')}40`,
                      }}
                    >
                      {getTierLabel(user.tier || 'COMMON')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.6, textAlign: 'center' }}>
          {t('soc_connect_info') || 'Compete against the community to secure your allocation'}
        </p>
      </div>

      {/* Quest Categories */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>📋 Available Quests</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <QuestCard icon="🐦" title={t('soc_t1_t') || 'Follow on X'} desc={t('soc_t1_d') || 'Follow @GoalChainDotFun'} xp="100" />
          <QuestCard icon="📱" title={t('soc_t2_t') || 'Share Tweet'} desc={t('soc_t2_d') || 'Share our pinned tweet'} xp="50" />
          <QuestCard icon="💬" title={t('soc_t3_t') || 'Join Discord'} desc={t('soc_t3_d') || 'Join the community'} xp="100" />
          <QuestCard icon="📷" title={t('soc_t4_t') || 'Follow Instagram'} desc={t('soc_t4_d') || 'Our official profile'} xp="50" />
          <QuestCard icon="👥" title={t('soc_t5_t') || 'Invite Friends'} desc={t('soc_t5_d') || '100 pts per referral'} xp="100" />
          <QuestCard icon="🎮" title={t('soc_t6_t') || 'Play Mini-Game'} desc={t('soc_t6_d') || 'Test your aim'} xp="50" />
        </div>
      </div>
    </div>
  );
}

function QuestCard({ icon, title, desc, xp }: { icon: string; title: string; desc: string; xp: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{title}</div>
          <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>{desc}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>XP Reward</span>
        <span style={{ fontWeight: 900, color: 'var(--primary-neon)', fontSize: '1.1rem' }}>+{xp} XP</span>
      </div>
    </div>
  );
}

function formatXP(xp: number): string {
  return xp.toLocaleString();
}

function getTierLabel(tier: string): string {
  return tier;
}

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    MYTHIC: 'var(--gold)',
    LEGENDARY: 'var(--secondary-neon)',
    EPIC: '#9945ff',
    RARE: 'var(--primary-neon)',
    COMMON: '#cbd5e1',
  };
  return colors[tier] || colors.COMMON;
}