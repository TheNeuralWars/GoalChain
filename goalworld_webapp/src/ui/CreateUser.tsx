import React from 'react';
import { useI18n } from '../i18n';

const CreateUser = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('CREATE_USER_TITLE')}</h1>
      <p>{t('CREATE_USER_DESC')}</p>
    </div>
  );
};

export default CreateUser;