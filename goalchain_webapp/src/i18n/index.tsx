import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { Language, TranslationKeys, Translations } from './translations';
import en from './locales/en.json';
import es from './locales/es.json';

const translations: Translations = { en, es };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
  tHtml: (key: keyof TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLanguage = 'en' }: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('gc_lang') as Language) || initialLanguage;
    }
    return initialLanguage;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const dict = translations[language];

  const t = (key: keyof TranslationKeys): string => {
    return dict[key] ?? key;
  };

  const tHtml = (key: keyof TranslationKeys): string => {
    return dict[key] ?? key;
  };

  const value = useMemo(() => ({ language, setLanguage, t, tHtml }), [language, dict]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}