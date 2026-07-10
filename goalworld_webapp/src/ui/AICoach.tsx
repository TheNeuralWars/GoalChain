import React from 'react';
import { useI18n } from '../i18n';

const AICoach = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('AI_COACH_TITLE')}</h1>
      <p>{t('AI_COACH_DESC')}</p>
    </div>
  );
};

export default AICoach;