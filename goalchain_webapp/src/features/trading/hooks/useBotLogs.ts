/** Hook for bot log management */

import { useState, useCallback } from 'react';
import type { BotLog } from '../types';
import { BOT_LOGS_CONFIG } from '../constants';

interface UseBotLogsReturn {
  botLogs: BotLog[];
  addLog: (log: BotLog) => void;
  clearLogs: () => void;
}

export function useBotLogs(): UseBotLogsReturn {
  const [botLogs, setBotLogs] = useState<BotLog[]>([]);

  const addLog = useCallback((log: BotLog) => {
    setBotLogs((prev) => [log, ...prev].slice(0, BOT_LOGS_CONFIG.maxLogs));
  }, []);

  const clearLogs = useCallback(() => {
    setBotLogs([]);
  }, []);

  return {
    botLogs,
    addLog,
    clearLogs,
  };
}