import React from 'react';
import { useI18n } from '../i18n';

const ClassicHub = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('CLASSIC_HUB_TITLE')}</h1>
      <p>{t('CLASSIC_HUB_DESC')}</p>
    </div>
  );
};

export default ClassicHub;