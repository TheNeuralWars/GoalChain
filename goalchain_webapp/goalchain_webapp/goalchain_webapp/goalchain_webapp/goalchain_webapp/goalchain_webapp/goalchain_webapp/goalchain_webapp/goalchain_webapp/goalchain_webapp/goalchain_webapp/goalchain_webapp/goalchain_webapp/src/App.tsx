import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as solanaWeb3 from '@solana/web3.js';

// Language toggle component
const LanguageToggle = ({ language, onLanguageChange }) => {
  return (
    <div className="language-toggle">
      <button
        className={language === 'en' ? 'active' : ''}
        onClick={() => onLanguageChange('en')}
      >
        EN
      </button>
      <button
        className={language === 'es' ? 'active' : ''}
        onClick={() => onLanguageChange('es')}
      >
        ES
      </button>
    </div>
  );
};

// Main App component
const App = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  // Set the default language to English
  useEffect(() => {
    if (!localStorage.getItem('language')) {
      localStorage.setItem('language', 'en');
    }
  }, []);

  return (
    <div className="app">
      <LanguageToggle language={language} onLanguageChange={handleLanguageChange} />
      {/* Rest of the app content */}
    </div>
  );
};

export default App;

export default App;