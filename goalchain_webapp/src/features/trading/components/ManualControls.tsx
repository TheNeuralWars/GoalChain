/** ManualControls - Pair select, position (Long/Short), leverage, execute */

import React from 'react';
import { useTranslation } from '../../../i18n';
import type { TradingPair } from '../types';
import { DEFAULT_PAIRS, LEVERAGE_OPTIONS } from '../constants';

interface ManualControlsProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
  position: 'Long' | 'Short';
  onPositionChange: (position: 'Long' | 'Short') => void;
  leverage: number;
  onLeverageChange: (leverage: number) => void;
  onExecute: () => void;
}

export function ManualControls({
  selectedPair,
  onPairChange,
  position,
  onPositionChange,
  leverage,
  onLeverageChange,
  onExecute,
}: ManualControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      {/* Pair Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {t('trading_pair_label')}
        </label>
        <select
          value={selectedPair}
          onChange={(e) => onPairChange(e.target.value)}
          className="form-select"
        >
          {DEFAULT_PAIRS.map((pair: TradingPair) => (
            <option key={pair.value} value={pair.value}>
              {pair.label}
            </option>
          ))}
        </select>
      </div>

      {/* Position Direction */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {t('trading_position_label')}
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onPositionChange('Long')}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-all ${position === 'Long' ? 'btn-neon-green' : 'btn-outline-green'}`}
          >
            {t('trading_position_long')}
          </button>
          <button
            onClick={() => onPositionChange('Short')}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-all ${position === 'Short' ? 'btn-neon-red' : 'btn-outline-red'}`}
          >
            {t('trading_position_short')}
          </button>
        </div>
      </div>

      {/* Leverage */}
      <div>
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
          <span className="uppercase tracking-wider">{t('trading_leverage_label')}</span>
          <span style={{ color: 'var(--secondary-neon)' }}>{leverage}x</span>
        </div>
        <input
          type="range"
          min={LEVERAGE_OPTIONS.min}
          max={LEVERAGE_OPTIONS.max}
          step={LEVERAGE_OPTIONS.step}
          value={leverage}
          onChange={(e) => onLeverageChange(parseInt(e.target.value))}
          className="premium-slider"
        />
      </div>

      {/* Execute Button */}
      <button
        onClick={onExecute}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-base transition-all ${position === 'Long' ? 'btn-neon-green' : 'btn-neon-red'}`}
        style={{ marginTop: 'auto' }}
      >
        {t('trading_execute_btn', { position: t(position.toLowerCase() === 'long' ? 'trading_position_long' : 'trading_position_short') })}
      </button>
    </div>
  );
}