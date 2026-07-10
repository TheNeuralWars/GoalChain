import React from 'react';
import { useI18n } from '../i18n';

const DashboardGrid = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('DASHBOARD_GRID_TITLE')}</h1>
      <p>{t('DASHBOARD_GRID_DESC')}</p>
    </div>
  );
};

export default DashboardGrid;