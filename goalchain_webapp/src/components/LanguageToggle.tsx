import React from 'react';
import { useTranslation } from '../i18n';

/**
 * Language switcher — EN / ES.
 *
 * Wired to the shared LanguageProvider, so it switches the whole UI live
 * (no reload needed) and stays in sync with every other toggle instance.
 */
export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <div
      className="language-toggle"
      role="group"
      aria-label="Language"
      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: 800,
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.15)',
          background: language === 'en' ? 'var(--primary-neon)' : 'rgba(255,255,255,0.03)',
          color: language === 'en' ? '#000' : '#fff',
          transition: 'all 0.2s ease',
        }}
        aria-pressed={language === 'en'}
        aria-label="English"
        title="English"
        lang="en"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('es')}
        className={`lang-btn ${language === 'es' ? 'active' : ''}`}
        style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: 800,
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.15)',
          background: language === 'es' ? 'var(--primary-neon)' : 'rgba(255,255,255,0.03)',
          color: language === 'es' ? '#000' : '#fff',
          transition: 'all 0.2s ease',
        }}
        aria-pressed={language === 'es'}
        aria-label="Español"
        title="Español"
        lang="es"
      >
        ES
      </button>
    </div>
  );
}
