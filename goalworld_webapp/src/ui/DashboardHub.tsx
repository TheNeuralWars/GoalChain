import React from 'react';
import { useI18n } from '../i18n';

const DashboardHub = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('DASHBOARD_HUB_TITLE')}</h1>
      <p>{t('DASHBOARD_HUB_DESC')}</p>
    </div>
  );
};

export default DashboardHub;