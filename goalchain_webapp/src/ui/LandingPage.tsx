import React from 'react';
import { Link } from 'react-router-dom';
import { getLocalizedMarketingUrl } from '../config/playNav';
import { useWalletGate } from '../wallet/gate';
import { useTranslation } from '../i18n';

export function LandingPage() {
  const { publicKeyBase58, openModal } = useWalletGate();
  const { t, language } = useTranslation();

  const howItWorks = [
    {
      step: t('landing_how1_step'),
      title: t('landing_how1_title'),
      desc: t('landing_how1_desc'),
      href: '/crear-usuario',
      cta: t('landing_how1_cta'),
    },
    {
      step: t('landing_how2_step'),
      title: t('landing_how2_title'),
      desc: t('landing_how2_desc'),
      href: '/estadio',
      cta: t('landing_how2_cta'),
    },
    {
      step: t('landing_how3_step'),
      title: t('landing_how3_title'),
      desc: t('landing_how3_desc'),
      href: '/club',
      cta: t('landing_how3_cta'),
    },
  ];

  const universePillars = [
    {
      kicker: t('landing_pillar1_kicker'),
      title: t('landing_pillar1_title'),
      desc: t('landing_pillar1_desc'),
      href: `${getLocalizedMarketingUrl('/book.html', language)}#sample`,
      cta: t('landing_pillar1_cta'),
      external: true,
    },
    {
      kicker: t('landing_pillar2_kicker'),
      title: t('landing_pillar2_title'),
      desc: t('landing_pillar2_desc'),
      href: '/dashboard',
      cta: t('landing_pillar2_cta'),
      external: false,
    },
    {
      kicker: t('landing_pillar3_kicker'),
      title: t('landing_pillar3_title'),
      desc: t('landing_pillar3_desc'),
      href: getLocalizedMarketingUrl('/cinema.html', language),
      cta: t('landing_pillar3_cta'),
      external: true,
    },
  ];

  const quickLinks = [
    { label: t('nav_dashboard'), href: '/dashboard' },
    { label: t('nav_stadium'), href: '/estadio' },
    { label: t('nav_myclub'), href: '/club' },
    { label: t('nav_goalworld'), href: '/goalworld' },
    { label: t('nav_arcade_hub'), href: '/hub' },
  ];

  return (
    <div className="gw-landing">
      {/* Hero */}
      <section className="gw-landing-hero">
        <div className="gw-landing-badges">
          <span className="gw-landing-eyebrow">{t('landing_eyebrow')}</span>
          <span className="gw-landing-pill">
            <span className="gw-landing-pill-dot" aria-hidden />
            {t('landing_pill')}
          </span>
        </div>

        <h1 className="gw-landing-title">
          {t('landing_title_prefix')} <span className="gw-landing-title-accent">{t('landing_title_accent')}</span>
        </h1>

        <p className="gw-landing-lead">
          {t('landing_lead')}
        </p>

        {/* Primary + secondary CTAs */}
        <div className="gw-landing-ctas">
          <Link to="/dashboard" className="gw-btn gw-btn--primary">
            {t('landing_cta_enter')}
          </Link>
          <Link to="/estadio" className="gw-btn gw-btn--secondary">
            {t('landing_cta_stadium')}
          </Link>
          {!publicKeyBase58 && (
            <button type="button" onClick={() => openModal()} className="gw-btn gw-btn--ghost">
              {t('landing_cta_wallet')}
            </button>
          )}
        </div>

        {/* Telemetry strip */}
        <dl className="gw-landing-stats" aria-label="Sandbox specifications">
          <div>
            <dt>{t('landing_stat1_dt')}</dt>
            <dd>{t('landing_stat1_dd')}</dd>
          </div>
          <div>
            <dt>{t('landing_stat2_dt')}</dt>
            <dd>{t('landing_stat2_dd')}</dd>
          </div>
          <div>
            <dt>{t('landing_stat3_dt')}</dt>
            <dd>{t('landing_stat3_dd')}</dd>
          </div>
          <div>
            <dt>{t('landing_stat4_dt')}</dt>
            <dd>{t('landing_stat4_dd')}</dd>
          </div>
        </dl>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="gw-landing-section">
        <div className="gw-landing-section-head">
          <span className="gw-landing-kicker">{t('landing_how_kicker')}</span>
          <h2>{t('landing_how_title')}</h2>
          <p>{t('landing_how_sub')}</p>
        </div>

        <div className="gw-landing-grid">
          {howItWorks.map(({ step, title, desc, href, cta }) => (
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
          <span className="gw-landing-kicker">{t('landing_pillars_kicker')}</span>
          <h2>{t('landing_pillars_title')}</h2>
          <p>{t('landing_pillars_sub')}</p>
        </div>

        <div className="gw-landing-grid">
          {universePillars.map(({ kicker, title, desc, href, cta, external }) => (
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
          {quickLinks.map(({ label, href }) => (
            <Link key={href} to={href} className="gw-landing-chip">
              {label}
            </Link>
          ))}
        </nav>
        <p className="gw-landing-honesty">
          <strong>{t('landing_honesty_label')}</strong> {t('landing_honesty_body')}
        </p>
      </section>
    </div>
  );
}
