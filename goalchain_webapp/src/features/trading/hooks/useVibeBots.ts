/** Hook for Toro/Oso bot state machines */

import { useState, useEffect, useCallback } from 'react';
import type { BotState, BotPosition, BotLog } from '../types';
import {
  BOT_CONFIG,
  SENTIMENT_CONFIG,
} from '../constants';

interface UseVibeBotsOptions {
  currentPrice: number;
  sentiment: number;
  selectedPair: string;
  onLogAdd: (log: BotLog) => void;
  onSentimentAdjust: (delta: number) => void;
  onEventDispatch: (event: CustomEvent) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

interface UseVibeBotsReturn {
  toroState: BotState;
  osoState: BotState;
  toggleToro: (enabled: boolean) => void;
  toggleOso: (enabled: boolean) => void;
  toroUnrealizedPnl: number;
  osoUnrealizedPnl: number;
}

export function useVibeBots({
  currentPrice,
  sentiment,
  selectedPair,
  onLogAdd,
  onSentimentAdjust,
  onEventDispatch,
  t,
}: UseVibeBotsOptions): UseVibeBotsReturn {
  const [toroState, setToroState] = useState<BotState>({
    isEnabled: false,
    balance: BOT_CONFIG.initialBalance,
    totalProfit: 0,
    activePosition: null,
  });

  const [osoState, setOsoState] = useState<BotState>({
    isEnabled: false,
    balance: BOT_CONFIG.initialBalance,
    totalProfit: 0,
    activePosition: null,
  });

  // Toro bot logic
  useEffect(() => {
    if (!currentPrice) return;

    // Check close conditions for active position
    if (toroState.activePosition) {
      const entry = toroState.activePosition.entryPrice;
      const size = toroState.activePosition.size;
      const lev = toroState.activePosition.leverage;
      const pnlPercent = ((currentPrice - entry) / entry) * lev;
      const pnlValue = pnlPercent * size;

      let shouldClose = false;
      let reason = '';

      if (pnlPercent >= BOT_CONFIG.takeProfitThreshold) {
        shouldClose = true;
        reason = 'Take Profit (+25%)';
      } else if (pnlPercent <= BOT_CONFIG.stopLossThreshold) {
        shouldClose = true;
        reason = 'Stop Loss (-15%)';
      } else if (sentiment < BOT_CONFIG.toroCloseSentimentThreshold) {
        shouldClose = true;
        reason = 'Sentiment Change (Low)';
      }

      if (shouldClose) {
        const finalPnl = Number(pnlValue.toFixed(2));
        setToroState((prev) => ({
          ...prev,
          balance: Number((prev.balance + finalPnl).toFixed(2)),
          totalProfit: Number((prev.totalProfit + finalPnl).toFixed(2)),
          activePosition: null,
        }));

        const timestamp = t('bot_timestamp_just_now');

        onLogAdd({
          id: Date.now(),
          botName: t('bot_toro_name'),
          type: 'CLOSE',
          pair: selectedPair,
          price: currentPrice,
          leverage: lev,
          pnl: finalPnl,
          sentiment,
          timestamp,
        });

        onSentimentAdjust(-BOT_CONFIG.sentimentAdjustOnClose);

        onEventDispatch(
          new CustomEvent('goalchain-event', {
            detail: {
              id: Date.now(),
              type: 'RESOLVE',
              message: t('bot_log_toro_close', { pair: selectedPair, pnl: finalPnl >= 0 ? '+' + finalPnl : finalPnl, reason }),
              time: timestamp,
            },
          })
        );
      }
    }
    // Open long position
    else if (toroState.isEnabled && sentiment > BOT_CONFIG.toroSentimentThreshold) {
      setToroState((prev) => ({
        ...prev,
        activePosition: {
          type: 'Long',
          entryPrice: currentPrice,
          leverage: BOT_CONFIG.defaultLeverage,
          size: BOT_CONFIG.positionSize,
        },
      }));

      const timestamp = t('bot_timestamp_just_now');

      onLogAdd({
        id: Date.now(),
        botName: t('bot_toro_name'),
        type: 'LONG',
        pair: selectedPair,
        price: currentPrice,
        leverage: BOT_CONFIG.defaultLeverage,
        sentiment,
        timestamp,
      });

      onEventDispatch(
        new CustomEvent('goalchain-event', {
          detail: {
            id: Date.now(),
            type: 'BET',
            message: t('bot_log_toro_open', { leverage: BOT_CONFIG.defaultLeverage, pair: selectedPair, price: currentPrice, sentiment }),
            time: timestamp,
          },
        })
      );
    }
  }, [currentPrice, sentiment, toroState.isEnabled, toroState.activePosition, selectedPair, t]);

  // Oso bot logic
  useEffect(() => {
    if (!currentPrice) return;

    // Check close conditions for active position
    if (osoState.activePosition) {
      const entry = osoState.activePosition.entryPrice;
      const size = osoState.activePosition.size;
      const lev = osoState.activePosition.leverage;
      const pnlPercent = ((entry - currentPrice) / entry) * lev;
      const pnlValue = pnlPercent * size;

      let shouldClose = false;
      let reason = '';

      if (pnlPercent >= BOT_CONFIG.takeProfitThreshold) {
        shouldClose = true;
        reason = 'Take Profit (+25%)';
      } else if (pnlPercent <= BOT_CONFIG.stopLossThreshold) {
        shouldClose = true;
        reason = 'Stop Loss (-15%)';
      } else if (sentiment > BOT_CONFIG.osoCloseSentimentThreshold) {
        shouldClose = true;
        reason = 'Sentiment Change (High)';
      }

      if (shouldClose) {
        const finalPnl = Number(pnlValue.toFixed(2));
        setOsoState((prev) => ({
          ...prev,
          balance: Number((prev.balance + finalPnl).toFixed(2)),
          totalProfit: Number((prev.totalProfit + finalPnl).toFixed(2)),
          activePosition: null,
        }));

        const timestamp = t('bot_timestamp_just_now');

        onLogAdd({
          id: Date.now(),
          botName: t('bot_oso_name'),
          type: 'CLOSE',
          pair: selectedPair,
          price: currentPrice,
          leverage: lev,
          pnl: finalPnl,
          sentiment,
          timestamp,
        });

        onSentimentAdjust(BOT_CONFIG.sentimentAdjustOnClose);

        onEventDispatch(
          new CustomEvent('goalchain-event', {
            detail: {
              id: Date.now(),
              type: 'RESOLVE',
              message: t('bot_log_oso_close', { pair: selectedPair, pnl: finalPnl >= 0 ? '+' + finalPnl : finalPnl, reason }),
              time: timestamp,
            },
          })
        );
      }
    }
    // Open short position
    else if (osoState.isEnabled && sentiment < BOT_CONFIG.osoSentimentThreshold) {
      setOsoState((prev) => ({
        ...prev,
        activePosition: {
          type: 'Short',
          entryPrice: currentPrice,
          leverage: BOT_CONFIG.defaultLeverage,
          size: BOT_CONFIG.positionSize,
        },
      }));

      const timestamp = t('bot_timestamp_just_now');

      onLogAdd({
        id: Date.now(),
        botName: t('bot_oso_name'),
        type: 'SHORT',
        pair: selectedPair,
        price: currentPrice,
        leverage: BOT_CONFIG.defaultLeverage,
        sentiment,
        timestamp,
      });

      onEventDispatch(
        new CustomEvent('goalchain-event', {
          detail: {
            id: Date.now(),
            type: 'BET',
            message: t('bot_log_oso_open', { leverage: BOT_CONFIG.defaultLeverage, pair: selectedPair, price: currentPrice, sentiment }),
            time: timestamp,
          },
        })
      );
    }
  }, [currentPrice, sentiment, osoState.isEnabled, osoState.activePosition, selectedPair, t]);

  // Calculate unrealized PnL
  const toroUnrealizedPnl = toroState.activePosition
    ? Number((((currentPrice - toroState.activePosition.entryPrice) / toroState.activePosition.entryPrice) *
        toroState.activePosition.leverage *
        toroState.activePosition.size).toFixed(2))
    : 0;

  const osoUnrealizedPnl = osoState.activePosition
    ? Number((((osoState.activePosition.entryPrice - currentPrice) / osoState.activePosition.entryPrice) *
        osoState.activePosition.leverage *
        osoState.activePosition.size).toFixed(2))
    : 0;

  const toggleToro = useCallback((enabled: boolean) => {
    setToroState((prev) => ({
      ...prev,
      isEnabled: enabled,
      activePosition: enabled ? prev.activePosition : null,
    }));
  }, []);

  const toggleOso = useCallback((enabled: boolean) => {
    setOsoState((prev) => ({
      ...prev,
      isEnabled: enabled,
      activePosition: enabled ? prev.activePosition : null,
    }));
  }, []);

  return {
    toroState,
    osoState,
    toggleToro,
    toggleOso,
    toroUnrealizedPnl,
    osoUnrealizedPnl,
  };
}