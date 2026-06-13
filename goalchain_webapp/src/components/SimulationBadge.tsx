import React from 'react';
import { useTranslation } from '../i18n';

/** Marks UI that does not execute on-chain txs (Mundial MVP honesty). */
export function SimulationBadge({ label }: { label?: string }) {
  const { t } = useTranslation();
  const badgeLabel = label ?? t('simulation_badge_label');
  return (
    <span
      className="simulation-badge"
      title={t('simulation_badge_tooltip')}
    >
      {badgeLabel}
    </span>
  );
}
