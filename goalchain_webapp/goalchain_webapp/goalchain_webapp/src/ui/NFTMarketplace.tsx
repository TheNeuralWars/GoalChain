import React from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n';

const NFTMarketplace = ({ language }) => {
  return (
    <div className="nft-marketplace">
      <h1>{TRANSLATIONS[language].marketplaceTitle}</h1>
      <button>{TRANSLATIONS[language].buyWithCash}</button>
      <button>{TRANSLATIONS[language].buyWithSol}</button>
      <div>{TRANSLATIONS[language].processing}</div>
      <div>{TRANSLATIONS[language].noCardsListed}</div>
      <div>{TRANSLATIONS[language].successMessage}</div>
      <div>{TRANSLATIONS[language].transactionFailed}</div>
    </div>
  );
};

export default NFTMarketplace;