import React from 'react';
import { useTranslation } from '../../i18n';

type Network = 'devnet' | 'mainnet-beta' | 'localnet' | 'testnet';

interface SimulationBadgeProps {
  /** Custom label override */
  label?: string;
  /** Network to detect from context (falls back to VITE_SOLANA_NETWORK) */
  network?: Network;
  /** If true, shows devnet/mainnet indicator instead of simulation label */
  showNetwork?: boolean;
  /** Compact variant for tight spaces */
  compact?: boolean;
}

/**
 * Marks UI that does not execute on-chain txs (Mundial MVP honesty).
 * In devnet/testnet: shows "SIMULACIÓN" / "SIMULATION"
 * In mainnet: shows "REAL" / "LIVE" with green indicator
 */
export function SimulationBadge({
  label,
  network,
  showNetwork = true,
  compact = false,
}: SimulationBadgeProps) {
  const { t, language } = useTranslation();
  const envNetwork = (import.meta.env.VITE_SOLANA_NETWORK as Network) ?? 'devnet';
  const effectiveNetwork = network ?? envNetwork;
  const isMainnet = effectiveNetwork === 'mainnet-beta';

  const simLabel = label ?? (language === 'es' ? 'SIMULACIÓN' : 'SIMULATION');
  const liveLabel = language === 'es' ? 'EN VIVO' : 'LIVE';
  const devnetLabel = language === 'es' ? 'DEVNET' : 'DEVNET';

  if (showNetwork) {
    if (isMainnet) {
      return (
        <span
          className={`simulation-badge simulation-badge--live ${compact ? 'simulation-badge--compact' : ''}`}
          title={language === 'es' ? 'Transacciones on-chain reales en mainnet' : 'Real on-chain transactions on mainnet'}
        >
          {liveLabel}
        </span>
      );
    }
    return (
      <span
        className={`simulation-badge simulation-badge--sim ${compact ? 'simulation-badge--compact' : ''}`}
        title={language === 'es' ? 'Entorno de prueba (devnet) — no ejecuta transacciones reales' : 'Test environment (devnet) — no real transactions executed'}
      >
        {compact ? devnetLabel : simLabel}
      </span>
    );
  }

  // Legacy mode: just show simulation label
  return (
    <span
      className={`simulation-badge ${compact ? 'simulation-badge--compact' : ''}`}
      title={language === 'es' ? 'Esta sección no ejecuta transacciones on-chain. Solo demostración visual.' : 'This section does not execute on-chain transactions. Visual demonstration only.'}
    >
      {simLabel}
    </span>
  );
}