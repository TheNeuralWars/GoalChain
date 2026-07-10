import React from 'react';
import { useI18n } from '../i18n';

const AICommentator = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('AI_COMMENTATOR_TITLE')}</h1>
      <p>{t('AI_COMMENTATOR_DESC')}</p>
    </div>
  );
};

export default AICommentator;