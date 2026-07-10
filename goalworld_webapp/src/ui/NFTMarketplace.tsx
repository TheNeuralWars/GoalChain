import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n.js';
import { TRANSLATIONS } from '../../docs/assets/js/i18n.js';

const NFTMarketplace = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLanguage => prevLanguage === 'es' ? 'en' : 'es');
  };
  return (
    <div>
      <h1>{TRANSLATIONS.NFTMarketplace.title}</h1>
      <button>{TRANSLATIONS.NFTMarketplace.buyWithCash}</button>
      <button>{TRANSLATIONS.NFTMarketplace.buyWithSol}</button>
      <p>{TRANSLATIONS.NFTMarketplace.processing}</p>
      <p>{TRANSLATIONS.NFTMarketplace.noCards}</p>
      <p>{TRANSLATIONS.NFTMarketplace.success}</p>
      <p>{TRANSLATIONS.NFTMarketplace.failure}</p>
    </div>
  );
};

export default NFTMarketplace;