import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/index';
import { useWalletGate } from '../wallet/gate';

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

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <img
            src="/assets/img/hero-neo-veridia.webp"
            alt="GoalWorld — World of Achievements"
            width="1600"
            height="900"
            fetchPriority="high"
            srcSet="/assets/img/hero-neo-veridia-800.webp 800w, /assets/img/hero-neo-veridia.webp 1600w"
            sizes="100vw"
          />
        </div>
        <div className="wrap">
          <p className="eyebrow">GoalWorld Studio · Canon. Code. Cinema.</p>
          <h1 className="rise">
            One universe.<br />
            <span className="serif grad-text">Three mediums.</span>
          </h1>
          <p className="lead lead-2">
            An independent studio building <strong>The Neural Wars</strong> — a hard sci-fi
            saga you can read, a football game you can play, and an AI film you can watch
            take shape.
          </p>
          <div className="btn-row btn-row-2">
            <a className="btn btn-primary" href="/book.html#sample">
              Read Fractured Code &mdash; free
            </a>
            <a className="btn btn-secondary" href="https://play.goalworld.fun/">
              Play Matchday <span className="tag-mono">DEVNET</span>
            </a>
            <a className="btn-link" href="/cinema.html">
              &#9654; Watch the trailer
            </a>
          </div>
          <p className="notify-pill rise-2">
            <strong>Coming soon:</strong> Book 2, <em>Earth's New Song</em> (in production).
            <a href="#book2">Follow @nicopez on X for updates &rarr;</a>
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <h2 className="kicker">Code · GoalChain Play</h2>
          <h2>Football you can play today.</h2>
          <p className="lead">
            Build a club, run the Arena, call the World Cup bracket. The Matchday demo
            runs on Solana Devnet — free to play, no real money, no real transactions.
          </p>
          <div className="btn-row">
            <a className="btn btn-primary" href="https://play.goalworld.fun/">
              Play Matchday
            </a>
            <a className="btn btn-secondary" href="/faq.html">FAQ</a>
          </div>
          <button
            className="expand-btn"
            dataExpand
            ariaExpanded={false}
            ariaControls="how-play"
            dataMore="How it works"
            dataLess="Hide steps"
          >
            <span className="lbl">How it works</span> <span className="chev">&#9662;</span>
          </button>
          <div className="expand-panel" id="how-play">
            <div>
              <ol className="roadmap-list" style={{ listStyle: 'decimal', paddingLeft: '1.2rem', marginTop: '1rem' }}>
                <li>
                  <b>Connect & register</b> &mdash; Phantom wallet, username, avatar,
                    role (Manager, Scout or Trader).
                </li>
                <li>
                  <b>Build your club</b> &mdash; assemble a squad from the Genesis
                    collection.
                </li>
                <li>
                  <b>Play the matches</b> &mdash; tactics, stamina, substitutions.
                </li>
                <li>
                  <b>Call the World Cup</b> &mdash; fill the bracket and save your
                    Pick'Em.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="play">
        <div className="wrap feature" style={{ gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,.9fr)' }}>
          <div className="reveal">
            <p className="kicker">Code · GoalChain Play</p>
            <h2>Football you can play today.</h2>
            <p className="lead">
              Build a club, run the Arena, call the World Cup bracket. The Matchday demo
              runs on Solana Devnet — free to play, no real money, no real transactions.
            </p>
          </div>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <img
              src="/assets/img/loc-kuiper-monolith.webp"
              alt="The Kuiper Monolith drifting in deep space"
              width="1200"
              height="750"
              loading="lazy"
              srcSet="/assets/img/loc-kuiper-monolith-640.webp 640w, /assets/img/loc-kuiper-monolith.webp 1200w"
              sizes="(max-width: 860px) 92vw, 30rem"
            />
          </div>
        </div>
      </section>

      <section className="section" id="live">
        <div className="wrap">
          <p className="kicker">Live from the studio</p>
          <h2>What we're shipping right now</h2>
          <p className="muted small">
            Board updated recently. Some entries are provisional.
          </p>
          <div className="live-board" dataLiveFeed dataMax="6" ariaLive="polite">
            <p className="muted">Loading the live board&hellip;</p>
          </div>
          <div className="btn-row" style={{ marginTop: '1.5rem' }}>
            <a className="btn btn-ghost" href="/live.html">All projects &rarr;</a>
          </div>
        </div>
      </section>

      <section className="section" id="roadmap">
        <div className="wrap">
          <p className="kicker">Roadmap</p>
          <h2>Now, next, later</h2>
          <div className="grid grid-3" style={{ marginTop: '2rem' }}>
            <div className="card reveal">
              <span className="video-tag" style={{ color: '#4ade80' }}>
                Now &middot; live
              </span>
              <ul className="roadmap-list">
                <li><b>Canon</b> Fractured Code (G2 signed off, Chapter 1 sample live).</li>
                <li><b>Code</b> Matchday demo on Devnet.</li>
                <li><b>Cinema</b> Trailer and first film drafts.</li>
              </ul>
            </div>
            <div className="card reveal">
              <span className="video-tag" style={{ color: 'var(--green)' }}>
                Next &middot; in production
              </span>
              <ul className="roadmap-list">
                <li><b>Canon</b> Book 1 release preparation; Book 2 in production.</li>
                <li><b>Code</b> Matchday core-loop and UI upgrades.</li>
                <li><b>Cinema</b> Longer shorts from key chapters.</li>
              </ul>
            </div>
            <div className="card reveal">
              <span className="video-tag" style={{ color: 'var(--cyan)' }}>
                Later &middot; exploring
              </span>
              <ul className="roadmap-list">
                <li><b>Canon</b> Lore archive and audio formats.</li>
                <li><b>Code</b> Reader milestones linked to in-game cosmetics.</li>
                <li><b>Cinema</b> Episodic AI animation and screenings.</li>
              </ul>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: '1.5rem' }}>
            <a className="btn btn-ghost" href="/roadmap.html">Full roadmap &rarr;</a>
          </div>
        </div>
      </section>

      <section className="section" id="community">
        <div className="wrap reveal" style={{ textAlign: 'center' }}>
          <p className="kicker" style={{ justifyContent: 'center' }}>Community</p>
          <h2>Follow the build</h2>
          <p className="lead" style={{ marginInline: 'auto' }}>
            GoalWorld is built in public by Nico Pez and a crew of AI agents. Follow
            along, read the code, ask anything.
          </p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <a className="btn btn-primary" href="https://x.com/nicopez">
              Follow @nicopez
            </a>
            <a className="btn btn-secondary" href="https://github.com/TheNeuralWars/GoalChain">
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}