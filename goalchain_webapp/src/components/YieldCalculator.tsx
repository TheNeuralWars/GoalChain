import React, { useMemo, useState, useEffect, useCallback } from 'react';

interface YieldCalculatorProps {
  selectedStrategy: 'sentinel' | 'arbitrageur' | 'orchestrator';
  strategies: Array<{
    id: 'sentinel' | 'arbitrageur' | 'orchestrator';
    name: string;
    apy: number;
  }>;
  vaultBuybackCoverage: number;
  gchPrice?: number;
  solPrice?: number;
  onStakeAmountChange?: (amount: number) => void;
  onStakeTokenChange?: (token: 'GCH' | 'SOL') => void;
  className?: string;
}

interface YieldResult {
  dailyYield: number;
  weeklyYield: number;
  monthlyYield: number;
  yearlyYield: number;
  dailyBurnContribution: number;
  stakeValueUsd: number;
}

export const YieldCalculator: React.FC<YieldCalculatorProps> = ({
  selectedStrategy,
  strategies,
  vaultBuybackCoverage = 0.25,
  gchPrice = 0.001,
  solPrice = 150,
  onStakeAmountChange,
  onStakeTokenChange,
  className = '',
}) => {
  const [stakeInput, setStakeInput] = useState<string>('1000');
  const [stakeToken, setStakeToken] = useState<'GCH' | 'SOL'>('GCH');
  const [displayValues, setDisplayValues] = useState<YieldResult | null>(null);

  const strategy = strategies.find(s => s.id === selectedStrategy) || strategies[0];
  const stakeAmount = parseFloat(stakeInput) || 0;

  // Animate values on change
  useEffect(() => {
    const dailyRate = strategy.apy / 100 / 365;
    const dailyYield = stakeAmount * dailyRate;
    const weeklyYield = dailyYield * 7;
    const monthlyYield = dailyYield * 30;
    const yearlyYield = stakeAmount * (strategy.apy / 100);
    const dailyBurnContribution = dailyYield * vaultBuybackCoverage;
    const stakeValueUsd = stakeToken === 'GCH' ? stakeAmount * gchPrice : stakeAmount * solPrice;

    // Animate with requestAnimationFrame for smooth transitions
    let startValues: YieldResult | null = displayValues;
    const targetValues: YieldResult = {
      dailyYield,
      weeklyYield,
      monthlyYield,
      yearlyYield,
      dailyBurnContribution,
      stakeValueUsd,
    };

    if (!startValues) {
      setDisplayValues(targetValues);
      return;
    }

    const duration = 600; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValues({
        dailyYield: startValues.dailyYield + (targetValues.dailyYield - startValues.dailyYield) * eased,
        weeklyYield: startValues.weeklyYield + (targetValues.weeklyYield - startValues.weeklyYield) * eased,
        monthlyYield: startValues.monthlyYield + (targetValues.monthlyYield - startValues.monthlyYield) * eased,
        yearlyYield: startValues.yearlyYield + (targetValues.yearlyYield - startValues.yearlyYield) * eased,
        dailyBurnContribution: startValues.dailyBurnContribution + (targetValues.dailyBurnContribution - startValues.dailyBurnContribution) * eased,
        stakeValueUsd: startValues.stakeValueUsd + (targetValues.stakeValueUsd - startValues.stakeValueUsd) * eased,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [stakeAmount, stakeToken, strategy, vaultBuybackCoverage, gchPrice, solPrice, displayValues]);

  const handleStakeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty, decimals, and numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setStakeInput(value);
      if (value !== '') {
        onStakeAmountChange?.(parseFloat(value));
      }
    }
  }, [onStakeAmountChange]);

  const handlePresetClick = useCallback((amount: number) => {
    setStakeInput(amount.toString());
    onStakeAmountChange?.(amount);
  }, [onStakeAmountChange]);

  const handleTokenChange = useCallback((token: 'GCH' | 'SOL') => {
    setStakeToken(token);
    onStakeTokenChange?.(token);
  }, [onStakeTokenChange]);

  const formatNumber = (val: number, decimals = 4): string => {
    if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
    if (val >= 1e3) return (val / 1e3).toFixed(2) + 'K';
    return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatUsd = (val: number): string => {
    if (val >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
    if (val >= 1e3) return '$' + (val / 1e3).toFixed(2) + 'K';
    return '$' + val.toFixed(val < 0.01 ? 4 : 2);
  };

  const values = displayValues || {
    dailyYield: 0,
    weeklyYield: 0,
    monthlyYield: 0,
    yearlyYield: 0,
    dailyBurnContribution: 0,
    stakeValueUsd: 0,
  };

  return (
    <div className={`yield-calculator-premium glass-card-premium ${className}`}>
      <h2 style={{ 
        margin: '0 0 1.5rem', 
        fontSize: '1.25rem', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem' 
      }}>
        <span role="img" aria-label="calculator">🧮</span> Interactive Yield Calculator
      </h2>

      {/* Strategy Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          color: '#64748b', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px', 
          display: 'block', 
          marginBottom: '0.75rem' 
        }}>
          Active Vault Strategy
        </label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {strategies.map(s => (
            <button
              key={s.id}
              onClick={() => {}}
              disabled
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '0.875rem 1rem',
                background: selectedStrategy === s.id 
                  ? `rgba(${s.id === 'sentinel' ? '20, 241, 149' : s.id === 'arbitrageur' ? '153, 69, 255' : '255, 75, 75'}, 0.15)` 
                  : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${selectedStrategy === s.id 
                  ? (s.id === 'sentinel' ? 'rgba(20, 241, 149, 0.4)' 
                     : s.id === 'arbitrageur' ? 'rgba(153, 69, 255, 0.4)' 
                     : 'rgba(255, 75, 75, 0.4)')
                  : 'rgba(255, 255, 255, 0.05)'}`,
                borderRadius: '12px',
                color: '#fff',
                cursor: 'default',
                textAlign: 'left',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: selectedStrategy === s.id ? 1 : 0.5,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <span style={{ 
                  fontWeight: 800, 
                  fontSize: '0.85rem', 
                  color: selectedStrategy === s.id 
                    ? (s.id === 'sentinel' ? '#14f195' : s.id === 'arbitrageur' ? '#9945ff' : '#ff4b4b') 
                    : '#94a3b8' 
                }}>
                  {s.name}
                </span>
                <span style={{ 
                  fontWeight: 900, 
                  fontSize: '0.8rem', 
                  color: selectedStrategy === s.id 
                    ? (s.id === 'sentinel' ? '#14f195' : s.id === 'arbitrageur' ? '#9945ff' : '#ff4b4b') 
                    : '#64748b',
                  background: selectedStrategy === s.id 
                    ? `rgba(${s.id === 'sentinel' ? '20, 241, 149' : s.id === 'arbitrageur' ? '153, 69, 255' : '255, 75, 75'}, 0.2)`
                    : 'rgba(255, 255, 255, 0.05)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}>
                  {s.apy}% APY
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Controls */}
      <div className="yield-input-group">
        <div>
          <label className="yield-input-label">Stake Amount ({stakeToken})</label>
          <div className="yield-input-wrapper">
            <input
              type="number"
              value={stakeInput}
              onChange={handleStakeInputChange}
              className="yield-input-premium"
              style={{ flex: 1, fontSize: '1.1rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
              min="0"
              step="10"
              placeholder="0"
              aria-label={`Stake amount in ${stakeToken}`}
            />
            <div className="token-switcher" role="group" aria-label="Select stake token">
              <button
                type="button"
                className={`token-btn gch ${stakeToken !== 'GCH' ? 'inactive' : ''}`}
                onClick={() => handleTokenChange('GCH')}
                aria-pressed={stakeToken === 'GCH'}
              >
                $GCH
              </button>
              <button
                type="button"
                className={`token-btn sol ${stakeToken !== 'SOL' ? 'inactive' : ''}`}
                onClick={() => handleTokenChange('SOL')}
                aria-pressed={stakeToken === 'SOL'}
              >
                SOL
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="yield-input-label">Quick Presets</label>
          <div className="preset-chips" role="group" aria-label="Preset stake amounts">
            {[100, 500, 1000, 5000, 10000, 50000].map(amt => (
              <button
                key={amt}
                type="button"
                className="preset-chip"
                onClick={() => handlePresetClick(amt)}
                aria-label={`Stake ${amt >= 1000 ? amt / 1000 + 'K' : amt} ${stakeToken}`}
              >
                {amt >= 1000 ? (amt / 1000) + 'K' : amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ 
        background: 'rgba(5, 5, 10, 0.4)', 
        border: '1px solid rgba(255, 255, 255, 0.03)', 
        borderRadius: '16px', 
        padding: '1.5rem' 
      }}>
        <div className="results-grid" role="list" aria-label="Yield projections">
          <div className="yield-result-card daily" role="listitem">
            <div className="yield-result-label">Daily Yield</div>
            <div className="yield-result-value daily">{formatNumber(values.dailyYield)} $GCH</div>
            <div className="yield-result-usd">≈ {formatUsd(values.dailyYield * gchPrice)} USD</div>
          </div>
          <div className="yield-result-card weekly" role="listitem">
            <div className="yield-result-label">Weekly Yield</div>
            <div className="yield-result-value weekly">{formatNumber(values.weeklyYield)} $GCH</div>
            <div className="yield-result-usd">≈ {formatUsd(values.weeklyYield * gchPrice)} USD</div>
          </div>
          <div className="yield-result-card monthly" role="listitem">
            <div className="yield-result-label">Monthly Yield</div>
            <div className="yield-result-value monthly">{formatNumber(values.monthlyYield)} $GCH</div>
            <div className="yield-result-usd">≈ {formatUsd(values.monthlyYield * gchPrice)} USD</div>
          </div>
          <div className="yield-result-card yearly" role="listitem">
            <div className="yield-result-label">Yearly Yield</div>
            <div className="yield-result-value yearly">{formatNumber(values.yearlyYield, 2)} $GCH</div>
            <div className="yield-result-usd">≈ {formatUsd(values.yearlyYield * gchPrice)} USD</div>
          </div>
        </div>

        {/* Burn Contribution */}
        <div className="burn-contribution-section">
          <div className="burn-contribution-info">
            <div className="burn-contribution-label">
              Your Stake's Daily Burn Contribution (Infinity Burn)
            </div>
            <div className="burn-contribution-value">
              {formatNumber(values.dailyBurnContribution, 6)} $GCH
            </div>
            <div className="burn-contribution-basis">
              Based on {(vaultBuybackCoverage * 100).toFixed(0)}% vault buyback coverage
            </div>
          </div>
          <div className="stake-value-display">
            <div className="stake-value-label">Stake Value</div>
            <div className="stake-value-amount">{formatUsd(values.stakeValueUsd)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldCalculator;