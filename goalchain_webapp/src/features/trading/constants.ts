/** Trading feature constants */

import type { TradingPair } from './types';

export const DEFAULT_PAIRS: TradingPair[] = [
  { label: 'Argentina (ARG-PERP)', value: 'Argentina (ARG-PERP)' },
  { label: 'Francia (FRA-PERP)', value: 'Francia (FRA-PERP)' },
  { label: 'España (ESP-PERP)', value: 'España (ESP-PERP)' },
];

export const LEVERAGE_OPTIONS = {
  min: 1,
  max: 10,
  step: 1,
  default: 1,
} as const;

export const BOT_CONFIG = {
  initialBalance: 1000,
  positionSize: 100,
  defaultLeverage: 5,
  takeProfitThreshold: 0.25, // 25%
  stopLossThreshold: -0.15, // -15%
  toroSentimentThreshold: 65, // Enter LONG when sentiment > 65
  osoSentimentThreshold: 35, // Enter SHORT when sentiment < 35
  toroCloseSentimentThreshold: 45, // Close LONG when sentiment < 45
  osoCloseSentimentThreshold: 55, // Close SHORT when sentiment > 55
  sentimentAdjustOnClose: 8, // Adjust sentiment when bot closes position
} as const;

export const PRICE_HISTORY_CONFIG = {
  initialPoints: 10,
  intervalMs: 3000,
  driftBias: -0.46, // Slight upward bias
  volatility: 3,
  chartWidth: 300,
  chartHeight: 120,
  chartPadding: { top: 15, bottom: 15 }, // Y range padding
} as const;

export const SENTIMENT_CONFIG = {
  min: 5,
  max: 95,
  default: 50,
  noiseRange: 3,
} as const;

export const BOT_LOGS_CONFIG = {
  maxLogs: 50,
} as const;

export const CHART_COLORS = {
  up: {
    color: 'var(--primary-neon)',
    glow: 'rgba(20, 241, 149, 0.25)',
    gradientStart: 'var(--primary-neon)',
    gradientEnd: 'rgba(20, 241, 149, 0.0)',
  },
  down: {
    color: 'var(--accent-red)',
    glow: 'rgba(255, 75, 75, 0.25)',
    gradientStart: 'var(--accent-red)',
    gradientEnd: 'rgba(255, 75, 75, 0.0)',
  },
} as const;