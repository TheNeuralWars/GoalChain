/** TerminalTabs - Reusable tab navigation */

import React from 'react';
import { useTranslation } from '../../../i18n';

interface TerminalTabsProps {
  activeTab: 'manual' | 'vibe';
  onTabChange: (tab: 'manual' | 'vibe') => void;
}

export function TerminalTabs({ activeTab, onTabChange }: TerminalTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="terminal-tabs" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
      <button
        onClick={() => onTabChange('manual')}
        className={`terminal-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
      >
        {t('trading_tab_manual')}
      </button>
      <button
        onClick={() => onTabChange('vibe')}
        className={`terminal-tab-btn ${activeTab === 'vibe' ? 'active' : ''}`}
      >
        {t('trading_tab_vibe')}
      </button>
    </div>
  );
}