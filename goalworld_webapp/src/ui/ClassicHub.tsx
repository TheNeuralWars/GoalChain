import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n.js';
import { TRANSLATIONS } from '../../docs/assets/js/i18n.js';

const ClassicHub = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLanguage => prevLanguage === 'es' ? 'en' : 'es');
  };
  return (
    <div>
      <h1>{TRANSLATIONS.ClassicHub.title}</h1>
      <p>{TRANSLATIONS.ClassicHub.description}</p>
    </div>
  );
};

export default ClassicHub;