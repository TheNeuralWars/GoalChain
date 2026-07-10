import React from 'react';
import { useI18n } from '../i18n';

const ClubPortal = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('CLUB_PORTAL_TITLE')}</h1>
      <p>{t('CLUB_PORTAL_DESC')}</p>
    </div>
  );
};

export default ClubPortal;