import React from 'react';
import { useI18n } from '../i18n';

const SwarmVaults = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('SWARM_VAULTS_TITLE')}</h1>
      <p>{t('SWARM_VAULTS_DESC')}</p>
    </div>
  );
};

export default SwarmVaults;