/** PriceChart - SVG line/area chart with glowing dot animation */

import React from 'react';
import { useTranslation } from '../../../i18n';
import type { PricePoint } from '../types';

interface PriceChartProps {
  points: PricePoint[];
  pathD: string;
  areaD: string;
  activeColor: string;
  activeGlow: string;
  gradientStart: string;
  gradientEnd: string;
  latestPrice: number;
  priceChange: number;
  chartWidth: number;
  chartHeight: number;
}

export function PriceChart({
  points,
  pathD,
  areaD,
  activeColor,
  activeGlow,
  gradientStart,
  gradientEnd,
  latestPrice,
  priceChange,
  chartWidth,
  chartHeight,
}: PriceChartProps) {
  const { t } = useTranslation();
  const isUp = priceChange >= 0;

  return (
    <div className="glass-card flex flex-col justify-between" style={{ flex: 1 }}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('trading_chart_title')}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-extrabold" style={{ color: activeColor }}>
              {isUp ? `+${priceChange}` : priceChange}%
            </span>
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                background: activeGlow,
                color: activeColor,
                fontSize: '0.8rem',
              }}
            >
              {isUp ? t('trading_up') : t('trading_down')}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>{t('trading_chart_oracle')}</div>
          <div className="font-bold text-slate-300 font-mono mt-1" style={{ color: '#cbd5e1' }}>
            ${latestPrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div
        style={{
          position: 'relative',
          height: '110px',
          marginTop: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientStart} stopOpacity="0.25" />
              <stop offset="100%" stopColor={gradientEnd} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          <line
            x1="0"
            y1={chartHeight * 0.25}
            x2={chartWidth}
            y2={chartHeight * 0.25}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1="0"
            y1={chartHeight * 0.5}
            x2={chartWidth}
            y2={chartHeight * 0.5}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1="0"
            y1={chartHeight * 0.75}
            x2={chartWidth}
            y2={chartHeight * 0.75}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Filled Area */}
          <path d={areaD} fill="url(#chartAreaGrad)" style={{ transition: 'all 0.3s ease' }} />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={activeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'all 0.3s ease' }}
          />

          {/* Glowing Active Dot */}
          {points.length > 0 && (
            <>
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4.5"
                fill={activeColor}
                style={{ filter: `drop-shadow(0 0 5px ${activeColor})` }}
              />
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="9"
                fill="none"
                stroke={activeColor}
                strokeWidth="1.5"
                opacity="0.6"
              >
                <animate attributeName="r" values="4.5;13;4.5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>
      </div>

      <div className="flex justify-between text-[0.65rem] font-semibold text-slate-600">
        <span>{t('trading_chart_livelink')}</span>
        <span>{t('trading_chart_mock')}</span>
      </div>
    </div>
  );
}