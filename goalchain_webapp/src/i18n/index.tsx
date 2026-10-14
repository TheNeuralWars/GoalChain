import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { Language, TranslationKeys } from './translations';
// Type-only JSON imports (erased at build): compile-time locale drift guard below.
import type enShape from './locales/en.json';
import type esShape from './locales/es.json';

// Compile-time drift guard (same strength as the old static `{ en, es }` typing):
// each locale JSON must stay assignable to TranslationKeys. Cross-direction
// drift is caught by `npm run check:i18n`.
type AssertLocale<T extends TranslationKeys> = T;
type _En = AssertLocale<typeof enShape>;
type _Es = AssertLocale<typeof esShape>;

// Locale dictionaries are code-split: each language ships as its own chunk and
// only the active one is downloaded (auto-improve 2026-10-14). The old static
// imports put both en+es JSON in the main bundle for every visitor.
const loaders: Record<Language, () => Promise<TranslationKeys>> = {
  en: () => import('./locales/en.json').then((m) => m.default),
  es: () => import('./locales/es.json').then((m) => m.default),
};

const dictCache = new Map<Language, TranslationKeys>();
const inflight = new Map<Language, Promise<TranslationKeys>>();

function loadDictionary(lang: Language): Promise<TranslationKeys> {
  const cached = dictCache.get(lang);
  if (cached) return Promise.resolve(cached);
  const pending = inflight.get(lang);
  if (pending) return pending;
  const promise = loaders[lang]().then((dict) => {
    dictCache.set(lang, dict);
    inflight.delete(lang);
    return dict;
  });
  inflight.set(lang, promise);
  return promise;
}

function normalizeLanguage(value: string | null | undefined): Language | undefined {
  return value === 'en' || value === 'es' ? value : undefined;
}

function getInitialLanguage(): Language {
  if (typeof window !== 'undefined') {
    return normalizeLanguage(localStorage.getItem('gc_lang')) ?? 'en';
  }
  return 'en';
}

// Kick off the active locale's chunk fetch as early as this module evaluates so
// it overlaps app mount and the lazy route chunks instead of following them.
void loadDictionary(getInitialLanguage());

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
  tHtml: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLanguage = 'en' }: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return normalizeLanguage(localStorage.getItem('gc_lang')) || initialLanguage;
    }
    return initialLanguage;
  });

  // undefined only while the first locale chunk is in flight; a language switch
  // keeps the current dictionary rendered until the new one arrives (no blank).
  const [dict, setDict] = useState<TranslationKeys | undefined>(() => dictCache.get(language));

  useEffect(() => {
    let active = true;
    loadDictionary(language)
      .then((loaded) => {
        if (active) setDict(loaded);
      })
      .catch((err) => {
        console.error('[i18n] failed to load locale chunk:', err);
      });
    return () => {
      active = false;
    };
  }, [language]);

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

  const t = (key: string, options?: Record<string, string | number>): string => {
    let text = (dict as Record<string, string> | undefined)?.[key] ?? key;
    if (options) {
      for (const [k, v] of Object.entries(options)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  };

  const tHtml = (key: string): string => {
    return (dict as Record<string, string> | undefined)?.[key] ?? key;
  };

  const value = useMemo(() => ({ language, setLanguage, t, tHtml }), [language, dict]);

  // First paint waits for the active locale chunk (already in flight since module
  // eval) instead of rendering raw dictionary keys.
  if (!dict) return null;

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
