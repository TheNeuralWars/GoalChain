import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import the existing i18n_reference.js strings
import { en, es } from '../../docs/assets/js/i18n.js';

// Initialize i18n
const resources = {
  en: {
    translation: en
  },
  es: {
    translation: es
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
