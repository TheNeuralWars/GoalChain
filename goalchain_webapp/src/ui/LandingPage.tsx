import React from 'react';
import { useTranslation } from '../i18n/index';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

const RARITY_STATS = [
  { label: 'Mythic', count: 10 },
  { label: 'Legendary', count: 50 },
  { label: 'Genesis NFTs', count: 528 },
];

export function LandingPage() {
  const { t } = useTranslation();
  const { setVisible } = useWalletModal();
  const { publicKey } = useWallet();

  const handleConnect = () => setVisible(true);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 100%)', color: '#fff' }}>
      {/* Hero */}
      <section style={{ padding: '4rem 1.5rem 3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--primary-neon, #00ffcc)', letterSpacing: '3px', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Degen Preseason — Live
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(90deg, #00ffcc, #9945ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          GoalChain
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', opacity: 0.8, maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Football Meets DeFi — Stake, Play, Earn with the Genesis Squad on Solana.
        </p>

        {/* Wallet Connect CTA */}
        {publicKey ? (
          <a href="/dashboard" style={{ display: 'inline-block', padding: '14px 32px', background: 'var(--primary-neon, #00ffcc)', color: '#000', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontSize: '1rem' }}>
            Open Dashboard
          </a>
        ) : (
          <button onClick={handleConnect} style={{ padding: '14px 32px', background: 'var(--primary-neon, #00ffcc)', color: '#000', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
            Connect Wallet
          </button>
        )}
      </section>

      {/* Stats Bar */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {RARITY_STATS.map(({ label, count }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-neon, #00ffcc)' }}>{count}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
          </div>
        ))}
      </section>

      {/* Presale CTA */}
      <section style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>$GCH Presale Active</h2>
        <p style={{ opacity: 0.7, marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
          Join the whitelist to secure your Genesis NFT spot. 30% of the 5,000 SOL hard cap already raised.
        </p>
        <a href="/#/hub" style={{ display: 'inline-block', padding: '12px 28px', border: '1px solid var(--primary-neon, #00ffcc)', color: 'var(--primary-neon, #00ffcc)', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
          Register Wallet
        </a>
      </section>

      {/* Quick Nav */}
      <section style={{ padding: '0 1.5rem 3rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Marketplace', href: '/#' },
          { label: 'Staking', href: '/#/staking' },
          { label: 'Club', href: '/#/club' },
        ].map(({ label, href }) => (
          <a key={label} href={href} style={{ padding: '8px 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', opacity: 0.8 }}>
            {label}
          </a>
        ))}
      </section>
    </div>
  );
}