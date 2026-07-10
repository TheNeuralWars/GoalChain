import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../../docs/assets/js/i18n.js';

const App = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <div>
      <button onClick={toggleLanguage}>{language === 'en' ? 'ES' : 'EN'}</button>
      {/* Rest of the App component */}
    </div>
  );
};

export default App;