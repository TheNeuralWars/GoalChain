import React from 'react';
import { Link } from 'react-router-dom';
import { MARKETING_BASE } from '../config/playNav';
import { useWalletGate } from '../wallet/gate';

const HOW_IT_WORKS = [
  {
    step: '01 · SANDBOX SETUP',
    title: 'Initialize your manager profile',
    desc: 'Browse immediately in guest mode or connect a Solana wallet set to Devnet to persist your manager handle and club crest.',
    href: '/crear-usuario',
    cta: 'Create manager profile',
  },
  {
    step: '02 · MATCHDAY ENGINE',
    title: 'Simulate fixtures & penalty shootouts',
    desc: 'Run the tactical 2D pitch simulator, test live commentary, and play instant arcade penalty and pack-opener mini-games.',
    href: '/estadio',
    cta: 'Open Matchday Stadium',
  },
  {
    step: '03 · SQUAD & CANON',
    title: 'Build your squad & explore the lore',
    desc: 'Inspect the 10 Genesis player cards, configure autonomous tactical agents, and read the Fractured Code novel dossier.',
    href: '/club',
    cta: 'Open Club & Squad',
  },
];

const UNIVERSE_PILLARS = [
  {
    kicker: '01 · CANON',
    title: 'The Neural Wars: Fractured Code',
    desc: 'Hard-SF thriller set in Neo-Citania (2045). Follow Kora Vega, David, and Mileo Chen inside the Link.',
    href: `${MARKETING_BASE}/book.html#sample`,
    cta: 'Read Chapter 1 Sample ↗',
    external: true,
  },
  {
    kicker: '02 · CODE',
    title: 'Matchday Lab (Solana Devnet)',
    desc: 'Free browser sandbox for tactical football simulation, squad management, and on-chain mechanics testing.',
    href: '/dashboard',
    cta: 'Open Lab Dashboard →',
    external: false,
  },
  {
    kicker: '03 · CINEMA',
    title: 'AI Cinema Studio',
    desc: 'Human-directed AI teaser reels, visual research studies, and sonic cues adapted from the novel manuscript.',
    href: `${MARKETING_BASE}/cinema.html`,
    cta: 'Watch 22 Clips ↗',
    external: true,
  },
];

const QUICK_LINKS = [
  { label: 'Lab Dashboard', href: '/dashboard' },
  { label: 'Matchday Stadium', href: '/estadio' },
  { label: 'My Club', href: '/club' },
  { label: 'GoalWorld Lore', href: '/goalworld' },
  { label: 'Arcade Hub', href: '/hub' },
];

export function LandingPage() {
  const { publicKeyBase58, openModal } = useWalletGate();

  return (
    <div className="gw-landing">
      {/* Hero */}
      <section className="gw-landing-hero">
        <div className="gw-landing-badges">
          <span className="gw-landing-eyebrow">GoalWorld · Code Medium</span>
          <span className="gw-landing-pill">
            <span className="gw-landing-pill-dot" aria-hidden />
            Solana Devnet · Free Sandbox
          </span>
        </div>

        <h1 className="gw-landing-title">
          Matchday <span className="gw-landing-title-accent">Lab</span>
        </h1>

        <p className="gw-landing-lead">
          Tactical football simulation, autonomous AI squad agents, and free on-chain collectibles inside the{' '}
          <strong>GoalWorld</strong> universe. Running on Solana Devnet with test tokens only — zero real money, zero financial risk.
        </p>

        {/* Primary + secondary CTAs */}
        <div className="gw-landing-ctas">
          <Link to="/dashboard" className="gw-btn gw-btn--primary">
            Enter Matchday Lab →
          </Link>
          <Link to="/estadio" className="gw-btn gw-btn--secondary">
            Open Stadium Simulator
          </Link>
          {!publicKeyBase58 && (
            <button type="button" onClick={() => openModal()} className="gw-btn gw-btn--ghost">
              Connect Devnet Wallet
            </button>
          )}
        </div>

        {/* Telemetry strip */}
        <dl className="gw-landing-stats" aria-label="Sandbox specifications">
          <div>
            <dt>Network</dt>
            <dd>Solana Devnet</dd>
          </div>
          <div>
            <dt>Genesis Roster</dt>
            <dd>10 Player Archetypes</dd>
          </div>
          <div>
            <dt>Arcade Modes</dt>
            <dd>Penalty · Packs · 2D Sim</dd>
          </div>
          <div>
            <dt>Economy Status</dt>
            <dd>Free Test Tokens Only</dd>
          </div>
        </dl>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="gw-landing-section">
        <div className="gw-landing-section-head">
          <span className="gw-landing-kicker">Quick Start</span>
          <h2>Playable in three steps — no mainnet funds required.</h2>
          <p>Explore every tactical module in guest mode or connect a Devnet wallet to test on-chain state.</p>
        </div>

        <div className="gw-landing-grid">
          {HOW_IT_WORKS.map(({ step, title, desc, href, cta }) => (
            <article key={step} className="gw-landing-card">
              <div className="gw-landing-card-step">{step}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link to={href} className="gw-landing-card-link">
                {cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* One Universe · Three Mediums */}
      <section className="gw-landing-section">
        <div className="gw-landing-section-head">
          <span className="gw-landing-kicker">Canon · Code · Cinema</span>
          <h2>One story world across three connected surfaces.</h2>
          <p>Move between the literary novel, the playable Devnet sandbox, and the AI cinema studio.</p>
        </div>

        <div className="gw-landing-grid">
          {UNIVERSE_PILLARS.map(({ kicker, title, desc, href, cta, external }) => (
            <article key={kicker} className="gw-landing-card gw-landing-card--pillar">
              <div className="gw-landing-card-step">{kicker}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              {external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="gw-landing-card-link">
                  {cta}
                </a>
              ) : (
                <Link to={href} className="gw-landing-card-link">
                  {cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Quick Nav & Honesty Note */}
      <section className="gw-landing-footer-box">
        <nav className="gw-landing-quicklinks" aria-label="Sandbox quick links">
          {QUICK_LINKS.map(({ label, href }) => (
            <Link key={label} to={href} className="gw-landing-chip">
              {label}
            </Link>
          ))}
        </nav>
        <p className="gw-landing-honesty">
          <strong>Sandbox Disclosure:</strong> Matchday Lab runs exclusively on Solana Devnet. All tokens, cards, and protocol metrics shown in the lab are free test or local simulation states and carry no monetary value or financial return.
        </p>
      </section>
    </div>
  );
}
