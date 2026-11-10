import React from 'react';

export interface VaultStrategy {
  id: 'sentinel' | 'arbitrageur' | 'orchestrator';
  name: string;
  description: string;
  apy: number;
  color: string;
  colorRgb: string; // "r, g, b" format for rgba()
  risk: 'low' | 'medium' | 'high';
  riskLabel: string;
}

export const VAULT_STRATEGIES: VaultStrategy[] = [
  {
    id: 'sentinel',
    name: 'Sentinel Telemetry Profile',
    description: 'Defensive matchday telemetry simulation on Solana Devnet with low variance and steady rating cadence.',
    apy: 7.5,
    color: '#14f195',
    colorRgb: '20, 241, 149',
    risk: 'low',
    riskLabel: 'Low Variance',
  },
  {
    id: 'arbitrageur',
    name: 'Tactical Sync Profile',
    description: 'Balanced cross-pool fixture simulation on Solana Devnet with moderate rating variance.',
    apy: 9.5,
    color: '#9945ff',
    colorRgb: '153, 69, 255',
    risk: 'medium',
    riskLabel: 'Medium Variance',
  },
  {
    id: 'orchestrator',
    name: 'Orchestrator Profile',
    description: 'High-tempo tactical simulation driven by sports oracle telemetry on Solana Devnet.',
    apy: 14.5,
    color: '#ff4b4b',
    colorRgb: '255, 75, 75',
    risk: 'high',
    riskLabel: 'High Variance',
  },
];

interface VaultStrategyCardProps {
  strategy: VaultStrategy;
  isSelected: boolean;
  onSelect: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const VaultStrategyCard: React.FC<VaultStrategyCardProps> = ({
  strategy,
  isSelected,
  onSelect,
  onKeyDown,
}) => {
  const cardStyle = {
    ['--card-color']: strategy.color,
    ['--card-color-rgb']: strategy.colorRgb,
  } as any;

  return (
    <button
      type="button"
      className={`vault-strategy-card ${isSelected ? 'selected' : ''}`}
      style={cardStyle}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${strategy.name}, ${strategy.apy}% Sim Index, ${strategy.riskLabel}`}
    >
      <div className="vault-strategy-name">
        <span>{strategy.name}</span>
        <span className="vault-strategy-apy">{strategy.apy}% Sim Index</span>
      </div>
      <div className="vault-strategy-desc">{strategy.description}</div>
      <span className={`vault-strategy-risk ${strategy.risk}`}>
        {strategy.riskLabel}
      </span>
    </button>
  );
};

export default VaultStrategyCard;