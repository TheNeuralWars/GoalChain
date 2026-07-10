import React from 'react';
import { useI18n } from '../i18n';

const EstadioPortal = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('ESTADIO_PORTAL_TITLE')}</h1>
      <p>{t('ESTADIO_PORTAL_DESC')}</p>
    </div>
  );
};

export default EstadioPortal;