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
      className="lang-switch"
      role="group"
      aria-label="Language selector"
      data-lang-switcher="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        padding: '3px',
        background: 'var(--gw-bg-elev, #12141c)',
        border: '1px solid var(--gw-border, rgba(255, 255, 255, 0.08))',
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
            className={`lang-pill${active ? ' active' : ''}`}
            title={title}
            aria-label={title}
            aria-pressed={active}
            data-lang-choice={code}
            onClick={() => setLanguage(code)}
            style={{
              background: active ? 'rgba(229, 169, 60, 0.18)' : 'transparent',
              color: active ? '#e5a93c' : '#9ca0ab',
              border: active ? '1px solid rgba(229, 169, 60, 0.4)' : '1px solid transparent',
              borderRadius: '999px',
              padding: '4px 10px',
              minWidth: '44px',
              minHeight: '44px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
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
