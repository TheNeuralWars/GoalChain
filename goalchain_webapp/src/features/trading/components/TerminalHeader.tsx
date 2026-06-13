/** TerminalHeader - Title and SimulationBadge */

import React from 'react';
import { SimulationBadge } from '../../../components/SimulationBadge';
import { TerminalTabs } from './TerminalTabs';
import { useTranslation } from '../../../i18n';

interface TerminalHeaderProps {
  activeTab: 'manual' | 'vibe';
  onTabChange: (tab: 'manual' | 'vibe') => void;
}

export function TerminalHeader({ activeTab, onTabChange }: TerminalHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="text-neon-purple flex items-center gap-2 border-none pb-0 mb-0" style={{ margin: 0 }}>
        <span role="img" aria-label="chart">📈</span>
        {t('trading_terminal_title')}
        <SimulationBadge />
      </h2>

      <TerminalTabs activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}