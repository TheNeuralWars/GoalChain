/** Hook for simulated price history feed (random walk) */

import { useState, useEffect, useMemo } from 'react';
import type { PricePoint } from '../types';
import {
  PRICE_HISTORY_CONFIG,
  CHART_COLORS,
} from '../constants';

export function usePriceHistory() {
  const [priceHistory, setPriceHistory] = useState<number[]>(() => {
    // Generate initial price history
    const points: number[] = [100];
    for (let i = 1; i < PRICE_HISTORY_CONFIG.initialPoints; i++) {
      const lastPrice = points[points.length - 1];
      const change = (Math.random() + PRICE_HISTORY_CONFIG.driftBias) * PRICE_HISTORY_CONFIG.volatility;
      points.push(Number((lastPrice + change).toFixed(1)));
    }
    return points;
  });

  // Price feed simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceHistory((prev) => {
        const lastPrice = prev[prev.length - 1];
        const change = (Math.random() + PRICE_HISTORY_CONFIG.driftBias) * PRICE_HISTORY_CONFIG.volatility;
        const nextPrice = Number((lastPrice + change).toFixed(1));
        return [...prev.slice(1), nextPrice];
      });
    }, PRICE_HISTORY_CONFIG.intervalMs);

    return () => clearInterval(interval);
  }, []);

  // Derived values
  const isTrendingUp = useMemo(() => {
    if (priceHistory.length < 2) return true;
    return priceHistory[priceHistory.length - 1] >= priceHistory[0];
  }, [priceHistory]);

  const latestPriceChange = useMemo(() => {
    const start = priceHistory[0];
    const current = priceHistory[priceHistory.length - 1];
    const percent = ((current - start) / start) * 100;
    return Number(percent.toFixed(2));
  }, [priceHistory]);

  const currentPrice = priceHistory[priceHistory.length - 1];

  const chartColors = isTrendingUp ? CHART_COLORS.up : CHART_COLORS.down;

  // Map price history to SVG coordinates
  const points = useMemo((): PricePoint[] => {
    const minPrice = Math.min(...priceHistory);
    const maxPrice = Math.max(...priceHistory);
    const range = maxPrice - minPrice || 1;
    const { chartWidth, chartHeight, chartPadding } = PRICE_HISTORY_CONFIG;

    return priceHistory.map((val, idx) => {
      const x = (idx / (priceHistory.length - 1)) * chartWidth;
      const y =
        chartHeight - chartPadding.bottom -
        ((val - minPrice) / range) * (chartHeight - chartPadding.top - chartPadding.bottom);
      return { x, y, val };
    });
  }, [priceHistory]);

  // Path definitions for stroke and filled area
  const pathD = useMemo(() => {
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  const areaD = useMemo(() => {
    const { chartWidth, chartHeight } = PRICE_HISTORY_CONFIG;
    return `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  }, [pathD]);

  return {
    priceHistory,
    currentPrice,
    isTrendingUp,
    latestPriceChange,
    points,
    pathD,
    areaD,
    activeColor: chartColors.color,
    activeGlow: chartColors.glow,
    gradientStart: chartColors.gradientStart,
    gradientEnd: chartColors.gradientEnd,
    chartWidth: PRICE_HISTORY_CONFIG.chartWidth,
    chartHeight: PRICE_HISTORY_CONFIG.chartHeight,
  };
}