import React from 'react';
import { useTranslation } from '../i18n';
import type { Language } from '../i18n/translations';

const LOCALES: Array<{ code: Language; label: string; title: string }> = [
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'es', label: 'ES', title: 'Español' },
  { code: 'it', label: 'IT', title: 'Italiano' },
];

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div
      role="group"
      aria-label="Language selector"
      data-lang-switcher="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        padding: '2px',
        background: 'rgba(19, 22, 29, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '999px',
        fontFamily: 'var(--gw-font-mono, "JetBrains Mono", monospace)',
      }}
    >
      {LOCALES.map(({ code, label, title }) => {
        const active = language === code;
        return (
          <button
            key={code}
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={active}
            data-lang-choice={code}
            onClick={() => setLanguage(code)}
            style={{
              background: active ? '#e5a93c' : 'transparent',
              color: active ? '#0a0b0e' : '#9ca0ab',
              border: 'none',
              borderRadius: '999px',
              padding: '4px 9px',
              fontSize: '0.72rem',
              fontWeight: active ? 700 : 500,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'background 0.16s ease, color 0.16s ease',
              lineHeight: 1.2,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
