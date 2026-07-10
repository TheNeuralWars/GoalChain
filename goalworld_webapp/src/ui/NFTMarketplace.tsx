import React from 'react';
import { useI18n } from '../i18n';

const NFTMarketplace = () => {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('NFT_MARKETPLACE_TITLE')}</h1>
      <button>{t('BUY_WITH_CASH')}</button>
      <button>{t('BUY_WITH_SOL')}</button>
      <p>{t('PROCESSING')}</p>
      <p>{t('NO_CARDS_LISTED')}</p>
      <p>{t('SUCCESS_PURCHASE')}</p>
      <p>{t('TRANSACTION_FAILED')}</p>
    </div>
  );
};

export default NFTMarketplace;