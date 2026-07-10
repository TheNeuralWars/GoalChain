import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <button onClick={toggleLanguage} className="language-toggle">
      {language === 'en' ? 'EN' : 'ES'}
    </button>
  );
};

export default LanguageToggle;