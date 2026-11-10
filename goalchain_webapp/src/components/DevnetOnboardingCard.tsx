import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { getLocalizedMarketingUrl } from '../config/playNav';

const STORAGE_KEY = 'gc_onboarding_collapsed';

interface DevnetOnboardingCardProps {
  compactDefault?: boolean;
  onStartMatch?: () => void;
}

export const DevnetOnboardingCard: React.FC<DevnetOnboardingCardProps> = ({
  compactDefault = false,
  onStartMatch,
}) => {
  const { t, language } = useTranslation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === '1') return true;
      if (saved === '0') return false;
    } catch {
      // ignore storage errors
    }
    return compactDefault;
  });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore storage errors
    }
  };

  const explainerUrl = `${getLocalizedMarketingUrl('/collect.html', language)}#matchday-lab`;

  return (
    <section
      aria-label="Solana Devnet Sandbox Onboarding"
      data-devnet-onboarding
      style={{
        background: 'linear-gradient(135deg, rgba(229, 169, 60, 0.08) 0%, rgba(16, 18, 24, 0.94) 55%, rgba(16, 185, 129, 0.06) 100%)',
        border: '1px solid rgba(229, 169, 60, 0.28)',
        borderRadius: 16,
        padding: collapsed ? '12px 16px' : '20px 22px',
        marginBottom: 18,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#34d399',
                display: 'inline-block',
              }}
            />
            {t('devnet_onboard_badge')}
          </span>
          {collapsed && (
            <span style={{ color: '#e2e8f0', fontSize: '0.92rem', fontWeight: 600 }}>
              {t('devnet_onboard_title')}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {collapsed && (
            onStartMatch ? (
              <button
                type="button"
                onClick={onStartMatch}
                style={{
                  minHeight: 44,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: '#e5a93c',
                  color: '#0a0b0e',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {t('devnet_cta_first_match')}
              </button>
            ) : (
              <Link
                to="/estadio?tab=simulator"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 44,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: '#e5a93c',
                  color: '#0a0b0e',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                }}
              >
                {t('devnet_cta_first_match')}
              </Link>
            )
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            style={{
              minHeight: 44,
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#cbd5e1',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {collapsed ? `▾ ${t('devnet_show_guide')}` : `▴ ${t('devnet_hide_guide')}`}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ marginTop: 14 }}>
          <h2
            style={{
              margin: '0 0 6px 0',
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.01em',
            }}
          >
            {t('devnet_onboard_title')}
          </h2>
          <p
            style={{
              margin: '0 0 16px 0',
              color: '#cbd5e1',
              fontSize: '0.94rem',
              lineHeight: 1.55,
              maxWidth: '78ch',
            }}
          >
            {t('devnet_onboard_sub')}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: 'rgba(10, 11, 14, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '12px 14px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#e5a93c', fontSize: '0.92rem', marginBottom: 4 }}>
                {t('devnet_step1_title')}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {t('devnet_step1_desc')}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(10, 11, 14, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '12px 14px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.92rem', marginBottom: 4 }}>
                {t('devnet_step2_title')}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {t('devnet_step2_desc')}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(10, 11, 14, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '12px 14px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.92rem', marginBottom: 4 }}>
                {t('devnet_step3_title')}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {t('devnet_step3_desc')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {onStartMatch ? (
              <button
                type="button"
                onClick={onStartMatch}
                style={{
                  minHeight: 44,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: '#e5a93c',
                  color: '#0a0b0e',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {t('devnet_cta_first_match')}
              </button>
            ) : (
              <Link
                to="/estadio?tab=simulator"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 44,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: '#e5a93c',
                  color: '#0a0b0e',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                }}
              >
                {t('devnet_cta_first_match')}
              </Link>
            )}

            <Link
              to="/estadio?tab=predictor"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '10px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                color: '#f8fafc',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              {t('devnet_cta_bracket')}
            </Link>

            <a
              href={explainerUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '10px 16px',
                borderRadius: 10,
                background: 'transparent',
                border: '1px solid rgba(229, 169, 60, 0.35)',
                color: '#e5a93c',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              {t('devnet_cta_explainer')} ↗
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
