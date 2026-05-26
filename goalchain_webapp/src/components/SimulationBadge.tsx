import React from 'react';

/** Marks UI that does not execute on-chain txs (Mundial MVP honesty). */
export function SimulationBadge({ label = 'SIMULACIÓN' }: { label?: string }) {
  return (
    <span
      className="simulation-badge"
      title="Esta sección no ejecuta transacciones on-chain. Solo demostración visual."
    >
      {label}
    </span>
  );
}
