/** Hook for event-driven market sentiment (listens to goalchain-event) */

import { useState, useEffect, useCallback } from 'react';
import { SENTIMENT_CONFIG } from '../constants';

export function useSentiment() {
  const [sentiment, setSentiment] = useState<number>(SENTIMENT_CONFIG.default);

  const handleEvent = useCallback((e: CustomEvent) => {
    const eventData = e.detail;
    if (!eventData || !eventData.message) return;

    // Loop prevention: ignore events from Vibe-Bots themselves
    const message = eventData.message;
    if (
      message.includes('🤖') ||
      message.includes('Vibe-Bot') ||
      message.includes('Vibe')
    ) {
      return;
    }

    // Adjust sentiment based on event type and content
    setSentiment((prev) => {
      let change = 0;
      const messageLower = message.toLowerCase();

      if (eventData.type === 'GOAL') {
        change = 18;
        if (
          messageLower.includes('tarjeta roja') ||
          messageLower.includes('expulsado') ||
          messageLower.includes('penal') ||
          messageLower.includes('lesion')
        ) {
          change = -22;
        }
      } else if (eventData.type === 'BET') {
        change = 6;
        if (messageLower.includes('alto') || messageLower.includes('stake alto')) {
          change = 12;
        }
      } else if (eventData.type === 'RESOLVE') {
        if (messageLower.includes('+') || messageLower.includes('gana')) {
          change = 10;
        } else if (messageLower.includes('-') || messageLower.includes('pierde')) {
          change = -12;
        } else {
          change = -4;
        }
      }

      // Random noise factor +/- 3
      const noise = Math.floor(Math.random() * (SENTIMENT_CONFIG.noiseRange * 2 + 1)) - SENTIMENT_CONFIG.noiseRange;
      const newSentiment = Math.max(
        SENTIMENT_CONFIG.min,
        Math.min(SENTIMENT_CONFIG.max, prev + change + noise)
      );
      return newSentiment;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('goalchain-event', handleEvent as EventListener);
    return () => window.removeEventListener('goalchain-event', handleEvent as EventListener);
  }, [handleEvent]);

  return { sentiment, setSentiment };
}