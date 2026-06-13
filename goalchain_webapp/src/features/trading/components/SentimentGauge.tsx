/** SentimentGauge - Market sentiment visualization */

import React from 'react';
import { useTranslation } from '../../../i18n';

interface SentimentGaugeProps {
  sentiment: number;
}

export function SentimentGauge({ sentiment }: SentimentGaugeProps) {
  const { t } = useTranslation();

  const gaugeColor = sentiment > 65 ? 'var(--primary-neon)' : sentiment < 35 ? 'var(--accent-red)' : '#eab308';
  const gaugeLabel = sentiment > 65 ? t('trading_sentiment_hype') : sentiment < 35 ? t('trading_sentiment_panic') : t('trading_sentiment_neutral');
  const rotation = 180 + sentiment * 1.8;

  return (
    <div className="glass-card text-center p-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
        {t('trading_sentiment_title')}
      </div>

      <svg width="200" height="110" viewBox="0 0 200 110" style={{ overflow: 'visible', margin: '0 auto', display: 'block' }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-red)" />
            <stop offset="35%" stopColor="var(--accent-red)" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="65%" stopColor="var(--primary-neon)" />
            <stop offset="100%" stopColor="var(--primary-neon)" />
          </linearGradient>
        </defs>
        <path d="M 30 95 A 70 70 0 0 1 170 95" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 30 95 A 70 70 0 0 1 170 95" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" opacity="0.85" />

        <g transform={`rotate(${rotation}, 100, 95)`} style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <line x1="100" y1="95" x2="45" y2="95" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))' }} />
          <circle cx="100" cy="95" r="6" fill="#ffffff" />
        </g>

        <text x="100" y="110" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800" letterSpacing="0.5">
          {sentiment}% - {gaugeLabel}
        </text>
      </svg>
    </div>
  );
}