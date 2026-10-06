import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/index';
import { useWalletGate } from '../wallet/gate';

/*
 * TODO(marketing): the previous stats/presale block ("Mythic 10 / Legendary 50 /
 * Genesis NFTs 528", "$GCH Presale Active — 30% of the 5,000 SOL hard cap already
 * raised", CTA "Register Wallet" -> /#/hub) was pulled from the public page: the
 * figures are unverified and the /#/hub links do not route in this SPA.
 * Restore from git history once Nico confirms the numbers — see docs/LAUNCH_REPORT.md.
 */

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create your account',
    desc: 'Connect a Solana wallet (Phantom), pick your manager name, and you are in.',
    href: '/crear-usuario',
    cta: 'Create account',
  },
  {
    step: '02',
    title: 'Explore Matchday',
    desc: 'Live fixtures, predictions and a full match simulator — follow the action as it happens.',
    href: '/estadio',
    cta: 'Open Matchday',
  },
  {
    step: '03',
    title: 'Build your club',
    desc: 'Squad gallery, NFT market, trading and staking — your club, your playbook.',
    href: '/club',
    cta: 'Open Club',
  },
];

const QUICK_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Matchday', href: '/estadio' },
  { label: 'Club', href: '/club' },
  { label: 'Staking', href: '/staking' },
];

export function LandingPage() {
  const { t } = useTranslation();
  const { publicKeyBase58, openModal } = useWalletGate();

  const handleConnect = () => openModal();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 100%)', color: '#fff' }}>
      {/* Hero */}
      <section style={{ padding: '4rem 1.5rem 2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--primary-neon, #00ffcc)', letterSpacing: '3px', marginBottom: '1rem', textTransform: 'uppercase' }}>
          GoalWorld · World of Achievements
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(90deg, #00ffcc, #9945ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          GoalChain
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', opacity: 0.8, maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Football Meets DeFi — Stake, Play, Earn with the Genesis Squad on Solana.
        </p>

        {/* Primary + secondary CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {publicKeyBase58 ? (
            <Link to="/dashboard" style={{ display: 'inline-block', padding: '14px 32px', background: 'var(--primary-neon, #00ffcc)', color: '#000', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontSize: '1rem' }}>
              Open Dashboard
            </Link>
          ) : (
            <button onClick={handleConnect} style={{ padding: '14px 32px', background: 'var(--primary-neon, #00ffcc)', color: '#000', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
              Connect Wallet
            </button>
          )}
          <a href="#how-it-works" style={{ display: 'inline-block', padding: '14px 32px', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', lineHeight: '1.2' }}>
            How it works ↓
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '2.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>
          New here? You are playing in three steps.
        </h2>
        <p style={{ textAlign: 'center', opacity: 0.6, marginBottom: '2rem', fontSize: '0.95rem' }}>
          No downloads. Connect, explore, and build your squad.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', maxWidth: '960px', margin: '0 auto' }}>
          {HOW_IT_WORKS.map(({ step, title, desc, href, cta }) => (
            <div key={step} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem 1.25rem 1.5rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-neon, #00ffcc)', letterSpacing: '2px', marginBottom: '0.5rem' }}>{step}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.88rem', opacity: 0.7, lineHeight: 1.55, marginBottom: '1rem' }}>{desc}</p>
              <Link to={href} style={{ color: 'var(--primary-neon, #00ffcc)', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
                {cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Nav */}
      <section style={{ padding: '2.5rem 1.5rem 1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {QUICK_LINKS.map(({ label, href }) => (
          <Link key={label} to={href} style={{ padding: '8px 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', opacity: 0.8 }}>
            {label}
          </Link>
        ))}
      </section>

      {/* Honest status note */}
      <p style={{ textAlign: 'center', opacity: 0.45, fontSize: '0.78rem', padding: '0 1.5rem 3rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
        Playable demo running on Solana devnet. Features marked “Simulation” are not live markets.
      </p>
    </div>
  );
}
