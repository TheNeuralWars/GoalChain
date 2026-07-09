import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';
const translations = { en, es };
const LanguageContext = createContext(undefined);
export function LanguageProvider({ children, initialLanguage = 'en' }) {
    const [language, setLanguageState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('gc_lang') || initialLanguage;
        }
        return initialLanguage;
    });
    const setLanguage = (lang) => {
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
    const t = (key) => {
        return dict[key] ?? key;
    };
    const tHtml = (key) => {
        return dict[key] ?? key;
    };
    const value = useMemo(() => ({ language, setLanguage, t, tHtml }), [language, dict]);
    return (<LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>);
}
export function useTranslation() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}
