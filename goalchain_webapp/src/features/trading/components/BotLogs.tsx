/** BotLogs - Log list: timestamp, bot name, type, PnL, sentiment */

import React from 'react';
import { useTranslation } from '../../../i18n';
import type { BotLog } from '../types';

interface BotLogsProps {
  botLogs: BotLog[];
}

export function BotLogs({ botLogs }: BotLogsProps) {
  const { t } = useTranslation();

  return (
    <div className="glass-card flex flex-col gap-2">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {t('trading_ledger_title')}
      </div>
      <div className="vibe-ledger flex-1 overflow-y-auto">
        {botLogs.length > 0 ? (
          botLogs.map((log) => (
            <div key={log.id} className="vibe-ledger-row flex justify-between items-center gap-4 px-4 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[0.65rem] text-slate-500 whitespace-nowrap">[{log.timestamp}]</span>
                <span
                  className="font-bold whitespace-nowrap"
                  style={{ color: log.botName.includes('Toro') ? 'var(--primary-neon)' : 'var(--accent-red)' }}
                >
                  {log.botName.includes('Toro') ? t('trading_ledger_toro') : t('trading_ledger_oso')}
                </span>
                <span
                  className={`ledger-badge px-2 py-0.5 rounded text-xs font-semibold ${
                    log.type === 'LONG'
                      ? 'badge-long'
                      : log.type === 'SHORT'
                        ? 'badge-short'
                        : 'badge-close'
                  }`}
                >
                  {log.type}
                </span>
              </div>
              <div className="flex items-center gap-3 text-right whitespace-nowrap">
                <span style={{ color: '#94a3b8' }}>
                  {log.pair.split(' ')[0]} @ ${log.price.toFixed(2)}
                </span>
                {log.pnl !== undefined && (
                  <span
                    className="font-extrabold"
                    style={{ color: log.pnl >= 0 ? 'var(--primary-neon)' : 'var(--accent-red)' }}
                  >
                    {log.pnl >= 0 ? '+' : ''}${log.pnl}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-600 text-sm italic">
            {t('trading_ledger_empty')}
          </div>
        )}
      </div>
    </div>
  );
}