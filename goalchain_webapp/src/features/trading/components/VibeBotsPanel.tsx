/** VibeBotsPanel - Toro/Oso bot cards with balance, PnL, toggle, status */

import React from 'react';
import { useTranslation } from '../../../i18n';
import type { BotState } from '../types';

interface VibeBotsPanelProps {
  toroState: BotState;
  osoState: BotState;
  toroUnrealizedPnl: number;
  osoUnrealizedPnl: number;
  onToroToggle: (enabled: boolean) => void;
  onOsoToggle: (enabled: boolean) => void;
}

export function VibeBotsPanel({
  toroState,
  osoState,
  toroUnrealizedPnl,
  osoUnrealizedPnl,
  onToroToggle,
  onOsoToggle,
}: VibeBotsPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      {/* Toro */}
      <BotSwitchCard
        name={t('trading_toro_name')}
        description={t('trading_toro_desc')}
        balance={toroState.balance}
        totalProfit={toroState.totalProfit}
        activePosition={toroState.activePosition}
        unrealizedPnl={toroUnrealizedPnl}
        isEnabled={toroState.isEnabled}
        onToggle={onToroToggle}
        isToro={true}
      />

      {/* Oso */}
      <BotSwitchCard
        name={t('trading_oso_name')}
        description={t('trading_oso_desc')}
        balance={osoState.balance}
        totalProfit={osoState.totalProfit}
        activePosition={osoState.activePosition}
        unrealizedPnl={osoUnrealizedPnl}
        isEnabled={osoState.isEnabled}
        onToggle={onOsoToggle}
        isToro={false}
      />
    </div>
  );
}

/** BotSwitchCard sub-component */
function BotSwitchCard({
  name,
  description,
  balance,
  totalProfit,
  activePosition,
  unrealizedPnl,
  isEnabled,
  onToggle,
  isToro,
}: {
  name: string;
  description: string;
  balance: number;
  totalProfit: number;
  activePosition: { type: 'Long' | 'Short'; entryPrice: number; leverage: number; size: number } | null;
  unrealizedPnl: number;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  isToro: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className={`bot-switch-container ${isEnabled ? (isToro ? 'active-toro' : 'active-oso') : ''}`}>
      <div className="switch-label">
        <span className="switch-title">{name}</span>
        <span className="switch-desc">{description}</span>
        <div className="flex gap-3 mt-2" style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>
          <div>
            {t('trading_balance')}: <span style={{ color: '#ffffff' }}>${balance.toFixed(2)}</span>
          </div>
          <div>
            {t('trading_profit')}: <span style={{ color: totalProfit >= 0 ? 'var(--primary-neon)' : 'var(--accent-red)' }}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </span>
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>
          {activePosition ? (
            <span style={{ color: isToro ? 'var(--primary-neon)' : 'var(--accent-red)', fontWeight: 700 }}>
              {isToro ? (
                <>
                  🟢 {c intensity string</>

} ) : (
                <>
  🔴 {t('trading_active_short', { price: activePosition.entryPrice.toFixed(2), pnl: `${unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toFixed(2)}` })}
                </>
              )}
            </span>
          ) : (
            <span style={{ color: '#64748b' }}>{t('trading_idle')}</span>
          )}
        </div>
      </div>
      <label className="switch">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className={`slider ${!isToro ? 'slider-red' : ''}`}></span>
      </label>
    </div>
  );
}