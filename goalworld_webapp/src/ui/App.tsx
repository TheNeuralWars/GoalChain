import React from 'react';
import { I18nProvider, useI18n } from '../i18n';

const AppInner = () => {
  const { lang, toggleLang } = useI18n();
  return (
    <div>
      <button onClick={toggleLang}>{lang === 'en' ? 'EN | ES' : 'ES | EN'}</button>
      {/* Rest of the App component */}
    </div>
  );
};

const App = () => (
  <I18nProvider>
    <AppInner />
  </I18nProvider>
);

export default App;